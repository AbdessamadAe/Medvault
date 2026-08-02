# Architecture

```
┌─────────────────────────────┐
│   iPhone / browser (PWA)    │
│   Next.js App Router UI     │
└──────────────┬───────────────┘
               │ Server Actions + Route Handlers (same origin, no public REST API)
┌──────────────▼───────────────┐
│  Next.js app on Vercel        │
│  - Server Components (reads)  │
│  - Server Actions (writes)     │
│  - /api/export route handler   │
└──────┬────────────────┬───────┘
       │                │
┌──────▼──────┐   ┌─────▼──────────────┐
│  Supabase    │   │  Supabase Storage   │
│  Postgres    │   │  (private bucket)   │
│  + Auth      │   │  medical-files/     │
│  + RLS       │   │  <user id>/<uuid>   │
└──────┬───────┘   └─────────┬──────────┘
       │                     │
       └─────────┬───────────┘
                 │ weekly (GitHub Actions cron)
         ┌───────▼────────┐
         │  Backblaze B2   │
         │  (pg_dump +      │
         │   files zip)     │
         └─────────────────┘
```

## Why no separate backend API

There is exactly one client (this Next.js app) and one user. Next.js
Server Actions and Server Components talk to Postgres directly via
Drizzle — there is no separate Express/Fastify/etc. service, no message
queue, and no REST API for a future client to call yet. If the deferred
native iOS app is ever built, that's the point at which a real API layer
(likely a set of Route Handlers under `/api/`) would get added — building
it now would be speculative and against the "avoid unnecessary
infrastructure" principle in docs/SPEC.md.

## Request flow for a typical write

1. User submits a form (e.g. "New consultation") in a Client Component.
2. `useActionState` calls the bound Server Action
   (`src/lib/actions/consultations.ts`).
3. The action calls `requireUserId()` (validates the Supabase session via
   cookies), validates the form data with the entity's zod schema, then
   writes through Drizzle — scoped by `owner_id` in the query itself *and*
   enforced again by the database's Row Level Security policy.
4. `revalidatePath()` invalidates the relevant Server Component route so
   the next render reflects the change.

## Request flow for a file

1. Upload: `AttachmentUploader` posts to an upload Server Action
   (`src/lib/actions/attachments.ts`), which validates the file (type,
   size) with zod, uploads to Supabase Storage under
   `<user id>/<random uuid>` (never the original filename), then inserts
   an `attachments` row recording the storage key and original filename
   as metadata.
2. Download/view: `AttachmentList` calls `getAttachmentDownloadUrl`,
   which looks up the attachment (owner-scoped), then asks Supabase
   Storage for a 60-second signed URL — the file is never reachable via a
   permanent or public link.
3. Delete: the file is removed from Storage *before* the database row,
   and before any cascading parent delete (illness/consultation/
   prescription/test result) — see `attachment-cascade.ts` — so deleting
   a parent record never orphans a file.

## Data model

See [SPEC.md](SPEC.md) for the full field-level table. In short:

```
Illness ─┬─< Consultation >─┬─< Prescription >─< Medication (via join table)
         │                  │
         │                  └─< Test Result (type: lab | imaging)
         │
Doctor ──┘ (referenced by Consultation, not owned by Illness)

Attachment: belongs to exactly one of {Consultation, Prescription, Test
Result} — enforced by a CHECK constraint, not just application logic.
```

Every table carries `owner_id`, `created_at`, `updated_at` (see
`src/db/schema/columns.helpers.ts`) so Row Level Security can apply the
identical `owner_id = auth.uid()` policy everywhere.

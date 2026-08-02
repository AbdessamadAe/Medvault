@AGENTS.md

# MedVault — repository guide

Personal, single-user medical records web app. Full product spec, approved
scope, and explicit exclusions live in [docs/SPEC.md](docs/SPEC.md) — read
that before adding anything that looks like a new feature. This file is
about how the code is organized, not what the product does.

## Stack

Next.js 16 (App Router, TypeScript, Turbopack) · Tailwind v4 · shadcn/ui
(`base-nova` preset, built on `@base-ui/react`, **not** Radix) · Drizzle ORM
· Supabase (Postgres + Auth + Storage) · Vitest.

## Two Next.js 16 gotchas that break naive assumptions

1. **Middleware is named `proxy`, not `middleware`.** The route-protection
   gate lives at `src/proxy.ts`, exporting a `proxy()` function — not
   `src/middleware.ts`/`middleware()`. Same `config.matcher` mechanics.
2. **shadcn's Dialog/AlertDialog/Button use a `render` prop, not `asChild`.**
   This preset is built on Base UI, not Radix, so the Radix
   `<Trigger asChild><Button/></Trigger>` pattern does not compile. Instead:
   ```tsx
   <DialogTrigger render={<Button variant="outline" />}>
     Edit
   </DialogTrigger>
   ```
   The `render` element carries the styling props; children become the
   trigger's visible content and get merged in.

## Folder conventions

Every entity (Case, Doctor, Consultation, Prescription, Medication, Test
Result) follows the same five-file shape. When adding a new entity, copy
this pattern rather than inventing a new one:

1. `src/db/schema/<entity>.ts` — Drizzle table. Spread `ownedRowColumns`
   from `columns.helpers.ts` for `owner_id`/`created_at`/`updated_at`.
   Table files only import other table files for FK columns — never for
   relations (see next point).
2. `src/db/schema/relations.ts` — the **only** file that calls
   `relations()`. Keeping every relation in one leaf file avoids circular
   imports between table files.
3. `src/lib/validation/<entity>.ts` — zod schema used by both the create
   and update Server Actions. Reuse the helpers in
   `src/lib/validation/shared.ts` (`requiredText`, `optionalText`,
   `dateString`, `optionalDateString`) instead of inlining `z.string()...`
   chains.
4. `src/lib/queries/<entity>.ts` — read-only Drizzle queries called
   directly from Server Components (`db.query.<entity>.findMany/findFirst`
   with `with: {...}` for relations). Never called from Client Components.
5. `src/lib/actions/<entity>.ts` — `"use server"` Server Actions
   (create/update/delete). Every action starts with `requireUserId()` and
   scopes every query by `eq(<table>.ownerId, ownerId)` — this is defense
   in depth on top of Postgres RLS, not a replacement for it.

UI: `src/components/<entity>/<entity>-form-dialog.tsx` (client component,
`useActionState` + shadcn Dialog) for create/edit, rendered from the
corresponding `src/app/(app)/<route>/page.tsx` Server Component.

## Invariants that must hold for any change

- **Every table has `owner_id`.** RLS policies (`src/db/rls-policies.sql`)
  all follow the identical `owner_id = auth.uid()` shape. A new table
  without `owner_id` breaks that uniformity.
- **Attachments belong to exactly one parent.** The `attachment_exactly_one_owner`
  CHECK constraint enforces this at the DB level — don't work around it by
  making all three FK columns nullable-and-unchecked in application code.
- **Storage keys are random, never derived from filenames or medical
  content.** See `src/lib/storage.ts`. The original filename is kept only
  as `original_filename` metadata for display/download, never as part of
  the storage path.
- **File access is always through a short-lived signed URL**
  (`getAttachmentSignedUrl`, 60s TTL) — never a public bucket, never a
  permanent link.
- **Deleting a parent record must purge its files first.** DB cascades
  delete rows but do nothing to Supabase Storage — see
  `src/lib/actions/attachment-cascade.ts` and call the matching
  `purgeAttachmentsFor*` helper before any cascading delete.
- **No OCR, AI interpretation, diagnosis, or clinical decision support.**
  This is a records organizer, not a medical provider — see
  docs/SPEC.md's "Explicitly excluded" list before adding anything in
  this territory.

## Commands

```bash
npm run dev          # local dev server
npm run build         # production build (also runs the TypeScript check)
npm run lint          # eslint
npm test              # vitest (validation schemas + pure logic only)
npm run db:generate   # diff src/db/schema against migrations/ (no DB connection needed)
npm run db:migrate    # apply migrations to MIGRATION_DATABASE_URL
npm run db:studio     # Drizzle Studio, browse the real database
npm run backup        # manual run of the same backup scripts/backup.ts CI runs weekly
npx tsx scripts/run-sql.ts <file>    # run a one-off .sql file against MIGRATION_DATABASE_URL
npx tsx scripts/verify-rls.ts        # confirm RLS + storage bucket + policies are all in place
```

After `db:migrate`, run
`npx tsx scripts/run-sql.ts src/db/rls-policies.sql` once — it's a
one-time bootstrap step (RLS + the private storage bucket), not a
Drizzle-managed migration, so it isn't applied automatically. See
[docs/BACKUP_RESTORE.md](docs/BACKUP_RESTORE.md) and the root
[README.md](README.md) for the full deployment sequence.

## Testing

Only pure logic is unit-tested (zod schemas, `sanitizePathSegment`) — see
files colocated as `*.test.ts`. There's no component-rendering test setup
(no `@vitejs/plugin-react`; it conflicts with this Next.js version's
Babel/Rolldown dependency tree — see the install notes in
docs/KNOWN_LIMITATIONS.md). Server Actions and DB-touching code are
exercised manually against a real Supabase project, not mocked.

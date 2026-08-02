# MedVault

A private, single-user personal medical records organizer. Not for
clinics, hospitals, insurers, or multiple users, and not a diagnostic or
clinical decision-support tool — see [docs/SPEC.md](docs/SPEC.md) for the
full approved scope and explicit exclusions.

Stack: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, Drizzle
ORM, Supabase (Postgres + Auth + Storage), deployed to Vercel. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the pieces fit
together and [docs/DECISION_LOG.md](docs/DECISION_LOG.md) for why they
were chosen.

## Documentation index

| Doc | Contents |
|---|---|
| [docs/SPEC.md](docs/SPEC.md) | Approved scope, data model, security/backup requirements, cost |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System diagram, request flows |
| [docs/API.md](docs/API.md) | Server Actions / route handler reference |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | Every environment variable, what uses it, where it's set |
| [docs/BACKUP_RESTORE.md](docs/BACKUP_RESTORE.md) | Backup schedule, secrets, restore procedure |
| [docs/DECISION_LOG.md](docs/DECISION_LOG.md) | Key decisions, options considered, approval status |
| [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) | What's deliberately not built yet |
| [CLAUDE.md](CLAUDE.md) | Codebase conventions for anyone (or any agent) extending this repo |

## Local development

Requirements: Node 22+, `pg_dump`/`pg_restore` on PATH if you'll test
backups locally (`brew install postgresql` on macOS).

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase project's values
npm run dev                  # http://localhost:3000
```

`npm run dev` needs a real Supabase project to do anything useful beyond
the `/login` page — see Deployment below to provision one.

### Other commands

```bash
npm run build         # production build (includes the TypeScript check)
npm run lint           # eslint
npm test               # vitest — validation schemas and pure logic
npm run db:generate    # regenerate SQL migrations from src/db/schema
npm run db:migrate     # apply migrations to MIGRATION_DATABASE_URL
npm run db:studio      # browse the real database with Drizzle Studio
npm run backup         # run the same backup the weekly GitHub Action runs
```

## Deployment

1. **Create a Supabase project** (free tier). From Settings → API Keys,
   note the project URL, `publishable_key` (→
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`), and `secret_key` (→
   `SUPABASE_SERVICE_ROLE_KEY`) — Supabase renamed the legacy anon/
   service_role keys to these. From Settings → Database, note the
   **Transaction pooler** string (→ `DATABASE_URL`) and the **Session
   pooler** string (→ `MIGRATION_DATABASE_URL`). Use the Session pooler,
   not "Direct connection", for `MIGRATION_DATABASE_URL` — the direct
   connection is IPv6-only unless you've paid for Supabase's IPv4 add-on,
   which hangs/times out from most IPv4-only environments (CI runners,
   some sandboxes, etc).
2. **Set local env vars**: copy `.env.example` to `.env.local` and fill in
   the values from step 1 (see [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)
   for what each one is for).
3. **Run migrations**: `npm run db:migrate`.
4. **Bootstrap security**: `npx tsx scripts/run-sql.ts src/db/rls-policies.sql`
   — enables Row Level Security on every table and creates the private
   `medical-files` storage bucket with its access policies. Sanity-check
   with `npx tsx scripts/verify-rls.ts` (confirms RLS is on for all 8
   tables, the bucket exists and is private, and all policies are
   present).
5. **Create your one account**: Supabase Dashboard → Authentication →
   Users → Add user (check "Auto Confirm User"). There is no public
   sign-up route by design — pick your own email/password directly in the
   dashboard rather than sharing it anywhere else.
6. **Deploy to Vercel**: import the repo, set the environment variables
   listed in [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) under "Vercel", and
   deploy.
7. **Verify**: sign in, create an Illness → Consultation → Prescription
   with a file attachment, view/download it, then delete it and confirm
   the file is gone from Supabase Storage (not just the database row).
8. **Set up backups**: add the GitHub Actions secrets listed in
   [docs/BACKUP_RESTORE.md](docs/BACKUP_RESTORE.md), confirm the workflow
   runs (you can trigger it manually via `workflow_dispatch` instead of
   waiting for Monday), and **do at least one test restore** into a
   throwaway Supabase project before trusting this as your real safety
   net.
9. **Install as a PWA on iPhone**: open the deployed site in Safari →
   Share → Add to Home Screen. This is app installability only — there is
   no offline data caching (by design; see docs/SPEC.md).

## Rolling back

- **App**: redeploy a previous commit/deployment from the Vercel
  dashboard.
- **Database**: `drizzle-kit` migrations are forward-only in this repo;
  to undo a schema change, write a new migration that reverses it, or
  restore from a backup (see docs/BACKUP_RESTORE.md) if data has already
  been affected.

## Security notes

Encryption in transit (TLS) and at rest (Supabase-managed), Row Level
Security on every table, private storage bucket with 60-second signed
URLs only, random (non-identifying) storage keys, server-side file-type
and size validation, no medical content in logs, secrets only ever in
environment variables. Full detail in
[docs/SPEC.md](docs/SPEC.md#security-requirements).

This app does not claim HIPAA, GDPR, or any other formal regulatory
compliance — none of that has been separately assessed or certified.

## Known limitations

See [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md).

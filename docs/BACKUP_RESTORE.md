# Backup and restore

## What gets backed up

Every Monday at 06:00 UTC, `.github/workflows/backup.yml` runs
`scripts/backup.ts`, which:

1. Runs `pg_dump --format=custom` against `MIGRATION_DATABASE_URL` (the
   direct, non-pooled Supabase connection).
2. Downloads every file in the private Storage bucket and zips them.
3. Uploads both to a Backblaze B2 bucket under
   `medvault-backups/<timestamp>/`.
4. Deletes backup folders beyond the most recent 8 (retention: ~2 months
   at a weekly cadence).

This satisfies the approved data-loss tolerance of "up to a month" with
comfortable margin. The "Export your data" page in the app
(`/export`) is a secondary, on-demand export you can trigger yourself at
any time — it doesn't touch B2, it just streams a zip straight to your
browser.

## Required secrets (GitHub repo settings → Secrets and variables → Actions)

| Secret | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS so the backup can read every file) |
| `MIGRATION_DATABASE_URL` | Direct (port 5432) Postgres connection string |
| `SUPABASE_STORAGE_BUCKET` | `medical-files` |
| `B2_ENDPOINT` | Your Backblaze B2 S3-compatible endpoint, e.g. `https://s3.us-west-004.backblazeb2.com` |
| `B2_BUCKET_NAME` | The B2 bucket you created for backups |
| `B2_APPLICATION_KEY_ID` | B2 application key ID |
| `B2_APPLICATION_KEY` | B2 application key |

## Running a backup manually

```bash
npm run backup
```

Requires `pg_dump` on your PATH (`brew install postgresql` on macOS, or
`apt install postgresql-client` on Linux) and the same environment
variables as above in `.env.local`.

## Restoring

**Restore the database** (into a *new*, empty Supabase project — never
restore over a live project you still need):

```bash
pg_restore --format=custom --clean --if-exists \
  --dbname="$MIGRATION_DATABASE_URL" database.dump
```

**Restore the files**: unzip `storage-files.zip` and re-upload each file
to the Storage bucket at its original path (`<user id>/<uuid>`), e.g.
with the Supabase CLI or dashboard, or a small script using
`supabase.storage.from(bucket).upload(path, fileBuffer)` for each entry.

**Restore testing status:** this procedure is documented but has not yet
been executed end-to-end against a real Supabase project — that
verification is part of initial deployment (see the root README's
deployment steps). Until a restore has actually been run once and
confirmed to produce a working app, treat this as an untested plan, not a
guarantee.

## Failure scenarios this plan covers

- **Accidental deletion of a record or file**: restore from the most
  recent weekly backup (up to ~1 week of loss) or, if caught immediately,
  there is no in-app "undo" — deletions are immediate (see Known
  Limitations).
- **Loss of access to the Supabase account**: the B2 backups (database
  dump + files) are enough to stand up a fresh Supabase project and
  restore into it.
- **Server compromise**: rotate the Supabase service role key, anon key,
  and B2 application key immediately; the backups themselves are stored
  in a separate account/vendor from the running app, so a compromise of
  one does not automatically expose the other.

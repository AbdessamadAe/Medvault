# Environment variables

Copy `.env.example` to `.env.local` for local development. Never commit
`.env.local` — it's already in `.gitignore`.

| Variable | Used by | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | App, backup script | Public — safe to expose to the browser. Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | App | Public — safe to expose to the browser. RLS is what actually protects data, not secrecy of this key. Supabase's dashboard now calls this the **publishable key** (`sb_publishable_...`) — same thing, drop-in value. |
| `SUPABASE_SERVICE_ROLE_KEY` | Backup script only | **Secret.** Bypasses Row Level Security. Never used by the running app, never sent to the browser. Supabase's dashboard now calls this the **secret key** (`sb_secret_...`). |
| `DATABASE_URL` | App (Drizzle client) | Transaction pooler connection (port 6543) from Supabase → Settings → Database. |
| `MIGRATION_DATABASE_URL` | `drizzle-kit generate/migrate`, `scripts/run-sql.ts`, backup script | **Session pooler** connection string, not "Direct connection". The direct connection is IPv6-only unless you've bought Supabase's IPv4 add-on, and hangs/times out from IPv4-only environments (this bit us running migrations from a sandbox with no IPv6 route). The session pooler supports the session-level features migrations need, unlike the transaction pooler. |
| `SUPABASE_STORAGE_BUCKET` | App, backup script | Defaults to `medical-files` if unset. Must match the bucket created by `src/db/rls-policies.sql`. |
| `B2_ENDPOINT` | Backup script only | Backblaze B2 S3-compatible endpoint for your bucket's region. |
| `B2_BUCKET_NAME` | Backup script only | The B2 bucket backups are uploaded to. |
| `B2_APPLICATION_KEY_ID` / `B2_APPLICATION_KEY` | Backup script only | **Secret.** Scope this B2 application key to only the backup bucket if possible. |

## Where these get set in each environment

- **Local development**: `.env.local`
- **Vercel (running app)**: Project Settings → Environment Variables — only
  needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `DATABASE_URL`, and `SUPABASE_STORAGE_BUCKET`. The app never needs the
  service role key or any B2 credentials.
- **GitHub Actions (backup workflow)**: repo Settings → Secrets and
  variables → Actions — needs everything in the table above except
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the backup script authenticates with
  the service role key instead).
- **Local migrations** (`npm run db:generate` / `db:migrate`): `.env.local`,
  same as local development.

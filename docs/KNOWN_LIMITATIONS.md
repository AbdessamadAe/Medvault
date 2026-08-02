# Known limitations

- **No component-level UI tests.** `@vitejs/plugin-react` currently
  conflicts with this Next.js version's Babel/Rolldown dependency tree
  (peer dependency resolution failure at install time). Only pure logic
  (zod validation, path sanitization) is unit-tested; UI has been verified
  manually via `npm run build` + smoke-testing routes, not via an
  automated component test suite.
- **Deletions are immediate, with no undo.** The delete confirmation
  dialog is the only safeguard — there is no trash/recycle-bin concept.
  Recovery after an accidental delete means restoring from the most
  recent backup (up to ~1 week of loss under the current schedule).
- **Restore procedure is documented but has not yet been run end-to-end**
  against a real Supabase project. This should be done once during
  initial deployment before relying on it. *(See docs/BACKUP_RESTORE.md.)*
- **Medications aren't a searchable/reusable picker.** Each prescription's
  medications are entered fresh as part of that prescription's form; the
  data model supports reuse (Medication is its own table), but there's no
  UI to search and re-link an existing medication across prescriptions.
- **Doctor deletion is blocked, not reassignable.** If a doctor has any
  consultations on file, deletion is refused with an error rather than
  offering to reassign those consultations to a different doctor.
- **No offline access.** By design (approved scope) — every page requires
  a live connection. The PWA install support only makes the app feel more
  native on the home screen; it does not cache data.
- **Supabase free-tier project pauses after 7 days of inactivity**,
  causing a short cold-start delay on the next request. Not a data-loss
  risk, just a UX quirk of the free tier.
- **Single hardcoded owner per row via `owner_id`.** This is intentional
  for a single-user app, not a partial multi-tenancy implementation —
  extending to multiple users would require rethinking the RLS policies
  and the auth model, not just adding rows.

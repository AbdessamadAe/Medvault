# MedVault — Approved v1 Specification

Personal, single-user medical records organizer. Not for clinics, hospitals,
insurers, or multiple users. Not a diagnostic or clinical decision-support
tool — it stores and organizes information you enter yourself.

## Approved scope

- Web application (Next.js), responsive/installable as a PWA on iPhone home
  screen. Native iOS app is **deferred**, not excluded.
- Single user, single manually-provisioned account. No public sign-up.
- Record types: Case, Doctor, Consultation, Prescription, Medication,
  Test Result (labs + imaging combined). See schema below for the hierarchy.
- File attachments: PDF, JPEG, HEIC, PNG, plain-text notes. Import via file
  picker only (no camera capture).
- Basic free-text search across titles/notes/test names.
- Browse-by-Case and Browse-by-Doctor navigation.
- Body system tags on Cases (fixed list of ~15 broad body systems, e.g.
  Digestive, Respiratory, Musculoskeletal — not specific anatomy), 0 or
  more per case, with filter chips to browse Cases by tag.
- Low-friction data entry: suggestion dropdowns (via `<datalist>`, so a
  custom value can always still be typed) for doctor specialty and
  medication frequency (fixed curated lists), and for clinic, city, visit
  reason, medication name, and test name (suggested from the user's own
  previously-entered values). Creating a Consultation lets you add a new
  doctor (name + specialty) inline, without leaving the form.
- Weekly automated backups (DB dump + storage files) to a separate location.
- "Export all my data" (JSON + original files as a zip).
- PWA installability (manifest, icons, home-screen install) — **not** the
  same as offline data access, which remains excluded (see below).

## Explicitly excluded from v1 (not silently added; revisit only on request)

- Allergies, Vaccinations, Vitals/measurements, Symptoms log, Insurance
  info, Emergency contacts as record types.
- Notifications / reminders of any kind.
- Offline access or local caching of medical data.
- Camera-based document scanning.
- DICOM and Office document formats.
- OCR, AI interpretation, diagnosis/treatment suggestions, or any form of
  clinical decision support.

## Data model

```
Case (required root)
 └─ Consultation (requires Case + Doctor)
     ├─ Prescription (requires Consultation)
     │   └─ Medication (linked, many-to-many via prescription_medications)
     └─ Test Result (requires Consultation; type = lab | imaging)

Doctor — shared directory, referenced by Consultations

Attachment — polymorphic-by-FK: belongs to exactly one of
  Consultation, Prescription, or Test Result (enforced by CHECK constraint)
```

| Entity | Fields | Required | Optional |
|---|---|---|---|
| Case | title, status (active/resolved/chronic), start_date, end_date, notes, body_systems (0+ tags from a fixed list) | title | status, dates, notes, body_systems |
| Doctor | name, specialty, clinic, city, phone, notes | name | rest |
| Consultation | date, case_id, doctor_id, reason, notes | date, case, doctor, reason | notes |
| Prescription | date, consultation_id, notes | date, consultation, ≥1 medication | notes |
| Medication | name, dosage, frequency, start_date, end_date, notes | name | rest |
| Test Result | date, type (lab/imaging), test_name, consultation_id, result_notes | date, type, test_name, consultation | notes |
| Attachment | filename (display), storage_key, mime_type, size_bytes, owner (one of consultation/prescription/test_result) | all | — |

## Security requirements

- Auth: Supabase Auth, email + password, one account, no public registration.
- TLS in transit (Vercel + Supabase default). Encryption at rest (Supabase
  managed Postgres + Storage default).
- Row Level Security on every table, scoped to the authenticated user.
- Private Supabase Storage bucket only; file access via short-lived signed
  URLs, never public links.
- Storage keys are random UUIDs, not user-supplied filenames; original
  filename kept only as display metadata.
- Server-side file-type allowlist (pdf, jpg, jpeg, png, heic, txt) and a
  25MB per-file upload size limit.
- No medical record content (notes, reasons, test names) in application logs.
- All secrets via environment variables, never committed to git.

## Backup & recovery

- Weekly GitHub Actions job: pg_dump the database + copy all Storage files,
  upload to a separate Backblaze B2 bucket, encrypted at rest.
- Retention: last 8 weekly backups (~2 months), oldest rolled off.
- Restore procedure documented and tested at least once during setup.
- On-demand "export all data" feature as a secondary, user-triggered backup.

## Hosting & estimated cost

| Service | Purpose | Tier | Cost |
|---|---|---|---|
| Vercel | Next.js hosting | Hobby (personal use) | $0 |
| Supabase | Postgres + Auth + Storage | Free project | $0 |
| Backblaze B2 | Backup destination | Free (10GB) | $0 |
| GitHub Actions | Scheduled backup runner | Free tier minutes | $0 |

Estimated recurring cost: **$0/month**. Known caveats: Supabase free
project pauses after 7 days idle (auto-resumes, short cold start); Vercel
Hobby plan is for non-commercial personal use.

## Technical stack

- Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui (green/white
  theme).
- Supabase JS client + `@supabase/ssr` for auth/session handling.
- Drizzle ORM + drizzle-kit for schema and migrations.
- Server Actions as the API layer (no separate REST API yet — would be
  added if/when the deferred native iOS app is built).
- Vitest for unit/logic tests.

## Known deferred items

- Native iPhone app.
- Any item listed under "Explicitly excluded" above, if approved later.

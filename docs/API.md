# API surface

There is no public REST API — the only client is this app itself, so
reads and writes go through Next.js Server Components and Server Actions
directly. This document is a reference to where each operation lives, for
whoever (human or agent) needs to find or extend one.

All Server Actions require an authenticated session (`requireUserId()`)
and every query is scoped to the signed-in user, both in the query itself
and again by Postgres Row Level Security.

## Illnesses — `src/lib/actions/illnesses.ts`, `src/lib/queries/illnesses.ts`
- `createIllness`, `updateIllness`, `deleteIllness`
- `listIllnesses`, `getIllnessWithHistory`, `listIllnessesForPicker`

## Doctors — `src/lib/actions/doctors.ts`, `src/lib/queries/doctors.ts`
- `createDoctor`, `updateDoctor`, `deleteDoctor` (blocked if the doctor has
  consultations on file)
- `listDoctors`, `getDoctorWithHistory`

## Consultations — `src/lib/actions/consultations.ts`, `src/lib/queries/consultations.ts`
- `createConsultation`, `updateConsultation`, `deleteConsultation`
- `getConsultationWithDetails`

## Prescriptions — `src/lib/actions/prescriptions.ts`
- `createPrescription`, `updatePrescription`, `deletePrescription`
  (each also creates/replaces the linked `Medication` rows and the
  `prescription_medications` join rows in a single transaction)

## Test Results — `src/lib/actions/test-results.ts`
- `createTestResult`, `updateTestResult`, `deleteTestResult`

## Attachments — `src/lib/actions/attachments.ts`
- `uploadConsultationAttachment`, `uploadPrescriptionAttachment`,
  `uploadTestResultAttachment`
- `deleteAttachment`
- `getAttachmentDownloadUrl` — returns a 60-second signed URL, called
  directly from a Client Component (not via a form)

## Search — `src/lib/queries/search.ts`
- `searchRecords(ownerId, term)` — `ILIKE` across illness title/notes,
  doctor name/notes, consultation reason/notes, test name/result notes.
  Called from the `/search` Server Component page via `?q=`.

## Auth — `src/lib/actions/auth.ts`
- `signIn`, `signOut`

## Route Handlers (the only two non-Server-Action endpoints)
- `GET /api/export` — streams a zip of all data as JSON + every original
  attached file, organized by illness/consultation
  (`src/app/api/export/route.ts`)
- `src/app/manifest.ts`, `src/app/icon.tsx`, `src/app/apple-icon.tsx`,
  `src/app/icon-192/route.ts`, `src/app/icon-512/route.ts` — PWA manifest
  and generated icons, not application data

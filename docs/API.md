# API surface

There is no public REST API — the only client is this app itself, so
reads and writes go through Next.js Server Components and Server Actions
directly. This document is a reference to where each operation lives, for
whoever (human or agent) needs to find or extend one.

All Server Actions require an authenticated session (`requireUserId()`)
and every query is scoped to the signed-in user, both in the query itself
and again by Postgres Row Level Security.

## Cases — `src/lib/actions/cases.ts`, `src/lib/queries/cases.ts`
- `createCase`, `updateCase`, `deleteCase`
- `listCases(ownerId, bodySystem?)` — optional filter by one tag from
  `src/lib/body-systems.ts`, `getCaseWithHistory`, `listCasesForPicker`

## Doctors — `src/lib/actions/doctors.ts`, `src/lib/queries/doctors.ts`
- `createDoctor`, `updateDoctor`, `deleteDoctor` (blocked if the doctor has
  consultations on file)
- `createDoctorInline` — creates a doctor without redirecting, for the
  "add a doctor without leaving the Consultation form" flow
- `listDoctors`, `getDoctorWithHistory`

## Maps lookup — `src/lib/actions/maps-lookup.ts`, `src/lib/maps-link.ts`
- `lookupGoogleMapsLink(url)` — resolves short links, regex-parses the
  place name + coordinates, reverse-geocodes the city via OpenStreetMap
  Nominatim (free, no API key). Used by the Doctor form's "paste a Maps
  link" pre-fill; never writes anything without the user reviewing it.

## Suggestions — `src/lib/queries/suggestions.ts`
- `getDoctorFieldSuggestions`, `getConsultationReasonSuggestions`,
  `getMedicationNameSuggestions`, `getTestNameSuggestions` — distinct
  values the user has already entered, powering the `<datalist>`
  suggestion dropdowns (see `src/components/datalist-input.tsx`)

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
- `searchRecords(ownerId, term)` — `ILIKE` across case title/notes,
  doctor name/notes, consultation reason/notes, test name/result notes.
  Called from the `/search` Server Component page via `?q=`.

## Auth — `src/lib/actions/auth.ts`
- `signIn`, `signOut`

## Route Handlers (the only two non-Server-Action endpoints)
- `GET /api/export` — streams a zip of all data as JSON + every original
  attached file, organized by case/consultation
  (`src/app/api/export/route.ts`)
- `src/app/manifest.ts`, `src/app/icon.tsx`, `src/app/apple-icon.tsx`,
  `src/app/icon-192/route.ts`, `src/app/icon-512/route.ts` — PWA manifest
  and generated icons, not application data

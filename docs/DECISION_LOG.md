# Decision log

| Decision | Options considered | Selected | Reason | Approved |
|---|---|---|---|---|
| Client platform (v1) | Native iOS app; responsive web app | Web app (Next.js), native iOS deferred | User explicitly redirected scope mid-project toward a web-first v1 | Yes — explicit user instruction |
| Hosting/backend | Supabase (all-in-one) + Vercel; Neon+R2+NextAuth (decoupled) | Supabase + Vercel | Fewest moving parts for a one-person-operated project; built-in RLS and private storage | Yes |
| Authentication | Email+password; passwordless email; Sign in with Apple; managed IdP | Supabase Auth, email+password, one manually-provisioned account | Simplest secure option for exactly one user; no public sign-up route | Yes |
| Data model shape | Flat independent record types; case-centric hierarchy | Case → Consultation → {Prescription+Medications, Test Result}, Doctor as shared directory | Matches the user's description of the Moroccan healthcare visit flow they wanted to mirror | Yes |
| Case required on every record? | Always required; optional | Always required | User's explicit choice, with the tradeoff (needs a catch-all Case for routine visits) flagged | Yes |
| Medications: separate entity or free text | Separate entity (reusable/linkable); free text on Prescription | Separate Medication entity + join table | User's explicit choice, for future cross-linking value | Yes |
| Labs vs Imaging | One combined "Test Result" type; two separate types | Combined, with a `type` discriminator | User's explicit choice | Yes |
| Doctor directory | Reusable directory; free text per consultation | Reusable directory | User's explicit choice, enables "all visits with Dr. X" | Yes |
| Prescriptions/Test Results link depth | Always via a Consultation; optional direct-to-Case | Always via a Consultation | User's explicit choice | Yes |
| Backup strategy | Automated scheduled export; upgrade to Supabase Pro; manual export | Automated weekly export (GitHub Actions) to Backblaze B2 | User chose this over paying for Supabase Pro, given free-tier budget preference | Yes |
| Backup cadence vs. stated tolerance | Weekly, monthly | Weekly | User said "up to a month" tolerable; weekly gives comfortable margin at no extra cost | Implementation detail within an approved category |
| API layer | Separate REST API; Server Actions only | Server Actions (no REST API yet) | No client other than this Next.js app exists yet; a REST API would be premature until the deferred iOS app is actually built | Engineering-level, consistent with "avoid unnecessary infrastructure" |
| ORM | Drizzle; Prisma; raw SQL | Drizzle + drizzle-kit | User explicitly requested "use an ORM"; Drizzle is lightweight and strongly typed, matches Postgres/Supabase well | Yes |
| UI theme | — | Green/white, shadcn/ui `base-nova` preset (Base UI) | User explicitly requested a green/white polished shadcn theme | Yes |
| PWA support | None; installable manifest only; full offline caching | Installable manifest + icons, no service worker/offline caching | User asked for PWA support for mobile; offline caching stays excluded per the earlier explicit "no offline access" decision | Yes, with the offline-caching boundary called out explicitly |
| Attachment storage | Public bucket; private bucket + signed URLs | Private bucket, 60s signed URLs, random storage keys | Security requirement: no guessable/permanent file URLs | Yes |
| File type / size limits | — | pdf, jpg/jpeg, png, heic, txt; 25MB per file | Matches approved document formats; 25MB proposed as a reasonable default, flagged for the user to adjust | Proposed default, not separately re-confirmed |

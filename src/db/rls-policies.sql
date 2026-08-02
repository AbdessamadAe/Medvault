-- Run this once in the Supabase SQL editor after the Drizzle migrations
-- have been applied (npm run db:migrate) and before using the app.
--
-- This is deliberately NOT a Drizzle-managed migration: it's a one-time
-- security bootstrap step (Row Level Security + the private storage
-- bucket), not something that changes as the app's data model evolves.
--
-- Every table already has an `owner_id` column (see
-- src/db/schema/columns.helpers.ts). RLS here is defense in depth: even
-- though the app is single-user today, a policy bug in application code
-- can never expose one user's rows to another, because Postgres itself
-- enforces `owner_id = auth.uid()` on every query.

-- ---------------------------------------------------------------------
-- Row Level Security on every table
-- ---------------------------------------------------------------------

alter table public.illnesses enable row level security;
alter table public.doctors enable row level security;
alter table public.consultations enable row level security;
alter table public.prescriptions enable row level security;
alter table public.medications enable row level security;
alter table public.prescription_medications enable row level security;
alter table public.test_results enable row level security;
alter table public.attachments enable row level security;

create policy "owner_full_access" on public.illnesses
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "owner_full_access" on public.doctors
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "owner_full_access" on public.consultations
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "owner_full_access" on public.prescriptions
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "owner_full_access" on public.medications
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "owner_full_access" on public.prescription_medications
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "owner_full_access" on public.test_results
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "owner_full_access" on public.attachments
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- Private storage bucket for medical file uploads
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('medical-files', 'medical-files', false)
on conflict (id) do nothing;

-- Files are stored at "<user id>/<random uuid>" (see src/lib/storage.ts).
-- These policies mean a user can only read/write/delete objects inside
-- their own folder, and the bucket itself is never public — every read
-- must go through a short-lived signed URL created by the server.

create policy "owner_read_own_files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'medical-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "owner_upload_own_files" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'medical-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "owner_delete_own_files" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'medical-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

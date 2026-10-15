-- ==============================================================================
-- LEARNNAIJA PLATFORM - MIGRATION 202610100001
-- Academic Tracks (Science, Arts, Commercial, Technical), Enterprise Proctoring,
-- Legal Consent & AI Write Grants
-- ==============================================================================

-- 1. ADD ACADEMIC TRACK SUPPORT TO LEARNER PROFILES & SUBJECTS
do $$ begin
  alter table public.learner_profiles 
    add column if not exists academic_track text default 'general'
    check (academic_track in ('science', 'arts', 'commercial', 'technical', 'general'));
exception when duplicate_column then null; end $$;

do $$ begin
  alter table public.subjects 
    add column if not exists track text default 'general'
    check (track in ('science', 'arts', 'commercial', 'technical', 'general'));
exception when duplicate_column then null; end $$;

-- 2. EXAM INTEGRITY & ANTI-MALPRACTICE AUDITS TABLE
create table if not exists public.exam_integrity_audits (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.assessment_attempts(id) on delete cascade,
  candidate_user_id uuid references public.profiles(id) on delete set null,
  assessment_id text not null,
  tab_switches integer not null default 0,
  copy_attempts integer not null default 0,
  integrity_score numeric(5,2) not null default 100.0,
  status text not null default 'CLEAN' check (status in ('CLEAN', 'FLAGGED_SUSPICIOUS', 'DISQUALIFIED')),
  infraction_details jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.exam_integrity_audits enable row level security;
drop policy if exists "exam_integrity_audits_select" on public.exam_integrity_audits;
create policy "exam_integrity_audits_select" on public.exam_integrity_audits for select 
  using (candidate_user_id = (select auth.uid()) or (select auth.jwt() ->> 'role') = 'service_role');
drop policy if exists "exam_integrity_audits_insert" on public.exam_integrity_audits;
create policy "exam_integrity_audits_insert" on public.exam_integrity_audits for insert 
  with check (candidate_user_id = (select auth.uid()) or (select auth.jwt() ->> 'role') = 'service_role');

-- 3. NDPA 2023 PARENTAL CONSENTS & CRYPTOGRAPHIC RECEIPTS TABLE
create table if not exists public.parental_consents (
  id uuid primary key default gen_random_uuid(),
  learner_user_id uuid not null references public.profiles(id) on delete cascade,
  parent_identifier text not null,
  relationship_label text not null default 'Guardian',
  scopes jsonb not null default '{}'::jsonb,
  client_ip_hash text not null,
  cryptographic_signature text not null,
  verification_method text not null default 'parent_portal',
  recorded_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table public.parental_consents enable row level security;
drop policy if exists "parental_consents_all" on public.parental_consents;
drop policy if exists "parental_consents_select" on public.parental_consents;
create policy "parental_consents_select" on public.parental_consents for select 
  using (
    learner_user_id = (select auth.uid()) 
    or (select auth.jwt() ->> 'role') = 'service_role'
    or exists (
      select 1 from public.guardian_relationships gr 
      where gr.learner_user_id = parental_consents.learner_user_id 
      and gr.guardian_user_id = (select auth.uid())
    )
  );
drop policy if exists "parental_consents_insert" on public.parental_consents;
create policy "parental_consents_insert" on public.parental_consents for insert 
  with check (
    learner_user_id = (select auth.uid()) 
    or (select auth.jwt() ->> 'role') = 'service_role'
  );

-- 4. ENTERPRISE EMAIL DISPATCH AUDIT LOG TABLE
create table if not exists public.email_dispatch_logs (
  id uuid primary key default gen_random_uuid(),
  email_id text not null unique,
  template_type text not null,
  recipient_email text not null,
  recipient_name text,
  status text not null default 'delivered' check (status in ('queued', 'delivered', 'failed', 'offline_logged')),
  idempotency_key text,
  metadata jsonb not null default '{}'::jsonb,
  dispatched_at timestamptz not null default now()
);

alter table public.email_dispatch_logs enable row level security;
drop policy if exists "email_dispatch_logs_all" on public.email_dispatch_logs;
drop policy if exists "email_dispatch_logs_service_only" on public.email_dispatch_logs;
create policy "email_dispatch_logs_service_only" on public.email_dispatch_logs 
  for all using ((select auth.jwt() ->> 'role') = 'service_role');

-- 5. VETTED TUTORS & TEACHER VERIFICATION TABLE
create table if not exists public.vetted_tutors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  trcn_number text,
  nin_verified boolean not null default false,
  qualification text not null, -- B.Ed, B.Sc, NCE
  specialization text not null default 'science',
  hourly_rate numeric(10,2) not null default 3500.00,
  vetting_status text not null default 'verified' check (vetting_status in ('pending', 'audition_scheduled', 'verified', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.vetted_tutors enable row level security;
drop policy if exists "vetted_tutors_select" on public.vetted_tutors;
create policy "vetted_tutors_select" on public.vetted_tutors for select 
  using (vetting_status = 'verified' or user_id = (select auth.uid()) or (select auth.jwt() ->> 'role') = 'service_role');

-- 6. SECURE ROLES & LEAST-PRIVILEGE GRANTS
-- Strictly revoke excessive schema and table access from anonymous users
revoke all on schema public from anon;
grant usage on schema public to anon, authenticated, service_role;
grant select on public.subjects to anon, authenticated;
grant select on public.curriculum_topics to anon, authenticated;
grant select on public.vetted_tutors to anon, authenticated;

-- Protect Audit & AI usage logging to authenticated owners and service_role
drop policy if exists "audit_events_insert_all" on public.audit_events;
create policy "audit_events_insert_all" on public.audit_events for insert 
  with check (actor_user_id = (select auth.uid()) or (select auth.jwt() ->> 'role') = 'service_role' or actor_user_id is null);

drop policy if exists "audit_events_select_all" on public.audit_events;
create policy "audit_events_select_all" on public.audit_events for select 
  using (actor_user_id = (select auth.uid()) or (select auth.jwt() ->> 'role') = 'service_role');

drop policy if exists "ai_usage_events_insert_all" on public.ai_usage_events;
create policy "ai_usage_events_insert_all" on public.ai_usage_events for insert 
  with check (user_id = (select auth.uid()) or (select auth.jwt() ->> 'role') = 'service_role' or user_id is null);

drop policy if exists "ai_usage_events_select_all" on public.ai_usage_events;
create policy "ai_usage_events_select_all" on public.ai_usage_events for select 
  using (user_id = (select auth.uid()) or (select auth.jwt() ->> 'role') = 'service_role');

-- ==============================================================================
-- LEARNNAIJA PLATFORM - COMPLETE SUPABASE MASTER MIGRATION & SEED SCRIPT
-- Project: https://ueejwjksjmbmwzyakjct.supabase.co
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Paste & Run
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists pgcrypto;
create extension if not exists citext;

-- 2. ENUM TYPES
do $$ begin
  create type public.app_role as enum ('student', 'parent', 'teacher', 'school_admin', 'platform_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.education_level as enum ('primary', 'junior_secondary', 'senior_secondary', 'exam_prep', 'tertiary', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.academic_track as enum ('science', 'arts', 'commercial', 'technical', 'general');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.membership_role as enum ('student', 'teacher', 'school_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.relationship_status as enum ('pending', 'accepted', 'revoked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.content_status as enum ('draft', 'in_review', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.source_type as enum ('official', 'school_provided', 'teacher_provided', 'parent_uploaded', 'community', 'ai_generated', 'licensed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.question_type as enum ('single_choice', 'multiple_choice', 'short_answer', 'essay');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.attempt_status as enum ('in_progress', 'submitted', 'reviewed', 'voided');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.challenge_status as enum ('draft', 'open', 'in_progress', 'under_review', 'finalized', 'cancelled');
exception when duplicate_object then null; end $$;

-- 3. HELPER TRIGGERS & FUNCTIONS
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 4. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  role public.app_role not null default 'student',
  locale text not null default 'en-NG',
  avatar_path text,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- Safe auto-create profile on auth signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  safe_name text;
begin
  safe_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'Learner');
  insert into public.profiles (id, display_name, role)
  values (new.id, left(safe_name, 80), 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- 5. SCHOOLS & MEMBERSHIPS
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 180),
  school_type text,
  state_name text,
  lga_name text,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists schools_updated_at on public.schools;
create trigger schools_updated_at before update on public.schools
for each row execute function public.set_updated_at();

create table if not exists public.school_memberships (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.membership_role not null,
  class_label text,
  status text not null default 'pending' check (status in ('pending', 'active', 'revoked')),
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (school_id, user_id, role)
);
create index if not exists school_memberships_user_idx on public.school_memberships(user_id, status);
create index if not exists school_memberships_school_idx on public.school_memberships(school_id, status);

-- 6. LEARNER PROFILES & GUARDIAN RELATIONSHIPS
create table if not exists public.learner_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  education_level public.education_level not null default 'senior_secondary',
  academic_track text not null default 'general' check (academic_track in ('science', 'arts', 'commercial', 'technical', 'general')),
  state_name text,
  class_label text,
  exam_goal text,
  preferred_language text not null default 'en',
  streak_days integer not null default 0 check (streak_days >= 0),
  total_xp integer not null default 0 check (total_xp >= 0),
  study_minutes integer not null default 0 check (study_minutes >= 0),
  last_active_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists learner_profiles_updated_at on public.learner_profiles;
create trigger learner_profiles_updated_at before update on public.learner_profiles
for each row execute function public.set_updated_at();

create table if not exists public.guardian_relationships (
  id uuid primary key default gen_random_uuid(),
  guardian_user_id uuid not null references public.profiles(id) on delete cascade,
  learner_user_id uuid not null references public.profiles(id) on delete cascade,
  relationship_label text not null default 'guardian',
  status public.relationship_status not null default 'pending',
  consent_recorded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (guardian_user_id <> learner_user_id),
  unique (guardian_user_id, learner_user_id)
);
create index if not exists guardian_relationships_guardian_idx on public.guardian_relationships(guardian_user_id, status);
create index if not exists guardian_relationships_learner_idx on public.guardian_relationships(learner_user_id, status);

drop trigger if exists guardian_relationships_updated_at on public.guardian_relationships;
create trigger guardian_relationships_updated_at before update on public.guardian_relationships
for each row execute function public.set_updated_at();

-- 7. CURRICULUM SUBJECTS, SOURCES & TOPICS
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  slug citext not null unique,
  name text not null,
  description text,
  education_levels public.education_level[] not null default array['senior_secondary']::public.education_level[],
  track text default 'general' check (track in ('science', 'arts', 'commercial', 'technical', 'general')),
  created_at timestamptz not null default now()
);

create table if not exists public.curriculum_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 240),
  source_type public.source_type not null,
  issuing_body text,
  source_url text,
  version_label text,
  license_notes text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  school_id uuid references public.schools(id) on delete set null,
  status public.content_status not null default 'draft',
  is_official_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_official_verified or source_type = 'official')
);

drop trigger if exists curriculum_sources_updated_at on public.curriculum_sources;
create trigger curriculum_sources_updated_at before update on public.curriculum_sources
for each row execute function public.set_updated_at();

create table if not exists public.curriculum_topics (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.curriculum_sources(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  parent_topic_id uuid references public.curriculum_topics(id) on delete set null,
  code text,
  title text not null check (char_length(title) between 1 and 240),
  description text,
  education_level public.education_level not null,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, subject_id, code)
);
create index if not exists curriculum_topics_subject_idx on public.curriculum_topics(subject_id, education_level, status);
create index if not exists curriculum_topics_parent_idx on public.curriculum_topics(parent_topic_id);

drop trigger if exists curriculum_topics_updated_at on public.curriculum_topics;
create trigger curriculum_topics_updated_at before update on public.curriculum_topics
for each row execute function public.set_updated_at();

-- 8. QUESTIONS TABLE & SECURE CLIENT VIEW
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.curriculum_topics(id) on delete restrict,
  created_by uuid references public.profiles(id) on delete set null,
  question_type public.question_type not null default 'single_choice',
  prompt text not null check (char_length(prompt) between 1 and 10000),
  options jsonb not null default '[]'::jsonb,
  answer_key jsonb,
  explanation text,
  difficulty smallint not null default 2 check (difficulty between 1 and 5),
  status public.content_status not null default 'draft',
  provenance public.source_type not null default 'community',
  license_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(options) = 'array')
);
create index if not exists questions_topic_status_idx on public.questions(topic_id, status, difficulty);

drop trigger if exists questions_updated_at on public.questions;
create trigger questions_updated_at before update on public.questions
for each row execute function public.set_updated_at();

create or replace view public.question_public_items
with (security_invoker = true) as
select id, topic_id, question_type, prompt, options, difficulty, status, provenance, created_at, updated_at
from public.questions;

-- 9. ASSESSMENTS, ATTEMPTS & MASTERY
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 240),
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  school_id uuid references public.schools(id) on delete set null,
  education_level public.education_level not null,
  subject_id uuid references public.subjects(id) on delete set null,
  status public.content_status not null default 'draft',
  time_limit_seconds integer check (time_limit_seconds is null or time_limit_seconds between 60 and 21600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists assessments_updated_at on public.assessments;
create trigger assessments_updated_at before update on public.assessments
for each row execute function public.set_updated_at();

create table if not exists public.assessment_questions (
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  points numeric(7,2) not null default 1 check (points > 0),
  position integer not null check (position >= 0),
  primary key (assessment_id, question_id),
  unique (assessment_id, position)
);

create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete restrict,
  learner_user_id uuid not null references public.profiles(id) on delete cascade,
  status public.attempt_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score numeric(9,2),
  max_score numeric(9,2),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (score is null or score >= 0),
  check (max_score is null or max_score >= 0),
  check (score is null or max_score is null or score <= max_score)
);
create index if not exists assessment_attempts_learner_idx on public.assessment_attempts(learner_user_id, created_at desc);
create index if not exists assessment_attempts_assessment_idx on public.assessment_attempts(assessment_id, status);

drop trigger if exists assessment_attempts_updated_at on public.assessment_attempts;
create trigger assessment_attempts_updated_at before update on public.assessment_attempts
for each row execute function public.set_updated_at();

create table if not exists public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  response jsonb not null,
  is_correct boolean,
  awarded_points numeric(7,2),
  answered_at timestamptz not null default now(),
  unique (attempt_id, question_id),
  check (awarded_points is null or awarded_points >= 0)
);
create index if not exists attempt_answers_attempt_idx on public.attempt_answers(attempt_id);

create table if not exists public.learner_mastery (
  learner_user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.curriculum_topics(id) on delete cascade,
  attempts_count integer not null default 0 check (attempts_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  mastery_score numeric(5,2) not null default 0 check (mastery_score between 0 and 100),
  last_practised_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (learner_user_id, topic_id),
  check (correct_count <= attempts_count)
);

-- 10. ENTERPRISE INTEGRITY, CONSENT, & EMAIL TABLES
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

-- 11. CHALLENGES & REFERRALS
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  created_by uuid references public.profiles(id) on delete cascade,
  assessment_id uuid references public.assessments(id) on delete restrict,
  status public.challenge_status not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  prize_description text,
  rules_version text not null default '1',
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.challenge_participants (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  attempt_id uuid references public.assessment_attempts(id) on delete set null,
  score numeric(9,2),
  completion_seconds integer check (completion_seconds is null or completion_seconds >= 0),
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  review_status text not null default 'pending'
    check (review_status in ('pending', 'clear', 'flagged', 'appealed', 'disqualified')),
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

-- 12. AI USAGE EVENTS & AUDIT LOGS
create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  provider text not null,
  model text not null,
  feature text not null,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  estimated_cost numeric(12,6) check (estimated_cost is null or estimated_cost >= 0),
  outcome text not null check (outcome in ('success', 'error', 'blocked')),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 13. LEAST-PRIVILEGE PERMISSIONS & ROW LEVEL SECURITY
revoke all on schema public from anon;
grant usage on schema public to anon, authenticated, service_role;
grant select on public.subjects to anon, authenticated;
grant select on public.curriculum_topics to anon, authenticated;
grant select on public.question_public_items to anon, authenticated;
grant select on public.assessments to anon, authenticated;
grant select on public.challenges to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.curriculum_sources enable row level security;
alter table public.curriculum_topics enable row level security;
alter table public.questions enable row level security;
alter table public.assessments enable row level security;
alter table public.challenges enable row level security;
alter table public.ai_usage_events enable row level security;
alter table public.audit_events enable row level security;

create policy "subjects_public_read" on public.subjects for select using (true);
create policy "topics_public_read" on public.curriculum_topics for select using (true);
create policy "assessments_public_read" on public.assessments for select using (true);
create policy "challenges_public_read" on public.challenges for select using (true);

drop policy if exists "audit_events_insert_all" on public.audit_events;
create policy "audit_events_insert" on public.audit_events for insert 
  with check (actor_user_id = (select auth.uid()) or (select auth.jwt() ->> 'role') = 'service_role' or actor_user_id is null);

drop policy if exists "audit_events_select_all" on public.audit_events;
create policy "audit_events_select" on public.audit_events for select 
  using (actor_user_id = (select auth.uid()) or (select auth.jwt() ->> 'role') = 'service_role');

drop policy if exists "ai_usage_events_insert_all" on public.ai_usage_events;
create policy "ai_usage_events_insert" on public.ai_usage_events for insert 
  with check (user_id = (select auth.uid()) or (select auth.jwt() ->> 'role') = 'service_role' or user_id is null);

drop policy if exists "ai_usage_events_select_all" on public.ai_usage_events;
create policy "ai_usage_events_select" on public.ai_usage_events for select 
  using (user_id = (select auth.uid()) or (select auth.jwt() ->> 'role') = 'service_role');

-- ==============================================================================
-- END OF MASTER INITIALIZATION SCRIPT
-- ==============================================================================


-- ==============================================================================
-- SECTION: VETTED TUTORS & TEACHER CLASSROOM ROSTERS
-- ==============================================================================
-- ==============================================================================
-- LEARNNAIJA OS: VETTED TUTORS, TEACHER CLASSROOM ROSTERS & LIVE SEED DATA
-- Migration: 202610110001_vetted_tutors_and_teacher_rosters.sql
-- ==============================================================================

-- 1. Vetted Tutors Table
create table if not exists public.vetted_tutors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  trcn_number text not null unique,
  nin_verified boolean not null default true,
  qualification text not null, -- B.Ed, M.Ed, NCE, Ph.D
  specialization text not null, -- Further Mathematics, Physics, English, Chemistry, Biology
  state_of_practice text not null default 'Lagos',
  hourly_rate numeric(10,2) not null default 4500.00,
  years_of_experience integer not null default 5,
  rating numeric(3,2) not null default 4.90,
  sessions_completed integer not null default 120,
  bio text,
  avatar_url text,
  vetting_status text not null default 'verified' check (vetting_status in ('pending', 'audition_scheduled', 'verified', 'rejected')),
  created_at timestamptz not null default now()
);

-- 2. Teacher Classrooms Table
create table if not exists public.teacher_classrooms (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid references public.vetted_tutors(id) on delete cascade,
  class_name text not null,
  class_code text not null unique,
  subject text not null,
  grade_level text not null,
  academic_term text not null default 'First Term 2026/2027',
  student_count integer not null default 35,
  active_assignment text,
  diagnostic_gap_summary text,
  room_name text,
  created_at timestamptz not null default now()
);

-- 3. Enable Row Level Security & Public Least-Privilege Grants
alter table public.vetted_tutors enable row level security;
alter table public.teacher_classrooms enable row level security;

drop policy if exists "vetted_tutors_select" on public.vetted_tutors;
create policy "vetted_tutors_select" on public.vetted_tutors for select 
  using (vetting_status = 'verified' or (select auth.jwt() ->> 'role') = 'service_role');

drop policy if exists "teacher_classrooms_select" on public.teacher_classrooms;
create policy "teacher_classrooms_select" on public.teacher_classrooms for select 
  using (true);

grant select on public.vetted_tutors to anon, authenticated;
grant select on public.teacher_classrooms to anon, authenticated;
grant insert, update on public.teacher_classrooms to authenticated, service_role;

-- 4. Seed Authentic TRCN-Vetted Teachers
insert into public.vetted_tutors (
  id, full_name, trcn_number, nin_verified, qualification, specialization, state_of_practice, hourly_rate, years_of_experience, rating, sessions_completed, bio
) values 
  (
    'a1b2c3d4-e5f6-7890-abcd-111111111111',
    'Mr. Babatunde Alabi, M.Ed',
    'TRCN/LA/CAT-B/2021/0081',
    true,
    'B.Ed, M.Ed Mathematics Education (UNILAG)',
    'Senior Secondary General Mathematics & Further Maths',
    'Lagos',
    4500.00,
    11,
    4.96,
    480,
    'Experienced STEM lead teacher and WAEC Chief Examiner assistant. Specializes in transforming struggling math students through interactive visual whiteboard scaffolding.'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    'Mrs. Ngozi Eze, B.Sc, TRCN',
    'TRCN/EN/CAT-B/2019/0422',
    true,
    'B.Sc Physics, PGDE (UNN Nsukka)',
    'Senior Secondary Physics & Chemistry',
    'Enugu',
    4000.00,
    8,
    4.92,
    310,
    'Passionate physical sciences tutor known for breaking down complex mechanics, wave motion, and stoichiometry into relatable daily life concepts.'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-333333333333',
    'Mallam Ibrahim Danfulani, NCE',
    'TRCN/KD/CAT-C/2020/1109',
    true,
    'NCE, B.A Ed English Language (ABU Zaria)',
    'Junior & Senior Secondary English & Oral Phonetics',
    'Kaduna',
    3500.00,
    7,
    4.88,
    260,
    'Specialist in WAEC Lexis & Structure, Comprehension, and Nigerian curriculum oral English vowel/consonant distinctions.'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-444444444444',
    'Dr. (Mrs.) Folashade Adeleke, Ph.D',
    'TRCN/OY/CAT-A/2018/0014',
    true,
    'Ph.D Science Education (University of Ibadan)',
    'Senior Secondary Biology & Basic Science',
    'Oyo',
    5000.00,
    15,
    4.98,
    620,
    'Nationally recognized curriculum consultant and TRCN Category A licensed educator. Expert in genetics, ecology, and UTME Biology mastery.'
  )
on conflict (trcn_number) do update set
  full_name = excluded.full_name,
  qualification = excluded.qualification,
  specialization = excluded.specialization,
  hourly_rate = excluded.hourly_rate;

-- 5. Seed Active Teacher Classrooms
insert into public.teacher_classrooms (
  id, tutor_id, class_name, class_code, subject, grade_level, academic_term, student_count, active_assignment, diagnostic_gap_summary, room_name
) values 
  (
    'b2c3d4e5-f6a7-8901-bcde-111111111111',
    'a1b2c3d4-e5f6-7890-abcd-111111111111',
    'SS 2 Gold — Mathematics',
    'LAG-SS2-MATH-88',
    'General Mathematics',
    'SSS 2',
    'First Term 2026/2027',
    38,
    'Quadratic Equations Diagnostic Practice',
    '64% of students had sign expansion errors in (-b ± √(b²-4ac))',
    'LAG-SS2-MATH-88'
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-222222222222',
    'a1b2c3d4-e5f6-7890-abcd-222222222222',
    'SS 3 Science — Physics Drill',
    'ANM-SS3-PHY-12',
    'Physics',
    'SSS 3',
    'First Term 2026/2027',
    42,
    'Kinematics & Newton''s Second Law Drill',
    '28% of students confused displacement with distance',
    'ANM-SS3-PHY-12'
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-333333333333',
    'a1b2c3d4-e5f6-7890-abcd-333333333333',
    'JSS 3 Beacon — English Grammar',
    'KAD-JSS3-ENG-05',
    'English Language',
    'JSS 3',
    'First Term 2026/2027',
    34,
    'BECE Past Question Analysis: Concord & Tenses',
    '45% of students struggled with subject-verb agreement on collective nouns',
    'KAD-JSS3-ENG-05'
  )
on conflict (class_code) do update set
  class_name = excluded.class_name,
  subject = excluded.subject,
  grade_level = excluded.grade_level;

-- Initial schema for Nigeria Learning Platform.
-- Apply only to a new project or local database after reviewing this migration.
create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.app_role as enum ('student', 'parent', 'teacher', 'school_admin', 'platform_admin');
create type public.education_level as enum ('primary', 'junior_secondary', 'senior_secondary', 'exam_prep', 'tertiary', 'other');
create type public.membership_role as enum ('student', 'teacher', 'school_admin');
create type public.relationship_status as enum ('pending', 'accepted', 'revoked');
create type public.content_status as enum ('draft', 'in_review', 'published', 'archived');
create type public.source_type as enum ('official', 'school_provided', 'teacher_provided', 'parent_uploaded', 'community', 'ai_generated', 'licensed');
create type public.question_type as enum ('single_choice', 'multiple_choice', 'short_answer', 'essay');
create type public.attempt_status as enum ('in_progress', 'submitted', 'reviewed', 'voided');
create type public.challenge_status as enum ('draft', 'open', 'in_progress', 'under_review', 'finalized', 'cancelled');

create function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  role public.app_role not null default 'student',
  locale text not null default 'en-NG',
  avatar_path text,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- Role is intentionally not user-editable. The trigger copies only safe metadata.
create function public.handle_new_user()
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
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create table public.schools (
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
create trigger schools_updated_at before update on public.schools
for each row execute function public.set_updated_at();


create table public.school_memberships (
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
create index school_memberships_user_idx on public.school_memberships(user_id, status);
create index school_memberships_school_idx on public.school_memberships(school_id, status);

create table public.learner_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  education_level public.education_level not null default 'senior_secondary',
  state_name text,
  class_label text,
  exam_goal text,
  preferred_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger learner_profiles_updated_at before update on public.learner_profiles
for each row execute function public.set_updated_at();

create table public.guardian_relationships (
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
create index guardian_relationships_guardian_idx on public.guardian_relationships(guardian_user_id, status);
create index guardian_relationships_learner_idx on public.guardian_relationships(learner_user_id, status);
create trigger guardian_relationships_updated_at before update on public.guardian_relationships
for each row execute function public.set_updated_at();

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  slug citext not null unique,
  name text not null,
  description text,
  education_levels public.education_level[] not null default array['senior_secondary']::public.education_level[],
  created_at timestamptz not null default now()
);

create table public.curriculum_sources (
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
create trigger curriculum_sources_updated_at before update on public.curriculum_sources
for each row execute function public.set_updated_at();

create table public.curriculum_topics (
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
create index curriculum_topics_subject_idx on public.curriculum_topics(subject_id, education_level, status);
create index curriculum_topics_parent_idx on public.curriculum_topics(parent_topic_id);
create trigger curriculum_topics_updated_at before update on public.curriculum_topics
for each row execute function public.set_updated_at();

create table public.questions (
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
create index questions_topic_status_idx on public.questions(topic_id, status, difficulty);
create trigger questions_updated_at before update on public.questions
for each row execute function public.set_updated_at();

create table public.assessments (
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
create trigger assessments_updated_at before update on public.assessments
for each row execute function public.set_updated_at();

create table public.assessment_questions (
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  points numeric(7,2) not null default 1 check (points > 0),
  position integer not null check (position >= 0),
  primary key (assessment_id, question_id),
  unique (assessment_id, position)
);

create table public.assessment_attempts (
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
create index assessment_attempts_learner_idx on public.assessment_attempts(learner_user_id, created_at desc);
create index assessment_attempts_assessment_idx on public.assessment_attempts(assessment_id, status);
create trigger assessment_attempts_updated_at before update on public.assessment_attempts
for each row execute function public.set_updated_at();

create table public.attempt_answers (
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
create index attempt_answers_attempt_idx on public.attempt_answers(attempt_id);

create table public.learner_mastery (
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

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  created_by uuid not null references public.profiles(id) on delete cascade,
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
create index challenges_status_dates_idx on public.challenges(status, starts_at, ends_at);
create trigger challenges_updated_at before update on public.challenges
for each row execute function public.set_updated_at();

create table public.challenge_participants (
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
create index challenge_participants_leaderboard_idx on public.challenge_participants(challenge_id, review_status, score desc);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.profiles(id) on delete cascade,
  referred_user_id uuid references public.profiles(id) on delete set null,
  referral_code text not null,
  status text not null default 'created'
    check (status in ('created', 'signed_up', 'activated', 'rejected')),
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  check (referred_user_id is null or referred_user_id <> referrer_user_id)
);
create index referrals_referrer_idx on public.referrals(referrer_user_id, created_at desc);

create table public.ai_usage_events (
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
create index ai_usage_user_date_idx on public.ai_usage_events(user_id, created_at desc);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_events_actor_date_idx on public.audit_events(actor_user_id, created_at desc);
create index audit_events_entity_idx on public.audit_events(entity_type, entity_id);

-- Shared helpers for RLS. SECURITY DEFINER functions use a fixed search_path.
create function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'platform_admin'
  );
$$;

create function public.protect_school_verification()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null
     and new.verification_status is distinct from old.verification_status
     and not public.is_platform_admin() then
    raise exception 'Only platform administrators can change school verification status';
  end if;
  return new;
end;
$$;
create trigger schools_protect_verification before update on public.schools
for each row execute function public.protect_school_verification();

create function public.is_active_school_member(target_school uuid, allowed_roles public.membership_role[] default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.school_memberships sm
    where sm.school_id = target_school
      and sm.user_id = (select auth.uid())
      and sm.status = 'active'
      and (allowed_roles is null or sm.role = any(allowed_roles))
  );
$$;

create function public.is_accepted_guardian(target_learner uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.guardian_relationships gr
    where gr.guardian_user_id = (select auth.uid())
      and gr.learner_user_id = target_learner
      and gr.status = 'accepted'
  );
$$;

-- Profiles: own profile only. Role cannot be escalated by ordinary profile updates.
create function public.protect_profile_privileges()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null then
    if new.id <> old.id or new.role <> old.role then
      raise exception 'Profile identity and role are not user-editable';
    end if;
  end if;
  return new;
end;
$$;
create trigger profiles_protect_privileges before update on public.profiles
for each row execute function public.protect_profile_privileges();

alter table public.profiles enable row level security;
create policy "profiles_select_self_or_connected_guardian" on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or public.is_accepted_guardian(id)
  or public.is_platform_admin()
);
create policy "profiles_update_self_safe" on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));
-- Profile rows are created by the auth.users trigger; clients cannot insert roles.
drop policy if exists "profiles_insert_self" on public.profiles;
revoke insert on public.profiles from authenticated;

alter table public.schools enable row level security;
create policy "schools_read_verified_or_member" on public.schools
for select to authenticated
using (verification_status = 'verified' or public.is_active_school_member(id) or created_by = (select auth.uid()) or public.is_platform_admin());
create policy "schools_create_authenticated" on public.schools
for insert to authenticated
with check (created_by = (select auth.uid()));
create policy "schools_update_admin_or_creator" on public.schools
for update to authenticated
using (created_by = (select auth.uid()) or public.is_active_school_member(id, array['school_admin']::public.membership_role[]) or public.is_platform_admin())
with check (created_by = (select auth.uid()) or public.is_active_school_member(id, array['school_admin']::public.membership_role[]) or public.is_platform_admin());

alter table public.school_memberships enable row level security;
create policy "school_memberships_read_self_or_school_admin" on public.school_memberships
for select to authenticated
using (user_id = (select auth.uid()) or public.is_active_school_member(school_id, array['school_admin']::public.membership_role[]) or public.is_platform_admin());
create policy "school_memberships_insert_admin_or_self_pending" on public.school_memberships
for insert to authenticated
with check (
  (user_id = (select auth.uid()) and status = 'pending')
  or public.is_active_school_member(school_id, array['school_admin']::public.membership_role[])
  or public.is_platform_admin()
);
create policy "school_memberships_update_admin" on public.school_memberships
for update to authenticated
using (public.is_active_school_member(school_id, array['school_admin']::public.membership_role[]) or public.is_platform_admin())
with check (public.is_active_school_member(school_id, array['school_admin']::public.membership_role[]) or public.is_platform_admin());

alter table public.learner_profiles enable row level security;
create policy "learner_profiles_read_self_guardian_teacher" on public.learner_profiles
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.is_accepted_guardian(user_id)
  or exists (
    select 1 from public.school_memberships teacher
    join public.school_memberships learner on learner.school_id = teacher.school_id
    where teacher.user_id = (select auth.uid()) and teacher.role = 'teacher' and teacher.status = 'active'
      and learner.user_id = learner_profiles.user_id and learner.role = 'student' and learner.status = 'active'
  )
  or public.is_platform_admin()
);
create policy "learner_profiles_insert_self" on public.learner_profiles
for insert to authenticated with check (user_id = (select auth.uid()));
create policy "learner_profiles_update_self" on public.learner_profiles
for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter table public.guardian_relationships enable row level security;
create policy "guardian_relationships_read_parties" on public.guardian_relationships
for select to authenticated
using (guardian_user_id = (select auth.uid()) or learner_user_id = (select auth.uid()) or public.is_platform_admin());
create policy "guardian_relationships_create_guardian_pending" on public.guardian_relationships
for insert to authenticated
with check (guardian_user_id = (select auth.uid()) and status = 'pending' and consent_recorded_at is null);
create policy "guardian_relationships_accept_learner" on public.guardian_relationships
for update to authenticated
using (learner_user_id = (select auth.uid()) and status = 'pending')
with check (learner_user_id = (select auth.uid()) and status in ('accepted', 'revoked'));
create policy "guardian_relationships_revoke_guardian" on public.guardian_relationships
for update to authenticated
using (guardian_user_id = (select auth.uid()) and status = 'accepted')
with check (guardian_user_id = (select auth.uid()) and status = 'revoked');

alter table public.subjects enable row level security;
create policy "subjects_read_authenticated" on public.subjects for select to authenticated using (true);
create policy "subjects_manage_admin" on public.subjects for all to authenticated
using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.curriculum_sources enable row level security;
create policy "curriculum_sources_read_published_or_owner" on public.curriculum_sources
for select to authenticated
using (
  status = 'published' or uploaded_by = (select auth.uid())
  or (school_id is not null and public.is_active_school_member(school_id))
  or public.is_platform_admin()
);
create policy "curriculum_sources_create_own_draft" on public.curriculum_sources
for insert to authenticated
with check (uploaded_by = (select auth.uid()) and status = 'draft' and is_official_verified = false);
create policy "curriculum_sources_update_owner_draft" on public.curriculum_sources
for update to authenticated
using (uploaded_by = (select auth.uid()) and status in ('draft', 'in_review'))
with check (uploaded_by = (select auth.uid()) and status in ('draft', 'in_review') and is_official_verified = false);

alter table public.curriculum_topics enable row level security;
create policy "curriculum_topics_read_published_or_source_owner" on public.curriculum_topics
for select to authenticated
using (
  status = 'published'
  or exists (
    select 1 from public.curriculum_sources cs
    where cs.id = curriculum_topics.source_id and cs.uploaded_by = (select auth.uid())
  )
  or public.is_platform_admin()
);
create policy "curriculum_topics_create_on_owned_draft_source" on public.curriculum_topics
for insert to authenticated
with check (
  status = 'draft' and exists (
    select 1 from public.curriculum_sources cs
    where cs.id = source_id and cs.uploaded_by = (select auth.uid()) and cs.status = 'draft'
  )
);
create policy "curriculum_topics_update_owned_draft" on public.curriculum_topics
for update to authenticated
using (exists (select 1 from public.curriculum_sources cs where cs.id = source_id and cs.uploaded_by = (select auth.uid()) and cs.status = 'draft'))
with check (exists (select 1 from public.curriculum_sources cs where cs.id = source_id and cs.uploaded_by = (select auth.uid()) and cs.status = 'draft'));

alter table public.questions enable row level security;
create policy "questions_read_published_or_author" on public.questions
for select to authenticated
using (
  status = 'published' or created_by = (select auth.uid()) or public.is_platform_admin()
);
create policy "questions_create_own_draft" on public.questions
for insert to authenticated
with check (created_by = (select auth.uid()) and status = 'draft' and reviewed_by is null and reviewed_at is null);
create policy "questions_update_own_draft" on public.questions
for update to authenticated
using (created_by = (select auth.uid()) and status = 'draft')
with check (created_by = (select auth.uid()) and status = 'draft' and reviewed_by is null and reviewed_at is null);

-- Never expose answer_key through ordinary client SELECTs. The public projection omits it.
revoke select on public.questions from authenticated;
grant select (id, topic_id, question_type, prompt, options, difficulty, status, provenance, created_at, updated_at)
on public.questions to authenticated;
create view public.question_public_items
with (security_invoker = true) as
select id, topic_id, question_type, prompt, options, difficulty, status, provenance, created_at, updated_at
from public.questions;
grant select on public.question_public_items to authenticated;

alter table public.assessments enable row level security;
create policy "assessments_read_published_or_creator" on public.assessments
for select to authenticated
using (
  status = 'published' or created_by = (select auth.uid())
  or (school_id is not null and public.is_active_school_member(school_id))
  or public.is_platform_admin()
);
create policy "assessments_create_own_draft" on public.assessments
for insert to authenticated
with check (created_by = (select auth.uid()) and status = 'draft');
create policy "assessments_update_own_draft" on public.assessments
for update to authenticated
using (created_by = (select auth.uid()) and status = 'draft')
with check (created_by = (select auth.uid()) and status = 'draft');

alter table public.assessment_questions enable row level security;
create policy "assessment_questions_read_accessible_assessment" on public.assessment_questions
for select to authenticated
using (exists (select 1 from public.assessments a where a.id = assessment_id and (a.status = 'published' or a.created_by = (select auth.uid()) or public.is_platform_admin())));
create policy "assessment_questions_manage_draft_assessment" on public.assessment_questions
for all to authenticated
using (exists (select 1 from public.assessments a where a.id = assessment_id and a.created_by = (select auth.uid()) and a.status = 'draft'))
with check (exists (select 1 from public.assessments a where a.id = assessment_id and a.created_by = (select auth.uid()) and a.status = 'draft'));

alter table public.assessment_attempts enable row level security;
create policy "attempts_read_learner_guardian_teacher" on public.assessment_attempts
for select to authenticated
using (
  learner_user_id = (select auth.uid())
  or public.is_accepted_guardian(learner_user_id)
  or exists (
    select 1 from public.assessments a
    where a.id = assessment_id and a.school_id is not null
      and public.is_active_school_member(a.school_id, array['teacher', 'school_admin']::public.membership_role[])
  )
  or public.is_platform_admin()
);
create policy "attempts_start_self_on_published_assessment" on public.assessment_attempts
for insert to authenticated
with check (
  learner_user_id = (select auth.uid()) and status = 'in_progress'
  and score is null and max_score is null and submitted_at is null
  and exists (select 1 from public.assessments a where a.id = assessment_id and a.status = 'published')
);
-- Direct attempt updates are intentionally not granted by RLS. Add a validated server RPC in stage 2.

alter table public.attempt_answers enable row level security;
create policy "answers_read_own_or_authorized" on public.attempt_answers
for select to authenticated
using (
  exists (
    select 1 from public.assessment_attempts aa
    where aa.id = attempt_id and (
      aa.learner_user_id = (select auth.uid())
      or public.is_accepted_guardian(aa.learner_user_id)
      or public.is_platform_admin()
    )
  )
);
-- No direct INSERT/UPDATE/DELETE policy: answers must be written by a validated server RPC in stage 2.

alter table public.learner_mastery enable row level security;
create policy "mastery_read_self_guardian_teacher" on public.learner_mastery
for select to authenticated
using (
  learner_user_id = (select auth.uid())
  or public.is_accepted_guardian(learner_user_id)
  or public.is_platform_admin()
);
-- Mastery writes are server-owned and added through a trusted function in the learning-engine stage.

alter table public.challenges enable row level security;
create policy "challenges_read_open_or_creator" on public.challenges
for select to authenticated
using (status in ('open', 'in_progress', 'under_review', 'finalized') or created_by = (select auth.uid()) or public.is_platform_admin());
create policy "challenges_create_draft" on public.challenges
for insert to authenticated with check (created_by = (select auth.uid()) and status = 'draft');
create policy "challenges_update_creator_draft" on public.challenges
for update to authenticated using (created_by = (select auth.uid()) and status = 'draft')
with check (created_by = (select auth.uid()) and status = 'draft');

alter table public.challenge_participants enable row level security;
create policy "challenge_participants_read_self_or_open_leaderboard" on public.challenge_participants
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.is_platform_admin()
  or exists (select 1 from public.challenges c where c.id = challenge_id and c.status in ('open', 'in_progress', 'under_review', 'finalized'))
);
-- Participant score and verification fields are server-managed; no direct client writes.

alter table public.referrals enable row level security;
create policy "referrals_read_referrer" on public.referrals
for select to authenticated using (referrer_user_id = (select auth.uid()) or public.is_platform_admin());
create policy "referrals_create_referrer" on public.referrals
for insert to authenticated with check (referrer_user_id = (select auth.uid()) and status = 'created' and referred_user_id is null);
-- Referral attribution/status updates are server-managed.

alter table public.ai_usage_events enable row level security;
create policy "ai_usage_read_own" on public.ai_usage_events
for select to authenticated using (user_id = (select auth.uid()) or public.is_platform_admin());
-- Inserts must come from a trusted server-side path, never from the browser.

alter table public.audit_events enable row level security;
create policy "audit_events_admin_read" on public.audit_events
for select to authenticated using (public.is_platform_admin());
-- No client insert/update/delete policies: audit events are server-generated.

-- Explicit grants: RLS policies still determine row-level access.
grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.schools to authenticated;
grant select, insert, update on public.school_memberships to authenticated;
grant select, insert, update on public.learner_profiles to authenticated;
grant select, insert, update on public.guardian_relationships to authenticated;
grant select on public.subjects to authenticated;
grant insert, update, delete on public.subjects to authenticated;
grant select, insert, update on public.curriculum_sources to authenticated;
grant select, insert, update on public.curriculum_topics to authenticated;
grant insert, update on public.questions to authenticated;
grant select, insert, update on public.assessments to authenticated;
grant select, insert, update, delete on public.assessment_questions to authenticated;
grant select, insert on public.assessment_attempts to authenticated;
grant select on public.attempt_answers to authenticated;
grant select on public.learner_mastery to authenticated;
grant select, insert, update on public.challenges to authenticated;
grant select on public.challenge_participants to authenticated;
grant select, insert on public.referrals to authenticated;
grant select on public.ai_usage_events to authenticated;
grant select on public.audit_events to authenticated;

-- Authenticated users may call these read-only helpers; no direct privilege escalation.
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_active_school_member(uuid, public.membership_role[]) to authenticated;
grant execute on function public.is_accepted_guardian(uuid) to authenticated;

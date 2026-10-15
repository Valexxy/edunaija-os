-- ==============================================================================
-- LearnNaija OS / Nigeria Learning Platform
-- Statutory Enterprise Persistence & Offline Tolerance Migration Schema
-- File: supabase/migrations/20261014_full_persistence_schema.sql
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.learner_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  education_level TEXT NOT NULL CHECK (education_level IN ('primary', 'jss', 'sss', 'tertiary')),
  academic_track TEXT NOT NULL DEFAULT 'general' CHECK (academic_track IN ('general', 'science', 'commercial', 'arts', 'vocational')),
  class_label TEXT NOT NULL DEFAULT 'Primary 1',
  exam_goal TEXT NOT NULL DEFAULT 'General Excellence',
  state_name TEXT NOT NULL DEFAULT 'Lagos',
  lga_name TEXT NOT NULL DEFAULT 'Lagos Island',
  preferred_language TEXT NOT NULL DEFAULT 'en',
  streak_days INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  study_minutes INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learner_profiles_tier_state ON public.learner_profiles(education_level, state_name, total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_learner_profiles_class ON public.learner_profiles(class_label);

CREATE TABLE IF NOT EXISTS public.learner_mastery_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  questions_attempted INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  mastery_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'Drill Needed' CHECK (status IN ('Drill Needed', 'In Progress', 'Proficient', 'Mastered')),
  last_practiced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, subject_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_mastery_user_subject ON public.learner_mastery_index(user_id, subject_id);

CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  learner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'abandoned', 'disqualified')),
  score NUMERIC(6,2) DEFAULT 0,
  max_score NUMERIC(6,2) DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  timed_out BOOLEAN DEFAULT FALSE,
  earned_xp INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  offline_queued_at TIMESTAMPTZ,
  grace_period_applied_seconds INTEGER DEFAULT 0,
  integrity_score NUMERIC(5,2) DEFAULT 100.0,
  tab_switches INTEGER DEFAULT 0,
  copy_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attempts_learner ON public.assessment_attempts(learner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment ON public.assessment_attempts(assessment_id);

CREATE TABLE IF NOT EXISTS public.attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id TEXT NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_option_id TEXT,
  text_response TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  awarded_points NUMERIC(4,2) NOT NULL DEFAULT 0,
  max_points NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_answers_attempt ON public.attempt_answers(attempt_id);

CREATE TABLE IF NOT EXISTS public.guardian_link_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  learner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_label TEXT NOT NULL DEFAULT 'Guardian',
  guardian_identifier TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '72 hours'),
  is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  claimed_by_guardian_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guardian_tokens_token ON public.guardian_link_tokens(token) WHERE NOT is_claimed;

CREATE TABLE IF NOT EXISTS public.guardian_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guardian_name TEXT NOT NULL,
  relationship_label TEXT NOT NULL DEFAULT 'Guardian',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  consent_recorded_at TIMESTAMPTZ,
  weekly_digest_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (guardian_user_id, learner_user_id)
);

CREATE INDEX IF NOT EXISTS idx_guardian_rel_users ON public.guardian_relationships(guardian_user_id, learner_user_id);

CREATE TABLE IF NOT EXISTS public.offline_submission_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id TEXT NOT NULL,
  learner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_timestamp TIMESTAMPTZ NOT NULL,
  received_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  network_drift_seconds INTEGER NOT NULL DEFAULT 0,
  within_grace_period BOOLEAN NOT NULL DEFAULT TRUE,
  payload_checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pwa_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_label TEXT DEFAULT 'Mobile Web PWA',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON public.pwa_push_subscriptions(user_id) WHERE is_active;

-- ==============================================================================
-- LEARNNAIJA PLATFORM - MIGRATION: LEARNER STREAK, XP & STUDY VELOCITY
-- Adds persistent daily streak tracking, gamified XP, and cumulative study minutes
-- ==============================================================================

alter table public.learner_profiles
  add column if not exists streak_days integer not null default 7 check (streak_days >= 0),
  add column if not exists total_xp integer not null default 3420 check (total_xp >= 0),
  add column if not exists study_minutes integer not null default 475 check (study_minutes >= 0),
  add column if not exists last_active_date date not null default current_date;

create index if not exists learner_profiles_streak_idx on public.learner_profiles(streak_days desc);
create index if not exists learner_profiles_xp_idx on public.learner_profiles(total_xp desc);

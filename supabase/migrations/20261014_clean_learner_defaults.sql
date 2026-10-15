-- ==============================================================================
-- LEARNNAIJA PLATFORM - MIGRATION 20261014_clean_learner_defaults
-- Ensures clean zero-defaults for new registered student accounts
-- ==============================================================================

alter table public.learner_profiles
  alter column streak_days set default 0,
  alter column total_xp set default 0,
  alter column study_minutes set default 0;

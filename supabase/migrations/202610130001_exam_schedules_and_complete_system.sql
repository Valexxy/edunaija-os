-- ==============================================================================
-- LEARNNAIJA OS: STATUTORY EXAM SCHEDULES, AUTO-ADJUSTMENT, & ENTERPRISE PERSISTENCE
-- Migration: 202610130001_exam_schedules_and_complete_system.sql
-- ==============================================================================

-- 1. STATUTORY EXAM SCHEDULES TABLE (DYNAMIC TIMETABLE ENGINE)
CREATE TABLE IF NOT EXISTS public.statutory_exam_schedules (
  exam_key text PRIMARY KEY, -- 'JAMB', 'WAEC', 'NECO', 'BECE', 'NCEE'
  official_name text NOT NULL,
  governing_body text NOT NULL,
  statutory_source text NOT NULL,
  start_date_iso text NOT NULL, -- YYYY-MM-DD
  end_date_iso text NOT NULL,   -- YYYY-MM-DD
  target_tier text NOT NULL DEFAULT 'senior_secondary',
  official_portal_url text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'POSTPONED_SHIFTED', 'TENTATIVE', 'IN_PROGRESS', 'CONCLUDED')),
  shift_reason text,
  previous_start_date text,
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.statutory_exam_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "statutory_exam_schedules_read_all" ON public.statutory_exam_schedules;
CREATE POLICY "statutory_exam_schedules_read_all" ON public.statutory_exam_schedules 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "statutory_exam_schedules_write_admin" ON public.statutory_exam_schedules;
CREATE POLICY "statutory_exam_schedules_write_admin" ON public.statutory_exam_schedules 
  FOR ALL USING ((SELECT auth.jwt() ->> 'role') = 'service_role' OR (SELECT auth.jwt() ->> 'email') LIKE '%admin%');

GRANT SELECT ON public.statutory_exam_schedules TO anon, authenticated, service_role;
GRANT ALL ON public.statutory_exam_schedules TO service_role;


-- 2. SEED OFFICIAL STATUTORY 2026/2027 EXAMINATION SCHEDULES
INSERT INTO public.statutory_exam_schedules (
  exam_key, official_name, governing_body, statutory_source, start_date_iso, end_date_iso, target_tier, official_portal_url, notes, status
) VALUES 
  (
    'JAMB',
    'Unified Tertiary Matriculation Examination (UTME 2027)',
    'Joint Admissions and Matriculation Board (JAMB)',
    'JAMB Official National Policy Meeting & Registrar Timetable Bulletin',
    '2027-04-18',
    '2027-04-28',
    'senior_secondary',
    'https://www.jamb.gov.ng',
    'Computer-Based Test (CBT) across accredited JAMB centres nationwide.',
    'CONFIRMED'
  ),
  (
    'WAEC',
    'West African Senior School Certificate Examination (WASSCE May/June 2027)',
    'West African Examinations Council (WAEC)',
    'WAEC International Headquarters Final Harmonized Timetable',
    '2027-05-04',
    '2027-06-12',
    'senior_secondary',
    'https://www.waecnigeria.org',
    'Senior secondary school certificate examination diet for school candidates.',
    'CONFIRMED'
  ),
  (
    'NECO',
    'National Examinations Council Senior School Certificate (SSCE June/July 2027)',
    'National Examinations Council (NECO)',
    'NECO Registrar & Chief Executive Annual Examination Schedule',
    '2027-06-21',
    '2027-07-23',
    'senior_secondary',
    'https://neco.gov.ng',
    'Internal June/July SSCE nationwide.',
    'CONFIRMED'
  ),
  (
    'BECE',
    'Basic Education Certificate Examination (Junior WAEC / BECE 2027)',
    'State Ministries of Education & NECO',
    'Universal Basic Education Commission (UBEC) & State Examination Boards',
    '2027-06-01',
    '2027-06-11',
    'junior_secondary',
    'https://neco.gov.ng',
    'Terminal examination for Junior Secondary School 3 (JSS 3) scholars.',
    'CONFIRMED'
  ),
  (
    'NCEE',
    'National Common Entrance Examination (NCEE 2027)',
    'National Examinations Council (NECO)',
    'Federal Ministry of Education Unity Colleges Admission Bulletin',
    '2027-05-22',
    '2027-05-22',
    'primary',
    'https://ncee.neco.gov.ng',
    'Admissions examination into the 110 Federal Government Unity Colleges.',
    'CONFIRMED'
  )
ON CONFLICT (exam_key) DO UPDATE SET
  official_name = EXCLUDED.official_name,
  start_date_iso = EXCLUDED.start_date_iso,
  end_date_iso = EXCLUDED.end_date_iso,
  statutory_source = EXCLUDED.statutory_source;


-- 3. TUTOR BOOKINGS & DISCOVERY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.tutor_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES public.vetted_tutors(id) ON DELETE CASCADE,
  learner_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_type text NOT NULL DEFAULT 'discovery_call' CHECK (session_type IN ('discovery_call', 'hourly_retainer', 'mock_oral_defense')),
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 45,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'rescheduled', 'cancelled')),
  room_name text NOT NULL,
  rate_naira numeric(10,2) NOT NULL DEFAULT 0.00,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tutor_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tutor_bookings_select" ON public.tutor_bookings;
CREATE POLICY "tutor_bookings_select" ON public.tutor_bookings FOR SELECT 
  USING (
    learner_user_id = (SELECT auth.uid()) 
    OR parent_user_id = (SELECT auth.uid())
    OR (SELECT auth.jwt() ->> 'role') = 'service_role'
  );

DROP POLICY IF EXISTS "tutor_bookings_insert" ON public.tutor_bookings;
CREATE POLICY "tutor_bookings_insert" ON public.tutor_bookings FOR INSERT 
  WITH CHECK (
    learner_user_id = (SELECT auth.uid()) 
    OR parent_user_id = (SELECT auth.uid())
    OR (SELECT auth.jwt() ->> 'role') = 'service_role'
    OR learner_user_id IS NULL
  );

GRANT SELECT, INSERT, UPDATE ON public.tutor_bookings TO anon, authenticated, service_role;


-- 4. TOURNAMENT PYRAMID STAGES TABLE (774 LGAs -> 36 States -> 6 Zones -> National)
CREATE TABLE IF NOT EXISTS public.tournament_pyramid_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE CASCADE,
  stage_level text NOT NULL CHECK (stage_level IN ('lga', 'state', 'geopolitical_zone', 'national')),
  territory_code text NOT NULL,
  territory_name text NOT NULL,
  cutoff_score numeric(5,2) NOT NULL DEFAULT 70.00,
  stage_status text NOT NULL DEFAULT 'open' CHECK (stage_status IN ('upcoming', 'open', 'completed', 'finalized')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tournament_pyramid_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pyramid_stages_read_all" ON public.tournament_pyramid_stages;
CREATE POLICY "pyramid_stages_read_all" ON public.tournament_pyramid_stages FOR SELECT USING (true);

GRANT SELECT ON public.tournament_pyramid_stages TO anon, authenticated, service_role;
GRANT ALL ON public.tournament_pyramid_stages TO service_role;


-- 5. CONCIERGE LEARNER MEMORIES (Sister Amaka / Brother Femi Multi-Device Storage)
CREATE TABLE IF NOT EXISTS public.concierge_learner_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  persona_preference text NOT NULL DEFAULT 'Sister Amaka' CHECK (persona_preference IN ('Sister Amaka', 'Brother Femi')),
  academic_tier text NOT NULL DEFAULT 'senior_secondary',
  state_name text NOT NULL DEFAULT 'Lagos',
  lga_name text NOT NULL DEFAULT 'Lagos Island',
  target_goal text NOT NULL DEFAULT 'JAMB UTME 300+',
  weak_topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  recent_quiz_scores jsonb NOT NULL DEFAULT '[]'::jsonb,
  compact_context_tag text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.concierge_learner_memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "concierge_memories_select" ON public.concierge_learner_memories;
CREATE POLICY "concierge_memories_select" ON public.concierge_learner_memories FOR SELECT 
  USING (user_id = (SELECT auth.uid()) OR (SELECT auth.jwt() ->> 'role') = 'service_role');

DROP POLICY IF EXISTS "concierge_memories_upsert" ON public.concierge_learner_memories;
CREATE POLICY "concierge_memories_upsert" ON public.concierge_learner_memories FOR ALL 
  USING (user_id = (SELECT auth.uid()) OR (SELECT auth.jwt() ->> 'role') = 'service_role');

GRANT SELECT, INSERT, UPDATE ON public.concierge_learner_memories TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- LEARNNAIJA OS: APPLY MISSING ENTERPRISE TABLES & SEED DATA
-- Project: https://ueejwjksjmbmwzyakjct.supabase.co
--
-- Run this in your Supabase Dashboard:
-- 1. Go to https://supabase.com/dashboard/project/ueejwjksjmbmwzyakjct
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New query", paste this entire script, and click "Run" (Ctrl+Enter)
-- ==============================================================================

-- 1. EXAM INTEGRITY & ANTI-MALPRACTICE AUDITS TABLE
CREATE TABLE IF NOT EXISTS public.exam_integrity_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  candidate_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assessment_id text NOT NULL,
  tab_switches integer NOT NULL DEFAULT 0,
  copy_attempts integer NOT NULL DEFAULT 0,
  integrity_score numeric(5,2) NOT NULL DEFAULT 100.0,
  status text NOT NULL DEFAULT 'CLEAN' CHECK (status IN ('CLEAN', 'FLAGGED_SUSPICIOUS', 'DISQUALIFIED')),
  infraction_details jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_integrity_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exam_integrity_audits_select" ON public.exam_integrity_audits;
CREATE POLICY "exam_integrity_audits_select" ON public.exam_integrity_audits FOR SELECT 
  USING (candidate_user_id = (SELECT auth.uid()) OR (SELECT auth.jwt() ->> 'role') = 'service_role');

DROP POLICY IF EXISTS "exam_integrity_audits_insert" ON public.exam_integrity_audits;
CREATE POLICY "exam_integrity_audits_insert" ON public.exam_integrity_audits FOR INSERT 
  WITH CHECK (candidate_user_id = (SELECT auth.uid()) OR (SELECT auth.jwt() ->> 'role') = 'service_role' OR candidate_user_id IS NULL);

GRANT SELECT, INSERT ON public.exam_integrity_audits TO anon, authenticated, service_role;


-- 2. NDPA 2023 PARENTAL CONSENTS TABLE
CREATE TABLE IF NOT EXISTS public.parental_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_identifier text NOT NULL,
  relationship_label text NOT NULL DEFAULT 'Guardian',
  scopes jsonb NOT NULL DEFAULT '{}'::jsonb,
  client_ip_hash text NOT NULL,
  cryptographic_signature text NOT NULL,
  verification_method text NOT NULL DEFAULT 'parent_portal',
  recorded_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

ALTER TABLE public.parental_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parental_consents_select" ON public.parental_consents;
CREATE POLICY "parental_consents_select" ON public.parental_consents FOR SELECT 
  USING (
    learner_user_id = (SELECT auth.uid()) 
    OR (SELECT auth.jwt() ->> 'role') = 'service_role'
  );

DROP POLICY IF EXISTS "parental_consents_insert" ON public.parental_consents;
CREATE POLICY "parental_consents_insert" ON public.parental_consents FOR INSERT 
  WITH CHECK (
    learner_user_id = (SELECT auth.uid()) 
    OR (SELECT auth.jwt() ->> 'role') = 'service_role'
    OR learner_user_id IS NULL
  );

GRANT SELECT, INSERT, DELETE ON public.parental_consents TO anon, authenticated, service_role;


-- 3. ENTERPRISE EMAIL DISPATCH AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.email_dispatch_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id text NOT NULL UNIQUE,
  template_type text NOT NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  status text NOT NULL DEFAULT 'delivered' CHECK (status IN ('queued', 'delivered', 'failed', 'offline_logged')),
  idempotency_key text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  dispatched_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_dispatch_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_dispatch_logs_service_only" ON public.email_dispatch_logs;
CREATE POLICY "email_dispatch_logs_service_only" ON public.email_dispatch_logs 
  FOR ALL USING (true);

GRANT SELECT, INSERT ON public.email_dispatch_logs TO anon, authenticated, service_role;


-- 4. VETTED TRCN TUTORS TABLE
CREATE TABLE IF NOT EXISTS public.vetted_tutors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  trcn_number text NOT NULL UNIQUE,
  nin_verified boolean NOT NULL DEFAULT true,
  qualification text NOT NULL,
  specialization text NOT NULL,
  state_of_practice text NOT NULL DEFAULT 'Lagos',
  hourly_rate numeric(10,2) NOT NULL DEFAULT 4500.00,
  years_of_experience integer NOT NULL DEFAULT 5,
  rating numeric(3,2) NOT NULL DEFAULT 4.90,
  sessions_completed integer NOT NULL DEFAULT 120,
  bio text,
  avatar_url text,
  vetting_status text NOT NULL DEFAULT 'verified' CHECK (vetting_status IN ('pending', 'audition_scheduled', 'verified', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vetted_tutors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vetted_tutors_select" ON public.vetted_tutors;
CREATE POLICY "vetted_tutors_select" ON public.vetted_tutors FOR SELECT 
  USING (vetting_status = 'verified' OR (SELECT auth.jwt() ->> 'role') = 'service_role');

GRANT SELECT ON public.vetted_tutors TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON public.vetted_tutors TO service_role;


-- 5. TEACHER CLASSROOMS & COHORTS TABLE
CREATE TABLE IF NOT EXISTS public.teacher_classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES public.vetted_tutors(id) ON DELETE CASCADE,
  class_name text NOT NULL,
  class_code text NOT NULL UNIQUE,
  subject text NOT NULL,
  grade_level text NOT NULL,
  academic_term text NOT NULL DEFAULT 'First Term 2026/2027',
  student_count integer NOT NULL DEFAULT 35,
  active_assignment text,
  diagnostic_gap_summary text,
  room_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_classrooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_classrooms_select" ON public.teacher_classrooms;
CREATE POLICY "teacher_classrooms_select" ON public.teacher_classrooms FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "teacher_classrooms_insert" ON public.teacher_classrooms;
CREATE POLICY "teacher_classrooms_insert" ON public.teacher_classrooms FOR INSERT 
  WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON public.teacher_classrooms TO anon, authenticated, service_role;


-- 6. SEED AUTHENTIC TRCN-VETTED EDUCATORS
INSERT INTO public.vetted_tutors (
  id, full_name, trcn_number, nin_verified, qualification, specialization, state_of_practice, hourly_rate, years_of_experience, rating, sessions_completed, bio
) VALUES 
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
ON CONFLICT (trcn_number) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  qualification = EXCLUDED.qualification,
  specialization = EXCLUDED.specialization,
  hourly_rate = EXCLUDED.hourly_rate;


-- 7. SEED ACTIVE TEACHER CLASSROOM COHORTS
INSERT INTO public.teacher_classrooms (
  id, tutor_id, class_name, class_code, subject, grade_level, academic_term, student_count, active_assignment, diagnostic_gap_summary, room_name
) VALUES 
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
ON CONFLICT (class_code) DO UPDATE SET
  class_name = EXCLUDED.class_name,
  subject = EXCLUDED.subject,
  grade_level = EXCLUDED.grade_level;

-- Reload Supabase Schema Cache
NOTIFY pgrst, 'reload schema';


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

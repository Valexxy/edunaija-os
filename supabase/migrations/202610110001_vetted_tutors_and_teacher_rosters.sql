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

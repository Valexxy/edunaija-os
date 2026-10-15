-- Migration 202610090003: Seed official curriculum, questions, assessments, and challenges

-- 1. Subjects
insert into public.subjects (id, slug, name, description, education_levels) values
  ('d1000000-0000-0000-0000-000000000001', 'general-mathematics', 'General Mathematics', 'NERDC / WAEC / JAMB General Mathematics for Senior Secondary and Exam Prep.', array['senior_secondary', 'exam_prep']::public.education_level[]),
  ('d1000000-0000-0000-0000-000000000002', 'english-language', 'English Language', 'Grammar, Lexis and Structure, Oral English, and Reading Comprehension.', array['junior_secondary', 'senior_secondary', 'exam_prep']::public.education_level[]),
  ('d1000000-0000-0000-0000-000000000003', 'physics', 'Physics', 'Mechanics, thermodynamics, electromagnetism, and modern physics.', array['senior_secondary', 'exam_prep']::public.education_level[]),
  ('d1000000-0000-0000-0000-000000000004', 'chemistry', 'Chemistry', 'Physical, inorganic, and organic chemistry aligned with WAEC and UTME standards.', array['senior_secondary', 'exam_prep']::public.education_level[]),
  ('d1000000-0000-0000-0000-000000000005', 'biology', 'Biology', 'Cell biology, physiology, genetics, ecology, and morphology.', array['senior_secondary', 'exam_prep']::public.education_level[])
on conflict (id) do nothing;

-- 2. Curriculum Sources
insert into public.curriculum_sources (id, title, source_type, issuing_body, version_label, is_official_verified, status) values
  ('c1000000-0000-0000-0000-000000000001', 'NERDC National Senior Secondary Curriculum', 'official', 'NERDC Nigeria', '2024 Revised Edition', true, 'published'),
  ('c1000000-0000-0000-0000-000000000002', 'JAMB UTME Unified Syllabus & Item Standards', 'official', 'JAMB', '2025/2026', true, 'published')
on conflict (id) do nothing;

-- 3. Topics
insert into public.curriculum_topics (id, source_id, subject_id, code, title, description, education_level, sort_order, status) values
  ('e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'MTH-SSS-01', 'Quadratic Equations & Polynomials', 'Factorization, quadratic formula, and discriminant analysis.', 'senior_secondary', 1, 'published'),
  ('e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'ENG-SSS-01', 'Grammatical Concord & Verb Agreement', 'Rules of proximity, notion, collective nouns, and subject-verb agreement.', 'senior_secondary', 1, 'published'),
  ('e1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'PHY-SSS-01', 'Scalars, Vectors & Linear Kinematics', 'Equations of uniformly accelerated motion and vector resolution.', 'senior_secondary', 1, 'published'),
  ('e1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000004', 'CHM-SSS-01', 'Atomic Structure & Periodic Trends', 'Electronic configurations, periodicity, and ionization energy.', 'senior_secondary', 1, 'published'),
  ('e1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000005', 'BIO-SSS-01', 'Cell Structure & Plasmolysis', 'Osmosis, plasmolysis, and enzyme activity in plant/animal cells.', 'senior_secondary', 1, 'published')
on conflict (id) do nothing;

-- 4. Verified Questions
insert into public.questions (id, topic_id, question_type, prompt, options, answer_key, explanation, difficulty, status, provenance, license_notes) values
  (
    'a1000000-0000-0000-0000-000000000001',
    'e1000000-0000-0000-0000-000000000001',
    'single_choice',
    'If the quadratic equation 2x² - 8x + k = 0 has equal real roots, find the value of the constant k.',
    '[{"id":"opt-a","text":"4"},{"id":"opt-b","text":"8"},{"id":"opt-c","text":"16"},{"id":"opt-d","text":"32"}]'::jsonb,
    '{"correctOptionId":"opt-b"}'::jsonb,
    'For equal roots, discriminant b² - 4ac = 0. Here a = 2, b = -8, c = k. (-8)² - 4(2)(k) = 0 => 64 - 8k = 0 => 8k = 64 => k = 8.',
    3,
    'published',
    'official',
    'JAMB / WAEC National Item Bank Standard'
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'e1000000-0000-0000-0000-000000000001',
    'single_choice',
    'Find the roots of the equation x² - 5x + 6 = 0.',
    '[{"id":"opt-a","text":"x = 2 or x = 3"},{"id":"opt-b","text":"x = -2 or x = -3"},{"id":"opt-c","text":"x = 1 or x = 6"},{"id":"opt-d","text":"x = -1 or x = 6"}]'::jsonb,
    '{"correctOptionId":"opt-a"}'::jsonb,
    'Factorizing x² - 5x + 6 = 0 gives (x - 2)(x - 3) = 0. Hence x = 2 or x = 3.',
    2,
    'published',
    'official',
    'WAEC Item Standards'
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'e1000000-0000-0000-0000-000000000002',
    'single_choice',
    'Neither the principal nor the teachers _____ present at the emergency PTA meeting yesterday.',
    '[{"id":"opt-a","text":"was"},{"id":"opt-b","text":"were"},{"id":"opt-c","text":"is"},{"id":"opt-d","text":"are"}]'::jsonb,
    '{"correctOptionId":"opt-b"}'::jsonb,
    'By the rule of proximity with correlative conjunctions "neither... nor", the verb agrees with the nearer subject (teachers, which is plural) in the past tense (were).',
    2,
    'published',
    'official',
    'WAEC English Language Standard'
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'e1000000-0000-0000-0000-000000000003',
    'single_choice',
    'A car accelerates uniformly from rest at 2.5 m/s² for 8 seconds. Calculate the total distance covered.',
    '[{"id":"opt-a","text":"40 m"},{"id":"opt-b","text":"60 m"},{"id":"opt-c","text":"80 m"},{"id":"opt-d","text":"100 m"}]'::jsonb,
    '{"correctOptionId":"opt-c"}'::jsonb,
    'Using s = ut + 1/2 at²: since u = 0, s = 1/2(2.5)(8²) = 1/2(2.5)(64) = 80 metres.',
    3,
    'published',
    'official',
    'JAMB Physics Standard'
  ),
  (
    'a1000000-0000-0000-0000-000000000005',
    'e1000000-0000-0000-0000-000000000004',
    'single_choice',
    'Which of the following electronic configurations represents an element with the highest first ionization energy?',
    '[{"id":"opt-a","text":"1s² 2s² 2p⁶"},{"id":"opt-b","text":"1s² 2s² 2p⁶ 3s¹"},{"id":"opt-c","text":"1s² 2s² 2p⁴"},{"id":"opt-d","text":"1s² 2s² 2p⁵"}]'::jsonb,
    '{"correctOptionId":"opt-a"}'::jsonb,
    '1s² 2s² 2p⁶ is the noble gas Neon with a fully satisfied octet, having highest effective nuclear charge and maximum stability.',
    3,
    'published',
    'official',
    'JAMB Chemistry Standard'
  ),
  (
    'a1000000-0000-0000-0000-000000000006',
    'e1000000-0000-0000-0000-000000000005',
    'single_choice',
    'When a plant cell is immersed in a hypertonic salt solution, the protoplasm shrinks away from the cell wall. This physiological phenomenon is termed:',
    '[{"id":"opt-a","text":"Turgidity"},{"id":"opt-b","text":"Plasmolysis"},{"id":"opt-c","text":"Hemolysis"},{"id":"opt-d","text":"Endosmosis"}]'::jsonb,
    '{"correctOptionId":"opt-b"}'::jsonb,
    'Exosmosis of water from the vacuole into a concentrated surrounding solution causes the cytoplasm to pull away from the cell wall, known as plasmolysis.',
    2,
    'published',
    'official',
    'WAEC Biology Standard'
  )
on conflict (id) do nothing;

-- 5. Assessments
insert into public.assessments (id, title, description, education_level, subject_id, status, time_limit_seconds) values
  (
    'b1000000-0000-0000-0000-000000000001',
    'National Senior Secondary Diagnostic Benchmark (JAMB/WAEC Tier)',
    'Evaluates comprehensive foundational readiness across Mathematics, English, Physics, Chemistry, and Biology.',
    'senior_secondary',
    null,
    'published',
    600
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'Senior Secondary Mathematics: Algebra & Quadratic Sprint',
    'Targeted drill on quadratic equations, factoring, and polynomial root determination.',
    'senior_secondary',
    'd1000000-0000-0000-0000-000000000001',
    'published',
    300
  )
on conflict (id) do nothing;

-- 6. Assessment Questions
insert into public.assessment_questions (assessment_id, question_id, points, position) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 1.0, 1),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 1.0, 2),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 1.0, 3),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 1.0, 4),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 1.0, 5),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006', 1.0, 6),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 1.0, 1),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 1.0, 2)
on conflict (assessment_id, question_id) do nothing;

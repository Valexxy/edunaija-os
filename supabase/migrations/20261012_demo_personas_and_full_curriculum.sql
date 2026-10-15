-- Migration: 20261012_demo_personas_and_full_curriculum.sql
-- Description: Seeds 7 authentic Nigerian demo personas, expanded curriculum topics across all 4 tiers, and the national competition pyramid.

-- ============================================================================
-- 1. SEED AUTHENTIC DEMO PERSONAS INTO PROFILES AND LEARNER_PROFILES
-- ============================================================================

INSERT INTO public.profiles (id, email, display_name, role, onboarding_complete)
VALUES
  ('demo-primary-001', 'amina.bello@demo.learnnaija.ng', 'Amina Bello', 'student', true),
  ('demo-jss-002', 'emeka.okafor@demo.learnnaija.ng', 'Emeka Okafor', 'student', true),
  ('demo-student-user-001', 'ukah.valentine@demo.learnnaija.ng', 'Ukah Valentine', 'student', true),
  ('demo-sss-arts-004', 'folake.adeleke@demo.learnnaija.ng', 'Folake Adeleke', 'student', true),
  ('demo-sss-commercial-005', 'babajide.sanwo@demo.learnnaija.ng', 'Babajide Sanwo', 'student', true),
  ('demo-parent-006', 'parent.emmanuel@demo.learnnaija.ng', 'Dr. Emmanuel Valentine', 'parent', true),
  ('demo-teacher-007', 'chinedu.eze@demo.learnnaija.ng', 'Mr. Chinedu Eze (TRCN)', 'teacher', true)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  onboarding_complete = EXCLUDED.onboarding_complete;

INSERT INTO public.learner_profiles (
  user_id, education_level, academic_track, class_label, exam_goal,
  state_name, lga_name, school_name, preferred_language, study_pace, xp_total, current_streak_days
)
VALUES
  ('demo-primary-001', 'primary', 'general', 'Primary 5', 'National Common Entrance Exam (NCEE)', 'Kano', 'Nassarawa', 'Kano Capital Primary School', 'en', 'moderate', 1250, 6),
  ('demo-jss-002', 'junior_secondary', 'general', 'JSS 3', 'Basic Education Certificate Examination (BECE)', 'Anambra', 'Onitsha North', 'Denis Memorial Grammar School', 'en', 'moderate', 2400, 11),
  ('demo-student-user-001', 'senior_secondary', 'science', 'SSS 3 Science', 'JAMB UTME 2026', 'Delta', 'Oshimili South', 'St. Patrick''s College, Asaba', 'en', 'fast', 4850, 15),
  ('demo-sss-arts-004', 'senior_secondary', 'arts', 'SSS 2 Arts', 'WASSCE Arts 2026', 'Lagos', 'Lagos Mainland', 'Queen''s College, Yaba', 'en', 'moderate', 3150, 9),
  ('demo-sss-commercial-005', 'senior_secondary', 'commercial', 'SSS 3 Commercial', 'WASSCE & NECO Commercial 2026', 'Ogun', 'Abeokuta South', 'Abeokuta Grammar School', 'en', 'moderate', 3600, 14)
ON CONFLICT (user_id) DO UPDATE SET
  education_level = EXCLUDED.education_level,
  academic_track = EXCLUDED.academic_track,
  class_label = EXCLUDED.class_label,
  exam_goal = EXCLUDED.exam_goal,
  state_name = EXCLUDED.state_name,
  lga_name = EXCLUDED.lga_name,
  school_name = EXCLUDED.school_name,
  xp_total = EXCLUDED.xp_total,
  current_streak_days = EXCLUDED.current_streak_days;

-- ============================================================================
-- 2. SEED EXPANDED CURRICULUM TOPICS (PRIMARY, JSS, ARTS, COMMERCIAL)
-- ============================================================================

-- Primary Topics
INSERT INTO public.curriculum_topics (id, subject_id, code, title, description, order_index, status)
VALUES
  ('top-pri-math-num-01', 'sub-math-01', 'MTH-PRI-01', 'Whole Numbers, Place Value & Mental Addition', 'Counting to 100,000, place value concepts, and multi-digit addition with regrouping.', 1, 'published'),
  ('top-pri-math-frac-02', 'sub-math-01', 'MTH-PRI-02', 'Fractions, Decimals & Percentages Foundations', 'Proper, improper, and mixed fractions, equivalent fractions, and basic decimals.', 2, 'published'),
  ('top-pri-math-meas-03', 'sub-math-01', 'MTH-PRI-03', 'Perimeter, Area & Basic Mensuration', 'Perimeter of rectangles and squares, basic area calculations, and word problems.', 3, 'published'),
  ('top-pri-eng-vocab-01', 'sub-eng-02', 'ENG-PRI-01', 'Vocabulary Expansion, Synonyms & Antonyms', 'Common word pairs, contextual synonyms, and dictionary skills for primary pupils.', 1, 'published'),
  ('top-pri-eng-comp-02', 'sub-eng-02', 'ENG-PRI-02', 'Reading Comprehension & Story Analysis', 'Extracting factual details, deducing main ideas, and story moral evaluation.', 2, 'published'),
  ('top-pri-sci-env-01', 'sub-bio-05', 'SCI-PRI-01', 'Living Things, Plants & Environmental Science', 'Characteristics of living organisms, plant parts, photosynthesis basics, and local habitats.', 1, 'published'),
  ('top-pri-sci-body-02', 'sub-bio-05', 'SCI-PRI-02', 'The Human Body, Nutrition & Personal Hygiene', 'Major body systems, balanced diet categories, personal cleanliness, and disease prevention.', 2, 'published'),
  ('top-pri-sci-ener-03', 'sub-phy-03', 'SCI-PRI-03', 'Forces, Simple Energy Forms & States of Matter', 'Push, pull, friction basics, light and sound energy, solids, liquids, and gases.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Junior Secondary Topics
INSERT INTO public.curriculum_topics (id, subject_id, code, title, description, order_index, status)
VALUES
  ('top-jss-math-alg-01', 'sub-math-01', 'MTH-JSS-01', 'Basic Algebraic Processes & Simple Linear Equations', 'Simplification of algebraic terms, directed numbers, and single-variable linear equations.', 1, 'published'),
  ('top-jss-math-geom-02', 'sub-math-01', 'MTH-JSS-02', 'Plane Geometry & Angle Properties of Triangles', 'Angles on parallel lines, interior/exterior angles of triangles, and basic polygons.', 2, 'published'),
  ('top-jss-math-num-03', 'sub-math-01', 'MTH-JSS-03', 'Number Bases & Approximation (BECE Standard)', 'Binary, octal, decimal conversions, standard form, and significant figures.', 3, 'published'),
  ('top-jss-eng-tense-01', 'sub-eng-02', 'ENG-JSS-01', 'Grammar Foundations: Parts of Speech & Verb Tenses', 'Nouns, pronouns, adjectives, adverbs, and past/present continuous verb tense agreement.', 1, 'published'),
  ('top-jss-eng-essay-02', 'sub-eng-02', 'ENG-JSS-02', 'Formal & Informal Letter Writing Composition', 'Structure, salutations, formal tone for authorities, and informal tone for relatives.', 2, 'published'),
  ('top-jss-sci-matter-01', 'sub-chem-04', 'SCI-JSS-01', 'Matter, Physical & Chemical Changes', 'Particulate nature of matter, elements, compounds, mixtures, and separation techniques.', 1, 'published'),
  ('top-jss-sci-life-02', 'sub-bio-05', 'SCI-JSS-02', 'Cell Theory, Organelles & Tissues', 'Microscopic cell structure, plant vs animal cells, and organization of life.', 2, 'published'),
  ('top-jss-sci-engy-03', 'sub-phy-03', 'SCI-JSS-03', 'Work, Energy, Power & Simple Machines', 'Forms of energy, law of conservation of energy, mechanical advantage, and levers.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Arts Topics
INSERT INTO public.curriculum_topics (id, subject_id, code, title, description, order_index, status)
VALUES
  ('top-lit-device-01', 'sub-lit-11', 'LIT-SSS-01', 'Literary Appreciation & Figures of Speech', 'Metaphor, simile, irony, personification, synecdoche, and poetic devices in WASSCE texts.', 1, 'published'),
  ('top-lit-drama-02', 'sub-lit-11', 'LIT-SSS-02', 'African Drama: The Lion and the Jewel (Wole Soyinka)', 'Themes of tradition vs modernity, character contrasts (Baroka vs Lakunle), and dramatic irony.', 2, 'published'),
  ('top-lit-prose-03', 'sub-lit-11', 'LIT-SSS-03', 'African Prose: Second Class Citizen (Buchi Emecheta)', 'Immigration struggles, gender expectations, determination, and socio-economic critique.', 3, 'published'),
  ('top-gov-const-01', 'sub-gov-12', 'GOV-SSS-01', 'Constitutional Development in Nigeria (1922-1999)', 'Clifford, Richards, Macpherson, Lyttelton, 1960 Independence, and 1999 Constitutions.', 1, 'published'),
  ('top-gov-arms-02', 'sub-gov-12', 'GOV-SSS-02', 'Arms of Government & Separation of Powers', 'Executive, Legislature, Judiciary checks and balances under presidential democracy.', 2, 'published'),
  ('top-gov-pol-03', 'sub-gov-12', 'GOV-SSS-03', 'Political Parties, Pressure Groups & Electoral Systems', 'Functions of political parties, party manifestos, first-past-the-post, and proportional representation.', 3, 'published'),
  ('top-crs-faith-01', 'sub-crs-13', 'CRS-SSS-01', 'Sovereignty of God & The Call of Abraham', 'Creation stories, covenant obedience, faith demonstrations, and patriarchal lessons.', 1, 'published'),
  ('top-crs-gospel-02', 'sub-crs-13', 'CRS-SSS-02', 'The Synoptic Gospels: Ministry, Parables & Miracles', 'Parable of the Sower, Good Samaritan, Prodigal Son, and teachings on the Kingdom of God.', 2, 'published'),
  ('top-crs-paul-03', 'sub-crs-13', 'CRS-SSS-03', 'Pauline Epistles: Justification by Faith & Spiritual Gifts', 'Romans justification theology, 1 Corinthians 12-13 love supremacy and unity in diversity.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Commercial Topics
INSERT INTO public.curriculum_topics (id, subject_id, code, title, description, order_index, status)
VALUES
  ('top-acc-entry-01', 'sub-acc-16', 'ACC-SSS-01', 'Principles of Double Entry & Ledger Accounts', 'Debit and credit conventions, journalizing transactions, and posting to ledger accounts.', 1, 'published'),
  ('top-acc-balance-02', 'sub-acc-16', 'ACC-SSS-02', 'Trial Balance, Correction of Errors & Suspense Account', 'Trial balance extraction, errors not affecting trial balance, and suspense account rectification.', 2, 'published'),
  ('top-acc-final-03', 'sub-acc-16', 'ACC-SSS-03', 'Final Accounts of Sole Trader (Income Statement & Balance Sheet)', 'Trading and profit and loss account, cost of sales, gross/net profit, and statement of financial position.', 3, 'published'),
  ('top-comm-trade-01', 'sub-comm-15', 'CMM-SSS-01', 'Home Trade, Wholesale & Retail Distribution Channels', 'Functions of wholesaler, retailer, chain stores, supermarket, and consumer cooperatives.', 1, 'published'),
  ('top-comm-foreign-02', 'sub-comm-15', 'CMM-SSS-02', 'Foreign Trade, Balance of Payments & Customs Procedures', 'Import/export procedures, bill of lading, letters of credit, tariffs, and balance of trade.', 2, 'published'),
  ('top-comm-aids-03', 'sub-comm-15', 'CMM-SSS-03', 'Aids to Trade: Banking, Insurance, Transport & Warehousing', 'Functions of commercial banks, insurance principles (indemnity/utmost good faith), and bonded warehouses.', 3, 'published'),
  ('top-econ-demand-01', 'sub-econ-17', 'ECN-SSS-01', 'Theory of Demand, Supply & Equilibrium Price', 'Law of demand/supply, elasticity of demand (price, income, cross), and market equilibrium shifts.', 1, 'published'),
  ('top-econ-macro-02', 'sub-econ-17', 'ECN-SSS-02', 'National Income Accounting & Gross Domestic Product (GDP)', 'GDP, GNP, NNP, measurement methods (output, income, expenditure), and inflation adjustments.', 2, 'published'),
  ('top-econ-dev-03', 'sub-econ-17', 'ECN-SSS-03', 'Public Finance, Fiscal Policy & Nigerian Economic Planning', 'Government revenue/expenditure, taxation principles, budget deficit, and economic diversification.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

import type { Subject, CurriculumSource, CurriculumTopic, Question } from "./types";
import { EXPANDED_QUESTIONS } from "./expanded-bank";

export const SEED_SUBJECTS: Subject[] = [
  // Senior Secondary & Exam Prep (JAMB / WAEC)
  {
    id: "sub-math-01",
    slug: "general-mathematics",
    name: "General Mathematics",
    description: "NERDC / WAEC / JAMB General Mathematics for Senior Secondary and Exam Prep.",
    education_levels: ["senior_secondary", "exam_prep"]
  },
  {
    id: "sub-eng-02",
    slug: "english-language",
    name: "English Language",
    description: "Grammar, Lexis and Structure, Oral English, and Reading Comprehension.",
    education_levels: ["senior_secondary", "exam_prep"]
  },
  {
    id: "sub-phy-03",
    slug: "physics",
    name: "Physics",
    description: "Foundational and advanced mechanics, thermodynamics, electromagnetism, and modern physics.",
    education_levels: ["senior_secondary", "exam_prep"]
  },
  {
    id: "sub-chem-04",
    slug: "chemistry",
    name: "Chemistry",
    description: "Physical, inorganic, and organic chemistry aligned with WAEC and UTME standards.",
    education_levels: ["senior_secondary", "exam_prep"]
  },
  {
    id: "sub-bio-05",
    slug: "biology",
    name: "Biology",
    description: "Cell biology, physiology, genetics, ecology, and morphology.",
    education_levels: ["senior_secondary", "exam_prep"]
  },
  // Junior Secondary (BECE / Junior WAEC)
  {
    id: "sub-jss-math-06",
    slug: "jss-basic-mathematics",
    name: "Basic Mathematics (JSS)",
    description: "Algebraic processes, geometry, statistics, and number theory for Junior Secondary (JSS 1-3).",
    education_levels: ["junior_secondary"]
  },
  {
    id: "sub-jss-eng-07",
    slug: "jss-english-studies",
    name: "English Studies (JSS)",
    description: "Basic grammar, parts of speech, vocabulary, and reading comprehension for BECE candidates.",
    education_levels: ["junior_secondary"]
  },
  {
    id: "sub-jss-sci-08",
    slug: "jss-basic-science",
    name: "Basic Science & Technology",
    description: "Integrated science, energy, matter, technology, and health for Junior Secondary.",
    education_levels: ["junior_secondary"]
  },
  // Primary (Common Entrance / NCEE)
  {
    id: "sub-pri-math-09",
    slug: "primary-mathematics",
    name: "Primary Mathematics & Quantitative Reasoning",
    description: "Whole numbers, fractions, decimals, and quantitative aptitude for National Common Entrance.",
    education_levels: ["primary"]
  },
  {
    id: "sub-pri-eng-10",
    slug: "primary-english-verbal",
    name: "Primary English & Verbal Aptitude",
    description: "Sentence construction, vocabulary, spelling, and verbal reasoning for Primary 4-6.",
    education_levels: ["primary"]
  },
  {
    id: "sub-pri-sci-11",
    slug: "primary-basic-science",
    name: "Primary Science & Environment",
    description: "Living things, human body, plants, and physical environment for Primary scholars.",
    education_levels: ["primary"]
  },
  // --- Arts & Humanities Subjects (WAEC / NECO / JAMB) ---
  {
    id: "sub-lit-12",
    slug: "literature-in-english",
    name: "Literature-in-English",
    description: "African and Non-African prose, drama, poetry, and literary appreciation for Arts scholars.",
    education_levels: ["senior_secondary", "exam_prep"],
    track: "arts"
  },
  {
    id: "sub-gov-13",
    slug: "government",
    name: "Government",
    description: "Political institutions, Nigerian constitutional development, public administration, and international relations.",
    education_levels: ["senior_secondary", "exam_prep"],
    track: "arts"
  },
  {
    id: "sub-crs-14",
    slug: "christian-religious-studies",
    name: "Christian Religious Studies",
    description: "Themes from the Old Testament, the Synoptic Gospels, the early Church, and Christian ethical living.",
    education_levels: ["senior_secondary", "exam_prep"],
    track: "arts"
  },
  // --- Commercial & Business Subjects (WAEC / NECO / JAMB) ---
  {
    id: "sub-comm-15",
    slug: "commerce",
    name: "Commerce",
    description: "Production, domestic and international trade, aids to trade, business finance, and stock exchange.",
    education_levels: ["senior_secondary", "exam_prep"],
    track: "commercial"
  },
  {
    id: "sub-acc-16",
    slug: "financial-accounting",
    name: "Financial Accounting",
    description: "Double-entry bookkeeping, final accounts, trial balance, bank reconciliation, and partnership accounting.",
    education_levels: ["senior_secondary", "exam_prep"],
    track: "commercial"
  },
  {
    id: "sub-econ-17",
    slug: "economics",
    name: "Economics",
    description: "Microeconomics (demand/supply/elasticity), macroeconomics, national income, public finance, and Nigerian economic development.",
    education_levels: ["senior_secondary", "exam_prep"],
    track: "commercial"
  },
];

export const SEED_SOURCES: CurriculumSource[] = [
  {
    id: "src-nerdc-01",
    title: "NERDC National Senior Secondary Curriculum",
    source_type: "official",
    issuing_body: "Nigerian Educational Research and Development Council (NERDC)",
    version_label: "2024 Revised Edition",
    is_official_verified: true,
    status: "published"
  },
  {
    id: "src-jamb-02",
    title: "JAMB UTME Unified Syllabus & Item Standards",
    source_type: "official",
    issuing_body: "Joint Admissions and Matriculation Board",
    version_label: "2025/2026",
    is_official_verified: true,
    status: "published"
  },
  {
    id: "src-bece-03",
    title: "NERDC / NECO Junior Secondary BECE Curriculum",
    source_type: "official",
    issuing_body: "National Examinations Council (NECO) / NERDC",
    version_label: "BECE National Standard",
    is_official_verified: true,
    status: "published"
  },
  {
    id: "src-ncee-04",
    title: "National Common Entrance Examination (NCEE) Standards",
    source_type: "official",
    issuing_body: "NECO / Federal Ministry of Education",
    version_label: "NCEE Standard Edition",
    is_official_verified: true,
    status: "published"
  }
];

export const SEED_TOPICS: CurriculumTopic[] = [
  // --- Senior Secondary Topics ---
  {
    id: "top-math-quad-01",
    source_id: "src-nerdc-01",
    subject_id: "sub-math-01",
    code: "MTH-SSS-01",
    title: "Quadratic Equations & Polynomials",
    description: "Factorization, completing the square, quadratic formula, and discriminant analysis.",
    education_level: "senior_secondary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-math-trig-02",
    source_id: "src-nerdc-01",
    subject_id: "sub-math-01",
    code: "MTH-SSS-02",
    title: "Trigonometry & Bearings",
    description: "Sine and Cosine rules, angles of elevation and depression, 3-figure bearings.",
    education_level: "senior_secondary",
    sort_order: 2,
    status: "published"
  },
  {
    id: "top-eng-concord-01",
    source_id: "src-nerdc-01",
    subject_id: "sub-eng-02",
    code: "ENG-SSS-01",
    title: "Grammatical Concord & Verb Agreement",
    description: "Rules of proximity, notion, collective nouns, and either/or subject-verb agreement.",
    education_level: "senior_secondary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-eng-vocab-02",
    source_id: "src-nerdc-01",
    subject_id: "sub-eng-02",
    code: "ENG-SSS-02",
    title: "Lexis, Synonyms & Antonyms",
    description: "Register of words, idioms, nearest in meaning, and opposite in meaning in WAEC/JAMB passages.",
    education_level: "senior_secondary",
    sort_order: 2,
    status: "published"
  },
  {
    id: "top-phy-mech-01",
    source_id: "src-nerdc-01",
    subject_id: "sub-phy-03",
    code: "PHY-SSS-01",
    title: "Scalars, Vectors & Linear Kinematics",
    description: "Equations of uniformly accelerated motion, projectiles, and vector resolution.",
    education_level: "senior_secondary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-phy-work-02",
    source_id: "src-nerdc-01",
    subject_id: "sub-phy-03",
    code: "PHY-SSS-02",
    title: "Work, Energy & Power",
    description: "Conservation of mechanical energy, kinetic and potential energy, and mechanical efficiency.",
    education_level: "senior_secondary",
    sort_order: 2,
    status: "published"
  },
  {
    id: "top-chem-atom-01",
    source_id: "src-nerdc-01",
    subject_id: "sub-chem-04",
    code: "CHM-SSS-01",
    title: "Atomic Structure & Periodic Trends",
    description: "Electronic configurations, periodicity, ionization energy, and electronegativity.",
    education_level: "senior_secondary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-chem-periodic-02",
    source_id: "src-nerdc-01",
    subject_id: "sub-chem-04",
    code: "CHM-SSS-02",
    title: "Chemical Bonding & Stoichiometry",
    description: "Ionic, covalent, and metallic bonds, mole concept, and reacting masses.",
    education_level: "senior_secondary",
    sort_order: 2,
    status: "published"
  },
  {
    id: "top-bio-cell-01",
    source_id: "src-nerdc-01",
    subject_id: "sub-bio-05",
    code: "BIO-SSS-01",
    title: "Cell Structure, Organisation & Enzymes",
    description: "Organelles, diffusion, osmosis, plasmolysis, and enzyme specificity.",
    education_level: "senior_secondary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-bio-photo-02",
    source_id: "src-nerdc-01",
    subject_id: "sub-bio-05",
    code: "BIO-SSS-02",
    title: "Plant Physiology & Nutrition",
    description: "Photosynthesis, mineral nutrition in plants, transport mechanisms, and stomatal action.",
    education_level: "senior_secondary",
    sort_order: 2,
    status: "published"
  },

  // --- Arts & Humanities Topics ---
  {
    id: "top-lit-device-01",
    source_id: "src-nerdc-01",
    subject_id: "sub-lit-12",
    code: "LIT-SSS-01",
    title: "Literary Devices & Figures of Speech",
    description: "Metaphor, simile, irony, personification, hyperbole, alliteration, and poetic tone analysis.",
    education_level: "senior_secondary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-lit-drama-02",
    source_id: "src-nerdc-01",
    subject_id: "sub-lit-12",
    code: "LIT-SSS-02",
    title: "African & Non-African Drama and Prose",
    description: "Dramatic irony, characterisation, themes, tragic flaws, and stage techniques in prescribed texts.",
    education_level: "senior_secondary",
    sort_order: 2,
    status: "published"
  },
  {
    id: "top-gov-const-01",
    source_id: "src-nerdc-01",
    subject_id: "sub-gov-13",
    code: "GOV-SSS-01",
    title: "Nigerian Constitutional Development",
    description: "Colonial constitutional milestones: Clifford (1922), Richards (1946), Macpherson (1951), and Lyttelton (1954).",
    education_level: "senior_secondary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-gov-arms-02",
    source_id: "src-nerdc-01",
    subject_id: "sub-gov-13",
    code: "GOV-SSS-02",
    title: "Arms of Government & Rule of Law",
    description: "Separation of powers, checks and balances, bicameral legislature, executive powers, and judicial independence.",
    education_level: "senior_secondary",
    sort_order: 2,
    status: "published"
  },
  {
    id: "top-crs-faith-01",
    source_id: "src-nerdc-01",
    subject_id: "sub-crs-14",
    code: "CRS-SSS-01",
    title: "Old Testament: Sovereignty of God & Covenant",
    description: "The Call of Abraham, Joseph's providential journey, Mosaic covenant, and the Decalogue (Ten Commandments).",
    education_level: "senior_secondary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-crs-gospel-02",
    source_id: "src-nerdc-01",
    subject_id: "sub-crs-14",
    code: "CRS-SSS-02",
    title: "The Synoptic Gospels: Life & Teachings of Christ",
    description: "The Baptism, Temptation, Sermon on the Mount, Parables of the Kingdom, and Passion narrative.",
    education_level: "senior_secondary",
    sort_order: 2,
    status: "published"
  },

  // --- Commercial & Business Topics ---
  {
    id: "top-comm-trade-01",
    source_id: "src-nerdc-01",
    subject_id: "sub-comm-15",
    code: "COM-SSS-01",
    title: "Home Trade, Distribution & Aids to Trade",
    description: "Wholesalers, retailers, middleman functions, warehousing, transport, banking, and insurance.",
    education_level: "senior_secondary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-comm-foreign-02",
    source_id: "src-nerdc-01",
    subject_id: "sub-comm-15",
    code: "COM-SSS-02",
    title: "International Trade & Trade Documentation",
    description: "Export/import procedures, tariffs, balance of trade vs payments, bill of lading, and letter of credit.",
    education_level: "senior_secondary",
    sort_order: 2,
    status: "published"
  },
  {
    id: "top-acc-entry-01",
    source_id: "src-nerdc-01",
    subject_id: "sub-acc-16",
    code: "ACC-SSS-01",
    title: "Double-Entry Bookkeeping & Ledger Accounts",
    description: "Debit and credit rules, ledger classifications (real, personal, nominal accounts), and two/three-column cash book.",
    education_level: "senior_secondary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-acc-balance-02",
    source_id: "src-nerdc-01",
    subject_id: "sub-acc-16",
    code: "ACC-SSS-02",
    title: "Trial Balance & Error Correction",
    description: "Extraction of trial balance, errors not affecting trial balance (omission, commission, principle), and suspense accounts.",
    education_level: "senior_secondary",
    sort_order: 2,
    status: "published"
  },
  {
    id: "top-econ-demand-01",
    source_id: "src-nerdc-01",
    subject_id: "sub-econ-17",
    code: "ECO-SSS-01",
    title: "Theory of Demand, Supply & Market Equilibrium",
    description: "Laws of demand and supply, shifts vs movements along curves, and price elasticity calculations.",
    education_level: "senior_secondary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-econ-macro-02",
    source_id: "src-nerdc-01",
    subject_id: "sub-econ-17",
    code: "ECO-SSS-02",
    title: "National Income, Inflation & Fiscal Policy",
    description: "GDP, GNP, Net National Product, demand-pull vs cost-push inflation, taxation, and government expenditure.",
    education_level: "senior_secondary",
    sort_order: 2,
    status: "published"
  },

  // --- Junior Secondary Topics (BECE) ---
  {
    id: "top-jss-math-alg-01",
    source_id: "src-bece-03",
    subject_id: "sub-jss-math-06",
    code: "MTH-JSS-01",
    title: "Linear Equations & Simple Algebra",
    description: "Solving one-variable equations, expanding brackets, and algebraic substitution.",
    education_level: "junior_secondary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-jss-math-geom-02",
    source_id: "src-bece-03",
    subject_id: "sub-jss-math-06",
    code: "MTH-JSS-02",
    title: "Angles, Triangles & Polygons",
    description: "Sum of angles in triangles, complementary and supplementary angles, Pythagoras theorem.",
    education_level: "junior_secondary",
    sort_order: 2,
    status: "published"
  },
  {
    id: "top-jss-eng-tense-01",
    source_id: "src-bece-03",
    subject_id: "sub-jss-eng-07",
    code: "ENG-JSS-01",
    title: "Parts of Speech, Tenses & Concord",
    description: "Nouns, pronouns, verbs, past participles, and basic subject-verb agreement.",
    education_level: "junior_secondary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-jss-sci-matter-01",
    source_id: "src-bece-03",
    subject_id: "sub-jss-sci-08",
    code: "SCI-JSS-01",
    title: "Matter, Energy & Simple Machines",
    description: "States of matter, physical and chemical changes, forms of energy, levers and pulleys.",
    education_level: "junior_secondary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-jss-sci-life-02",
    source_id: "src-bece-03",
    subject_id: "sub-jss-sci-08",
    code: "SCI-JSS-02",
    title: "Living Organisms & Environmental Health",
    description: "Characteristics of living things, cell as fundamental unit, sanitation, and pollution.",
    education_level: "junior_secondary",
    sort_order: 2,
    status: "published"
  },

  // --- Primary Topics (Common Entrance / NCEE) ---
  {
    id: "top-pri-math-num-01",
    source_id: "src-ncee-04",
    subject_id: "sub-pri-math-09",
    code: "MTH-PRI-01",
    title: "Fractions, Decimals & Quantitative Aptitude",
    description: "Addition and subtraction of fractions, decimals, percentages, and number patterns.",
    education_level: "primary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-pri-eng-vocab-01",
    source_id: "src-ncee-04",
    subject_id: "sub-pri-eng-10",
    code: "ENG-PRI-01",
    title: "Verbal Aptitude, Spelling & Vocabulary",
    description: "Opposites, synonyms, analogies, spelling drills, and basic punctuation.",
    education_level: "primary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-pri-sci-env-01",
    source_id: "src-ncee-04",
    subject_id: "sub-pri-sci-11",
    code: "SCI-PRI-01",
    title: "Plants, Animals & Personal Hygiene",
    description: "Parts of a plant, domestic vs wild animals, cleanliness, and balanced diet.",
    education_level: "primary",
    sort_order: 1,
    status: "published"
  },
  {
    id: "top-pri-math-geom-02",
    source_id: "src-ncee-04",
    subject_id: "sub-pri-math-09",
    code: "MTH-PRI-02",
    title: "Basic Geometry, Perimeter, Area & Shapes",
    description: "2D and 3D shapes, perimeter and area of rectangles/squares, angles, and symmetry.",
    education_level: "primary",
    sort_order: 2,
    status: "published"
  },
  {
    id: "top-pri-math-money-03",
    source_id: "src-ncee-04",
    subject_id: "sub-pri-math-09",
    code: "MTH-PRI-03",
    title: "Money, Profit & Loss, Time and Measurements",
    description: "Nigerian Naira and Kobo transactions, simple interest, reading clocks, and metric units.",
    education_level: "primary",
    sort_order: 3,
    status: "published"
  },
  {
    id: "top-pri-eng-comp-02",
    source_id: "src-ncee-04",
    subject_id: "sub-pri-eng-10",
    code: "ENG-PRI-02",
    title: "Reading Comprehension, Sentence Building & Tenses",
    description: "Passage understanding, identifying main ideas, past/present/future tenses, and punctuation.",
    education_level: "primary",
    sort_order: 2,
    status: "published"
  },
  {
    id: "top-pri-sci-health-02",
    source_id: "src-ncee-04",
    subject_id: "sub-pri-sci-11",
    code: "SCI-PRI-02",
    title: "Human Body, Clean Water, Nutrition & Safety",
    description: "Sense organs, food nutrients, water purification, first aid basics, and road safety.",
    education_level: "primary",
    sort_order: 2,
    status: "published"
  },
  {
    id: "top-pri-sci-energy-03",
    source_id: "src-ncee-04",
    subject_id: "sub-pri-sci-11",
    code: "SCI-PRI-03",
    title: "Simple Machines, Forces & Weather Observations",
    description: "Pulleys, wheels, wind vanes, thermometers, rainy vs dry season, and gravity.",
    education_level: "primary",
    sort_order: 3,
    status: "published"
  },
  {
    id: "top-jss-math-indices-03",
    source_id: "src-bece-03",
    subject_id: "sub-jss-math-06",
    code: "MTH-JSS-03",
    title: "Indices, Number Bases & Standard Form",
    description: "Laws of indices, converting base 2 and base 10 numbers, and scientific standard notation.",
    education_level: "junior_secondary",
    sort_order: 3,
    status: "published"
  },
  {
    id: "top-jss-eng-vocab-02",
    source_id: "src-bece-03",
    subject_id: "sub-jss-eng-07",
    code: "ENG-JSS-02",
    title: "Lexis, Idioms & Reading Comprehension",
    description: "Contextual vocabulary, common idioms, passage inference, and summarizing paragraphs.",
    education_level: "junior_secondary",
    sort_order: 2,
    status: "published"
  },
  {
    id: "top-jss-sci-energy-03",
    source_id: "src-bece-03",
    subject_id: "sub-jss-sci-08",
    code: "SCI-JSS-03",
    title: "Energy Transformations, Forces & Calculations",
    description: "Kinetic to potential transformations, friction, electrical circuits, and simple machines efficiency.",
    education_level: "junior_secondary",
    sort_order: 3,
    status: "published"
  }
];

export const SEED_QUESTIONS: Question[] = [
  // ==========================================
  // SENIOR SECONDARY / JAMB / WAEC QUESTIONS
  // ==========================================
  {
    id: "qst-math-01",
    topic_id: "top-math-quad-01",
    question_type: "single_choice",
    prompt: "If the quadratic equation 2x² - 8x + k = 0 has equal real roots, find the value of the constant k.",
    options: [
      { id: "opt-a", text: "4" },
      { id: "opt-b", text: "8" },
      { id: "opt-c", text: "16" },
      { id: "opt-d", text: "32" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "For equal roots, discriminant b² - 4ac = 0. Here a = 2, b = -8, c = k. Thus (-8)² - 4(2)(k) = 0 => 64 - 8k = 0 => 8k = 64 => k = 8.",
    difficulty: 3,
    status: "published",
    provenance: "official",
    license_notes: "JAMB / WAEC National Item Bank Standard"
  },
  {
    id: "qst-math-02",
    topic_id: "top-math-quad-01",
    question_type: "single_choice",
    prompt: "Find the roots of the equation x² - 5x + 6 = 0.",
    options: [
      { id: "opt-a", text: "x = 2 or x = 3" },
      { id: "opt-b", text: "x = -2 or x = -3" },
      { id: "opt-c", text: "x = 1 or x = 6" },
      { id: "opt-d", text: "x = -1 or x = 6" }
    ],
    answer_key: { correctOptionId: "opt-a" },
    explanation: "Factorizing x² - 5x + 6 = 0 gives (x - 2)(x - 3) = 0. Hence x = 2 or x = 3.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-math-03",
    topic_id: "top-math-trig-02",
    question_type: "single_choice",
    prompt: "Evaluate the exact value of sin(30°) + cos(60°).",
    options: [
      { id: "opt-a", text: "0.5" },
      { id: "opt-b", text: "1.0" },
      { id: "opt-c", text: "√3 / 2" },
      { id: "opt-d", text: "2.0" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "From special trigonometric ratios, sin(30°) = 1/2 and cos(60°) = 1/2. Therefore, 1/2 + 1/2 = 1.0.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-eng-01",
    topic_id: "top-eng-concord-01",
    question_type: "single_choice",
    prompt: "Neither the principal nor the teachers _____ present at the emergency PTA meeting yesterday.",
    options: [
      { id: "opt-a", text: "was" },
      { id: "opt-b", text: "were" },
      { id: "opt-c", text: "is" },
      { id: "opt-d", text: "are" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "By the rule of proximity with correlative conjunctions 'neither... nor', the verb agrees with the nearer subject ('teachers', which is plural), and 'yesterday' indicates past tense ('were').",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-eng-02",
    topic_id: "top-eng-vocab-02",
    question_type: "single_choice",
    prompt: "Choose the word nearest in meaning to the capitalized word: The commissioner's speech was PRAGMATIC.",
    options: [
      { id: "opt-a", text: "Theoretical" },
      { id: "opt-b", text: "Practical and realistic" },
      { id: "opt-c", text: "Hostile and aggressive" },
      { id: "opt-d", text: "Complicated" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "'Pragmatic' refers to dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.",
    difficulty: 3,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-phy-01",
    topic_id: "top-phy-mech-01",
    question_type: "single_choice",
    prompt: "A car accelerates uniformly from rest at 2.5 m/s² for 8 seconds. Calculate the total distance covered.",
    options: [
      { id: "opt-a", text: "40 m" },
      { id: "opt-b", text: "60 m" },
      { id: "opt-c", text: "80 m" },
      { id: "opt-d", text: "100 m" }
    ],
    answer_key: { correctOptionId: "opt-c" },
    explanation: "Using s = ut + 1/2 at²: since u = 0, s = 1/2(2.5)(8²) = 1/2(2.5)(64) = 1.25 * 64 = 80 metres.",
    difficulty: 3,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-phy-02",
    topic_id: "top-phy-work-02",
    question_type: "single_choice",
    prompt: "A student of mass 50 kg climbs a vertical flight of stairs 4 metres high in 5 seconds. What is the power developed? (Take g = 10 m/s²)",
    options: [
      { id: "opt-a", text: "200 W" },
      { id: "opt-b", text: "400 W" },
      { id: "opt-c", text: "1000 W" },
      { id: "opt-d", text: "2000 W" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Work done = mgh = 50 * 10 * 4 = 2000 Joules. Power = Work / Time = 2000 J / 5 s = 400 Watts.",
    difficulty: 3,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-chem-01",
    topic_id: "top-chem-atom-01",
    question_type: "single_choice",
    prompt: "Which of the following electronic configurations represents an element with the highest first ionization energy?",
    options: [
      { id: "opt-a", text: "1s² 2s² 2p⁶" },
      { id: "opt-b", text: "1s² 2s² 2p⁶ 3s¹" },
      { id: "opt-c", text: "1s² 2s² 2p⁴" },
      { id: "opt-d", text: "1s² 2s² 2p⁵" }
    ],
    answer_key: { correctOptionId: "opt-a" },
    explanation: "1s² 2s² 2p⁶ is the noble gas Neon with a fully satisfied octet, having the highest effective nuclear charge and maximum stability.",
    difficulty: 3,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-chem-02",
    topic_id: "top-chem-periodic-02",
    question_type: "single_choice",
    prompt: "Across a period from left to right in the Periodic Table, the atomic radius generally:",
    options: [
      { id: "opt-a", text: "Increases due to extra shells" },
      { id: "opt-b", text: "Decreases due to increasing effective nuclear charge" },
      { id: "opt-c", text: "Remains constant" },
      { id: "opt-d", text: "Doubles every group" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "As protons are added across a period without adding new energy levels, the greater nuclear pull draws electrons closer to the nucleus, decreasing atomic radius.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-bio-01",
    topic_id: "top-bio-cell-01",
    question_type: "single_choice",
    prompt: "When a plant cell is immersed in a hypertonic salt solution, the protoplasm shrinks away from the cell wall. This physiological phenomenon is termed:",
    options: [
      { id: "opt-a", text: "Turgidity" },
      { id: "opt-b", text: "Plasmolysis" },
      { id: "opt-c", text: "Hemolysis" },
      { id: "opt-d", text: "Endosmosis" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Exosmosis of water from the vacuole into a concentrated surrounding solution causes the cytoplasm to pull away from the cellulose cell wall, known as plasmolysis.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-bio-02",
    topic_id: "top-bio-photo-02",
    question_type: "single_choice",
    prompt: "In green plant cells, the light-dependent phase of photosynthesis occurs specifically in the:",
    options: [
      { id: "opt-a", text: "Stroma" },
      { id: "opt-b", text: "Thylakoid membranes (Grana)" },
      { id: "opt-c", text: "Mitochondrial matrix" },
      { id: "opt-d", text: "Cytoplasm" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Chlorophyll pigments within the thylakoid membrane capture light photons to photolyze water during the light reaction, while the dark reaction (Calvin cycle) occurs in the stroma.",
    difficulty: 3,
    status: "published",
    provenance: "official"
  },

  // ==========================================
  // JUNIOR SECONDARY / BECE QUESTIONS
  // ==========================================
  {
    id: "qst-jss-math-01",
    topic_id: "top-jss-math-alg-01",
    question_type: "single_choice",
    prompt: "Solve for x in the linear equation: 3x + 7 = 22.",
    options: [
      { id: "opt-a", text: "x = 3" },
      { id: "opt-b", text: "x = 5" },
      { id: "opt-c", text: "x = 7" },
      { id: "opt-d", text: "x = 9" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Subtract 7 from both sides: 3x = 22 - 7 = 15. Divide both sides by 3: x = 15 / 3 = 5.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-jss-math-02",
    topic_id: "top-jss-math-geom-02",
    question_type: "single_choice",
    prompt: "The angles of a triangle are 2x, 3x, and 4x. Find the value of x.",
    options: [
      { id: "opt-a", text: "15°" },
      { id: "opt-b", text: "20°" },
      { id: "opt-c", text: "25°" },
      { id: "opt-d", text: "30°" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "The sum of interior angles in a triangle is 180°. So 2x + 3x + 4x = 180° => 9x = 180° => x = 20°.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-jss-eng-01",
    topic_id: "top-jss-eng-tense-01",
    question_type: "single_choice",
    prompt: "Identify the part of speech of the underlined word: 'The diligent scholar read ATTENTIVELY.'",
    options: [
      { id: "opt-a", text: "Adjective" },
      { id: "opt-b", text: "Adverb" },
      { id: "opt-c", text: "Preposition" },
      { id: "opt-d", text: "Conjunction" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "'Attentively' modifies the verb 'read', indicating how the action was performed; therefore, it is an adverb of manner.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-jss-sci-01",
    topic_id: "top-jss-sci-matter-01",
    question_type: "single_choice",
    prompt: "Which of the following is a chemical change?",
    options: [
      { id: "opt-a", text: "Melting of ice" },
      { id: "opt-b", text: "Rusting of iron nails" },
      { id: "opt-c", text: "Dissolving salt in pure water" },
      { id: "opt-d", text: "Boiling of water" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Rusting of iron forms hydrated iron(III) oxide (a new chemical substance) and is irreversible by simple physical methods, making it a chemical change.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-jss-sci-02",
    topic_id: "top-jss-sci-life-02",
    question_type: "single_choice",
    prompt: "The fundamental microscopic structural and functional unit of all living organisms is the:",
    options: [
      { id: "opt-a", text: "Organ" },
      { id: "opt-b", text: "Tissue" },
      { id: "opt-c", text: "Cell" },
      { id: "opt-d", text: "Molecules" }
    ],
    answer_key: { correctOptionId: "opt-c" },
    explanation: "According to the Cell Theory proposed by Schleiden and Schwann, the cell is the basic structural and functional unit of life.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },

  // ==========================================
  // PRIMARY / NCEE COMMON ENTRANCE QUESTIONS
  // ==========================================
  {
    id: "qst-pri-math-01",
    topic_id: "top-pri-math-num-01",
    question_type: "single_choice",
    prompt: "Calculate: 350 + 475.",
    options: [
      { id: "opt-a", text: "725" },
      { id: "opt-b", text: "825" },
      { id: "opt-c", text: "835" },
      { id: "opt-d", text: "925" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "350 + 475: 300 + 400 = 700; 50 + 75 = 125; 700 + 125 = 825.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-pri-math-02",
    topic_id: "top-pri-math-num-01",
    question_type: "single_choice",
    prompt: "Which fraction is equivalent to 2/4?",
    options: [
      { id: "opt-a", text: "1/4" },
      { id: "opt-b", text: "1/2" },
      { id: "opt-c", text: "3/4" },
      { id: "opt-d", text: "2/3" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Dividing both numerator and denominator of 2/4 by 2 gives 1/2.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-pri-eng-01",
    topic_id: "top-pri-eng-vocab-01",
    question_type: "single_choice",
    prompt: "Choose the word OPPOSITE in meaning to ANCIENT:",
    options: [
      { id: "opt-a", text: "Old" },
      { id: "opt-b", text: "Modern" },
      { id: "opt-c", text: "Antique" },
      { id: "opt-d", text: "Traditional" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "'Ancient' means very old or from long ago; its direct opposite is 'Modern'.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-pri-sci-01",
    topic_id: "top-pri-sci-env-01",
    question_type: "single_choice",
    prompt: "Green plants produce their food using sunlight through a biological process called:",
    options: [
      { id: "opt-a", text: "Respiration" },
      { id: "opt-b", text: "Photosynthesis" },
      { id: "opt-c", text: "Germination" },
      { id: "opt-d", text: "Digestion" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Photosynthesis is the process by which green plants manufacture glucose from carbon dioxide and water in the presence of chlorophyll and sunlight.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-pri-eng-02",
    topic_id: "top-pri-eng-vocab-01",
    question_type: "single_choice",
    prompt: "Choose the word nearest in meaning to the capitalized word: The merchant is WEALTHY.",
    options: [
      { id: "opt-a", text: "Poor" },
      { id: "opt-b", text: "Rich" },
      { id: "opt-c", text: "Hungry" },
      { id: "opt-d", text: "Tired" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "'Wealthy' refers to having a large amount of money, properties, or valuable resources; its closest synonym is 'Rich'.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-pri-sci-02",
    topic_id: "top-pri-sci-env-01",
    question_type: "single_choice",
    prompt: "Which part of a green plant is primarily adapted for absorbing water and dissolved minerals from the soil?",
    options: [
      { id: "opt-a", text: "Leaves" },
      { id: "opt-b", text: "Roots" },
      { id: "opt-c", text: "Flowers" },
      { id: "opt-d", text: "Stem" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Plant roots anchor the plant firmly in the ground and absorb moisture and essential mineral salts through root hair cells.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-jss-eng-02",
    topic_id: "top-jss-eng-tense-01",
    question_type: "single_choice",
    prompt: "Select the correct past participle form: 'The school bell has already _____.'",
    options: [
      { id: "opt-a", text: "rang" },
      { id: "opt-b", text: "rung" },
      { id: "opt-c", text: "ring" },
      { id: "opt-d", text: "ringed" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Following the auxiliary verb 'has', the past participle form of the irregular verb 'ring' is 'rung' (ring - rang - rung).",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-jss-sci-03",
    topic_id: "top-jss-sci-matter-01",
    question_type: "single_choice",
    prompt: "Which separation technique is most appropriate for recovering solid salt from a salt-water solution?",
    options: [
      { id: "opt-a", text: "Filtration" },
      { id: "opt-b", text: "Evaporation to dryness" },
      { id: "opt-c", text: "Magnetic separation" },
      { id: "opt-d", text: "Decantation" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Because common table salt dissolves completely in water to form a homogeneous solution, heating causes water to evaporate away, leaving crystalline salt.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-jss-math-geom-03",
    topic_id: "top-jss-math-geom-02",
    question_type: "single_choice",
    prompt: "What is the sum of the interior angles of a pentagon (5-sided polygon)?",
    options: [
      { id: "opt-a", text: "360°" },
      { id: "opt-b", text: "540°" },
      { id: "opt-c", text: "720°" },
      { id: "opt-d", text: "900°" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Using the formula Sum = (n - 2) * 180°: For a 5-sided pentagon, (5 - 2) * 180° = 3 * 180° = 540°.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  ...EXPANDED_QUESTIONS
];

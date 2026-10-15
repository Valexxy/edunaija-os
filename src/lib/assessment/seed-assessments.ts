import type { Assessment } from "./types";

export const SEED_ASSESSMENTS: Assessment[] = [
  {
    id: "asm-diagnostic-01",
    title: "National Senior Secondary Diagnostic Benchmark (JAMB/WAEC Tier)",
    description: "Evaluates comprehensive foundational readiness across Mathematics, English, Physics, Chemistry, and Biology.",
    education_level: "senior_secondary",
    status: "published",
    time_limit_seconds: 600, // 10 minutes
    created_at: new Date().toISOString()
  },
  {
    id: "asm-math-sprint-02",
    title: "Senior Secondary Mathematics: Algebra & Quadratic Sprint",
    description: "Targeted drill on quadratic equations, factoring, and polynomial root determination.",
    education_level: "senior_secondary",
    subject_id: "sub-math-01",
    status: "published",
    time_limit_seconds: 300, // 5 minutes
    created_at: new Date().toISOString()
  },
  {
    id: "asm-diagnostic-ncee-pri6",
    title: "National Primary Common Entrance (NCEE) Diagnostic Benchmark",
    description: "Evaluates foundational readiness for Primary 4-6 pupils across Mathematics, English Comprehension, and Basic Science.",
    education_level: "primary",
    status: "published",
    time_limit_seconds: 300,
    created_at: new Date().toISOString()
  },
  {
    id: "asm-diagnostic-bece-jss3",
    title: "All-Nigeria Junior Secondary (BECE) STEM & Literacy Benchmark",
    description: "Standard Basic Education Certificate Examination (BECE) drill across Basic Mathematics, English Grammar, and Basic Science.",
    education_level: "junior_secondary",
    status: "published",
    time_limit_seconds: 360,
    created_at: new Date().toISOString()
  },
  {
    id: "asm-diagnostic-jamb-arts",
    title: "National Senior Secondary Arts & Humanities Benchmark (WAEC/JAMB)",
    description: "Evaluates critical mastery across Literature in English, Government, CRS, and English Language for Arts scholars.",
    education_level: "senior_secondary",
    status: "published",
    time_limit_seconds: 480,
    created_at: new Date().toISOString()
  },
  {
    id: "asm-diagnostic-jamb-comm",
    title: "National Senior Secondary Commercial & Accounting Benchmark (WAEC/JAMB)",
    description: "Evaluates Financial Accounting, Commerce, Economics, and General Mathematics for Commercial scholars.",
    education_level: "senior_secondary",
    status: "published",
    time_limit_seconds: 480,
    created_at: new Date().toISOString()
  },
  {
    id: "asm-state-qualifier",
    title: "36 States + FCT Inter-School Academic League Qualifier",
    description: "Official statewide and zonal qualifying round testing core STEM and English problem-solving speed.",
    education_level: "senior_secondary",
    status: "published",
    time_limit_seconds: 420,
    created_at: new Date().toISOString()
  },
  {
    id: "asm-sprint-pri-math",
    title: "Primary 6 Mathematics: Fractions & Quantitative Arithmetic Sprint",
    description: "Quick drill on equivalent fractions, 3-digit addition, and arithmetic puzzles.",
    education_level: "primary",
    subject_id: "sub-pri-math-09",
    status: "published",
    time_limit_seconds: 240,
    created_at: new Date().toISOString()
  },
  {
    id: "asm-sprint-pri-eng",
    title: "Primary 6 Verbal Aptitude: Antonyms & Word Association Sprint",
    description: "Fast-paced vocabulary drill testing opposites, synonyms, and analogies.",
    education_level: "primary",
    subject_id: "sub-pri-eng-10",
    status: "published",
    time_limit_seconds: 200,
    created_at: new Date().toISOString()
  },
  {
    id: "asm-sprint-pri-sci",
    title: "Primary 6 Science: Living Organisms & Hygiene Sprint",
    description: "Foundational science review testing photosynthesis, green plants, and personal health.",
    education_level: "primary",
    subject_id: "sub-pri-sci-11",
    status: "published",
    time_limit_seconds: 200,
    created_at: new Date().toISOString()
  }
];

export const ASSESSMENT_QUESTION_MAP: Record<string, string[]> = {
  "asm-sprint-pri-math": [
    "qst-pri-math-01",
    "qst-pri-math-02",
    "qst-pri-exp-01",
    "qst-stat-ncee-01",
    "qst-stat-ncee-02",
    "qst-stat-ncee-03"
  ],
  "asm-sprint-pri-eng": [
    "qst-pri-eng-01",
    "qst-pri-exp-02",
    "qst-stat-ncee-04"
  ],
  "asm-sprint-pri-sci": [
    "qst-pri-sci-01",
    "qst-stat-ncee-05"
  ],
  "asm-diagnostic-01": [
    "qst-math-01",
    "qst-math-02",
    "qst-eng-01",
    "qst-phy-01",
    "qst-chem-01",
    "qst-bio-01"
  ],
  "asm-math-sprint-02": [
    "qst-math-01",
    "qst-math-02",
    "qst-stat-bece-01"
  ],
  "asm-diagnostic-ncee-pri6": [
    "qst-pri-math-01",
    "qst-pri-math-02",
    "qst-pri-eng-01",
    "qst-pri-sci-01",
    "qst-pri-exp-01",
    "qst-pri-exp-02",
    "qst-stat-ncee-01",
    "qst-stat-ncee-02",
    "qst-stat-ncee-03",
    "qst-stat-ncee-04",
    "qst-stat-ncee-05"
  ],
  "asm-diagnostic-bece-jss3": [
    "qst-jss-math-01",
    "qst-jss-math-02",
    "qst-jss-eng-01",
    "qst-jss-sci-01",
    "qst-jss-sci-02",
    "qst-stat-bece-01",
    "qst-stat-bece-02",
    "qst-stat-bece-03",
    "qst-stat-bece-04",
    "qst-stat-bece-05"
  ],
  "asm-diagnostic-jamb-arts": [
    "qst-eng-01",
    "qst-eng-02",
    "qst-lit-exp-01",
    "qst-lit-exp-02",
    "qst-gov-exp-01",
    "qst-gov-exp-02",
    "qst-crs-exp-01",
    "qst-stat-arts-01",
    "qst-stat-arts-02",
    "qst-stat-arts-03",
    "qst-stat-arts-04"
  ],
  "asm-diagnostic-jamb-comm": [
    "qst-eng-01",
    "qst-math-01",
    "qst-acc-exp-01",
    "qst-acc-exp-02",
    "qst-comm-exp-01",
    "qst-econ-exp-01",
    "qst-stat-comm-01",
    "qst-stat-comm-02",
    "qst-stat-comm-03",
    "qst-stat-comm-04"
  ],
  "asm-state-qualifier": [
    "qst-math-01",
    "qst-math-03",
    "qst-eng-01",
    "qst-phy-01",
    "qst-chem-01",
    "qst-stat-phy-01",
    "qst-stat-chem-01"
  ]
};

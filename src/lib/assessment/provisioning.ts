import type { Assessment } from "./types";
import type { EducationLevel, AcademicTrack } from "@/lib/curriculum/types";
import { SEED_ASSESSMENTS, ASSESSMENT_QUESTION_MAP } from "./seed-assessments";

export interface ProvisionedAssessment extends Assessment {
  class_target?: string;
  exam_target?: string;
  state_target?: string;
  category?: "diagnostic" | "sprint" | "challenge" | "standard";
  is_provisioned?: boolean;
}

export interface LearnerProfileParams {
  education_level?: string;
  department?: string;
  class_label?: string;
  exam_goal?: string;
  state_name?: string;
  preferred_language?: string;
}

/**
 * Resolves the student's academic pathway / track dynamically:
 * - "arts" for Arts & Humanities
 * - "commercial" for Commercial & Business Studies
 * - "science" for Science & STEM
 * - "technical" for Technical & Vocational
 * - "general" for Junior Secondary and Primary
 */
export function resolveAcademicTrack(classLabel?: string, educationLevel?: string): AcademicTrack {
  if (!classLabel || educationLevel === "junior_secondary" || educationLevel === "primary") {
    return "general";
  }
  const lower = classLabel.toLowerCase();
  if (lower.includes("art")) return "arts";
  if (lower.includes("commercial") || lower.includes("commerce") || lower.includes("business")) return "commercial";
  if (lower.includes("tech")) return "technical";
  if (lower.includes("science")) return "science";
  return "science";
}

// Master question mapping for all known provisioned assessment templates
export const PROVISIONED_QUESTION_MAP: Record<string, string[]> = {
  // Senior Secondary & JAMB UTME (Science)
  "asm-diagnostic-jamb-sss3": [
    "qst-math-01",
    "qst-math-02",
    "qst-eng-01",
    "qst-phy-01",
    "qst-chem-01",
    "qst-bio-01"
  ],
  "asm-diagnostic-waec-sss": [
    "qst-math-01",
    "qst-math-03",
    "qst-eng-01",
    "qst-eng-02",
    "qst-phy-02",
    "qst-chem-02"
  ],
  "asm-sprint-sss-math-quad": [
    "qst-math-01",
    "qst-math-02"
  ],
  "asm-sprint-sss-math-trig": [
    "qst-math-03"
  ],
  "asm-sprint-sss-eng-concord": [
    "qst-eng-01",
    "qst-eng-02"
  ],
  "asm-sprint-sss-phy-mech": [
    "qst-phy-01",
    "qst-phy-02"
  ],
  "asm-sprint-sss-chem-atom": [
    "qst-chem-01",
    "qst-chem-02"
  ],
  "asm-sprint-sss-bio-cell": [
    "qst-bio-01",
    "qst-bio-02"
  ],

  // Senior Secondary & JAMB UTME (Arts & Humanities)
  "asm-diagnostic-jamb-arts": [
    "qst-eng-01",
    "qst-eng-02",
    "qst-math-01",
    "qst-lit-exp-01",
    "qst-lit-exp-03",
    "qst-gov-exp-01",
    "qst-gov-exp-03",
    "qst-crs-exp-01",
    "qst-crs-exp-03"
  ],
  "asm-sprint-sss-lit-device": [
    "qst-lit-exp-01",
    "qst-lit-exp-02"
  ],
  "asm-sprint-sss-lit-drama": [
    "qst-lit-exp-03",
    "qst-lit-exp-04"
  ],
  "asm-sprint-sss-gov-const": [
    "qst-gov-exp-01",
    "qst-gov-exp-02"
  ],
  "asm-sprint-sss-gov-arms": [
    "qst-gov-exp-03",
    "qst-gov-exp-04"
  ],
  "asm-sprint-sss-crs-faith": [
    "qst-crs-exp-01",
    "qst-crs-exp-02"
  ],
  "asm-sprint-sss-crs-gospel": [
    "qst-crs-exp-03",
    "qst-crs-exp-04"
  ],

  // Senior Secondary & JAMB UTME (Commercial & Business)
  "asm-diagnostic-jamb-comm": [
    "qst-eng-01",
    "qst-eng-02",
    "qst-math-01",
    "qst-comm-exp-01",
    "qst-comm-exp-03",
    "qst-acc-exp-01",
    "qst-acc-exp-03",
    "qst-econ-exp-01",
    "qst-econ-exp-03"
  ],
  "asm-sprint-sss-comm-trade": [
    "qst-comm-exp-01",
    "qst-comm-exp-02"
  ],
  "asm-sprint-sss-comm-foreign": [
    "qst-comm-exp-03",
    "qst-comm-exp-04"
  ],
  "asm-sprint-sss-acc-entry": [
    "qst-acc-exp-01",
    "qst-acc-exp-02"
  ],
  "asm-sprint-sss-acc-balance": [
    "qst-acc-exp-03",
    "qst-acc-exp-04"
  ],
  "asm-sprint-sss-econ-demand": [
    "qst-econ-exp-01",
    "qst-econ-exp-02"
  ],
  "asm-sprint-sss-econ-macro": [
    "qst-econ-exp-03",
    "qst-econ-exp-04"
  ],

  // Junior Secondary & BECE
  "asm-diagnostic-bece-jss3": [
    "qst-jss-math-01",
    "qst-jss-math-02",
    "qst-jss-eng-01",
    "qst-jss-sci-01",
    "qst-jss-sci-02"
  ],
  "asm-sprint-jss-math": [
    "qst-jss-math-01",
    "qst-jss-math-02"
  ],
  "asm-sprint-jss-eng": [
    "qst-jss-eng-01"
  ],
  "asm-sprint-jss-sci": [
    "qst-jss-sci-01",
    "qst-jss-sci-02"
  ],

  // Primary & Common Entrance (NCEE)
  "asm-diagnostic-ncee-pri6": [
    "qst-pri-math-01",
    "qst-pri-math-02",
    "qst-pri-eng-01",
    "qst-pri-eng-02",
    "qst-pri-sci-01",
    "qst-pri-sci-02"
  ],
  "asm-sprint-pri-math": [
    "qst-pri-math-01",
    "qst-pri-math-02"
  ],
  "asm-sprint-pri-eng": [
    "qst-pri-eng-01",
    "qst-pri-eng-02"
  ],
  "asm-sprint-pri-sci": [
    "qst-pri-sci-01",
    "qst-pri-sci-02"
  ],

  // State Championship Drill
  "asm-state-qualifier": [
    "qst-math-01",
    "qst-math-03",
    "qst-phy-01",
    "qst-chem-01"
  ]
};

/**
 * Dynamically provisions specialized CBT tests and learning tracks
 * strictly calibrated to the student's selected academic track (Science, Arts, Commercial),
 * class, exam target, and state.
 */
export function getProvisionedAssessments(profile?: LearnerProfileParams | null): ProvisionedAssessment[] {
  const classLabel = profile?.class_label || "SSS 3";
  const clLower = classLabel.toLowerCase();

  let level: EducationLevel = "senior_secondary";
  if (
    clLower.includes("primary") ||
    clLower.includes("basic 1") ||
    clLower.includes("basic 2") ||
    clLower.includes("basic 3") ||
    clLower.includes("basic 4") ||
    clLower.includes("basic 5") ||
    clLower.includes("basic 6") ||
    clLower.startsWith("pri")
  ) {
    level = "primary";
  } else if (
    clLower.includes("jss") ||
    clLower.includes("junior") ||
    clLower.includes("basic 7") ||
    clLower.includes("basic 8") ||
    clLower.includes("basic 9")
  ) {
    level = "junior_secondary";
  } else if (profile?.education_level) {
    level = profile.education_level as EducationLevel;
  }

  const examGoal = profile?.exam_goal || (level === "junior_secondary" ? "BECE 2026" : level === "primary" ? "National Common Entrance (NCEE)" : "JAMB UTME 2026");
  const state = profile?.state_name || "Anambra";
  const track = resolveAcademicTrack(classLabel, level);

  const provisioned: ProvisionedAssessment[] = [];

  // 1. Junior Secondary Target Diagnostic & Sprints
  if (level === "junior_secondary") {
    provisioned.push({
      id: "asm-diagnostic-bece-jss3",
      title: `${examGoal}: ${classLabel} Multi-Subject Readiness Exam`,
      description: `Comprehensive BECE diagnostic testing Basic Mathematics, English Studies, and Basic Science & Technology for ${classLabel} scholars.`,
      education_level: "junior_secondary",
      status: "published",
      time_limit_seconds: 480,
      class_target: classLabel,
      exam_target: examGoal,
      state_target: state,
      category: "diagnostic",
      is_provisioned: true,
      created_at: new Date().toISOString()
    });

    provisioned.push(
      {
        id: "asm-sprint-jss-math",
        title: `${classLabel} Basic Mathematics: Linear Equations & Geometry Sprint`,
        description: `Targeted drill on one-variable linear equations and interior angles of triangles.`,
        education_level: "junior_secondary",
        subject_id: "sub-jss-math-06",
        status: "published",
        time_limit_seconds: 300,
        class_target: classLabel,
        exam_target: examGoal,
        category: "sprint",
        is_provisioned: true,
        created_at: new Date().toISOString()
      },
      {
        id: "asm-sprint-jss-eng",
        title: `${classLabel} English Studies: Parts of Speech & Grammar Sprint`,
        description: `Speed assessment testing adverbs of manner, adjectives, and sentence modifiers.`,
        education_level: "junior_secondary",
        subject_id: "sub-jss-eng-07",
        status: "published",
        time_limit_seconds: 240,
        class_target: classLabel,
        exam_target: examGoal,
        category: "sprint",
        is_provisioned: true,
        created_at: new Date().toISOString()
      },
      {
        id: "asm-sprint-jss-sci",
        title: `${classLabel} Basic Science: Matter & Living Systems Sprint`,
        description: `Assess mastery of physical vs chemical changes, cell theory, and living organisms.`,
        education_level: "junior_secondary",
        subject_id: "sub-jss-sci-08",
        status: "published",
        time_limit_seconds: 300,
        class_target: classLabel,
        exam_target: examGoal,
        category: "sprint",
        is_provisioned: true,
        created_at: new Date().toISOString()
      }
    );
  } else if (level === "primary") {
    // 2. Primary & Common Entrance Target Diagnostic & Sprints
    provisioned.push({
      id: "asm-diagnostic-ncee-pri6",
      title: `${examGoal}: ${classLabel} Quantitative & Verbal Aptitude Benchmark`,
      description: `Unity College admission simulator testing Quantitative Reasoning, Verbal Aptitude, and Basic Science for ${classLabel}.`,
      education_level: "primary",
      status: "published",
      time_limit_seconds: 360,
      class_target: classLabel,
      exam_target: examGoal,
      state_target: state,
      category: "diagnostic",
      is_provisioned: true,
      created_at: new Date().toISOString()
    });

    provisioned.push(
      {
        id: "asm-sprint-pri-math",
        title: `${classLabel} Mathematics: Fractions & Quantitative Arithmetic Sprint`,
        description: `Quick drill on equivalent fractions, 3-digit addition, and arithmetic puzzles.`,
        education_level: "primary",
        subject_id: "sub-pri-math-09",
        status: "published",
        time_limit_seconds: 240,
        class_target: classLabel,
        exam_target: examGoal,
        category: "sprint",
        is_provisioned: true,
        created_at: new Date().toISOString()
      },
      {
        id: "asm-sprint-pri-eng",
        title: `${classLabel} Verbal Aptitude: Antonyms & Word Association Sprint`,
        description: `Fast-paced vocabulary drill testing opposites, synonyms, and analogies.`,
        education_level: "primary",
        subject_id: "sub-pri-eng-10",
        status: "published",
        time_limit_seconds: 200,
        class_target: classLabel,
        exam_target: examGoal,
        category: "sprint",
        is_provisioned: true,
        created_at: new Date().toISOString()
      },
      {
        id: "asm-sprint-pri-sci",
        title: `${classLabel} Primary Science: Living Organisms & Hygiene Sprint`,
        description: `Foundational science review testing photosynthesis, green plants, and personal health.`,
        education_level: "primary",
        subject_id: "sub-pri-sci-11",
        status: "published",
        time_limit_seconds: 200,
        class_target: classLabel,
        exam_target: examGoal,
        category: "sprint",
        is_provisioned: true,
        created_at: new Date().toISOString()
      }
    );
  } else {
    // 3. Senior Secondary & Exam Prep (Dynamically branched by Academic Track)
    if (track === "arts") {
      // Arts & Humanities Diagnostic
      provisioned.push({
        id: "asm-diagnostic-jamb-arts",
        title: `${examGoal}: ${classLabel} Arts & Humanities Benchmark`,
        description: `Curriculum simulation testing English Language, General Mathematics, Literature-in-English, Government, and Christian Religious Studies for ${classLabel}.`,
        education_level: "senior_secondary",
        status: "published",
        time_limit_seconds: 600,
        class_target: classLabel,
        exam_target: examGoal,
        state_target: state,
        category: "diagnostic",
        is_provisioned: true,
        created_at: new Date().toISOString()
      });

      // Arts Sprints
      provisioned.push(
        {
          id: "asm-sprint-sss-lit-device",
          title: `${classLabel} Literature: Figures of Speech & Literary Appreciation Sprint`,
          description: `Rapid-fire questions analyzing metaphor, personification, oxymoron, and dramatic irony.`,
          education_level: "senior_secondary",
          subject_id: "sub-lit-12",
          status: "published",
          time_limit_seconds: 240,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        },
        {
          id: "asm-sprint-sss-gov-const",
          title: `${classLabel} Government: Nigerian Constitutional Milestones Sprint`,
          description: `Test understanding of Clifford 1922, Richards 1946, Macpherson 1951, and Lyttelton 1954 constitutions.`,
          education_level: "senior_secondary",
          subject_id: "sub-gov-13",
          status: "published",
          time_limit_seconds: 240,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        },
        {
          id: "asm-sprint-sss-crs-faith",
          title: `${classLabel} CRS: Old Testament Sovereignty & Covenant Sprint`,
          description: `Review themes on the Call of Abraham, Mosaic Covenant, and God\'s sovereignty.`,
          education_level: "senior_secondary",
          subject_id: "sub-crs-14",
          status: "published",
          time_limit_seconds: 240,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        },
        {
          id: "asm-sprint-sss-eng-concord",
          title: `${classLabel} English: Grammatical Concord & Lexis Sprint`,
          description: `Proximity rules, correlative conjunctions, and advanced WAEC/JAMB vocabulary.`,
          education_level: "senior_secondary",
          subject_id: "sub-eng-02",
          status: "published",
          time_limit_seconds: 240,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        },
        {
          id: "asm-sprint-sss-math-quad",
          title: `${classLabel} Mathematics: Quadratic Equations & Algebra Sprint`,
          description: `Core general mathematics review on quadratic roots, discriminant b²-4ac, and factorization.`,
          education_level: "senior_secondary",
          subject_id: "sub-math-01",
          status: "published",
          time_limit_seconds: 300,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        }
      );
    } else if (track === "commercial") {
      // Commercial & Business Diagnostic
      provisioned.push({
        id: "asm-diagnostic-jamb-comm",
        title: `${examGoal}: ${classLabel} Commercial & Business Benchmark`,
        description: `Comprehensive exam testing English Language, General Mathematics, Commerce, Financial Accounting, and Economics for ${classLabel}.`,
        education_level: "senior_secondary",
        status: "published",
        time_limit_seconds: 600,
        class_target: classLabel,
        exam_target: examGoal,
        state_target: state,
        category: "diagnostic",
        is_provisioned: true,
        created_at: new Date().toISOString()
      });

      // Commercial Sprints
      provisioned.push(
        {
          id: "asm-sprint-sss-acc-entry",
          title: `${classLabel} Accounting: Double-Entry & Ledger Accounts Sprint`,
          description: `Practical questions evaluating debits, credits, real/nominal accounts, and cash book entries.`,
          education_level: "senior_secondary",
          subject_id: "sub-acc-16",
          status: "published",
          time_limit_seconds: 300,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        },
        {
          id: "asm-sprint-sss-comm-trade",
          title: `${classLabel} Commerce: Home Trade & Aids to Trade Sprint`,
          description: `Assess mastery of wholesale distribution, retail channels, transport, and banking utility.`,
          education_level: "senior_secondary",
          subject_id: "sub-comm-15",
          status: "published",
          time_limit_seconds: 240,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        },
        {
          id: "asm-sprint-sss-econ-demand",
          title: `${classLabel} Economics: Elasticity of Demand & Market Pricing Sprint`,
          description: `Solve price elasticity calculations, shifts in supply, and equilibrium price dynamics.`,
          education_level: "senior_secondary",
          subject_id: "sub-econ-17",
          status: "published",
          time_limit_seconds: 240,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        },
        {
          id: "asm-sprint-sss-eng-concord",
          title: `${classLabel} English: Grammatical Concord & Lexis Sprint`,
          description: `Proximity rules, correlative conjunctions, and advanced WAEC/JAMB vocabulary.`,
          education_level: "senior_secondary",
          subject_id: "sub-eng-02",
          status: "published",
          time_limit_seconds: 240,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        },
        {
          id: "asm-sprint-sss-math-quad",
          title: `${classLabel} Mathematics: Quadratic Equations & Algebra Sprint`,
          description: `Core general mathematics review on quadratic roots, discriminant b²-4ac, and factorization.`,
          education_level: "senior_secondary",
          subject_id: "sub-math-01",
          status: "published",
          time_limit_seconds: 300,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        }
      );
    } else {
      // Science & STEM Track (Default for SSS Science / General)
      const isJamb = examGoal.toLowerCase().includes("jamb") || examGoal.toLowerCase().includes("utme");
      
      provisioned.push({
        id: isJamb ? "asm-diagnostic-jamb-sss3" : "asm-diagnostic-waec-sss",
        title: `${examGoal}: ${classLabel} Comprehensive Diagnostic Benchmark`,
        description: `Official multi-subject simulation covering Mathematics, English, Physics, Chemistry, and Biology. Calibrated against national ${examGoal} cut-offs for ${classLabel}.`,
        education_level: "senior_secondary",
        status: "published",
        time_limit_seconds: 600,
        class_target: classLabel,
        exam_target: examGoal,
        state_target: state,
        category: "diagnostic",
        is_provisioned: true,
        created_at: new Date().toISOString()
      });

      provisioned.push(
        {
          id: "asm-sprint-sss-math-quad",
          title: `${classLabel} Mathematics: Quadratic Equations & Algebra Sprint`,
          description: `Targeted drill on quadratic roots, discriminant b²-4ac analysis, and factorization.`,
          education_level: "senior_secondary",
          subject_id: "sub-math-01",
          status: "published",
          time_limit_seconds: 300,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        },
        {
          id: "asm-sprint-sss-math-trig",
          title: `${classLabel} Mathematics: Special Angles Trigonometry Sprint`,
          description: `Rapid-fire questions evaluating exact trigonometric ratios (30°, 45°, 60°).`,
          education_level: "senior_secondary",
          subject_id: "sub-math-01",
          status: "published",
          time_limit_seconds: 180,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        },
        {
          id: "asm-sprint-sss-eng-concord",
          title: `${classLabel} English: Grammatical Concord & Lexis Sprint`,
          description: `Proximity rules, correlative conjunctions, and advanced WAEC/JAMB vocabulary.`,
          education_level: "senior_secondary",
          subject_id: "sub-eng-02",
          status: "published",
          time_limit_seconds: 240,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        },
        {
          id: "asm-sprint-sss-phy-mech",
          title: `${classLabel} Physics: Kinematics & Work-Energy Sprint`,
          description: `Uniform acceleration equations, distance covered, and mechanical power calculation.`,
          education_level: "senior_secondary",
          subject_id: "sub-phy-03",
          status: "published",
          time_limit_seconds: 300,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        },
        {
          id: "asm-sprint-sss-chem-atom",
          title: `${classLabel} Chemistry: Atomic Theory & Periodic Trends Sprint`,
          description: `Electronic configurations, valence shells, first ionization energies, and period 3 properties.`,
          education_level: "senior_secondary",
          subject_id: "sub-chem-04",
          status: "published",
          time_limit_seconds: 240,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        },
        {
          id: "asm-sprint-sss-bio-cell",
          title: `${classLabel} Biology: Cell Ultra-Structure & Osmosis Sprint`,
          description: `Mitochondrial energy, plasmolysis in plant cells, and diffusion concentration gradients.`,
          education_level: "senior_secondary",
          subject_id: "sub-bio-05",
          status: "published",
          time_limit_seconds: 240,
          class_target: classLabel,
          exam_target: examGoal,
          category: "sprint",
          is_provisioned: true,
          created_at: new Date().toISOString()
        }
      );
    }
  }

  // 4. Geopolitical State Qualifier Challenge
  const qualifierTitle = track === "arts"
    ? `${state} State Arts & Humanities League Qualifier`
    : track === "commercial"
    ? `${state} State Commercial League Qualifier`
    : `${state} State STEM League Qualifier`;

  provisioned.push({
    id: "asm-state-qualifier",
    title: qualifierTitle,
    description: `Official state-wide qualifying round. Scores count toward your LGA and ${state} State school rankings.`,
    education_level: level as EducationLevel,
    status: "published",
    time_limit_seconds: 420,
    class_target: classLabel,
    exam_target: examGoal,
    state_target: state,
    category: "challenge",
    is_provisioned: true,
    created_at: new Date().toISOString()
  });

  return provisioned;
}

/**
 * Resolves questions for either built-in seed assessments or dynamically provisioned ones.
 * Strictly shields Primary learners from receiving Senior Secondary (SSS) or JSS questions.
 */
export function resolveQuestionIdsForAssessment(
  assessmentId: string,
  profileParams?: LearnerProfileParams | null
): string[] {
  const cl = (profileParams?.class_label || "").toLowerCase();
  const isPrimary =
    cl.includes("primary") ||
    cl.includes("basic 1") ||
    cl.includes("basic 2") ||
    cl.includes("basic 3") ||
    cl.includes("basic 4") ||
    cl.includes("basic 5") ||
    cl.includes("basic 6") ||
    cl.startsWith("pri") ||
    profileParams?.education_level === "primary";

  if (isPrimary) {
    if (assessmentId === "asm-sprint-pri-math") return PROVISIONED_QUESTION_MAP["asm-sprint-pri-math"];
    if (assessmentId === "asm-sprint-pri-eng") return PROVISIONED_QUESTION_MAP["asm-sprint-pri-eng"];
    if (assessmentId === "asm-sprint-pri-sci") return PROVISIONED_QUESTION_MAP["asm-sprint-pri-sci"];
    // For any diagnostic, state qualifier, or misrouted test, guarantee genuine Primary items:
    return [
      "qst-pri-math-01",
      "qst-pri-math-02",
      "qst-pri-eng-01",
      "qst-pri-eng-02",
      "qst-pri-sci-01",
      "qst-pri-sci-02"
    ];
  }

  if (PROVISIONED_QUESTION_MAP[assessmentId]) {
    return PROVISIONED_QUESTION_MAP[assessmentId];
  }
  return ASSESSMENT_QUESTION_MAP[assessmentId] || ["qst-math-01", "qst-eng-01"];
}

/**
 * Finds an assessment by ID, searching both the static seed list and
 * generating it on the fly if it is a recognized provisioned pattern.
 */
export function resolveAssessmentById(id: string, profileParams?: LearnerProfileParams | null): Assessment | undefined {
  const staticFound = SEED_ASSESSMENTS.find((a) => a.id === id);
  if (staticFound) return staticFound;

  if (profileParams) {
    const provisioned = getProvisionedAssessments(profileParams);
    const found = provisioned.find((a) => a.id === id);
    if (found) return found;

    // Primary Shield for bookmarked or redirected assessment routes:
    const cl = (profileParams.class_label || "").toLowerCase();
    const isPrimary =
      cl.includes("primary") ||
      cl.includes("basic 1") ||
      cl.includes("basic 2") ||
      cl.includes("basic 3") ||
      cl.includes("basic 4") ||
      cl.includes("basic 5") ||
      cl.includes("basic 6") ||
      cl.startsWith("pri") ||
      profileParams.education_level === "primary";

    if (isPrimary) {
      const primaryDiag = provisioned.find((a) => a.id.startsWith("asm-diagnostic-") || a.category === "diagnostic");
      if (primaryDiag) {
        return {
          ...primaryDiag,
          id // Preserve requested ID so client router doesn't 404
        };
      }
    }
  }

  // Multi-tier scan across all statutory tiers (Primary, JSS, SSS Science, Commercial, Arts)
  const tierConfigs: LearnerProfileParams[] = [
    { education_level: "primary", class_label: "Primary 6", exam_goal: "National Common Entrance" },
    { education_level: "junior_secondary", class_label: "JSS 3", exam_goal: "BECE 2026" },
    { education_level: "senior_secondary", class_label: "SSS 3 Science", exam_goal: "JAMB UTME 2026" },
    { education_level: "senior_secondary", class_label: "SSS 3 Science", exam_goal: "WAEC SSCE" },
    { education_level: "senior_secondary", class_label: "SSS 3 Commercial", exam_goal: "JAMB UTME 2026" },
    { education_level: "senior_secondary", class_label: "SSS 3 Arts", exam_goal: "JAMB UTME 2026" }
  ];

  for (const config of tierConfigs) {
    const list = getProvisionedAssessments(config);
    const match = list.find((a) => a.id === id);
    if (match) return match;
  }

  return undefined;
}

/**
 * LearnNaija OS - Statutory Class-to-Subject Matrix & Intelligent Topic Recommender
 * 
 * Maps statutory Nigerian curriculum (NERDC) subjects according to educational tiers
 * (Primary, JSS, SSS Science/Commercial/Arts, JAMB/UTME Prep) and provides an
 * intelligent topic classifier to eliminate subject mismatches (such as teaching
 * Economics under Mathematics).
 */

import { SEED_SUBJECTS, SEED_TOPICS } from "./seed-data";
import type { EducationLevel, AcademicTrack } from "./types";

export interface SubjectOption {
  id: string;
  name: string;
  slug: string;
  tier: EducationLevel;
  track?: AcademicTrack;
  description: string;
}

export interface RecommendationResult {
  subjectName: string;
  subjectId: string;
  tier: "primary" | "junior_secondary" | "senior_secondary" | "exam_prep";
  track?: AcademicTrack;
  confidence: number; // 0.0 - 1.0
  matchedTopicTitle?: string;
  matchedTopicCode?: string;
  reason: string;
}

// Statutory Keyword Bank for Subject Affinity Classification
const SUBJECT_KEYWORD_MATRIX: Record<string, { subjectId: string; subjectName: string; tier: "senior_secondary" | "junior_secondary" | "primary"; track?: AcademicTrack; keywords: string[] }> = {
  economics: {
    subjectId: "sub-econ-17",
    subjectName: "Economics",
    tier: "senior_secondary",
    track: "commercial",
    keywords: [
      "demand", "supply", "market equilibrium", "equilibrium price", "equilibrium quantity",
      "elasticity", "inflation", "fiscal policy", "monetary policy", "ceteris paribus",
      "gdp", "gnp", "national income", "macroeconomics", "microeconomics", "subsidy",
      "consumer", "producer", "utility", "opportunity cost", "scarcity", "budget", "taxation"
    ]
  },
  financial_accounting: {
    subjectId: "sub-acc-16",
    subjectName: "Financial Accounting",
    tier: "senior_secondary",
    track: "commercial",
    keywords: [
      "bookkeeping", "double-entry", "ledger", "debit", "credit", "trial balance",
      "balance sheet", "trading profit and loss", "depreciation", "cash book",
      "petty cash", "bank reconciliation", "bad debts", "accruals", "prepayments", "journal"
    ]
  },
  commerce: {
    subjectId: "sub-comm-15",
    subjectName: "Commerce",
    tier: "senior_secondary",
    track: "commercial",
    keywords: [
      "commerce", "trade", "retail", "wholesale", "warehousing", "advertising",
      "aids to trade", "stock exchange", "customs", "export", "import", "insurance",
      "chamber of commerce", "sole proprietorship", "partnership", "limited liability"
    ]
  },
  mathematics: {
    subjectId: "sub-math-01",
    subjectName: "General Mathematics",
    tier: "senior_secondary",
    keywords: [
      "quadratic", "discriminant", "simultaneous", "trigonometry", "calculus",
      "algebra", "logarithm", "indices", "surd", "matrices", "circle theorem",
      "geometry", "statistics", "probability", "differentiation", "integration", "polynomial"
    ]
  },
  physics: {
    subjectId: "sub-phy-03",
    subjectName: "Physics",
    tier: "senior_secondary",
    track: "science",
    keywords: [
      "newton", "velocity", "acceleration", "momentum", "mechanics", "friction",
      "gravity", "thermodynamics", "optics", "refraction", "reflection", "lens",
      "electricity", "resistance", "resistor", "ohm", "voltage", "current", "magnetic", "electromagnetism"
    ]
  },
  chemistry: {
    subjectId: "sub-chem-04",
    subjectName: "Chemistry",
    tier: "senior_secondary",
    track: "science",
    keywords: [
      "mole", "stoichiometry", "periodic table", "atomic structure", "chemical bond",
      "acid", "base", "ph", "titration", "organic chemistry", "alkane", "alkene",
      "electrolysis", "redox", "oxidation", "reduction", "solubility", "equilibrium constant"
    ]
  },
  biology: {
    subjectId: "sub-bio-05",
    subjectName: "Biology",
    tier: "senior_secondary",
    track: "science",
    keywords: [
      "photosynthesis", "cell", "mitosis", "meiosis", "osmosis", "diffusion",
      "respiration", "circulatory", "genetics", "dna", "inheritance", "ecology",
      "ecosystem", "enzyme", "digestive", "hormone", "reproduction", "plant nutrition"
    ]
  },
  english: {
    subjectId: "sub-eng-02",
    subjectName: "English Language",
    tier: "senior_secondary",
    keywords: [
      "concord", "subject-verb", "grammar", "tense", "preposition", "adjective",
      "adverb", "lexis", "structure", "oral english", "vowel", "consonant", "stress pattern",
      "comprehension", "summary", "essay", "idiom", "antonym", "synonym"
    ]
  },
  literature: {
    subjectId: "sub-lit-12",
    subjectName: "Literature-in-English",
    tier: "senior_secondary",
    track: "arts",
    keywords: [
      "literature", "poem", "poetry", "prose", "drama", "sonnet", "stanza",
      "rhyme", "metaphor", "simile", "personification", "irony", "alliteration",
      "soliloquy", "protagonist", "antagonist", "playwright"
    ]
  },
  government: {
    subjectId: "sub-gov-13",
    subjectName: "Government",
    tier: "senior_secondary",
    track: "arts",
    keywords: [
      "government", "constitution", "democracy", "separation of powers", "rule of law",
      "judiciary", "legislature", "executive", "federalism", "local government",
      "citizenship", "human rights", "suffrage", "elections", "political party"
    ]
  },
  crs: {
    subjectId: "sub-crs-14",
    subjectName: "Christian Religious Studies",
    tier: "senior_secondary",
    track: "arts",
    keywords: [
      "jesus", "gospel", "apostles", "paul", "old testament", "new testament",
      "covenant", "faith", "disciple", "resurrection", "commandments", "prophet"
    ]
  },
  jss_basic_science: {
    subjectId: "sub-jss-sci-08",
    subjectName: "Basic Science & Technology",
    tier: "junior_secondary",
    keywords: [
      "matter", "living things", "energy", "force", "habitat", "pollution",
      "tools", "safety", "woodwork", "metalwork", "first aid"
    ]
  },
  jss_basic_math: {
    subjectId: "sub-jss-math-06",
    subjectName: "Basic Mathematics (JSS)",
    tier: "junior_secondary",
    keywords: [
      "fractions", "decimals", "percentages", "simple interest", "perimeter",
      "area of triangle", "angles", "parallel lines", "basic algebra"
    ]
  },
  primary_math: {
    subjectId: "sub-pri-math-09",
    subjectName: "Primary Mathematics & Quantitative Reasoning",
    tier: "primary",
    keywords: [
      "multiplication table", "addition", "subtraction", "division", "shapes",
      "time", "money", "naira", "kobo", "quantitative aptitude"
    ]
  }
};

/**
 * Intelligent Subject Recommender
 * Given any topic name, URL parameter, or educational question, determines
 * the exact statutory subject and educational tier.
 */
export function recommendSubjectForTopic(
  query: string,
  preferredTier?: string
): RecommendationResult {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return {
      subjectName: "General Mathematics",
      subjectId: "sub-math-01",
      tier: "senior_secondary",
      confidence: 0.1,
      reason: "Empty query default."
    };
  }

  // Phase 1: Exact or Substring Match against official SEED_TOPICS
  for (const topic of SEED_TOPICS) {
    const topicTitle = topic.title.toLowerCase();
    const topicCode = topic.code.toLowerCase();
    const topicDesc = topic.description.toLowerCase();

    const isMatch =
      topicTitle.includes(cleanQuery) ||
      cleanQuery.includes(topicTitle) ||
      cleanQuery.includes(topicCode) ||
      (cleanQuery.length > 8 && topicDesc.includes(cleanQuery));

    if (isMatch) {
      const subject = SEED_SUBJECTS.find((s) => s.id === topic.subject_id);
      if (subject) {
        return {
          subjectName: subject.name,
          subjectId: subject.id,
          tier: topic.education_level as "primary" | "junior_secondary" | "senior_secondary" | "exam_prep",
          confidence: 1.0,
          matchedTopicTitle: topic.title,
          matchedTopicCode: topic.code,
          reason: `Exact curriculum topic match: "${topic.title}" (${topic.code}) in ${subject.name}.`
        };
      }
    }
  }

  // Phase 2: Keyword Scoring Matrix
  let bestMatch: {
    subjectId: string;
    subjectName: string;
    tier: "senior_secondary" | "junior_secondary" | "primary";
    track?: AcademicTrack;
    score: number;
    matchedKeywords: string[];
  } | null = null;

  for (const config of Object.values(SUBJECT_KEYWORD_MATRIX)) {
    let score = 0;
    const matches: string[] = [];

    for (const kw of config.keywords) {
      if (cleanQuery.includes(kw)) {
        score += kw.length > 6 ? 2 : 1;
        matches.push(kw);
      }
    }

    // Boost score if preferred tier matches
    if (preferredTier && config.tier === preferredTier) {
      score += 0.5;
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = {
        subjectId: config.subjectId,
        subjectName: config.subjectName,
        tier: config.tier,
        track: config.track,
        score,
        matchedKeywords: matches
      };
    }
  }

  if (bestMatch && bestMatch.score > 0) {
    return {
      subjectName: bestMatch.subjectName,
      subjectId: bestMatch.subjectId,
      tier: bestMatch.tier,
      track: bestMatch.track,
      confidence: Math.min(0.95, 0.4 + bestMatch.score * 0.15),
      reason: `Detected keywords: ${bestMatch.matchedKeywords.slice(0, 3).join(", ")} indicating ${bestMatch.subjectName}.`
    };
  }

  // Phase 3: SSS Default based on preferred tier
  if (preferredTier === "primary") {
    return {
      subjectName: "Primary Mathematics & Quantitative Reasoning",
      subjectId: "sub-pri-math-09",
      tier: "primary",
      confidence: 0.3,
      reason: "Primary tier default."
    };
  }

  if (preferredTier === "junior_secondary") {
    return {
      subjectName: "Basic Science & Technology",
      subjectId: "sub-jss-sci-08",
      tier: "junior_secondary",
      confidence: 0.3,
      reason: "Junior Secondary tier default."
    };
  }

  return {
    subjectName: "General Mathematics",
    subjectId: "sub-math-01",
    tier: "senior_secondary",
    confidence: 0.2,
    reason: "Senior secondary general fallback."
  };
}

/**
 * Returns complete statutory subject list for a specific educational tier and track.
 */
export function getStatutorySubjectsForTier(
  tier: "primary" | "junior_secondary" | "senior_secondary" | "exam_prep",
  track?: AcademicTrack
): SubjectOption[] {
  return SEED_SUBJECTS.filter((s) => {
    if (tier === "primary") {
      return s.education_levels.includes("primary");
    }
    if (tier === "junior_secondary") {
      return s.education_levels.includes("junior_secondary");
    }
    // Senior Secondary or Exam Prep (WAEC / JAMB)
    if (!s.education_levels.includes("senior_secondary") && !s.education_levels.includes("exam_prep")) {
      return false;
    }
    if (!track || track === "general") {
      return true; // Show all senior secondary subjects
    }
    if (s.id === "sub-math-01" || s.id === "sub-eng-02") {
      return true; // Core subjects in all tracks
    }
    if (track === "science") {
      return s.id === "sub-phy-03" || s.id === "sub-chem-04" || s.id === "sub-bio-05";
    }
    if (track === "commercial") {
      return s.id === "sub-comm-15" || s.id === "sub-acc-16" || s.id === "sub-econ-17";
    }
    if (track === "arts") {
      return s.id === "sub-lit-12" || s.id === "sub-gov-13" || s.id === "sub-crs-14" || s.id === "sub-econ-17";
    }
    return true;
  }).map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    tier: (s.education_levels[0] as EducationLevel) || "senior_secondary",
    track: s.track,
    description: s.description
  }));
}

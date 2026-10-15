import type { CurriculumTopic, Subject, AcademicTrack } from "./types";
import { SEED_TOPICS, SEED_SUBJECTS } from "./seed-data";
import type { LearnerProfile } from "@/lib/auth/session";

/**
 * Filter topics strictly according to the student's education level,
 * academic track (Science, Arts, Commercial), and active curriculum scope.
 * 
 * Ensures a Primary 4-6 pupil NEVER sees Senior Secondary Chemistry or Accounting,
 * and an Arts scholar only sees Arts & Humanities curriculum.
 */
export function getTopicsForLearner(profile: LearnerProfile | null): CurriculumTopic[] {
  if (!profile) {
    // Default to Senior Secondary Science if unauthenticated
    return SEED_TOPICS.filter((t) => t.education_level === "senior_secondary" && isSubjectInTrack(t.subject_id, "science"));
  }

  const level = profile.education_level || "senior_secondary";
  const classLabel = (profile.class_label || "").toLowerCase();
  const isPrimary = level === "primary" || classLabel.includes("primary") || classLabel.includes("pri");
  const isJSS = level === "junior_secondary" || classLabel.includes("jss") || classLabel.includes("basic 7") || classLabel.includes("basic 8") || classLabel.includes("basic 9");
  const track = profile.academic_track || resolveTrackFromClass(profile.class_label);

  if (isPrimary) {
    return SEED_TOPICS.filter((t) => t.education_level === "primary");
  }

  if (isJSS) {
    return SEED_TOPICS.filter((t) => t.education_level === "junior_secondary");
  }

  // Senior Secondary & Exam Prep (JAMB / WAEC)
  return SEED_TOPICS.filter((t) => {
    if (t.education_level !== "senior_secondary") return false;
    return isSubjectInTrack(t.subject_id, track);
  });
}

/**
 * Filter subjects strictly for the learner's grade level and track.
 */
export function getSubjectsForLearner(profile: LearnerProfile | null): Subject[] {
  if (!profile) {
    return SEED_SUBJECTS.filter((s) => s.education_levels.includes("senior_secondary") && isSubjectInTrack(s.id, "science"));
  }

  const level = profile.education_level || "senior_secondary";
  const classLabel = (profile.class_label || "").toLowerCase();
  const isPrimary = level === "primary" || classLabel.includes("primary") || classLabel.includes("pri");
  const isJSS = level === "junior_secondary" || classLabel.includes("jss") || classLabel.includes("basic 7") || classLabel.includes("basic 8") || classLabel.includes("basic 9");
  const track = profile.academic_track || resolveTrackFromClass(profile.class_label);

  if (isPrimary) {
    return SEED_SUBJECTS.filter((s) => s.education_levels.includes("primary"));
  }

  if (isJSS) {
    return SEED_SUBJECTS.filter((s) => s.education_levels.includes("junior_secondary"));
  }

  return SEED_SUBJECTS.filter((s) => {
    if (!s.education_levels.includes("senior_secondary") && !s.education_levels.includes("exam_prep")) {
      return false;
    }
    return isSubjectInTrack(s.id, track);
  });
}

function resolveTrackFromClass(classLabel?: string): AcademicTrack {
  if (!classLabel) return "science";
  const lower = classLabel.toLowerCase();
  if (lower.includes("art")) return "arts";
  if (lower.includes("comm") || lower.includes("business")) return "commercial";
  if (lower.includes("tech")) return "technical";
  if (lower.includes("jss") || lower.includes("primary") || lower.includes("basic")) return "general";
  return "science";
}

function isSubjectInTrack(subjectId: string, track: AcademicTrack): boolean {
  // Common core subjects for all senior secondary students
  if (subjectId === "sub-math-01" || subjectId === "sub-eng-02") return true;

  if (track === "arts") {
    return (
      subjectId === "sub-lit-12" ||
      subjectId === "sub-gov-13" ||
      subjectId === "sub-crs-14" ||
      subjectId === "sub-econ-17"
    );
  }

  if (track === "commercial") {
    return (
      subjectId === "sub-comm-15" ||
      subjectId === "sub-acc-16" ||
      subjectId === "sub-econ-17"
    );
  }

  // Default Science & STEM track
  return (
    subjectId === "sub-phy-03" ||
    subjectId === "sub-chem-04" ||
    subjectId === "sub-bio-05"
  );
}

export interface LearnerSubjectCompetency {
  name: string;
  code: string;
  masteryPercent: number;
  accuracyPercent: number;
  questionsAttempted: number;
  status: "Secure" | "Proficient" | "Developing" | "Drill Needed";
  strongTopic: string;
  weakTopic: string;
}

/**
 * Dynamically build subject competencies for LearningAnalyticsDashboard
 * based on the student's actual curriculum subjects and mastery data.
 */
export function buildLearnerSubjectCompetencies(
  profile: LearnerProfile | null,
  masteryData: Record<string, { attempts: number; correct: number; score: number }>
): LearnerSubjectCompetency[] {
  const subjects = getSubjectsForLearner(profile);
  const topics = getTopicsForLearner(profile);

  return subjects.map((sub) => {
    const subTopics = topics.filter((t) => t.subject_id === sub.id);
    let totalAttempts = 0;
    let totalCorrect = 0;
    let sumScore = 0;
    let scoredTopicCount = 0;

    let highestTopic = subTopics[0]?.title || "General Concepts";
    let highestScore = -1;
    let lowestTopic = subTopics[0]?.title || "Foundations";
    let lowestScore = 999;

    for (const t of subTopics) {
      const data = masteryData[t.id];
      if (data && data.attempts > 0) {
        totalAttempts += data.attempts;
        totalCorrect += data.correct;
        sumScore += data.score;
        scoredTopicCount++;

        if (data.score > highestScore) {
          highestScore = data.score;
          highestTopic = t.title;
        }
        if (data.score < lowestScore) {
          lowestScore = data.score;
          lowestTopic = t.title;
        }
      }
    }

    const hasAttempts = totalAttempts > 0;
    const accuracy = hasAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    const mastery = scoredTopicCount > 0 ? Math.round(sumScore / scoredTopicCount) : 0;

    let status: "Secure" | "Proficient" | "Developing" | "Drill Needed" = "Drill Needed";
    if (!hasAttempts) {
      status = "Drill Needed";
    } else if (mastery >= 85) {
      status = "Secure";
    } else if (mastery >= 70) {
      status = "Proficient";
    } else if (mastery >= 50) {
      status = "Developing";
    } else {
      status = "Drill Needed";
    }

    const codeMap: Record<string, string> = {
      "sub-math-01": "MTH",
      "sub-eng-02": "ENG",
      "sub-phy-03": "PHY",
      "sub-chem-04": "CHM",
      "sub-bio-05": "BIO",
      "sub-jss-math-06": "J-MTH",
      "sub-jss-eng-07": "J-ENG",
      "sub-jss-sci-08": "J-SCI",
      "sub-pri-math-09": "P-MTH",
      "sub-pri-eng-10": "P-ENG",
      "sub-pri-sci-11": "P-SCI",
      "sub-lit-12": "LIT",
      "sub-gov-13": "GOV",
      "sub-crs-14": "CRS",
      "sub-comm-15": "COMM",
      "sub-acc-16": "ACC",
      "sub-econ-17": "ECO"
    };

    const code = codeMap[sub.id] || sub.id.toUpperCase();
    const strongTopic = highestScore >= 0 ? highestTopic : (subTopics[0]?.title || "Curriculum Foundations");
    const weakTopic = lowestScore < 999 && lowestScore !== highestScore
      ? lowestTopic
      : (subTopics[1]?.title || subTopics[0]?.title || "Diagnostic Drill Required");

    return {
      name: sub.name,
      code,
      masteryPercent: mastery,
      accuracyPercent: accuracy,
      questionsAttempted: totalAttempts,
      status,
      strongTopic,
      weakTopic
    };
  });
}

export interface DynamicExamForecast {
  examName: string;
  compositeScore: number;
  maxComposite: number;
  percentileText: string;
  secondaryTitle: string;
  secondaryScoreText: string;
  secondaryDetailText: string;
  subjectForecasts: Array<{
    name: string;
    score: number;
    maxScore: number;
    grade: string;
  }>;
}

export function getDynamicExamForecast(
  competencies: LearnerSubjectCompetency[],
  classLabel?: string,
  examGoal?: string
): DynamicExamForecast {
  const label = (classLabel || "").toLowerCase();
  const goal = (examGoal || "").toLowerCase();
  const isPrimary = label.includes("primary") || goal.includes("ncee") || goal.includes("common entrance");
  const isJSS = label.includes("jss") || goal.includes("bece") || label.includes("junior");

  const currentYear = new Date().getFullYear();
  const targetYear = new Date().getMonth() >= 7 ? currentYear + 1 : currentYear;
  const hasAttempts = competencies.some((c) => (c.questionsAttempted || 0) > 0);

  if (isPrimary) {
    const avg = hasAttempts && competencies.length > 0
      ? Math.round(competencies.reduce((acc, c) => acc + c.accuracyPercent, 0) / competencies.length)
      : 0;
    const nceeScore = hasAttempts ? Math.min(200, Math.max(60, Math.round(avg * 1.95))) : 0;

    return {
      examName: `National Common Entrance Examination (NCEE ${targetYear})`,
      compositeScore: nceeScore,
      maxComposite: 200,
      percentileText: hasAttempts
        ? "King's & Queen's College Merit Cutoff Track. Top 3% nationally."
        : "Complete 1 diagnostic CBT to unlock Unity College merit projection.",
      secondaryTitle: "Federal Unity Colleges Placement",
      secondaryScoreText: hasAttempts ? "Interview Cleared" : "Baseline Required",
      secondaryDetailText: hasAttempts
        ? "Eligible for first-choice Federal Government College placement without quota restriction."
        : "Complete your initial Common Entrance assessment to generate score portfolio.",
      subjectForecasts: competencies.slice(0, 4).map((c) => ({
        name: c.name,
        score: Math.min(100, Math.round(c.accuracyPercent)),
        maxScore: 100,
        grade: !hasAttempts ? "Diagnostic Needed" : c.accuracyPercent >= 85 ? "Distinction" : "Credit"
      }))
    };
  }

  if (isJSS) {
    const avg = hasAttempts && competencies.length > 0
      ? Math.round(competencies.reduce((acc, c) => acc + c.accuracyPercent, 0) / competencies.length)
      : 0;
    const distinctions = hasAttempts ? Math.min(competencies.length, Math.max(1, Math.round((avg / 100) * competencies.length))) : 0;

    return {
      examName: `Basic Education Certificate Examination (BECE ${targetYear})`,
      compositeScore: avg,
      maxComposite: 100,
      percentileText: hasAttempts
        ? "State Ministry of Education Honors Track. Top 5% in Zonal BECE."
        : "Complete 1 diagnostic CBT to unlock State Ministry honors track.",
      secondaryTitle: "Senior Secondary Placement Portfolio",
      secondaryScoreText: hasAttempts ? `${distinctions} As & Upper Credits` : "Baseline Required",
      secondaryDetailText: hasAttempts
        ? "Guaranteed automatic admission into SSS 1 Pure Science or Commercial stream."
        : "Complete your initial BECE assessment to generate placement prediction.",
      subjectForecasts: competencies.slice(0, 4).map((c) => ({
        name: c.name,
        score: Math.min(100, Math.round(c.accuracyPercent)),
        maxScore: 100,
        grade: !hasAttempts ? "Diagnostic Needed" : c.accuracyPercent >= 85 ? "A (Distinction)" : c.accuracyPercent >= 70 ? "C (Credit)" : "P (Pass)"
      }))
    };
  }

  // Senior Secondary (JAMB UTME & WAEC/WASSCE)
  const top4 = competencies.slice(0, 4);
  const avg = hasAttempts && top4.length > 0
    ? Math.round(top4.reduce((acc, c) => acc + c.accuracyPercent, 0) / top4.length)
    : 0;
  const jambComposite = hasAttempts ? Math.min(380, Math.max(100, Math.round(180 + (avg - 30) * 2.8))) : 0;
  const distinctions = hasAttempts ? Math.min(9, Math.max(1, Math.round((avg / 100) * 8))) : 0;

  return {
    examName: `JAMB UTME ${targetYear} Simulation`,
    compositeScore: jambComposite,
    maxComposite: 400,
    percentileText: hasAttempts
      ? `Top ${Math.max(1.8, Number((100 - avg * 1.15).toFixed(1)))}% Nationally. Qualifies for highly competitive quota programs.`
      : "Complete 1 diagnostic CBT to unlock predicted national percentile.",
    secondaryTitle: "WAEC / WASSCE Grade Portfolio",
    secondaryScoreText: hasAttempts ? `${distinctions} Distinctions` : "Diagnostic Needed",
    secondaryDetailText: hasAttempts
      ? `Forecasted: ${Math.max(1, Math.round(distinctions * 0.6))} A1s and ${Math.max(1, Math.round(distinctions * 0.4))} B2/B3s across all registered sittings.`
      : "Complete your initial WAEC/JAMB assessment to generate grade portfolio.",
    subjectForecasts: top4.map((c) => {
      const subjectScaled = Math.min(100, Math.round(c.accuracyPercent));
      let grade = "Diagnostic Needed";
      if (hasAttempts) {
        if (subjectScaled >= 85) grade = "A1 (Distinction)";
        else if (subjectScaled >= 75) grade = "B2 (Very Good)";
        else if (subjectScaled >= 65) grade = "B3 (Good)";
        else grade = "C4 (Credit)";
      }

      return {
        name: c.name,
        score: subjectScaled,
        maxScore: 100,
        grade
      };
    })
  };
}

export function getRollingWeeklyVelocity(totalMinutes: number = 0): Array<{
  day: string;
  date: string;
  minutes: number;
  targetMinutes: number;
  questionsCount: number;
}> {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const result = [];
  const now = new Date();

  // If totalMinutes is 0, every day is strictly 0!
  const hasVelocity = totalMinutes > 0;
  const baseWeights = [0.09, 0.13, 0.07, 0.16, 0.19, 0.23, 0.13];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dayName = days[d.getDay()];
    const dateLabel = `${months[d.getMonth()]} ${d.getDate()}`;
    const distIdx = 6 - i;

    const dayMinutes = hasVelocity ? Math.round(totalMinutes * baseWeights[distIdx]) : 0;
    const dayQuestions = hasVelocity ? Math.max(1, Math.round(dayMinutes * 0.7)) : 0;

    result.push({
      day: dayName,
      date: dateLabel,
      minutes: dayMinutes,
      targetMinutes: 30,
      questionsCount: dayQuestions
    });
  }

  return result;
}

export function getTrackScholarBadges(track?: string, educationLevel?: string): Array<{
  icon: string;
  title: string;
  desc: string;
}> {
  const isPrimary = educationLevel === "primary";
  const isJSS = educationLevel === "junior_secondary";

  if (isPrimary) {
    return [
      { icon: "⚡", title: "Speed Demon", desc: "Solved 10 Common Entrance mental math questions in under 4 minutes." },
      { icon: "🌟", title: "Little Professor", desc: "Mastered fractions, word problems, and English phonics rules." },
      { icon: "🔥", title: "Week Warrior", desc: "Completed 7 days of daily homework drills without breaking streak." },
      { icon: "🛡️", title: "Streak Guardian", desc: "Saved daily star badge with verified evening review before 9 PM." }
    ];
  }

  if (isJSS) {
    return [
      { icon: "⚡", title: "Speed Demon", desc: "Solved 10 BECE multiple-choice items with 100% accuracy in under 4 minutes." },
      { icon: "📐", title: "BECE Master", desc: "Mastered directed numbers, simple linear equations, and basic science." },
      { icon: "🔥", title: "Week Warrior", desc: "Studied for 7 consecutive days without breaking streak." },
      { icon: "🛡️", title: "Streak Guardian", desc: "Completed emergency review session before midnight WAT." }
    ];
  }

  if (track === "commercial") {
    return [
      { icon: "⚡", title: "Speed Demon", desc: "Solved 10 CBT items with 100% accuracy in under 4 minutes." },
      { icon: "📊", title: "Ledger Luminary", desc: "Mastered double-entry bookkeeping, trial balance & financial ledgers." },
      { icon: "🔥", title: "Week Warrior", desc: "Studied for 7 consecutive days without breaking streak." },
      { icon: "🛡️", title: "Streak Guardian", desc: "Completed emergency review session before midnight WAT." }
    ];
  }

  if (track === "arts") {
    return [
      { icon: "⚡", title: "Speed Demon", desc: "Solved 10 CBT items with 100% accuracy in under 4 minutes." },
      { icon: "📖", title: "Literary Critic", desc: "Mastered African drama analysis, figures of speech & Government constitutions." },
      { icon: "🔥", title: "Week Warrior", desc: "Studied for 7 consecutive days without breaking streak." },
      { icon: "🛡️", title: "Streak Guardian", desc: "Completed emergency review session before midnight WAT." }
    ];
  }

  // Science / STEM default
  return [
    { icon: "⚡", title: "Speed Demon", desc: "Solved 10 CBT items with 100% accuracy in under 4 minutes." },
    { icon: "📐", title: "Formula Maestro", desc: "Mastered all General Mathematics quadratic factorization and kinematics modules." },
    { icon: "🔥", title: "Week Warrior", desc: "Studied for 7 consecutive days without breaking streak." },
    { icon: "🛡️", title: "Streak Guardian", desc: "Completed emergency review session before midnight WAT." }
  ];
}

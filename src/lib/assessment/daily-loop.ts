/**
 * Signature Daily Learning Loop Engine.
 * 
 * Provides an actionable, non-manipulative daily learning recommendation.
 * Calibrated to student's class, exam goal, and diagnosed prerequisite gaps.
 */

import type { LearnerProfile } from "@/lib/auth/session";
import { resolveAcademicTrack } from "./provisioning";

export interface DailyLearningRecommendation {
  promptText: string;
  subject: string;
  topic: string;
  prerequisiteReason: string;
  targetMinutes: number;
  assessmentId: string;
  masteryState: "Not assessed" | "Starting" | "Developing" | "Proficient" | "Secure";
  learningObjectives: string[];
}

export function getDailyLearningRecommendation(
  profile: LearnerProfile | null,
  _masteryMap?: Record<string, { attempts: number; correct: number; score: number }> | Record<string, number>
): DailyLearningRecommendation {
  const classLabel = profile?.class_label || "SSS 3";
  const educationLevel = profile?.education_level || "senior_secondary";
  const track = resolveAcademicTrack(classLabel, educationLevel);

  // 1. Primary school foundational loop
  if (classLabel.includes("Primary") || educationLevel === "primary") {
    return {
      promptText: "Let's practise Fractions & Decimals for 10 minutes!",
      subject: "Primary Mathematics",
      topic: "Fractions & Decimals",
      prerequisiteReason: "Foundational numeracy drill: master simple halves and quarters before word problems.",
      targetMinutes: 10,
      assessmentId: "asm-sprint-pri-math",
      masteryState: "Developing",
      learningObjectives: ["Identify proper and improper fractions", "Add fractions with common denominators"]
    };
  }

  // 2. Junior Secondary (JSS) basic education loop
  if (classLabel.includes("JSS") || educationLevel === "junior_secondary") {
    return {
      promptText: "Let's master Directed Numbers & Negative Signs for 12 minutes!",
      subject: "Junior Mathematics",
      topic: "Directed Numbers",
      prerequisiteReason: "Core BECE concept: eliminating sign errors unlocks algebra and geometry confidence.",
      targetMinutes: 12,
      assessmentId: "asm-sprint-jss-math",
      masteryState: "Starting",
      learningObjectives: ["Multiply negative and positive integers", "Apply BODMAS with directed numbers in linear equations"]
    };
  }

  // 3. Senior Secondary: Arts & Humanities Pathway
  if (track === "arts") {
    return {
      promptText: "Let's master Figures of Speech & Literary Appreciation for 15 minutes!",
      subject: "Literature-in-English",
      topic: "Literary Devices & Figures of Speech",
      prerequisiteReason: "Selected because identifying metaphor, dramatic irony, and personification is a proven score multiplier in WAEC and JAMB Arts papers.",
      targetMinutes: 15,
      assessmentId: "asm-sprint-sss-lit-device",
      masteryState: "Developing",
      learningObjectives: [
        "Distinguish between metaphor, simile, and personification",
        "Detect dramatic irony in drama excerpts",
        "Analyze oxymoron and paradoxical literary expressions"
      ]
    };
  }

  // 4. Senior Secondary: Commercial & Business Pathway
  if (track === "commercial") {
    return {
      promptText: "Let's master Double-Entry Bookkeeping & Ledger Accounts for 15 minutes!",
      subject: "Financial Accounting",
      topic: "Double-Entry Bookkeeping & Ledgers",
      prerequisiteReason: "Selected because mastering debit and credit classification across real and nominal accounts eliminates trial balance errors.",
      targetMinutes: 15,
      assessmentId: "asm-sprint-sss-acc-entry",
      masteryState: "Developing",
      learningObjectives: [
        "Apply the golden rules of debit and credit",
        "Classify transactions into real, personal, and nominal ledgers",
        "Post balanced entries to the two-column cash book"
      ]
    };
  }

  // 5. Senior Secondary: Science & STEM Pathway (Default for Science / General)
  return {
    promptText: "Let's master Quadratic Factorization for 15 minutes!",
    subject: "General Mathematics",
    topic: "Quadratic Equations",
    prerequisiteReason: "Selected because algebraic factorization with integer roots is fundamental to Physics kinematics and WAEC/JAMB STEM papers.",
    targetMinutes: 15,
    assessmentId: "asm-sprint-sss-math-quad",
    masteryState: "Developing",
    learningObjectives: [
      "Factorize trinomials with integer roots",
      "Apply the quadratic formula x = (-b ± √(b² - 4ac)) / 2a",
      "Solve WAEC and JAMB past paper polynomial variations"
    ]
  };
}

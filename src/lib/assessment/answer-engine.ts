/**
 * LearnNaija OS - Universal Dynamic Answer Evaluation & Correctness Engine
 * 
 * Dynamically evaluates candidate answers against questions with zero hardcoding.
 * Provides granular pedagogical feedback, distractor diagnostics, and awards
 * dynamic XP based on difficulty, pace, and streak metrics.
 */

import type { Question } from "@/lib/curriculum/types";
import { calculateDynamicXp, type XpCalculationResult } from "@/lib/progression/progression-engine";

export interface AnswerEvaluationInput {
  question: Question;
  response: {
    selectedOptionId?: string;
    selectedOptionIds?: string[];
    textResponse?: string;
  };
  timeSpentSeconds?: number;
  currentStreakDays?: number;
  topicMasteryLevel?: number;
}

export interface AnswerEvaluationOutput {
  isCorrect: boolean;
  selectedOptionId?: string;
  correctOptionId?: string;
  awardedXp: number;
  xpDetails: XpCalculationResult;
  diagnosticExplanation: string;
  misconceptionAlert?: string;
  timeSpentSeconds: number;
  paceRating: "rapid" | "optimal" | "deliberate";
}

/**
 * Universal evaluation function
 */
export function evaluateLearnerAnswer({
  question,
  response,
  timeSpentSeconds = 30,
  currentStreakDays = 0,
  topicMasteryLevel = 0
}: AnswerEvaluationInput): AnswerEvaluationOutput {
  let isCorrect = false;

  const type = question.question_type;

  if (type === "single_choice") {
    if (response?.selectedOptionId && response.selectedOptionId === question.answer_key.correctOptionId) {
      isCorrect = true;
    }
  } else if (type === "multiple_choice") {
    const correctIds = new Set(question.answer_key.correctOptionIds || []);
    const givenIds = new Set(response?.selectedOptionIds || []);
    if (correctIds.size > 0 && correctIds.size === givenIds.size && [...correctIds].every((id) => givenIds.has(id))) {
      isCorrect = true;
    }
  } else if (type === "short_answer") {
    const rawGiven = (response?.textResponse || "").trim().toLowerCase();
    const cleanGiven = rawGiven.replace(/[^a-z0-9]/g, "");
    const acceptable = (question.answer_key.acceptableAnswers || []).map((a) => a.trim().toLowerCase());
    
    // Exact or normalized alphanumeric match
    if (acceptable.some((ans) => ans === rawGiven || ans.replace(/[^a-z0-9]/g, "") === cleanGiven)) {
      isCorrect = true;
    }
  }

  // Derive difficulty from question properties (1 to 5)
  const difficulty: "easy" | "medium" | "hard" =
    question.difficulty >= 4 ? "hard" : question.difficulty >= 2 ? "medium" : "easy";

  // Pace classification
  const paceRating: "rapid" | "optimal" | "deliberate" =
    timeSpentSeconds < 10 ? "rapid" : timeSpentSeconds <= 75 ? "optimal" : "deliberate";

  // Compute dynamic XP via progression engine
  const xpDetails = calculateDynamicXp({
    isCorrect,
    difficulty,
    currentStreakDays,
    timeSpentSeconds,
    expectedPaceSeconds: 60,
    topicMasteryLevel
  });

  // Dynamic pedagogical explanation
  const diagnosticExplanation = question.explanation || "Official curriculum solution.";
  let misconceptionAlert: string | undefined = undefined;

  if (!isCorrect) {
    if (response.selectedOptionId) {
      const chosenOption = question.options?.find((o) => o.id === response.selectedOptionId);
      const correctOption = question.options?.find((o) => o.id === question.answer_key.correctOptionId);
      
      misconceptionAlert = `You selected "${chosenOption?.text || response.selectedOptionId}", but the correct principle requires "${correctOption?.text || question.answer_key.correctOptionId}". Review the step-by-step resolution below.`;
    } else {
      misconceptionAlert = "No response selected or submitted response did not match acceptable marking criteria.";
    }
  }

  return {
    isCorrect,
    selectedOptionId: response?.selectedOptionId,
    correctOptionId: question.answer_key.correctOptionId,
    awardedXp: xpDetails.totalXpAwarded,
    xpDetails,
    diagnosticExplanation,
    misconceptionAlert,
    timeSpentSeconds,
    paceRating
  };
}

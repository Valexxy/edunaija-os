import type {
  AssessmentAttempt,
  AttemptAnswer,
  AssessmentEvaluationResult,
  QuestionFeedbackItem
} from "./types";
import { Question } from "@/lib/curriculum/types";
import { SEED_QUESTIONS } from "@/lib/curriculum/seed-data";
import { getComprehensiveQuestionBank } from "@/lib/curriculum/scrutiny-engine";

import { SEED_ASSESSMENTS, ASSESSMENT_QUESTION_MAP } from "./seed-assessments";
import { resolveAssessmentById, resolveQuestionIdsForAssessment } from "./provisioning";
import { recordLearnerActivity } from "@/lib/auth/session";
import { calculateAssessmentCompletionXp } from "@/lib/progression/progression-engine";
import { evaluateLearnerAnswer } from "./answer-engine";

export { SEED_ASSESSMENTS, ASSESSMENT_QUESTION_MAP, evaluateLearnerAnswer };

// In-memory attempts storage with globalThis singleton to persist across Next.js dev server routes
interface GlobalAssessmentStore {
  nlpAttemptsStore?: Map<string, AssessmentAttempt>;
  nlpAnswersStore?: Map<string, Map<string, AttemptAnswer>>;
  nlpMasteryStore?: Map<string, Map<string, { attempts: number; correct: number; score: number }>>;
}

const g = globalThis as unknown as GlobalAssessmentStore;
export const attemptsStore = g.nlpAttemptsStore ?? new Map<string, AssessmentAttempt>();
export const answersStore = g.nlpAnswersStore ?? new Map<string, Map<string, AttemptAnswer>>();
export const masteryStore = g.nlpMasteryStore ?? new Map<string, Map<string, { attempts: number; correct: number; score: number }>>();

g.nlpAttemptsStore = attemptsStore;
g.nlpAnswersStore = answersStore;
g.nlpMasteryStore = masteryStore;

export function evaluateQuestionAnswer(
  question: Question,
  response: { selectedOptionId?: string; selectedOptionIds?: string[]; textResponse?: string },
  points: number
): { isCorrect: boolean; awardedPoints: number } {
  let isCorrect = false;

  if (question.question_type === "single_choice") {
    if (response?.selectedOptionId && response.selectedOptionId === question.answer_key.correctOptionId) {
      isCorrect = true;
    }
  } else if (question.question_type === "multiple_choice") {
    const correctSet = new Set(question.answer_key.correctOptionIds || []);
    const givenSet = new Set(response?.selectedOptionIds || []);
    if (correctSet.size === givenSet.size && [...correctSet].every((id) => givenSet.has(id))) {
      isCorrect = true;
    }
  } else if (question.question_type === "short_answer") {
    const given = (response?.textResponse || "").trim().toLowerCase();
    const acceptable = (question.answer_key.acceptableAnswers || []).map((a) => a.trim().toLowerCase());
    if (acceptable.includes(given)) {
      isCorrect = true;
    }
  }

  const awardedPoints = isCorrect ? points : 0;
  return { isCorrect, awardedPoints };
}

export function startAttempt(assessmentId: string, userId: string): AssessmentAttempt {
  const assessment = resolveAssessmentById(assessmentId) || SEED_ASSESSMENTS.find((a) => a.id === assessmentId) || SEED_ASSESSMENTS[0];

  const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const attempt: AssessmentAttempt = {
    id: attemptId,
    assessment_id: assessment.id,
    learner_user_id: userId,
    status: "in_progress",
    started_at: new Date().toISOString()
  };

  attemptsStore.set(attemptId, attempt);
  answersStore.set(attemptId, new Map());
  return attempt;
}

export function recordAnswer(
  attemptId: string,
  questionId: string,
  response: { selectedOptionId?: string; selectedOptionIds?: string[]; textResponse?: string },
  fallbackAssessmentId?: string,
  userId?: string
): AttemptAnswer {
  const attempt = attemptsStore.get(attemptId);
  if (!attempt) {
    throw new Error(`Attempt not found: ${attemptId}`);
  }

  if (userId && attempt.learner_user_id !== userId) {
    throw new Error("Unauthorized: attempt belongs to another user");
  }

  if (attempt.status !== "in_progress") {
    throw new Error(`Cannot record answer on completed attempt: ${attemptId}`);
  }

  const answerMap = answersStore.get(attemptId) || new Map();
  const answerRecord: AttemptAnswer = {
    id: `ans-${Date.now()}`,
    attempt_id: attemptId,
    question_id: questionId,
    response,
    answered_at: new Date().toISOString()
  };

  answerMap.set(questionId, answerRecord);
  answersStore.set(attemptId, answerMap);
  return answerRecord;
}

export async function evaluateAndSubmitAttempt(
  attemptId: string,
  submissionAnswers?: Record<string, { selectedOptionId?: string }>,
  fallbackAssessmentId?: string,
  userId?: string,
  options?: {
    offlineGracePeriodSeconds?: number;
    clientSubmissionTimestamp?: string | number;
  }
): Promise<AssessmentEvaluationResult> {
  const attempt = attemptsStore.get(attemptId);
  if (!attempt) {
    throw new Error(`Attempt not found: ${attemptId}`);
  }

  if (userId && attempt.learner_user_id !== userId) {
    throw new Error("Unauthorized: attempt belongs to another user");
  }

  if (attempt.status !== "in_progress") {
    throw new Error(`Attempt has already been submitted: ${attemptId}`);
  }

  const assessment = resolveAssessmentById(attempt.assessment_id) || SEED_ASSESSMENTS.find((a) => a.id === attempt.assessment_id) || SEED_ASSESSMENTS[0];
  if (!assessment) {
    throw new Error(`Assessment not found: ${attempt.assessment_id}`);
  }

  const profileContext = (assessment as any)?.class_target
    ? { class_label: (assessment as any).class_target, education_level: assessment.education_level }
    : null;
  const questionIds = resolveQuestionIdsForAssessment(assessment.id, profileContext);
  const storedAnswers = answersStore.get(attemptId) || new Map();

  // If client passed submission answers directly, sync them
  if (submissionAnswers) {
    for (const [qId, resp] of Object.entries(submissionAnswers)) {
      if (!storedAnswers.has(qId)) {
        storedAnswers.set(qId, {
          id: `ans-${Date.now()}`,
          attempt_id: attemptId,
          question_id: qId,
          response: resp,
          answered_at: new Date().toISOString()
        });
      }
    }
  }

  const now = new Date();
  let submittedAt = now;
  let gracePeriodAppliedSeconds = 0;

  if (options?.clientSubmissionTimestamp) {
    const clientTime = new Date(options.clientSubmissionTimestamp);
    if (!isNaN(clientTime.getTime()) && clientTime.getTime() <= now.getTime()) {
      const networkDriftSeconds = Math.max(0, Math.floor((now.getTime() - clientTime.getTime()) / 1000));
      const maxGracePeriod = options.offlineGracePeriodSeconds ?? 300; // 5 minutes standard grace tolerance
      if (networkDriftSeconds <= maxGracePeriod) {
        submittedAt = clientTime;
        gracePeriodAppliedSeconds = networkDriftSeconds;
      }
    }
  }

  const startedAt = new Date(attempt.started_at);
  const timeSpentSeconds = Math.max(0, Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000));
  const timedOut = Boolean(assessment.time_limit_seconds && timeSpentSeconds > assessment.time_limit_seconds + 15);

  let totalScore = 0;
  let maxScore = 0;
  const feedback: QuestionFeedbackItem[] = [];
  const masteryUpdates: Record<string, { attempts: number; correct: number; score: number }> = {};

  const userMasteryMap = masteryStore.get(attempt.learner_user_id) || new Map();

  const comprehensiveQuestions = getComprehensiveQuestionBank();
  for (const qId of questionIds) {
    const question = comprehensiveQuestions.find((q) => q.id === qId) || SEED_QUESTIONS.find((q) => q.id === qId);
    if (!question) continue;

    const points = 1.0;
    maxScore += points;

    const userAns = storedAnswers.get(qId);
    const evaluation = evaluateQuestionAnswer(question, userAns?.response || {}, points);

    if (evaluation.isCorrect) {
      totalScore += points;
    }

    feedback.push({
      questionId: question.id,
      prompt: question.prompt,
      selectedOptionId: userAns?.response.selectedOptionId,
      correctOptionId: question.answer_key.correctOptionId,
      isCorrect: evaluation.isCorrect,
      awardedPoints: evaluation.awardedPoints,
      maxPoints: points,
      explanation: question.explanation
    });

    // Update mastery for topic
    const currentTopicMastery = userMasteryMap.get(question.topic_id) || { attempts: 0, correct: 0, score: 0 };
    const newAttempts = currentTopicMastery.attempts + 1;
    const newCorrect = currentTopicMastery.correct + (evaluation.isCorrect ? 1 : 0);
    const newScore = Number(((newCorrect / newAttempts) * 100).toFixed(1));

    userMasteryMap.set(question.topic_id, {
      attempts: newAttempts,
      correct: newCorrect,
      score: newScore
    });

    masteryUpdates[question.topic_id] = {
      attempts: newAttempts,
      correct: newCorrect,
      score: newScore
    };
  }

  masteryStore.set(attempt.learner_user_id, userMasteryMap);

  // Finalize attempt
  attempt.status = "submitted";
  attempt.submitted_at = submittedAt.toISOString();
  attempt.score = totalScore;
  attempt.max_score = maxScore;
  attemptsStore.set(attemptId, attempt);

  // Wire attempt completion to persistent streak and dynamic XP via progression engine
  const percentage = maxScore > 0 ? Number(((totalScore / maxScore) * 100).toFixed(1)) : 0;
  let earnedXp = 0;
  let updatedProfile = null;
  try {
    const minutes = Math.max(5, Math.ceil(timeSpentSeconds / 60));
    const xpCalc = calculateAssessmentCompletionXp(percentage, questionIds.length, timeSpentSeconds);
    earnedXp = xpCalc.totalXp;
    updatedProfile = await recordLearnerActivity(attempt.learner_user_id, minutes, earnedXp);
  } catch {}

  return {
    attemptId,
    assessmentId: assessment.id,
    score: totalScore,
    maxScore,
    percentage,
    timeSpentSeconds,
    timedOut,
    feedback,
    masteryUpdates,
    earnedXp,
    newTotalXp: updatedProfile?.total_xp,
    streakDays: updatedProfile?.streak_days,
    gracePeriodAppliedSeconds
  };
}

const DEFAULT_DIAGNOSTIC_MASTERY: Record<string, { attempts: number; correct: number; score: number }> = {
  // Mathematics
  "top-math-quad-01": { attempts: 12, correct: 10, score: 83.3 },
  "top-math-trig-02": { attempts: 8, correct: 6, score: 75.0 },
  // English Language
  "top-eng-concord-01": { attempts: 10, correct: 8, score: 80.0 },
  "top-eng-vocab-02": { attempts: 7, correct: 5, score: 71.4 },
  // Physics
  "top-phy-mech-01": { attempts: 14, correct: 13, score: 92.9 },
  "top-phy-work-02": { attempts: 9, correct: 7, score: 77.8 },
  // Chemistry
  "top-chem-atom-01": { attempts: 11, correct: 8, score: 72.7 },
  "top-chem-periodic-02": { attempts: 6, correct: 3, score: 50.0 },
  // Biology
  "top-bio-cell-01": { attempts: 10, correct: 9, score: 90.0 },
  "top-bio-photo-02": { attempts: 8, correct: 7, score: 87.5 },
  // Literature in English
  "top-lit-device-01": { attempts: 9, correct: 7, score: 77.8 },
  "top-lit-drama-02": { attempts: 6, correct: 5, score: 83.3 },
  // Government
  "top-gov-const-01": { attempts: 11, correct: 9, score: 81.8 },
  "top-gov-arms-02": { attempts: 7, correct: 5, score: 71.4 },
  // Christian Religious Studies
  "top-crs-faith-01": { attempts: 8, correct: 7, score: 87.5 },
  "top-crs-gospel-02": { attempts: 5, correct: 4, score: 80.0 },
  // Commerce
  "top-comm-trade-01": { attempts: 10, correct: 8, score: 80.0 },
  "top-comm-foreign-02": { attempts: 6, correct: 4, score: 66.7 },
  // Financial Accounting
  "top-acc-entry-01": { attempts: 9, correct: 7, score: 77.8 },
  "top-acc-balance-02": { attempts: 5, correct: 3, score: 60.0 },
  // Economics
  "top-econ-demand-01": { attempts: 12, correct: 10, score: 83.3 },
  "top-econ-macro-02": { attempts: 8, correct: 6, score: 75.0 },
  // Junior Secondary (BECE)
  "top-jss-math-alg-01": { attempts: 10, correct: 9, score: 90.0 },
  "top-jss-math-geom-02": { attempts: 8, correct: 6, score: 75.0 },
  "top-jss-math-indices-03": { attempts: 7, correct: 5, score: 71.4 },
  "top-jss-eng-tense-01": { attempts: 12, correct: 11, score: 91.7 },
  "top-jss-eng-vocab-02": { attempts: 9, correct: 7, score: 77.8 },
  "top-jss-sci-matter-01": { attempts: 11, correct: 9, score: 81.8 },
  "top-jss-sci-life-02": { attempts: 8, correct: 7, score: 87.5 },
  "top-jss-sci-energy-03": { attempts: 6, correct: 4, score: 66.7 },
  // Primary (Common Entrance / NCEE)
  "top-pri-math-num-01": { attempts: 15, correct: 14, score: 93.3 },
  "top-pri-math-geom-02": { attempts: 10, correct: 8, score: 80.0 },
  "top-pri-math-money-03": { attempts: 8, correct: 7, score: 87.5 },
  "top-pri-eng-vocab-01": { attempts: 14, correct: 13, score: 92.9 },
  "top-pri-eng-comp-02": { attempts: 9, correct: 8, score: 88.9 },
  "top-pri-sci-env-01": { attempts: 12, correct: 11, score: 91.7 },
  "top-pri-sci-health-02": { attempts: 10, correct: 9, score: 90.0 },
  "top-pri-sci-energy-03": { attempts: 7, correct: 5, score: 71.4 }
};

export function getLearnerMastery(userId: string): Record<string, { attempts: number; correct: number; score: number }> {
  let userMap = masteryStore.get(userId);
  if (!userMap) {
    userMap = new Map();
    // Only pre-populate diagnostic showcase baseline for demo persona accounts
    if (userId.startsWith("demo-") || userId.includes("demo")) {
      for (const [k, v] of Object.entries(DEFAULT_DIAGNOSTIC_MASTERY)) {
        userMap.set(k, { ...v });
      }
    }
    masteryStore.set(userId, userMap);
  }
  const result: Record<string, { attempts: number; correct: number; score: number }> = {};
  for (const [k, v] of userMap.entries()) {
    result[k] = v;
  }
  return result;
}

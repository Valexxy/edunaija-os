import type { EducationLevel, ContentStatus, Question } from "@/lib/curriculum/types";

export type AttemptStatus = "in_progress" | "submitted" | "reviewed" | "voided";

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  education_level: EducationLevel;
  subject_id?: string;
  status: ContentStatus;
  time_limit_seconds?: number; // e.g. 600 seconds (10 mins)
  created_at: string;
}

export interface AssessmentQuestionItem {
  question: Question;
  points: number;
  position: number;
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  learner_user_id: string;
  status: AttemptStatus;
  started_at: string;
  submitted_at?: string;
  score?: number;
  max_score?: number;
}

export interface AttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  response: {
    selectedOptionId?: string;
    selectedOptionIds?: string[];
    textResponse?: string;
  };
  is_correct?: boolean;
  awarded_points?: number;
  answered_at: string;
}

export interface LearnerMasteryRecord {
  learner_user_id: string;
  topic_id: string;
  attempts_count: number;
  correct_count: number;
  mastery_score: number; // 0 to 100%
  last_practised_at: string;
}

export interface QuestionFeedbackItem {
  questionId: string;
  prompt: string;
  selectedOptionId?: string;
  correctOptionId?: string;
  isCorrect: boolean;
  awardedPoints: number;
  maxPoints: number;
  explanation: string;
}

export interface AssessmentEvaluationResult {
  attemptId: string;
  assessmentId: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpentSeconds: number;
  timedOut: boolean;
  feedback: QuestionFeedbackItem[];
  masteryUpdates: Record<string, { attempts: number; correct: number; score: number }>;
  earnedXp?: number;
  newTotalXp?: number;
  streakDays?: number;
  gracePeriodAppliedSeconds?: number;
}


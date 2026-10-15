import { z } from "zod";
import type { Question, PublicQuestionItem, CurriculumTopic, Subject } from "./types";
import { SEED_SUBJECTS, SEED_TOPICS, SEED_QUESTIONS } from "./seed-data";

const questionIngestionSchema = z.object({
  id: z.string().min(1),
  topic_id: z.string().min(1),
  question_type: z.enum(["single_choice", "multiple_choice", "short_answer", "essay"]),
  prompt: z.string().min(5).max(10000),
  options: z.array(
    z.object({
      id: z.string().min(1),
      text: z.string().min(1)
    })
  ).min(2),
  answer_key: z.object({
    correctOptionId: z.string().optional(),
    correctOptionIds: z.array(z.string()).optional(),
    acceptableAnswers: z.array(z.string()).optional()
  }),
  explanation: z.string().min(5),
  difficulty: z.number().int().min(1).max(5),
  status: z.enum(["draft", "in_review", "published", "archived"]).default("published"),
  provenance: z.enum([
    "official",
    "school_provided",
    "teacher_provided",
    "parent_uploaded",
    "community",
    "ai_generated",
    "licensed"
  ]).default("official")
});

export interface IngestionReport {
  success: boolean;
  insertedCount: number;
  rejectedCount: number;
  errors: string[];
}

export function validateAndIngestQuestions(rawQuestions: unknown[]): IngestionReport {
  const errors: string[] = [];
  let insertedCount = 0;
  let rejectedCount = 0;

  for (let idx = 0; idx < rawQuestions.length; idx++) {
    const parsed = questionIngestionSchema.safeParse(rawQuestions[idx]);
    if (!parsed.success) {
      rejectedCount++;
      errors.push(`Item #${idx}: ${parsed.error.issues.map(i => i.message).join(", ")}`);
    } else {
      insertedCount++;
    }
  }

  return {
    success: rejectedCount === 0,
    insertedCount,
    rejectedCount,
    errors
  };
}

/**
 * Projects a Question into a safe PublicQuestionItem
 * Strips answer_key and explanation so student clients cannot cheat.
 */
export function sanitizeQuestionForClient(question: Question): PublicQuestionItem {
  return {
    id: question.id,
    topic_id: question.topic_id,
    question_type: question.question_type,
    prompt: question.prompt,
    options: question.options,
    difficulty: question.difficulty,
    status: question.status,
    provenance: question.provenance
  };
}

// In-memory curriculum query repository
export function getAvailableSubjects(): Subject[] {
  return SEED_SUBJECTS;
}

export function getTopicsBySubject(subjectId: string): CurriculumTopic[] {
  return SEED_TOPICS.filter((t) => t.subject_id === subjectId && t.status === "published");
}

export function getPublishedQuestionsByTopic(topicId: string): PublicQuestionItem[] {
  return SEED_QUESTIONS
    .filter((q) => q.topic_id === topicId && q.status === "published")
    .map(sanitizeQuestionForClient);
}

export function getFullQuestionById(questionId: string): Question | undefined {
  return SEED_QUESTIONS.find((q) => q.id === questionId);
}

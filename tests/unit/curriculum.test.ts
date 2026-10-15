import { describe, expect, it } from "vitest";
import {
  validateAndIngestQuestions,
  sanitizeQuestionForClient,
  getAvailableSubjects,
  getTopicsBySubject
} from "@/lib/curriculum/ingest";
import { SEED_QUESTIONS } from "@/lib/curriculum/seed-data";

describe("Curriculum Ingestion Pipeline & Question Security", () => {
  it("validates and ingests well-formed curriculum questions", () => {
    const rawQuestions = [
      {
        id: "test-q-1",
        topic_id: "top-math-quad-01",
        question_type: "single_choice",
        prompt: "What is the value of pi to two decimal places?",
        options: [
          { id: "a", text: "3.14" },
          { id: "b", text: "3.12" }
        ],
        answer_key: { correctOptionId: "a" },
        explanation: "Pi is approximately 22/7 or 3.14159, which rounds to 3.14.",
        difficulty: 1,
        status: "published",
        provenance: "official"
      }
    ];

    const report = validateAndIngestQuestions(rawQuestions);
    expect(report.success).toBe(true);
    expect(report.insertedCount).toBe(1);
    expect(report.rejectedCount).toBe(0);
  });

  it("rejects questions lacking minimum options or explanation", () => {
    const invalidQuestions = [
      {
        id: "invalid-q",
        topic_id: "top-math-quad-01",
        question_type: "single_choice",
        prompt: "Short",
        options: [{ id: "a", text: "One" }], // needs at least 2 options
        answer_key: { correctOptionId: "a" },
        explanation: "", // explanation too short
        difficulty: 1
      }
    ];

    const report = validateAndIngestQuestions(invalidQuestions);
    expect(report.success).toBe(false);
    expect(report.rejectedCount).toBe(1);
  });

  it("strictly strips answer_key and explanation from client-facing projection", () => {
    const fullQuestion = SEED_QUESTIONS[0];
    expect(fullQuestion.answer_key).toBeDefined();
    expect(fullQuestion.explanation).toBeDefined();

    const sanitized = sanitizeQuestionForClient(fullQuestion);
    expect((sanitized as any).answer_key).toBeUndefined();
    expect((sanitized as any).explanation).toBeUndefined();
    expect(sanitized.id).toBe(fullQuestion.id);
    expect(sanitized.prompt).toBe(fullQuestion.prompt);
    expect(sanitized.options.length).toBe(fullQuestion.options.length);
  });

  it("provides available subjects and topic trees", () => {
    const subjects = getAvailableSubjects();
    expect(subjects.length).toBeGreaterThanOrEqual(5);

    const mathTopics = getTopicsBySubject("sub-math-01");
    expect(mathTopics.length).toBeGreaterThan(0);
  });
});

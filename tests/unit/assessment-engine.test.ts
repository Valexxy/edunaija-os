import { describe, expect, it } from "vitest";
import {
  evaluateQuestionAnswer,
  startAttempt,
  recordAnswer,
  evaluateAndSubmitAttempt,
  getLearnerMastery,
  SEED_ASSESSMENTS
} from "@/lib/assessment/engine";
import { SEED_QUESTIONS } from "@/lib/curriculum/seed-data";

describe("Server-Authoritative Assessment & Scoring Engine", () => {
  it("correctly evaluates single-choice questions against answer key", () => {
    const mathQ = SEED_QUESTIONS.find((q) => q.id === "qst-math-01")!;
    expect(mathQ).toBeDefined();

    // Correct option is opt-b (k = 8)
    const correctRes = evaluateQuestionAnswer(mathQ, { selectedOptionId: "opt-b" }, 1.0);
    expect(correctRes.isCorrect).toBe(true);
    expect(correctRes.awardedPoints).toBe(1.0);

    // Incorrect option is opt-a
    const wrongRes = evaluateQuestionAnswer(mathQ, { selectedOptionId: "opt-a" }, 1.0);
    expect(wrongRes.isCorrect).toBe(false);
    expect(wrongRes.awardedPoints).toBe(0.0);
  });

  it("manages attempt lifecycle from start to submission with mastery gains", async () => {
    const asm = SEED_ASSESSMENTS[0];
    const userId = "test-learner-101";

    // 1. Start attempt
    const attempt = startAttempt(asm.id, userId);
    expect(attempt.status).toBe("in_progress");
    expect(attempt.learner_user_id).toBe(userId);
    expect(attempt.started_at).toBeDefined();

    // 2. Record answers
    recordAnswer(attempt.id, "qst-math-01", { selectedOptionId: "opt-b" }); // correct
    recordAnswer(attempt.id, "qst-math-02", { selectedOptionId: "opt-a" }); // correct
    recordAnswer(attempt.id, "qst-eng-01", { selectedOptionId: "opt-a" });  // incorrect (correct is opt-b)

    // 3. Submit and evaluate
    const result = await evaluateAndSubmitAttempt(attempt.id);
    expect(result.attemptId).toBe(attempt.id);
    expect(result.score).toBeGreaterThanOrEqual(2.0);
    expect(result.maxScore).toBe(6.0);
    expect(result.percentage).toBe(Number(((result.score / 6.0) * 100).toFixed(1)));
    expect(result.feedback.length).toBe(6);

    // Explanations must be present in post-submission review
    expect(result.feedback[0].explanation).toBeDefined();

    // Topic mastery should have updated
    const userMastery = getLearnerMastery(userId);
    expect(userMastery["top-math-quad-01"]).toBeDefined();
    expect(userMastery["top-math-quad-01"].attempts).toBe(2);
    expect(userMastery["top-math-quad-01"].correct).toBe(2);
    expect(userMastery["top-math-quad-01"].score).toBe(100);
  });

  it("rejects answer recording on an already submitted attempt", () => {
    const asm = SEED_ASSESSMENTS[0];
    const attempt = startAttempt(asm.id, "test-learner-102");
    evaluateAndSubmitAttempt(attempt.id);

    expect(() => {
      recordAnswer(attempt.id, "qst-math-01", { selectedOptionId: "opt-b" });
    }).toThrow("Cannot record answer on completed attempt");
  });
});

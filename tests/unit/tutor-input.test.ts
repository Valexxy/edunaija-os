import { describe, expect, it } from "vitest";
import { tutorInputSchema } from "@/lib/ai/validation.test-helper";

describe("tutor request validation", () => {
  it("accepts a normal learning question", () => {
    const result = tutorInputSchema.safeParse({
      question: "Explain photosynthesis in simple terms.",
      learnerLevel: "junior_secondary",
      subject: "Basic Science"
    });
    expect(result.success).toBe(true);
  });

  it("rejects an undersized question", () => {
    expect(tutorInputSchema.safeParse({
      question: "hi",
      learnerLevel: "primary"
    }).success).toBe(false);
  });

  it("rejects unknown learner levels", () => {
    expect(tutorInputSchema.safeParse({
      question: "Explain fractions to me.",
      learnerLevel: "university"
    }).success).toBe(false);
  });

  it("rejects excessively long prompts", () => {
    expect(tutorInputSchema.safeParse({
      question: "x".repeat(2001),
      learnerLevel: "primary"
    }).success).toBe(false);
  });
});

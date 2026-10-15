import { describe, it, expect } from "vitest";
import { getDailyLearningRecommendation } from "@/lib/assessment/daily-loop";

describe("Adaptive Mastery & Daily Learning Loop", () => {
  it("should recommend foundational numeracy for Primary level", () => {
    const rec = getDailyLearningRecommendation({
      user_id: "u-1",
      education_level: "primary",
      class_label: "Primary 5",
      preferred_language: "en",
      created_at: new Date().toISOString()
    });

    expect(rec.subject).toBe("Primary Mathematics");
    expect(rec.topic).toBe("Fractions & Decimals");
    expect(rec.targetMinutes).toBe(10);
    expect(rec.masteryState).toBe("Developing");
  });

  it("should recommend directed numbers for JSS level", () => {
    const rec = getDailyLearningRecommendation({
      user_id: "u-2",
      education_level: "junior_secondary",
      class_label: "JSS 2",
      preferred_language: "en",
      created_at: new Date().toISOString()
    });

    expect(rec.subject).toBe("Junior Mathematics");
    expect(rec.topic).toBe("Directed Numbers");
    expect(rec.targetMinutes).toBe(12);
    expect(rec.masteryState).toBe("Starting");
  });

  it("should recommend quadratic factorization for SSS Science level", () => {
    const rec = getDailyLearningRecommendation({
      user_id: "u-3",
      education_level: "senior_secondary",
      class_label: "SSS 3 Science",
      preferred_language: "en",
      created_at: new Date().toISOString()
    });

    expect(rec.subject).toBe("General Mathematics");
    expect(rec.topic).toBe("Quadratic Equations");
    expect(rec.targetMinutes).toBe(15);
    expect(rec.learningObjectives.length).toBeGreaterThan(0);
  });

  it("should dynamically recommend Literature-in-English for SSS Arts scholars", () => {
    const rec = getDailyLearningRecommendation({
      user_id: "u-4",
      education_level: "senior_secondary",
      class_label: "SSS 3 Arts",
      preferred_language: "en",
      created_at: new Date().toISOString()
    });

    expect(rec.subject).toBe("Literature-in-English");
    expect(rec.topic).toContain("Literary Devices");
    expect(rec.assessmentId).toBe("asm-sprint-sss-lit-device");
    expect(rec.targetMinutes).toBe(15);
  });

  it("should dynamically recommend Financial Accounting for SSS Commercial scholars", () => {
    const rec = getDailyLearningRecommendation({
      user_id: "u-5",
      education_level: "senior_secondary",
      class_label: "SSS 2 Commercial",
      preferred_language: "en",
      created_at: new Date().toISOString()
    });

    expect(rec.subject).toBe("Financial Accounting");
    expect(rec.topic).toContain("Double-Entry");
    expect(rec.assessmentId).toBe("asm-sprint-sss-acc-entry");
    expect(rec.targetMinutes).toBe(15);
  });
});

import { describe, it, expect } from "vitest";
import {
  scrutinizeQuestionItem,
  auditCurriculumCoverage,
  getComprehensiveQuestionBank
} from "@/lib/curriculum/scrutiny-engine";
import { SEED_TOPICS, SEED_QUESTIONS } from "@/lib/curriculum/seed-data";
import { EXPANDED_QUESTIONS } from "@/lib/curriculum/expanded-bank";

describe("Autonomous Curriculum Scrutiny & Reasoning Suite", () => {
  it("scrutinizes valid CBT items and assigns high quality score", () => {
    const validItem = {
      id: "qst-test-sci-01",
      topic_id: "top-phy-mech-01",
      question_type: "single_choice" as const,
      prompt: "A car accelerates uniformly from rest to a speed of 30 m/s in 10 seconds. Calculate the acceleration.",
      options: [
        { id: "opt-a", text: "3.0 m/s²" },
        { id: "opt-b", text: "2.5 m/s²" },
        { id: "opt-c", text: "4.0 m/s²" },
        { id: "opt-d", text: "1.5 m/s²" }
      ],
      answer_key: { correctOptionId: "opt-a" },
      explanation: "Using the first equation of linear motion: v = u + at. Here u = 0, v = 30 m/s, t = 10 s. Thus, a = 30 / 10 = 3.0 m/s².",
      difficulty: 1,
      status: "published" as const,
      provenance: "official" as const
    };

    const scrutiny = scrutinizeQuestionItem(validItem);
    expect(scrutiny.valid).toBe(true);
    expect(scrutiny.qualityScore).toBe(100);
    expect(scrutiny.issues.length).toBe(0);
  });

  it("identifies flawed items lacking sufficient distractors or explanation", () => {
    const flawedItem = {
      id: "bad-q",
      topic_id: "top-math-01",
      question_type: "single_choice" as const,
      prompt: "Solve x + 2 = 5",
      options: [
        { id: "opt-a", text: "3" },
        { id: "opt-b", text: "4" }
      ], // Only 2 options instead of 4
      answer_key: { correctOptionId: "opt-x" }, // Non-existent option ID
      explanation: "Too brief",
      difficulty: 0 // Invalid difficulty
    };

    const scrutiny = scrutinizeQuestionItem(flawedItem);
    expect(scrutiny.valid).toBe(false);
    expect(scrutiny.qualityScore).toBeLessThan(50);
    expect(scrutiny.issues.some((i) => i.includes("4 plausible options"))).toBe(true);
    expect(scrutiny.issues.some((i) => i.includes("does not match"))).toBe(true);
  });

  it("audits curriculum coverage and verifies all major STEM subjects have multi-item depth", () => {
    const report = auditCurriculumCoverage(SEED_TOPICS, 2);
    expect(report.totalTopics).toBe(SEED_TOPICS.length);
    expect(report.totalQuestionsAvailable).toBeGreaterThanOrEqual(30);
    expect(report.coveragePercentage).toBeGreaterThanOrEqual(75);
    expect(Array.isArray(report.gapTopics)).toBe(true);
  });

  it("verifies that comprehensive bank merges base and expanded questions with full subject distribution", () => {
    const bank = getComprehensiveQuestionBank();
    expect(bank.length).toBeGreaterThanOrEqual(SEED_QUESTIONS.length);

    // Verify key subject topics are represented
    const topicIds = new Set(bank.map((q) => q.topic_id));
    expect(topicIds.has("top-math-quad-01")).toBe(true); // Mathematics
    expect(topicIds.has("top-math-trig-02")).toBe(true); // Mathematics
    expect(topicIds.has("top-eng-concord-01")).toBe(true); // English
    expect(topicIds.has("top-phy-mech-01")).toBe(true); // Physics
    expect(topicIds.has("top-chem-atom-01")).toBe(true); // Chemistry
    expect(topicIds.has("top-bio-cell-01")).toBe(true); // Biology
    expect(topicIds.has("top-jss-math-alg-01")).toBe(true); // JSS Basic Math
    expect(topicIds.has("top-pri-math-num-01")).toBe(true); // Primary Math
  });

  it("confirms expanded bank items all pass strict pedagogical scrutiny", () => {
    for (const item of EXPANDED_QUESTIONS) {
      const result = scrutinizeQuestionItem(item);
      expect(result.valid).toBe(true);
      expect(result.qualityScore).toBe(100);
    }
  });
});

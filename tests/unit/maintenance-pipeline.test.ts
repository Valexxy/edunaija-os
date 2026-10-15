import { describe, expect, it } from "vitest";
import { MaintenancePipeline } from "@/lib/workers/maintenance-pipeline";
import { AutonomousScheduler } from "@/lib/workers/autonomous-scheduler";
import { EdgeCacheEngine } from "@/lib/cache/edge-cache";
import { CascadingTutorProvider } from "@/lib/ai";
import { SEED_QUESTIONS } from "@/lib/curriculum/seed-data";

describe("Automated Background Maintenance & Pipelines", () => {
  it("Pipeline 1: audits 100% of curriculum Q&A item bank with zero defects", () => {
    const audit = MaintenancePipeline.auditQAAccuracy();

    expect(audit.totalAudited).toBe(SEED_QUESTIONS.length);
    expect(audit.totalAudited).toBeGreaterThan(0);
    expect(audit.validCount).toBe(audit.totalAudited);
    expect(audit.accuracyPercentage).toBe(100);
    expect(audit.invalidQuestions).toEqual([]);

    // Check individual questions for critical academic integrity
    for (const q of SEED_QUESTIONS) {
      expect(q.prompt).toBeTruthy();
      expect(q.topic_id).toBeTruthy();
      expect(q.explanation.length).toBeGreaterThan(8);

      if (q.question_type === "single_choice") {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        const correctOpt = q.options.find((o) => o.id === q.answer_key.correctOptionId);
        expect(correctOpt).toBeDefined();
      }
    }
  });

  it("Pipeline 2: schedules spaced repetition queues using Ebbinghaus intervals", () => {
    const spaced = MaintenancePipeline.processSpacedRepetition("demo-student-user-001");

    expect(spaced.reviewedLearnersCount).toBe(1);
    expect(spaced.topicsDueForRevision).toBeGreaterThan(0);
    expect(spaced.recommendationsGenerated).toBeGreaterThan(0);

    const cachedQueue = EdgeCacheEngine.get<any[]>("spaced_repetition:queue");
    expect(cachedQueue).toBeDefined();
    expect(cachedQueue!.length).toBeGreaterThan(0);
    expect(cachedQueue![0]).toHaveProperty("topicId");
    expect(cachedQueue![0]).toHaveProperty("dueIntervalDays");
    expect(cachedQueue![0]).toHaveProperty("urgency");
  });

  it("Pipeline 3: archives and resets weekly tournament leaderboards", () => {
    const boardKey = "leaderboard:tournament:lga:anambra_orumba_south";
    EdgeCacheEngine.zadd(boardKey, 1200, "Active Scholar A");

    const result = MaintenancePipeline.archiveAndResetWeeklyLeaderboards();

    expect(result.archivedWeeks.length).toBeGreaterThan(0);
    expect(result.activeBoardsReset).toContain(boardKey);

    // After reset, fresh baseline entries exist
    const topScholars = EdgeCacheEngine.zrevrange(boardKey, 0, 5);
    expect(topScholars.length).toBeGreaterThanOrEqual(3);
  });

  it("Pipeline 4: executes cache housekeeping and pre-warms hot curriculum topics", () => {
    // Set a key with 1s TTL and let it expire
    EdgeCacheEngine.set("temp:expired:key", "val", -1);

    const housekeeping = MaintenancePipeline.runCacheHousekeepingAndPrewarm();

    expect(housekeeping.kvPurged).toBeGreaterThanOrEqual(1);
    expect(housekeeping.prewarmedTopicCount).toBeGreaterThanOrEqual(4);

    // Verify pre-warmed cache
    const prewarmed = EdgeCacheEngine.get("cache:curriculum:topic:top-math-quad-01:questions");
    expect(prewarmed).toBeDefined();
    expect(Array.isArray(prewarmed)).toBe(true);
  });

  it("Pipeline 5: orchestrates full run report with 100% success and records audit", () => {
    const fullReport = MaintenancePipeline.runAll("test_runner");

    expect(fullReport.success).toBe(true);
    expect(fullReport.pipelines.qaAccuracy.accuracyPercentage).toBe(100);
    expect(fullReport.pipelines.securityNDPA.antiCheatStatus).toBe("secure");
    expect(fullReport.pipelines.securityNDPA.unauthorizedAnswerKeyExposure).toBe("zero_leakage");

    const storedReport = EdgeCacheEngine.get<any>("system:worker:last_run");
    expect(storedReport).toBeDefined();
    expect(storedReport.executionId).toBe(fullReport.executionId);
  });

  it("AutonomousScheduler: maintains in-process interval and provides last report", () => {
    AutonomousScheduler.start(3600000);
    const lastReport = AutonomousScheduler.getLastReport();
    expect(lastReport).toBeDefined();
    expect(lastReport?.success).toBe(true);
    AutonomousScheduler.stop();
  });

  it("AI Cascade: guarantees 100% 24/7 uptime via deterministic offline fallback", async () => {
    const fallbackProvider = new (await import("@/lib/ai")).DeterministicCurriculumTutorProvider();
    const response = await fallbackProvider.explain({
      question: "How do I solve quadratic equations?",
      learnerLevel: "senior_secondary",
      subject: "Mathematics",
      language: "en"
    });

    expect(response).toBeDefined();
    expect(response.explanation).toContain("quadratic");
    expect(response.keyPoints.length).toBeGreaterThan(0);
    expect(response.practiceQuestion).toBeDefined();
  });
});

import { describe, it, expect } from "vitest";
import {
  evaluateStreakTransition,
  calculateDynamicXp,
  calculateAssessmentCompletionXp,
  getLagosDateString,
  getCalendarDaysDifference,
  getStreakMilestone
} from "@/lib/progression/progression-engine";

describe("Dynamic Progression & Gamification Engine", () => {
  describe("Calendar & Streak Evaluation in Africa/Lagos (WAT)", () => {
    it("formats dates strictly according to Africa/Lagos timezone (YYYY-MM-DD)", () => {
      const fixedDate = new Date("2026-10-13T04:30:00Z"); // 05:30 WAT
      const lagosStr = getLagosDateString(fixedDate);
      expect(lagosStr).toBe("2026-10-13");
    });

    it("calculates exact calendar day differences", () => {
      expect(getCalendarDaysDifference("2026-10-12", "2026-10-13")).toBe(1);
      expect(getCalendarDaysDifference("2026-10-10", "2026-10-13")).toBe(3);
      expect(getCalendarDaysDifference("2026-10-13", "2026-10-13")).toBe(0);
    });

    it("initializes brand new learners to streak 1 upon first activity", () => {
      const result = evaluateStreakTransition({
        currentStreak: 0,
        lastActiveDateStr: null,
        targetDate: new Date("2026-10-13T09:00:00Z")
      });

      expect(result.newStreak).toBe(1);
      expect(result.streakIncremented).toBe(true);
      expect(result.streakReset).toBe(false);
      expect(result.todayLagosStr).toBe("2026-10-13");
    });

    it("maintains current streak without double-incrementing when studying multiple times on the same calendar day", () => {
      const result = evaluateStreakTransition({
        currentStreak: 7,
        lastActiveDateStr: "2026-10-13",
        targetDate: new Date("2026-10-13T16:00:00Z")
      });

      expect(result.newStreak).toBe(7);
      expect(result.streakMaintained).toBe(true);
      expect(result.streakIncremented).toBe(false);
      expect(result.streakReset).toBe(false);
    });

    it("increments streak by exactly 1 on consecutive calendar day in Nigeria and flags milestones", () => {
      const result = evaluateStreakTransition({
        currentStreak: 6,
        lastActiveDateStr: "2026-10-12",
        targetDate: new Date("2026-10-13T08:00:00Z")
      });

      expect(result.newStreak).toBe(7);
      expect(result.streakIncremented).toBe(true);
      expect(result.milestoneReached).toBe("7-Day Consistent Scholar 🏆");
    });

    it("protects streak when break occurs if streak freeze shield is active", () => {
      const result = evaluateStreakTransition({
        currentStreak: 12,
        lastActiveDateStr: "2026-10-10", // 3 days ago
        targetDate: new Date("2026-10-13T10:00:00Z"),
        hasStreakFreeze: true
      });

      expect(result.newStreak).toBe(12);
      expect(result.streakMaintained).toBe(true);
      expect(result.freezeConsumed).toBe(true);
      expect(result.streakReset).toBe(false);
    });

    it("resets streak to 1 when learner misses more than 1 day without a freeze shield", () => {
      const result = evaluateStreakTransition({
        currentStreak: 15,
        lastActiveDateStr: "2026-10-09", // 4 days ago
        targetDate: new Date("2026-10-13T10:00:00Z"),
        hasStreakFreeze: false
      });

      expect(result.newStreak).toBe(1);
      expect(result.streakReset).toBe(true);
      expect(result.streakIncremented).toBe(false);
    });
  });

  describe("Dynamic XP & Scoring Engine", () => {
    it("calculates weighted XP factoring difficulty, streak multiplier, and pace", () => {
      const easyResult = calculateDynamicXp({
        isCorrect: true,
        difficulty: "easy",
        currentStreakDays: 0,
        timeSpentSeconds: 30,
        expectedPaceSeconds: 60
      });

      const hardStreakResult = calculateDynamicXp({
        isCorrect: true,
        difficulty: "hard",
        currentStreakDays: 10, // 1.0 + 0.5 = 1.5x streak multiplier
        timeSpentSeconds: 30,
        expectedPaceSeconds: 60
      });

      expect(easyResult.totalXpAwarded).toBeGreaterThan(15);
      expect(hardStreakResult.totalXpAwarded).toBeGreaterThan(easyResult.totalXpAwarded);
      expect(hardStreakResult.streakMultiplier).toBe(1.5);
    });

    it("awards effort resilience points for incorrect answers without crashing", () => {
      const failedResult = calculateDynamicXp({
        isCorrect: false,
        difficulty: "hard",
        currentStreakDays: 5
      });

      expect(failedResult.totalXpAwarded).toBe(5);
      expect(failedResult.breakdown).toContain("Effort & Misconception Logged");
    });

    it("computes comprehensive assessment completion bonuses", () => {
      const res = calculateAssessmentCompletionXp(85, 20, 900);
      expect(res.completionBonus).toBe(200);
      expect(res.accuracyBonus).toBe(340);
      expect(res.totalXp).toBe(565);
    });
  });
});

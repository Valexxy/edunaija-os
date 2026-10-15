import { describe, it, expect } from "vitest";
import {
  STATUTORY_EXAM_CALENDAR,
  resolveStatutoryExamSchedule,
  calculateLiveExamCountdown
} from "@/lib/curriculum/exam-calendar";

describe("Statutory Nigerian Examination Calendar and Dynamic Countdown Suite", () => {
  it("maintains verified statutory schedules for all national examination boards", () => {
    const boards = ["JAMB", "WAEC", "NECO", "BECE", "NCEE", "NABTEB"];
    for (const board of boards) {
      const schedule = STATUTORY_EXAM_CALENDAR[board];
      expect(schedule).toBeDefined();
      expect(schedule.officialName).toBeTruthy();
      expect(schedule.governingBody).toBeTruthy();
      expect(schedule.statutorySource).toBeTruthy();
      expect(schedule.startDateIso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(schedule.endDateIso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(schedule.officialPortalUrl).toMatch(/^https?:\/\//);
    }
  });

  it("correctly resolves statutory schedule by student goal keywords", () => {
    expect(resolveStatutoryExamSchedule("JAMB UTME 2026").examKey).toBe("JAMB");
    expect(resolveStatutoryExamSchedule("UTME Practice").examKey).toBe("JAMB");
    expect(resolveStatutoryExamSchedule("WAEC WASSCE Preparation").examKey).toBe("WAEC");
    expect(resolveStatutoryExamSchedule("NECO SSCE Mock").examKey).toBe("NECO");
    expect(resolveStatutoryExamSchedule("Junior WAEC / BECE").examKey).toBe("BECE");
    expect(resolveStatutoryExamSchedule("Primary 6 National Common Entrance (NCEE)").examKey).toBe("NCEE");
    expect(resolveStatutoryExamSchedule("NABTEB National Technical Certificate").examKey).toBe("NABTEB");
  });

  it("dynamically calculates remaining days without static hardcoding", () => {
    const testNow = new Date("2027-01-01T00:00:00+01:00");
    const result = calculateLiveExamCountdown("JAMB UTME 2027", testNow);

    expect(result.daysRemaining).toBeGreaterThan(0);
    expect(result.officialName).toContain("Unified Tertiary Matriculation Examination");
    expect(result.statutorySource).toContain("JAMB Official National Policy Meeting");
    expect(result.startDateIso).toBe("2027-04-18");
    expect(result.isPast).toBe(false);
  });

  it("accurately detects when examination diet is actively in progress", () => {
    const inProgressDate = new Date("2027-04-20T10:00:00+01:00");
    const result = calculateLiveExamCountdown("JAMB UTME 2027", inProgressDate);

    expect(result.isExamInProgress).toBe(true);
    expect(result.daysRemaining).toBe(0);
  });
});

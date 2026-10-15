import { describe, it, expect, beforeEach } from "vitest";
import {
  STATUTORY_EXAM_CALENDAR,
  adjustExamSchedule,
  resetExamRegistry,
  calculateLiveExamCountdown,
  recalibrateDailyStudyPace
} from "@/lib/curriculum/exam-calendar";

describe("Autonomous Regulatory Exam Shift & Study Pace Auto-Adjustment Suite", () => {
  beforeEach(() => {
    resetExamRegistry();
  });

  it("baseline JAMB UTME start date is strictly maintained prior to any regulatory shift", () => {
    const baseline = STATUTORY_EXAM_CALENDAR.JAMB;
    expect(baseline.startDateIso).toBe("2027-04-18");
    expect(baseline.status).toBe("CONFIRMED");
    expect(baseline.governingBody).toBe("Joint Admissions and Matriculation Board (JAMB)");
  });

  it("automatically detects, records, and recalculates when JAMB shifts an exam date", () => {
    const fixedNow = new Date("2027-01-01T08:00:00+01:00");

    // 1. Initial calculation before shift
    const initialCountdown = calculateLiveExamCountdown("JAMB UTME 2027", fixedNow);
    expect(initialCountdown.startDateIso).toBe("2027-04-18");
    expect(initialCountdown.daysRemaining).toBe(107);
    expect(initialCountdown.status).toBe("CONFIRMED");

    // 2. JAMB Registrar announces a 2-week postponement
    const shiftedSchedule = adjustExamSchedule(
      "JAMB",
      "2027-05-02",
      "2027-05-12",
      "Rescheduled by JAMB Governing Board to avoid national holiday clash",
      "Official Gazette Circular No. JAMB/REG/2027/04"
    );

    expect(shiftedSchedule.status).toBe("POSTPONED_SHIFTED");
    expect(shiftedSchedule.startDateIso).toBe("2027-05-02");
    expect(shiftedSchedule.previousStartDate).toBe("2027-04-18");
    expect(shiftedSchedule.shiftReason).toContain("clash");

    // 3. System countdown automatically recalibrates without code changes or restarts
    const adjustedCountdown = calculateLiveExamCountdown("JAMB UTME 2027", fixedNow);
    expect(adjustedCountdown.startDateIso).toBe("2027-05-02");
    expect(adjustedCountdown.daysRemaining).toBe(121); // exactly 14 days added!
    expect(adjustedCountdown.status).toBe("POSTPONED_SHIFTED");
    expect(adjustedCountdown.previousStartDate).toBe("2027-04-18");
  });

  it("dynamically recalibrates daily study pacing when days remaining change", () => {
    // Scenario A: Standard 107 days remaining
    const pace107 = recalibrateDailyStudyPace(107, 48, 16);
    expect(pace107.remainingTopics).toBe(32);
    expect(pace107.pacingState).toBe("steady");
    expect(pace107.dailyTargetQuestions).toBe(5); // 32 * 15 = 480 / 107 = 4.48 -> 5

    // Scenario B: JAMB shifts date by +14 days (121 days remaining)
    const paceShifted = recalibrateDailyStudyPace(121, 48, 16);
    expect(paceShifted.pacingState).toBe("relaxed");
    expect(paceShifted.dailyTargetQuestions).toBe(4); // 480 / 121 = 3.96 -> 4

    // Scenario C: Final 10 days emergency crunch
    const paceEmergency = recalibrateDailyStudyPace(10, 48, 16);
    expect(paceEmergency.pacingState).toBe("emergency");
    expect(paceEmergency.dailyTargetQuestions).toBe(48); // 480 / 10 = 48
    expect(paceEmergency.recommendedHoursPerDay).toBeGreaterThan(4);
  });
});

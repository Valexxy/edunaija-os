import { describe, it, expect } from "vitest";
import { isMinor, validateTrcnNumber, scanTextForChildSafeguardingViolations } from "@/lib/security/safeguarding";
import { MOCK_TRCN_TEACHERS } from "@/lib/classroom/trcn-teachers";

describe("Live Classroom Gate and TRCN Vetting Suite (Option 1)", () => {
  it("strictly enforces statutory minor definition under CRA 2003 (age < 18)", () => {
    expect(isMinor(16)).toBe(true);
    expect(isMinor(17)).toBe(true);
    expect(isMinor(18)).toBe(false);
    expect(isMinor(22)).toBe(false);
  });

  it("validates TRCN teacher license formatting across Nigerian states", () => {
    const validLagos = validateTrcnNumber("TRCN/LA/102938");
    expect(validLagos.isValid).toBe(true);
    expect(validLagos.stateCode).toBe("LA");

    const validAnambra = validateTrcnNumber("TRCN/AN/49281");
    expect(validAnambra.isValid).toBe(true);
    expect(validAnambra.stateCode).toBe("AN");

    const invalid = validateTrcnNumber("INVALID-TEACHER-123");
    expect(invalid.isValid).toBe(false);
  });

  it("provides verified TRCN accredited faculty in the mock session schedule", () => {
    expect(MOCK_TRCN_TEACHERS.length).toBeGreaterThan(0);
    for (const teacher of MOCK_TRCN_TEACHERS) {
      expect(teacher.fullName).toBeTruthy();
      expect(teacher.trcnNumber).toContain("TRCN/");
      expect(teacher.trcnCategory).toBeTruthy();
      expect(teacher.stateOfPractice).toBeTruthy();
      expect(teacher.ninVerified).toBe(true);
      expect(teacher.rating).toBeGreaterThanOrEqual(4.8);
    }
  });

  it("blocks contact solicitation in live classroom chats under CRA 2003", () => {
    const phoneAttempt = scanTextForChildSafeguardingViolations("Call me on 08031234567 after the live lesson");
    expect(phoneAttempt.isSafe).toBe(false);
    expect(phoneAttempt.sanitizedText).toContain("[PROTECTED_CONTACT_REDACTED]");

    const waAttempt = scanTextForChildSafeguardingViolations("Send your homework to my whatsapp number");
    expect(waAttempt.isSafe).toBe(false);
    expect(waAttempt.sanitizedText).toContain("[OFF_PLATFORM_CONTACT_BLOCKED]");
  });
});

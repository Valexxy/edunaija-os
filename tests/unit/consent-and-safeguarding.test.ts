import { describe, it, expect } from "vitest";
import {
  recordParentConsent,
  getLearnerConsent,
  isParentalConsentMandated,
  getSafeLeaderboardName,
  eraseLearnerData
} from "@/lib/security/consent";
import {
  validateTrcnNumber,
  scanTextForChildSafeguardingViolations
} from "@/lib/security/safeguarding";

describe("NDPA 2023 Consent & CRA Child Safeguarding Suite", () => {
  it("records and retrieves verifiable parental consent with cryptographic audit properties", () => {
    const record = recordParentConsent({
      learnerId: "test-minor-student-01",
      parentIdentifier: "parent.eka@gmail.com",
      relationshipLabel: "Mother",
      scopes: {
        allow_ai_tutor: true,
        allow_live_classes: true,
        allow_leaderboard_nickname: false,
        allow_academic_analytics: true
      },
      clientIp: "102.89.23.14",
      userAgent: "Mozilla/5.0 Android"
    });

    expect(record.learner_id).toBe("test-minor-student-01");
    expect(record.verified).toBe(true);
    expect(record.scopes.allow_ai_tutor).toBe(true);
    expect(record.receipt_signature).toBeTruthy();
    expect(record.ip_hash).toBeTruthy();

    const retrieved = getLearnerConsent("test-minor-student-01");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.parent_identifier).toBe("parent.eka@gmail.com");
  });

  it("mandates parental consent for Primary and Junior Secondary minors", () => {
    expect(isParentalConsentMandated("primary")).toBe(true);
    expect(isParentalConsentMandated("junior_secondary")).toBe(true);
    expect(isParentalConsentMandated("senior_secondary")).toBe(false);
  });

  it("pseudonymizes minor names on public leaderboards to protect child privacy", () => {
    // Child under 14 with default privacy
    const pseudonym = getSafeLeaderboardName("Emeka Okonkwo", "student-minor-99", "primary");
    expect(pseudonym).toContain("Scholar #");
    expect(pseudonym).not.toContain("Emeka");

    // Senior secondary student (age 17) can display real name
    const seniorName = getSafeLeaderboardName("Chukwudi Okafor", "demo-student-user-001", "senior_secondary");
    expect(seniorName).toBe("Chukwudi Okafor");
  });

  it("executes NDPA Section 34 Right to Erasure / Data Scrubbing", async () => {
    recordParentConsent({
      learnerId: "temp-learner-erasure",
      parentIdentifier: "temp@gmail.com",
      relationshipLabel: "Father",
      scopes: {}
    });

    expect(getLearnerConsent("temp-learner-erasure")).not.toBeNull();
    const result = await eraseLearnerData("temp-learner-erasure");
    expect(result.success).toBe(true);
    expect(getLearnerConsent("temp-learner-erasure")).toBeNull();
  });

  it("validates Teachers Registration Council of Nigeria (TRCN) educator licenses", () => {
    expect(validateTrcnNumber("TRCN/LA/49281").isValid).toBe(true);
    expect(validateTrcnNumber("TRCN/AN/102938").isValid).toBe(true);
    expect(validateTrcnNumber("INVALID-TRCN").isValid).toBe(false);
    expect(validateTrcnNumber("TRCN/123").isValid).toBe(false);
  });

  it("detects and redacts off-platform contact solicitation under CRA 2003", () => {
    const dirtyText = "Chat me on WhatsApp 08031234567 or call my personal line!";
    const scan = scanTextForChildSafeguardingViolations(dirtyText);

    expect(scan.isSafe).toBe(false);
    expect(scan.violations).toContain("SHARING_PHONE_NUMBER");
    expect(scan.violations).toContain("WHATSAPP_SOLICITATION");
    expect(scan.sanitizedText).not.toContain("08031234567");
    expect(scan.sanitizedText).not.toContain("WhatsApp");
  });
});

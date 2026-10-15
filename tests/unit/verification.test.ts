import { describe, it, expect } from "vitest";
import { validateNigerianNIN, validateTeacherTRCN } from "@/lib/verification/nin-trcn";

describe("Sovereign NDPA Identity & Credential Verification", () => {
  it("should validate a valid 11-digit Nigerian NIN and mask it", () => {
    const res = validateNigerianNIN("28491048591");
    expect(res.valid).toBe(true);
    expect(res.maskedNin).toBe("284*****591");
    expect(res.details?.ndpaCompliant).toBe(true);
  });

  it("should reject invalid NINs (wrong length or repeating numbers)", () => {
    expect(validateNigerianNIN("12345").valid).toBe(false);
    expect(validateNigerianNIN("11111111111").valid).toBe(false);
  });

  it("should validate TRCN Teacher Licenses across categories A-D", () => {
    const res = validateTeacherTRCN("TRCN/LA/CAT-C/2023/10492");
    expect(res.valid).toBe(true);
    expect(res.category).toBe("C");
    expect(res.details?.accreditationStatus).toBe("VERIFIED_ACTIVE");
    expect(res.details?.allowedTeachingTiers).toContain("SSS");
  });

  it("should validate simplified TRCN license numbers", () => {
    const res = validateTeacherTRCN("TRCN-B-894102");
    expect(res.valid).toBe(true);
    expect(res.category).toBe("B");
  });
});

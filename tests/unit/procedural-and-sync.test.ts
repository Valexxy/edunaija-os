import { describe, it, expect } from "vitest";
import {
  generateProceduralQuadraticQuestion,
  generateProceduralOhmsLawQuestion,
  generateProceduralKinematicsQuestion
} from "@/lib/assessment/procedural-generator";
import {
  generateScoreReceipt,
  verifyScoreReceipt
} from "@/lib/security/score-receipt";

describe("Procedural STEM Item Generation & Cryptographic Receipts", () => {
  it("generates mathematically valid procedural quadratic equations with correct roots", () => {
    const q1 = generateProceduralQuadraticQuestion();
    const q2 = generateProceduralQuadraticQuestion();

    expect(q1.prompt).toContain("Solve the quadratic equation:");
    expect(q1.options.length).toBe(4);
    expect(q1.question_type).toBe("single_choice");
    expect(q1.status).toBe("published");
    expect(q1.id).not.toBe(q2.id); // Must have unique IDs
  });

  it("generates valid physics Ohm's Law and Kinematics questions", () => {
    const ohms = generateProceduralOhmsLawQuestion();
    expect(ohms.prompt).toContain("resistor");
    expect(ohms.options.some((o) => o.text.includes("V"))).toBe(true);

    const kin = generateProceduralKinematicsQuestion();
    expect(kin.prompt).toContain("velocity");
    expect(kin.options.some((o) => o.text.includes("m/s"))).toBe(true);
  });

  it("generates and cryptographically verifies tamper-proof CBT score receipts", () => {
    const receipt = generateScoreReceipt({
      attemptId: "att-jamb-2026-001",
      studentId: "usr-student-val-01",
      assessmentId: "asm-diagnostic-jamb-sss3",
      score: 9,
      totalQuestions: 10
    });

    expect(receipt.certificateNumber).toContain("CERT-NG-");
    expect(receipt.percentage).toBe(90);
    expect(receipt.isValid).toBe(true);

    // Verify valid receipt
    const isAuthentic = verifyScoreReceipt({
      studentId: receipt.studentId,
      assessmentId: receipt.assessmentId,
      score: receipt.score,
      totalQuestions: receipt.totalQuestions,
      completedAt: receipt.completedAt,
      signature: receipt.signature
    });
    expect(isAuthentic).toBe(true);

    // Tampered score must fail verification
    const tampered = verifyScoreReceipt({
      studentId: receipt.studentId,
      assessmentId: receipt.assessmentId,
      score: 10, // Tampered score!
      totalQuestions: receipt.totalQuestions,
      completedAt: receipt.completedAt,
      signature: receipt.signature
    });
    expect(tampered).toBe(false);
  });
});

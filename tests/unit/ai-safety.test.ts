import { describe, expect, it } from "vitest";
import {
  sanitizePromptForChildSafety,
  validateEducationalContext,
  DeterministicCurriculumTutorProvider,
  checkRateLimit,
  checkDailyQuota
} from "@/lib/ai";

describe("AI Safety, NDPA Child Privacy, and Fallback Engine", () => {
  it("scrubs Nigerian phone numbers and email addresses from prompts", () => {
    const dirtyPrompt = "My phone is 08031234567 and my brother's number is +2348123456789. Email me at student@lagos.ng.";
    const result = sanitizePromptForChildSafety(dirtyPrompt);

    expect(result.piiRedacted).toBe(true);
    expect(result.redactionCount).toBeGreaterThanOrEqual(3);
    expect(result.sanitizedText).not.toContain("08031234567");
    expect(result.sanitizedText).not.toContain("+2348123456789");
    expect(result.sanitizedText).not.toContain("student@lagos.ng");
    expect(result.sanitizedText).toContain("[REDACTED_PHONE]");
    expect(result.sanitizedText).toContain("[REDACTED_EMAIL]");
  });

  it("redacts 11-digit NIN or BVN identifiers", () => {
    const prompt = "My NIN is 12345678901 for registration.";
    const result = sanitizePromptForChildSafety(prompt);

    expect(result.piiRedacted).toBe(true);
    expect(result.sanitizedText).not.toContain("12345678901");
    expect(result.sanitizedText).toContain("[REDACTED_ID]");
  });

  it("blocks non-educational and inappropriate inquiries", () => {
    const unsafe = validateEducationalContext("How can I hack and cheat on exam tomorrow?");
    expect(unsafe.allowed).toBe(false);

    const safe = validateEducationalContext("Can you explain the structure of the periodic table?");
    expect(safe.allowed).toBe(true);
  });

  it("deterministic fallback tutor generates curriculum explanations in English and Pidgin", async () => {
    const tutor = new DeterministicCurriculumTutorProvider();

    // English explanation
    const enRes = await tutor.explain({
      question: "Explain photosynthesis to me",
      learnerLevel: "senior_secondary",
      subject: "Biology",
      language: "en"
    });
    expect(enRes.explanation.toLowerCase()).toContain("photosynthesis");
    expect(enRes.keyPoints.length).toBeGreaterThan(0);
    expect(enRes.practiceQuestion).toBeDefined();

    // Naija Pidgin explanation
    const pcmRes = await tutor.explain({
      question: "Explain quadratic equation in simple steps",
      learnerLevel: "senior_secondary",
      subject: "Mathematics",
      language: "pcm"
    });
    expect(pcmRes.explanation).toContain("ax²");
    expect(pcmRes.keyPoints.length).toBeGreaterThan(0);
  });

  it("enforces rate limiting and daily quota controls", async () => {
    const testId = "test-rate-user";
    const quota = await checkDailyQuota(testId);
    expect(quota.allowed).toBe(true);
    expect(quota.remaining).toBe(50);

    // Rate limit checks
    const r1 = checkRateLimit(testId);
    expect(r1.allowed).toBe(true);
  });
});

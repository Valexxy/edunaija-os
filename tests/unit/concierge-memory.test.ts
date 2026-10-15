import { describe, it, expect } from "vitest";
import {
  DEFAULT_CONCIERGE_MEMORY,
  compressMemoryForPrompt,
  getPersonaPromptInstruction,
  ConciergeMemoryGraph
} from "@/lib/ai/concierge-memory";

describe("AI Concierge Persistent Memory Suite (Option 4)", () => {
  it("provides comprehensive default student memory graph", () => {
    expect(DEFAULT_CONCIERGE_MEMORY.scholarName).toBe("Chukwudi Okafor");
    expect(DEFAULT_CONCIERGE_MEMORY.state).toBe("Lagos");
    expect(DEFAULT_CONCIERGE_MEMORY.targetExam).toContain("JAMB");
    expect(DEFAULT_CONCIERGE_MEMORY.preferredPersona).toBe("sister_amaka");
    expect(DEFAULT_CONCIERGE_MEMORY.weakTopics.length).toBeGreaterThan(0);
  });

  it("compresses full student memory into ultra-compact context (<= 60 tokens)", () => {
    const memory: ConciergeMemoryGraph = {
      scholarName: "Amina Bello",
      state: "Kano",
      lga: "Nassarawa",
      academicTier: "senior_secondary",
      classLabel: "SSS 3 Science",
      targetExam: "JAMB UTME 2027",
      targetGoal: "ABU Zaria Architecture (Target: 290)",
      weakTopics: ["Mathematics: Trigonometry", "Physics: Circular Motion"],
      preferredPersona: "brother_femi",
      analogyStyle: "exam_formula_rigorous",
      lastActiveIso: new Date().toISOString()
    };

    const compressed = compressMemoryForPrompt(memory);
    expect(compressed).toContain("Amina Bello");
    expect(compressed).toContain("ABU Zaria");
    expect(compressed).toContain("Trigonometry");
    expect(compressed).toContain("Brother Femi");

    // Token length approximation: ~4 characters per token
    const approximateTokens = Math.ceil(compressed.length / 4);
    expect(approximateTokens).toBeLessThanOrEqual(60);
  });

  it("generates authentic, differentiated pedagogical prompts for Sister Amaka and Brother Femi", () => {
    const amakaPrompt = getPersonaPromptInstruction("sister_amaka");
    expect(amakaPrompt).toContain("Sister Amaka");
    expect(amakaPrompt).toContain("analogies");
    expect(amakaPrompt).toContain("jollof");

    const femiPrompt = getPersonaPromptInstruction("brother_femi");
    expect(femiPrompt).toContain("Brother Femi");
    expect(femiPrompt).toContain("marking scheme");
    expect(femiPrompt).toContain("rigorous");
  });
});

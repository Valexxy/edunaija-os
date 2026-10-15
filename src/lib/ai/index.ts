import type { TutorProvider, TutorRequest, TutorResponse } from "./types";
import { GeminiTutorProvider } from "./gemini-provider";
import { GroqTutorProvider } from "./groq-provider";
import { DeterministicCurriculumTutorProvider } from "./fallback-provider";
import { getServerEnv } from "../env";

export class CascadingTutorProvider implements TutorProvider {
  private geminiProvider = new GeminiTutorProvider();
  private groqProvider = new GroqTutorProvider();
  private fallbackProvider = new DeterministicCurriculumTutorProvider();

  async explain(input: TutorRequest): Promise<TutorResponse> {
    const env = getServerEnv();

    // Tier 1: Google Gemini (Gemini 2.5 Flash)
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== "") {
      try {
        return await this.geminiProvider.explain(input);
      } catch (geminiError) {
        console.warn("Gemini provider failed, cascading to Groq:", geminiError);
      }
    }

    // Tier 2: Groq High-Speed AI (LLaMA 3.3 70B)
    if (env.GROQ_API_KEY && env.GROQ_API_KEY.trim() !== "") {
      try {
        return await this.groqProvider.explain(input);
      } catch (groqError) {
        console.warn("Groq provider failed, cascading to deterministic local engine:", groqError);
      }
    }

    // Tier 3: Deterministic Curriculum Engine (offline, zero-token, 100% reliable)
    return await this.fallbackProvider.explain(input);
  }
}

// Factory function
export function getTutorProvider(): TutorProvider {
  return new CascadingTutorProvider();
}

export * from "./types";
export * from "./safety";
export * from "./metering";
export * from "./fallback-provider";
export * from "./gemini-provider";
export * from "./groq-provider";

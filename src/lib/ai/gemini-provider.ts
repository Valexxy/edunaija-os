import { z } from "zod";
import type { TutorProvider, TutorRequest, TutorResponse } from "./types";
import { getServerEnv } from "../env";

const responseSchema = z.object({
  explanation: z.string().min(1).max(8000),
  keyPoints: z.array(z.string().min(1).max(500)).max(8),
  practiceQuestion: z.string().max(1000).optional()
});

export class GeminiTutorProvider implements TutorProvider {
  async explain(input: TutorRequest): Promise<TutorResponse> {
    const env = getServerEnv();
    if (!env.GEMINI_API_KEY) throw new Error("AI tutoring is not configured");
    const modelName = env.GEMINI_MODEL || "gemini-2.5-flash";

    const prompt = [
      "You are a patient educational tutor for learners in Nigeria.",
      "Teach rather than merely give an answer. Be age-appropriate, respectful, and clear.",
      "Do not claim a curriculum item is official unless supplied as verified source material.",
      "If the question is ambiguous, state the uncertainty. Never ask the learner for personal contact details.",
      "Return ONLY valid JSON with keys: explanation (string), keyPoints (string array), practiceQuestion (optional string).",
      `Learner level: ${input.learnerLevel}`,
      `Subject: ${input.subject ?? "not specified"}`,
      `Topic: ${input.topic ?? "not specified"}`,
      `Preferred language: ${input.language === "pcm" ? "simple Nigerian Pidgin English where appropriate" : "clear English"}`,
      `Learner question: ${input.question}`,
      ...(input.curriculumGuidance ? [input.curriculumGuidance] : [])
    ].join("\n");

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsedRaw = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);

    // Sanitize keyPoints to avoid zod empty-string issues
    const cleanKeyPoints = (Array.isArray(parsedRaw.keyPoints) ? parsedRaw.keyPoints : [])
      .map((k: unknown) => (typeof k === "string" ? k.trim() : ""))
      .filter((k: string) => k.length > 0)
      .slice(0, 8);

    const parsed = responseSchema.parse({
      explanation: typeof parsedRaw.explanation === "string" ? parsedRaw.explanation.trim() : "Here is the key breakdown:",
      keyPoints: cleanKeyPoints.length > 0 ? cleanKeyPoints : ["Understand the basic principles first."],
      practiceQuestion: typeof parsedRaw.practiceQuestion === "string" ? parsedRaw.practiceQuestion.trim() : undefined
    });

    return {
      ...parsed,
      provider: "gemini",
      model: modelName,
      citation: input.citation,
      curriculumSource: input.citation ? "NERDC Nigerian National Curriculum" : undefined
    };
  }
}


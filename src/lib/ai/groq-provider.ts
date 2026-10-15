import { z } from "zod";
import type { TutorProvider, TutorRequest, TutorResponse } from "./types";
import { getServerEnv } from "../env";

const responseSchema = z.object({
  explanation: z.string().min(1).max(8000),
  keyPoints: z.array(z.string().min(1).max(500)).max(8),
  practiceQuestion: z.string().max(1000).optional()
});

export class GroqTutorProvider implements TutorProvider {
  async explain(input: TutorRequest): Promise<TutorResponse> {
    const env = getServerEnv();
    if (!env.GROQ_API_KEY) throw new Error("Groq tutoring is not configured");

    const modelName = env.GROQ_MODEL;
    const prompt = [
      "You are an encouraging, expert educational tutor for learners in Nigeria.",
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

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: "You are an expert Nigerian educational tutor. You output ONLY valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || "{}";
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    const parsedRaw = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);

    const cleanKeyPoints = (Array.isArray(parsedRaw.keyPoints) ? parsedRaw.keyPoints : [])
      .map((k: unknown) => (typeof k === "string" ? k.trim() : ""))
      .filter((k: string) => k.length > 0)
      .slice(0, 8);

    const parsed = responseSchema.parse({
      explanation: typeof parsedRaw.explanation === "string" ? parsedRaw.explanation.trim() : "Key explanation:",
      keyPoints: cleanKeyPoints.length > 0 ? cleanKeyPoints : ["Master the foundational definitions first."],
      practiceQuestion: typeof parsedRaw.practiceQuestion === "string" ? parsedRaw.practiceQuestion.trim() : undefined
    });

    return {
      ...parsed,
      provider: "groq",
      model: modelName,
      citation: input.citation,
      curriculumSource: input.citation ? "NERDC Nigerian National Curriculum" : undefined
    };
  }
}

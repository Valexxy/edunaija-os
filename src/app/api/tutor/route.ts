import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getTutorProvider,
  sanitizePromptForChildSafety,
  validateEducationalContext,
  checkRateLimit,
  checkDailyQuota,
  recordAiUsageEvent,
  estimateTokenCost
} from "@/lib/ai";
import { curriculumRAG } from "@/lib/ai/curriculum-retrieval";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { getCurrentUser } from "@/lib/auth/session";
import { getPersonaPromptInstruction } from "@/lib/ai/concierge-memory";

export const runtime = "nodejs";

const bodySchema = z.object({
  question: z.string().trim().min(3).max(2000),
  learnerLevel: z.enum(["primary", "junior_secondary", "senior_secondary", "exam_prep"]),
  subject: z.string().trim().max(100).optional(),
  topic: z.string().trim().max(150).optional(),
  language: z.enum(["en", "pcm"]).optional(),
  turnstileToken: z.string().optional(),
  learnerMemory: z.string().max(300).optional(),
  persona: z.enum(["sister_amaka", "brother_femi"]).optional()
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }

  // 1. Session & Identity Resolution
  const user = await getCurrentUser();
  const userId = user?.id || "demo-student-user-001";

  // 2. Per-User Rate Limiting
  const rateLimit = checkRateLimit(userId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many questions in a short period. Please wait ${rateLimit.retryAfterSeconds ?? 30} seconds.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 30) } }
    );
  }

  // 3. Daily Usage Quota Enforcement
  const quota = await checkDailyQuota(userId);
  if (!quota.allowed) {
    await recordAiUsageEvent({
      userId,
      provider: "none",
      model: "none",
      feature: "ai_tutor",
      outcome: "blocked"
    });
    return NextResponse.json(
      { error: "Daily AI tutor query limit reached (50/50). Quota refreshes at midnight." },
      { status: 429 }
    );
  }

  // 4. Educational Guardrail Check
  const guardrail = validateEducationalContext(parsed.data.question);
  if (!guardrail.allowed) {
    await recordAiUsageEvent({
      userId,
      provider: "guardrail",
      model: "safety_filter",
      feature: "ai_tutor",
      outcome: "blocked"
    });
    return NextResponse.json(
      { error: guardrail.reason || "Prompt outside educational guidelines." },
      { status: 400 }
    );
  }

  // 4b. Optional Cloudflare Turnstile Bot Challenge Verification
  if (parsed.data.turnstileToken) {
    const turnstileCheck = await verifyTurnstileToken(parsed.data.turnstileToken);
    if (!turnstileCheck.success) {
      return NextResponse.json({ error: "Turnstile bot challenge failed" }, { status: 403 });
    }
  }

  // 5. NDPA 2023 Child Data Privacy Scrubbing
  const sanitization = sanitizePromptForChildSafety(parsed.data.question);

  // 6. Curriculum-Grounded RAG Retrieval (NERDC / Qdrant)
  const ragResult = await curriculumRAG.retrieve({
    question: sanitization.sanitizedText,
    learnerLevel: parsed.data.learnerLevel,
    subject: parsed.data.subject,
    topic: parsed.data.topic
  });

  const personaInstruction = getPersonaPromptInstruction(parsed.data.persona || "sister_amaka");
  const fullCurriculumGuidance = [
    ragResult.promptGuidance,
    personaInstruction,
    parsed.data.learnerMemory ? `[Learner Persistent Memory: ${parsed.data.learnerMemory}]` : ""
  ].filter(Boolean).join("\n\n");

  const safePayload = {
    ...parsed.data,
    question: sanitization.sanitizedText,
    curriculumGuidance: fullCurriculumGuidance,
    citation: ragResult.citation
  };

  // 7. Invoke AI Tutor Provider
  try {
    const tutor = getTutorProvider();
    const result = await tutor.explain(safePayload);

    // Approximate token usage and log event
    const estimatedInputTokens = Math.ceil(safePayload.question.length / 4) + 120;
    const estimatedOutputTokens = Math.ceil(result.explanation.length / 4) + 60;
    const estimatedCost = estimateTokenCost(estimatedInputTokens, estimatedOutputTokens, result.model);

    await recordAiUsageEvent({
      userId,
      provider: result.provider,
      model: result.model,
      feature: "ai_tutor",
      inputTokens: estimatedInputTokens,
      outputTokens: estimatedOutputTokens,
      estimatedCost,
      outcome: "success"
    });

    return NextResponse.json({
      ...result,
      citation: result.citation || ragResult.citation,
      curriculumGrounding: {
        matched: ragResult.matchFound,
        syllabusCode: ragResult.doc?.syllabusCode,
        source: ragResult.source,
        confidence: ragResult.relevanceScore
      },
      meta: {
        piiRedacted: sanitization.piiRedacted,
        dailyRemaining: quota.remaining - 1,
        totalAllowed: quota.totalAllowed
      }
    });
  } catch (err) {
    console.error("Tutor route execution error:", err);
    await recordAiUsageEvent({
      userId,
      provider: "error",
      model: "unknown",
      feature: "ai_tutor",
      outcome: "error"
    });
    return NextResponse.json({ error: "Tutor service temporarily unavailable" }, { status: 502 });
  }
}

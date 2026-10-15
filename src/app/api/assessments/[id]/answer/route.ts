import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAnswer } from "@/lib/assessment/engine";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

const answerSchema = z.object({
  attemptId: z.string().min(1),
  questionId: z.string().min(1),
  response: z.object({
    selectedOptionId: z.string().optional(),
    selectedOptionIds: z.array(z.string()).optional(),
    textResponse: z.string().optional()
  })
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user && (isSupabaseConfigured() || process.env.NODE_ENV === "production")) {
    return NextResponse.json(
      { error: "Authentication required to record answer" },
      { status: 401 }
    );
  }

  const userId = user?.id || "demo-student-user-001";

  try {
    const answer = recordAnswer(
      parsed.data.attemptId,
      parsed.data.questionId,
      parsed.data.response,
      id,
      userId
    );
    return NextResponse.json({ success: true, answer });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to record answer";
    const status = msg.toLowerCase().includes("unauthorized") ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

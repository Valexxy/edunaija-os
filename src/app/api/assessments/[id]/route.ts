import { NextResponse } from "next/server";
import { resolveAssessmentById, resolveQuestionIdsForAssessment } from "@/lib/assessment/provisioning";
import { getComprehensiveQuestionBank } from "@/lib/curriculum/scrutiny-engine";
import { sanitizeQuestionForClient } from "@/lib/curriculum/ingest";
import { getCurrentUser, getLearnerProfile } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Question } from "@/lib/curriculum/types";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const learnerProfile = user ? await getLearnerProfile(user.id) : null;
  const assessment = resolveAssessmentById(id, learnerProfile);

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const questionIds = resolveQuestionIdsForAssessment(id, learnerProfile);
  const comprehensiveBank = getComprehensiveQuestionBank();
  const bankMap = new Map<string, Question>();
  for (const q of comprehensiveBank) {
    bankMap.set(q.id, q);
  }

  // Only query Supabase for questions that are not already present in comprehensive memory bank
  const missingQuestionIds = questionIds.filter((qid) => !bankMap.has(qid));
  if (missingQuestionIds.length > 0) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      try {
        const { data: dbQuestions, error: dbErr } = await admin
          .from("questions")
          .select("id, topic_id, question_type, prompt, options, difficulty, status, provenance")
          .in("id", missingQuestionIds);

      if (!dbErr && dbQuestions && dbQuestions.length > 0) {
        for (const dbQ of dbQuestions) {
          if (!bankMap.has(dbQ.id)) {
            bankMap.set(dbQ.id, {
              ...dbQ,
              answer_key: { correctOptionId: "" },
              explanation: "Verified Nigerian Curriculum Standard",
              topic_id: dbQ.topic_id || "general"
            } as Question);
          }
        }
      }
    } catch {
      // Graceful fallback to verified comprehensive repository
    }
  }
}

  const publicQuestions = questionIds
    .map((qId) => bankMap.get(qId))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map(sanitizeQuestionForClient);

  return NextResponse.json({
    assessment,
    questions: publicQuestions,
    learnerProfile,
    user: user
      ? {
          id: user.id,
          display_name: user.display_name,
          role: user.role,
          is_demo: user.is_demo
        }
      : null
  });
}


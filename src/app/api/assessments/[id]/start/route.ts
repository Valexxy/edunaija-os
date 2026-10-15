import { NextResponse } from "next/server";
import { startAttempt } from "@/lib/assessment/engine";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Bot protection challenge check if provided
  try {
    const body = await _request.clone().json().catch(() => ({}));
    if (body?.turnstileToken) {
      const turnstileCheck = await verifyTurnstileToken(body.turnstileToken);
      if (!turnstileCheck.success) {
        return NextResponse.json({ error: "Bot verification challenge failed" }, { status: 403 });
      }
    }
  } catch {
    // Continue
  }

  const user = await getCurrentUser();
  // Allow unauthenticated visitors to take open practice assessments as guest scholar
  const userId = user?.id || "demo-student-user-001";

  if (user && user.role !== "student") {
    return NextResponse.json(
      {
        error: `CBT Assessments are designed strictly for students. You are logged in as a ${user.role}.`,
        role: user.role
      },
      { status: 403 }
    );
  }

  try {
    const attempt = startAttempt(id, userId);

    // Persist attempt audit record to Supabase in background
    if (isSupabaseConfigured()) {
      try {
        const admin = createSupabaseAdminClient();
        if (admin) {
          Promise.resolve(
            admin.from("audit_events").insert({
              actor_user_id: user?.id || null,
              action: "ASSESSMENT_ATTEMPT_STARTED",
              entity_type: "assessment_attempt",
              entity_id: attempt.id,
              metadata: {
                assessmentId: id,
                userId: attempt.learner_user_id,
                startedAt: attempt.started_at
              }
            })
          ).catch((err: unknown) => console.warn("Background audit insert warning:", err));
        }
      } catch (dbErr) {
        console.warn("Could not write start attempt audit to Supabase:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      attempt
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to start assessment";
    return NextResponse.json(
      { error: msg },
      { status: 400 }
    );
  }
}

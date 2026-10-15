import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateAndSubmitAttempt } from "@/lib/assessment/engine";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { withEnterpriseErrorHandler } from "@/lib/monitoring/enterprise-error-handler";

export const runtime = "nodejs";

const submitSchema = z.object({
  attemptId: z.string().min(1),
  answers: z.record(
    z.string(),
    z.object({
      selectedOptionId: z.string().optional()
    })
  ).optional(),
  integrityAudit: z.object({
    tabSwitches: z.number().optional(),
    copyAttempts: z.number().optional(),
    integrityScore: z.number().optional(),
    status: z.string().optional()
  }).optional(),
  clientSubmissionTimestamp: z.union([z.string(), z.number()]).optional(),
  offlineQueuedAt: z.string().optional()
});

export const POST = withEnterpriseErrorHandler(async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  if (!context?.params) {
    return NextResponse.json({ error: "Missing assessment ID" }, { status: 400 });
  }
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (user && user.role !== "student") {
    return NextResponse.json(
      { error: "Forbidden: Assessments are reserved for student learners. Guardians and teachers supervise via their respective portals." },
      { status: 403 }
    );
  }

  // Allow unauthenticated visitors to submit practice attempts
  const userId = user?.id || "demo-student-user-001";
  const clientTimestamp = parsed.data.clientSubmissionTimestamp || parsed.data.offlineQueuedAt;

  try {
    const result = await evaluateAndSubmitAttempt(
      parsed.data.attemptId,
      parsed.data.answers,
      id,
      userId,
      {
        clientSubmissionTimestamp: clientTimestamp,
        offlineGracePeriodSeconds: 300 // Statutory 5-minute offline grace period
      }
    );

    if (isSupabaseConfigured()) {
      try {
        const admin = createSupabaseAdminClient();
        if (admin) {
          // Asynchronously log server-authoritative submission audit
          Promise.resolve(
            admin.from("audit_events").insert({
              actor_user_id: user?.id || null,
              action: "ASSESSMENT_ATTEMPT_SUBMITTED",
              entity_type: "assessment_attempt",
              entity_id: parsed.data.attemptId,
              metadata: {
                assessmentId: id,
                userId: userId,
                score: result.score,
                maxScore: result.maxScore,
                percentage: result.percentage,
                passed: result.percentage >= 50,
                timeSpentSeconds: result.timeSpentSeconds,
                timedOut: result.timedOut,
                gracePeriodAppliedSeconds: result.gracePeriodAppliedSeconds || 0,
                integrityAudit: parsed.data.integrityAudit || { status: "CLEAN", integrityScore: 100 }
              }
            })
          ).catch((err: unknown) => console.warn("Background submission audit warning:", err));

          // Asynchronously log offline grace period audit if applicable
          if (result.gracePeriodAppliedSeconds && result.gracePeriodAppliedSeconds > 0) {
            Promise.resolve(
              admin.from("offline_submission_audits").insert({
                attempt_id: parsed.data.attemptId,
                learner_user_id: user?.id || null,
                client_timestamp: new Date(clientTimestamp!).toISOString(),
                network_drift_seconds: result.gracePeriodAppliedSeconds,
                within_grace_period: true
              })
            ).catch((err: unknown) => console.warn("Background offline audit warning:", err));
          }

          // Asynchronously log proctored integrity report
          if (parsed.data.integrityAudit) {
            Promise.resolve(
              admin.from("exam_integrity_audits").insert({
                candidate_user_id: user?.id || null,
                assessment_id: id,
                tab_switches: parsed.data.integrityAudit.tabSwitches || 0,
                copy_attempts: parsed.data.integrityAudit.copyAttempts || 0,
                integrity_score: parsed.data.integrityAudit.integrityScore ?? 100.0,
                status: parsed.data.integrityAudit.status || "CLEAN"
              })
            ).catch((err: unknown) => console.warn("Background integrity audit warning:", err));
          }
        }
      } catch (dbErr) {
        console.warn("Could not log attempt to Supabase:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      result
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit assessment";
    const status = msg.toLowerCase().includes("unauthorized") ? 403 : 400;
    return NextResponse.json(
      { error: msg },
      { status }
    );
  }
}, "POST /api/assessments/[id]/submit");

import { NextResponse } from "next/server";
import { z } from "zod";
import { submitChallengeResult } from "@/lib/challenges/engine";
import { getCurrentUser } from "@/lib/auth/session";
import { upstashRedis } from "@/lib/cache/upstash-client";
import { posthog } from "@/lib/analytics/posthog";
import { sentry } from "@/lib/monitoring/sentry";
import { withEnterpriseErrorHandler } from "@/lib/monitoring/enterprise-error-handler";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const submitSchema = z.object({
  attemptId: z.string().min(1),
  // Optional client telemetry fields (ignored by server in favor of verified attempt score)
  score: z.number().optional(),
  completionSeconds: z.number().optional()
});

export const POST = withEnterpriseErrorHandler(async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  if (!context?.params) {
    return NextResponse.json({ error: "Missing challenge ID" }, { status: 400 });
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
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to submit challenge score" },
      { status: 401 }
    );
  }

  if (user.role !== "student") {
    return NextResponse.json(
      { error: "Forbidden: National tournament submissions are reserved for student participants." },
      { status: 403 }
    );
  }

  const userId = user.id;

  try {
    const updated = submitChallengeResult(
      id,
      userId,
      parsed.data.attemptId
    );

    // 1. Asynchronously replicate score to Upstash Redis Sorted Set for sub-5ms leaderboard lookups
    const verifiedScore = updated.score ?? 0;
    upstashRedis.zadd(`challenge:${id}:leaderboard`, verifiedScore, userId).catch((e) => {
      console.warn("[ChallengeSubmit] Upstash Redis zadd failed:", e);
    });

    // 2. Telemetry tracking via PostHog
    posthog.track({
      distinctId: userId,
      event: "challenge_submitted",
      properties: {
        challenge_id: id,
        score: verifiedScore,
        completion_seconds: updated.completion_seconds ?? 0
      }
    }).catch(() => {});

    // 3. Server-authoritative sync to Supabase PostgreSQL database
    if (isSupabaseConfigured()) {
      try {
        const admin = createSupabaseAdminClient();
        if (admin) {
          const isChallengeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
          const isUserUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
          const isAttemptUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed.data.attemptId);

          if (isChallengeUuid && isUserUuid) {
            Promise.resolve(
              admin.from("challenge_participants").upsert({
                challenge_id: id,
                user_id: userId,
                attempt_id: isAttemptUuid ? parsed.data.attemptId : null,
                score: verifiedScore,
                completion_seconds: updated.completion_seconds ?? 0,
                verification_status: "verified",
                review_status: "clear"
              })
            ).catch((err: unknown) => console.warn("[ChallengeSubmit] Background participant upsert warning:", err));
          }

          // Always record audit trail in Supabase audit_events in background
          Promise.resolve(
            admin.from("audit_events").insert({
              actor_user_id: isUserUuid ? userId : null,
              action: "CHALLENGE_SUBMITTED",
              entity_type: "challenge_participant",
              entity_id: `${id}:${userId}`,
              metadata: {
                challengeId: id,
                userId: userId,
                score: verifiedScore,
                completionSeconds: updated.completion_seconds ?? 0,
                attemptId: parsed.data.attemptId
              }
            })
          ).catch((err: unknown) => console.warn("[ChallengeSubmit] Background audit warning:", err));
        }
      } catch (dbErr) {
        console.warn("[ChallengeSubmit] Supabase database sync warning:", dbErr);
      }
    }

    return NextResponse.json({ success: true, participant: updated });
  } catch (err: unknown) {
    sentry.captureException(err, {
      userId,
      route: `/api/challenges/${id}/submit`,
      tags: { challenge_id: id }
    });

    const msg = err instanceof Error ? err.message : "Failed to submit challenge result";
    const status = msg.toLowerCase().includes("unauthorized") ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}, "POST /api/challenges/[id]/submit");

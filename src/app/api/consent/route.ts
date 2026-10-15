import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { recordParentConsent, getLearnerConsent } from "@/lib/security/consent";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const consentPostSchema = z.object({
  learnerId: z.string().min(1),
  parentIdentifier: z.string().trim().min(3).max(120),
  relationshipLabel: z.enum(["Mother", "Father", "Guardian", "Sponsor"]).default("Guardian"),
  scopes: z.object({
    allow_ai_tutor: z.boolean().default(true),
    allow_live_classes: z.boolean().default(true),
    allow_leaderboard_nickname: z.boolean().default(false),
    allow_academic_analytics: z.boolean().default(true)
  })
});

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetLearnerId = searchParams.get("learnerId") || user.id;

  // Caller can only inspect their own record or an authorized guardian/parent
  if (targetLearnerId !== user.id && user.role !== "parent" && user.role !== "platform_admin") {
    return NextResponse.json(
      { error: "Forbidden: You are not authorized to inspect another learner's consent record" },
      { status: 403 }
    );
  }

  const consent = getLearnerConsent(targetLearnerId);
  return NextResponse.json({ success: true, consent });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user && (isSupabaseConfigured() || process.env.NODE_ENV === "production")) {
    return NextResponse.json(
      { error: "Authentication required to record parental consent" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = consentPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid consent data", issues: parsed.error.issues }, { status: 400 });
  }

  // NDPA 2023 Section 31 Child Safeguarding Guard:
  // Learners cannot self-certify parental consent for themselves.
  if (user && (user.id === parsed.data.learnerId || user.role === "student")) {
    return NextResponse.json(
      { error: "Forbidden: Under NDPA 2023 Section 31, learners cannot self-certify parental consent for themselves. An independent verified parent or legal guardian must authenticate." },
      { status: 403 }
    );
  }

  const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "Web Client";
  const isAuthorizedParent = Boolean(user && (user.role === "parent" || user.role === "platform_admin"));

  const record = recordParentConsent({
    learnerId: parsed.data.learnerId,
    parentIdentifier: parsed.data.parentIdentifier,
    relationshipLabel: parsed.data.relationshipLabel,
    scopes: parsed.data.scopes,
    clientIp,
    userAgent,
    verificationMethod: isAuthorizedParent ? "parent_portal" : "email_otp",
    verified: isAuthorizedParent
  });

  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdminClient();
      if (admin) {
        // Persist durable consent record
        await admin.from("parental_consents").insert({
          learner_user_id: parsed.data.learnerId,
          parent_identifier: parsed.data.parentIdentifier,
          relationship_label: parsed.data.relationshipLabel,
          scopes: parsed.data.scopes,
          client_ip_hash: record.ip_hash,
          cryptographic_signature: record.receipt_signature,
          verification_method: "parent_portal"
        });

        // Audit log
        await admin.from("audit_events").insert({
          action: "PARENTAL_CONSENT_RECORDED",
          entity_type: "guardian_consent",
          entity_id: record.id,
          metadata: {
            learnerId: parsed.data.learnerId,
            parentIdentifier: parsed.data.parentIdentifier,
            relationshipLabel: parsed.data.relationshipLabel,
            scopes: parsed.data.scopes,
            clientIpHash: record.ip_hash
          }
        });
      }
    } catch {
      // Non-blocking audit log
    }
  }

  return NextResponse.json({ success: true, consent: record });
}

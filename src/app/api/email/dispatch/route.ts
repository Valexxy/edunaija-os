import { NextResponse } from "next/server";
import { z } from "zod";
import {
  dispatchParentScorecard,
  dispatchCbtCertificate,
  dispatchGuardianConsent,
  dispatchMalpracticeAlert,
  dispatchTeacherOnboardingUpdate,
  dispatchCriticalSystemErrorAlert
} from "@/lib/email/enterprise-mailer";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const parentScorecardSchema = z.object({
  type: z.literal("parent_scorecard"),
  parentEmail: z.string().email(),
  parentName: z.string().optional(),
  studentName: z.string().min(2),
  classLabel: z.string().min(2),
  periodLabel: z.string().optional(),
  overallMastery: z.enum(["Starting", "Developing", "Proficient", "Secure"]),
  topicsPracticed: z.array(z.object({
    topicName: z.string(),
    subject: z.string(),
    scorePercentage: z.number().min(0).max(100),
    masteryLevel: z.string()
  })),
  learningMisconceptions: z.array(z.string()),
  actionableGuardianTips: z.array(z.string()),
  directPortalUrl: z.string().optional()
});

const cbtCertificateSchema = z.object({
  type: z.literal("cbt_certificate"),
  recipientEmail: z.string().email(),
  candidateName: z.string().min(2),
  assessmentTitle: z.string().min(2),
  certificateNumber: z.string().min(4),
  verificationHash: z.string().min(10),
  scorePercentage: z.number().min(0).max(100),
  totalQuestions: z.number().min(1),
  correctAnswers: z.number().min(0),
  timeSpentSeconds: z.number().min(0),
  stateName: z.string().min(2),
  issuedAt: z.string().optional(),
  verificationUrl: z.string().optional()
});

const guardianConsentSchema = z.object({
  type: z.literal("guardian_consent"),
  guardianEmail: z.string().email(),
  guardianName: z.string().min(2),
  childPseudonym: z.string().min(2),
  consentReference: z.string().min(4),
  consentScope: z.array(z.string()),
  effectiveDate: z.string().optional(),
  revocationUrl: z.string().optional()
});

const malpracticeAlertSchema = z.object({
  type: z.literal("malpractice_alert"),
  supervisorEmail: z.string().email(),
  candidateName: z.string().min(2),
  examTitle: z.string().min(2),
  incidentType: z.enum(["tab_switch", "keyboard_breach", "secondary_display", "copy_paste_attempt", "unauthorized_device"]),
  severity: z.enum(["low", "medium", "high", "disqualified"]),
  timestamp: z.string().optional(),
  infractionCount: z.number().min(1).max(3),
  proctorNotes: z.string().min(5),
  auditLogUrl: z.string().optional()
});

const teacherOnboardingSchema = z.object({
  type: z.literal("teacher_onboarding"),
  teacherEmail: z.string().email(),
  teacherName: z.string().min(2),
  trcnNumber: z.string().min(4),
  verificationStatus: z.enum(["verified", "pending_review", "clarification_needed"]),
  subjectsApproved: z.array(z.string()),
  nextStepAction: z.string().min(5),
  portalLoginUrl: z.string().optional()
});

const criticalErrorSchema = z.object({
  type: z.literal("system_critical_error"),
  recipientEmail: z.string().email().optional(),
  incidentId: z.string().min(4),
  severity: z.enum(["CRITICAL", "FATAL", "HIGH"]),
  errorMessage: z.string().min(1),
  componentOrRoute: z.string().min(1),
  stackTrace: z.string().optional(),
  userRole: z.string().optional(),
  userId: z.string().optional()
});

const unionSchema = z.discriminatedUnion("type", [
  parentScorecardSchema,
  cbtCertificateSchema,
  guardianConsentSchema,
  malpracticeAlertSchema,
  teacherOnboardingSchema,
  criticalErrorSchema
]);

import { getCurrentUser } from "@/lib/auth/session";

// Sliding window rate limiter: max 5 emails per 60s per identity
const emailRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = emailRateLimit.get(key);
  if (!entry || now > entry.resetAt) {
    emailRateLimit.set(key, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user && (isSupabaseConfigured() || process.env.NODE_ENV === "production")) {
      return NextResponse.json(
        { error: "Authentication required to dispatch enterprise emails" },
        { status: 401 }
      );
    }

    const clientIp = req.headers.get("x-forwarded-for") || user?.id || "anonymous-caller";
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: "Rate limit exceeded: maximum 5 emails per minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = unionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload for email dispatch", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    let result;

    switch (payload.type) {
      case "parent_scorecard":
        result = await dispatchParentScorecard(payload);
        break;
      case "cbt_certificate":
        result = await dispatchCbtCertificate(payload);
        break;
      case "guardian_consent":
        result = await dispatchGuardianConsent(payload);
        break;
      case "malpractice_alert":
        result = await dispatchMalpracticeAlert(payload);
        break;
      case "teacher_onboarding":
        result = await dispatchTeacherOnboardingUpdate(payload);
        break;
      case "system_critical_error":
        result = await dispatchCriticalSystemErrorAlert(payload);
        break;
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to dispatch email", mode: result.mode },
        { status: 502 }
      );
    }

    if (result.success && isSupabaseConfigured()) {
      try {
        const admin = createSupabaseAdminClient();
        if (admin) {
          const recipient = "recipientEmail" in payload ? payload.recipientEmail :
            ("parentEmail" in payload ? payload.parentEmail :
            ("guardianEmail" in payload ? payload.guardianEmail :
            ("supervisorEmail" in payload ? payload.supervisorEmail :
            ("teacherEmail" in payload ? payload.teacherEmail : "unknown"))));

          await admin.from("audit_events").insert({
            action: "ENTERPRISE_EMAIL_DISPATCHED",
            entity_type: "email",
            entity_id: result.emailId,
            metadata: {
              templateType: payload.type,
              recipient,
              mode: result.mode
            }
          });
        }
      } catch (logErr) {
        console.warn("Could not log email dispatch to Supabase:", logErr);
      }
    }

    return NextResponse.json({
      success: true,
      emailId: result.emailId,
      mode: result.mode,
      timestamp: result.timestamp
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

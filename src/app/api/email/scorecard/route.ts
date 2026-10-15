import { NextResponse } from "next/server";
import { z } from "zod";
import { sendParentDiagnosticReport } from "@/lib/email/resend";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";
import { withEnterpriseErrorHandler } from "@/lib/monitoring/enterprise-error-handler";

export const runtime = "nodejs";

const scorecardSchema = z.object({
  parentEmail: z.string().email(),
  parentName: z.string().optional(),
  studentName: z.string().min(2),
  subject: z.string().min(2),
  topic: z.string().min(2),
  scorePercentage: z.number().min(0).max(100),
  demonstratedMastery: z.enum(["Starting", "Developing", "Proficient", "Secure"]).default("Proficient"),
  weakSubtopics: z.array(z.string()).default([]),
  recommendedAction: z.string().min(5)
});

export const POST = withEnterpriseErrorHandler(async (req: Request) => {
  const user = await getCurrentUser();
  if (!user && (isSupabaseConfigured() || process.env.NODE_ENV === "production")) {
    return NextResponse.json(
      { error: "Authentication required to dispatch scorecard" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = scorecardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid scorecard payload", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const result = await sendParentDiagnosticReport(parsed.data);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Failed to deliver email" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Parent diagnostic report dispatched successfully.",
    emailId: result.emailId
  });
}, "POST /api/email/scorecard");

import { NextResponse } from "next/server";
import { z } from "zod";
import { reportCriticalSystemError } from "@/lib/monitoring/enterprise-error-handler";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

const errorAlertSchema = z.object({
  message: z.string().min(1).max(1000),
  stack: z.string().optional(),
  component: z.string().default("ClientAppBoundary"),
  digest: z.string().optional(),
  url: z.string().optional()
});

// Simple in-memory throttling map to prevent alert floods
const recentAlerts = new Map<string, number>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = errorAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid alert payload" }, { status: 400 });
    }

    const { message, stack, component, digest, url } = parsed.data;

    // Deduplicate identical error messages within 30 seconds
    const throttleKey = `${component}:${message.slice(0, 50)}`;
    const now = Date.now();
    const lastAlertTime = recentAlerts.get(throttleKey) || 0;
    if (now - lastAlertTime < 30_000) {
      return NextResponse.json({ success: true, throttled: true });
    }
    recentAlerts.set(throttleKey, now);

    // Get current user if session exists
    let userId: string | undefined;
    let userRole: string | undefined;
    try {
      const user = await getCurrentUser();
      if (user) {
        userId = user.id;
        userRole = user.role;
      }
    } catch {}

    const fakeError = new Error(message);
    if (stack) fakeError.stack = stack;

    const incidentId = await reportCriticalSystemError(fakeError, {
      componentOrRoute: component,
      severity: "CRITICAL",
      userId,
      userRole,
      extraContext: {
        digest,
        clientUrl: url
      }
    });

    return NextResponse.json({
      success: true,
      incidentId
    });
  } catch (err) {
    console.error("[ErrorAlertRoute] Failed to process client error report:", err);
    return NextResponse.json({ error: "Failed to process alert" }, { status: 500 });
  }
}

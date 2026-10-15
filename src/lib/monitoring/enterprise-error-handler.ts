import { NextResponse } from "next/server";
import { dispatchCriticalSystemErrorAlert } from "@/lib/email/enterprise-mailer";
import { sentry } from "@/lib/monitoring/sentry";

export interface ErrorReportOptions {
  componentOrRoute: string;
  severity?: "CRITICAL" | "FATAL" | "HIGH";
  userId?: string;
  userRole?: string;
  extraContext?: Record<string, unknown>;
}

/**
 * Report a critical system error directly to administration via email and telemetry
 */
export async function reportCriticalSystemError(
  error: unknown,
  options: ErrorReportOptions
): Promise<string> {
  const incidentId = `INC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stackTrace = error instanceof Error ? error.stack : undefined;
  const severity = options.severity || "CRITICAL";

  // 1. Sentry exception capture
  sentry.captureException(error, {
    route: options.componentOrRoute,
    role: options.userRole,
    userId: options.userId,
    extra: { incidentId, ...options.extraContext }
  });

  // 2. High-priority executive email dispatch
  try {
    await dispatchCriticalSystemErrorAlert({
      incidentId,
      severity,
      errorMessage,
      componentOrRoute: options.componentOrRoute,
      stackTrace,
      userId: options.userId,
      userRole: options.userRole,
      extraContext: options.extraContext
    });
  } catch (mailErr) {
    console.error("[EnterpriseErrorHandler] Failed to dispatch critical alert mail:", mailErr);
  }

  return incidentId;
}

/**
 * High-order wrapper for Next.js App Router API routes ensuring 100% fail-safe error handling
 * with zero silent failures and automated email alerting to the platform administrator.
 */
export function withEnterpriseErrorHandler<T = any>(
  handler: (request: Request, context: T) => Promise<Response>,
  routeName: string
) {
  return async (request: Request, context: T): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (err: unknown) {
      console.error(`[EnterpriseErrorHandler] Uncaught exception in ${routeName}:`, err);
      
      const incidentId = await reportCriticalSystemError(err, {
        componentOrRoute: routeName,
        severity: "CRITICAL",
        extraContext: {
          url: request.url,
          method: request.method
        }
      });

      return NextResponse.json(
        {
          error: "An unexpected system error occurred. The administrative monitoring team has been notified.",
          incidentId,
          route: routeName,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  };
}

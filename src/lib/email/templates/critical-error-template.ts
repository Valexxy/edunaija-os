import type { CriticalSystemErrorAlertPayload } from "../types";
import { scrubSensitiveData } from "@/lib/monitoring/sentry";

export function renderCriticalSystemErrorAlertEmail(
  data: CriticalSystemErrorAlertPayload
): { subject: string; html: string } {
  const isFatal = data.severity === "FATAL";
  const headerColor = isFatal ? "#7f1d1d" : "#b91c1c";
  const badgeColor = isFatal ? "#991b1b" : "#dc2626";
  
  const nowWAT = data.timestamp || new Date().toLocaleString("en-GB", { timeZone: "Africa/Lagos" }) + " WAT";
  const subject = `🚨 [SYSTEM ${data.severity}] LearnNaija Incident ${data.incidentId}: ${data.errorMessage.substring(0, 60)}`;
  
  const sanitizedStack = data.stackTrace ? scrubSensitiveData(data.stackTrace) : "No stack trace provided";
  const healthUrl = data.healthCheckUrl || "http://localhost:3000/api/health";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px; color: #f1f5f9;">
  <div style="max-width: 640px; margin: 0 auto; background: #111827; border-radius: 14px; border: 2px solid ${badgeColor}; overflow: hidden; box-shadow: 0 12px 36px rgba(185, 28, 28, 0.25);">
    
    <!-- Critical Incident Header Banner -->
    <div style="background-color: ${headerColor}; padding: 22px 28px; color: #ffffff;">
      <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #fecaca; margin-bottom: 6px;">
        EDUNAIJA OS CRITICAL TELEMETRY ALERT • LEVEL: ${data.severity}
      </div>
      <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.02em;">
        🚨 Critical System Exception
      </h1>
      <p style="margin: 6px 0 0; font-size: 13px; color: #fca5a5;">
        Incident ID: <strong>${data.incidentId}</strong> • Timestamp: ${nowWAT}
      </p>
    </div>

    <!-- Alert Body -->
    <div style="padding: 26px;">
      
      <!-- Incident Summary Box -->
      <div style="background: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 10px; padding: 18px; margin-bottom: 22px;">
        <div style="font-size: 12px; font-weight: 700; color: #f87171; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px;">
          Error Description
        </div>
        <div style="font-size: 16px; font-weight: 800; color: #ffffff; line-height: 1.4;">
          ${data.errorMessage}
        </div>
        <div style="font-size: 13px; color: #94a3b8; margin-top: 8px;">
          Component / Route: <strong style="color: #cbd5e1;">${data.componentOrRoute}</strong>
        </div>
      </div>

      <!-- Telemetry Context Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 13px;">
        <tr>
          <td style="color: #64748b; padding: 6px 0; border-bottom: 1px solid #1f2937;">Incident Severity:</td>
          <td style="font-weight: 800; color: #ef4444; text-align: right; border-bottom: 1px solid #1f2937;">${data.severity}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0; border-bottom: 1px solid #1f2937;">User Role Affected:</td>
          <td style="font-weight: 700; color: #e2e8f0; text-align: right; border-bottom: 1px solid #1f2937;">${data.userRole || "Guest / Unauthenticated"}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0; border-bottom: 1px solid #1f2937;">User Identifier:</td>
          <td style="font-family: monospace; font-size: 12px; color: #cbd5e1; text-align: right; border-bottom: 1px solid #1f2937;">${data.userId || "anonymous"}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 6px 0;">Time Zone:</td>
          <td style="color: #e2e8f0; text-align: right;">West Africa Time (UTC+1)</td>
        </tr>
      </table>

      <!-- Stack Trace Code Box -->
      <div style="margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">
          Sanitized Stack Trace (NDPA / PII Scrubbed)
        </div>
        <pre style="background: #030712; border: 1px solid #374151; border-radius: 8px; padding: 14px; font-size: 11px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #fca5a5; overflow-x: auto; white-space: pre-wrap; line-height: 1.5; margin: 0;">${sanitizedStack}</pre>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-top: 26px;">
        <a href="${healthUrl}" style="background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-size: 13px; font-weight: 800; display: inline-block;">
          Inspect System Health &amp; Logs &rarr;
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #030712; padding: 14px 26px; border-top: 1px solid #1f2937; text-align: center; font-size: 11px; color: #64748b;">
      LearnNaija OS Automated Fail-Safe Telemetry Engine &bull; Nigeria Data Protection Act (NDPA 2023) Compliant
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

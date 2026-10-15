import type { AntiMalpracticeSecurityAlertPayload } from "../types";

export function renderAntiMalpracticeAlertEmail(data: AntiMalpracticeSecurityAlertPayload): { subject: string; html: string } {
  const severityColors = {
    low: "#d97706",
    medium: "#ea580c",
    high: "#dc2626",
    disqualified: "#991b1b"
  };

  const color = severityColors[data.severity] || "#dc2626";
  const timestamp = data.timestamp || new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Lagos" }) + " WAT";

  const incidentTitles: Record<string, string> = {
    tab_switch: "Multiple Window / Tab Switches Detected",
    keyboard_breach: "Unauthorized Keyboard Shortcut (Copy/Paste/Inspect)",
    secondary_display: "Secondary Screen or Dual-Monitor Detected",
    copy_paste_attempt: "Clipboard Injection / Tamper Attempt",
    unauthorized_device: "Secondary Device Activity Detected"
  };

  const title = incidentTitles[data.incidentType] || "Automated Proctoring Violation Flagged";
  const subject = `⚠️ [SECURITY ALERT] CBT Infraction: ${data.candidateName} - ${data.examTitle} (${data.severity.toUpperCase()})`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fef2f2; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 2px solid ${color}; overflow: hidden; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);">
    
    <!-- Red Alert Header -->
    <div style="background-color: ${color}; padding: 20px 24px; color: #ffffff;">
      <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #fee2e2; margin-bottom: 4px;">
        EXAM INTEGRITY DISPATCH • PROCTOR LEVEL ${data.severity.toUpperCase()}
      </div>
      <h1 style="margin: 0; font-size: 20px; font-weight: 800;">Anti-Malpractice Security Incident</h1>
      <p style="margin: 4px 0 0; font-size: 13px; color: #fecaca;">
        ${title} • Time: ${timestamp}
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 24px;">
      <p style="font-size: 14px; color: #374151; margin: 0 0 16px;">
        Attention Proctor / Supervisor,
      </p>
      <p style="font-size: 13px; color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
        The automated LearnNaija proctoring monitor registered an integrity violation for candidate <strong>${data.candidateName}</strong> during the active sitting of <strong>${data.examTitle}</strong>.
      </p>

      <!-- Incident Telemetry -->
      <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #64748b; padding: 4px 0;">Infraction Type:</td>
            <td style="font-weight: 700; color: #991b1b; text-align: right;">${title}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 4px 0;">Current Strike Count:</td>
            <td style="font-weight: 700; color: #991b1b; text-align: right;">Strike ${data.infractionCount} of 3</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 4px 0;">Timestamp (WAT):</td>
            <td style="font-weight: 600; text-align: right;">${timestamp}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 4px 0;">Proctor Action:</td>
            <td style="font-weight: 700; color: ${color}; text-align: right;">${data.severity === "disqualified" ? "Candidate Exam Disqualified" : "Warning Issued on Screen"}</td>
          </tr>
        </table>
      </div>

      <!-- Proctor Notes -->
      <div style="background: #f8fafc; border-left: 4px solid ${color}; padding: 12px 14px; border-radius: 4px; font-size: 13px; color: #334155; margin-bottom: 24px;">
        <strong>Audit Telemetry Details:</strong><br/>
        ${data.proctorNotes}
      </div>

      <!-- Action Button -->
      <div style="text-align: center;">
        <a href="${data.auditLogUrl || "http://localhost:3000/supervisor"}" style="display: inline-block; background-color: #1e293b; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 10px 22px; border-radius: 6px;">
          Review Full Exam Audit Telemetry Log
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 20px; font-size: 11px; color: #94a3b8; text-align: center;">
      LearnNaija CBT Proctoring Core • Immutable Audit Trail Retained
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

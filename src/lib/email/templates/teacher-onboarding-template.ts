import type { TeacherOnboardingStatusPayload } from "../types";

export function renderTeacherOnboardingEmail(data: TeacherOnboardingStatusPayload): { subject: string; html: string } {
  const isVerified = data.verificationStatus === "verified";
  const statusColor = isVerified ? "#059669" : data.verificationStatus === "clarification_needed" ? "#dc2626" : "#d97706";
  const statusLabel = isVerified ? "TRCN Verified & Approved" : data.verificationStatus === "clarification_needed" ? "Clarification Required" : "Under Pedagogical Review";

  const subjectsList = data.subjectsApproved.map(s => `
    <span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin: 2px;">
      ${s}
    </span>
  `).join("");

  const subject = `🧑‍🏫 Teacher Onboarding Status: ${statusLabel} [TRCN: ${data.trcnNumber}]`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    
    <!-- Blue/Green Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #0369a1 100%); padding: 22px 24px; color: #ffffff;">
      <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #7dd3fc; margin-bottom: 4px;">
        TEACHERS REGISTRATION COUNCIL OF NIGERIA (TRCN) • VETTING PORTAL
      </div>
      <h1 style="margin: 0; font-size: 20px; font-weight: 800;">Verified Educator Onboarding Update</h1>
      <p style="margin: 4px 0 0; font-size: 13px; color: #bae6fd;">
        Candidate: ${data.teacherName} • TRCN License: ${data.trcnNumber}
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 24px;">
      <p style="font-size: 14px; color: #334155; margin: 0 0 14px;">
        Dear <strong>${data.teacherName}</strong>,
      </p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 18px;">
        Your educator application has progressed through the 5-Stage LearnNaija Educator Vetting Pipeline.
      </p>

      <!-- Status Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 12px; color: #64748b; font-weight: 600;">Status:</span>
          <span style="background: ${statusColor}; color: #ffffff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px;">
            ${statusLabel}
          </span>
        </div>
        <div style="margin-top: 10px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Approved Subject Disciplines:</div>
          <div>${subjectsList}</div>
        </div>
      </div>

      <!-- Next Steps -->
      <div style="background: #eff6ff; border-left: 4px solid #0284c7; padding: 12px 14px; border-radius: 4px; font-size: 13px; color: #0369a1; line-height: 1.5; margin-bottom: 22px;">
        <strong>Next Pedagogical Step:</strong><br/>
        ${data.nextStepAction}
      </div>

      <!-- Action Button -->
      <div style="text-align: center;">
        <a href="${data.portalLoginUrl || "http://localhost:3000/teacher"}" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 10px 24px; border-radius: 6px;">
          Access Educator Command Centre
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 20px; font-size: 11px; color: #94a3b8; text-align: center;">
      LearnNaija Sovereign Educator Registry • TRCN Compliant Standards
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

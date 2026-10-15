import type { ParentScorecardDigestPayload } from "../types";
import { escapeHtml } from "./html-utils";

export function renderParentScorecardEmail(data: ParentScorecardDigestPayload): { subject: string; html: string } {
  const masteryColors: Record<string, string> = {
    Secure: "#059669",
    Proficient: "#0d9488",
    Developing: "#d97706",
    Starting: "#dc2626"
  };

  const badgeColor = masteryColors[data.overallMastery] || "#0d9488";

  const topicsRows = data.topicsPracticed.map(t => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #1f2937;">
        <strong>${escapeHtml(t.subject)}</strong><br/>
        <span style="color: #6b7280; font-size: 12px;">${escapeHtml(t.topicName)}</span>
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 14px; font-weight: 700; color: #0f172a;">
        ${t.scorePercentage}%
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background-color: ${masteryColors[t.masteryLevel] || "#6b7280"}; color: #ffffff;">
          ${escapeHtml(t.masteryLevel)}
        </span>
      </td>
    </tr>
  `).join("");

  const misconceptionsHtml = data.learningMisconceptions.length > 0
    ? `<ul style="margin: 6px 0 12px 18px; padding: 0; color: #4b5563; font-size: 13px; line-height: 1.6;">
        ${data.learningMisconceptions.map(m => `<li style="margin-bottom: 4px;">${escapeHtml(m)}</li>`).join("")}
       </ul>`
    : `<p style="margin: 4px 0; color: #059669; font-size: 13px; font-weight: 600;">✓ Excellent work! No critical prerequisite gaps detected in this cycle.</p>`;

  const tipsHtml = data.actionableGuardianTips.map(tip => `
    <li style="margin-bottom: 6px; font-size: 13px; color: #065f46; line-height: 1.5;">${escapeHtml(tip)}</li>
  `).join("");

  const subject = `📊 ${escapeHtml(data.studentName)}'s Learning Digest: ${data.overallMastery} Mastery (${escapeHtml(data.classLabel)})`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px; color: #111827;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #064e3b 0%, #047857 100%); padding: 24px; color: #ffffff;">
      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #a7f3d0; margin-bottom: 4px;">
        LearnNaija OS • Guardian Command Hub
      </div>
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">Verified Academic Progress Digest</h1>
      <p style="margin: 6px 0 0; font-size: 13px; color: #d1fae5;">
        ${data.periodLabel || "Recent Learning Cycle"} • NDPA 2023 Protected Learner Telemetry
      </p>
    </div>

    <!-- Overview Banner -->
    <div style="padding: 24px;">
      <p style="font-size: 15px; margin: 0 0 14px; color: #374151;">
        Dear <strong>${data.parentName || "Guardian"}</strong>,
      </p>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
        Here is the verified objective performance breakdown for <strong>${data.studentName}</strong> (${data.classLabel}).
      </p>

      <!-- Overall Mastery Box -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Overall Mastery Trajectory</div>
          <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">${data.overallMastery}</div>
        </div>
        <div>
          <span style="background-color: ${badgeColor}; color: #ffffff; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700;">
            ${data.overallMastery} Trajectory
          </span>
        </div>
      </div>

      <!-- Question 1: What is my child learning? -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 15px; color: #0f172a; margin: 0 0 10px; border-left: 4px solid #059669; padding-left: 8px;">
          1. What is your child learning?
        </h3>
        <table style="width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #f9fafb; font-size: 12px; color: #6b7280; text-transform: uppercase;">
              <th style="padding: 8px 12px; text-align: left;">Curriculum Topic</th>
              <th style="padding: 8px 12px; text-align: center;">Score</th>
              <th style="padding: 8px 12px; text-align: right;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${topicsRows}
          </tbody>
        </table>
      </div>

      <!-- Question 2: Where were misconceptions detected? -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 15px; color: #0f172a; margin: 0 0 10px; border-left: 4px solid #d97706; padding-left: 8px;">
          2. Where are misconceptions detected?
        </h3>
        <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px;">
          ${misconceptionsHtml}
        </div>
      </div>

      <!-- Question 3: What can I do right now to help? -->
      <div style="margin-bottom: 28px;">
        <h3 style="font-size: 15px; color: #0f172a; margin: 0 0 10px; border-left: 4px solid #0d9488; padding-left: 8px;">
          3. What can you do right now to help at home?
        </h3>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px;">
          <ul style="margin: 0; padding-left: 18px;">
            ${tipsHtml}
          </ul>
        </div>
      </div>

      <!-- Call to Action -->
      <div style="text-align: center; margin-top: 24px;">
        <a href="${data.directPortalUrl || "http://localhost:3000/guardian"}" style="display: inline-block; background-color: #047857; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(4, 120, 87, 0.2);">
          Open Live Parent Dashboard
        </a>
      </div>
    </div>

    <!-- Statutory Safeguarding Footer -->
    <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px 24px; font-size: 11px; color: #6b7280; line-height: 1.5; text-align: center;">
      🔒 <strong>NDPA 2023 Child Safeguarding Guaranteed:</strong> This communication contains educational telemetry strictly regulated under Section 31 of the Nigeria Data Protection Act 2023. No commercial behavioral profiling or third-party ad targeting is conducted.
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

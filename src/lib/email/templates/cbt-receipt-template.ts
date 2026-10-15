import type { CbtScoreReceiptPayload } from "../types";

export function renderCbtReceiptEmail(data: CbtScoreReceiptPayload): { subject: string; html: string } {
  const isPassed = data.scorePercentage >= 50;
  const grade = data.scorePercentage >= 75 ? "Distinction (A)" : data.scorePercentage >= 60 ? "Credit (B)" : data.scorePercentage >= 50 ? "Pass (C)" : "Needs Reinforcement";
  const dateStr = data.issuedAt || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const minutes = Math.floor(data.timeSpentSeconds / 60);
  const seconds = data.timeSpentSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  const subject = `🎓 CBT Score Certificate: ${data.assessmentTitle} (${data.scorePercentage}%) [${data.certificateNumber}]`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 2px solid #047857; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
    
    <!-- Top Green Accent Header -->
    <div style="background: linear-gradient(135deg, #064e3b 0%, #047857 100%); padding: 24px; text-align: center; color: #ffffff;">
      <div style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #a7f3d0; margin-bottom: 6px;">
        FEDERAL REPUBLIC OF NIGERIA • CBT VERIFICATION REGISTRY
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">OFFICIAL CBT SCORE RECEIPT</h1>
      <div style="margin-top: 8px; font-size: 13px; color: #d1fae5;">
        ${data.assessmentTitle} • ${data.stateName} State
      </div>
    </div>

    <!-- Certificate Body -->
    <div style="padding: 28px 24px;">
      <p style="font-size: 14px; color: #475569; margin: 0 0 16px; text-align: center;">
        This certifies that the candidate named below has completed an officially calibrated CBT assessment under automated anti-malpractice proctoring.
      </p>

      <!-- Candidate Card -->
      <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 18px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Candidate Name</div>
        <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 4px 0 12px;">${data.candidateName}</div>
        
        <div style="display: flex; justify-content: center; gap: 24px; margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 13px;">
          <div>
            <span style="color: #64748b;">Score:</span>
            <strong style="color: ${isPassed ? "#059669" : "#dc2626"}; font-size: 16px;"> ${data.scorePercentage}%</strong>
          </div>
          <div>
            <span style="color: #64748b;">Correct:</span>
            <strong> ${data.correctAnswers} / ${data.totalQuestions}</strong>
          </div>
          <div>
            <span style="color: #64748b;">Duration:</span>
            <strong> ${timeFormatted}</strong>
          </div>
        </div>
      </div>

      <!-- Cryptographic Verification Box -->
      <div style="background: #f1f5f9; border-radius: 8px; padding: 14px; margin-bottom: 24px; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #64748b;">Certificate Serial:</span>
          <strong style="font-family: monospace; color: #0f172a;">${data.certificateNumber}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #64748b;">Date Issued:</span>
          <span>${dateStr}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #64748b;">Grade Standing:</span>
          <strong>${grade}</strong>
        </div>
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
          <span style="color: #64748b; display: block; margin-bottom: 2px;">HMAC-SHA256 Cryptographic Hash:</span>
          <span style="font-family: monospace; font-size: 10px; color: #334155; word-break: break-all; display: block; background: #ffffff; padding: 6px; border-radius: 4px; border: 1px solid #cbd5e1;">
            ${data.verificationHash}
          </span>
        </div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-top: 20px;">
        <a href="${data.verificationUrl || `http://localhost:3000/verify?cert=${data.certificateNumber}`}" style="display: inline-block; background-color: #047857; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 10px 24px; border-radius: 6px;">
          Verify Authenticity on Public Registry
        </a>
      </div>
    </div>

    <!-- Tamper Proof Footer -->
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; font-size: 11px; color: #94a3b8; text-align: center;">
      🔒 <strong>Tamper Protection:</strong> This document was sealed with a server-side cryptographic hash at exam completion. Any alteration invalidates this record.
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

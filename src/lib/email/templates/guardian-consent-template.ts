import type { GuardianConsentPayload } from "../types";

export function renderGuardianConsentEmail(data: GuardianConsentPayload): { subject: string; html: string } {
  const effectiveDate = data.effectiveDate || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const scopesList = data.consentScope.map(scope => `
    <li style="margin-bottom: 6px; font-size: 13px; color: #334155; line-height: 1.5;">
      <strong>✓ Authorized:</strong> ${scope}
    </li>
  `).join("");

  const subject = `🛡️ NDPA 2023 Parental Consent Receipt [Ref: ${data.consentReference}]`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.04);">
    
    <!-- Legal Green Header -->
    <div style="background-color: #065f46; padding: 22px 24px; color: #ffffff;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #a7f3d0; margin-bottom: 4px;">
        Nigeria Data Protection Act 2023 • Section 31 Compliance
      </div>
      <h1 style="margin: 0; font-size: 20px; font-weight: 800;">Verifiable Parental Consent Confirmation</h1>
      <p style="margin: 4px 0 0; font-size: 13px; color: #d1fae5;">
        Statutory Data Processing Agreement Reference: ${data.consentReference}
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 24px;">
      <p style="font-size: 14px; color: #334155; margin: 0 0 14px;">
        Dear <strong>${data.guardianName}</strong>,
      </p>
      <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 18px;">
        You have successfully granted verifiable parental consent for the digital learning activities of learner <strong>${data.childPseudonym}</strong> on the LearnNaija OS sovereign platform.
      </p>

      <!-- Scope Checklist -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="font-size: 13px; font-weight: 700; color: #065f46; margin-bottom: 8px;">
          Authorized Data Processing Boundaries:
        </div>
        <ul style="margin: 0; padding-left: 18px;">
          ${scopesList}
        </ul>
      </div>

      <!-- Statutory Declaration -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 22px; font-size: 12px; color: #475569; line-height: 1.6;">
        <strong>Your Statutory Rights Under Nigerian Law:</strong><br/>
        1. <strong>Zero Commercial Exploitation:</strong> Child data is never monetized, brokered, or used for behavioral ad tracking.<br/>
        2. <strong>Right to Revoke:</strong> You may modify or withdraw your consent at any time without punitive penalty.<br/>
        3. <strong>Right of Erasure:</strong> You may request complete deletion of diagnostic attempt logs upon written notice.
      </div>

      <!-- Revocation Link -->
      <div style="text-align: center; margin-top: 20px;">
        <a href="${data.revocationUrl || "http://localhost:3000/guardian/consent"}" style="display: inline-block; background-color: #ffffff; color: #dc2626; border: 1px solid #f87171; text-decoration: none; font-weight: 600; font-size: 12px; padding: 8px 18px; border-radius: 6px;">
          Manage or Revoke Consent Settings
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; font-size: 11px; color: #94a3b8; text-align: center;">
      Effective Date: ${effectiveDate} • Nigeria Data Protection Commission (NDPC) Monitored
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

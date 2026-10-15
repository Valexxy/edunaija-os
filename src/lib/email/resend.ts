import { getServerEnv } from "@/lib/env";

export interface ParentScorecardEmailPayload {
  parentEmail: string;
  parentName?: string;
  studentName: string;
  subject: string;
  topic: string;
  scorePercentage: number;
  demonstratedMastery: "Starting" | "Developing" | "Proficient" | "Secure";
  weakSubtopics: string[];
  recommendedAction: string;
}

export interface EmailSendResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Sends a parent diagnostic progress email answering the 3 core questions:
 * 1. What is my child learning?
 * 2. Where are they struggling?
 * 3. What can I do to help?
 */
export async function sendParentDiagnosticReport({
  parentEmail,
  parentName = "Guardian",
  studentName,
  subject,
  topic,
  scorePercentage,
  demonstratedMastery,
  weakSubtopics,
  recommendedAction
}: ParentScorecardEmailPayload): Promise<EmailSendResult> {
  const env = getServerEnv();
  const apiKey = env.RESEND_API_KEY;
  const fromEmail = env.RESEND_FROM_EMAIL || "LearnNaija <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY is not configured. Email skipped.");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const masteryBadgeColor = 
    demonstratedMastery === "Secure" ? "#10B981" :
    demonstratedMastery === "Proficient" ? "#047857" :
    demonstratedMastery === "Developing" ? "#F59E0B" : "#EF4444";

  const weakTopicsHtml = weakSubtopics.length > 0
    ? `<ul style="margin: 4px 0 12px 16px; padding: 0; color: #4B5563;">
        ${weakSubtopics.map(t => `<li style="margin-bottom: 4px;">${t}</li>`).join("")}
       </ul>`
    : `<p style="color: #059669; font-weight: 500;">No critical gaps identified in this session!</p>`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LearnNaija Scholar Progress Report</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F9FAFB; padding: 24px; color: #111827;">
  <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <!-- Header -->
    <div style="background-color: #047857; padding: 20px 24px; color: #FFFFFF;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700;">LearnNaija Family Command Centre</h1>
      <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Curriculum-Aligned Learning Evidence • NDPA 2023 Protected</p>
    </div>

    <!-- Body -->
    <div style="padding: 24px;">
      <p style="font-size: 15px; margin-top: 0;">Dear <strong>${parentName}</strong>,</p>
      <p style="font-size: 14px; color: #374151; line-height: 1.5;">
        Here is the verified learning update for <strong>${studentName}</strong> from their recent practice session.
      </p>

      <!-- Key Card -->
      <div style="background: #F3F4F6; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="font-size: 13px; color: #6B7280; padding-bottom: 6px;">Subject & Topic</td>
            <td style="font-size: 14px; font-weight: 600; text-align: right; padding-bottom: 6px;">${subject} — ${topic}</td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #6B7280; padding-bottom: 6px;">Independent Score</td>
            <td style="font-size: 14px; font-weight: 700; text-align: right; color: #047857; padding-bottom: 6px;">${scorePercentage}%</td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #6B7280;">Demonstrated Mastery</td>
            <td style="text-align: right;">
              <span style="background-color: ${masteryBadgeColor}; color: #FFFFFF; font-size: 12px; font-weight: 700; padding: 3px 8px; border-radius: 9999px;">
                ${demonstratedMastery}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Question 1: What is my child learning? -->
      <h3 style="font-size: 15px; color: #111827; margin: 20px 0 6px 0;">1. What is your child learning?</h3>
      <p style="font-size: 13px; color: #4B5563; margin: 0 0 12px 0;">
        ${studentName} practised official NERDC-aligned competencies for <strong>${subject}</strong>, focusing on <strong>${topic}</strong>.
      </p>

      <!-- Question 2: Where are they struggling? -->
      <h3 style="font-size: 15px; color: #111827; margin: 16px 0 6px 0;">2. Where were misconceptions detected?</h3>
      ${weakTopicsHtml}

      <!-- Question 3: What can I do to help? -->
      <h3 style="font-size: 15px; color: #111827; margin: 16px 0 6px 0;">3. What can you do right now to help?</h3>
      <div style="background-color: #ECFDF5; border-left: 4px solid #047857; padding: 12px; border-radius: 4px; font-size: 13px; color: #065F46; line-height: 1.5;">
        ${recommendedAction}
      </div>

      <div style="margin-top: 24px; text-align: center;">
        <a href="http://localhost:3000/guardian" style="display: inline-block; background-color: #047857; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
          Open Parent Command Centre
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #F9FAFB; padding: 16px 24px; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF; text-align: center;">
      LearnNaija • Sovereign Nigerian EdTech Infrastructure • Zero Manipulative Engagement Tricks • NDPA 2023 Child Safeguarded
    </div>
  </div>
</body>
</html>
  `;

  try {
    const adminEmail = env.ADMIN_EMAIL || env.REPLY_TO_EMAIL;
    const replyTo = adminEmail || "support@learnnaija.ng";
    const senderFrom = env.RESEND_FROM_EMAIL || "LearnNaija Admin <onboarding@resend.dev>";

    let response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "learnnaija-app/1.0"
      },
      body: JSON.stringify({
        from: senderFrom,
        to: [parentEmail],
        reply_to: replyTo,
        subject: `📊 ${studentName}'s Progress: ${subject} (${scorePercentage}% - ${demonstratedMastery})`,
        html
      })
    });

    if (!response.ok && response.status === 403 && senderFrom !== "LearnNaija Admin <onboarding@resend.dev>") {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "learnnaija-app/1.0"
        },
        body: JSON.stringify({
          from: "LearnNaija Admin <onboarding@resend.dev>",
          to: [parentEmail],
          reply_to: replyTo,
          subject: `📊 ${studentName}'s Progress: ${subject} (${scorePercentage}% - ${demonstratedMastery})`,
          html
        })
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Resend] Send failed:", response.status, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return {
      success: true,
      emailId: data.id
    };
  } catch (error) {
    console.error("[Resend] Network error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to dispatch email"
    };
  }
}

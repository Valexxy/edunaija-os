// Enterprise Mailer Engine for LearnNaija OS
// Powered by Resend API with resilient offline fallback simulation and NDPA 2023 compliance

import { getServerEnv } from "@/lib/env";
import type {
  EmailSendResult,
  ParentScorecardDigestPayload,
  CbtScoreReceiptPayload,
  GuardianConsentPayload,
  AntiMalpracticeSecurityAlertPayload,
  TeacherOnboardingStatusPayload,
  CriticalSystemErrorAlertPayload
} from "./types";
import { renderParentScorecardEmail } from "./templates/parent-scorecard-template";
import { renderCbtReceiptEmail } from "./templates/cbt-receipt-template";
import { renderGuardianConsentEmail } from "./templates/guardian-consent-template";
import { renderAntiMalpracticeAlertEmail } from "./templates/anti-malpractice-template";
import { renderTeacherOnboardingEmail } from "./templates/teacher-onboarding-template";
import { renderCriticalSystemErrorAlertEmail } from "./templates/critical-error-template";

export interface LoggedEmail {
  to: string;
  subject: string;
  category: string;
  mode: "live_resend" | "simulated_offline";
  timestamp: string;
  emailId?: string;
  snippet: string;
}

// In-memory audit log of dispatched emails for telemetry and offline inspection
const dispatchedLog: LoggedEmail[] = [];

export function getDispatchedEmailLog(): readonly LoggedEmail[] {
  return dispatchedLog;
}

export function clearDispatchedEmailLog(): void {
  dispatchedLog.length = 0;
}

interface RawSendOptions {
  to: string;
  subject: string;
  html: string;
  category: string;
  idempotencyKey?: string;
}

/**
 * Enterprise core dispatch: Uses live Resend API when configured,
 * or gracefully logs to offline telemetry queue when offline/testing.
 */
async function sendRawEmail({ to, subject, html, category, idempotencyKey }: RawSendOptions): Promise<EmailSendResult> {
  const env = getServerEnv();
  const apiKey = env.RESEND_API_KEY;
  const fromEmail = env.RESEND_FROM_EMAIL || "LearnNaija <onboarding@resend.dev>";
  const now = new Date().toISOString();

  // If no API key or in test mode without mock server, run simulated offline dispatch
  if (!apiKey || apiKey === "mock_resend_key_test") {
    const emailId = `sim-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const logEntry: LoggedEmail = {
      to,
      subject,
      category,
      mode: "simulated_offline",
      timestamp: now,
      emailId,
      snippet: html.substring(0, 150)
    };
    dispatchedLog.push(logEntry);

    return {
      success: true,
      emailId,
      mode: "simulated_offline",
      timestamp: now
    };
  }

  // Live dispatch via Resend REST API
  try {
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "LearnNaija-Enterprise-Mailer/2.0"
    };

    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }

    const adminEmail = env.ADMIN_EMAIL || env.REPLY_TO_EMAIL;
    const replyTo = adminEmail || "support@learnnaija.ng";
    const senderFrom = env.RESEND_FROM_EMAIL || (adminEmail ? `LearnNaija Admin <${adminEmail}>` : "LearnNaija <onboarding@resend.dev>");

    let res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: senderFrom,
        to: [to],
        reply_to: replyTo,
        subject,
        html
      })
    });

    // If Resend rejects unverified sender domain, fallback to onboarding@resend.dev with reply_to preserved
    if (!res.ok && res.status === 403 && senderFrom !== "LearnNaija <onboarding@resend.dev>") {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers,
        body: JSON.stringify({
          from: "LearnNaija Admin <onboarding@resend.dev>",
          to: [to],
          reply_to: replyTo,
          subject,
          html
        })
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[EnterpriseMailer] Resend responded with status ${res.status}:`, errText);
      return {
        success: false,
        error: `HTTP ${res.status}: ${errText}`,
        mode: "live_resend",
        timestamp: now
      };
    }

    const data = await res.json();
    const emailId = data.id || `live-${Date.now()}`;

    dispatchedLog.push({
      to,
      subject,
      category,
      mode: "live_resend",
      timestamp: now,
      emailId,
      snippet: html.substring(0, 150)
    });

    return {
      success: true,
      emailId,
      mode: "live_resend",
      timestamp: now
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error during email dispatch";
    console.error("[EnterpriseMailer] Dispatch error:", msg);
    return {
      success: false,
      error: msg,
      mode: "live_resend",
      timestamp: now
    };
  }
}

/**
 * 1. Dispatches Parent Progress Scorecard Digest
 */
export async function dispatchParentScorecard(payload: ParentScorecardDigestPayload): Promise<EmailSendResult> {
  const { subject, html } = renderParentScorecardEmail(payload);
  return sendRawEmail({
    to: payload.parentEmail,
    subject,
    html,
    category: "parent_scorecard"
  });
}

/**
 * 2. Dispatches Cryptographic CBT Exam Score Receipt & Certificate
 */
export async function dispatchCbtCertificate(payload: CbtScoreReceiptPayload): Promise<EmailSendResult> {
  const { subject, html } = renderCbtReceiptEmail(payload);
  return sendRawEmail({
    to: payload.recipientEmail,
    subject,
    html,
    category: "cbt_certificate",
    idempotencyKey: `cert-${payload.certificateNumber}`
  });
}

/**
 * 3. Dispatches NDPA 2023 Section 31 Guardian Consent Receipt
 */
export async function dispatchGuardianConsent(payload: GuardianConsentPayload): Promise<EmailSendResult> {
  const { subject, html } = renderGuardianConsentEmail(payload);
  return sendRawEmail({
    to: payload.guardianEmail,
    subject,
    html,
    category: "guardian_consent",
    idempotencyKey: `consent-${payload.consentReference}`
  });
}

/**
 * 4. Dispatches Real-Time Anti-Malpractice Security Incident Alert
 */
export async function dispatchMalpracticeAlert(payload: AntiMalpracticeSecurityAlertPayload): Promise<EmailSendResult> {
  const { subject, html } = renderAntiMalpracticeAlertEmail(payload);
  return sendRawEmail({
    to: payload.supervisorEmail,
    subject,
    html,
    category: "malpractice_alert"
  });
}

/**
 * 5. Dispatches TRCN Teacher Onboarding & Vetting Status Update
 */
export async function dispatchTeacherOnboardingUpdate(payload: TeacherOnboardingStatusPayload): Promise<EmailSendResult> {
  const { subject, html } = renderTeacherOnboardingEmail(payload);
  return sendRawEmail({
    to: payload.teacherEmail,
    subject,
    html,
    category: "teacher_onboarding"
  });
}

/**
 * 6. Dispatches Critical System Error Incident Alert to Platform Administrator
 */
export async function dispatchCriticalSystemErrorAlert(payload: CriticalSystemErrorAlertPayload): Promise<EmailSendResult> {
  const env = getServerEnv();
  const alertTargetEmail = payload.recipientEmail || env.ADMIN_ALERT_EMAIL || "alerts@learnnaija.ng";
  const { subject, html } = renderCriticalSystemErrorAlertEmail(payload);

  return sendRawEmail({
    to: alertTargetEmail,
    subject,
    html,
    category: "system_critical_error",
    idempotencyKey: `err-alert-${payload.incidentId}`
  });
}


import crypto from "crypto";

/**
 * Nigeria Data Protection Act (NDPA 2023) Section 31 Compliance Engine
 * Handles Verifiable Parental Consent (VPC), Child Safeguarding & Privacy Rights
 */

export interface ConsentScopes {
  allow_ai_tutor: boolean;
  allow_live_classes: boolean;
  allow_leaderboard_nickname: boolean;
  allow_academic_analytics: boolean;
}

export interface VerifiableParentConsent {
  id: string;
  parent_identifier: string; // Email or Nigerian phone number
  learner_id: string;
  relationship_label: "Mother" | "Father" | "Guardian" | "Sponsor";
  scopes: ConsentScopes;
  ip_hash: string;
  user_agent_summary: string;
  consented_at: string;
  verified: boolean;
  verification_method: "email_otp" | "parent_portal" | "sms_otp";
  receipt_signature: string;
}

// In-memory store for active consent records
const consentStore = new Map<string, VerifiableParentConsent>([
  [
    "demo-student-user-001",
    {
      id: "vpc-consent-001",
      parent_identifier: "parent.demo@learnnaija.ng",
      learner_id: "demo-student-user-001",
      relationship_label: "Mother",
      scopes: {
        allow_ai_tutor: true,
        allow_live_classes: true,
        allow_leaderboard_nickname: false, // Pseudonymized for child privacy
        allow_academic_analytics: true
      },
      ip_hash: crypto.createHash("sha256").update("102.89.23.1").digest("hex").slice(0, 16),
      user_agent_summary: "Mozilla/5.0 Mobile",
      consented_at: new Date().toISOString(),
      verified: true,
      verification_method: "parent_portal",
      receipt_signature: "sig_ndpa_vpc_mock_001"
    }
  ]
]);

/**
 * Computes a tamper-evident cryptographic signature for a consent event
 */
export function generateConsentReceiptSignature(
  learnerId: string,
  parentIdentifier: string,
  timestamp: string
): string {
  const secret = process.env.CONSENT_SIGNING_SECRET || "edunaija_ndpa_2023_secure_salt";
  return crypto
    .createHmac("sha256", secret)
    .update(`${learnerId}:${parentIdentifier}:${timestamp}`)
    .digest("hex");
}

/**
 * Records affirmative digital consent under NDPA 2023 Section 31
 */
export function recordParentConsent(params: {
  learnerId: string;
  parentIdentifier: string;
  relationshipLabel: "Mother" | "Father" | "Guardian" | "Sponsor";
  scopes: Partial<ConsentScopes>;
  clientIp?: string;
  userAgent?: string;
  verificationMethod?: "email_otp" | "parent_portal" | "sms_otp";
  verified?: boolean;
}): VerifiableParentConsent {
  const now = new Date().toISOString();
  const id = `vpc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const ipHash = crypto
    .createHash("sha256")
    .update(params.clientIp || "127.0.0.1")
    .digest("hex")
    .slice(0, 16);

  const signature = generateConsentReceiptSignature(params.learnerId, params.parentIdentifier, now);

  const fullScopes: ConsentScopes = {
    allow_ai_tutor: params.scopes.allow_ai_tutor ?? true,
    allow_live_classes: params.scopes.allow_live_classes ?? true,
    allow_leaderboard_nickname: params.scopes.allow_leaderboard_nickname ?? false,
    allow_academic_analytics: params.scopes.allow_academic_analytics ?? true
  };

  const isVerified = params.verified !== undefined ? params.verified : true;

  const record: VerifiableParentConsent = {
    id,
    parent_identifier: params.parentIdentifier,
    learner_id: params.learnerId,
    relationship_label: params.relationshipLabel,
    scopes: fullScopes,
    ip_hash: ipHash,
    user_agent_summary: (params.userAgent || "Unknown Device").slice(0, 60),
    consented_at: now,
    verified: isVerified,
    verification_method: params.verificationMethod || "parent_portal",
    receipt_signature: signature
  };

  consentStore.set(params.learnerId, record);
  return record;
}

/**
 * Retrieves the verified consent record for a learner
 */
export function getLearnerConsent(learnerId: string): VerifiableParentConsent | null {
  return consentStore.get(learnerId) || null;
}

/**
 * Checks whether parental consent is strictly mandated for a specific education tier
 * (Primary and Junior Secondary are legally under-14 minors)
 */
export function isParentalConsentMandated(educationLevel?: string): boolean {
  if (!educationLevel) return true;
  return educationLevel === "primary" || educationLevel === "junior_secondary";
}

/**
 * Generates an anonymous child pseudonym for public leaderboards if under 14
 * or if parent requested anonymity
 */
export function getSafeLeaderboardName(displayName: string, learnerId: string, level?: string): string {
  const consent = getLearnerConsent(learnerId);
  const isMinor = isParentalConsentMandated(level);

  // If student is minor and parent has not explicitly allowed public real name
  if (isMinor && (!consent || !consent.scopes.allow_leaderboard_nickname)) {
    const hash = crypto.createHash("md5").update(learnerId).digest("hex").slice(0, 4).toUpperCase();
    return `Scholar #${hash}`;
  }

  return displayName;
}

import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Right to Erasure / "Right to be Forgotten" (NDPA 2023 Section 34)
 * Cascades across persistent PostgreSQL tables and cleans memory stores.
 */
export async function eraseLearnerData(learnerId: string): Promise<{
  success: boolean;
  erasedAt: string;
  storesScrubbed: string[];
  failures: string[];
}> {
  consentStore.delete(learnerId);
  const storesScrubbed: string[] = ["in_memory_consent_cache"];
  const failures: string[] = [];

  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdminClient();
      if (admin) {
        // 1. Scrub persistent parental consents
        const { error: consentErr } = await admin.from("parental_consents").delete().eq("learner_user_id", learnerId);
        if (consentErr) failures.push(`parental_consents: ${consentErr.message}`);
        else storesScrubbed.push("parental_consents");

        // 2. Scrub academic mastery tracking
        const { error: masteryErr } = await admin.from("learner_mastery").delete().eq("learner_user_id", learnerId);
        if (masteryErr) failures.push(`learner_mastery: ${masteryErr.message}`);
        else storesScrubbed.push("learner_mastery");

        // 3. Scrub learner profile metadata
        const { error: profileErr } = await admin.from("learner_profiles").delete().eq("user_id", learnerId);
        if (profileErr) failures.push(`learner_profiles: ${profileErr.message}`);
        else storesScrubbed.push("learner_profiles");

        // 4. Anonymize user profile display name
        const { error: anonErr } = await admin.from("profiles").update({
          display_name: "Redacted Scholar (NDPA Erased)",
          avatar_path: null
        }).eq("id", learnerId);
        if (anonErr) failures.push(`profiles_anonymized: ${anonErr.message}`);
        else storesScrubbed.push("profiles_anonymized");

        // 5. Audit compliance event
        await admin.from("audit_events").insert({
          action: "NDPA_SECTION_34_DATA_ERASURE_FULFILLED",
          entity_type: "learner_data",
          entity_id: learnerId,
          metadata: { storesScrubbed, failures }
        });
      }
    } catch (err: any) {
      failures.push(`supabase_connectivity: ${err?.message || err}`);
      console.warn("Could not complete full database erasure in Supabase:", err);
    }
  }

  const isSuccess = failures.length === 0;

  return {
    success: isSuccess,
    erasedAt: new Date().toISOString(),
    storesScrubbed,
    failures
  };
}

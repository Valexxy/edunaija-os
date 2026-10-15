import crypto from "crypto";
import { getServerEnv } from "@/lib/env";

export interface PlanEntitlements {
  tier: "free" | "family_premium" | "school_institution";
  cbtAccess: boolean;
  liveKitVideoLessons: boolean;
  unlimitedGeminiTutor: boolean;
  parentWeeklyEmailReports: boolean;
  offlineDownloads: boolean;
}

export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Sovereign Free Learning",
    priceNaira: 0,
    interval: "forever",
    entitlements: {
      tier: "free" as const,
      cbtAccess: true,
      liveKitVideoLessons: false,
      unlimitedGeminiTutor: false, // Local deterministic tutor + quota
      parentWeeklyEmailReports: true,
      offlineDownloads: true
    }
  },
  family_premium: {
    name: "Family Learning Premium",
    priceNaira: 4500,
    interval: "monthly",
    entitlements: {
      tier: "family_premium" as const,
      cbtAccess: true,
      liveKitVideoLessons: true,
      unlimitedGeminiTutor: true,
      parentWeeklyEmailReports: true,
      offlineDownloads: true
    }
  }
};

/**
 * Validates HMAC SHA512 signature from Paystack webhooks
 */
export function verifyPaystackSignature(payloadString: string, signatureHeader: string | null): boolean {
  const env = getServerEnv();
  const secret = env.PAYSTACK_SECRET_KEY;
  if (!secret || !signatureHeader) return false;

  const hash = crypto.createHmac("sha512", secret).update(payloadString).digest("hex");
  return hash === signatureHeader;
}

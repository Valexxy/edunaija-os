import { describe, it, expect } from "vitest";
import { SUBSCRIPTION_PLANS, verifyPaystackSignature } from "@/lib/billing/paystack";

describe("Paystack Billing & Subscription Entitlements", () => {
  it("should define Free and Family Premium tiers accurately", () => {
    expect(SUBSCRIPTION_PLANS.free.priceNaira).toBe(0);
    expect(SUBSCRIPTION_PLANS.free.entitlements.cbtAccess).toBe(true);
    expect(SUBSCRIPTION_PLANS.free.entitlements.liveKitVideoLessons).toBe(false);

    expect(SUBSCRIPTION_PLANS.family_premium.priceNaira).toBe(4500);
    expect(SUBSCRIPTION_PLANS.family_premium.entitlements.liveKitVideoLessons).toBe(true);
    expect(SUBSCRIPTION_PLANS.family_premium.entitlements.unlimitedGeminiTutor).toBe(true);
  });

  it("should reject invalid webhook signatures safely", () => {
    const isValid = verifyPaystackSignature("{}", "invalid_signature_hex");
    expect(isValid).toBe(false);
  });
});

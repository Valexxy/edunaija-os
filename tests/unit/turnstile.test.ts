import { describe, it, expect } from "vitest";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

describe("Cloudflare Turnstile Verification", () => {
  it("should accept development test pass tokens", async () => {
    const res = await verifyTurnstileToken("1x00000000000000000000AA");
    expect(res.success).toBe(true);
    expect(res.mock).toBe(true);
  });

  it("should accept dummy token fallback", async () => {
    const res = await verifyTurnstileToken("XXXX.DUMMY.TOKEN.XXXX");
    expect(res.success).toBe(true);
  });
});

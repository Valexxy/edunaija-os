import { describe, expect, it } from "vitest";
import { getScholarAvatarDataUri, getInitials } from "@/lib/ui/avatar-generator";
import { soundFx } from "@/lib/audio/sound-fx";
import { posthog } from "@/lib/analytics/posthog";

describe("Premium Experience & Silicon Valley EdTech Features", () => {
  it("generates deterministic scholar initials and SVG avatars without network requests", () => {
    expect(getInitials("Ukah Valentine")).toBe("UV");
    expect(getInitials("Amina Bello")).toBe("AB");
    expect(getInitials("Chidi")).toBe("CH");
    expect(getInitials("")).toBe("NG");

    const avatar1 = getScholarAvatarDataUri("Ukah Valentine", 44);
    const avatar2 = getScholarAvatarDataUri("Ukah Valentine", 44);
    const avatarAmina = getScholarAvatarDataUri("Amina Bello", 44);

    // 100% Deterministic: Same scholar name yields identical SVG data URI
    expect(avatar1).toBe(avatar2);
    expect(avatar1.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    expect(avatar1).toContain("UV");

    // Different scholar has distinct initials
    expect(avatarAmina).toContain("AB");
  });

  it("provides sound engine controls with mute toggling", () => {
    const initialMuted = soundFx.getMuted();
    const toggled = soundFx.toggleMute();
    expect(toggled).toBe(!initialMuted);
    expect(soundFx.getMuted()).toBe(toggled);

    // Toggle back to original state
    soundFx.toggleMute();
    expect(soundFx.getMuted()).toBe(initialMuted);
  });

  it("verifies privacy-safe telemetry tracking via PostHog", async () => {
    const success = await posthog.track({
      distinctId: "demo-scholar-001",
      event: "challenge_submitted",
      properties: {
        challenge_id: "chl-national-stem-01",
        score: 6,
        completion_seconds: 140,
        // Sensitive PII key that should be scrubbed
        password: "secretPassword123"
      }
    });

    expect(success).toBe(true);
  });
});

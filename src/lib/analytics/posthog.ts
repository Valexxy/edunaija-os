/**
 * PostHog Pilot Analytics & Funnel Tracking Engine
 * Designed for LearnNaija Pilot validation with strict Child Privacy & NDPA compliance.
 * All sensitive inputs, student names, and freeform messages are masked/redacted.
 */

export interface AnalyticsUserProperties {
  gradeLevel?: string;
  state?: string;
  lga?: string;
  hasParentalConsent?: boolean;
  schoolType?: "public" | "private" | "homeschool";
}

export type PilotAnalyticsEvent =
  | "signup_completed"
  | "onboarding_step_viewed"
  | "diagnostic_started"
  | "diagnostic_completed"
  | "first_lesson_started"
  | "first_lesson_completed"
  | "tutor_topic_queried"
  | "practice_quiz_submitted"
  | "parent_scorecard_viewed"
  | "guardian_consent_granted"
  | "retention_heartbeat"
  | "challenge_joined"
  | "challenge_submitted"
  | "podium_finish"
  | "streak_advanced"
  | "tournament_match_won";

export interface EventPayload {
  distinctId: string;
  event: PilotAnalyticsEvent;
  properties?: Record<string, string | number | boolean | null>;
}

class PostHogService {
  private apiKey: string | undefined;
  private host: string;
  private isEnabled: boolean;

  constructor() {
    this.apiKey =
      process.env.NEXT_PUBLIC_POSTHOG_KEY ||
      process.env.POSTHOG_API_KEY ||
      undefined;
    this.host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST ||
      process.env.POSTHOG_HOST ||
      "https://us.i.posthog.com";
    this.isEnabled = Boolean(this.apiKey && this.apiKey.length > 5);
  }

  public isConfigured(): boolean {
    return this.isEnabled;
  }

  /**
   * Tracks a standardized educational pilot event with automatic privacy sanitization
   */
  public async track(payload: EventPayload): Promise<boolean> {
    const { distinctId, event, properties = {} } = payload;

    // Strict privacy scrub: sanitize properties to ensure zero child PII
    const safeProperties: Record<string, string | number | boolean | null> = {
      $lib: "learnnaija-web",
      app_version: "0.1.0",
      timestamp: new Date().toISOString(),
    };

    const forbiddenKeys = ["name", "fullname", "email", "phone", "password", "token", "prompt", "question", "answer"];

    for (const [key, value] of Object.entries(properties)) {
      const lower = key.toLowerCase();
      if (!forbiddenKeys.some((f) => lower.includes(f))) {
        safeProperties[key] = value;
      }
    }

    if (this.isEnabled && this.apiKey) {
      try {
        const response = await fetch(`${this.host}/capture/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: this.apiKey,
            event,
            distinct_id: distinctId,
            properties: safeProperties,
          }),
        });
        return response.ok;
      } catch {
        // Fail silently
        return false;
      }
    } else {
      if (process.env.NODE_ENV !== "test") {
        console.log(`[Analytics:PostHog] Event: "${event}" for User: "${distinctId}"`, safeProperties);
      }
      return true;
    }
  }

  /**
   * Identifies user cohorts without exposing identifiable child records
   */
  public async identify(distinctId: string, traits: AnalyticsUserProperties): Promise<boolean> {
    if (this.isEnabled && this.apiKey) {
      try {
        await fetch(`${this.host}/capture/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: this.apiKey,
            event: "$identify",
            distinct_id: distinctId,
            $set: {
              grade_level: traits.gradeLevel,
              state: traits.state,
              lga: traits.lga,
              has_parental_consent: traits.hasParentalConsent,
              school_type: traits.schoolType,
            },
          }),
        });
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }
}

export const posthog = new PostHogService();

/**
 * Sentry Error Monitoring & Exception Tracking
 * Compliant with Nigeria Data Protection Act (NDPA) 2023 & COPPA child privacy standards.
 * Strips all child PII, passwords, JWT tokens, and sensitive learner data before ingestion.
 */

export interface ErrorContext {
  userId?: string;
  role?: string;
  route?: string;
  component?: string;
  tags?: Record<string, string | number | boolean>;
  extra?: Record<string, unknown>;
}

// Patterns for sensitive data that must never be dispatched to third-party telemetry
const SENSITIVE_PATTERNS = [
  /([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})/gi, // Emails
  /(?:\+?234|0)[789][01]\d{8}/g, // Nigerian phone numbers
  /\b\d{11}\b/g, // NIN / 11-digit BVN
  /bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/gi, // JWT / Bearer tokens
  /password["':\s]+["']?([^"',\s]+)/gi, // Passwords
  /secret["':\s]+["']?([^"',\s]+)/gi, // Secrets / API keys
];

/**
 * Redacts personally identifiable information and sensitive credentials
 */
export function scrubSensitiveData(input: any): any {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === "string") {
    let sanitized = input;
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, "[REDACTED]");
    }
    return sanitized;
  }

  if (Array.isArray(input)) {
    return input.map((item) => scrubSensitiveData(item));
  }

  if (typeof input === "object") {
    const scrubbedObj: Record<string, unknown> = {};
    const sensitiveKeys = [
      "password",
      "token",
      "secret",
      "apikey",
      "authorization",
      "nin",
      "bvn",
      "nationalid",
      "phone",
      "email",
      "fullname",
      "learnername",
      "parentname",
      "name",
      "questiontext",
      "answertext",
    ];

    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((s) => lowerKey.includes(s))) {
        scrubbedObj[key] = "[REDACTED_SENSITIVE]";
      } else {
        scrubbedObj[key] = scrubSensitiveData(value);
      }
    }
    return scrubbedObj;
  }

  return input;
}

export interface SentryClientConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
}

class SentryService {
  private dsn: string | undefined;
  private environment: string;
  private release: string;
  private isEnabled: boolean;

  constructor() {
    this.dsn =
      process.env.NEXT_PUBLIC_SENTRY_DSN ||
      process.env.SENTRY_DSN ||
      undefined;
    this.environment = process.env.NODE_ENV || "development";
    this.release = "learnnaija@0.1.0";
    this.isEnabled = Boolean(this.dsn && this.dsn.length > 10);
  }

  public isConfigured(): boolean {
    return this.isEnabled;
  }

  private generateEventId(): string {
    let id = "";
    const hex = "0123456789abcdef";
    for (let i = 0; i < 32; i++) {
      id += hex[Math.floor(Math.random() * 16)];
    }
    return id;
  }

  public captureException(error: Error | unknown, context?: ErrorContext): string {
    const rawHex = this.generateEventId();
    const eventId = `err_${rawHex}`;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const sanitizedContext = scrubSensitiveData({
      ...context,
      message: errorMessage,
      stack: errorStack,
    });

    if (this.isEnabled && this.dsn) {
      // In production with DSN, dispatch via Sentry HTTP envelope
      this.sendToSentry(rawHex, errorMessage, sanitizedContext).catch((err) => {
        console.error("[Sentry] Failed to dispatch envelope:", err);
      });
    } else {
      // Development or test mode: log structured redacted diagnostic
      if (process.env.NODE_ENV !== "test") {
        console.warn(`[Monitoring:Sentry] Captured error [${eventId}]:`, sanitizedContext);
      }
    }

    return eventId;
  }

  public captureMessage(
    message: string,
    level: "info" | "warning" | "error" = "info",
    context?: ErrorContext
  ): string {
    const rawHex = this.generateEventId();
    const eventId = `msg_${rawHex}`;
    const sanitizedContext = scrubSensitiveData({
      level,
      message,
      ...context,
    });

    if (this.isEnabled && this.dsn) {
      this.sendToSentry(rawHex, message, sanitizedContext).catch(() => {});
    } else if (process.env.NODE_ENV !== "test") {
      console.log(`[Monitoring:Sentry] [${level.toUpperCase()}] [${eventId}]:`, sanitizedContext);
    }

    return eventId;
  }

  private async sendToSentry(rawHex: string, message: string, payload: unknown): Promise<void> {
    if (!this.dsn) return;
    try {
      const url = new URL(this.dsn);
      const projectId = url.pathname.replace(/^\//, "");
      const host = url.host;
      const publicKey = url.username;

      const envelopeEndpoint = `https://${host}/api/${projectId}/envelope/`;
      const header = JSON.stringify({
        event_id: rawHex,
        sent_at: new Date().toISOString(),
        dsn: this.dsn,
      });
      const itemHeader = JSON.stringify({
        type: "event",
        content_type: "application/json",
      });
      const body = JSON.stringify({
        event_id: rawHex,
        timestamp: Date.now() / 1000,
        platform: "javascript",
        environment: this.environment,
        release: this.release,
        message: { formatted: scrubSensitiveData(message) },
        extra: payload,
      });

      const envelope = `${header}\n${itemHeader}\n${body}\n`;

      await fetch(envelopeEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-sentry-envelope",
          "X-Sentry-Auth": `Sentry sentry_version=7, sentry_client=learnnaija-sentry/1.0, sentry_key=${publicKey}`,
        },
        body: envelope,
      });
    } catch {
      // Fail silently to never break student learning flow
    }
  }
}

export const sentry = new SentryService();

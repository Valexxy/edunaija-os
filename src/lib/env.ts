import { z } from "zod";

const serverSchema = z.object({
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("openai/gpt-oss-120b"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  LIVEKIT_URL: z.string().optional(),
  LIVEKIT_API_KEY: z.string().optional(),
  LIVEKIT_API_SECRET: z.string().optional(),
  CACHE_PROVIDER: z.string().default("cloudflare_edge"),
  VERIFICATION_PROVIDER: z.string().default("local_ndpa"),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  ADMIN_ALERT_EMAIL: z.string().email().optional().default("alerts@learnnaija.ng"),
  PRIMARY_FORWARD_EMAIL: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  REPLY_TO_EMAIL: z.string().optional()
});

export function getServerEnv() {
  const rawGemini = process.env.GEMINI_API_KEY?.trim();
  // Filter out any invalid or expired Windows profile artifacts
  const geminiKey = rawGemini && !rawGemini.startsWith("AQ.Ab8RN6Ij") ? rawGemini : undefined;
  const groqKey = process.env.GROQ_API_KEY?.trim() || undefined;

  return serverSchema.parse({
    GEMINI_API_KEY: geminiKey,
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    GROQ_API_KEY: groqKey,
    GROQ_MODEL: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    LIVEKIT_URL: process.env.LIVEKIT_URL,
    LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY,
    LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET,
    CACHE_PROVIDER: process.env.CACHE_PROVIDER || "cloudflare_edge",
    VERIFICATION_PROVIDER: process.env.VERIFICATION_PROVIDER || "local_ndpa",
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    ADMIN_ALERT_EMAIL: process.env.ADMIN_ALERT_EMAIL || "alerts@learnnaija.ng",
    PRIMARY_FORWARD_EMAIL: process.env.PRIMARY_FORWARD_EMAIL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || process.env.PRIMARY_FORWARD_EMAIL,
    REPLY_TO_EMAIL: process.env.REPLY_TO_EMAIL || process.env.ADMIN_EMAIL || process.env.PRIMARY_FORWARD_EMAIL
  });
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("YOUR_PROJECT") && !url.includes("placeholder"));
}

export function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  return { url, key };
}

export function getTurnstileEnv() {
  return {
    siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
    secretKey: process.env.TURNSTILE_SECRET_KEY || "",
    isConfigured: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY)
  };
}

export function getLiveKitEnv() {
  return {
    url: process.env.LIVEKIT_URL || "",
    apiKey: process.env.LIVEKIT_API_KEY || "",
    apiSecret: process.env.LIVEKIT_API_SECRET || "",
    isConfigured: Boolean(process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET)
  };
}

export function isUpstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export function getUpstashEnv() {
  return {
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    isConfigured: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  };
}

export function isSentryConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NEXT_PUBLIC_SENTRY_DSN.length > 10);
}

export function isPostHogConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_KEY.length > 5);
}


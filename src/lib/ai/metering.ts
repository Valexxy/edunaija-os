import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";

export interface AiUsageEventInput {
  userId?: string;
  provider: string;
  model: string;
  feature: string;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
  outcome: "success" | "error" | "blocked";
}

// In-memory fallback rate limiter & quota counter (per user/IP) when testing or offline
const userDailyUsageMap = new Map<string, { count: number; dateStr: string }>();
const userRateLimitMap = new Map<string, { timestamps: number[] }>();

const DAILY_LIMIT = 50; // 50 questions per day for free tier
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 10;

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = userRateLimitMap.get(identifier) || { timestamps: [] };
  // Filter timestamps within window
  const validTimestamps = entry.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldest = validTimestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  validTimestamps.push(now);
  userRateLimitMap.set(identifier, { timestamps: validTimestamps });
  return { allowed: true };
}

export async function checkDailyQuota(userId: string): Promise<{ allowed: boolean; remaining: number; totalAllowed: number }> {
  const todayStr = new Date().toISOString().split("T")[0];

  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdminClient();
      const supabase = admin || (await createSupabaseServerClient());
      const startOfDay = `${todayStr}T00:00:00.000Z`;
      const { count, error } = await supabase
        .from("ai_usage_events")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startOfDay)
        .eq("outcome", "success");

      if (!error && count !== null) {
        const remaining = Math.max(0, DAILY_LIMIT - count);
        return {
          allowed: count < DAILY_LIMIT,
          remaining,
          totalAllowed: DAILY_LIMIT
        };
      }
    } catch {
      // Fallback to local in-memory counter if Supabase query fails
    }
  }

  // Fallback in-memory tracking
  const entry = userDailyUsageMap.get(userId);
  if (!entry || entry.dateStr !== todayStr) {
    userDailyUsageMap.set(userId, { count: 0, dateStr: todayStr });
    return { allowed: true, remaining: DAILY_LIMIT, totalAllowed: DAILY_LIMIT };
  }

  const remaining = Math.max(0, DAILY_LIMIT - entry.count);
  return {
    allowed: entry.count < DAILY_LIMIT,
    remaining,
    totalAllowed: DAILY_LIMIT
  };
}

export function incrementLocalDailyUsage(userId: string): void {
  const todayStr = new Date().toISOString().split("T")[0];
  const entry = userDailyUsageMap.get(userId);
  if (!entry || entry.dateStr !== todayStr) {
    userDailyUsageMap.set(userId, { count: 1, dateStr: todayStr });
  } else {
    entry.count += 1;
  }
}

export function estimateTokenCost(inputTokens: number, outputTokens: number, _model?: string): number {
  // Approximate pricing: $0.10 per 1M input tokens, $0.40 per 1M output tokens for Flash
  const inputCost = (inputTokens / 1_000_000) * 0.10;
  const outputCost = (outputTokens / 1_000_000) * 0.40;
  return Number((inputCost + outputCost).toFixed(6));
}

export async function recordAiUsageEvent(event: AiUsageEventInput): Promise<void> {
  if (event.userId && event.outcome === "success") {
    incrementLocalDailyUsage(event.userId);
  }

  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdminClient();
      const supabase = admin || (await createSupabaseServerClient());
      await supabase.from("ai_usage_events").insert({
        user_id: event.userId || null,
        provider: event.provider,
        model: event.model,
        feature: event.feature,
        input_tokens: event.inputTokens ?? null,
        output_tokens: event.outputTokens ?? null,
        estimated_cost: event.estimatedCost ?? null,
        outcome: event.outcome
      });
    } catch (err) {
      console.warn("Could not persist ai_usage_event to Supabase:", err);
    }
  }
}

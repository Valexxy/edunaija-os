import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv, getPublicSupabaseEnv } from "@/lib/env";

let adminClient: SupabaseClient | null = null;

/**
 * Returns a server-side Supabase client with Service Role privileges.
 * Bypasses Row Level Security (RLS) so backend AI engines, assessment
 * grading, scrutiny workers, and background queues have full, verified
 * capacity to write and read data securely.
 */
export function createSupabaseAdminClient(): SupabaseClient | null {
  const { url } = getPublicSupabaseEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();

  if (!SUPABASE_SERVICE_ROLE_KEY || !url || url.includes("placeholder")) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(url, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return adminClient;
}

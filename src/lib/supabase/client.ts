import { createBrowserClient } from "@supabase/ssr";

export function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ueejwjksjmbmwzyakjct.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZWp3amtzam1ibXd6eWFramN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MzcwNDQsImV4cCI6MjEwNzExMzA0NH0.uQGGgXqpxJKzLH8vP3CZlQoO9yPDUXkSgBGWVmxICkI";
  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("YOUR_PROJECT") && !url.includes("placeholder"));
}

export function createSupabaseBrowserClient() {
  const { url, key } = getPublicSupabaseEnv();
  return createBrowserClient(url, key);
}

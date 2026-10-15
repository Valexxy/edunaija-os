import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch {
      // In offline fallback
    }
  }

  const response = NextResponse.json({ success: true, message: "Signed out successfully" });
  response.cookies.delete("sb-access-token");
  response.cookies.delete("sb-refresh-token");
  response.cookies.delete("learnnaija_demo_user_id");

  // Thoroughly clear all Supabase SSR cookies from request
  const cookieHeader = request.headers.get("cookie") || "";
  cookieHeader.split(";").forEach((c) => {
    const name = c.trim().split("=")[0];
    if (name && (name.startsWith("sb-") || name === "learnnaija_demo_user_id")) {
      response.cookies.delete(name);
    }
  });

  return response;
}

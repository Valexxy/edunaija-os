import { NextResponse } from "next/server";
import { z } from "zod";
import {
  verifySovereignNIN,
  verifySovereignTRCN,
  verifySovereignNYSC,
  verifySovereignEmail
} from "@/lib/verification/sovereign-verifier";
import { getCurrentUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const verifySchema = z.object({
  type: z.enum(["NIN", "TRCN", "NYSC", "EMAIL"]),
  identifier: z.string().min(3).max(120)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid verification parameters", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { type, identifier } = parsed.data;

    let result;
    if (type === "NIN") {
      result = verifySovereignNIN(identifier);
    } else if (type === "TRCN") {
      result = verifySovereignTRCN(identifier);
    } else if (type === "NYSC") {
      result = verifySovereignNYSC(identifier);
    } else {
      result = verifySovereignEmail(identifier);
    }

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 }
      );
    }

    // If authenticated, optionally attach verified badge to profile in Supabase
    const user = await getCurrentUser();
    if (user) {
      try {
        const supabase = await createSupabaseServerClient();
        const updatePayload: Record<string, unknown> = {};
        if (type === "NIN") {
          updatePayload.nin_verified = true;
          updatePayload.nin_masked = result.maskedIdentifier;
        } else if (type === "TRCN") {
          updatePayload.trcn_verified = true;
          updatePayload.trcn_category = (result.metadata as { category?: string })?.category;
        } else if (type === "NYSC") {
          updatePayload.nysc_verified = true;
          updatePayload.nysc_call_up = result.maskedIdentifier;
        } else if (type === "EMAIL") {
          updatePayload.email_verified = true;
        }
        await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", user.id);
      } catch (err) {
        console.warn("[Verification Route] Supabase profile sync notice:", err);
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${type} successfully verified via Sovereign Engine under NDPA 2023 guidelines (Zero vendor lock-in).`
    });
  } catch (error) {
    console.error("[Verification Route] Error:", error);
    return NextResponse.json(
      { error: "Internal verification processing error" },
      { status: 500 }
    );
  }
}

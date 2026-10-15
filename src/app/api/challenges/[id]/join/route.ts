import { NextResponse } from "next/server";
import { z } from "zod";
import { joinChallenge } from "@/lib/challenges/engine";
import { getCurrentUser } from "@/lib/auth/session";
import { withEnterpriseErrorHandler } from "@/lib/monitoring/enterprise-error-handler";

export const runtime = "nodejs";

const joinSchema = z.object({
  displayName: z.string().trim().min(2).max(80).optional()
});

export const POST = withEnterpriseErrorHandler(async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  if (!context?.params) {
    return NextResponse.json({ error: "Missing challenge ID" }, { status: 400 });
  }
  const { id } = await context.params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to enter tournament challenge" },
      { status: 401 }
    );
  }

  if (user.role !== "student") {
    return NextResponse.json(
      { error: "Forbidden: National tournaments are reserved for enrolled student scholars. Guardians and teachers spectate via their cockpits." },
      { status: 403 }
    );
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    // Body is optional
  }

  const parsed = joinSchema.safeParse(body);
  const displayName = parsed.success && parsed.data.displayName ? parsed.data.displayName : user.display_name;

  try {
    const participant = joinChallenge(id, user.id, displayName);
    return NextResponse.json({ success: true, participant });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to join challenge";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}, "POST /api/challenges/[id]/join");

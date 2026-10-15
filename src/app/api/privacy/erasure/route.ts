import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { eraseLearnerData } from "@/lib/security/consent";

export const runtime = "nodejs";

export async function POST(_request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await eraseLearnerData(user.id);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Partial data erasure failure: One or more persistent data stores could not be scrubbed.",
        status: "partial_failure",
        details: result
      },
      { status: 207 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "NDPA Section 34 right to erasure fulfilled. All personal telemetry flagged for permanent scrubbing.",
    details: result
  });
}

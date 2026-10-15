import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getCurrentUser,
  listGuardianRelationships,
  inviteGuardian,
  updateGuardianRelationshipStatus,
  generateGuardianLinkToken,
  claimGuardianLinkToken
} from "@/lib/auth/session";

export const runtime = "nodejs";

const inviteSchema = z.object({
  guardianIdentifier: z.string().trim().min(5).max(120),
  relationshipLabel: z.string().trim().min(2).max(40).default("Guardian"),
  action: z.enum(["invite", "generate_token"]).optional()
});

const tokenActionSchema = z.object({
  action: z.literal("claim_token"),
  token: z.string().trim().min(4).max(30)
});

const actionSchema = z.object({
  relationshipId: z.string().min(1),
  status: z.enum(["accepted", "revoked"])
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const relationships = await listGuardianRelationships(user.id);
  return NextResponse.json({ relationships });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Handle token claim
  const parsedTokenClaim = tokenActionSchema.safeParse(body);
  if (parsedTokenClaim.success) {
    const claimRes = await claimGuardianLinkToken(
      user.id,
      user.display_name,
      parsedTokenClaim.data.token
    );
    if (!claimRes.success) {
      return NextResponse.json({ error: claimRes.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, relationship: claimRes.relationship });
  }

  // Handle invite or token generation
  const parsedInvite = inviteSchema.safeParse(body);
  if (parsedInvite.success) {
    if (parsedInvite.data.action === "generate_token") {
      const tokenData = await generateGuardianLinkToken(
        user.id,
        parsedInvite.data.guardianIdentifier,
        parsedInvite.data.relationshipLabel
      );
      return NextResponse.json({ success: true, tokenData });
    }

    const invite = await inviteGuardian(
      user.id,
      parsedInvite.data.guardianIdentifier,
      parsedInvite.data.relationshipLabel
    );
    return NextResponse.json({ success: true, invite });
  }

  // Handle accept / revoke action
  const parsedAction = actionSchema.safeParse(body);
  if (parsedAction.success) {
    const updated = await updateGuardianRelationshipStatus(
      parsedAction.data.relationshipId,
      parsedAction.data.status
    );
    return NextResponse.json({ success: true, relationship: updated });
  }

  return NextResponse.json({ error: "Invalid action payload" }, { status: 400 });
}

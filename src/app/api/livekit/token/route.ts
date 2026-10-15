import { NextResponse } from "next/server";
import { z } from "zod";
import { createLiveKitToken } from "@/lib/livekit/token";
import { getLiveKitEnv } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

const requestSchema = z.object({
  roomName: z.string().min(2).max(100),
  participantName: z.string().min(2).max(80).optional(),
  isTeacher: z.boolean().optional().default(false)
});

export async function POST(req: Request) {
  try {
    const { isConfigured, url } = getLiveKitEnv();
    if (!isConfigured) {
      return NextResponse.json(
        { error: "LiveKit is not configured on this server." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid room parameters", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { roomName, participantName, isTeacher: requestedTeacher } = parsed.data;

    // Resolve authenticated user
    const user = await getCurrentUser();

    // Strictly authorize teacher privileges server-side; forbid client-side self-promotion
    let authorizedAsTeacher = false;
    if (requestedTeacher) {
      if (!user) {
        return NextResponse.json(
          { error: "Authentication required for teacher classroom administration" },
          { status: 401 }
        );
      }
      if (user.role !== "teacher" && user.role !== "school_admin" && user.role !== "platform_admin") {
        return NextResponse.json(
          { error: "Forbidden: Teacher privileges require an authenticated, vetted teacher account" },
          { status: 403 }
        );
      }
      authorizedAsTeacher = true;
    }

    const identity = user?.id || `guest_${Math.random().toString(36).substring(2, 9)}`;
    const displayName = participantName || user?.display_name || (authorizedAsTeacher ? "Vetted Teacher" : "Scholar");

    const token = await createLiveKitToken({
      roomName,
      participantIdentity: identity,
      participantName: displayName,
      isTeacher: authorizedAsTeacher
    });

    return NextResponse.json({
      token,
      url,
      roomName,
      participant: {
        identity,
        displayName,
        isTeacher: authorizedAsTeacher
      }
    });
  } catch (error) {
    console.error("[LiveKit Token Route] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate classroom token" },
      { status: 500 }
    );
  }
}

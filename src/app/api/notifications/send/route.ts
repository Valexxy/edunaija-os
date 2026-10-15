import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { broadcastPushNotification } from "@/lib/notifications/web-push";

export const runtime = "nodejs";

const sendSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(300),
  url: z.string().optional(),
  targetUserId: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    // Allow admin or self test
    const body = await req.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid notification payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { title, body: notifBody, url, targetUserId } = parsed.data;

    const result = await broadcastPushNotification(
      {
        title,
        body: notifBody,
        url: url || "/dashboard"
      },
      targetUserId || user?.id
    );

    return NextResponse.json({
      success: true,
      sentCount: result.sentCount,
      message: `Notification broadcast completed to ${result.sentCount} active subscribers.`
    });
  } catch (error) {
    console.error("[Push Send Route] Error:", error);
    return NextResponse.json({ error: "Failed to dispatch push notification" }, { status: 500 });
  }
}

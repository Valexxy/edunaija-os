import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { savePushSubscription } from "@/lib/notifications/web-push";

export const runtime = "nodejs";

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(10),
      auth: z.string().min(6)
    })
  }),
  deviceLabel: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid subscription payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const { endpoint, keys } = parsed.data.subscription;

    await savePushSubscription({
      endpoint,
      keys,
      userId: user?.id,
      deviceLabel: parsed.data.deviceLabel || "Mobile PWA"
    });

    return NextResponse.json({
      success: true,
      message: "Push notification subscription registered successfully."
    });
  } catch (error) {
    console.error("[Push Subscribe Route] Error:", error);
    return NextResponse.json({ error: "Failed to register subscription" }, { status: 500 });
  }
}

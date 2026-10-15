import { NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/billing/paystack";

export const runtime = "nodejs";

// In-memory processed reference store for idempotency
const processedEvents = new Set<string>();

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // In production, enforce HMAC SHA512 check
    if (process.env.PAYSTACK_SECRET_KEY && !verifyPaystackSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // Idempotent event deduplication
    const eventId = event.data?.reference || event.data?.id?.toString() || "";
    if (eventId && processedEvents.has(eventId)) {
      return NextResponse.json({ status: "already_processed" });
    }
    if (eventId) {
      processedEvents.add(eventId);
    }

    if (event.event === "charge.success") {
      console.log(`[Paystack Webhook] Charge successful for ${event.data.customer?.email}: ₦${event.data.amount / 100}`);
      // Upgrade household tier in database
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[Paystack Webhook] Error:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}

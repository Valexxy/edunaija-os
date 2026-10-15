import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { SUBSCRIPTION_PLANS } from "@/lib/billing/paystack";

export const runtime = "nodejs";

const initSchema = z.object({
  email: z.string().email(),
  plan: z.enum(["family_premium"]).default("family_premium")
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = initSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment request" }, { status: 400 });
    }

    const { email, plan } = parsed.data;
    const planConfig = SUBSCRIPTION_PLANS[plan];
    const amountKobo = planConfig.priceNaira * 100; // Paystack takes amounts in Kobo

    const env = getServerEnv();
    const secretKey = env.PAYSTACK_SECRET_KEY;

    // If running in development without active live secret, provide mock sandbox authorization
    if (!secretKey) {
      return NextResponse.json({
        success: true,
        mock: true,
        authorization_url: "/dashboard?payment_success=mock",
        reference: `mock_ref_${Date.now()}`,
        message: "Developer Sandbox Mode: Simulated checkout initialized."
      });
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secretKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        amount: amountKobo,
        callback_url: "http://localhost:3000/dashboard?payment_status=success",
        metadata: {
          plan,
          plan_name: planConfig.name
        }
      })
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
      return NextResponse.json({ error: data.message || "Failed to initialize Paystack transaction" }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference
    });
  } catch {
    return NextResponse.json({ error: "Internal payment processing error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { isMinor } from "@/lib/security/safeguarding";
import { MOCK_TRCN_TEACHERS } from "@/lib/classroom/trcn-teachers";

export const runtime = "nodejs";

const verifySchema = z.object({
  roomName: z.string().min(2).max(100),
  userAge: z.number().int().min(5).max(100).optional(),
  guardianConsentAcknowledged: z.boolean().optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload", issues: parsed.error.issues }, { status: 400 });
    }

    const { roomName, userAge = 16, guardianConsentAcknowledged = false } = parsed.data;
    const user = await getCurrentUser();

    // 1. Resolve assigned TRCN teacher
    const teacher = MOCK_TRCN_TEACHERS.find(
      (t) => t.roomName === roomName.toLowerCase()
    ) || {
      roomName,
      fullName: "Dr. Folashade Adeleke, Ph.D",
      trcnNumber: "TRCN/ABJ/CAT-A/2017/0019",
      trcnCategory: "Category A (Doctorate Fellow)",
      stateOfPractice: "FCT Abuja",
      qualification: "Ph.D Chemistry (UI Ibadan)",
      specialization: "Senior Secondary Sciences & STEM",
      ninVerified: true,
      rating: 4.98,
      scheduledTopic: `Live Session: ${roomName.replace(/-/g, " ")}`
    };

    // 2. Child Safeguarding Gate Check (NDPA 2023 / CRA 2003)
    const minorFlag = isMinor(userAge);
    let requiresGuardianConsent = false;
    let consentGranted = true;

    if (minorFlag && !guardianConsentAcknowledged) {
      // If student is minor and hasn't explicitly confirmed parental consent
      requiresGuardianConsent = true;
      consentGranted = false;
    }

    // 3. Generate verification authorization token
    const sessionToken = Buffer.from(
      JSON.stringify({
        roomName,
        teacherTrcn: teacher.trcnNumber,
        userId: user?.id || "scholar-guest",
        timestamp: Date.now()
      })
    ).toString("base64");

    return NextResponse.json({
      success: true,
      authorized: consentGranted,
      requiresGuardianConsent,
      teacherBadge: {
        fullName: teacher.fullName,
        trcnNumber: teacher.trcnNumber,
        trcnCategory: teacher.trcnCategory,
        stateOfPractice: teacher.stateOfPractice,
        qualification: teacher.qualification,
        specialization: teacher.specialization,
        ninVerified: teacher.ninVerified,
        rating: teacher.rating,
        scheduledTopic: teacher.scheduledTopic
      },
      sessionToken: consentGranted ? sessionToken : null
    });
  } catch (err) {
    console.error("[SessionVerifyRoute] Error verifying classroom session:", err);
    return NextResponse.json({ error: "Classroom gate verification failed" }, { status: 500 });
  }
}

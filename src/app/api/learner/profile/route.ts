import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, getLearnerProfile, updateLearnerProfile } from "@/lib/auth/session";

export const runtime = "nodejs";

const profileUpdateSchema = z.object({
  display_name: z.string().trim().min(2).max(80).optional(),
  education_level: z.enum(["primary", "junior_secondary", "senior_secondary", "exam_prep", "tertiary", "other"]).optional(),
  academic_track: z.enum(["science", "arts", "commercial", "technical", "general"]).optional(),
  state_name: z.string().trim().min(2).max(60).optional(),
  class_label: z.string().trim().max(40).optional(),
  exam_goal: z.string().trim().max(80).optional(),
  preferred_language: z.enum(["en", "pcm"]).optional(),
  streak_days: z.number().int().min(0).optional(),
  total_xp: z.number().int().min(0).optional(),
  study_minutes: z.number().int().min(0).optional(),
  last_active_date: z.string().optional()
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const learnerProfile = await getLearnerProfile(user.id);
  return NextResponse.json({
    user,
    learnerProfile
  });
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

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request data", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const updated = await updateLearnerProfile(user.id, parsed.data);
    return NextResponse.json({ success: true, profile: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

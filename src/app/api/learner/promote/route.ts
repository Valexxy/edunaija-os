import { NextResponse } from "next/server";
import { getCurrentUser, updateLearnerProfile, recordLearnerActivity } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetClass, targetLevel, targetTrack, targetGoal, placementScore } = body;

    if (!targetClass || placementScore === undefined) {
      return NextResponse.json(
        { error: "Target class and placement score are required" },
        { status: 400 }
      );
    }

    // Due Diligence Gate: Minimum 65% score required for promotion
    if (placementScore < 65) {
      return NextResponse.json(
        {
          error: "Placement score did not meet the 65% minimum requirement for promotion",
          passed: false,
          score: placementScore
        },
        { status: 422 }
      );
    }

    // Update Learner Profile in database / session
    const updated = await updateLearnerProfile(user.id, {
      class_label: targetClass,
      education_level: targetLevel || (targetClass.toLowerCase().includes("primary") ? "primary" : targetClass.toLowerCase().includes("jss") ? "junior_secondary" : "senior_secondary"),
      academic_track: targetTrack || (targetClass.toLowerCase().includes("art") ? "arts" : targetClass.toLowerCase().includes("comm") ? "commercial" : "science"),
      exam_goal: targetGoal || (targetClass.toLowerCase().includes("primary") ? "National Common Entrance Examination (NCEE)" : targetClass.toLowerCase().includes("jss") ? "BECE 2026" : "JAMB UTME 2026")
    });

    // Award +500 Milestone Promotion XP bonus
    await recordLearnerActivity(user.id, 30, 500);

    return NextResponse.json({
      success: true,
      passed: true,
      score: placementScore,
      promotedClass: targetClass,
      xpAwarded: 500,
      badge: "Verified Academic Promotion Milestone",
      profile: updated
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal promotion error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

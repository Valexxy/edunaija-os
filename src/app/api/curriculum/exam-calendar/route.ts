import { NextResponse } from "next/server";
import { 
  STATUTORY_EXAM_CALENDAR, 
  adjustExamSchedule, 
  calculateLiveExamCountdown,
  recalibrateDailyStudyPace
} from "@/lib/curriculum/exam-calendar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * GET /api/curriculum/exam-calendar
 * Serves statutory examination timetables with live day countdowns.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const examGoal = searchParams.get("examGoal") || "JAMB UTME 2027";

    // Attempt Supabase fetch if configured
    let dbSchedules: any[] | null = null;
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("statutory_exam_schedules")
        .select("*");
      if (!error && data && data.length > 0) {
        dbSchedules = data;
      }
    } catch {
      // In offline/mock mode, gracefully proceed with in-memory dynamic calendar
    }

    const countdown = calculateLiveExamCountdown(examGoal);
    const paceRecalibration = recalibrateDailyStudyPace(countdown.daysRemaining);

    return NextResponse.json({
      success: true,
      activeGoal: examGoal,
      countdown,
      studyPace: paceRecalibration,
      allSchedules: dbSchedules || Object.values(STATUTORY_EXAM_CALENDAR),
      timestamp: new Date().toISOString()
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
      }
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error reading exam timetable";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/curriculum/exam-calendar
 * Autonomous / Administrative Regulatory Shift endpoint.
 * Called when an official exam board (e.g. JAMB Registrar) shifts examination dates.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { examKey, newStartDateIso, newEndDateIso, shiftReason, sourceUpdateBulletin } = body;

    if (!examKey || !newStartDateIso || !newEndDateIso || !shiftReason) {
      return NextResponse.json({
        error: "Missing required fields: examKey, newStartDateIso, newEndDateIso, shiftReason"
      }, { status: 400 });
    }

    const validKeys = ["JAMB", "WAEC", "NECO", "BECE", "NCEE"];
    if (!validKeys.includes(examKey.toUpperCase())) {
      return NextResponse.json({
        error: `Invalid examKey. Allowed: ${validKeys.join(", ")}`
      }, { status: 400 });
    }

    // 1. Update In-Memory Registry
    const updated = adjustExamSchedule(
      examKey.toUpperCase() as any,
      newStartDateIso,
      newEndDateIso,
      shiftReason,
      sourceUpdateBulletin || "Official Registrar Policy Gazette"
    );

    // 2. Persist to Supabase if available
    try {
      const supabase = await createSupabaseServerClient();
      await supabase
        .from("statutory_exam_schedules")
        .upsert({
          exam_key: examKey.toUpperCase(),
          start_date_iso: newStartDateIso,
          end_date_iso: newEndDateIso,
          status: "POSTPONED_SHIFTED",
          shift_reason: shiftReason,
          previous_start_date: updated.previousStartDate,
          last_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: "exam_key" });

      // Record Audit Event
      await supabase
        .from("audit_events")
        .insert({
          action: "EXAM_DATE_SHIFT_DETECTED",
          entity_type: "statutory_exam_schedule",
          entity_id: examKey.toUpperCase(),
          metadata: {
            previousStartDate: updated.previousStartDate,
            newStartDate: newStartDateIso,
            shiftReason,
            source: sourceUpdateBulletin
          }
        });
    } catch {
      // Offline/Local demo mode persists cleanly via DYNAMIC_EXAM_REGISTRY
    }

    // 3. Recalculate Live Countdown with New Date
    const newCountdown = calculateLiveExamCountdown(examKey);
    const newPace = recalibrateDailyStudyPace(newCountdown.daysRemaining);

    return NextResponse.json({
      success: true,
      message: `Statutory examination schedule for ${examKey} successfully shifted and recalibrated.`,
      updatedSchedule: updated,
      newCountdown,
      recalibratedPace: newPace
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error adjusting exam timetable";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Parse .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] || "";
      if (val.endsWith("\r")) val = val.slice(0, -1);
      process.env[match[1]] = val.trim();
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false }
});

const candidateTables = [
  "profiles",
  "guardian_wards",
  "subjects",
  "curriculum_sources",
  "curriculum_topics",
  "learning_objectives",
  "questions",
  "assessments",
  "assessment_sections",
  "assessment_items",
  "assessment_attempts",
  "assessment_responses",
  "challenges",
  "challenge_participants",
  "challenge_submissions",
  "leaderboards",
  "ai_usage_events",
  "audit_events",
  "learner_streaks",
  "vetted_tutors",
  "teacher_classes",
  "class_enrollments",
  "guardian_consents",
  "tutor_bookings",
  "screentime_controls",
  "tournaments",
  "mistake_vault",
  "transactions",
  "question_history"
];

async function inspectDatabase() {
  console.log("=== SUPABASE LIVE TABLES AUDIT ===");
  const results: Record<string, { exists: boolean; count?: number; error?: string; sampleCols?: string[] }> = {};

  for (const table of candidateTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select("*", { count: "exact" })
        .limit(1);

      if (error) {
        results[table] = { exists: false, error: error.message };
      } else {
        const sampleCols = data && data.length > 0 ? Object.keys(data[0]) : [];
        results[table] = { exists: true, count: count ?? 0, sampleCols };
      }
    } catch (e: any) {
      results[table] = { exists: false, error: e.message };
    }
  }

  for (const [tbl, res] of Object.entries(results)) {
    if (res.exists) {
      console.log(`[EXISTS] ${tbl.padEnd(25)} Count: ${String(res.count).padStart(5)} | Cols: ${res.sampleCols?.slice(0, 6).join(", ") || "(empty table)"}`);
    } else {
      console.log(`[MISSING] ${tbl.padEnd(24)} -> ${res.error}`);
    }
  }
}

inspectDatabase().catch(console.error);

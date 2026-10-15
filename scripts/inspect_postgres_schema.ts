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

async function queryAllTables() {
  console.log("=== CHECKING POSTGRES SCHEMA TABLES ===");
  // Query Supabase RPC or tables
  const { data, error } = await supabase.rpc("get_schema_tables");
  if (error) {
    // If RPC doesn't exist, try querying candidate tables from MASTER_INITIALIZE_SUPABASE
    const masterTables = [
      "profiles",
      "schools",
      "school_memberships",
      "learner_profiles",
      "guardian_relationships",
      "subjects",
      "curriculum_sources",
      "curriculum_topics",
      "questions",
      "assessments",
      "assessment_questions",
      "assessment_attempts",
      "attempt_answers",
      "learner_mastery",
      "exam_integrity_audits",
      "parental_consents",
      "email_dispatch_logs",
      "challenges",
      "challenge_participants",
      "ai_usage_events",
      "audit_events",
      "vetted_tutors",
      "teacher_classrooms"
    ];

    for (const tbl of masterTables) {
      const res = await supabase.from(tbl).select("*", { count: "exact" }).limit(1);
      if (res.error) {
        console.log(`[TABLE MISSING / ERROR] ${tbl.padEnd(25)}: ${res.error.message}`);
      } else {
        console.log(`[TABLE PRESENT]         ${tbl.padEnd(25)} Count: ${res.count ?? 0}`);
      }
    }
  } else {
    console.log("Tables from RPC:", data);
  }
}

queryAllTables().catch(console.error);

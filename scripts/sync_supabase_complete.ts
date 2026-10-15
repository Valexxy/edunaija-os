import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Parse .env.local manually
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

import { SEED_SUBJECTS, SEED_SOURCES, SEED_TOPICS } from "../src/lib/curriculum/seed-data";
import { getComprehensiveQuestionBank } from "../src/lib/curriculum/scrutiny-engine";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false }
});

const sourceUuidMap: Record<string, string> = {
  "src-nerdc-01": "c1000000-0000-0000-0000-000000000001",
  "src-jamb-02": "c1000000-0000-0000-0000-000000000002",
  "src-bece-03": "c1000000-0000-0000-0000-000000000003",
  "src-ncee-04": "c1000000-0000-0000-0000-000000000004"
};

async function syncAll() {
  console.log("=== INITIATING ADAPTIVE SUPABASE CURRICULUM SYNC ===");

  // 1. Sync Sources
  console.log("\n1. Syncing Curriculum Sources...");
  for (const src of SEED_SOURCES) {
    const uuid = sourceUuidMap[src.id] || "c1000000-0000-0000-0000-000000000099";
    const { error } = await supabase.from("curriculum_sources").upsert({
      id: uuid,
      title: src.title,
      source_type: src.source_type,
      issuing_body: src.issuing_body,
      version_label: src.version_label,
      is_official_verified: src.is_official_verified,
      status: src.status
    }, { onConflict: "id" });
    if (error) console.error(`  Error syncing source ${src.id}:`, error.message);
    else console.log(`  ✓ Source synced: ${src.title}`);
  }

  // 2. Fetch existing subjects map
  console.log("\n2. Mapping Subjects from Supabase...");
  const { data: dbSubjects, error: sErr } = await supabase.from("subjects").select("id, slug");
  if (sErr) throw sErr;
  const slugToSubjectUuid = new Map<string, string>();
  for (const s of dbSubjects || []) {
    slugToSubjectUuid.set(s.slug, s.id);
  }

  // Also map seed subject IDs (sub-math-01 etc.)
  const seedSubIdToUuid = new Map<string, string>();
  for (const sub of SEED_SUBJECTS) {
    const existing = slugToSubjectUuid.get(sub.slug);
    if (existing) {
      seedSubIdToUuid.set(sub.id, existing);
      console.log(`  ✓ Subject mapped: ${sub.name} -> ${existing}`);
    }
  }

  // 3. Adaptive Topic Syncing
  console.log("\n3. Syncing Curriculum Topics...");
  const { data: existingTopics } = await supabase.from("curriculum_topics").select("id, code, subject_id");
  const existingTopicLookup = new Map<string, string>();
  for (const t of existingTopics || []) {
    existingTopicLookup.set(`${t.subject_id}:${t.code}`, t.id);
  }

  const topicIdToDbUuid = new Map<string, string>();
  let topicCounter = 1;

  for (const top of SEED_TOPICS) {
    const subjectUuid = seedSubIdToUuid.get(top.subject_id);
    const sourceUuid = sourceUuidMap[top.source_id] || "c1000000-0000-0000-0000-000000000001";

    if (!subjectUuid) {
      console.warn(`  Warning: Subject ${top.subject_id} not found in database!`);
      continue;
    }

    const key = `${subjectUuid}:${top.code}`;
    let topicDbId = existingTopicLookup.get(key);

    if (topicDbId) {
      // Update existing topic
      await supabase.from("curriculum_topics").update({
        title: top.title,
        description: top.description,
        education_level: top.education_level,
        status: top.status
      }).eq("id", topicDbId);
      topicIdToDbUuid.set(top.id, topicDbId);
      console.log(`  ✓ Updated existing topic: ${top.code} (${topicDbId})`);
    } else {
      // Generate a clean UUID
      topicDbId = `e2000000-0000-0000-0000-${String(topicCounter).padStart(12, "0")}`;
      topicCounter++;

      const { data: inserted, error: insertErr } = await supabase.from("curriculum_topics").insert({
        id: topicDbId,
        source_id: sourceUuid,
        subject_id: subjectUuid,
        code: top.code,
        title: top.title,
        description: top.description,
        education_level: top.education_level,
        sort_order: top.sort_order,
        status: top.status
      }).select().single();

      if (insertErr) {
        console.error(`  Error inserting topic ${top.code}:`, insertErr.message);
      } else {
        topicIdToDbUuid.set(top.id, topicDbId);
        console.log(`  ✓ Inserted topic: ${top.code} - ${top.title} (${topicDbId})`);
      }
    }
  }

  // 4. Sync All Scrutinized Questions
  console.log("\n4. Syncing Scrutinized Questions Bank to Supabase...");
  const questions = getComprehensiveQuestionBank();
  let qSuccess = 0;
  let qCounter = 100;

  for (const q of questions) {
    const dbTopicId = topicIdToDbUuid.get(q.topic_id);
    if (!dbTopicId) {
      console.warn(`  Warning: Topic ${q.topic_id} could not be resolved for question ${q.id}`);
      continue;
    }

    const qUuid = `a2000000-0000-0000-0000-${String(qCounter).padStart(12, "0")}`;
    qCounter++;

    const { error: qErr } = await supabase.from("questions").upsert({
      id: qUuid,
      topic_id: dbTopicId,
      question_type: q.question_type,
      prompt: q.prompt,
      options: q.options,
      answer_key: q.answer_key,
      explanation: q.explanation,
      difficulty: q.difficulty,
      status: q.status,
      provenance: q.provenance
    }, { onConflict: "id" });

    if (qErr) {
      console.error(`  Error syncing question:`, qErr.message);
    } else {
      qSuccess++;
    }
  }
  console.log(`  ✓ Successfully synced ${qSuccess}/${questions.length} questions into Supabase!`);

  // 5. Query Final DB Counts
  console.log("\n=== FINAL SUPABASE AUDIT ===");
  const { count: sCount } = await supabase.from("subjects").select("*", { count: "exact", head: true });
  const { count: tCount } = await supabase.from("curriculum_topics").select("*", { count: "exact", head: true });
  const { count: qCount } = await supabase.from("questions").select("*", { count: "exact", head: true });
  const { count: aCount } = await supabase.from("assessments").select("*", { count: "exact", head: true });
  const { count: cCount } = await supabase.from("challenges").select("*", { count: "exact", head: true });

  console.log(`  Subjects: ${sCount}`);
  console.log(`  Topics: ${tCount}`);
  console.log(`  Questions: ${qCount}`);
  console.log(`  Assessments: ${aCount}`);
  console.log(`  Challenges: ${cCount}`);
  console.log("==========================================");
}

syncAll().catch(console.error);

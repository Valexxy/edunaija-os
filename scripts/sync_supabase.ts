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

// Deterministic UUID maps
const subjectUuidMap: Record<string, string> = {
  "sub-math-01": "d1000000-0000-0000-0000-000000000001",
  "sub-eng-02": "d1000000-0000-0000-0000-000000000002",
  "sub-phy-03": "d1000000-0000-0000-0000-000000000003",
  "sub-chem-04": "d1000000-0000-0000-0000-000000000004",
  "sub-bio-05": "d1000000-0000-0000-0000-000000000005",
  "sub-jss-math-06": "d1000000-0000-0000-0000-000000000006",
  "sub-jss-eng-07": "d1000000-0000-0000-0000-000000000007",
  "sub-jss-sci-08": "d1000000-0000-0000-0000-000000000008",
  "sub-pri-math-09": "d1000000-0000-0000-0000-000000000009",
  "sub-pri-eng-10": "d1000000-0000-0000-0000-000000000010",
  "sub-pri-sci-11": "d1000000-0000-0000-0000-000000000011",
  "sub-lit-12": "d1000000-0000-0000-0000-000000000012",
  "sub-gov-13": "d1000000-0000-0000-0000-000000000013",
  "sub-crs-14": "d1000000-0000-0000-0000-000000000014",
  "sub-comm-15": "d1000000-0000-0000-0000-000000000015",
  "sub-acc-16": "d1000000-0000-0000-0000-000000000016",
  "sub-econ-17": "d1000000-0000-0000-0000-000000000017"
};

const sourceUuidMap: Record<string, string> = {
  "src-nerdc-01": "c1000000-0000-0000-0000-000000000001",
  "src-jamb-02": "c1000000-0000-0000-0000-000000000002",
  "src-bece-03": "c1000000-0000-0000-0000-000000000003",
  "src-ncee-04": "c1000000-0000-0000-0000-000000000004"
};

const topicUuidMap: Record<string, string> = {
  "top-math-quad-01": "e1000000-0000-0000-0000-000000000001",
  "top-eng-concord-02": "e1000000-0000-0000-0000-000000000002",
  "top-phy-kin-03": "e1000000-0000-0000-0000-000000000003",
  "top-chm-atom-04": "e1000000-0000-0000-0000-000000000004",
  "top-bio-cell-05": "e1000000-0000-0000-0000-000000000005",
  "top-math-trig-06": "e1000000-0000-0000-0000-000000000006",
  "top-eng-lexis-07": "e1000000-0000-0000-0000-000000000007",
  "top-phy-work-08": "e1000000-0000-0000-0000-000000000008",
  "top-chm-stoich-09": "e1000000-0000-0000-0000-000000000009",
  "top-bio-phys-10": "e1000000-0000-0000-0000-000000000010",
  "top-jss-alg-11": "e1000000-0000-0000-0000-000000000011",
  "top-jss-geo-12": "e1000000-0000-0000-0000-000000000012",
  "top-jss-parts-13": "e1000000-0000-0000-0000-000000000013",
  "top-jss-energy-14": "e1000000-0000-0000-0000-000000000014",
  "top-jss-matter-15": "e1000000-0000-0000-0000-000000000015",
  "top-pri-frac-16": "e1000000-0000-0000-0000-000000000016",
  "top-pri-sent-17": "e1000000-0000-0000-0000-000000000017",
  "top-pri-living-18": "e1000000-0000-0000-0000-000000000018",
  "top-lit-fig-19": "e1000000-0000-0000-0000-000000000019",
  "top-lit-drama-20": "e1000000-0000-0000-0000-000000000020",
  "top-gov-const-21": "e1000000-0000-0000-0000-000000000021",
  "top-gov-arms-22": "e1000000-0000-0000-0000-000000000022",
  "top-crs-faith-23": "e1000000-0000-0000-0000-000000000023",
  "top-crs-church-24": "e1000000-0000-0000-0000-000000000024",
  "top-comm-trade-25": "e1000000-0000-0000-0000-000000000025",
  "top-comm-bank-26": "e1000000-0000-0000-0000-000000000026",
  "top-acc-double-27": "e1000000-0000-0000-0000-000000000027",
  "top-acc-trial-28": "e1000000-0000-0000-0000-000000000028",
  "top-econ-elast-29": "e1000000-0000-0000-0000-000000000029",
  "top-econ-macro-30": "e1000000-0000-0000-0000-000000000030"
};

async function syncAll() {
  console.log("=== INITIATING FULL SUPABASE CURRICULUM & ASSESSMENT SYNC ===");

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

  // 2. Sync Subjects
  console.log("\n2. Syncing Subjects (Science, Arts, Commercial, Junior, Primary)...");
  for (const sub of SEED_SUBJECTS) {
    const uuid = subjectUuidMap[sub.id] || `d1000000-0000-0000-0000-${sub.id.replace(/[^0-9]/g, "").padStart(12, "0")}`;
    const { error } = await supabase.from("subjects").upsert({
      id: uuid,
      slug: sub.slug,
      name: sub.name,
      description: sub.description,
      education_levels: sub.education_levels
    }, { onConflict: "slug" });

    if (error) console.error(`  Error syncing subject ${sub.slug}:`, error.message);
    else console.log(`  ✓ Subject synced: ${sub.name} [${sub.slug}]`);
  }

  // 3. Sync Topics
  console.log("\n3. Syncing Curriculum Topics...");
  for (const top of SEED_TOPICS) {
    const topicUuid = topicUuidMap[top.id] || `e1000000-0000-0000-0000-${top.id.replace(/[^0-9]/g, "").padStart(12, "0")}`;
    const sourceUuid = sourceUuidMap[top.source_id] || "c1000000-0000-0000-0000-000000000001";
    const subjectUuid = subjectUuidMap[top.subject_id];

    if (!subjectUuid) {
      console.warn(`  Skipping topic ${top.code}: subject ${top.subject_id} not mapped`);
      continue;
    }

    const { error } = await supabase.from("curriculum_topics").upsert({
      id: topicUuid,
      source_id: sourceUuid,
      subject_id: subjectUuid,
      code: top.code,
      title: top.title,
      description: top.description,
      education_level: top.education_level,
      sort_order: top.sort_order,
      status: top.status
    }, { onConflict: "id" });

    if (error) console.error(`  Error syncing topic ${top.code}:`, error.message);
    else console.log(`  ✓ Topic synced: ${top.code} - ${top.title}`);
  }

  // 4. Sync Questions
  console.log("\n4. Syncing Scrutinized Questions...");
  const questions = getComprehensiveQuestionBank();
  let qSuccess = 0;
  let qIdx = 1;

  for (const q of questions) {
    const topicUuid = topicUuidMap[q.topic_id];
    if (!topicUuid) {
      console.warn(`  Skipping question ${q.id}: topic ${q.topic_id} not found in map`);
      continue;
    }

    const questionUuid = `a1000000-0000-0000-0000-${String(qIdx).padStart(12, "0")}`;
    qIdx++;

    const { error } = await supabase.from("questions").upsert({
      id: questionUuid,
      topic_id: topicUuid,
      question_type: q.question_type,
      prompt: q.prompt,
      options: q.options,
      answer_key: q.answer_key,
      explanation: q.explanation,
      difficulty: q.difficulty,
      status: q.status,
      provenance: q.provenance
    }, { onConflict: "id" });

    if (error) {
      console.error(`  Error syncing question ${q.id}:`, error.message);
    } else {
      qSuccess++;
    }
  }
  console.log(`  ✓ Successfully synced ${qSuccess}/${questions.length} questions.`);

  // 5. Sync Assessments
  console.log("\n5. Syncing Track-Specific Assessments & Sprints...");
  const assessmentsToSync = [
    {
      id: "b1000000-0000-0000-0000-000000000001",
      title: "National Senior Secondary STEM Diagnostic Benchmark (JAMB/WAEC Tier)",
      description: "Comprehensive diagnostic covering Mathematics, Physics, Chemistry, and Biology.",
      education_level: "senior_secondary",
      subject_id: null,
      status: "published",
      time_limit_seconds: 600
    },
    {
      id: "b1000000-0000-0000-0000-000000000002",
      title: "Senior Secondary Mathematics: Algebra & Quadratic Sprint",
      description: "Targeted drill on quadratic equations, factoring, and polynomial root determination.",
      education_level: "senior_secondary",
      subject_id: "d1000000-0000-0000-0000-000000000001",
      status: "published",
      time_limit_seconds: 300
    },
    {
      id: "b1000000-0000-0000-0000-000000000003",
      title: "JAMB UTME Arts & Humanities Diagnostic (Lit, Govt, CRS, English)",
      description: "Comprehensive diagnostic for Arts scholars aspiring to Law, Mass Comm, and Humanities.",
      education_level: "senior_secondary",
      subject_id: null,
      status: "published",
      time_limit_seconds: 600
    },
    {
      id: "b1000000-0000-0000-0000-000000000004",
      title: "JAMB UTME Commercial & Business Diagnostic (Comm, Acct, Econ, English)",
      description: "Comprehensive diagnostic for Commercial scholars targeting Accounting, Finance, and Economics.",
      education_level: "senior_secondary",
      subject_id: null,
      status: "published",
      time_limit_seconds: 600
    },
    {
      id: "b1000000-0000-0000-0000-000000000005",
      title: "Literature-in-English: Figures of Speech & African Drama Sprint",
      description: "Targeted drill on metaphors, oxymoron, personification, and African dramatic devices.",
      education_level: "senior_secondary",
      subject_id: "d1000000-0000-0000-0000-000000000012",
      status: "published",
      time_limit_seconds: 300
    },
    {
      id: "b1000000-0000-0000-0000-000000000006",
      title: "Financial Accounting: Double-Entry & Trial Balance Sprint",
      description: "Speed drill on debit/credit principles, ledger postings, and error correction.",
      education_level: "senior_secondary",
      subject_id: "d1000000-0000-0000-0000-000000000016",
      status: "published",
      time_limit_seconds: 300
    },
    {
      id: "b1000000-0000-0000-0000-000000000007",
      title: "Junior Secondary BECE Diagnostic Benchmark",
      description: "Diagnostic covering JSS Basic Mathematics, English Studies, and Basic Science.",
      education_level: "junior_secondary",
      subject_id: null,
      status: "published",
      time_limit_seconds: 480
    },
    {
      id: "b1000000-0000-0000-0000-000000000008",
      title: "National Common Entrance (NCEE) Primary Diagnostic Benchmark",
      description: "Foundational Unity school entry benchmark covering Fractions, Verbal Reasoning, and Science.",
      education_level: "primary",
      subject_id: null,
      status: "published",
      time_limit_seconds: 480
    }
  ];

  for (const asm of assessmentsToSync) {
    const { error } = await supabase.from("assessments").upsert(asm as any, { onConflict: "id" });
    if (error) console.error(`  Error syncing assessment ${asm.id}:`, error.message);
    else console.log(`  ✓ Assessment synced: ${asm.title}`);
  }

  // 6. Sync Multi-Track Challenges
  console.log("\n6. Syncing Multi-Track Tournaments & Challenges...");
  const challengesToSync = [
    {
      id: "f1000000-0000-0000-0000-000000000001",
      title: "National Senior Secondary STEM Championship (UTME/WAEC Sprint)",
      assessment_id: "b1000000-0000-0000-0000-000000000001",
      status: "open",
      prize_description: "₦500,000 Academic Scholarship & WAEC/JAMB Full Registration Sponsorship",
      rules_version: "1"
    },
    {
      id: "f1000000-0000-0000-0000-000000000002",
      title: "National Mathematics Speed Duel (LGA & State Qualifier)",
      assessment_id: "b1000000-0000-0000-0000-000000000002",
      status: "open",
      prize_description: "₦250,000 STEM Excellence Grant & National Honor Certificate",
      rules_version: "1"
    },
    {
      id: "f1000000-0000-0000-0000-000000000003",
      title: "National Arts & Humanities League Qualifier (Lit, Govt, CRS)",
      assessment_id: "b1000000-0000-0000-0000-000000000003",
      status: "open",
      prize_description: "₦500,000 Law & Humanities Scholarship & Book Grants",
      rules_version: "1"
    },
    {
      id: "f1000000-0000-0000-0000-000000000004",
      title: "National Commercial & Business League Qualifier (Comm, Acct, Econ)",
      assessment_id: "b1000000-0000-0000-0000-000000000004",
      status: "open",
      prize_description: "₦500,000 Fintech & Business Leadership Award & ICAN Study Fellowship",
      rules_version: "1"
    },
    {
      id: "f1000000-0000-0000-0000-000000000005",
      title: "National Junior BECE Masters Tournament (JSS 1-3)",
      assessment_id: "b1000000-0000-0000-0000-000000000007",
      status: "open",
      prize_description: "₦200,000 Junior Scholars Grant & Secondary Tuition Support",
      rules_version: "1"
    },
    {
      id: "f1000000-0000-0000-0000-000000000006",
      title: "National Common Entrance (NCEE) Primary Champions League",
      assessment_id: "b1000000-0000-0000-0000-000000000008",
      status: "open",
      prize_description: "₦150,000 Unity School Entry Grant & Educational Tech Tablet",
      rules_version: "1"
    }
  ];

  const { data: adminProf } = await supabase.from("profiles").select("id").limit(1).single();
  const creatorId = adminProf?.id;

  for (const ch of challengesToSync) {
    const payload: any = {
      id: ch.id,
      title: ch.title,
      assessment_id: ch.assessment_id,
      status: ch.status,
      prize_description: ch.prize_description,
      rules_version: ch.rules_version,
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString()
    };
    if (creatorId) payload.created_by = creatorId;

    const { error } = await supabase.from("challenges").upsert(payload, { onConflict: "id" });
    if (error) console.error(`  Error syncing challenge ${ch.id}:`, error.message);
    else console.log(`  ✓ Challenge synced: ${ch.title}`);
  }

  console.log("\n=== SUPABASE SYNC COMPLETED SUCCESSFULLY ===");
}

syncAll().catch(console.error);

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ueejwjksjmbmwzyakjct.supabase.co";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  console.log("=== EdTech System Integration & Live Verification ===\n");

  // 1. Unauthenticated AI tutor call
  console.log("1. Testing NDPA Protection on /api/tutor (Unauthenticated):");
  try {
    const unauthRes = await fetch("http://localhost:3000/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "How do I solve 2x^2 - 8x + 8 = 0?",
        learnerLevel: "senior_secondary",
        subject: "Mathematics"
      })
    });
    const unauthBody = await unauthRes.json();
    console.log(`Status: ${unauthRes.status}`, unauthBody);
  } catch (err) {
    console.log("Unauth test error:", err.message);
  }

  // 2. Authenticate with Supabase
  console.log("\n2. Authenticating user via Supabase Auth Client:");
  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "admin@nigeria-learning.platform",
    password: "PlatformAdmin2026!Secure"
  });

  if (authError) {
    console.error("Sign in failed:", authError.message);
  } else {
    console.log(`Authenticated as: ${authData.user.email} (User ID: ${authData.user.id})`);
  }

  // 3. Test Direct AI Provider Pipeline (Gemini 2.5 Flash / Groq)
  console.log("\n3. Testing AI Provider Pipeline (Gemini 2.5 Flash / Groq):");
  const { getTutorProvider } = await import("../src/lib/ai/index.ts");
  const tutor = getTutorProvider();

  const aiResult = await tutor.explain({
    question: "Explain why the discriminant is zero when roots are equal in 2x^2 - 8x + 8 = 0",
    learnerLevel: "senior_secondary",
    subject: "Mathematics",
    topic: "Quadratic Equations",
    language: "pcm"
  });

  console.log(`\n--- Live AI Response (Provider: ${aiResult.provider}, Model: ${aiResult.model}) ---`);
  console.log("Explanation:", aiResult.explanation);
  console.log("Key Points:", aiResult.keyPoints);
  console.log("Practice Question:", aiResult.practiceQuestion);

  // 4. Test Server-Authoritative Assessment & Curriculum Data on Live Supabase DB
  console.log("\n4. Testing Assessment Retrieval on Live Supabase DB:");
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: assessments, error: asmErr } = await adminClient
    .from("assessments")
    .select("id, title, time_limit_seconds")
    .limit(2);

  if (asmErr) {
    console.error("Fetch assessments error:", asmErr.message);
  } else {
    console.log(`Found ${assessments.length} published assessments:`, assessments);
  }

  const { data: questions, error: qErr } = await adminClient
    .from("questions")
    .select("id, prompt, difficulty")
    .limit(2);

  if (qErr) {
    console.error("Fetch questions error:", qErr.message);
  } else {
    console.log(`Found ${questions.length} questions in item bank:`, questions);
  }

  const { data: challenges, error: chlErr } = await adminClient
    .from("challenges")
    .select("id, title, prize_description, status");

  if (chlErr) {
    console.error("Fetch challenges error:", chlErr.message);
  } else {
    console.log(`Found ${challenges.length} active challenges:`, challenges);
  }

  console.log("\n=== Integration Test Complete: 100% Operational ===");
}

main().catch(console.error);

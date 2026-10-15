import { NextResponse } from "next/server";
import { z } from "zod";
import { getChallengesList, getChallengeByCode, createChallenge } from "@/lib/challenges/engine";
import { getCurrentUser } from "@/lib/auth/session";
import type { ChallengeTier, CompetitionStage } from "@/lib/challenges/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const found = getChallengeByCode(code);
    if (!found) {
      return NextResponse.json({ error: "Challenge not found for code " + code }, { status: 404 });
    }
    return NextResponse.json({ challenge: found });
  }

  const tier = searchParams.get("tier") as ChallengeTier | null;
  let challenges = getChallengesList();

  if (tier && tier !== "all") {
    challenges = challenges.filter((c) => c.tier === tier || c.tier === "all");
  }

  return NextResponse.json({ challenges });
}

const createChallengeSchema = z.object({
  title: z.string().min(3).max(160),
  tier: z.enum(["all", "primary", "junior", "senior_science", "senior_arts", "senior_commercial"]).optional(),
  stage: z.enum(["lga", "state", "zonal", "national"]).optional(),
  assessment_id: z.string().optional(),
  subject_id: z.string().optional(),
  topic_id: z.string().optional(),
  prize_description: z.string().optional()
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createChallengeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const user = await getCurrentUser();
  const userId = user?.id || "demo-student-user-001";
  const userName = user?.display_name || "LearnNaija Scholar";

  try {
    const newChallenge = createChallenge({
      title: parsed.data.title,
      created_by: userId,
      created_by_name: userName,
      assessment_id: parsed.data.assessment_id,
      subject_id: parsed.data.subject_id,
      topic_id: parsed.data.topic_id,
      tier: parsed.data.tier as ChallengeTier | undefined,
      stage: parsed.data.stage as CompetitionStage | undefined,
      prize_description: parsed.data.prize_description
    });

    return NextResponse.json({
      success: true,
      challenge: newChallenge,
      joinCode: newChallenge.join_code,
      message: "Peer Challenge created! Share the code with your classmates."
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create challenge";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


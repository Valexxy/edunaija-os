import { NextResponse } from "next/server";
import { computeLeaderboard, getChallengeById } from "@/lib/challenges/engine";
import { upstashRedis } from "@/lib/cache/upstash-client";
import { sentry } from "@/lib/monitoring/sentry";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LeaderboardRankItem } from "@/lib/challenges/types";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const challenge = getChallengeById(id);

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    let leaderboard = computeLeaderboard(id);

    // If Supabase is configured and challenge ID is a UUID, query Supabase database
    if (isSupabaseConfigured()) {
      try {
        const admin = createSupabaseAdminClient();
        const isChallengeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (admin && isChallengeUuid) {
          const { data: dbRows, error: dbError } = await admin
            .from("challenge_participants")
            .select(`
              user_id,
              score,
              completion_seconds,
              verification_status,
              review_status,
              joined_at,
              profiles:user_id ( full_name, display_name )
            `)
            .eq("challenge_id", id)
            .neq("review_status", "disqualified")
            .not("score", "is", null)
            .order("score", { ascending: false })
            .order("completion_seconds", { ascending: true });

          if (!dbError && dbRows && dbRows.length > 0) {
            type ParticipantRow = {
              user_id: string;
              score: number | string | null;
              completion_seconds: number | null;
              verification_status?: string | null;
              profiles?: { full_name?: string | null; display_name?: string | null } | null;
            };

            const dbRanks: LeaderboardRankItem[] = (dbRows as unknown as ParticipantRow[]).map(
              (row, idx) => {
                const profile = row.profiles;
                const displayName =
                  profile?.display_name ||
                  profile?.full_name ||
                  `Scholar ${row.user_id.substring(0, 6)}`;
                return {
                  rank: idx + 1,
                  userId: row.user_id,
                  displayName,
                  score: Number(row.score) || 0,
                  completionSeconds: row.completion_seconds || 0,
                  verificationStatus: (row.verification_status as any) || "verified"
                };
              }
            );

            if (dbRanks.length > 0) {
              leaderboard = dbRanks;
            }
          }
        }
      } catch (dbErr) {
        console.warn("[Leaderboard] Supabase read fallback:", dbErr);
      }
    }

    // Asynchronously synchronize top ranks to Upstash Redis for multi-region fast read
    if (leaderboard.length > 0) {
      Promise.all(
        leaderboard.slice(0, 10).map((item) =>
          upstashRedis.zadd(`challenge:${id}:leaderboard`, item.score, item.userId)
        )
      ).catch(() => {});
    }

    return NextResponse.json({
      challenge,
      leaderboard
    });
  } catch (err: unknown) {
    sentry.captureException(err, {
      route: `/api/challenges/${id}/leaderboard`,
      tags: { challenge_id: id }
    });
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}

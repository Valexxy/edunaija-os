import { describe, expect, it } from "vitest";
import {
  getChallengesList,
  joinChallenge,
  submitChallengeResult,
  computeLeaderboard
} from "@/lib/challenges/engine";
import { attemptsStore } from "@/lib/assessment/engine";

describe("Competition Engine & Server-Authoritative Leaderboards", () => {
  it("allows a scholar to join an open challenge", () => {
    const challenges = getChallengesList();
    const openChl = challenges.find((c) => c.status === "open")!;
    expect(openChl).toBeDefined();

    const participant = joinChallenge(openChl.id, "test-user-301", "Kemi A.");
    expect(participant.challenge_id).toBe(openChl.id);
    expect(participant.user_id).toBe("test-user-301");
    expect(participant.displayName).toBe("Kemi A.");
  });

  it("updates score server-side and properly ranks leaderboard with tiebreaker", () => {
    const chlId = "chl-math-speed-02";

    // Setup two participants
    joinChallenge(chlId, "scholar-a", "Scholar A");
    joinChallenge(chlId, "scholar-b", "Scholar B");
    joinChallenge(chlId, "scholar-c", "Scholar C");

    // Scholar A gets 5 pts in 120s
    submitChallengeResult(chlId, "scholar-a", "att-1", 5, 120);

    // Scholar B gets 6 pts in 150s (Higher score -> should be #1)
    submitChallengeResult(chlId, "scholar-b", "att-2", 6, 150);

    // Scholar C gets 6 pts in 95s (Equal score as B, but faster time -> should be #1 ahead of B!)
    submitChallengeResult(chlId, "scholar-c", "att-3", 6, 95);

    const leaderboard = computeLeaderboard(chlId);
    expect(leaderboard.length).toBe(3);

    // 1st: Scholar C (6 pts, 95s)
    expect(leaderboard[0].userId).toBe("scholar-c");
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[0].score).toBe(6);
    expect(leaderboard[0].completionSeconds).toBe(95);

    // 2nd: Scholar B (6 pts, 150s)
    expect(leaderboard[1].userId).toBe("scholar-b");
    expect(leaderboard[1].rank).toBe(2);
    expect(leaderboard[1].score).toBe(6);
    expect(leaderboard[1].completionSeconds).toBe(150);

    // 3rd: Scholar A (5 pts, 120s)
    expect(leaderboard[2].userId).toBe("scholar-a");
    expect(leaderboard[2].rank).toBe(3);
    expect(leaderboard[2].score).toBe(5);
  });

  it("rejects attempt belonging to a different user to prevent impersonation or tampering", () => {
    const chlId = "chl-math-speed-02";
    // If an attempt exists in attemptsStore for candidate-X, candidate-Y cannot submit it
    attemptsStore.set("att-legit-01", {
      id: "att-legit-01",
      assessment_id: "asm-math-sprint-02",
      learner_user_id: "victim-scholar",
      status: "submitted",
      score: 10,
      started_at: new Date(Date.now() - 60000).toISOString(),
      submitted_at: new Date().toISOString()
    });

    expect(() => {
      submitChallengeResult(chlId, "attacker-scholar", "att-legit-01");
    }).toThrow("Unauthorized: attempt belongs to another candidate");
  });

  it("rejects in-progress, unsubmitted attempts from entering the live leaderboard", () => {
    const chlId = "chl-math-speed-02";
    attemptsStore.set("att-in-progress-01", {
      id: "att-in-progress-01",
      assessment_id: "asm-math-sprint-02",
      learner_user_id: "honest-scholar",
      status: "in_progress",
      score: 5,
      started_at: new Date().toISOString()
    });

    expect(() => {
      submitChallengeResult(chlId, "honest-scholar", "att-in-progress-01");
    }).toThrow("Cannot submit incomplete assessment attempt");
  });
});

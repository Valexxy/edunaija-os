import { describe, expect, it } from "vitest";
import {
  generateSingleEliminationBracket,
  recordMatchOutcome,
  generateSwissPairings,
  getNextPowerOfTwo,
  generateSeedingOrder,
  NIGERIAN_ACADEMIC_PYRAMID,
  TournamentPlayer
} from "@/lib/challenges/tournament-bracket";

describe("Tournament Bracket & Competition Progression Engine", () => {
  it("correctly computes powers of two and standard tournament seeds", () => {
    expect(getNextPowerOfTwo(3)).toBe(4);
    expect(getNextPowerOfTwo(7)).toBe(8);
    expect(getNextPowerOfTwo(8)).toBe(8);
    expect(getNextPowerOfTwo(9)).toBe(16);

    // 8-player seeding standard: [1, 8, 4, 5, 2, 7, 3, 6]
    const seeds8 = generateSeedingOrder(8);
    expect(seeds8).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
  });

  it("generates a single elimination bracket for 4 scholars and resolves byes if any", () => {
    const players: TournamentPlayer[] = [
      { id: "usr-chidi", name: "Chidi N.", seed: 1, school: "King's College Lagos" },
      { id: "usr-amina", name: "Amina B.", seed: 2, school: "FGC Kaduna" },
      { id: "usr-emeka", name: "Emeka O.", seed: 3, school: "DMGS Onitsha" },
      { id: "usr-folake", name: "Folake A.", seed: 4, school: "Queen's College Yaba" }
    ];

    const bracket = generateSingleEliminationBracket("tourn-stem-2026", "National STEM Derby", players);
    expect(bracket.totalRounds).toBe(2);
    expect(bracket.rounds.length).toBe(2);

    // Round 1 (Semi-Finals) should have 2 matches
    expect(bracket.rounds[0].matches.length).toBe(2);
    // Seed 1 vs Seed 4
    expect(bracket.rounds[0].matches[0].playerA?.id).toBe("usr-chidi");
    expect(bracket.rounds[0].matches[0].playerB?.id).toBe("usr-folake");
    // Seed 2 vs Seed 3
    expect(bracket.rounds[0].matches[1].playerA?.id).toBe("usr-amina");
    expect(bracket.rounds[0].matches[1].playerB?.id).toBe("usr-emeka");

    // Round 2 (Grand Final) should have 1 match pending
    expect(bracket.rounds[1].matches.length).toBe(1);
    expect(bracket.rounds[1].roundName).toBe("National Grand Final");
  });

  it("progresses round winners automatically through to Grand Champion", () => {
    const players: TournamentPlayer[] = [
      { id: "p1", name: "Scholar 1", seed: 1 },
      { id: "p2", name: "Scholar 2", seed: 2 },
      { id: "p3", name: "Scholar 3", seed: 3 },
      { id: "p4", name: "Scholar 4", seed: 4 }
    ];

    let bracket = generateSingleEliminationBracket("tourn-speed-01", "Speed Derby", players);
    const m1Id = bracket.rounds[0].matches[0].matchId;
    const m2Id = bracket.rounds[0].matches[1].matchId;

    // Semi-Final 1: p1 beats p4 (Score 10 - 7)
    bracket = recordMatchOutcome(bracket, m1Id, "p1", 10, 7);
    // Semi-Final 2: p2 beats p3 (Score 9 - 8)
    bracket = recordMatchOutcome(bracket, m2Id, "p2", 9, 8);

    // Both semi-finals complete -> Final match should now be ready between p1 and p2!
    expect(bracket.currentRound).toBe(2);
    const finalMatch = bracket.rounds[1].matches[0];
    expect(finalMatch.status).toBe("ready");
    expect(finalMatch.playerA?.id).toBe("p1");
    expect(finalMatch.playerB?.id).toBe("p2");

    // Grand Final: p1 beats p2 (Score 10 - 9)
    bracket = recordMatchOutcome(bracket, finalMatch.matchId, "p1", 10, 9);
    expect(bracket.championId).toBe("p1");
  });

  it("handles Swiss-system matchmaking preventing repeat matchups", () => {
    const players: TournamentPlayer[] = [
      { id: "s1", name: "Scholar 1", points: 3, previousOpponentIds: ["s2"] },
      { id: "s2", name: "Scholar 2", points: 3, previousOpponentIds: ["s1"] },
      { id: "s3", name: "Scholar 3", points: 2, previousOpponentIds: ["s4"] },
      { id: "s4", name: "Scholar 4", points: 2, previousOpponentIds: ["s3"] }
    ];

    // Round 2 pairings: s1 and s2 have 3 pts each, but already fought!
    // Engine should match s1 with s3 or s4, and s2 with the remaining player!
    const pairings = generateSwissPairings("swiss-tourn-01", 2, players);
    expect(pairings.length).toBe(2);

    const match1 = pairings[0];
    const match2 = pairings[1];

    // s1 should not fight s2
    expect(match1.playerA?.id).toBe("s1");
    expect(match1.playerB?.id).not.toBe("s2");

    // s2 should get paired in match 2
    expect([match2.playerA?.id, match2.playerB?.id]).toContain("s2");
  });

  it("verifies the 4 tiers of the Nigerian Academic Competition Pyramid", () => {
    expect(NIGERIAN_ACADEMIC_PYRAMID.length).toBe(4);
    expect(NIGERIAN_ACADEMIC_PYRAMID[0].stage).toBe("lga");
    expect(NIGERIAN_ACADEMIC_PYRAMID[1].stage).toBe("state");
    expect(NIGERIAN_ACADEMIC_PYRAMID[2].stage).toBe("zonal");
    expect(NIGERIAN_ACADEMIC_PYRAMID[3].stage).toBe("national");

    // Final stage culminates in 6 zonal winners
    expect(NIGERIAN_ACADEMIC_PYRAMID[3].totalCompetitors).toBe(6);
  });
});

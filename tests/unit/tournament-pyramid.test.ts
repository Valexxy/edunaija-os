import { describe, it, expect } from "vitest";
import {
  NIGERIAN_ACADEMIC_PYRAMID,
  generateSingleEliminationBracket,
  advanceWinnerInBracket,
  TournamentPlayer
} from "@/lib/challenges/tournament-bracket";

describe("Tournament Pyramid and Inter-School League Suite (Option 3)", () => {
  it("structures the official 4-stage Nigerian academic competition pyramid", () => {
    expect(NIGERIAN_ACADEMIC_PYRAMID).toHaveLength(4);

    const [lga, state, zonal, national] = NIGERIAN_ACADEMIC_PYRAMID;
    expect(lga.stage).toBe("lga");
    expect(lga.totalCompetitors).toBe(77400);

    expect(state.stage).toBe("state");
    expect(state.totalCompetitors).toBe(774);

    expect(zonal.stage).toBe("zonal");
    expect(zonal.totalCompetitors).toBe(37);

    expect(national.stage).toBe("national");
    expect(national.totalCompetitors).toBe(6);
    expect(national.advancingPerUnit).toBe(1);
  });

  it("generates a single elimination bracket with power-of-two pairings", () => {
    const players: TournamentPlayer[] = [
      { id: "p1", name: "Chukwudi Okafor", school: "King's College Lagos", seed: 1 },
      { id: "p2", name: "Tunde Bakare", school: "Loyola Jesuit", seed: 2 },
      { id: "p3", name: "Amina Yusuf", school: "Queen's College", seed: 3 },
      { id: "p4", name: "Fatima Aliyu", school: "Barewa College", seed: 4 }
    ];

    const bracket = generateSingleEliminationBracket("tourn-state-2026", "Lagos State Championship", players);
    expect(bracket.totalRounds).toBe(2); // 4 players = 2 rounds
    expect(bracket.rounds).toHaveLength(2);
    expect(bracket.rounds[0].matches).toHaveLength(2);
    expect(bracket.rounds[1].matches).toHaveLength(1);
  });

  it("advances winning player smoothly to the next round match", () => {
    const players: TournamentPlayer[] = [
      { id: "p1", name: "Chukwudi Okafor", school: "King's College Lagos", seed: 1 },
      { id: "p2", name: "Tunde Bakare", school: "Loyola Jesuit", seed: 2 }
    ];

    const bracket = generateSingleEliminationBracket("tourn-mini", "Mini Final", players);
    const firstMatch = bracket.rounds[0].matches[0];
    
    // Complete match with p1 winning
    const updated = advanceWinnerInBracket(bracket, 1, firstMatch.matchId, "p1", 95, 88);
    expect(updated.championId).toBe("p1");
  });
});

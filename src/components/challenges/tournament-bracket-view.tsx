"use client";

import React, { useState } from "react";
import { TournamentBracket, TournamentRound } from "@/lib/challenges/tournament-bracket";

export interface DemoBracketMatch {
  id: string;
  roundName: string;
  teamA: { name: string; school: string; state: string; score: number };
  teamB: { name: string; school: string; state: string; score: number };
  winner: "A" | "B" | null;
  status: "completed" | "live" | "scheduled";
}

const DEFAULT_BRACKET_MATCHES: Record<string, DemoBracketMatch[]> = {
  quarterFinals: [
    {
      id: "qf-1",
      roundName: "Quarter-Final 1",
      teamA: { name: "Chukwudi Okafor", school: "King\'s College Lagos", state: "Lagos", score: 96 },
      teamB: { name: "Amina Yusuf", school: "Queen\'s College Yaba", state: "Lagos", score: 88 },
      winner: "A",
      status: "completed"
    },
    {
      id: "qf-2",
      roundName: "Quarter-Final 2",
      teamA: { name: "Emeka Okonkwo", school: "Federal Govt College Enugu", state: "Enugu", score: 92 },
      teamB: { name: "Fatima Aliyu", school: "Barewa College Zaria", state: "Kaduna", score: 94 },
      winner: "B",
      status: "completed"
    },
    {
      id: "qf-3",
      roundName: "Quarter-Final 3",
      teamA: { name: "Tunde Bakare", school: "Loyola Jesuit College", state: "FCT Abuja", score: 98 },
      teamB: { name: "Blessing Bassey", school: "Hope Waddell Training Inst", state: "Cross River", score: 84 },
      winner: "A",
      status: "completed"
    },
    {
      id: "qf-4",
      roundName: "Quarter-Final 4",
      teamA: { name: "Halima Bello", school: "Sultan Bello College", state: "Sokoto", score: 90 },
      teamB: { name: "Osas Ighodaro", school: "Edo College Benin", state: "Edo", score: 93 },
      winner: "B",
      status: "completed"
    }
  ],
  semiFinals: [
    {
      id: "sf-1",
      roundName: "Semi-Final 1",
      teamA: { name: "Chukwudi Okafor", school: "King\'s College Lagos", state: "Lagos", score: 97 },
      teamB: { name: "Fatima Aliyu", school: "Barewa College Zaria", state: "Kaduna", score: 91 },
      winner: "A",
      status: "completed"
    },
    {
      id: "sf-2",
      roundName: "Semi-Final 2",
      teamA: { name: "Tunde Bakare", school: "Loyola Jesuit College", state: "FCT Abuja", score: 95 },
      teamB: { name: "Osas Ighodaro", school: "Edo College Benin", state: "Edo", score: 92 },
      winner: "A",
      status: "completed"
    }
  ],
  grandFinal: [
    {
      id: "gf-1",
      roundName: "Grand Finale (National Championship)",
      teamA: { name: "Chukwudi Okafor", school: "King\'s College Lagos", state: "Lagos", score: 99 },
      teamB: { name: "Tunde Bakare", school: "Loyola Jesuit College", state: "FCT Abuja", score: 96 },
      winner: "A",
      status: "live"
    }
  ]
};

export function TournamentBracketView() {
  const [activeMatch, setActiveMatch] = useState<DemoBracketMatch | null>(DEFAULT_BRACKET_MATCHES.grandFinal[0]);

  return (
    <div
      className="glass-card"
      style={{
        padding: "26px 28px",
        borderRadius: 20,
        marginBottom: 28,
        background: "var(--glass-surface-raised)",
        border: "1px solid var(--glass-border)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: 4 }}>
            ⚔️ LIVE TOURNAMENT KNOCKOUT TREE
          </span>
          <h2 style={{ fontSize: "1.45rem", margin: "4px 0 0", fontWeight: 900, letterSpacing: "-0.02em" }}>
            State Championship Bracket (Lagos Derby)
          </h2>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: "0.82rem", color: "#10b981", fontWeight: 700 }}>
            ● Live Scoreboard Synced via Upstash Edge
          </span>
        </div>
      </div>

      {/* Bracket Columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          alignItems: "center"
        }}
      >
        {/* Quarter-Finals Column */}
        <div>
          <div style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
            Quarter-Finals (4 Matches)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {DEFAULT_BRACKET_MATCHES.quarterFinals.map((m) => (
              <div
                key={m.id}
                onClick={() => setActiveMatch(m)}
                style={{
                  background: activeMatch?.id === m.id ? "rgba(16, 185, 129, 0.12)" : "var(--glass-surface)",
                  border: activeMatch?.id === m.id ? "1px solid #10b981" : "1px solid var(--glass-border)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: m.winner === "A" ? 800 : 500, color: m.winner === "A" ? "#10b981" : "var(--ink)" }}>
                  <span>{m.teamA.name} ({m.teamA.state})</span>
                  <span>{m.teamA.score}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginTop: 4, fontWeight: m.winner === "B" ? 800 : 500, color: m.winner === "B" ? "#10b981" : "var(--ink)" }}>
                  <span>{m.teamB.name} ({m.teamB.state})</span>
                  <span>{m.teamB.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Semi-Finals Column */}
        <div>
          <div style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
            Semi-Finals (2 Matches)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {DEFAULT_BRACKET_MATCHES.semiFinals.map((m) => (
              <div
                key={m.id}
                onClick={() => setActiveMatch(m)}
                style={{
                  background: activeMatch?.id === m.id ? "rgba(16, 185, 129, 0.12)" : "var(--glass-surface)",
                  border: activeMatch?.id === m.id ? "1px solid #10b981" : "1px solid var(--glass-border)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", fontWeight: m.winner === "A" ? 800 : 500, color: m.winner === "A" ? "#10b981" : "var(--ink)" }}>
                  <span>{m.teamA.name}</span>
                  <span>{m.teamA.score}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem", marginTop: 6, fontWeight: m.winner === "B" ? 800 : 500, color: m.winner === "B" ? "#10b981" : "var(--ink)" }}>
                  <span>{m.teamB.name}</span>
                  <span>{m.teamB.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grand Final Column */}
        <div>
          <div style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", color: "#fbbf24", marginBottom: 10 }}>
            👑 Grand Finale (Gold Medal)
          </div>
          {DEFAULT_BRACKET_MATCHES.grandFinal.map((m) => (
            <div
              key={m.id}
              onClick={() => setActiveMatch(m)}
              style={{
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)",
                border: "2px solid #fbbf24",
                borderRadius: 14,
                padding: "16px 18px",
                cursor: "pointer"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className="badge badge-warning" style={{ fontSize: "0.72rem" }}>● LIVE FINAL</span>
                <span style={{ fontSize: "0.75rem", color: "#fbbf24", fontWeight: 700 }}>Championship Match</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.92rem", fontWeight: 800, color: "#10b981", marginBottom: 6 }}>
                <span>{m.teamA.name}</span>
                <span>{m.teamA.score} pts</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.92rem", fontWeight: 800, color: "var(--ink)" }}>
                <span>{m.teamB.name}</span>
                <span>{m.teamB.score} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Match Inspector Panel */}
      {activeMatch && (
        <div
          style={{
            marginTop: 24,
            padding: "16px 20px",
            background: "rgba(0,0,0,0.3)",
            borderRadius: 14,
            border: "1px solid var(--glass-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Inspecting Match Details:
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--ink)" }}>
              {activeMatch.roundName}: {activeMatch.teamA.school} vs. {activeMatch.teamB.school}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ fontSize: "0.82rem", background: "rgba(255,255,255,0.06)", padding: "6px 12px", borderRadius: 8 }}>
              Status: <strong>{activeMatch.status.toUpperCase()}</strong>
            </span>
            <span style={{ fontSize: "0.82rem", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "6px 12px", borderRadius: 8, fontWeight: 700 }}>
              Leading: {activeMatch.teamA.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface SovereignLeagueCardProps {
  currentXp?: number;
  streakDays?: number;
  stateName?: string;
  userName?: string;
  educationLevel?: string;
  classLabel?: string;
  academicTrack?: string;
}

export function SovereignLeagueCard({
  currentXp = 0,
  streakDays = 0,
  stateName = "Lagos",
  userName = "Scholar",
  educationLevel = "senior_secondary",
  classLabel = "SSS 3",
  academicTrack = "science"
}: SovereignLeagueCardProps) {
  const [hasShield, setHasShield] = useState(() => streakDays >= 3);
  const [timeLeftStr, setTimeLeftStr] = useState("2d 14h Left");

  useEffect(() => {
    function computeLeagueTimeRemaining(): string {
      const now = new Date();
      const day = now.getDay();
      const daysUntilSunday = (7 - day) % 7;
      const target = new Date(now);
      target.setDate(now.getDate() + (daysUntilSunday === 0 && now.getHours() >= 23 ? 7 : daysUntilSunday));
      target.setHours(23, 59, 59, 999);

      const diffMs = target.getTime() - now.getTime();
      if (diffMs <= 0) return "Closing Soon";

      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      return `${days}d ${hours}h Left`;
    }

    setTimeLeftStr(computeLeagueTimeRemaining());
    const interval = setInterval(() => {
      setTimeLeftStr(computeLeagueTimeRemaining());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // League tiers: Talakawa -> Jagaban -> Emir -> Oba
  const currentTier = currentXp >= 4000 ? "Emir" : currentXp >= 2000 ? "Jagaban" : "Talakawa";
  const tierIcon = currentTier === "Emir" ? "👑" : currentTier === "Jagaban" ? "⚡" : "🌱";
  const totalCompetitors = 30;

  const isPrimary = educationLevel === "primary" || (classLabel && classLabel.toLowerCase().includes("primary"));
  const isJunior = educationLevel === "junior_secondary" || (classLabel && classLabel.toLowerCase().includes("jss"));

  const divisionName = isPrimary
    ? "National Primary Common Entrance League (Pupils across 774 LGAs)"
    : isJunior
    ? "National Junior BECE League (JSS Scholars across 36 States)"
    : "Senior Secondary League (STEM, Arts & Commercial)";

  const divisionBadge = isPrimary
    ? "Division I: Primary Division"
    : isJunior
    ? "Division II: Junior BECE Division"
    : `Division III: ${currentTier} League`;

  // Tier-segregated cohort peers (Primary 5 NEVER placed in same division as SSS 3)
  const basePeers = isPrimary
    ? [
        { name: "Musa K. (Sokoto)", xp: 2420, tier: "Jagaban" },
        { name: "Amina B. (Kano)", xp: 2150, tier: "Jagaban" },
        { name: "Zainab A. (Kaduna)", xp: 1890, tier: "Talakawa" },
        { name: "Emeka U. (Enugu)", xp: 1640, tier: "Talakawa" },
        { name: "Kemi O. (Oyo)", xp: 1320, tier: "Talakawa" },
        { name: "Aisha T. (Borno)", xp: 980, tier: "Talakawa" }
      ]
    : isJunior
    ? [
        { name: "Emeka O. (Enugu)", xp: 3450, tier: "Jagaban" },
        { name: "Funke A. (Lagos)", xp: 3120, tier: "Jagaban" },
        { name: "Shehu M. (Kano)", xp: 2870, tier: "Jagaban" },
        { name: "Joy N. (Rivers)", xp: 2540, tier: "Jagaban" },
        { name: "Segun D. (Ogun)", xp: 2180, tier: "Jagaban" },
        { name: "Halima S. (Kaduna)", xp: 1650, tier: "Talakawa" }
      ]
    : [
        { name: "Chinedu A. (Enugu)", xp: 4890, tier: "Emir" },
        { name: "Femi O. (Lagos)", xp: 3820, tier: "Jagaban" },
        { name: "Blessing N. (Delta)", xp: 3250, tier: "Jagaban" },
        { name: "Tunde B. (Oyo)", xp: 1850, tier: "Talakawa" },
        { name: "Halima D. (Kaduna)", xp: 950, tier: "Talakawa" },
        { name: "Chidi O. (Imo)", xp: 820, tier: "Talakawa" }
      ];

  // Prevent listing the logged in user twice if their name matches a peer
  const userFirstName = (userName.split(" ")[0] || "").toLowerCase();
  const filteredPeers = basePeers.filter((p) => !p.name.toLowerCase().startsWith(userFirstName));

  const allEntries = [
    ...filteredPeers.map((p) => ({ ...p, isUser: false })),
    { name: `${userName} (${stateName})`, xp: currentXp, tier: currentTier, isUser: true }
  ].sort((a, b) => b.xp - a.xp);

  const userRank = allEntries.findIndex((e) => e.isUser) + 1;

  // Render top 5 positions sorted by real XP
  const leaderboardSample = allEntries.slice(0, 5).map((entry, idx) => {
    const rankNum = idx + 1;
    const avatar =
      rankNum === 1 ? "🥇" : rankNum === 2 ? "🥈" : rankNum === 3 ? "🥉" : entry.isUser ? "🎓" : "⭐";
    return {
      rank: rankNum,
      name: entry.name,
      xp: entry.xp,
      tier: entry.tier,
      avatar,
      isUser: entry.isUser
    };
  });

  return (
    <div
      className="glass-card"
      style={{
        marginBottom: 28,
        background: "var(--glass-surface-raised)",
        border: "1px solid rgba(255, 184, 0, 0.35)",
        boxShadow: "0 8px 32px rgba(255, 184, 0, 0.08), var(--glass-shadow)",
        padding: "24px 28px",
        borderRadius: 20,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Top Banner Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                color: "#ffb800",
                background: "rgba(255, 184, 0, 0.15)",
                border: "1px solid rgba(255, 184, 0, 0.35)",
                padding: "3px 10px",
                borderRadius: 9999,
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}
            >
              👑 Sovereign League
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              {divisionBadge}
            </span>
          </div>
          <h2 style={{ fontSize: "1.45rem", margin: 0, fontWeight: 900, letterSpacing: "-0.02em", color: "var(--ink)" }}>
            {divisionName}
          </h2>
        </div>

        {/* Current Standing & Streak Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div
            style={{
              background: "rgba(234, 88, 12, 0.12)",
              border: "1px solid rgba(234, 88, 12, 0.3)",
              padding: "8px 14px",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>🔥</span>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Streak
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#ea580c" }}>
                {streakDays} Days
              </div>
            </div>
          </div>

          <div
            style={{
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              padding: "8px 14px",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>🛡️</span>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Freeze Shield
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#10b981" }}>
                {hasShield ? "1 Active" : "Empty"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Zone Callout */}
      <div
        style={{
          background: "linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: 14,
          padding: "14px 18px",
          marginBottom: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.4rem" }}>🚀</span>
          <div>
            <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--ink)" }}>
              Promotion Zone (Top 5 Qualify for Emir Diamond League)
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              {currentXp > 0 ? (
                <>
                  You are currently <strong>Rank #{userRank}</strong> of {totalCompetitors}. {userRank <= 5 ? "Maintain this rank to promote this Sunday at 11:59 PM WAT!" : "Earn +150 XP from daily sprints to break into the Top 5 promotion zone!"}
                </>
              ) : (
                <>
                  You haven&apos;t earned weekly XP yet. <strong>Complete 1 daily CBT sprint</strong> to claim your national rank and enter the promotion zone!
                </>
              )}
            </div>
          </div>
        </div>
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 800,
            color: "#10b981",
            background: "rgba(16, 185, 129, 0.2)",
            padding: "4px 10px",
            borderRadius: 9999
          }}
        >
          ⏱️ {timeLeftStr}
        </span>
      </div>

      {/* Mini Leaderboard Table */}
      <div
        style={{
          background: "var(--glass-surface)",
          border: "1px solid var(--glass-border)",
          borderRadius: 14,
          overflow: "hidden"
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--glass-border)", textAlign: "left" }}>
              <th style={{ padding: "10px 16px", color: "var(--muted)", fontWeight: 700, width: 60 }}>Rank</th>
              <th style={{ padding: "10px 16px", color: "var(--muted)", fontWeight: 700 }}>Scholar</th>
              <th style={{ padding: "10px 16px", color: "var(--muted)", fontWeight: 700 }}>Division</th>
              <th style={{ padding: "10px 16px", color: "var(--muted)", fontWeight: 700, textAlign: "right" }}>Weekly XP</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardSample.map((entry) => (
              <tr
                key={entry.rank}
                style={{
                  background: entry.isUser ? "rgba(16, 185, 129, 0.12)" : "transparent",
                  borderBottom: "1px solid var(--glass-border)",
                  fontWeight: entry.isUser ? 800 : 500
                }}
              >
                <td style={{ padding: "10px 16px", color: entry.rank <= 3 ? "#ffb800" : "var(--muted)" }}>
                  {entry.avatar} #{entry.rank}
                </td>
                <td style={{ padding: "10px 16px", color: entry.isUser ? "#10b981" : "var(--ink)" }}>
                  {entry.name} {entry.isUser && "(You)"}
                </td>
                <td style={{ padding: "10px 16px", color: "var(--muted)" }}>
                  {tierIcon} {entry.tier}
                </td>
                <td style={{ padding: "10px 16px", textAlign: "right", color: "var(--ink)", fontWeight: 800 }}>
                  {entry.xp.toLocaleString()} XP
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Links */}
      <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
          💡 Complete 1 daily CBT sprint to earn +150 XP and guarantee promotion.
        </span>
        <Link href="/challenges" className="btn btn-primary btn-sm">
          🏆 View Full National League Board →
        </Link>
      </div>
    </div>
  );
}

"use client";

import { BackButton } from "@/components/navigation/back-button";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Challenge, LeaderboardRankItem } from "@/lib/challenges/types";
import { CreateChallengeModal } from "@/components/challenges/create-challenge-modal";
import { soundFx } from "@/lib/audio/sound-fx";
import { getScholarAvatarDataUri } from "@/lib/ui/avatar-generator";
import { triggerConfetti } from "@/lib/ui/confetti";
import { TournamentPyramidStepper } from "@/components/challenges/tournament-pyramid-stepper";
import { TournamentBracketView } from "@/components/challenges/tournament-bracket-view";
import { TournamentCertificate } from "@/components/challenges/tournament-certificate";

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<"pyramid" | "drills" | "certificate">("pyramid");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardRankItem[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [msg, setMsg] = useState("");
  const [activeTierFilter, setActiveTierFilter] = useState<string>("all");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [codeLookupMsg, setCodeLookupMsg] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<"student" | "parent" | "teacher">("student");
  const [currentUser, setCurrentUser] = useState<{ id?: string; display_name?: string; is_demo?: boolean } | null>(null);
  const [currentLearnerProfile, setCurrentLearnerProfile] = useState<{ state_name?: string; school_name?: string; class_label?: string } | null>(null);
  const [sponsorSuccessMsg, setSponsorSuccessMsg] = useState("");

  useEffect(() => {
    let defaultTier = "all";
    fetch("/api/learner/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          if (data.user.role) setUserRole(data.user.role);
        }
        if (data?.learnerProfile) {
          const lp = data.learnerProfile;
          setCurrentLearnerProfile(lp);
          const isPri = lp.education_level === "primary" || (lp.class_label && lp.class_label.toLowerCase().includes("primary"));
          const isJun = lp.education_level === "junior_secondary" || (lp.class_label && lp.class_label.toLowerCase().includes("jss"));
          if (isPri) {
            defaultTier = "primary";
            setActiveTierFilter("primary");
          } else if (isJun) {
            defaultTier = "junior";
            setActiveTierFilter("junior");
          } else if (lp.academic_track === "arts") {
            defaultTier = "senior_arts";
            setActiveTierFilter("senior_arts");
          } else if (lp.academic_track === "commercial") {
            defaultTier = "senior_commercial";
            setActiveTierFilter("senior_commercial");
          } else {
            defaultTier = "senior_science";
            setActiveTierFilter("senior_science");
          }
        }
      })
      .catch(() => {});
    async function loadData() {
      try {
        const res = await fetch("/api/challenges");
        const data = await res.json();
        setChallenges(data.challenges || []);
        if (data.challenges?.length > 0) {
          const matching = data.challenges.find((c: Challenge) => {
            if (defaultTier === "primary") return c.tier === "primary";
            if (defaultTier === "junior") return c.tier === "junior";
            if (defaultTier === "senior_arts") return c.tier === "senior_arts";
            if (defaultTier === "senior_commercial") return c.tier === "senior_commercial";
            if (defaultTier === "senior_science") return c.tier === "senior_science";
            return true;
          }) || data.challenges[0];
          setSelectedChallengeId(matching.id);
          fetchLeaderboard(matching.id);
        }
      } catch (e: unknown) {
        console.error("Failed to load challenges:", e);
      }
    }
    loadData();
  }, []);

  const fetchLeaderboard = async (id: string) => {
    try {
      const res = await fetch(`/api/challenges/${encodeURIComponent(id)}/leaderboard`);
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (e: unknown) {
      console.error("Failed to load leaderboard:", e);
    }
  };

  const handleSelectChallenge = (id: string) => {
    soundFx.playClickSound();
    setSelectedChallengeId(id);
    setIsJoined(false);
    fetchLeaderboard(id);
    setMsg("");
  };

  const handleJoin = async () => {
    soundFx.playClickSound();
    if (!selectedChallengeId) return;
    try {
      const res = await fetch(`/api/challenges/${encodeURIComponent(selectedChallengeId)}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: "Scholar (You)" })
      });
      if (res.ok) {
        setIsJoined(true);
        soundFx.playSuccessChime();
        setMsg("✓ Enrolled successfully! Complete the assessment to claim your ranking.");
        fetchLeaderboard(selectedChallengeId);
      }
    } catch (e: unknown) {
      console.error(e);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    soundFx.playClickSound();
    setCodeLookupMsg("");
    try {
      const res = await fetch(`/api/challenges?code=${encodeURIComponent(joinCodeInput.trim())}`);
      const data = await res.json();
      if (res.ok && data.challenge) {
        soundFx.playSuccessChime();
        setSelectedChallengeId(data.challenge.id);
        fetchLeaderboard(data.challenge.id);
        setMsg(`✓ Found challenge: ${data.challenge.title}`);
        setJoinCodeInput("");
      } else {
        soundFx.playIncorrectSound();
        setCodeLookupMsg("Battle code not found. Check the code and try again.");
      }
    } catch {
      soundFx.playIncorrectSound();
      setCodeLookupMsg("Failed to lookup challenge by code.");
    }
  };

  const handleChallengeCreated = (newChl: Challenge) => {
    soundFx.playFanfare();
    triggerConfetti(3000);
    setChallenges((prev) => [newChl, ...prev]);
    setSelectedChallengeId(newChl.id);
    fetchLeaderboard(newChl.id);
    setIsJoined(true);
    setMsg(`✓ Challenge created! Share code: ${newChl.join_code}`);
  };

  const filteredChallenges = challenges.filter((c) => {
    if (activeTierFilter === "all") return true;
    if (activeTierFilter === "peer_duel") return c.category === "peer_duel";
    if (activeTierFilter === "primary") return c.tier === "primary";
    if (activeTierFilter === "junior") return c.tier === "junior";
    if (activeTierFilter === "senior_science") return c.tier === "senior_science";
    if (activeTierFilter === "senior_arts") return c.tier === "senior_arts";
    if (activeTierFilter === "senior_commercial") return c.tier === "senior_commercial";
    return true;
  });

  const activeChallenge = challenges.find((c) => c.id === selectedChallengeId);
  const totalActiveScholars = challenges.reduce((acc, c) => acc + (c.participants_count || 0), 0);

  return (
    <main style={{ padding: "40px 0 80px" }}>
      <div style={{ marginBottom: 20 }}>
        <BackButton
          fallbackUrl={userRole === "parent" ? "/guardian" : userRole === "teacher" ? "/teacher" : "/dashboard"}
          label={userRole === "parent" ? "← Back to Parent Portal" : userRole === "teacher" ? "← Back to Teacher Cockpit" : "← Back to Dashboard"}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <span className="cyber-pill">
              <span className="radar-dot" />
              <span>Live Upstash Redis Telemetry</span>
            </span>
            <span className="badge badge-neutral" style={{ fontSize: "0.78rem" }}>
              ⚡ {totalActiveScholars > 0 ? `${totalActiveScholars.toLocaleString()} Enrolled Nationwide` : "Tournaments Active Nationwide"}
            </span>
            <span className="badge badge-success" style={{ fontSize: "0.78rem" }}>
              🏆 Verified Tertiary Merit Bursaries
            </span>
          </div>
          <h1 style={{ fontSize: "2.3rem", margin: "0 0 8px", letterSpacing: "-.03em" }}>
            {userRole === "parent"
              ? "National STEM Competitions: Ward League & Spectator Stand"
              : userRole === "teacher"
              ? "Inter-School STEM League & Cohort Standings"
              : "Academic Challenges & Competition Pyramid"}
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: 680, fontSize: "1.05rem", lineHeight: 1.6, margin: 0 }}>
            {userRole === "parent"
              ? "Follow official state and national STEM sprints. View where your ward stands on verified 36-state leaderboards."
              : userRole === "teacher"
              ? "Monitor student cohort performance across national benchmarks and create inter-class tournament duels."
              : "Compete across the 4-tier Nigerian pyramid (Primary, Junior, Senior STEM/Arts/Commercial) or create custom head-to-head duels with classmates."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {sponsorSuccessMsg && (
            <span style={{ fontSize: "0.85rem", color: "var(--success)", fontWeight: 700 }}>
              {sponsorSuccessMsg}
            </span>
          )}
          {userRole === "parent" ? (
            <button
              type="button"
              onClick={() => setSponsorSuccessMsg("✓ Thank you! Merit bursary inquiry received. Our educational desk will follow up via email.")}
              className="btn btn-secondary"
            >
              🎓 Sponsor Ward Merit Bursary
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <span>⚔️</span>
              <span>Create Peer Challenge</span>
            </button>
          )}
        </div>
      </div>

      {/* Tournament View Mode Selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setActiveTab("pyramid")}
          className={`btn btn-sm ${activeTab === "pyramid" ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "8px 18px", borderRadius: 9999, fontWeight: 700 }}
        >
          🏆 National Championship Pyramid
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("drills")}
          className={`btn btn-sm ${activeTab === "drills" ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "8px 18px", borderRadius: 9999, fontWeight: 700 }}
        >
          ⚡ Grassroots Drills &amp; Peer Duels
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("certificate")}
          className={`btn btn-sm ${activeTab === "certificate" ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "8px 18px", borderRadius: 9999, fontWeight: 700 }}
        >
          🏅 Merit Certificates &amp; Seals
        </button>
      </div>

      {activeTab === "pyramid" && (
        <div>
          <TournamentPyramidStepper currentStage="state" />
          <TournamentBracketView />
        </div>
      )}

      {activeTab === "certificate" && (
        <TournamentCertificate
          recipientName={currentUser?.display_name || "Scholar"}
          stateName={currentLearnerProfile?.state_name ? `${currentLearnerProfile.state_name} State` : "Lagos State"}
          schoolName={currentLearnerProfile?.school_name || "Verified Nigerian Scholar"}
          tournamentTitle={challenges.find((c) => c.id === selectedChallengeId)?.title || "National Scholastic Championship"}
          score={currentUser?.is_demo ? 95 : 0}
          rank={currentUser?.is_demo ? "Gold Medalist" : "Participant"}
        />
      )}

      {activeTab === "drills" && (
        <>
          <div
            className="glass-card"
            style={{
              padding: "16px 20px",
              marginBottom: 28,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.4rem" }}>🎟️</span>
          <div>
            <strong style={{ fontSize: "0.95rem", color: "var(--ink)" }}>Have a Peer Challenge or Tournament Code?</strong>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>
              Enter the 6-character code (e.g. SSS-STEM, PRI-NCEE, or DUEL-XXXX) to join immediately
            </span>
          </div>
        </div>

        <form onSubmit={handleJoinByCode} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="e.g. DUEL-8X2B"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
            className="form-input"
            style={{ width: 170, textTransform: "uppercase", fontWeight: 700, padding: "8px 12px" }}
          />
          <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: "8px 16px" }}>
            Find &amp; Join
          </button>
        </form>
      </div>

      {codeLookupMsg && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          {codeLookupMsg}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 24 }}>
        {[
          { id: "all", label: "🌐 All Competitions" },
          { id: "primary", label: "🎒 Primary (NCEE)" },
          { id: "junior", label: "📘 Junior (BECE)" },
          { id: "senior_science", label: "🔬 SSS Science (UTME)" },
          { id: "senior_arts", label: "🎭 SSS Arts (WASSCE)" },
          { id: "senior_commercial", label: "💼 SSS Commercial" },
          { id: "peer_duel", label: "⚔️ Peer Duels" }
        ].map((tab) => {
          const isActive = activeTierFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTierFilter(tab.id)}
              type="button"
              style={{
                padding: "7px 14px",
                borderRadius: 9999,
                fontSize: "0.84rem",
                fontWeight: 700,
                border: "1px solid",
                borderColor: isActive ? "var(--brand)" : "var(--line)",
                background: isActive ? "var(--brand)" : "var(--surface)",
                color: isActive ? "#fff" : "var(--ink)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease"
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid" style={{ marginBottom: 32 }}>
        {filteredChallenges.length === 0 ? (
          <div className="card" style={{ gridColumn: "1 / -1", padding: 32, textAlign: "center" }}>
            <p style={{ color: "var(--muted)", margin: 0 }}>No competitions found in this category. Click &quot;Create Peer Challenge&quot; to launch one!</p>
          </div>
        ) : (
          filteredChallenges.map((chl) => {
            const isSelected = chl.id === selectedChallengeId;
            const stageLabel = chl.stage === "national" ? "National Grand Finale" : chl.stage === "zonal" ? "Zonal Playoff" : chl.stage === "state" ? "State Championship" : "LGA / School Duel";
            const tierBadge = chl.tier === "primary" ? "Primary NCEE" : chl.tier === "junior" ? "JSS BECE" : chl.tier === "senior_arts" ? "SSS Arts" : chl.tier === "senior_commercial" ? "SSS Commercial" : chl.tier === "senior_science" ? "SSS Science" : "Open League";

            return (
              <div
                key={chl.id}
                className="card"
                style={{
                  borderColor: isSelected ? "var(--brand)" : "var(--line)",
                  cursor: "pointer",
                  background: isSelected ? "var(--brand-light)" : "var(--surface)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.15s ease"
                }}
                onClick={() => handleSelectChallenge(chl.id)}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 4 }}>
                    <span className="badge badge-success" style={{ fontSize: "0.72rem" }}>
                      {chl.category === "peer_duel" ? "⚔️ PEER DUEL" : "🏆 OFFICIAL LEAGUE"}
                    </span>
                    <span style={{ fontSize: "0.74rem", color: "var(--muted)", fontWeight: 700 }}>
                      {stageLabel}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.08rem", margin: "6px 0 8px", color: "var(--ink)" }}>
                    {chl.title}
                  </h3>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                    <span className="badge badge-neutral" style={{ fontSize: "0.72rem" }}>{tierBadge}</span>
                    {chl.join_code && (
                      <span className="badge badge-neutral" style={{ fontSize: "0.72rem", fontFamily: "monospace" }}>
                        Code: {chl.join_code}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: "0.86rem", color: "var(--muted)", margin: "0 0 12px", lineHeight: 1.4 }}>
                    🎁 {chl.prize_description}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    👥 {chl.participants_count || 1} scholars enrolled
                  </span>
                  <span style={{ fontWeight: 700, color: "var(--brand-dark)", fontSize: "0.85rem" }}>
                    {isSelected ? "● Active Arena" : "View Standings →"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activeChallenge && (
        <section className="card" style={{ padding: 32, marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <span className="badge badge-neutral">Rules v{activeChallenge.rules_version}</span>
                {activeChallenge.join_code && (
                  <span className="badge badge-success" style={{ fontFamily: "monospace" }}>
                    Invite Code: {activeChallenge.join_code}
                  </span>
                )}
                {activeChallenge.created_by_name && (
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    Host: {activeChallenge.created_by_name}
                  </span>
                )}
              </div>
              <h2 style={{ margin: "4px 0 8px", fontSize: "1.45rem" }}>{activeChallenge.title}</h2>
              <p style={{ color: "var(--muted)", maxWidth: 650, margin: "0 0 8px" }}>
                🎁 <strong>Reward / Stakes:</strong> {activeChallenge.prize_description}
              </p>
              <span style={{ fontSize: "0.82rem", color: "var(--brand-dark)" }}>
                🔒 <strong>Server-Authoritative Evaluation:</strong> All candidates answer identical vetted curriculum questions. Ranks are determined by Score &rarr; Lowest Time.
              </span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {userRole === "parent" ? (
                <div style={{ background: "rgba(2, 132, 199, 0.1)", border: "1px solid #0284c7", borderRadius: 10, padding: "8px 14px", fontSize: "0.84rem" }}>
                  👁️ <strong>Spectator Mode:</strong> Enrolled scholars compete on their student terminal.
                </div>
              ) : userRole === "teacher" ? (
                <button
                  type="button"
                  onClick={() => alert(`Tournament "${activeChallenge.title}" assigned to cohort SS 3 Gold!`)}
                  className="btn btn-primary"
                >
                  🚀 Assign Tournament to Cohort
                </button>
              ) : !isJoined ? (
                <button onClick={handleJoin} className="btn btn-primary">
                  🏆 Join This Challenge
                </button>
              ) : (
                <Link
                  href={`/assessments/${encodeURIComponent(activeChallenge.assessment_id)}`}
                  className="btn btn-primary"
                  style={{ background: "#1a7f37" }}
                >
                  ✍️ Launch Timed Exam Run →
                </Link>
              )}
            </div>
          </div>

          {msg && (
            <div className="alert alert-success" style={{ marginTop: 16 }}>
              {msg}
            </div>
          )}

          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.4rem" }}>🏆</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-.02em" }}>
                    Live Verified Holographic Podium
                  </h3>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    Sub-millisecond Server Authoritative Ranking • Tiebreak: High Score &rarr; Low Seconds
                  </span>
                </div>
              </div>
              <span className="cyber-pill" style={{ fontSize: "0.72rem" }}>
                <span className="radar-dot" />
                Live Standings
              </span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
                <span style={{ fontSize: "2.4rem", display: "block", marginBottom: 12 }}>🚀</span>
                <strong style={{ fontSize: "1.1rem", color: "var(--ink)" }}>The Podium is Open!</strong>
                <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>Be the first scholar to complete this challenge and claim the Gold Crown.</p>
              </div>
            ) : (
              <>
                {/* 3D Holographic Podium for Top 3 */}
                <div className="podium-container">
                  {/* Rank 2: Silver Scholar (Left) */}
                  {(() => {
                    const r2 = leaderboard.find((l) => l.rank === 2);
                    if (!r2) return <div style={{ flex: 1 }} />;
                    return (
                      <div className="podium-column">
                        <div style={{ marginBottom: 10, textAlign: "center" }}>
                          <span style={{ fontSize: "1.8rem" }}>🥈</span>
                          <img
                            src={getScholarAvatarDataUri(r2.displayName, 56)}
                            alt={r2.displayName}
                            width={56}
                            height={56}
                            style={{
                              borderRadius: "50%",
                              border: "3px solid #94a3b8",
                              boxShadow: "0 0 16px rgba(148, 163, 184, 0.4)",
                              display: "block",
                              margin: "6px auto"
                            }}
                          />
                          <strong style={{ fontSize: "0.92rem", color: "var(--ink)", display: "block" }}>
                            {r2.displayName.split("(")[0]}
                          </strong>
                          <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                            {r2.displayName.includes("(") ? `(${r2.displayName.split("(")[1]}` : "Verified Scholar"}
                          </span>
                        </div>
                        <div className="podium-pedestal pedestal-rank-2">
                          <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#94a3b8" }}>#2</span>
                          <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--ink)" }}>{r2.score} pts</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>⏱️ {r2.completionSeconds}s</span>
                          <span className="badge badge-neutral" style={{ fontSize: "0.68rem", marginTop: 4 }}>SILVER SCHOLAR</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Rank 1: Gold Champion (Center, Elevated) */}
                  {(() => {
                    const r1 = leaderboard.find((l) => l.rank === 1);
                    if (!r1) return null;
                    return (
                      <div className="podium-column" style={{ zIndex: 2 }}>
                        <div style={{ marginBottom: 10, textAlign: "center" }}>
                          <div style={{ fontSize: "2rem", animation: "pulse 2s infinite" }}>👑</div>
                          <img
                            src={getScholarAvatarDataUri(r1.displayName, 68)}
                            alt={r1.displayName}
                            width={68}
                            height={68}
                            style={{
                              borderRadius: "50%",
                              border: "3.5px solid #f59e0b",
                              boxShadow: "0 0 24px rgba(245, 158, 11, 0.6)",
                              display: "block",
                              margin: "6px auto"
                            }}
                          />
                          <strong style={{ fontSize: "1.05rem", color: "var(--ink)", display: "block" }}>
                            {r1.displayName.split("(")[0]}
                          </strong>
                          <span style={{ fontSize: "0.76rem", color: "var(--brand-dark)", fontWeight: 700 }}>
                            {r1.displayName.includes("(") ? `(${r1.displayName.split("(")[1]}` : "National Seed #1"}
                          </span>
                        </div>
                        <div className="podium-pedestal pedestal-rank-1">
                          <span style={{ fontSize: "1.4rem", fontWeight: 900, color: "#f59e0b" }}>🥇 #1</span>
                          <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--brand)" }}>{r1.score} PTS</span>
                          <span style={{ fontSize: "0.8rem", color: "var(--ink)", fontWeight: 600 }}>⏱️ {r1.completionSeconds}s (RECORD)</span>
                          <span className="badge badge-success" style={{ fontSize: "0.72rem", marginTop: 6, fontWeight: 800 }}>
                            GOLD CHAMPION
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Rank 3: Bronze Scholar (Right) */}
                  {(() => {
                    const r3 = leaderboard.find((l) => l.rank === 3);
                    if (!r3) return <div style={{ flex: 1 }} />;
                    return (
                      <div className="podium-column">
                        <div style={{ marginBottom: 10, textAlign: "center" }}>
                          <span style={{ fontSize: "1.8rem" }}>🥉</span>
                          <img
                            src={getScholarAvatarDataUri(r3.displayName, 52)}
                            alt={r3.displayName}
                            width={52}
                            height={52}
                            style={{
                              borderRadius: "50%",
                              border: "3px solid #d97706",
                              boxShadow: "0 0 16px rgba(217, 119, 6, 0.4)",
                              display: "block",
                              margin: "6px auto"
                            }}
                          />
                          <strong style={{ fontSize: "0.92rem", color: "var(--ink)", display: "block" }}>
                            {r3.displayName.split("(")[0]}
                          </strong>
                          <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                            {r3.displayName.includes("(") ? `(${r3.displayName.split("(")[1]}` : "Verified Scholar"}
                          </span>
                        </div>
                        <div className="podium-pedestal pedestal-rank-3">
                          <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#d97706" }}>#3</span>
                          <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--ink)" }}>{r3.score} pts</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>⏱️ {r3.completionSeconds}s</span>
                          <span className="badge badge-neutral" style={{ fontSize: "0.68rem", marginTop: 4 }}>BRONZE SCHOLAR</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Remaining Standings (Rank 4+) in Clean Cyber Glass Rows */}
                {leaderboard.filter((l) => l.rank > 3).length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 10 }}>
                      All Contenders &amp; Division Qualifiers
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {leaderboard.filter((l) => l.rank > 3).map((item) => (
                        <div
                          key={item.userId}
                          className="glass-card"
                          style={{
                            padding: "12px 18px",
                            borderRadius: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 12
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <span style={{ fontFamily: "monospace", fontWeight: 900, color: "var(--muted)", fontSize: "1rem", minWidth: 28 }}>
                              #{String(item.rank).padStart(2, "0")}
                            </span>
                            <img
                              src={getScholarAvatarDataUri(item.displayName, 36)}
                              alt={item.displayName}
                              width={36}
                              height={36}
                              style={{ borderRadius: "50%", border: "1.5px solid var(--line)" }}
                            />
                            <div>
                              <strong style={{ fontSize: "0.92rem", color: "var(--ink)", display: "block" }}>
                                {item.displayName}
                              </strong>
                              <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                                Verified Academic Record
                              </span>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ textAlign: "right" }}>
                              <strong style={{ fontSize: "0.95rem", color: "var(--brand)", display: "block" }}>
                                {item.score} pts
                              </strong>
                              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                                ⏱️ {item.completionSeconds}s
                              </span>
                            </div>
                            <span className="badge badge-success" style={{ fontSize: "0.72rem" }}>
                              ✓ Verified
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </>
  )}

      <CreateChallengeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onChallengeCreated={handleChallengeCreated}
      />
    </main>
  );
}

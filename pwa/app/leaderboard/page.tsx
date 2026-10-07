"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Swords, ArrowUp, ArrowDown, Users, Flame, Sparkles, 
  Shield, Star, Crown, Zap, Clock, ChevronRight, Award, Target,
  BookOpen, GraduationCap, Heart, Check
} from "lucide-react";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

interface ScholarRanking {
  user_key: string;
  full_name: string;
  display_name?: string;
  state: string;
  xp_points: number;
  wonder_stars?: number;
  mascot?: string;
  milestone_badge?: string;
  praise_text?: string;
  predicted_score?: number;
  predicted_cgpa?: number;
  streak_days: number;
  class_tier?: string;
  grade_level?: string;
  mastery_pct?: number;
  elo_rating?: number;
  mmr_tier?: string;
  clan_id?: string;
  rank?: number;
}

interface StateStanding {
  state: string;
  student_count: number;
  avg_xp: number;
  avg_mastery: number;
  total_xp: number;
  motto: string;
  zone: string;
  rank?: number;
}

interface ClanRivalry {
  war_id: string;
  clan_a_id: string;
  clan_b_id: string;
  clan_a_xp: number;
  clan_b_xp: number;
  clan_a_name: string;
  clan_a_emblem: string;
  clan_a_school: string;
  clan_b_name: string;
  clan_b_emblem: string;
  clan_b_school: string;
  ends_at: string;
}

const COHORT_OPTIONS = [
  { id: "all", label: "🌟 All Nationwide", tier: "ALL" },
  { id: "Primary 1", label: "🎒 Primary 1", tier: "PRIMARY" },
  { id: "Primary 2", label: "🎒 Primary 2", tier: "PRIMARY" },
  { id: "Primary 3", label: "🎒 Primary 3", tier: "PRIMARY" },
  { id: "Primary 4", label: "🎒 Primary 4", tier: "PRIMARY" },
  { id: "Primary 5", label: "🎒 Primary 5", tier: "PRIMARY" },
  { id: "Primary 6", label: "🎒 Primary 6", tier: "PRIMARY" },
  { id: "JSS 1", label: "📘 JSS 1", tier: "JSS" },
  { id: "JSS 2", label: "📘 JSS 2", tier: "JSS" },
  { id: "JSS 3", label: "📘 JSS 3 (BECE)", tier: "JSS" },
  { id: "SSS 1", label: "🔬 SSS 1", tier: "SSS" },
  { id: "SSS 2", label: "🔬 SSS 2", tier: "SSS" },
  { id: "SSS 3", label: "🔬 SSS 3", tier: "SSS" },
  { id: "UTME", label: "⚡ JAMB UTME 2026", tier: "UTME" },
  { id: "100L", label: "🎓 100L University", tier: "FRESHMAN" }
];

const TIER_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Bronze: { text: "text-amber-700", bg: "bg-amber-950/40", border: "border-amber-700/40" },
  Silver: { text: "text-slate-300", bg: "bg-slate-800/40", border: "border-slate-400/40" },
  Gold: { text: "text-yellow-400", bg: "bg-yellow-950/40", border: "border-yellow-500/40" },
  Platinum: { text: "text-cyan-300", bg: "bg-cyan-950/40", border: "border-cyan-500/40" },
  Diamond: { text: "text-blue-300", bg: "bg-blue-950/40", border: "border-blue-500/40" },
  Master: { text: "text-purple-300", bg: "bg-purple-950/40", border: "border-purple-500/40" },
  "Champions League": { text: "text-naija-gold", bg: "bg-amber-950/50", border: "border-naija-gold/60" },
};

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"national" | "states" | "clans" | "my_rank">("national");
  const [selectedCohort, setSelectedCohort] = useState<string>("all");
  const [scholars, setScholars] = useState<ScholarRanking[]>([]);
  const [states, setStates] = useState<StateStanding[]>([]);
  const [rivalries, setRivalries] = useState<ClanRivalry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isPrimaryCohort, setIsPrimaryCohort] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 42, mins: 15, secs: 30 });

  // Weekly Sunday reset countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, mins: 59, secs: 59 };
        return { hours: 168, mins: 0, secs: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pre-select user's active class on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("edunaija_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUserProfile(parsed);
          const raw = parsed.grade_level || parsed.class_tier;
          if (raw) {
            const match = COHORT_OPTIONS.find(c => raw.toLowerCase().includes(c.id.toLowerCase()));
            if (match) {
              setSelectedCohort(match.id);
            }
          }
        } catch {}
      }
    }
  }, []);

  // Fetch real data from SQLite backend
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let endpoint = "/api/backend/competition/national-leaderboard?limit=50";
        if (selectedCohort !== "all") {
          endpoint = `/api/backend/competition/class-leaderboard/${encodeURIComponent(selectedCohort)}?limit=50`;
        }

        const [natRes, stateRes, clanRes] = await Promise.all([
          fetch(endpoint),
          fetch("/api/backend/competition/state-standings"),
          fetch("/api/backend/clans/rivalries"),
        ]);

        if (natRes.ok) {
          const natData = await natRes.json();
          setScholars(natData.leaderboard || []);
          setIsPrimaryCohort(!!natData.is_primary || selectedCohort.toLowerCase().includes("primary"));
        } else {
          // Fallback to national
          const fallbackRes = await fetch("/api/backend/competition/national-leaderboard?limit=50");
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            setScholars(fallbackData.leaderboard || []);
            setIsPrimaryCohort(false);
          }
        }

        if (stateRes.ok) {
          const stateData = await stateRes.json();
          setStates(stateData.standings || []);
        }

        if (clanRes.ok) {
          const clanData = await clanRes.json();
          setRivalries(clanData.rivalries || []);
        }
      } catch (err) {
        console.warn("Leaderboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [selectedCohort]);

  const handleCohortChange = (cohortId: string) => {
    sfx.tap();
    triggerTmaHaptic("light");
    setSelectedCohort(cohortId);
  };

  const top3 = scholars.slice(0, 3);
  const remaining = scholars.slice(3);

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen text-white font-sans space-y-6 pb-24">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Class-Isolated Sovereign Arena &bull; Season 2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
            {isPrimaryCohort ? "🎒 Wonder Stars Primary Pod" : "🏆 National Academic Standings"}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isPrimaryCohort 
              ? "Every young scholar is celebrated! Non-punitive milestone stars and animal mascot badges." 
              : "Strict grade cohort isolation. Transparent verified metrics with tamper-proof SQLite ledger."}
          </p>
        </div>

        {/* Weekly Reset Clock */}
        <div className="flex items-center gap-3 bg-black/60 border border-white/10 p-2.5 rounded-2xl">
          <Clock className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-mono">Weekly Reset in</div>
            <div className="text-xs font-mono font-black text-amber-300">
              {countdown.hours}h {countdown.mins}m {countdown.secs}s
            </div>
          </div>
        </div>
      </div>

      {/* CLASS / COHORT SELECTOR STRIP (Strict Class Isolation) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            Filter Leaderboard by Exact Class Cohort:
          </span>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Active: {COHORT_OPTIONS.find(c => c.id === selectedCohort)?.label || selectedCohort}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {COHORT_OPTIONS.map(c => {
            const isSelected = selectedCohort === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleCohortChange(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? "bg-[#00E676] text-black font-black shadow-[0_0_15px_rgba(0,230,118,0.4)] scale-105"
                    : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5"
                }`}
              >
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tabs (National, States, Clans, My Rank) */}
      <div className="flex p-1 bg-black/40 rounded-2xl border border-white/10 max-w-md">
        <button
          onClick={() => { setActiveTab("national"); sfx.tap(); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "national"
              ? "bg-white/15 text-white shadow-sm font-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          {isPrimaryCohort ? "🌟 Class Scholars" : "Contenders"}
        </button>

        {!isPrimaryCohort && (
          <>
            <button
              onClick={() => { setActiveTab("states"); sfx.tap(); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "states"
                  ? "bg-white/15 text-white shadow-sm font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              States League
            </button>

            <button
              onClick={() => { setActiveTab("clans"); sfx.tap(); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "clans"
                  ? "bg-white/15 text-white shadow-sm font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              School Clans
            </button>
          </>
        )}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "national" && (
        <div className="space-y-6">
          
          {/* PODIUM (Top 3) */}
          <div className="rounded-3xl p-6 border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/60 shadow-xl">
            <div className="text-center text-xs font-mono text-zinc-400 uppercase tracking-widest mb-6">
              {isPrimaryCohort ? "🌟 Wonder Stars Podium 🌟" : "👑 Sovereign Academic Podium 👑"}
            </div>

            <div className="flex items-end justify-center gap-3 md:gap-8 pt-4">
              {/* Rank 2 (Silver) */}
              {top3[1] && (
                <div className="flex flex-col items-center flex-1 max-w-[150px]">
                  <div className="text-xs font-bold text-slate-300 mb-0.5 truncate w-full text-center">
                    {top3[1].display_name || top3[1].full_name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 mb-2">
                    {isPrimaryCohort ? (top3[1].mascot || "🦜 Kemi") : top3[1].state}
                  </div>
                  <div className="w-full bg-gradient-to-t from-slate-900 to-slate-700/80 border-t-2 border-slate-300 rounded-t-2xl h-28 flex flex-col items-center justify-center p-2 shadow-lg">
                    <span className="text-2xl font-black text-slate-200">2</span>
                    <span className="text-xs font-mono font-bold text-slate-300 mt-1">
                      {isPrimaryCohort ? `${top3[1].wonder_stars || 150} Stars 🌟` : `${top3[1].xp_points.toLocaleString()} XP`}
                    </span>
                  </div>
                </div>
              )}

              {/* Rank 1 (Gold - Center & Elevated) */}
              {top3[0] && (
                <div className="flex flex-col items-center flex-1 max-w-[170px] -mt-6">
                  <Crown className="w-8 h-8 text-amber-400 mb-1 animate-pulse" />
                  <div className="text-sm font-black text-amber-300 mb-0.5 truncate w-full text-center">
                    {top3[0].display_name || top3[0].full_name.split(" ")[0]}
                  </div>
                  <div className="text-xs font-mono text-amber-200/70 mb-2">
                    {isPrimaryCohort ? (top3[0].mascot || "🦁 Simbi") : top3[0].state}
                  </div>
                  <div className="w-full bg-gradient-to-t from-amber-950/90 to-amber-600/60 border-t-2 border-amber-300 rounded-t-2xl h-36 flex flex-col items-center justify-center p-2 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                    <span className="text-3xl font-black text-amber-200">1</span>
                    <span className="text-xs font-mono font-extrabold text-amber-100 mt-1">
                      {isPrimaryCohort ? `${top3[0].wonder_stars || 180} Stars 🌟` : `${top3[0].xp_points.toLocaleString()} XP`}
                    </span>
                    <span className="text-[10px] bg-amber-400 text-black font-extrabold px-2 py-0.5 rounded-full mt-1">
                      {top3[0].streak_days}d 🔥
                    </span>
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {top3[2] && (
                <div className="flex flex-col items-center flex-1 max-w-[150px]">
                  <div className="text-xs font-bold text-amber-600 mb-0.5 truncate w-full text-center">
                    {top3[2].display_name || top3[2].full_name.split(" ")[0]}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 mb-2">
                    {isPrimaryCohort ? (top3[2].mascot || "🐘 Bolu") : top3[2].state}
                  </div>
                  <div className="w-full bg-gradient-to-t from-amber-950 to-amber-800/60 border-t-2 border-amber-600 rounded-t-2xl h-24 flex flex-col items-center justify-center p-2 shadow-md">
                    <span className="text-xl font-black text-amber-500">3</span>
                    <span className="text-xs font-mono font-bold text-amber-400 mt-1">
                      {isPrimaryCohort ? `${top3[2].wonder_stars || 120} Stars 🌟` : `${top3[2].xp_points.toLocaleString()} XP`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TABLE OF SCHOLARS */}
          <div className="rounded-3xl p-5 border border-white/10 bg-black/40 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>
                  {isPrimaryCohort ? `${selectedCohort} Wonder Scholar Pod` : `Rankings Table (${selectedCohort})`}
                </span>
              </h2>
              <span className="text-xs text-zinc-400 font-mono">
                {scholars.length} Registered Scholars
              </span>
            </div>

            <div className="space-y-2">
              {scholars.map((item, idx) => {
                const rankNum = idx + 1;
                return (
                  <div
                    key={item.user_key || idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm w-7 text-zinc-500 text-center">
                        #{rankNum}
                      </span>

                      {/* Avatar / Mascot */}
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                        {isPrimaryCohort ? (item.mascot?.split(" ")[0] || "🎒") : "🎓"}
                      </div>

                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          <span>{item.display_name || item.full_name}</span>
                          {item.milestone_badge && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {item.milestone_badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2 font-mono mt-0.5">
                          <span>{item.state}</span>
                          <span>&bull;</span>
                          <span className="text-orange-400 font-bold">{item.streak_days}d streak 🔥</span>
                          {item.predicted_score && !isPrimaryCohort && (
                            <>
                              <span>&bull;</span>
                              <span className="text-[#00E676] font-bold">Predicted: {item.predicted_score}</span>
                            </>
                          )}
                          {item.predicted_cgpa && !isPrimaryCohort && (
                            <>
                              <span>&bull;</span>
                              <span className="text-[#00E676] font-bold">CGPA: {item.predicted_cgpa} / 5.0</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {isPrimaryCohort ? (
                        <div className="text-sm font-mono font-black text-amber-300">
                          {item.wonder_stars || 100} 🌟
                        </div>
                      ) : (
                        <div className="text-sm font-mono font-black text-[#00E676]">
                          {item.xp_points.toLocaleString()} XP
                        </div>
                      )}
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {item.mastery_pct || 80}% mastery
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* STATES LEAGUE */}
      {activeTab === "states" && !isPrimaryCohort && (
        <div className="space-y-3">
          <div className="rounded-3xl p-5 border border-white/10 bg-black/40 space-y-3">
            <h2 className="font-bold text-sm text-white">36 States + FCT Academic Trophy Table</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {states.map((st, i) => (
                <div key={st.state} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">#{i + 1} {st.state}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{st.avg_xp} Avg XP</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">{st.student_count} registered scholars</div>
                  <div className="text-[10px] text-zinc-500 italic">"{st.motto}"</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCHOOL CLANS */}
      {activeTab === "clans" && !isPrimaryCohort && (
        <div className="space-y-3">
          <div className="rounded-3xl p-5 border border-white/10 bg-black/40 space-y-3">
            <h2 className="font-bold text-sm text-white">Live School Clan Wars</h2>
            <div className="space-y-3">
              {rivalries.map((riv) => (
                <div key={riv.war_id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{riv.clan_a_emblem}</span>
                    <div>
                      <div className="font-bold text-sm text-white">{riv.clan_a_name}</div>
                      <div className="text-[10px] text-zinc-400">{riv.clan_a_school}</div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-amber-400 font-mono px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                    VS
                  </span>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="font-bold text-sm text-white">{riv.clan_b_name}</div>
                      <div className="text-[10px] text-zinc-400">{riv.clan_b_school}</div>
                    </div>
                    <span className="text-2xl">{riv.clan_b_emblem}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

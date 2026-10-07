"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Users, Trophy, Flame, ArrowRight, ShieldCheck, CheckCircle2,
  Clock, Award, ArrowUp, ArrowDown, Sparkles, ChevronRight, Crown, Calendar
} from "lucide-react";
import confetti from "canvas-confetti";
import AddToCalendarModal from "../../components/AddToCalendarModal";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

const LEAGUE_TIERS = [
  { name: "Bronze", icon: "🥉", color: "text-amber-700", border: "border-amber-700/40" },
  { name: "Silver", icon: "🥈", color: "text-slate-300", border: "border-slate-400/40" },
  { name: "Gold", icon: "🥇", color: "text-yellow-400", border: "border-yellow-500/40" },
  { name: "Platinum", icon: "💎", color: "text-cyan-300", border: "border-cyan-500/40" },
  { name: "Diamond", icon: "✨", color: "text-blue-300", border: "border-blue-500/40" },
  { name: "Master", icon: "🔮", color: "text-purple-300", border: "border-purple-500/40" },
  { name: "Champions", icon: "👑", color: "text-naija-gold", border: "border-naija-gold/60" },
];

export default function ShowdownLivePage() {
  const [selectedTier, setSelectedTier] = useState("Gold");
  const [standings, setStandings] = useState<any[]>([]);
  const [isSundayFrenzy, setIsSundayFrenzy] = useState(false);
  const [secondsToReset, setSecondsToReset] = useState(3600 * 24 * 2);
  const [selected, setSelected] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [liveRank, setLiveRank] = useState(8);
  const [score, setScore] = useState(1485);
  const [speedBonus, setSpeedBonus] = useState(5);
  const [tickerMsg, setTickerMsg] = useState("Adeoluwa (Oyo) answered • +15 pts");
  const [loading, setLoading] = useState(false);
  const [calendarSaved, setCalendarSaved] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Fetch real league standings
  const fetchStandings = async () => {
    try {
      const res = await fetch(`/api/backend/showdown-league/standings/${selectedTier}`);
      if (res.ok) {
        const data = await res.json();
        setStandings(data.standings || []);
        setIsSundayFrenzy(data.is_sunday_frenzy || false);
        setSecondsToReset(data.seconds_to_reset || 3600 * 24 * 2);
      }
    } catch (err) {
      console.warn("Offline showdown data fallback");
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStandings().finally(() => setLoading(false));
    
    // Live polling every 5s so contenders dynamically shift in real-time
    const interval = setInterval(fetchStandings, 5000);
    return () => clearInterval(interval);
  }, [selectedTier]);

  // Speed bonus countdown simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeedBonus((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Live delta toast ticker simulation
  useEffect(() => {
    const toasts = [
      "Chisom (Lagos) advanced to Promotion Zone! 🚀",
      "Fatimah (Kano) on a 10-streak! 🔥",
      "Emeka (Rivers) claimed +5 Speed Bonus ⚡",
      "Sunday Frenzy: Double MMR active in the final hours!",
      "Sunday Showdown: 14,820 candidates active right now!"
    ];
    let i = 0;
    const interval = setInterval(() => {
      setTickerMsg(toasts[i % toasts.length]);
      i++;
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleAnswer = async (optionIdx: number) => {
    if (isAnswered) return;
    setSelected(optionIdx);
    setIsAnswered(true);
    triggerTmaHaptic("medium");

    const isCorrect = optionIdx === 1; // Option B (1s² 2s² 2p⁶ 3s¹) correct
    const earned = isCorrect ? Math.round((10 + speedBonus) * (isSundayFrenzy ? 1.5 : 1)) : 0;

    if (isCorrect) {
      sfx.correct();
      setScore((s) => s + earned);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } else {
      sfx.wrong();
    }

    // Record score live to backend
    try {
      const stored = localStorage.getItem("edunaija_user");
      let userKey = "EDU-2025-LAG-1112";
      if (stored) {
        try { userKey = JSON.parse(stored).registration_key || userKey; } catch (e) {}
      }

      const res = await fetch("/api/backend/showdown-league/record-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_key: userKey,
          tier: selectedTier,
          points_earned: earned,
          is_correct: isCorrect
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLiveRank(data.current_rank);
        fetchStandings();
      }
    } catch (e) {
      if (isCorrect) {
        setLiveRank((r) => Math.max(1, r - 2));
      } else {
        setLiveRank((r) => r + 1);
      }
    }
  };

  const handleAddToCalendar = () => {
    sfx.tap();
    setIsCalendarModalOpen(true);
  };

  const handleAddToCalendarLegacy = () => {
    sfx.tap();
    // Compute next Sunday 8:00 PM WAT
    const now = new Date();
    const day = now.getDay();
    const daysUntilSunday = (7 - day) % 7 || 7;
    const nextSunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 20, 0, 0);
    const endSunday = new Date(nextSunday.getTime() + 60 * 60 * 1000); // 1 hr

    const formatGoogleDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("🏆 EduNaija Sunday ₦50k National Showdown")}&dates=${formatGoogleDate(nextSunday)}/${formatGoogleDate(endSunday)}&details=${encodeURIComponent("Weekly 8:00 PM WAT National Academic League Sprint on EduNaija OS. Compete for scholarships and ₦50,000 cash bounties!")}&location=EduNaija%20OS%20App`;

    window.open(gCalUrl, "_blank");
    setCalendarSaved(true);
    setTimeout(() => setCalendarSaved(false), 3000);
  };

  const hoursLeft = Math.floor(secondsToReset / 3600);
  const minutesLeft = Math.floor((secondsToReset % 3600) / 60);

  return (
    <div className="min-h-screen p-4 md:p-6 text-white max-w-7xl mx-auto font-sans pb-24">
      {/* Top Banner & League Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>WEEKLY LIVE LEAGUE SPRINT</span>
          </div>
          <h1 className="font-display tracking-tight font-black text-2xl md:text-4xl text-white">
            Sunday 8PM National Showdown
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1">
            Top 5 promote to higher tiers. Bottom 5 relegate. Real-time dynamic scores across 36 states.
          </p>
        </div>

        {/* Countdown & Add to Calendar */}
        <div className="flex items-center gap-2">
          <div className="glass-card rounded-2xl px-4 py-2 border border-amber-500/30 bg-amber-950/20 text-right">
            <span className="text-[10px] font-mono text-amber-300 block uppercase">Weekly Cohort Reset</span>
            <span className="font-mono font-black text-lg md:text-xl text-amber-400">
              {hoursLeft}h {minutesLeft}m left
            </span>
          </div>

          <button
            onClick={handleAddToCalendar}
            className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer text-zinc-200 hover:text-white"
            title="Add Sunday Showdown to Google Calendar / Apple Calendar"
          >
            <Calendar className="w-4 h-4 text-naija-gold" />
            <span className="hidden sm:inline">{calendarSaved ? "Event Added! ✓" : "Sync Calendar"}</span>
          </button>
        </div>
      </div>

      {/* 7 League Tier Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {LEAGUE_TIERS.map((tier) => (
          <button
            key={tier.name}
            onClick={() => {
              sfx.tap();
              setSelectedTier(tier.name);
            }}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              selectedTier === tier.name
                ? `${tier.border} bg-white/10 ${tier.color} shadow-lg scale-105`
                : "border-white/5 bg-black/40 text-zinc-400 hover:border-white/20"
            }`}
          >
            <span>{tier.icon}</span>
            <span>{tier.name} League</span>
          </button>
        ))}
      </div>

      {/* Main Grid: Live Battle Arena (Left) + Cohort Standings (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Live Battle Arena (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-card rounded-3xl p-5 md:p-6 border border-white/10 relative overflow-hidden">
            {/* Live Ticker Bar */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs">
              <span className="flex items-center gap-2 text-zinc-300">
                <Flame className="w-4 h-4 text-orange-400 fill-current animate-pulse" />
                <span className="truncate">{tickerMsg}</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold shrink-0">Live</span>
            </div>

            {/* Question Stem */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-zinc-400">JAMB 2024 • Chemistry</span>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                  +{speedBonus} Speed Bonus
                </span>
              </div>
              <h3 className="font-bold text-base md:text-lg leading-snug">
                Which of the following electronic configurations represents an element with the highest second ionization energy?
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Tip: After removing the 1st electron, which element requires removing an electron from a stable closed shell?
              </p>
            </div>

            {/* Option Cards with Clean Scientific Superscripts */}
            <div className="grid grid-cols-1 gap-2.5 mb-5">
              {[
                { opt: "A", text: "1s² 2s² 2p⁶ 3s² (Magnesium)" },
                { opt: "B", text: "1s² 2s² 2p⁶ 3s¹ (Sodium — Highest 2nd IE)" },
                { opt: "C", text: "1s² 2s² 2p⁴ (Oxygen)" },
                { opt: "D", text: "1s² 2s² 2p⁶ (Neon)" },
              ].map((item, idx) => {
                const isChosen = selected === idx;
                const isRight = idx === 1;
                let borderStyle = "border-white/10 hover:border-white/30";
                let bgStyle = "bg-white/[0.03]";

                if (isAnswered) {
                  if (isRight) {
                    borderStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
                  } else if (isChosen && !isRight) {
                    borderStyle = "border-red-500 bg-red-950/40 text-red-200";
                  }
                }

                return (
                  <button
                    key={item.opt}
                    onClick={() => handleAnswer(idx)}
                    disabled={isAnswered}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${bgStyle} ${borderStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center font-mono font-bold text-xs">
                        {item.opt}
                      </span>
                      <span className="font-mono text-sm">{item.text}</span>
                    </div>
                    {isAnswered && isRight && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
              <div className="p-3 rounded-2xl bg-white/[0.03] text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">Your Cohort Rank</span>
                <span className="text-xl font-black font-display text-emerald-400">#{liveRank}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.03] text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-mono block">Weekly Score</span>
                <span className="text-xl font-black font-mono text-naija-gold">{score} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dynamic Cohort Standings (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-card rounded-3xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-naija-gold" /> {selectedTier} Cohort ({standings.length} Scholars)
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>

            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {standings.map((s: any, idx: number) => {
                const isPromo = s.promotion_status === "promotion" || idx < 5;
                const isReleg = s.promotion_status === "relegation" || (idx >= standings.length - 5 && standings.length > 10);

                return (
                  <div
                    key={s.user_key || idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                      isPromo
                        ? "bg-emerald-950/20 border-emerald-500/30"
                        : isReleg
                        ? "bg-red-950/20 border-red-500/30"
                        : "bg-white/[0.02] border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`font-mono font-bold w-5 text-center ${isPromo ? "text-emerald-400" : isReleg ? "text-red-400" : "text-zinc-500"}`}>
                        #{s.rank_position || idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white truncate max-w-[140px]">{s.full_name}</div>
                        <div className="text-[10px] text-zinc-400">{s.state}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-extrabold text-amber-300">
                        {s.xp_this_week?.toLocaleString()} XP
                      </div>
                      <span className={`text-[9px] font-bold uppercase ${isPromo ? "text-emerald-400" : isReleg ? "text-red-400" : "text-zinc-500"}`}>
                        {isPromo ? "▲ Promote" : isReleg ? "▼ Relegate" : "Safe"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-2 border-t border-white/5 flex justify-between text-[11px] text-zinc-400">
              <span className="text-emerald-400 font-bold">▲ Top 5: Promoted</span>
              <span className="text-red-400 font-bold">▼ Bottom 5: Relegated</span>
            </div>
          </div>
        </div>

      </div>
      <AddToCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        defaultEventId="sunday-showdown"
      />
    </div>
  );
}

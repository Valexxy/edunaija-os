"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Share2, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

export default function ResultsPage() {
  useEffect(() => {
    sfx.streakCelebration();
    triggerTmaHaptic("heavy");
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
  }, []);

  const shareStatus = () => {
    sfx.streakCelebration();
    triggerTmaHaptic("medium");
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    const text = "Omo! I scored 78% on EduNaija OS CBT Simulator! My predicted JAMB score is 268/400 (Targeting UNILAG Medicine). Try am here: https://t.me/edunaija_bot?startapp=CHISOM-7X 🚀";
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <main className="p-4 max-w-md mx-auto min-h-screen pb-24 text-white">
      {/* Top Header */}
      <header className="flex justify-between items-center mb-5 pt-2">
        <span className="px-3 py-1 rounded-full text-xs font-black bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,230,118,0.3)]">
          <Target className="w-3.5 h-3.5" /> SESSION COMPLETED
        </span>
        <div className="flex items-center gap-2 glass-card px-3 py-1 rounded-full text-xs font-bold">
          <span>Great job Chisom!</span>
          <span>🔥</span>
        </div>
      </header>

      {/* Hero Accuracy & XP Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card rounded-3xl p-5 mb-4 border border-white/10 relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          {/* Circular Accuracy Ring */}
          <div className="relative flex items-center justify-center w-28 h-28">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#00E676] drop-shadow-[0_0_12px_#00E676]"
                strokeDasharray="78, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">78%</span>
            </div>
          </div>

          <div className="text-right flex-1 pl-4">
            <div className="text-2xl font-black text-white mb-0.5">24 / 30</div>
            <div className="text-xs text-zinc-400 mb-3">Correct Answers</div>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-naija-gold/20 text-naija-gold text-xs font-black border border-naija-gold/30 shadow-[0_0_12px_rgba(255,215,0,0.3)]">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> +320 XP Earned
            </span>
          </div>
        </div>
      </motion.div>

      {/* Algorithmic JAMB Score Forecaster Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-3xl p-5 mb-4 border border-white/10"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-purple-400" /> JAMB SCORE FORECASTER
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">IRT Calibrated</span>
        </div>
        <div className="text-3xl font-black text-white mb-0.5">
          268 <span className="text-base text-zinc-500 font-normal">/ 400</span>
        </div>
        <div className="text-xs text-zinc-300 mb-3">
          Target score (<strong className="text-white">280 for UNILAG</strong>): 12 days away
        </div>

        {/* Upward Trajectory Graph Line */}
        <div className="w-full h-10 flex items-end gap-1.5 pt-2 border-b border-white/5">
          {[35, 42, 50, 48, 62, 70, 78].map((val, idx) => (
            <motion.div
              key={idx}
              initial={{ height: 0 }}
              animate={{ height: `${val}%` }}
              transition={{ delay: idx * 0.08 }}
              className={`flex-1 rounded-t-sm ${
                idx === 6 ? "bg-[#00E676] shadow-[0_0_10px_#00E676]" : "bg-purple-600/40"
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Weak Topics Diagnostic Radar */}
      <section className="mb-6">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
          Cognitive Diagnosis (Action Required)
        </h2>

        <div className="space-y-2">
          <div className="glass-card p-3 rounded-2xl border border-red-500/20 bg-red-950/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-xs font-bold text-white">Organic Chemistry</div>
                <div className="text-[10px] text-zinc-400">34% Mastery</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
              High Priority
            </span>
          </div>

          <div className="glass-card p-3 rounded-2xl border border-amber-500/20 bg-amber-950/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white">Wave Motion &amp; Optics</div>
                <div className="text-[10px] text-zinc-400">48% Mastery</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Needs Practice
            </span>
          </div>

          <div className="glass-card p-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
              <div>
                <div className="text-xs font-bold text-white">Newton&apos;s Laws</div>
                <div className="text-[10px] text-zinc-400">92% Mastery</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-[#00E676] border border-emerald-500/30">
              Mastered ✓
            </span>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <Link href="/quiz">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={sfx.tap}
            className="w-full bg-gradient-to-r from-[#00E676] to-[#008751] text-black font-extrabold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,230,118,0.4)]"
          >
            🚀 Review Mistakes &amp; In-Depth Explanations
          </motion.button>
        </Link>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={shareStatus}
          className="w-full glass-card hover:bg-white/10 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors"
        >
          <Share2 className="w-4 h-4 text-emerald-400" />
          Share Score to WhatsApp Status (+10 Hearts)
        </motion.button>
      </div>
    </main>
  );
}

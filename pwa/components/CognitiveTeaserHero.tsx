"use client";

import { useState } from "react";
import { 
  Sparkles, Zap, ArrowRight, CheckCircle2, ShieldCheck, 
  Trophy, Lock, Flame, Play, Star, ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function CognitiveTeaserHero({ onUnlockCockpit }: { onUnlockCockpit: () => void }) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const teaserQuestion = {
    badge: "15-Second Cognitive Sprint",
    subject: "JAMB UTME • Mathematics & Logic",
    prompt: "If 2^(x + 3) = 32, what is the value of 3^(x - 1)?",
    options: ["A) 3", "B) 9", "C) 1", "D) 27"],
    correct_index: 0, // 2^(x+3) = 2^5 => x+3=5 => x=2. Then 3^(2-1) = 3^1 = 3.
    explanation: "2^(x+3) = 2^5 => x = 2. Therefore 3^(2-1) = 3^1 = 3."
  };

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === teaserQuestion.correct_index) {
      setScore(100);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4">
      {/* Sleek Glassmorphic Hero Teaser Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-emerald-500/30 p-6 sm:p-10 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
              <Zap className="w-3.5 h-3.5 fill-current text-emerald-400" />
              <span>{teaserQuestion.badge}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Flame className="w-4 h-4 text-amber-400 fill-current" />
              <span>Nigeria&apos;s #1 Most Missed Question</span>
            </div>
          </div>

          {/* Question Title & Prompt */}
          <div className="text-left mb-6">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
              {teaserQuestion.subject}
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-snug">
              {teaserQuestion.prompt}
            </h2>
          </div>

          {/* Interactive 4 Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {teaserQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === teaserQuestion.correct_index;

              let btnStyle = "bg-slate-950/80 border-slate-800 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-900";
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-extrabold shadow-lg shadow-emerald-500/20";
                } else if (isSelected && !isCorrect) {
                  btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelect(idx)}
                  className={`p-4 rounded-2xl border text-center font-mono text-base font-bold transition-all duration-200 active:scale-95 ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Post-Answer Dopamine Fanfare & Gate Call-to-Action */}
          {isAnswered && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/40 text-left animate-in fade-in zoom-in-95 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-black text-white">
                      {selectedOption === teaserQuestion.correct_index 
                        ? "Flawless Speed & Accuracy! Top 3% National Percentile" 
                        : "Almost! Review the Derivation"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl">
                    {teaserQuestion.explanation} Enter the Enterprise Scholar Cockpit to challenge peers in Axiom Bouts, access the AI Socratic Tutor, or inspect ward diagnostics.
                  </p>
                </div>

                <button
                  onClick={onUnlockCockpit}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs hover:from-emerald-300 hover:to-teal-300 transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
                >
                  <Trophy className="w-4 h-4 fill-current" />
                  <span>Enter Scholar Cockpit (Demo)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Footer Highlights & Quick Direct Launch */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Deterministic AI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Axiom Bouts™ 1v1</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-teal-400" />
                <span>The Sovereign Aegis™</span>
              </div>
            </div>

            <button
              onClick={onUnlockCockpit}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-2 transition active:scale-95 ml-auto"
            >
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Launch Enterprise Cockpit (Demo)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

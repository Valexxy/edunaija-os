"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Search, ArrowRight, CheckCircle2, ShieldCheck, 
  GraduationCap, BookOpen, Users, School, Heart, Zap, Compass
} from "lucide-react";
import Link from "next/link";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface IntentResult {
  persona: string;
  academic_tier: string;
  intent_title: string;
  matched_need: string;
  recommended_route: string;
  hero_headline: string;
  roadmap_steps: Array<{ step: number; title: string; desc: string }>;
  source?: string;
}

const SMART_INTENT_CHIPS = [
  { id: "jamb_300", label: "🎯 JAMB 300+ Distinction", category: "UTME 2026", color: "from-emerald-500/20 to-teal-500/20 text-[#00E676] border-emerald-500/30" },
  { id: "primary_reading", label: "👶 Primary Phonics & Reading", category: "Parent & Ward", color: "from-blue-500/20 to-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { id: "waec_sciences", label: "🔬 WAEC Straight A1 Sciences", category: "SSS 1-3", color: "from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30" },
  { id: "university_5_0", label: "🏛️ 100L GST & 5.0 CGPA", category: "University", color: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30" },
  { id: "teacher_schemes", label: "👨‍🏫 NERDC Lesson Scheme Copilot", category: "Teachers", color: "from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30" },
  { id: "school_cbt", label: "🏫 Offline Campus CBT Engine", category: "School Heads", color: "from-rose-500/20 to-pink-500/20 text-rose-300 border-rose-500/30" },
];

export default function AIVisitorIntentEngine() {
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>("jamb_300");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IntentResult>({
    persona: "student",
    academic_tier: "UTME",
    intent_title: "JAMB UTME 300+ Distinction Mission",
    matched_need: "Master official 2026 syllabus, 'The Lekki Headmaster' novel, and timed 400pt CBT mocks.",
    recommended_route: "/student",
    hero_headline: "Welcome, JAMB 2026 Aspirant: Unlock Your 320+ Score Trajectory",
    roadmap_steps: [
      { step: 1, title: "Diagnostic Baseline Test", desc: "Pinpoint your current score band across your 4 UTME subject combinations." },
      { step: 2, title: "Bionic Literature Drill", desc: "Read 'The Lekki Headmaster' with saccadic fixation anchors to finish 3x faster." },
      { step: 3, title: "Ghost Pacing CBT Sprint", desc: "Race against the national top 1% benchmark to eliminate exam hall time freeze." }
    ]
  });

  const handleChipClick = async (chipId: string) => {
    sfx.tap();
    triggerTmaHaptic("light");
    setActiveChip(chipId);
    setIsLoading(true);
    try {
      const res = await fetch("/api/backend/api/intent-personalization/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chip_id: chipId })
      });
      const data = await res.json();
      setResult(data);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    sfx.tap();
    triggerTmaHaptic("medium");
    setActiveChip(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/backend/api/intent-personalization/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query })
      });
      const data = await res.json();
      setResult(data);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-6 p-1 rounded-3xl bg-gradient-to-r from-emerald-500/30 via-cyan-500/20 to-purple-500/30 shadow-[0_15px_50px_rgba(0,230,118,0.12)]">
      <div className="bg-[#090b14]/90 backdrop-blur-2xl rounded-[22px] border border-white/10 p-5 sm:p-7">
        
        {/* Header & Mission Statement */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                AI Universal Intent Matcher
              </span>
              <span className="text-[10px] bg-white/10 text-zinc-300 px-2 py-0.5 rounded-full font-mono">
                Bloom 2-Sigma Ready
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-display font-black text-white mt-1">
              What is your educational mission today?
            </h3>
            <p className="text-xs text-zinc-400">
              The AI automatically configures your learning cockpit, grade tier, and personalized 3-step master plan.
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/50 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-zinc-300">
            <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <span>Target: <strong className="text-white">{result.academic_tier}</strong></span>
          </div>
        </div>

        {/* 1-Click Smart Intent Chips */}
        <div className="mt-4">
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#00E676]" /> Select Instant Objective:
          </div>
          <div className="flex flex-wrap gap-2">
            {SMART_INTENT_CHIPS.map((chip) => {
              const isSelected = activeChip === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => handleChipClick(chip.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-gradient-to-r from-emerald-500/25 to-[#00E676]/25 border-emerald-400 text-white shadow-[0_0_15px_rgba(0,230,118,0.3)] scale-[1.02]"
                      : "bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:border-white/25 hover:bg-white/10"
                  }`}
                >
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Natural Language Search Input */}
        <form onSubmit={handleQuerySubmit} className="mt-4 relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-emerald-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Or tell AI in your own words (e.g. 'Help my daughter in Primary 4 with phonics' or 'I need 320 in JAMB 2026')..."
              className="w-full bg-black/60 border border-white/15 focus:border-emerald-500/60 rounded-2xl pl-11 pr-28 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-display font-black text-xs hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>{isLoading ? "Analyzing..." : "Tailor"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Tailored Intent Matched Panel (Dynamic Bento Preview) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={result.intent_title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-[#00E676]/20 text-[#00E676] px-2 py-0.5 rounded-full uppercase border border-emerald-500/30">
                    Matched: {result.intent_title}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Role: <strong className="text-zinc-200 capitalize">{result.persona}</strong>
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {result.hero_headline}
                </h4>
                <p className="text-xs text-zinc-300">
                  {result.matched_need}
                </p>
              </div>

              <Link
                href={result.recommended_route}
                onClick={() => {
                  sfx.tap();
                  triggerTmaHaptic("medium");
                  localStorage.setItem("edunaija_academic_tier", result.academic_tier);
                  localStorage.setItem("edunaija_class_tier", result.academic_tier);
                }}
                className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-[#00E676] text-black font-display font-black text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)] flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Tailored Cockpit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 3-Step Action Roadmap */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
              {result.roadmap_steps.map((s) => (
                <div key={s.step} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>STEP 0{s.step}</span>
                  </div>
                  <div className="text-xs font-bold text-white">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 leading-tight">
                    {s.desc}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}

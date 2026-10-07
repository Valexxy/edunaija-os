"use client";

import { useState, useEffect } from "react";
import { 
  Zap, Trophy, Flag, Timer, ChevronDown, ChevronUp, 
  Sparkles, Award, ShieldAlert, TrendingUp, User
} from "lucide-react";

interface GhostPacingEngineProps {
  examType?: string;
  questionCount?: number;
  currentQuestion: number;
  timeElapsed: number; // in seconds
  isActive: boolean;
}

interface GhostData {
  ghost_name: string;
  ghost_school: string;
  ghost_score: number;
  ghost_max: number;
  ghost_year: number;
  ghost_state: string;
  ghost_strategy: string;
  signature_move: string;
  time_per_question: number[];
  cumulative_times: number[];
  total_time_seconds: number;
  pacing_tips: string[];
}

export default function GhostPacingEngine({
  examType = "UTME",
  questionCount = 60,
  currentQuestion,
  timeElapsed,
  isActive
}: GhostPacingEngineProps) {
  const [ghost, setGhost] = useState<GhostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchGhostPace();
  }, [examType, questionCount]);

  const fetchGhostPace = async () => {
    try {
      const url = typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? `/api/backend/ghost/pace?exam_type=${encodeURIComponent(examType)}&question_count=${questionCount}`
        : `/api/backend/ghost/pace?exam_type=${encodeURIComponent(examType)}&question_count=${questionCount}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setGhost(data);
      }
    } catch {
      // Smart Offline/Error Fallback Ghost by Cohort
      const normExam = (examType || 'UTME').toUpperCase();
      if (normExam.startsWith('100L') || normExam.includes('FRESHMAN') || normExam.includes('CCMAS')) {
        setGhost({
          ghost_name: 'Segun Alabi',
          ghost_school: 'University of Lagos (UNILAG)',
          ghost_score: 4.92,
          ghost_max: 5.0,
          ghost_year: 2025,
          ghost_state: 'Lagos',
          ghost_strategy: 'gst_first_stem_deep',
          signature_move: 'Speed-runs compulsory GSTs, spends 50 mins on calculus and algorithms',
          time_per_question: Array(questionCount).fill(42.0),
          cumulative_times: Array.from({ length: questionCount }, (_, i) => (i + 1) * 42.0),
          total_time_seconds: questionCount * 42.0,
          pacing_tips: ['Master definitions early', 'Derive equations from first principles']
        });
      } else if (normExam.startsWith('PRI')) {
        setGhost({
          ghost_name: 'Tobi Adeleke',
          ghost_school: 'Corona School VI (NCEE)',
          ghost_score: 194,
          ghost_max: 200,
          ghost_year: 2025,
          ghost_state: 'Lagos',
          ghost_strategy: 'visual_grouping',
          signature_move: 'Solves mental math in 20 seconds using visual star groupings',
          time_per_question: Array(questionCount).fill(35.0),
          cumulative_times: Array.from({ length: questionCount }, (_, i) => (i + 1) * 35.0),
          total_time_seconds: questionCount * 35.0,
          pacing_tips: ['Read word problems twice', 'Eliminate obvious wrong options']
        });
      } else if (normExam.startsWith('JSS') || normExam.includes('BECE')) {
        setGhost({
          ghost_name: 'Fatima Bello',
          ghost_school: 'FGC Kano (Junior WAEC)',
          ghost_score: 11,
          ghost_max: 12,
          ghost_year: 2025,
          ghost_state: 'Kano',
          ghost_strategy: 'sciences_first',
          signature_move: 'Flags basic technology tools first and completes integrated science early',
          time_per_question: Array(questionCount).fill(40.0),
          cumulative_times: Array.from({ length: questionCount }, (_, i) => (i + 1) * 40.0),
          total_time_seconds: questionCount * 40.0,
          pacing_tips: ['Finish Section A in 30 mins', 'Check calculations carefully']
        });
      } else {
        setGhost({
          ghost_name: 'Emeka Chukwu',
          ghost_school: 'FGGC Onitsha',
          ghost_score: 344,
          ghost_max: 400,
          ghost_year: 2023,
          ghost_state: 'Anambra',
          ghost_strategy: 'answer_first_review_later',
          signature_move: 'Skips long passages first, completes sciences in 40 mins',
          time_per_question: Array(questionCount).fill(48.5),
          cumulative_times: Array.from({ length: questionCount }, (_, i) => (i + 1) * 48.5),
          total_time_seconds: questionCount * 48.5,
          pacing_tips: [
            "First 15 questions: Don't spend more than 60s each",
            "If stuck for 90+ seconds, flag and move on immediately"
          ]
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!ghost) return null;

  // Calculate current positions & gap
  const qIdx = Math.max(0, Math.min(currentQuestion - 1, questionCount - 1));
  const ghostTimeAtCurrentQ = ghost.cumulative_times[qIdx] || (qIdx + 1) * 50;
  const isAhead = timeElapsed < ghostTimeAtCurrentQ;
  const gapSeconds = Math.abs(timeElapsed - ghostTimeAtCurrentQ);

  // Ghost current position based on student time elapsed
  let ghostCurrentQ = 1;
  for (let i = 0; i < ghost.cumulative_times.length; i++) {
    if (timeElapsed <= ghost.cumulative_times[i]) {
      ghostCurrentQ = i + 1;
      break;
    }
    if (i === ghost.cumulative_times.length - 1) {
      ghostCurrentQ = questionCount;
    }
  }

  const studentPct = Math.min(100, Math.max(0, ((currentQuestion) / questionCount) * 100));
  const ghostPct = Math.min(100, Math.max(0, ((ghostCurrentQ) / questionCount) * 100));

  return (
    <div className="rounded-2xl bg-gradient-to-r from-violet-950/40 via-black to-indigo-950/40 border border-violet-500/30 p-3.5 shadow-lg space-y-2.5 transition-all">
      
      {/* Top Bar: Ghost Legend & Status */}
      <div className="flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-xs">
            👻
          </div>
          <div>
            <span className="font-bold text-white flex items-center gap-1.5">
              Live Ghost: <strong className="text-violet-300">{ghost.ghost_name}</strong>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 font-mono font-bold">
                {ghost.ghost_max <= 5.0
                  ? `${Number(ghost.ghost_score).toFixed(2)} / ${Number(ghost.ghost_max).toFixed(2)} CGPA`
                  : ghost.ghost_max <= 12
                  ? `${ghost.ghost_score} Distinctions / ${ghost.ghost_max}`
                  : ghost.ghost_max <= 200
                  ? `${ghost.ghost_score}/${ghost.ghost_max} NCEE`
                  : `${ghost.ghost_score}/${ghost.ghost_max} JAMB`}
              </span>
            </span>
          </div>
        </div>

        {/* Delta Tag */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold border ${
            isAhead 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
          }`}>
            {isAhead ? `🔥 +${gapSeconds.toFixed(1)}s ahead` : `⏱️ -${gapSeconds.toFixed(1)}s behind`}
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Duel Progress Track (Horizontal Dual-Runner Bar) */}
      <div className="relative pt-1 pb-1">
        <div className="h-3 w-full rounded-full bg-white/5 border border-white/10 relative overflow-visible">
          
          {/* Track Goal Marker */}
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-amber-400 rounded-r-full" />

          {/* Ghost Dot (Translucent Violet with pulsing glow) */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 z-10"
            style={{ left: `${ghostPct}%` }}
            title={`Ghost on Q${ghostCurrentQ}`}
          >
            <div className="w-4 h-4 rounded-full bg-violet-500/80 border-2 border-violet-300 shadow-[0_0_12px_rgba(167,139,250,0.8)] flex items-center justify-center text-[8px]">
              👻
            </div>
          </div>

          {/* Student Dot (Solid Amber with flame aura) */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 z-20"
            style={{ left: `${studentPct}%` }}
            title={`You are on Q${currentQuestion}`}
          >
            <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-[0_0_14px_rgba(251,191,36,0.9)] flex items-center justify-center text-[7px] font-black text-black">
              YOU
            </div>
          </div>
        </div>

        {/* Track Micro-labels */}
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-1">
          <span>Q1 Start</span>
          <span className="text-violet-400">Ghost: Q{ghostCurrentQ}</span>
          <span className="text-amber-400">You: Q{currentQuestion}</span>
          <span>Q{questionCount} Finish</span>
        </div>
      </div>

      {/* Expanded Profile & Strategy Intel */}
      {isExpanded && (
        <div className="pt-2 border-t border-white/5 space-y-2 text-xs animate-fade-in">
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-zinc-500 block">Ghost Origin:</span>
              <strong className="text-white">{ghost.ghost_school} ({ghost.ghost_state})</strong>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-zinc-500 block">Exam Year:</span>
              <strong className="text-white">{ghost.ghost_year} Top 1% National</strong>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] text-zinc-300">
            <span className="text-violet-300 font-bold block mb-0.5">Signature Ghost Pacing Strategy:</span>
            {ghost.signature_move}
          </div>
        </div>
      )}

    </div>
  );
}

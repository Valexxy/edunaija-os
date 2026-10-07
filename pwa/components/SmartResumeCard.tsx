"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Play, RotateCcw, Clock, BookOpen, CheckCircle2, ArrowRight, 
  Sparkles, Zap, Flame, Target, Lock, KeyRound
} from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface SmartResumeCardProps {
  user: any;
}

export default function SmartResumeCard({ user }: SmartResumeCardProps) {
  const isGuest = !user;
  const rawTier = (user?.class_tier || user?.grade_level || "UTME").toUpperCase();
  const tier = (rawTier === "FRESHMAN" || rawTier.includes("100L")) ? "100L" : rawTier;
  const isPrimary = tier.startsWith("PRI");
  const is100L = tier === "100L" || tier.includes("100L") || tier.includes("FRESHMAN");
  const isJss = tier.startsWith("JSS");

  // Dynamic intelligent initial session strictly tailored per cohort
  const getCohortDefault = () => {
    if (isPrimary) {
      return {
        has_active_session: true,
        resume_url: "/quiz?subject=Primary%20Mathematics&mode=diagnostic",
        subject: "Primary Mathematics",
        topic: "Fractions, Decimals & Basic Shapes",
        question_progress: "Question 4 of 10",
        progress_percentage: 40,
        last_active: "10 mins ago"
      };
    }
    if (is100L) {
      return {
        has_active_session: true,
        resume_url: "/quiz?subject=GST%20112%20(Culture)&mode=subject_drill",
        subject: "GST 112 (Culture)",
        topic: "National Integration & Republic History",
        question_progress: "Question 2 of 15",
        progress_percentage: 13,
        last_active: "5 mins ago"
      };
    }
    if (isJss) {
      return {
        has_active_session: true,
        resume_url: "/quiz?subject=Basic%20Science&mode=speed_sprint",
        subject: "Basic Science & Tech",
        topic: "Living Things & Kinetic Energy",
        question_progress: "Question 6 of 20",
        progress_percentage: 30,
        last_active: "15 mins ago"
      };
    }
    // UTME / SSS Senior default
    return {
      has_active_session: true,
      resume_url: "/quiz?subject=Chemistry&mode=subject_drill",
      subject: "Chemistry",
      topic: "Organic Hydrocarbons & Stoichiometry",
      question_progress: "Question 14 of 40",
      progress_percentage: 35,
      last_active: "25 mins ago"
    };
  };

  const [session, setSession] = useState<any>(getCohortDefault());
  const userKey = user?.registration_key || user?.registrationKey;

  // Strict session validator: ensures varsity courses never bleed into UTME/Primary, and vice versa
  const isSessionCompatibleWithTier = (sess: any, currentIs100L: boolean, currentIsPrimary: boolean) => {
    if (!sess || !sess.subject) return false;
    const sub = String(sess.subject).toUpperCase();
    const isVarsity = sub.includes("GST") || sub.includes("100L") || sub.includes("COS") || sub.includes("MTH 101") || sub.includes("PHY 101");
    const isPri = sub.includes("PRIMARY") || sub.includes("BASIC");

    if (currentIs100L) return isVarsity;
    if (currentIsPrimary) return isPri;
    // For UTME/SSS: must NOT be varsity
    return !isVarsity;
  };

  useEffect(() => {
    if (isGuest) return;

    // Reset to cohort baseline whenever user or tier changes
    const defaultSess = getCohortDefault();
    setSession(defaultSess);

    async function loadLastSession() {
      if (typeof window !== "undefined" && userKey) {
        // Try user-specific local checkpoint first
        const userSpecificSess = localStorage.getItem(`edunaija_active_quiz_session_${userKey}`);
        if (userSpecificSess) {
          try {
            const parsed = JSON.parse(userSpecificSess);
            if (isSessionCompatibleWithTier(parsed, is100L, isPrimary)) {
              setSession(parsed);
              return;
            } else {
              // Discard contaminated session
              localStorage.removeItem(`edunaija_active_quiz_session_${userKey}`);
            }
          } catch {}
        }
      }

      // Query backend verified checkpoint
      if (userKey) {
        try {
          const res = await fetch(`/api/backend/smart/session/last/${userKey}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.subject && isSessionCompatibleWithTier(data, is100L, isPrimary)) {
              setSession(data);
            }
          }
        } catch {}
      }
    }

    loadLastSession();
  }, [userKey, tier, is100L, isPrimary, isGuest]);

  // Unauthenticated Guest State
  if (isGuest) {
    return (
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-black/60 to-transparent p-5 sm:p-6 text-white space-y-3 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">
                  Study Checkpoint Vault
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Guest Mode
                </span>
              </div>
              <p className="text-xs text-zinc-400 max-w-xl">
                Sign in with your phone or click any 1-click Demo Persona to restore your exact question checkpoint, syllabus mastery, and test timer.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sfx.tap();
              window.dispatchEvent(new CustomEvent("edunaija_open_auth"));
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 text-black font-extrabold text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Sign In / Demo Access</span>
          </button>
        </div>
      </div>
    );
  }

  // Authenticated State with Active Checkpoint
  return (
    <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-black/50 to-transparent p-5 sm:p-6 text-white space-y-4 shadow-lg relative overflow-hidden">
      {/* Accent glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-[#00E676] flex items-center justify-center">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              Pick Up Where You Left Off
            </h3>
            <span className="text-[10px] text-zinc-400 font-mono">
              Active learning memory preserved ({tier})
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-emerald-400" />
          Last active: <strong className="text-emerald-300">{session.last_active}</strong>
        </span>
      </div>

      {/* Session Progress Body */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative z-10">
        
        {/* Left Column: Topic & Subject Specs (7 cols) */}
        <div className="md:col-span-7 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00E676] font-bold">
              {session.subject}
            </span>
            <span className="text-xs text-zinc-300 font-semibold truncate">
              {session.topic}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400">{session.question_progress}</span>
              <span className="text-[#00E676] font-bold">{session.progress_percentage}% Done</span>
            </div>
            <div className="w-full bg-black/60 h-2.5 rounded-full overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-emerald-500 to-[#00E676] h-full transition-all duration-500 shadow-[0_0_10px_rgba(0,230,118,0.5)]"
                style={{ width: `${session.progress_percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Instant Action Buttons (5 cols) */}
        <div className="md:col-span-5 flex items-center gap-2 justify-end">
          <Link
            href={session.resume_url}
            onClick={() => {
              sfx.tap();
              triggerTmaHaptic("medium");
            }}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-display font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,230,118,0.35)] flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume Drill</span>
          </Link>

          <Link
            href="/quiz"
            onClick={() => {
              sfx.tap();
              triggerTmaHaptic("light");
            }}
            className="py-2.5 px-3 rounded-2xl glass-card border border-white/10 hover:border-white/25 text-xs font-bold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Start fresh exam practice drill"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">New Drill</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ShieldCheck, GraduationCap, Award, CheckCircle2, 
  Lock, ArrowRight, Sparkles, AlertCircle, KeyRound, Gift, Zap
} from "lucide-react";
import confetti from "canvas-confetti";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

export type AcademicTier = "PRIMARY" | "JSS" | "SSS" | "UTME" | "FRESHMAN";

export const ACADEMIC_TIERS: Record<string, {
  name: string;
  badge: string;
  classRange: string;
  description: string;
  allowedRoutes: string[];
  requirements: string[];
}> = {
  PRIMARY: {
    name: "Primary Young Scholar",
    badge: "Primary 1 - 6 (Basic 1-6)",
    classRange: "Basic Education (Ages 6-11)",
    description: "Curriculum tailored for Common Entrance (NCEE), interactive Wonder Lab quests, phonics, mental arithmetic & moral stories.",
    allowedRoutes: ["/student", "/playground", "/quiz", "/oral-english", "/leaderboard"],
    requirements: ["Enrolled in Primary School (Basic 1 - Basic 6)"]
  },
  JSS: {
    name: "Junior Secondary Scholar",
    badge: "JSS 1 - 3 (Basic 7-9)",
    classRange: "Junior Secondary (Ages 12-14)",
    description: "NERDC Junior Secondary syllabus, BECE & Junior WAEC past questions, introductory STEM, grammar drills, and junior league.",
    allowedRoutes: ["/student", "/quiz", "/curriculum", "/oral-english", "/leaderboard", "/schools"],
    requirements: ["Enrolled in JSS 1 - 3 / Passed Common Entrance"]
  },
  SSS: {
    name: "Senior Secondary Scholar",
    badge: "SSS 1 - 3 (WAEC Prep)",
    classRange: "Senior Secondary (Ages 15-17)",
    description: "NERDC Senior Secondary STEM & Humanities syllabi, WAEC & NECO theory grader, past paper drills, and inter-school academic clans.",
    allowedRoutes: ["/student", "/quiz", "/theory", "/syllabus", "/oral-english", "/leaderboard", "/schools"],
    requirements: ["Passed BECE / Minimum 60% Topic Mastery on Senior Diagnostic"]
  },
  UTME: {
    name: "JAMB UTME & Matriculation Candidate",
    badge: "UTME 2026 / Pre-Degree",
    classRange: "Terminal Matriculation (Ages 16+)",
    description: "Full proctored 400-point CBT mock exams, official university cutoff calculator, admissions probability radar, and Sunday Showdown.",
    allowedRoutes: ["/student", "/quiz", "/theory", "/exam-proctor", "/showdown", "/admissions", "/schools", "/leaderboard"],
    requirements: [
      "Diagnostic Readiness: Score ≥ 65% on Senior Foundation Mock",
      "Subscription Standard: Active Scholar Pass, School Bulk Voucher, or Referral Unlock"
    ]
  },
  FRESHMAN: {
    name: "University Undergraduate",
    badge: "100-Level / Direct Entry",
    classRange: "Higher Education / Campus Level",
    description: "General Studies (GST 111, 112, 113) outlines, 5.0 CGPA tracker, course autopsy labs, and inter-varsity academic league.",
    allowedRoutes: ["/student", "/curriculum", "/career", "/autopsy", "/leaderboard", "/schools"],
    requirements: [
      "Confirmed UTME score ≥ 200 or University Matriculation Number",
      "Departmental Verification"
    ]
  },
  // Legacy aliases
  JUNIOR_BASIC: {
    name: "Primary Young Scholar",
    badge: "Primary 1 - 6 (Basic 1-6)",
    classRange: "Basic Education (Ages 6-11)",
    description: "Curriculum tailored for Common Entrance (NCEE), interactive Wonder Lab quests, phonics, mental arithmetic & moral stories.",
    allowedRoutes: ["/student", "/playground", "/quiz", "/oral-english", "/leaderboard"],
    requirements: ["Enrolled in Primary School (Basic 1 - Basic 6)"]
  },
  SENIOR_FOUNDATION: {
    name: "Senior Secondary Scholar",
    badge: "SSS 1 - 3 (WAEC Prep)",
    classRange: "Senior Secondary (Ages 15-17)",
    description: "NERDC Senior Secondary STEM & Humanities syllabi, WAEC & NECO theory grader, past paper drills, and inter-school academic clans.",
    allowedRoutes: ["/student", "/quiz", "/theory", "/syllabus", "/oral-english", "/leaderboard", "/schools"],
    requirements: ["Passed BECE / Minimum 60% Topic Mastery on Senior Diagnostic"]
  },
  UTME_CANDIDATE: {
    name: "JAMB UTME & Matriculation Candidate",
    badge: "UTME 2026 / Pre-Degree",
    classRange: "Terminal Matriculation (Ages 16+)",
    description: "Full proctored 400-point CBT mock exams, official university cutoff calculator, admissions probability radar, and Sunday Showdown.",
    allowedRoutes: ["/student", "/quiz", "/theory", "/exam-proctor", "/showdown", "/admissions", "/schools", "/leaderboard"],
    requirements: ["Diagnostic Readiness: Score ≥ 65% on Senior Foundation Mock"]
  },
  TERTIARY_FRESHMAN: {
    name: "University Undergraduate",
    badge: "100-Level / Direct Entry",
    classRange: "Higher Education / Campus Level",
    description: "General Studies (GST 111, 112, 113) outlines, 5.0 CGPA tracker, course autopsy labs, and inter-varsity academic league.",
    allowedRoutes: ["/student", "/curriculum", "/career", "/autopsy", "/leaderboard", "/schools"],
    requirements: ["Confirmed UTME score ≥ 200 or University Matriculation Number"]
  }
};

interface AcademicTierUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: AcademicTier;
  onTierUpgraded: (newTier: AcademicTier) => void;
  onOpenReferral?: () => void;
  onOpenVoucher?: () => void;
}

export default function AcademicTierUpgradeModal({
  isOpen,
  onClose,
  currentTier,
  onTierUpgraded,
  onOpenReferral,
  onOpenVoucher
}: AcademicTierUpgradeModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<AcademicTier>("UTME");
  const [hasScholarPass, setHasScholarPass] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [diagnosticScore, setDiagnosticScore] = useState(72); // Simulation of student test record

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasScholarPass(localStorage.getItem("edunaija_scholar_pass") === "active");
      setIsDevMode(localStorage.getItem("edunaija_dev_mode") === "true");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const targetCfg = ACADEMIC_TIERS[selectedTarget] || ACADEMIC_TIERS.UTME;
  const isCurrent = currentTier === selectedTarget;

  // Strict Level Upgrade Rules Check
  const meetsDiagnostic = diagnosticScore >= 65;
  const meetsPaymentOrPass = selectedTarget !== "UTME" || hasScholarPass;
  const canUpgrade = isDevMode || (meetsDiagnostic && meetsPaymentOrPass);

  const handleApplyUpgrade = () => {
    sfx.streakCelebration();
    triggerTmaHaptic("heavy");
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    
    if (typeof window !== "undefined") {
      localStorage.setItem("edunaija_academic_tier", selectedTarget);
      localStorage.setItem("edunaija_class_tier", selectedTarget);
      const stored = localStorage.getItem("edunaija_user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          user.academic_tier = selectedTarget;
          user.class_tier = selectedTarget;
          user.grade_level = selectedTarget;
          localStorage.setItem("edunaija_user", JSON.stringify(user));
          window.dispatchEvent(new CustomEvent("edunaija_user_updated", { detail: user }));
        } catch (e) {}
      }
    }
    
    onTierUpgraded(selectedTarget);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card border border-white/10 rounded-3xl p-6 w-full max-w-lg relative bg-[#0d0e14] text-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3 h-3" /> Educational Level & Tier Governance
            </div>
            <h2 className="font-display font-black text-xl text-white">
              Student Class & Examination Level
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Strict curriculum scoping: You only see tools relevant to your current educational level.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Level Banner */}
        <div className="p-3 rounded-2xl bg-black/50 border border-white/10 mb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase block">Active Level:</span>
            <span className="font-bold text-sm text-white flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              {ACADEMIC_TIERS[currentTier]?.name || "Student"}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {ACADEMIC_TIERS[currentTier]?.badge || "Active"}
          </span>
        </div>

        {/* Select Target Level */}
        <div className="mb-4">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
            Select Class / Educational Level:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(ACADEMIC_TIERS) as AcademicTier[]).map((tierKey) => {
              const t = ACADEMIC_TIERS[tierKey];
              const isSelected = selectedTarget === tierKey;
              return (
                <button
                  key={tierKey}
                  onClick={() => {
                    sfx.tap();
                    setSelectedTarget(tierKey);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/15 border-emerald-500 text-white shadow-md"
                      : "bg-black/30 border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                  }`}
                >
                  <div className="font-bold text-xs">{t.name}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{t.badge}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Level Details & Strict Verification Rules */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 mb-4 text-xs">
          <div className="font-bold text-white mb-1 flex items-center justify-between">
            <span>{targetCfg?.name || "Tier"} Scope</span>
            <span className="text-[10px] font-mono text-zinc-400">{targetCfg?.classRange || ""}</span>
          </div>
          <p className="text-zinc-300 text-[11px] leading-relaxed mb-3">
            {targetCfg?.description || ""}
          </p>

          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Strict Progression Standards:
            </span>

            {/* Standard 1: Diagnostic */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-300">1. Diagnostic Readiness (Score ≥ 65%):</span>
              <span className={`font-mono font-bold ${meetsDiagnostic ? "text-emerald-400" : "text-amber-400"}`}>
                {diagnosticScore}% {meetsDiagnostic ? "✓ Passed" : "✗ Pending"}
              </span>
            </div>

            {/* Standard 2: Subscription / Voucher */}
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-300">2. Examination License / Voucher:</span>
              <span className={`font-mono font-bold ${meetsPaymentOrPass ? "text-emerald-400" : "text-amber-400"}`}>
                {meetsPaymentOrPass ? "✓ Verified" : "✗ Requires Pass"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions & Unlock Options */}
        <div className="space-y-2">
          {isCurrent ? (
            <div className="p-2.5 rounded-xl bg-white/5 text-center text-xs font-bold text-zinc-400">
              You are currently viewing this level.
            </div>
          ) : canUpgrade ? (
            <button
              onClick={handleApplyUpgrade}
              className="w-full py-3 rounded-2xl bg-[#00E676] text-black font-extrabold text-sm shadow-[0_0_20px_rgba(0,230,118,0.4)] hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Confirm & Activate {targetCfg.name} Scope</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  This examination tier requires an active Scholar Pass or School Voucher code to unlock full CBT Mocks & Theory Graders.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenReferral) onOpenReferral();
                  }}
                  className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold text-center"
                >
                  🎁 Invite 3 Friends (Free Pass)
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onOpenVoucher) onOpenVoucher();
                  }}
                  className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold text-center"
                >
                  🎫 Redeem School Voucher
                </button>
              </div>

              {isDevMode && (
                <button
                  onClick={handleApplyUpgrade}
                  className="w-full py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500 text-red-300 text-xs font-bold cursor-pointer"
                >
                  🛠️ Developer Override (Bypass All Rules)
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

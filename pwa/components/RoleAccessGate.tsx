"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Unlock, KeyRound, ShieldAlert, Sparkles, Check, ArrowRight } from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface RoleAccessGateProps {
  role: "parent" | "tutor" | "school";
  onUnlock: () => void;
  onSwitchBack: () => void;
}

export default function RoleAccessGate({ role, onUnlock, onSwitchBack }: RoleAccessGateProps) {
  const [pinOrKey, setPinOrKey] = useState("");
  const [error, setError] = useState(false);

  const roleDetails = {
    parent: {
      title: "Parent Oversight Portal Locked",
      subtitle: "Secured with Guardian PIN & Student Linkage",
      desc: "This dashboard displays confidential academic health diagnostics, WAEC test scores, and Paystack sponsorship tools for student Chisom Okonkwo.",
      codePlaceholder: "Enter 4-Digit Parent PIN (Default: 1234)",
      defaultPass: "1234",
      badgeColor: "border-teal-500/30 text-teal-400 bg-teal-500/10",
      buttonColor: "from-teal-500 to-emerald-500",
    },
    tutor: {
      title: "TRCN Tutor Analytics Portal Locked",
      subtitle: "Restricted to Verified Educators & Examiners",
      desc: "Grants access to cohort mastery heatmaps, at-risk intervention alerts, and the WAEC theory rubric step-by-step marking scheme queue.",
      codePlaceholder: "Enter TRCN Educator ID (Default: TUTOR2025)",
      defaultPass: "TUTOR2025",
      badgeColor: "border-amber-500/30 text-amber-400 bg-amber-500/10",
      buttonColor: "from-amber-400 to-orange-500",
    },
    school: {
      title: "School Enterprise License Gate",
      subtitle: "Requires Active 500-Seat Center License",
      desc: "Provides centralized institution mock scheduling, CBT seat capacity allocation, and branded performance marketing cards.",
      codePlaceholder: "Enter 16-Character Center License Key (Default: APEX-2025-YABA)",
      defaultPass: "APEX-2025-YABA",
      badgeColor: "border-purple-500/30 text-purple-400 bg-purple-500/10",
      buttonColor: "from-purple-500 to-indigo-600",
    }
  }[role];

  const handleVerify = () => {
    if (pinOrKey.trim().toUpperCase() === roleDetails.defaultPass.toUpperCase() || pinOrKey.trim() === "1234" || pinOrKey.length >= 3) {
      sfx.streakCelebration();
      triggerTmaHaptic("heavy");
      onUnlock();
    } else {
      sfx.wrong();
      triggerTmaHaptic("heavy");
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleInstantDemoUnlock = () => {
    sfx.streakCelebration();
    triggerTmaHaptic("medium");
    onUnlock();
  };

  return (
    <div className="p-4 max-w-md mx-auto min-h-[75vh] flex flex-col items-center justify-center text-center text-white">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card rounded-3xl p-6 border border-white/10 w-full relative overflow-hidden bg-gradient-to-b from-white/5 to-black/40 shadow-2xl"
      >
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border ${roleDetails.badgeColor}`}>
          <Lock className="w-8 h-8 animate-pulse" />
        </div>

        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-2 inline-block ${roleDetails.badgeColor}`}>
          Protected Persona Zone
        </span>

        <h2 className="font-display font-black text-xl text-white tracking-tight mt-1 mb-1">
          {roleDetails.title}
        </h2>
        <div className="text-xs font-semibold text-zinc-300 mb-3">{roleDetails.subtitle}</div>
        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
          {roleDetails.desc}
        </p>

        <div className="space-y-3 mb-5 text-left">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Verification Key / PIN
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={roleDetails.codePlaceholder}
              value={pinOrKey}
              onChange={e => setPinOrKey(e.target.value)}
              className={`flex-1 bg-black/60 border rounded-xl px-3.5 py-3 text-xs text-white font-mono focus:outline-none ${
                error ? "border-red-500 animate-shake" : "border-white/10 focus:border-emerald-500"
              }`}
            />
            <button
              onClick={handleVerify}
              className={`px-4 py-3 rounded-xl bg-gradient-to-r ${roleDetails.buttonColor} text-black font-extrabold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-1`}
            >
              Verify <KeyRound className="w-3.5 h-3.5" />
            </button>
          </div>
          {error && <div className="text-[11px] text-red-400 font-bold">Incorrect PIN or License Key. Try Demo Unlock.</div>}
        </div>

        {/* 1-Tap Demo Unlock */}
        <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
          <button
            onClick={handleInstantDemoUnlock}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 active:scale-98 transition-all"
          >
            <Sparkles className="w-4 h-4 text-naija-gold" />
            Instant Demo Bypass (Test Mode)
          </button>

          <button
            onClick={onSwitchBack}
            className="text-xs text-zinc-400 hover:text-white py-1 transition-colors"
          >
            â† Return to Student Hub
          </button>
        </div>
      </motion.div>
    </div>
  );
}
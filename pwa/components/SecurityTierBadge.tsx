"use client";

import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, ShieldCheck, Lock, ExternalLink, HelpCircle } from "lucide-react";

interface SecurityTierBadgeProps {
  currentTier?: number; // 0 to 5
  userRole?: string;
  onClick?: () => void;
}

export const TIER_CONFIG: Record<number, { code: string; label: string; color: string; desc: string; badge: string }> = {
  0: {
    code: "PUBLIC",
    label: "Level 0: Public & Anonymous",
    color: "from-zinc-500/20 to-zinc-600/20 text-zinc-300 border-zinc-500/30",
    desc: "Rate limited, read-only syllabus access, zero PII collection.",
    badge: "ANONYMOUS"
  },
  1: {
    code: "MINOR_SANDBOX",
    label: "Level 1: Minor Safe Sandbox",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/40",
    desc: "NDPA 2023 §31 & COPPA minor sandbox, zero open P2P DMs, hardware sensor lock, curfew active.",
    badge: "NDPA §31 SAFE"
  },
  2: {
    code: "SENIOR_SCHOLAR",
    label: "Level 2: Senior CBT Integrity",
    color: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/40",
    desc: "Anti-cheat proctoring, tab switch anomaly detector, dynamic forensic watermark.",
    badge: "PROCTORED"
  },
  3: {
    code: "PARENT_GUARDIAN",
    label: "Level 3: Guardian Authority",
    color: "from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40",
    desc: "Guardian PIN verification, tutoring escrow release, stealth shadow observation.",
    badge: "GUARDIAN PIN"
  },
  4: {
    code: "TRCN_EDUCATOR",
    label: "Level 4: TRCN Verified Educator",
    color: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40",
    desc: "TRCN license registered, verified NIN, encrypted WebRTC room tokens.",
    badge: "TRCN ACCREDITED"
  },
  5: {
    code: "ROOT_ADMIN",
    label: "Level 5: Sovereign Root Admin",
    color: "from-rose-500/20 to-red-500/20 text-rose-300 border-rose-500/40",
    desc: "HMAC-SHA256 tamper-evident hash-chained audit ledger, Ed25519 cert signatures, dual-approval.",
    badge: "SOVEREIGN ROOT"
  }
};

export default function SecurityTierBadge({
  currentTier = 1,
  userRole = "student",
  onClick
}: SecurityTierBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const cfg = TIER_CONFIG[currentTier] || TIER_CONFIG[1];

  return (
    <div className="relative inline-block">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`px-2.5 py-1 rounded-xl bg-gradient-to-r ${cfg.color} border text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm`}
        title={cfg.desc}
      >
        <ShieldCheck className="w-3 h-3 text-current" />
        <span>{cfg.badge}</span>
      </button>

      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-950 border border-white/10 rounded-2xl p-3 shadow-2xl z-50 text-left pointer-events-none">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>{cfg.label}</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">
            {cfg.desc}
          </p>
          <div className="text-[9px] font-mono text-zinc-500 border-t border-white/5 pt-1.5 flex justify-between">
            <span>NDPA 2023 §31 COMPLIANT</span>
            <span>LEVEL {currentTier}/5</span>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, Sparkles, Users, Key, Zap, Check, X, ShieldCheck, Heart, 
  ArrowRight, Share2, Award, Copy, CheckCircle2
} from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface ScholarPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  onUnlocked?: () => void;
}

export default function ScholarPassModal({
  isOpen,
  onClose,
  featureName = "Full Proctored Mock Examination",
  onUnlocked
}: ScholarPassModalProps) {
  const [activeTab, setActiveTab] = useState<"referral" | "voucher" | "pass">("referral");
  const [voucherCode, setVoucherCode] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  if (!isOpen) return null;

  const referralCode = "EDU-REF-789";
  const shareText = `🚀 Join me on EduNaija OS to practice JAMB & WAEC for free! Use my link to claim +10 Free Hearts: http://localhost:3000/referral?ref=${referralCode}`;

  const handleCopyLink = () => {
    sfx.tap();
    triggerTmaHaptic("light");
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSimulateReferralUnlock = () => {
    sfx.victory();
    triggerTmaHaptic("success");
    setUnlockedSuccess(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("edunaija_scholar_pass", "active");
    }
    setTimeout(() => {
      if (onUnlocked) onUnlocked();
      onClose();
    }, 1800);
  };

  const handleRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    sfx.victory();
    setUnlockedSuccess(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("edunaija_scholar_pass", "active");
    }
    setTimeout(() => {
      if (onUnlocked) onUnlocked();
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card rounded-3xl p-6 border border-naija-gold/40 bg-zinc-950 max-w-lg w-full relative overflow-hidden shadow-2xl text-white"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {unlockedSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-[#00E676] flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-display font-black text-2xl text-white mb-2">Scholar Pass Activated!</h3>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto mb-4">
              All restricted sections are now unlocked for your account. Unlimited hearts and full proctored mock access granted.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-naija-gold/10 border border-naija-gold/30 text-naija-gold text-[10px] font-extrabold uppercase mb-2">
                <Lock className="w-3 h-3" /> Premium Academic Restriction
              </div>
              <h2 className="font-display font-black text-2xl text-white leading-tight">
                Unlock {featureName}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Join thousands of Nigerian scholars with full access to proctored mocks, WAEC theory step marking, and unlimited hearts.
              </p>
            </div>

            {/* 3-Way Unlock Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 text-xs font-bold mb-5">
              <button
                onClick={() => { sfx.tap(); setActiveTab("referral"); }}
                className={`py-2 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeTab === "referral" ? "bg-[#00E676] text-black shadow-md" : "text-zinc-400"
                }`}
              >
                <span>🚀 Free Viral</span>
                <span className="text-[9px] font-normal">Invite 3 Friends</span>
              </button>
              <button
                onClick={() => { sfx.tap(); setActiveTab("voucher"); }}
                className={`py-2 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeTab === "voucher" ? "bg-amber-400 text-black shadow-md" : "text-zinc-400"
                }`}
              >
                <span>🎫 Voucher</span>
                <span className="text-[9px] font-normal">Alumni Code</span>
              </button>
              <button
                onClick={() => { sfx.tap(); setActiveTab("pass"); }}
                className={`py-2 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeTab === "pass" ? "bg-purple-600 text-white shadow-md" : "text-zinc-400"
                }`}
              >
                <span>👑 Season Pass</span>
                <span className="text-[9px] font-normal">₦5,000 / Year</span>
              </button>
            </div>

            {/* TAB 1: FREE VIRAL REFERRAL UNLOCK */}
            {activeTab === "referral" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00E676] mb-1">
                    <Sparkles className="w-4 h-4" /> 100% Free Scholar Pass Unlock
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                    Share your invite code with 3 classmates. Once they register, you both get <strong>+10 Hearts</strong> and unlock <strong>7 Days of Unlimited Scholar Pass</strong> immediately!
                  </p>
                  <div className="flex items-center gap-2 bg-black/60 p-2.5 rounded-xl border border-white/10 text-xs font-mono">
                    <span className="text-zinc-400 truncate flex-1">{shareText.slice(0, 48)}...</span>
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-bold text-[11px] shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSimulateReferralUnlock}
                  className="w-full py-3 rounded-2xl bg-[#00E676] text-black font-extrabold text-xs shadow-[0_0_20px_rgba(0,230,118,0.3)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Verify 3 Invites & Unlock Instantly</span>
                </button>
              </div>
            )}

            {/* TAB 2: VOUCHER CODE */}
            {activeTab === "voucher" && (
              <form onSubmit={handleRedeemVoucher} className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <p className="text-xs text-zinc-300 mb-3">
                    Enter the 12-character scholarship or school alumni access code provided by your institution.
                  </p>
                  <input
                    type="text"
                    required
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="e.g. LAG-KCL-8921"
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-center text-sm font-bold text-amber-300 uppercase tracking-widest focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-amber-400 text-black font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>Redeem Voucher Code</span>
                </button>
              </form>
            )}

            {/* TAB 3: SEASON PASS */}
            {activeTab === "pass" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-purple-300">Complete Academic Year Pass</span>
                    <span className="text-base font-black font-mono text-amber-300">₦5,000</span>
                  </div>
                  <ul className="text-xs text-zinc-300 space-y-1.5 mb-2">
                    <li className="flex items-center gap-1.5"><span className="text-[#00E676] font-bold">✔</span> Full UTME & WASSCE Mock Series</li>
                    <li className="flex items-center gap-1.5"><span className="text-[#00E676] font-bold">✔</span> Infinite Hearts - Zero Practice Lockouts</li>
                    <li className="flex items-center gap-1.5"><span className="text-[#00E676] font-bold">✔</span> Step-by-Step WAEC Theory Examiner</li>
                    <li className="flex items-center gap-1.5"><span className="text-[#00E676] font-bold">✔</span> Direct School Admission Application Pass</li>
                  </ul>
                </div>
                <button
                  onClick={handleSimulateReferralUnlock}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activate Scholar Pass Directly</span>
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

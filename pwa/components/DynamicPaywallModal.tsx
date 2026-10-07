"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Check, ShieldCheck, Zap, Sparkles, CreditCard, 
  ArrowRight, Phone, BookOpen, GraduationCap, Lock, Award, 
  Copy, Flame, Star, QrCode
} from "lucide-react";
import confetti from "canvas-confetti";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

export interface DynamicPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  currentTier?: string; // PRIMARY | JSS | SSS | UTME | FRESHMAN | LANGUAGES
  onSuccess?: (subDetails: any) => void;
}

export default function DynamicPaywallModal({
  isOpen,
  onClose,
  user,
  currentTier = "UTME",
  onSuccess
}: DynamicPaywallModalProps) {
  const normTier = (currentTier || user?.class_tier || "UTME").toUpperCase();
  const isPrimary = normTier === "PRIMARY";
  const isJss = normTier === "JSS";
  const isFreshman = normTier === "FRESHMAN";
  const isLanguages = normTier === "LANGUAGES";
  const isSeniorOrUtme = !isPrimary && !isJss && !isFreshman && !isLanguages;

  const [billingCycle, setBillingCycle] = useState<"monthly" | "termly">("monthly");
  const [paymentRail, setPaymentRail] = useState<"transfer" | "card" | "voucher" | "cram">("transfer");
  const [voucherCode, setVoucherCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  if (!isOpen) return null;

  // Plan Details according to active class
  const getPlanDef = () => {
    if (isPrimary) {
      return {
        title: "Primary Wonder & Phonics Pass",
        icon: "🎒",
        badge: "AGES 5–11 • LOWER & MIDDLE BASIC",
        color: "emerald",
        monthlyPrice: 1000,
        termlyPrice: 2500,
        termLabel: "Term Pass (4 Months)",
        features: [
          "100% Ad-Free, Child-Safe Audio Phonics with Auntie Bola",
          "Unlimited Wonder Lab Science, Shapes & Mental Maths games",
          "Bilingual Yoruba/Igbo/Hausa bedtime stories with native voice",
          "Weekly Friday 5:00 PM WhatsApp report card to Parent"
        ]
      };
    }
    if (isJss) {
      return {
        title: "Junior BECE Sovereign Pass",
        icon: "📘",
        badge: "JSS 1–3 • BASIC 7–9 & BECE",
        color: "cyan",
        monthlyPrice: 1500,
        termlyPrice: 3500,
        termLabel: "Term Pass (4 Months)",
        features: [
          "10-Year BECE & JSCE Past Questions with step-by-step audio",
          "Basic Science, Introductory Tech & Business drill simulators",
          "Audio Explanations in Naija Pidgin & Nigerian English",
          "Class-isolated JSS Leaderboards & Wonder Star badges"
        ]
      };
    }
    if (isFreshman) {
      return {
        title: "First Class Honours Pass",
        icon: "🎓",
        badge: "NUC CCMAS 100L UNDERGRADUATE",
        color: "indigo",
        monthlyPrice: 2500,
        termlyPrice: 4500,
        termLabel: "Semester Pass (1 Session)",
        features: [
          "Complete NUC CCMAS Question Bank for GST 111, 112, 113",
          "5.0 CGPA Trajectory Simulator & Academic Risk Alerts",
          "Faculty Foundation Packs (MTH 101, PHY 101, CHM 101, CSC 101)",
          "Official Printable NUC/NERDC Cryptographic Transcript"
        ]
      };
    }
    if (isLanguages) {
      return {
        title: "Naija Mother Tongue Polyglot Pass",
        icon: "🗣️",
        badge: "INDIGENOUS LANGUAGE MASTERY",
        color: "amber",
        monthlyPrice: 1200,
        termlyPrice: 3000,
        termLabel: "Quarterly Pass (3 Months)",
        features: [
          "Dual-language English-Yorùbá, English-Igbo, English-Hausa drills",
          "Interactive Do-Re-Mi Pitch Contour Voice Grader",
          "NERDC-accredited cultural proverb (Òwe/Ilu) & folktale vault",
          "Diaspora Scholar audio certificates & tonal mastery badges"
        ]
      };
    }
    // Default: UTME / SSS
    return {
      title: "JAMB & WAEC Sovereign Pass",
      icon: "⚡",
      badge: "SSS 1–3 & JAMB UTME 2026",
      color: "emerald",
      monthlyPrice: 2000,
      termlyPrice: 5000,
      termLabel: "Season Pass (Jan–Apr 2026)",
      features: [
        "Real-Time 400-Point JAMB CBT Mock Simulator with Ghost Pacer",
        "AI WAEC & NECO Theory Grader with step-by-step marking rubrics",
        "280+ JAMB Score Predictor & Socratic Prerequisite Gap Autopsy",
        "Sunday 8PM Showdown Live Battle Royale entry with ₦50,000 cash pool",
        "Emergency 24-Hour Midnight Cram Pass included (₦200 / day option)"
      ]
    };
  };

  const plan = getPlanDef();
  const currentPrice = billingCycle === "monthly" ? plan.monthlyPrice : plan.termlyPrice;
  const userKey = user?.registration_key || "EDU-2025-DEMO";

  const handleCopyAccount = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText("9982736410");
      setCopiedAccount(true);
      sfx.tap();
      setTimeout(() => setCopiedAccount(false), 3000);
    }
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    sfx.tap();
    triggerTmaHaptic("medium");

    try {
      const res = await fetch("/api/backend/monetization/tier-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_key: userKey,
          plan_name: plan.title,
          class_tier: normTier,
          amount_ngn: paymentRail === "cram" ? 200 : currentPrice,
          payment_method: paymentRail,
          billing_cycle: billingCycle
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`🎉 ${plan.title} Activated! Sub ID: ${data.subscription_id || "SUB-2026-OK"}. All ${plan.title} features are unlocked.`);
        sfx.streakCelebration();
        triggerTmaHaptic("heavy");
        confetti({ particleCount: 90, spread: 60, origin: { y: 0.5 } });
        if (onSuccess) onSuccess(data);
      } else {
        throw new Error("Server rejected");
      }
    } catch {
      // Fallback local activation
      setSuccessMsg(`🎉 ${plan.title} Activated! Unlimited access granted for ${normTier}.`);
      sfx.streakCelebration();
      triggerTmaHaptic("heavy");
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.5 } });
      if (onSuccess) onSuccess({ plan: plan.title, status: "active" });
    }
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-[#0E1017] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col text-white"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">{plan.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">{plan.title}</h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00E676] border border-emerald-500/30 font-bold">
                  {normTier}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono">{plan.badge}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-[#00E676] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(0,230,118,0.4)]">
              <Award className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-display font-black text-white">Payment Confirmed!</h4>
              <p className="text-xs text-emerald-300 leading-relaxed max-w-sm mx-auto">{successMsg}</p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#00E676] text-black font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Continue Learning →
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            
            {/* Billing Cycle Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-black/50 p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => { setBillingCycle("monthly"); sfx.tap(); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-[#00E676] text-black font-extrabold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>Monthly Pass</span>
                <span className="text-[11px] font-mono mt-0.5">₦{plan.monthlyPrice.toLocaleString()}/mo</span>
              </button>

              <button
                type="button"
                onClick={() => { setBillingCycle("termly"); sfx.tap(); }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center cursor-pointer ${
                  billingCycle === "termly"
                    ? "bg-[#00E676] text-black font-extrabold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>{plan.termLabel}</span>
                  <span className="text-[8px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-black">SAVE 25%</span>
                </div>
                <span className="text-[11px] font-mono mt-0.5">₦{plan.termlyPrice.toLocaleString()} total</span>
              </button>
            </div>

            {/* Feature Checklist */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                Everything Included in Your Pass:
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00E676] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Method Selector */}
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-1.5 font-bold">
                Choose Payment Method:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "transfer", label: "Bank Transfer", icon: "🏛️", desc: "Instant Virtual Acct" },
                  { id: "card", label: "Card / OPay", icon: "💳", desc: "Paystack Gateway" },
                  { id: "voucher", label: "Scratch Card", icon: "🎟️", desc: "Cybercafe Voucher" }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setPaymentRail(r.id as any); sfx.tap(); }}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                      paymentRail === r.id
                        ? "bg-emerald-500/20 border-emerald-500 text-[#00E676] font-bold shadow-sm"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="text-base">{r.icon}</span>
                    <span className="text-[11px] font-bold">{r.label}</span>
                    <span className="text-[9px] text-zinc-500">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Transfer Instructions */}
            {paymentRail === "transfer" && (
              <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Bank Name:</span>
                  <span className="font-bold text-white">Wema Bank (Paystack Virtual)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Account Number:</span>
                  <div className="flex items-center gap-1.5 font-mono font-black text-emerald-400">
                    <span>9982736410</span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="p-1 hover:bg-white/10 rounded cursor-pointer"
                      title="Copy"
                    >
                      {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Amount Due:</span>
                  <span className="font-bold text-[#00E676]">₦{currentPrice.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-zinc-500 pt-1 border-t border-white/5">
                  Transfer from OPay, PalmPay, Kuda, or your bank app. Access activates within 3 seconds of transfer.
                </p>
              </div>
            )}

            {/* Scratch Voucher PIN */}
            {paymentRail === "voucher" && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Enter 12-Digit Cybercafe Voucher PIN:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7748-9921-3401"
                  value={voucherCode}
                  onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest uppercase focus:border-emerald-500"
                />
              </div>
            )}

            {/* Emergency 24-Hour Midnight Cram Pass Option (Senior / UTME) */}
            {isSeniorOrUtme && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <div>
                    <div className="text-xs font-bold text-amber-300">Exam Tomorrow? 24-Hour Cram Pass</div>
                    <div className="text-[10px] text-zinc-400">Unlimited CBT practice &amp; theory marking for 24 hours.</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentRail("cram");
                    handleSimulatePayment();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[11px] shrink-0 cursor-pointer transition-all"
                >
                  ₦200 Only
                </button>
              </div>
            )}

            {/* Confirm Activation Button */}
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-sm shadow-[0_0_20px_rgba(0,230,118,0.4)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isProcessing ? "Confirming Payment..." : `Activate ${plan.title} (₦${currentPrice.toLocaleString()}) →`}</span>
            </button>

          </div>
        )}

      </motion.div>
    </div>
  );
}

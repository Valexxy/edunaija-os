"use client";

import { useState } from "react";
import { 
  Ticket, CheckCircle2, Sparkles, X, ArrowRight, 
  AlertCircle, ShieldCheck, Heart, Award
} from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface VoucherRedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
}

export default function VoucherRedemptionModal({
  isOpen,
  onClose,
  onSuccess
}: VoucherRedemptionModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [redeemedData, setRedeemedData] = useState<any>(null);

  if (!isOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg("Please enter your voucher code");
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    sfx.tap();
    triggerTmaHaptic("medium");

    // Get current user registration key or phone
    let keyOrPhone = "EDU-2025-LAG-1112";
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("edunaija_user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          keyOrPhone = user.registration_key || user.registrationKey || user.phone || keyOrPhone;
        } catch {}
      }
    }

    try {
      const res = await fetch("/api/backend/vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          user_key_or_phone: keyOrPhone
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Invalid or expired voucher code");
      }

      setRedeemedData(data);
      sfx.victory();
      triggerTmaHaptic("heavy");

      // Update local storage user
      if (data.user) {
        localStorage.setItem("edunaija_user", JSON.stringify(data.user));
        window.dispatchEvent(new CustomEvent("edunaija_user_updated", { detail: data.user }));
      }

      if (onSuccess) onSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to redeem voucher. Please check and retry.");
      sfx.wrong();
      triggerTmaHaptic("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0d0e17] border border-amber-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)]">
        
        {/* Close Button */}
        <button 
          onClick={() => { sfx.tap(); onClose(); }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {redeemedData ? (
          <div className="text-center py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-3 text-amber-400 animate-bounce">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black font-display text-white mb-1">
              Voucher Redeemed! 🎓
            </h2>
            <p className="text-xs text-zinc-300 mb-4">
              Sponsored by <strong className="text-amber-400">{redeemedData.sponsor_title}</strong>
            </p>

            <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-2 mb-5">
              <div className="flex items-center justify-between text-zinc-300">
                <span>Access Granted:</span>
                <span className="font-bold text-white capitalize">{redeemedData.plan_type?.replace("_", " ")}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>Hearts Credited:</span>
                <span className="font-bold text-red-400 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-current text-red-500" />
                  +{redeemedData.hearts_granted} Hearts
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>Bonus XP:</span>
                <span className="font-bold text-emerald-400">+250 XP</span>
              </div>
            </div>

            <button
              onClick={() => { sfx.tap(); onClose(); }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black font-display text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              Start Practicing Now
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black font-black text-lg shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Ticket className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-black font-display text-white">Redeem Sponsorship Voucher</h2>
                <p className="text-xs text-zinc-400">LGA, Politician, School or CSR Scratch-Card</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Enter 8-12 Character Voucher Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HON-KALU-2025 or MTN-STEM-YOUTH"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-mono font-bold tracking-widest uppercase focus:outline-none focus:border-amber-400 transition-colors text-center text-base"
                  required
                />
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-[11px] text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant Scholarship Activation</span>
                </div>
                <p>
                  Vouchers grant free unlimited practice, mock examinations, and curriculum breakdown explainers sponsored by your local representative or alumni association.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-black font-display text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Activating Voucher...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Free Scholarship Pass</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

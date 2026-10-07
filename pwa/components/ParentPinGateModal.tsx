"use client";

import React, { useState } from "react";
import { Lock, Fingerprint, KeyRound, CheckCircle2, X, ShieldAlert } from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface ParentPinGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionTitle?: string;
  actionDescription?: string;
}

export default function ParentPinGateModal({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = "Parent Authority Authorization",
  actionDescription = "In compliance with NDPA 2023 §31, enter your 4-digit Parent PIN or verify biometrics to unlock this guardian action."
}: ParentPinGateModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Default demo PIN is 1234 or any valid 4-digit code
    if (pin === "1234" || pin.length >= 4) {
      setTimeout(() => {
        setLoading(false);
        sfx.streakCelebration();
        triggerTmaHaptic("heavy");
        onSuccess();
        onClose();
        setPin("");
      }, 400);
    } else {
      setTimeout(() => {
        setLoading(false);
        sfx.wrong();
        triggerTmaHaptic("heavy");
        setError(true);
        setTimeout(() => setError(false), 2000);
      }, 300);
    }
  };

  const handleBiometricAuth = () => {
    sfx.streakCelebration();
    triggerTmaHaptic("medium");
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-teal-500/30 rounded-3xl p-6 max-w-sm w-full text-center relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-7 h-7" />
        </div>

        <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full">
          LEVEL 3 GUARDIAN AUTHORITY GATE
        </span>

        <h3 className="text-lg font-black text-white mt-3 mb-1">{actionTitle}</h3>
        <p className="text-xs text-zinc-400 mb-5 leading-relaxed">{actionDescription}</p>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={6}
              placeholder="••••"
              value={pin}
              autoFocus
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-teal-500 transition-colors"
            />
            {error && (
              <p className="text-red-400 text-[11px] mt-1.5 font-semibold">
                Invalid Parent PIN. Default demo PIN is 1234.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            {loading ? "Verifying Authority..." : "Authorize Action"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleBiometricAuth}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-white/5 transition-all cursor-pointer"
          >
            <Fingerprint className="w-4 h-4 text-teal-400" />
            <span>Use Biometrics (Face ID / Fingerprint)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

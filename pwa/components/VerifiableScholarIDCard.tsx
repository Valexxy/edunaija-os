"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, QrCode, Download, Printer, Copy, Check, 
  Sparkles, Award, GraduationCap, Building2, MapPin, X
} from "lucide-react";
import confetti from "canvas-confetti";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface VerifiableScholarIDCardProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function VerifiableScholarIDCard({
  isOpen,
  onClose,
  user
}: VerifiableScholarIDCardProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const fullName = user?.full_name || user?.fullName || "Chisom Okonkwo";
  const regKey = user?.registration_key || user?.registrationKey || "EDU-2025-LAG-1112";
  const state = user?.state || "Lagos";
  const role = (user?.role || "student").toUpperCase();
  const targetUni = user?.target_uni || "University of Lagos (UNILAG)";
  const targetCourse = user?.target_course || "Computer Science / AI";
  const scholarId = `NG-${regKey.replace(/[^A-Z0-9]/g, "").slice(0, 10)}`;

  const handleCopyKey = () => {
    sfx.tap();
    triggerTmaHaptic("light");
    navigator.clipboard.writeText(regKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintOrDownload = () => {
    sfx.streakCelebration();
    triggerTmaHaptic("medium");
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-[#090b16] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-5"
        >
          {/* Close button */}
          <button
            onClick={() => { sfx.tap(); onClose(); }}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-full bg-white/5 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00E676]" />
            <h3 className="text-base font-black text-white">
              Sovereign Digital Scholar ID Card
            </h3>
          </div>

          {/* PHYSICAL ID CARD MOCKUP */}
          <div
            ref={cardRef}
            className="relative rounded-3xl overflow-hidden border border-emerald-500/40 bg-gradient-to-br from-[#0c1f17] via-[#081310] to-[#040807] p-5 shadow-[0_15px_40px_rgba(0,230,118,0.2)] text-white select-none space-y-4"
          >
            {/* Holographic Top Banner Strip */}
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#008751] via-[#00E676] to-[#008751] flex items-center justify-center text-sm shadow-md">
                  🇳🇬
                </div>
                <div>
                  <span className="font-display font-black text-sm tracking-tight text-white block">
                    FEDERAL REPUBLIC OF NIGERIA
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block">
                    Universal Education OS • Scholar Credential
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold bg-[#00E676]/20 text-[#00E676] px-2 py-0.5 rounded-full border border-[#00E676]/40">
                VERIFIED
              </span>
            </div>

            {/* Candidate Identity Body */}
            <div className="grid grid-cols-12 gap-3 items-center">
              {/* Photo Avatar */}
              <div className="col-span-4 flex flex-col items-center">
                <div className="w-20 h-24 rounded-2xl bg-gradient-to-t from-zinc-900 to-zinc-800 border-2 border-emerald-400/50 p-1 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                  <div className="w-full h-full rounded-xl bg-[#030608] flex items-center justify-center font-black text-3xl text-[#00E676]">
                    {fullName.trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute bottom-1 bg-black/80 px-1 rounded text-[8px] font-mono text-zinc-300">
                    PHOTO
                  </div>
                </div>
                <span className="text-[8px] font-mono text-emerald-400 mt-1 uppercase font-bold">
                  {role}
                </span>
              </div>

              {/* Bio & Academic Target Details */}
              <div className="col-span-8 space-y-1">
                <span className="text-[9px] text-zinc-400 uppercase font-mono block">Scholar Full Name</span>
                <h4 className="font-black text-sm text-white leading-tight truncate">
                  {fullName}
                </h4>

                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[8px]">REGISTRATION KEY</span>
                    <span className="text-emerald-300 font-bold truncate block">{regKey}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[8px]">STATE / HUB</span>
                    <span className="text-white font-bold truncate block">{state} State</span>
                  </div>
                </div>

                <div className="pt-1 text-[10px]">
                  <span className="text-zinc-500 block text-[8px] font-mono">TARGET INSTITUTION</span>
                  <span className="text-amber-300 font-semibold truncate block text-[11px]">{targetUni}</span>
                </div>
              </div>
            </div>

            {/* Bottom Strip: Dynamic Vector QR Code & NDPA Compliance */}
            <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* SVG QR Code Simulation */}
                <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2zM4 4v4h4V4zm10-2h8v8h-8zM16 4v4h4V4zM2 14h8v8H2zm2 2v4h4v-4zm14 0h2v2h-2zm-4 0h2v2h-2zm2 2h2v2h-2zm2 2h2v2h-2zm-4 0h2v2h-2zm2-4h2v2h-2zm-6 2h2v2h-2z" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-zinc-400 block">
                    ID: <strong className="text-white">{scholarId}</strong>
                  </span>
                  <span className="text-[8px] font-mono text-emerald-400 block">
                    NDPA 2023 Registered Privacy • Scan to Authenticate
                  </span>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full border border-emerald-400/40 flex items-center justify-center font-mono text-[9px] font-black text-emerald-300 bg-emerald-500/10">
                NG
              </div>
            </div>
          </div>

          {/* Action CTAs: Copy Key, Print / Download */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopyKey}
              className="py-2.5 px-3 rounded-xl glass-card border border-white/10 hover:border-white/20 text-xs font-bold text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{copied ? "Key Copied!" : "Copy Reg Key"}</span>
            </button>

            <button
              onClick={handlePrintOrDownload}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-display font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,230,118,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 fill-current" />
              <span>Print / Save ID</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

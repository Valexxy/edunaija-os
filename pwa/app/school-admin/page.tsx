"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Building2, Shield, Users, Trophy, Download, Activity, 
  MonitorPlay, Check, Sparkles, KeyRound, Server, WifiOff
} from "lucide-react";
import confetti from "canvas-confetti";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

export default function SchoolAdminDashboard() {
  const [schoolData, setSchoolData] = useState<any>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadSchoolData() {
      try {
        const res = await fetch("/api/backend/dashboards/school/lic-apex-premier-01");
        if (res.ok) {
          const data = await res.json();
          setSchoolData(data);
        }
      } catch (err) {
        console.warn("Failed fetching school dashboard:", err);
      }
    }
    loadSchoolData();
  }, []);

  const handleDownloadReport = () => {
    sfx.streakCelebration();
    triggerTmaHaptic("heavy");
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setDownloadToast("📄 Official Apex Premier College Termly CBT Performance Pack exported!");
    setTimeout(() => setDownloadToast(null), 4000);
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto min-h-screen pb-24 text-white space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {downloadToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-blue-500 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-white" />
            <span>{downloadToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-bold text-[#00E676] tracking-widest uppercase flex items-center gap-1.5 font-mono">
            <Building2 className="w-3.5 h-3.5" /> B2B Institutional CBT SaaS &amp; Lab Management
          </span>
          <h1 className="font-display tracking-tight font-extrabold text-2xl sm:text-3xl text-white mt-1">
            Apex Premier College &amp; CBT Test Center
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Commercial Avenue, Yaba, Lagos • Principal: <strong className="text-white">Mrs. Folashade Coker</strong> • Accredited JAMB Hub
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00E676] font-display font-black text-lg">
          APC
        </div>
      </header>

      {/* License Key Quick Banner */}
      <div className="glass-card p-4 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-zinc-900/60 to-black/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              Active Institutional Master License:
              <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {schoolData?.license?.license_key || "LIC-APEX-2025-GOLD"}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              100% Offline Local Network Server (LAN) Sync • Valid for 2025/2026 Academic Session
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30 shrink-0">
          ENTERPRISE ACTIVE ✓
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Licenses & Benchmarks */}
        <div className="space-y-6">
          {/* Seat Licensing Metric */}
          <div className="glass-card rounded-3xl p-5 border border-white/10 bg-black/40 shadow-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400 font-mono">Licensed Student Seats</span>
              <span className="text-xs font-bold text-white">
                442 / {schoolData?.license?.licensed_students || 500} Seats Used (88.4%)
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-naija-green to-[#00E676] h-full rounded-full w-[88%]" />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono pt-1">
              <span>Apex Premier Lab Capacity</span>
              <span className="text-[#00E676] font-bold">58 seats remaining</span>
            </div>
          </div>

          {/* Center Benchmarking vs National */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 shadow-md">
              <div className="text-[11px] text-zinc-400 mb-1 font-mono">Center Avg Score</div>
              <div className="text-2xl font-extrabold text-[#00E676]">274.6</div>
              <div className="text-[10px] text-emerald-300 font-bold">+82 pts above national</div>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-white/10 bg-black/40 shadow-md">
              <div className="text-[11px] text-zinc-400 mb-1 font-mono">Candidates &gt; 250</div>
              <div className="text-2xl font-extrabold text-naija-gold">78.4%</div>
              <div className="text-[10px] text-zinc-400">Merit Safe Zone</div>
            </div>
          </div>

          {/* Offline Server Infrastructure */}
          <div className="glass-card p-4 rounded-2xl border border-white/10 bg-black/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 font-mono">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Offline Computer Lab Terminals</span>
            </div>
            <p className="text-xs text-zinc-400">
              12 High-speed computer labs configured. Exams execute without internet access with automatic encrypted local SQLite tally sync.
            </p>
          </div>
        </div>

        {/* Right Column: Proctored Exam & Marketing */}
        <div className="space-y-6">
          {/* Proctored Exam Command Center */}
          <div className="glass-card rounded-3xl p-5 border border-purple-500/30 bg-purple-950/20 relative overflow-hidden shadow-lg space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-extrabold text-red-400 tracking-wider font-mono">
                  LIVE PROCTORED MOCK 4
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-300">42 mins left</span>
            </div>
            <div className="text-xl font-display font-black text-white">320 Candidates Active</div>
            <div className="text-[11px] text-zinc-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Anti-Cheat Active: 99.4% tab integrity (0 disqualified infractions)
            </div>
            <Link 
              href="/exam-proctor"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer block text-center shadow-md"
            >
              <MonitorPlay className="w-4 h-4 inline" /> Open Live Monitor Console →
            </Link>
          </div>

          {/* 1-Tap Marketing Proof Card Export */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadReport}
            className="w-full bg-gradient-to-r from-emerald-600 to-[#00E676] text-black font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export School Performance &amp; Marketing Proof Pack
          </motion.button>
        </div>
      </div>
    </main>
  );
}

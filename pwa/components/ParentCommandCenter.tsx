"use client";

import { useState } from "react";
import { 
  ShieldCheck, Award, Clock, TrendingUp, Sparkles, 
  CheckCircle2, AlertTriangle, Heart, Zap, Lock, Eye
} from "lucide-react";

export default function ParentCommandCenter({ onClose }: { onClose?: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [cheered, setCheered] = useState(false);

  const wardData = {
    name: "Tobi Adeyemi",
    grade: "Senior Secondary 2 (SSS 2)",
    school: "King's College Lagos",
    overallMastery: 88.4,
    dailyMinutes: 45,
    streak: 12,
    subjects: [
      { name: "Mathematics", mastery: 94, status: "Apex Distinction" },
      { name: "English Syntax", mastery: 89, status: "Strong Mastery" },
      { name: "Physics", mastery: 86, status: "Proficient" },
      { name: "Chemistry", mastery: 72, status: "Needs Practice" },
      { name: "Economics", mastery: 91, status: "Apex Distinction" }
    ],
    recentEvents: [
      { time: "Today 4:15 PM", text: "Completed Daily Mastery Quest (Week 4 Pacing): +150 Merit Kobo" },
      { time: "Yesterday 7:30 PM", text: "Won Axiom Bout 1v1 in Mathematics against anonymous peer" },
      { time: "Tuesday", text: "Mastered Quadratic Factorization (100% SymPy verification)" }
    ]
  };

  const handlePinSubmit = () => {
    // Default parental passkey for instant demo access
    if (pinInput === "1234" || pinInput === "0000") {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleCheer = () => {
    setCheered(true);
    setTimeout(() => setCheered(false), 3000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {!isAuthenticated ? (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-2xl font-black text-white mb-2">Parent Command Center</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            Enter your 4-digit Parent Passkey to inspect live diagnostic telemetry and ward progress.
          </p>

          <input
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
            placeholder="••••"
            className="w-40 mx-auto text-center tracking-widest text-3xl font-mono font-bold bg-slate-950 border-2 border-amber-500/50 rounded-2xl py-3 text-amber-400 outline-none focus:border-amber-400 mb-2 block"
          />
          <p className="text-xs text-slate-500 mb-6">Demo PIN: 1234 or 0000</p>

          {pinError && (
            <p className="text-xs text-rose-400 mb-4">Invalid PIN. Try 1234.</p>
          )}

          <div className="flex justify-center gap-3 max-w-xs mx-auto">
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm"
              >
                Close
              </button>
            )}
            <button
              onClick={handlePinSubmit}
              className="flex-1 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400"
            >
              Authorize View
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl font-black text-white">{wardData.name}</h3>
              </div>
              <p className="text-xs text-slate-400">{wardData.grade} • {wardData.school}</p>
            </div>

            <button
              onClick={handleCheer}
              className="py-2 px-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{cheered ? "Encouragement Sent!" : "Award Star"}</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Curriculum Mastery</span>
              <span className="text-2xl font-black text-emerald-400">{wardData.overallMastery}%</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Today Study Time</span>
              <span className="text-2xl font-black text-amber-400">{wardData.dailyMinutes}m</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Active Streak</span>
              <span className="text-2xl font-black text-teal-400">{wardData.streak}d</span>
            </div>
          </div>

          {/* Subject Diagnostic Progress */}
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Subject Telemetry Breakdown
          </h4>
          <div className="space-y-3 mb-6">
            {wardData.subjects.map((sub, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-white">{sub.name}</span>
                  <span className={`font-mono font-bold ${sub.mastery >= 85 ? "text-emerald-400" : "text-amber-400"}`}>
                    {sub.mastery}% • {sub.status}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${sub.mastery >= 85 ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${sub.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recent Live Activity Log */}
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Verified Activity Ledger
          </h4>
          <div className="space-y-2 mb-6 text-xs text-slate-300">
            {wardData.recentEvents.map((ev, idx) => (
              <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-850">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="font-mono text-slate-500 text-[11px]">{ev.time}</span>
                <span className="truncate">{ev.text}</span>
              </div>
            ))}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-750"
            >
              Exit Parent Mode
            </button>
          )}
        </div>
      )}
    </div>
  );
}

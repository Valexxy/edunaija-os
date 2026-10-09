"use client";

import { useState } from "react";
import { 
  Trophy, Zap, BookOpen, Shield, Brain, ArrowLeft, 
  Sparkles, Users, Lock, ChevronRight, Award
} from "lucide-react";
import AxiomBoutArena from "./AxiomBoutArena";
import DailyMasteryQuest from "./DailyMasteryQuest";
import SovereignAegisTournament from "./SovereignAegisTournament";
import ParentCommandCenter from "./ParentCommandCenter";
import AIPedagogyStudio from "./AIPedagogyStudio";

export default function EnterpriseScholarCockpit({ onExit }: { onExit: () => void }) {
  const [activeModule, setActiveModule] = useState<"BOUTS" | "QUEST" | "AEGIS" | "AI_STUDIO" | "PARENT">("BOUTS");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 backdrop-blur-2xl p-4 sm:p-6 text-white animate-in fade-in duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Top Cockpit Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
              title="Return to Public Overview"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  Enterprise Scholar Cockpit • Live Session
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Sovereign Learning Cockpit
              </h1>
            </div>
          </div>

          {/* Module Switcher Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveModule("BOUTS")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeModule === "BOUTS"
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850"
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Axiom Bouts (1v1)</span>
            </button>

            <button
              onClick={() => setActiveModule("AEGIS")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeModule === "AEGIS"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850"
              }`}
            >
              <Trophy className="w-3.5 h-3.5 fill-current" />
              <span>The Sovereign Aegis</span>
            </button>

            <button
              onClick={() => setActiveModule("AI_STUDIO")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeModule === "AI_STUDIO"
                  ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>AI Assignment &amp; Syllabus</span>
            </button>

            <button
              onClick={() => setActiveModule("QUEST")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeModule === "QUEST"
                  ? "bg-blue-500 text-slate-950 shadow-lg shadow-blue-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Daily Quest</span>
            </button>

            <button
              onClick={() => setActiveModule("PARENT")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeModule === "PARENT"
                  ? "bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Parent Command</span>
            </button>
          </div>
        </div>

        {/* Active Tool Render */}
        <div className="py-2">
          {activeModule === "BOUTS" && <AxiomBoutArena />}
          {activeModule === "AEGIS" && <SovereignAegisTournament />}
          {activeModule === "AI_STUDIO" && <AIPedagogyStudio />}
          {activeModule === "QUEST" && <DailyMasteryQuest />}
          {activeModule === "PARENT" && <ParentCommandCenter onClose={onExit} />}
        </div>
      </div>
    </div>
  );
}

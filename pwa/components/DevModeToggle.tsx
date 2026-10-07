"use client";

import { useState, useEffect } from "react";
import { Terminal, ShieldAlert, Sparkles, Check, Lock, Unlock } from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface DevModeToggleProps {
  compact?: boolean;
}

export default function DevModeToggle({ compact = false }: DevModeToggleProps) {
  const [isDevMode, setIsDevMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("edunaija_dev_mode") === "true";
      setIsDevMode(active);

      const handler = (e: any) => {
        if (e.detail?.isDevMode !== undefined) {
          setIsDevMode(e.detail.isDevMode);
        }
      };
      const keyHandler = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "D" || e.key === "d")) {
          e.preventDefault();
          toggleDevMode();
        }
      };
      window.addEventListener("keydown", keyHandler);

      return () => {
        window.removeEventListener("edunaija_devmode_updated", handler);
        window.removeEventListener("keydown", keyHandler);
      };
    }
  }, [isDevMode]);

  const toggleDevMode = () => {
    sfx.tap();
    triggerTmaHaptic("medium");
    const nextState = !isDevMode;
    setIsDevMode(nextState);

    if (typeof window !== "undefined") {
      localStorage.setItem("edunaija_dev_mode", nextState ? "true" : "false");
      window.dispatchEvent(
        new CustomEvent("edunaija_devmode_updated", {
          detail: { isDevMode: nextState }
        })
      );
    }
  };

  if (compact) {
    return (
      <button
        onClick={toggleDevMode}
        title={isDevMode ? "Developer Mode ON: Full Unrestricted Access" : "Developer Mode OFF: Restricted by Student Class"}
        className={`px-2 py-1 rounded-xl text-[10px] font-mono font-black flex items-center gap-1.5 transition-all cursor-pointer ${
          isDevMode
            ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse"
            : "bg-white/5 hover:bg-white/10 text-zinc-400 border border-white/10"
        }`}
      >
        <Terminal className="w-3 h-3 text-amber-400" />
        <span>{isDevMode ? "DEV: UNRESTRICTED" : "DEV: OFF"}</span>
      </button>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleDevMode}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`px-3 py-1.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
          isDevMode
            ? "bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/30 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.35)]"
            : "bg-zinc-900/90 text-zinc-400 hover:text-white border border-white/10 hover:border-white/25"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Terminal className={`w-3.5 h-3.5 ${isDevMode ? "text-amber-400 animate-spin" : "text-zinc-500"}`} />
          <span>{isDevMode ? "🛠️ DEV UNRESTRICTED" : "🔒 STANDARD VIEW"}</span>
        </div>
        <span
          className={`w-2 h-2 rounded-full ${
            isDevMode ? "bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping" : "bg-zinc-600"
          }`}
        />
      </button>

      {/* Hover Info Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-black/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-2xl z-50 text-[11px] text-zinc-300 space-y-1.5">
          <div className="flex items-center justify-between font-bold text-amber-400">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Developer Privilege Control
            </span>
            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20">
              {isDevMode ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
          <p className="text-zinc-400 text-[10px] leading-relaxed">
            {isDevMode
              ? "Developer privilege enabled. You can inspect and navigate all 15+ sections, bypass academic tier locks, and test every level without diagnostic tests or fee restrictions."
              : "Standard persona view enabled. Students only see sections relevant to their verified educational class (Junior Basic, Senior Secondary, UTME, or Campus)."}
          </p>
          <div className="pt-1 border-t border-white/10 text-[9px] font-mono text-amber-300">
            Click button to {isDevMode ? "switch to restricted student view" : "unlock full developer access"}
          </div>
        </div>
      )}
    </div>
  );
}

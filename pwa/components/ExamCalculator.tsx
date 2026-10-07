"use client";

import React, { useState } from "react";
import { Calculator as CalcIcon, X, Delete } from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface ExamCalculatorProps {
  isOpen: boolean;
  onClose?: () => void;
  mode?: "scientific" | "basic";
  inline?: boolean;
}

// Science, Calculation & STEM Subjects that officially permit and require non-programmable calculators
export const CALCULATION_ELIGIBLE_SUBJECTS = [
  // Senior Secondary (WAEC / NECO / UTME)
  "mathematics", "further mathematics", "physics", "chemistry", 
  "financial accounting", "principles of accounts", "commerce", "economics", "technical drawing",
  // Tertiary 100L CCMAS
  "mth 101", "mth 102", "phy 101", "phy 102", "chm 101", "chm 102",
  "cos 101", "cos 102", "calculus", "algebra", "mechanics", "statistics",
  "applied mathematics", "engineering"
];

// Helper to check whether the current subject/tier is authorized to use a calculator
export const isCalculatorPermitted = (tier: string, subject: string = ""): boolean => {
  const normTier = (tier || "").toUpperCase().trim();
  // PRIMARY SCHOOLS NEVER USE CALCULATORS IN NIGERIAN CURRICULUM
  if (normTier.startsWith("PRI") || normTier === "PRIMARY") {
    return false;
  }
  const normSub = (subject || "").toLowerCase().trim();
  if (!normSub || normSub === "all") return true;
  return CALCULATION_ELIGIBLE_SUBJECTS.some(stem => normSub.includes(stem));
};

export default function ExamCalculator({ isOpen, onClose, mode = "scientific", inline = false }: ExamCalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [calcMode, setCalcMode] = useState<"scientific" | "basic">(mode);
  const [isRad, setIsRad] = useState(false);

  if (!isOpen) return null;

  const handleInput = (val: string) => {
    sfx.tap();
    triggerTmaHaptic("light");
    setDisplay((prev) => {
      if (prev === "0" || prev === "Error") return val;
      return prev + val;
    });
  };

  const handleClear = () => {
    sfx.tap();
    setDisplay("0");
    setEquation("");
  };

  const handleDelete = () => {
    sfx.tap();
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === "Error") return "0";
      return prev.slice(0, -1);
    });
  };

  const handleMathFunction = (fn: string) => {
    sfx.tap();
    try {
      const num = parseFloat(display);
      let res = 0;
      const angle = isRad ? num : (num * Math.PI) / 180;

      switch (fn) {
        case "sin": res = Math.sin(angle); break;
        case "cos": res = Math.cos(angle); break;
        case "tan": res = Math.tan(angle); break;
        case "sqrt": res = Math.sqrt(num); break;
        case "square": res = Math.pow(num, 2); break;
        case "log": res = Math.log10(num); break;
        case "ln": res = Math.log(num); break;
        case "inv": res = 1 / num; break;
        case "percent": res = num / 100; break;
        default: return;
      }

      setEquation(`${fn}(${display}) =`);
      setDisplay(Number.isFinite(res) ? String(parseFloat(res.toFixed(8))) : "Error");
    } catch {
      setDisplay("Error");
    }
  };

  const handleEvaluate = () => {
    sfx.correct();
    triggerTmaHaptic("medium");
    try {
      const sanitized = display
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, String(Math.PI))
        .replace(/e/g, String(Math.E));

      if (/[^0-9+\-*/().\s]/g.test(sanitized)) {
        setDisplay("Error");
        return;
      }
      const result = Function(`'use strict'; return (${sanitized})`)();
      setEquation(`${display} =`);
      setDisplay(Number.isFinite(result) ? String(parseFloat(result.toFixed(8))) : "Error");
    } catch {
      setDisplay("Error");
    }
  };

  const card = (
    <div className={`w-full ${inline ? "max-w-none shadow-xl" : "max-w-sm shadow-2xl"} rounded-3xl bg-slate-900 border border-emerald-500/40 p-4 sm:p-5 flex flex-col gap-3.5 text-slate-100 transition-all`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CalcIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white">STEM Exam Calculator</h3>
            <p className="text-[9px] sm:text-[10px] text-emerald-400 font-mono">WAEC / JAMB NON-PROGRAMMABLE</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={() => {
              sfx.tap();
              onClose();
            }}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Close Calculator"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setCalcMode("scientific")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                calcMode === "scientific" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Scientific
            </button>
            <button
              onClick={() => setCalcMode("basic")}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                calcMode === "basic" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Basic
            </button>
          </div>

          {calcMode === "scientific" && (
            <button
              onClick={() => setIsRad(!isRad)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-400 font-bold"
            >
              {isRad ? "RAD" : "DEG"}
            </button>
          )}
        </div>

        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-right flex flex-col justify-between min-h-[85px]">
          <span className="text-xs text-slate-500 font-mono h-4 truncate">{equation}</span>
          <span className="text-2xl font-black font-mono tracking-tight text-white truncate">{display}</span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-sm">
          {calcMode === "scientific" && (
            <>
              <button onClick={() => handleMathFunction("sin")} className="py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-bold hover:bg-slate-800">sin</button>
              <button onClick={() => handleMathFunction("cos")} className="py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-bold hover:bg-slate-800">cos</button>
              <button onClick={() => handleMathFunction("tan")} className="py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-bold hover:bg-slate-800">tan</button>
              <button onClick={() => handleMathFunction("sqrt")} className="py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-bold hover:bg-slate-800">√</button>

              <button onClick={() => handleMathFunction("log")} className="py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-bold hover:bg-slate-800">log</button>
              <button onClick={() => handleMathFunction("ln")} className="py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-bold hover:bg-slate-800">ln</button>
              <button onClick={() => handleMathFunction("square")} className="py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-bold hover:bg-slate-800">x²</button>
              <button onClick={() => handleInput("π")} className="py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-bold hover:bg-slate-800">π</button>
            </>
          )}

          <button onClick={handleClear} className="py-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 font-bold hover:bg-red-900">AC</button>
          <button onClick={handleDelete} className="py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 flex items-center justify-center"><Delete className="w-4 h-4" /></button>
          <button onClick={() => handleMathFunction("percent")} className="py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700">%</button>
          <button onClick={() => handleInput("÷")} className="py-2.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-base font-bold hover:bg-emerald-900">÷</button>

          <button onClick={() => handleInput("7")} className="py-2.5 rounded-xl bg-slate-800/80 text-white font-bold hover:bg-slate-700 text-base">7</button>
          <button onClick={() => handleInput("8")} className="py-2.5 rounded-xl bg-slate-800/80 text-white font-bold hover:bg-slate-700 text-base">8</button>
          <button onClick={() => handleInput("9")} className="py-2.5 rounded-xl bg-slate-800/80 text-white font-bold hover:bg-slate-700 text-base">9</button>
          <button onClick={() => handleInput("×")} className="py-2.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-base font-bold hover:bg-emerald-900">×</button>

          <button onClick={() => handleInput("4")} className="py-2.5 rounded-xl bg-slate-800/80 text-white font-bold hover:bg-slate-700 text-base">4</button>
          <button onClick={() => handleInput("5")} className="py-2.5 rounded-xl bg-slate-800/80 text-white font-bold hover:bg-slate-700 text-base">5</button>
          <button onClick={() => handleInput("6")} className="py-2.5 rounded-xl bg-slate-800/80 text-white font-bold hover:bg-slate-700 text-base">6</button>
          <button onClick={() => handleInput("-")} className="py-2.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-base font-bold hover:bg-emerald-900">-</button>

          <button onClick={() => handleInput("1")} className="py-2.5 rounded-xl bg-slate-800/80 text-white font-bold hover:bg-slate-700 text-base">1</button>
          <button onClick={() => handleInput("2")} className="py-2.5 rounded-xl bg-slate-800/80 text-white font-bold hover:bg-slate-700 text-base">2</button>
          <button onClick={() => handleInput("3")} className="py-2.5 rounded-xl bg-slate-800/80 text-white font-bold hover:bg-slate-700 text-base">3</button>
          <button onClick={() => handleInput("+")} className="py-2.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-base font-bold hover:bg-emerald-900">+</button>

          <button onClick={() => handleInput("0")} className="py-2.5 rounded-xl bg-slate-800/80 text-white font-bold hover:bg-slate-700 text-base col-span-2">0</button>
          <button onClick={() => handleInput(".")} className="py-2.5 rounded-xl bg-slate-800/80 text-white font-bold hover:bg-slate-700 text-base">.</button>
          <button onClick={handleEvaluate} className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-lg font-black shadow-lg shadow-emerald-500/20">=</button>
        </div>

        <div className="text-[10px] text-center text-slate-500 font-medium">
          WAEC / JAMB Rule: Only standard on-screen non-programmable calculators permitted for STEM.
        </div>
      </div>
  );

  if (inline) {
    return card;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      {card}
    </div>
  );
}

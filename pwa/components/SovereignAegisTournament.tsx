"use client";

import { useState, useEffect } from "react";
import { 
  Trophy, Shield, Award, Clock, AlertTriangle, CheckCircle2, 
  Sparkles, Lock, Flame, Eye, ExternalLink, ChevronRight
} from "lucide-react";

export default function SovereignAegisTournament() {
  const [stage, setStage] = useState<"LOBBY" | "EXAM_HALL" | "SUBMITTED">("LOBBY");
  const [tabSwitches, setTabSwitches] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes sprint
  const [certificateHash, setCertificateHash] = useState<string | null>(null);

  const tournamentQuestions = [
    {
      prompt: "If log₂ (x + 3) + log₂ (x - 3) = 4, determine the valid real solution for x.",
      options: ["A) 4", "B) 5", "C) √7", "D) 7"],
      correct_index: 1,
      explanation: "log₂((x+3)(x-3)) = 4 => x² - 9 = 2⁴ = 16 => x² = 25 => x = 5 (since x > 3)."
    },
    {
      prompt: "A 2 kg satellite orbits earth at altitude h where gravitational field g = 2.5 m/s². What is its weight in Newtons?",
      options: ["A) 5 N", "B) 20 N", "C) 1.25 N", "D) 50 N"],
      correct_index: 0,
      explanation: "Weight W = m × g = 2 kg × 2.5 m/s² = 5 N."
    },
    {
      prompt: "Which gas law states that volume is directly proportional to absolute temperature at constant pressure?",
      options: ["A) Boyle's Law", "B) Charles's Law", "C) Graham's Law", "D) Gay-Lussac's Law"],
      correct_index: 1,
      explanation: "Charles's Law states V ∝ T at constant pressure."
    }
  ];

  // Anti-Cheat: Tab Visibility Listener
  useEffect(() => {
    if (stage !== "EXAM_HALL") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const next = prev + 1;
          if (next >= 3) {
            alert("DISQUALIFIED: You left the exam window 3 times. Integrity violation recorded.");
            setStage("LOBBY");
          }
          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [stage]);

  // Tournament Timer
  useEffect(() => {
    if (stage !== "EXAM_HALL") return;
    if (timeLeft <= 0) {
      handleFinalSubmission();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [stage, timeLeft]);

  const handleStartTournament = () => {
    setStage("EXAM_HALL");
    setTabSwitches(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setTimeLeft(120);
  };

  const handleOptionSelect = (idx: number) => {
    setSelectedAnswer(idx);
    const q = tournamentQuestions[currentQuestion];
    if (idx === q.correct_index) {
      setScore(prev => prev + 100);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < tournamentQuestions.length) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        handleFinalSubmission();
      }
    }, 600);
  };

  const handleFinalSubmission = () => {
    // Generate simulated cryptographic certificate hash
    const randomHash = "AEGIS-2026-NGA-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    setCertificateHash(randomHash);
    setStage("SUBMITTED");
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* LOBBY STAGE */}
      {stage === "LOBBY" && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4">
            <Trophy className="w-3.5 h-3.5" />
            <span>Tier B • Sovereign National Championship</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
            The Sovereign Aegis™
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Official scheduled national trial of academic excellence. Monitored with strict anti-cheat proctoring and verified merit certification.
          </p>

          {/* Tournament Specifications */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6 text-left">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 font-mono block">ANTI-CHEAT</span>
              <span className="text-xs font-bold text-amber-400">Tab Lockdown</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 font-mono block">HONOR</span>
              <span className="text-xs font-bold text-emerald-400">Merit Certificate</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 font-mono block">ROUND TIME</span>
              <span className="text-xs font-bold text-teal-400">2 Minutes</span>
            </div>
          </div>

          <button
            onClick={handleStartTournament}
            className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm hover:from-amber-400 hover:to-yellow-400 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 mx-auto"
          >
            <Shield className="w-4 h-4 fill-current" />
            <span>Enter Sovereign Arena (Lock Screen)</span>
          </button>
        </div>
      )}

      {/* EXAM HALL STAGE (Anti-Cheat Active) */}
      {stage === "EXAM_HALL" && (
        <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 md:p-8 shadow-2xl relative">
          {/* Integrity Warning Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Lock className="w-4 h-4" />
              <span>Aegis Shield Lockdown Active</span>
            </div>

            <div className="flex items-center gap-4">
              {tabSwitches > 0 && (
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{tabSwitches}/3 Infractions</span>
                </span>
              )}
              <span className="text-xs font-mono font-bold text-white bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 mb-2">
            Question {currentQuestion + 1} of {tournamentQuestions.length}
          </div>

          <h3 className="text-base md:text-lg font-bold text-white mb-6">
            {tournamentQuestions[currentQuestion].prompt}
          </h3>

          <div className="space-y-3 mb-4">
            {tournamentQuestions[currentQuestion].options.map((opt, idx) => (
              <button
                key={idx}
                disabled={selectedAnswer !== null}
                onClick={() => handleOptionSelect(idx)}
                className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition ${
                  selectedAnswer === idx
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                    : "bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 text-center mt-4">
            Do not leave this window or split screens. Doing so will invalidate your score.
          </p>
        </div>
      )}

      {/* SUBMITTED / VERIFIABLE CERTIFICATE STAGE */}
      {stage === "SUBMITTED" && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Award className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-black text-white mb-1">
            Trial Successfully Concluded!
          </h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Your exam integrity was audited and verified. Distinction recorded in the Sovereign Scholar Ledger.
          </p>

          {/* Certificate Distinction Card */}
          <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-6 max-w-md mx-auto mb-6 text-left relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  Sovereign Merit Certificate
                </span>
                <h4 className="text-base font-extrabold text-white">National Academic Distinction</h4>
              </div>
              <Shield className="w-6 h-6 text-amber-400" />
            </div>

            <div className="text-xs text-slate-300 space-y-1 mb-4">
              <div><strong>Scholar:</strong> Tobi Adeyemi</div>
              <div><strong>Division:</strong> Senior Secondary (SSS) STEM</div>
              <div><strong>Final Score:</strong> {score} Points (Top 3% Nationally)</div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex justify-between items-center">
              <span>LEDGER HASH:</span>
              <span className="text-amber-400/90 font-bold">{certificateHash}</span>
            </div>
          </div>

          <button
            onClick={() => setStage("LOBBY")}
            className="py-3 px-6 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-750"
          >
            Return to Tournament Hall
          </button>
        </div>
      )}
    </div>
  );
}

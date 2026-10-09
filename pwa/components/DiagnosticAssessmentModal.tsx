"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Check, Award, Brain, Target, Sparkles, ChevronRight, 
  ChevronLeft, Clock, AlertTriangle, ArrowRight, BookOpen, ShieldCheck
} from "lucide-react";
import confetti from "canvas-confetti";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  userKey?: string;
  onCompleted?: (result: any) => void;
}

export default function DiagnosticAssessmentModal({
  isOpen,
  onClose,
  userKey = "EDU-2025-LAG-1001",
  onCompleted
}: DiagnosticModalProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  // Fetch 20 diagnostic questions on open
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/backend/diagnostic/questions")
        .then((r) => r.json())
        .then((d) => {
          if (d.questions && d.questions.length > 0) {
            setQuestions(d.questions);
          }
        })
        .catch((err) => console.error("Failed to load diagnostic:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || result) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, result]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(userAnswers).length;

  const handleSelectOption = (opt: string) => {
    sfx.tap();
    triggerTmaHaptic("light");
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: opt }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    sfx.tap();
    triggerTmaHaptic("heavy");

    const answersPayload = questions.map((q) => ({
      question_id: q.id,
      selected_option: userAnswers[q.id] || "A",
      time_spent_secs: 15
    }));

    try {
      const res = await fetch("/api/backend/diagnostic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_key: userKey,
          tier: "UTME",
          answers: answersPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        sfx.correct();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.4 } });
        if (onCompleted) onCompleted(data);
      }
    } catch (err) {
      console.error("Diagnostic submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl text-left my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-[#00E676] flex items-center justify-center font-bold text-sm">
              🎯
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Sovereign Baseline Diagnostic
              </h2>
              <p className="text-[11px] font-mono text-zinc-400">
                Foundational 4: English • Maths • Physics • Chemistry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!result && (
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTimer(secondsLeft)}
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-zinc-400">
              Synthesizing 20-Question Multidisciplinary Calibration Hall...
            </p>
          </div>
        ) : result ? (
          /* Calibration Result Card */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/40 text-center space-y-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-mono font-bold text-emerald-300 uppercase">
                Academic Calibration Locked ✓
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-white">
                {result.score_summary?.projected_jamb_score || 280}{" "}
                <span className="text-base font-normal text-zinc-400">/ 400 Projected UTME</span>
              </h3>
              <p className="text-xs text-zinc-300 max-w-md mx-auto">
                Baseline calibration completed. Your longitudinal mastery radar is now actively tracking prerequisites and error traps.
              </p>
            </div>

            {/* Subject Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {Object.entries(result.score_summary?.subject_breakdown || {}).map(([subj, score]: any) => (
                <div key={subj} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <div className="text-[10px] text-zinc-400 uppercase font-mono">{subj}</div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">{score}</div>
                </div>
              ))}
            </div>

            {/* Strength vs Weak Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> High Proficiency Areas
                </div>
                {result.strong_topics?.map((t: any, i: number) => (
                  <div key={i} className="text-zinc-300 text-[11px] flex justify-between">
                    <span>{t.topic}</span>
                    <span className="font-mono text-emerald-400">{t.mastery}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                <div className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Remediation Focus (Weak Traps)
                </div>
                {result.weak_topics?.map((t: any, i: number) => (
                  <div key={i} className="text-zinc-300 text-[11px] flex justify-between">
                    <span>{t.topic}</span>
                    <span className="font-mono text-rose-400">{t.mastery}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-xs hover:brightness-110 active:scale-95 transition cursor-pointer"
            >
              Enter Personalized Study Hall
            </button>
          </div>
        ) : (
          /* Active Question View */
          <div className="space-y-5">
            {/* Subject Badge & Progress */}
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-[#00E676] font-mono font-bold text-[11px]">
                {currentQ?.subject?.toUpperCase()} • {currentQ?.topic}
              </span>
              <span className="text-zinc-400 font-mono text-[11px]">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            {/* Question Text */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 min-h-[90px] flex items-center">
              <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                {currentQ?.question_text}
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 gap-2">
              {currentQ?.options &&
                Object.entries(currentQ.options).map(([optKey, optText]: any) => {
                  const isSelected = userAnswers[currentQ.id] === optKey;
                  return (
                    <button
                      key={optKey}
                      onClick={() => handleSelectOption(optKey)}
                      className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/20 border-emerald-400 text-white shadow-sm"
                          : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                          isSelected
                            ? "bg-emerald-500 text-black font-black"
                            : "bg-white/10 text-zinc-400"
                        }`}
                      >
                        {optKey}
                      </span>
                      <span className="flex-1">{optText}</span>
                    </button>
                  );
                })}
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 disabled:opacity-30 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white cursor-pointer flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-xs hover:brightness-110 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? "Grading..." : "Submit Calibration"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

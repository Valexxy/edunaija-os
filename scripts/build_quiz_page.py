# Helper to generate quiz page
import os

code = """\\"use client\\";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flag, ArrowRight, ArrowLeft, Heart, Zap, Sparkles, 
  HelpCircle, BookOpen, CheckCircle2, XCircle, Grid3X3, 
  RefreshCw, Bot, Share2, Layers, Award, AlertCircle, X
} from "lucide-react";
import confetti from "canvas-confetti";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";
import Link from "next/link";
import CBTLockdown from "../../components/CBTLockdown";
import GhostRacer from "../../components/GhostRacer";
import BionicReading from "../../components/BionicReading";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

interface Question {
  id: number;
  subject: string;
  exam_type: string;
  year: number;
  topic: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  correct_index: number;
  formula_latex?: string;
  explanation: string;
  wrong_analysis: string;
}

const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 1,
    subject: "Physics",
    exam_type: "JAMB",
    year: 2023,
    topic: "Work, Energy & Power",
    question_text: "A body of mass 5 kg moves with a constant velocity of 10 m/s on a frictionless horizontal plane. Calculate the kinetic energy possessed by the moving body.",
    option_a: "50 J",
    option_b: "250 J",
    option_c: "500 J",
    option_d: "25 J",
    correct_option: "B",
    correct_index: 1,
    formula_latex: "KE = \\\\frac{1}{2}mv^2",
    explanation: "Kinetic energy KE = 0.5 * m * v^2 = 0.5 * 5 kg * (10 m/s)^2 = 0.5 * 5 * 100 = 250 Joules.",
    wrong_analysis: "Option A forgets squaring velocity (0.5 * 5 * 10 = 25 J or 50 J). Option C omits the 1/2 factor (5 * 100 = 500 J)."
  }
];

export default function QuizPage() {
  const [allQuestions, setAllQuestions] = useState<Question[]>(FALLBACK_QUESTIONS);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, { selectedIndex: number; isCorrect: boolean }>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 mins CBT timer
  const [streak, setStreak] = useState(0);
  const [enableBionic, setEnableBionic] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  
  // Gemini Socratic Broda state
  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(null);
  const [loadingGemini, setLoadingGemini] = useState(false);
  const [geminiLang, setGeminiLang] = useState<"pidgin" | "standard">("pidgin");

  // Fetch all 110 questions from backend
  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch("http://127.0.0.1:8000/quiz/questions?limit=150");
        if (res.ok) {
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            setAllQuestions(data.questions);
          }
        }
      } catch (err) {
        console.warn("Backend questions fetch offline, using seeded cache:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  // Filter questions based on selected subject
  const filteredQuestions = useMemo(() => {
    if (selectedSubject === "All") return allQuestions;
    return allQuestions.filter(q => q.subject.toLowerCase() === selectedSubject.toLowerCase());
  }, [allQuestions, selectedSubject]);

  const currentQ: Question = filteredQuestions[currentIndex] || filteredQuestions[0] || FALLBACK_QUESTIONS[0];

  // Sync selectedOption when switching questions
  useEffect(() => {
    if (currentQ && answers[currentQ.id] !== undefined) {
      setSelectedOption(answers[currentQ.id].selectedIndex);
    } else {
      setSelectedOption(null);
    }
    setGeminiExplanation(null);
  }, [currentIndex, currentQ, answers]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) =>
    `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, "0")}`;

  const handleSelect = (idx: number) => {
    if (answers[currentQ.id] !== undefined) return;
    sfx.tap();
    triggerTmaHaptic("light");
    setSelectedOption(idx);
  };

  const handleSubmit = useCallback(() => {
    if (selectedOption === null || answers[currentQ.id] !== undefined) return;

    const isCorrect = selectedOption === currentQ.correct_index;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: { selectedIndex: selectedOption, isCorrect }
    }));

    if (isCorrect) {
      sfx.correct();
      triggerTmaHaptic("medium");
      setStreak(s => {
        const next = s + 1;
        if (next % 3 === 0) {
          confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
          sfx.streakCelebration();
        }
        return next;
      });
    } else {
      sfx.wrong();
      triggerTmaHaptic("heavy");
      setStreak(0);
    }
  }, [selectedOption, answers, currentQ]);

  const toggleFlag = () => {
    sfx.tap();
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) next.delete(currentQ.id);
      else next.add(currentQ.id);
      return next;
    });
  };

  const handleNext = () => {
    sfx.tap();
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  const handlePrev = () => {
    sfx.tap();
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  };

  // Keyboard navigation for CBT hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toUpperCase();
      if (key === "A") handleSelect(0);
      else if (key === "B") handleSelect(1);
      else if (key === "C") handleSelect(2);
      else if (key === "D") handleSelect(3);
      else if (key === "ENTER") handleSubmit();
      else if (key === "N" || key === "ARROW_RIGHT") handleNext();
      else if (key === "P" || key === "ARROW_LEFT") handlePrev();
      else if (key === "F") toggleFlag();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Call Gemini AI Socratic Broda API
  const askGeminiBroda = async () => {
    if (!currentQ) return;
    setLoadingGemini(true);
    sfx.tap();
    const chosenLetters = ["A", "B", "C", "D"];
    const chosenLetter = selectedOption !== null ? chosenLetters[selectedOption] : "None";

    try {
      const res = await fetch("http://127.0.0.1:8000/quiz/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: currentQ.question_text,
          selected_option: chosenLetter,
          correct_option: currentQ.correct_option,
          subject: currentQ.subject,
          mode: geminiLang
        })
      });
      const data = await res.json();
      setGeminiExplanation(data.explanation || "No explanation returned.");
      sfx.correct();
    } catch {
      setGeminiExplanation("Omo network small delay! But see standard solution above: " + currentQ.explanation);
    } finally {
      setLoadingGemini(false);
    }
  };

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allQuestions.length };
    allQuestions.forEach(q => {
      counts[q.subject] = (counts[q.subject] || 0) + 1;
    });
    return counts;
  }, [allQuestions]);

  const subjectsList = ["All", "Mathematics", "Physics", "Chemistry", "English", "Biology", "Economics"];

  const currentAnswered = answers[currentQ.id];
  const isQuestionAnswered = currentAnswered !== undefined;

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col pb-28">
      {/* 2026 Anti-Cheat CBT Bar */}
      <CBTLockdown examTitle="JAMB CBT Simulator 2025/2026" />

      <main className="p-4 max-w-2xl mx-auto w-full flex-1 flex flex-col">
        {/* Subject Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
          {subjectsList.map((sub) => {
            const count = sub === "Economics" ? (subjectCounts["Economics"] || subjectCounts["Economics & Govt"] || 10) : (subjectCounts[sub] || 0);
            return (
              <button
                key={sub}
                onClick={() => {
                  sfx.tap();
                  setSelectedSubject(sub);
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedSubject === sub
                    ? "bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.4)]"
                    : "glass-card text-zinc-400 hover:text-white border-white/5"
                }`}
              >
                <span>{sub}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedSubject === sub ? "bg-black/20 text-black font-extrabold" : "bg-white/10 text-zinc-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Top Timer & Palette Bar */}
        <header className="flex justify-between items-center mb-2 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
              {currentQ.subject.toUpperCase()} • Q {currentIndex + 1}/{filteredQuestions.length}
            </span>
            {flagged.has(currentQ.id) && (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flag className="w-2.5 h-2.5 fill-current" /> Flagged
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { sfx.tap(); setShowPalette(true); }}
              className="glass-card hover:border-[#00E676]/40 px-2.5 py-1 rounded-xl text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all text-xs"
              title="View all questions palette"
            >
              <Grid3X3 className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Palette</span>
            </button>
            <span className="font-mono text-naija-gold bg-naija-gold/10 border border-naija-gold/20 px-2.5 py-1 rounded-full">
              ⏱️ {formatTime(timeLeft)}
            </span>
          </div>
        </header>

        {/* Ghost Racer Pacing Tracker */}
        <GhostRacer 
          currentQuestion={currentIndex + 1} 
          totalQuestions={filteredQuestions.length} 
          ghostQuestion={Math.min(filteredQuestions.length, currentIndex + 3)} 
        />

        {/* Saccadic Bionic Reading Toggle */}
        <div className="flex justify-between items-center mb-2 text-xs">
          <span className="text-zinc-500 text-[11px] font-mono">
            {currentQ.exam_type} {currentQ.year} • {currentQ.topic}
          </span>
          <button
            onClick={() => { sfx.tap(); setEnableBionic(!enableBionic); }}
            className="text-[10px] font-bold text-zinc-400 hover:text-white flex items-center gap-1 glass-card px-2.5 py-1 rounded-full border-white/5"
          >
            <Zap className="w-3 h-3 text-[#00E676]" /> {enableBionic ? "Standard View" : "Bionic Speed Reading"}
          </button>
        </div>

        {/* Question Display Card */}
        <div className="glass-card rounded-3xl p-5 mb-4 border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              ⭐ JAMB Past Question Standard
            </span>
            {streak >= 3 && (
              <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                🔥 {streak} Streak
              </span>
            )}
          </div>

          {enableBionic ? (
            <BionicReading text={currentQ.question_text} />
          ) : (
            <h2 className="text-base font-semibold mb-3 leading-relaxed text-zinc-100">
              {currentQ.question_text}
            </h2>
          )}

          {/* Render Mathematical LaTeX formula if present */}
          {currentQ.formula_latex && (
            <div className="my-3 p-3 bg-black/50 rounded-2xl border border-white/10 flex items-center justify-center overflow-x-auto text-emerald-300">
              <BlockMath math={currentQ.formula_latex} />
            </div>
          )}
        </div>

        {/* Multiple Choice Options (A, B, C, D) */}
        <div className="space-y-2.5 mb-4">
          {[
            { id: 0, label: "A", text: currentQ.option_a },
            { id: 1, label: "B", text: currentQ.option_b },
            { id: 2, label: "C", text: currentQ.option_c },
            { id: 3, label: "D", text: currentQ.option_d },
          ].map((opt) => {
            const isSelected = selectedOption === opt.id;
            const isCorrectAnswer = opt.id === currentQ.correct_index;
            let btnClass = "glass-card border-white/5 text-zinc-300 hover:border-white/20";

            if (isQuestionAnswered) {
              if (isCorrectAnswer) {
                btnClass = "border-[#00E676] bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(0,230,118,0.25)]";
              } else if (isSelected && !currentAnswered.isCorrect) {
                btnClass = "border-red-500 bg-red-500/20 text-white shadow-[0_0_15px_rgba(239,68,68,0.25)]";
              }
            } else if (isSelected) {
              btnClass = "border-[#00E676] bg-[#00E676]/10 text-white shadow-[0_0_15px_rgba(0,230,118,0.15)]";
            }

            return (
              <motion.button
                key={opt.id}
                whileTap={{ scale: isQuestionAnswered ? 1 : 0.98 }}
                onClick={() => handleSelect(opt.id)}
                disabled={isQuestionAnswered}
                className={`w-full text-left p-3.5 rounded-2xl border flex items-center justify-between transition-all ${btnClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                    isQuestionAnswered && isCorrectAnswer
                      ? "bg-[#00E676] text-black"
                      : isQuestionAnswered && isSelected && !currentAnswered.isCorrect
                      ? "bg-red-500 text-white"
                      : isSelected
                      ? "bg-[#00E676] text-black"
                      : "bg-white/5 text-zinc-400"
                  }`}>
                    {opt.label}
                  </span>
                  <span className="font-semibold text-sm leading-snug">{opt.text}</span>
                </div>

                {isQuestionAnswered && isCorrectAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-[#00E676] flex-shrink-0" />
                )}
                {isQuestionAnswered && isSelected && !currentAnswered.isCorrect && (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* STEP-BY-STEP EXPLAINER DRAWER (Appears on answer) */}
        <AnimatePresence>
          {isQuestionAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 p-5 rounded-3xl bg-[#0D0D14] border border-white/15 space-y-3.5 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-xl ${currentAnswered.isCorrect ? "bg-emerald-500/20 text-[#00E676]" : "bg-red-500/20 text-red-400"}`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">
                    {currentAnswered.isCorrect ? "Step-by-Step Mathematical Derivation" : "Diagnostic Solution & Common Mistake"}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded-full bg-white/5">
                  Correct: Option {currentQ.correct_option}
                </span>
              </div>

              {/* Exact Step-by-Step Derivation */}
              <div className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-3.5 rounded-2xl border border-white/5">
                <p className="font-semibold text-white mb-1">📖 Complete Explanation:</p>
                <p>{currentQ.explanation}</p>
              </div>

              {/* Distractor / Wrong Analysis */}
              {!currentAnswered.isCorrect && currentQ.wrong_analysis && (
                <div className="text-xs text-amber-200/90 leading-relaxed bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/20 flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-400">Why your choice was wrong: </strong>
                    <span>{currentQ.wrong_analysis}</span>
                  </div>
                </div>
              )}

              {/* GEMINI SOCRATIC BRODA AI SECTION */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>Gemini AI Tutor: Socratic Broda</span>
                  </div>
                  
                  {/* Language switch: Pidgin vs Standard */}
                  <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/5 text-[10px]">
                    <button
                      onClick={() => setGeminiLang("pidgin")}
                      className={`px-2 py-0.5 rounded-lg transition-all ${geminiLang === "pidgin" ? "bg-purple-600 text-white font-bold" : "text-zinc-400"}`}
                    >
                      🇳🇬 Pidgin
                    </button>
                    <button
                      onClick={() => setGeminiLang("standard")}
                      className={`px-2 py-0.5 rounded-lg transition-all ${geminiLang === "standard" ? "bg-purple-600 text-white font-bold" : "text-zinc-400"}`}
                    >
                      🇬🇧 Standard
                    </button>
                  </div>
                </div>

                {!geminiExplanation ? (
                  <button
                    onClick={askGeminiBroda}
                    disabled={loadingGemini}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/30 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(147,51,234,0.15)]"
                  >
                    {loadingGemini ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Socratic Broda is thinking...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>Ask Socratic Broda ({geminiLang === "pidgin" ? "Explain for Pidgin" : "Explain Step-by-Step"})</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 leading-relaxed shadow-lg">
                    <div className="flex items-center gap-1.5 font-bold text-purple-300 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Socratic Broda says:</span>
                    </div>
                    <p className="whitespace-pre-line">{geminiExplanation}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Actions Bar */}
        <div className="pt-4 border-t border-white/10 flex justify-between items-center mt-6">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="text-xs text-zinc-400 hover:text-white font-bold px-3 py-2 rounded-xl glass-card border-white/5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Prev
          </button>

          <button 
            onClick={toggleFlag} 
            className={`flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl glass-card transition-all ${
              flagged.has(currentQ.id) 
                ? "text-amber-400 border-amber-500/40 bg-amber-500/10" 
                : "text-zinc-400 hover:text-amber-400 border-white/5"
            }`}
          >
            <Flag className="w-3.5 h-3.5" /> Flag
          </button>

          {!isQuestionAnswered ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="bg-gradient-to-r from-[#00E676] to-[#008751] text-black font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,230,118,0.3)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentIndex === filteredQuestions.length - 1}
              className="bg-[#00E676] text-black font-extrabold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,230,118,0.3)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-40"
            >
              Next Question <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </main>

      {/* FULL QUESTION PALETTE MODAL (1 to 110 Question Grid) */}
      <AnimatePresence>
        {showPalette && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0D0D14] border border-white/10 rounded-3xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4 text-[#00E676]" />
                    <span>CBT Question Navigation Grid</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {filteredQuestions.length} Questions in {selectedSubject}
                  </p>
                </div>
                <button
                  onClick={() => setShowPalette(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 py-3 text-[10px] font-bold border-b border-white/5">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00E676]" /> Correct
                </span>
                <span className="flex items-center gap-1 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Wrong
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Flagged
                </span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" /> Unanswered
                </span>
              </div>

              {/* Grid of question buttons */}
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 py-4 overflow-y-auto max-h-[50vh]">
                {filteredQuestions.map((q, idx) => {
                  const ans = answers[q.id];
                  const isFlag = flagged.has(q.id);
                  const isCurr = idx === currentIndex;

                  let bg = "bg-white/5 border-white/10 text-zinc-300 hover:border-white/30";
                  if (ans) {
                    bg = ans.isCorrect
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                      : "bg-red-500/20 border-red-500 text-red-400 font-bold";
                  } else if (isFlag) {
                    bg = "bg-amber-500/20 border-amber-500 text-amber-400 font-bold";
                  }

                  if (isCurr) {
                    bg += " ring-2 ring-white";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        sfx.tap();
                        setCurrentIndex(idx);
                        setShowPalette(false);
                      }}
                      className={`h-9 rounded-xl border text-xs font-mono transition-all flex items-center justify-center ${bg}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setShowPalette(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/20"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
"""

with open('pwa/app/quiz/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: Wrote upgraded pwa/app/quiz/page.tsx")

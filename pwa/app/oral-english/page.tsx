"use client";

import { useState, useEffect } from "react";
import { 
  Volume2, VolumeX, Mic, CheckCircle2, AlertCircle, 
  Sparkles, BookOpen, ArrowRight, RotateCcw, Award, Headphones
} from "lucide-react";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";
import PhonemSpectrogram from "../../components/PhonemSpectrogram";
import BackButton from "../../components/BackButton";
import ExamInstructionsModal from "../../components/ExamInstructionsModal";

export default function OralEnglishPage() {
  const [drills, setDrills] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const categories = [
    { id: "all", label: "All Drills" },
    { id: "vowels", label: "Vowels & Diphthongs" },
    { id: "consonants", label: "Silent Consonants" },
    { id: "stress", label: "Emphatic & Syllable Stress" },
    { id: "rhymes", label: "Rhyme Identification" }
  ];

  const fetchDrills = async (cat: string) => {
    setLoading(true);
    try {
      const url = cat === "all" 
        ? "/api/backend/oral-english/drills" 
        : `/api/backend/oral-english/drills?category=${cat}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDrills(data.drills || []);
      }
    } catch {
      // Fallback
      setDrills([
        {
          id: "oe-1",
          category: "vowels",
          sub_category: "Short vs Long Vowels",
          phonetic_symbol: "/i:/ vs /ɪ/",
          question_text: "Which of the following words contains the long vowel sound /i:/ as in 'FLEET'?",
          options: [
            { label: "A", text: "Sit" },
            { label: "B", text: "Ceiling" },
            { label: "C", text: "Pretty" },
            { label: "D", text: "Women" }
          ],
          correct_option: "B",
          ipa_pronunciation: "/ˈsiː.lɪŋ/",
          audio_phoneme_tip: "The 'ei' in 'ceiling' produces the long /i:/ sound. 'Sit', 'pretty' (/ɪ/), and 'women' (/ɪ/) have short /ɪ/.",
          exam_year: "JAMB 2024"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrills(selectedCategory);
  }, [selectedCategory]);

  const handleSpeak = (text: string) => {
    sfx.tap();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-GB"; // Standard British English as tested by JAMB
      utterance.rate = 0.85; // Slightly slower for clear phonetic articulation
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectOption = (drillId: string, optLabel: string) => {
    if (revealed[drillId]) return;
    sfx.tap();
    setUserAnswers(prev => ({ ...prev, [drillId]: optLabel }));
  };

  const handleCheckAnswer = (drill: any) => {
    const chosen = userAnswers[drill.id];
    if (!chosen) return;

    setRevealed(prev => ({ ...prev, [drill.id]: true }));
    const isCorrect = chosen === drill.correct_option;

    if (isCorrect) {
      sfx.correct();
      triggerTmaHaptic("heavy");
      setScore(prev => prev + 1);
    } else {
      sfx.wrong();
      triggerTmaHaptic("error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div>
        <BackButton fallbackHref="/student" label="Back to Cockpit" />
      </div>
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/50 via-[#0e101c] to-black border border-indigo-500/30 p-6 md:p-8 shadow-[0_0_60px_rgba(99,102,241,0.15)]">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-black tracking-wide uppercase mb-3">
            <Headphones className="w-4 h-4 text-indigo-400" />
            <span>Phonetics & Audio Examiner</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black font-display text-white tracking-tight leading-tight mb-2">
            Phonetic Oral English & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-200">
              Emphatic Stress Lab
            </span>
          </h1>

          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed mb-4">
            Master the 15-20 crucial marks tested in JAMB Section 4 (Oral Forms). 
            Listen to native Received Pronunciation (RP), isolate silent letters, and crack contrastive sentence stress.
          </p>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Session Score: <strong className="text-white">{score}</strong> Correct</span>
            </div>
            <button
              onClick={() => {
                sfx.tap();
                setShowInstructions(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>🎧</span>
              <span>Audio Drill Instructions</span>
            </button>
            <button
              onClick={() => {
                setUserAnswers({});
                setRevealed({});
                setScore(0);
                sfx.tap();
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Reset Drills"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Oral Phonetics Instructions Modal */}
          <ExamInstructionsModal
            isOpen={showInstructions}
            onClose={() => setShowInstructions(false)}
            examType="oral_phonetics"
            title="JAMB & WAEC Oral English Lab Protocol"
            durationMinutes={20}
            questionCount={15}
            tier="WAEC / JAMB"
          />
        </div>
      </div>

      {/* World-First Web Audio Phoneme Spectrogram Component */}
      <PhonemSpectrogram 
        targetWord="FLEET"
        targetIPA="/iː/"
        targetF1={270}
        targetF2={2290}
        onScore={(sc) => {
          setScore(prev => prev + (sc >= 75 ? 2 : 0));
        }}
      />

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => {
          const isActive = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                sfx.tap();
                setSelectedCategory(c.id);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-sky-400 text-black shadow-md font-black"
                  : "bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Drill Cards */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-12 text-center text-zinc-400">
            <Headphones className="w-8 h-8 animate-bounce mx-auto mb-2 text-indigo-400" />
            <p className="text-xs font-mono">Loading Oral English Phonetic Drills...</p>
          </div>
        ) : (
          drills.map((drill, index) => {
            const chosen = userAnswers[drill.id];
            const isRevealed = revealed[drill.id];
            const isCorrect = chosen === drill.correct_option;

            return (
              <div 
                key={drill.id}
                className="rounded-3xl bg-gradient-to-b from-white/[0.04] to-black border border-white/10 p-5 md:p-6 space-y-4 shadow-lg hover:border-indigo-500/30 transition-all"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {drill.sub_category}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded-lg border border-white/5">
                      {drill.phonetic_symbol}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono">
                    {drill.exam_year}
                  </span>
                </div>

                {/* Question and Audio Pronunciation */}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm md:text-base font-bold text-white leading-relaxed">
                    {drill.question_text}
                  </p>

                  <button
                    onClick={() => handleSpeak(drill.question_text)}
                    className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 transition-all active:scale-95 shrink-0"
                    title="Listen to standard RP pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {drill.options.map((opt: any) => {
                    const isSelected = chosen === opt.label;
                    let btnStyle = "bg-white/5 border-white/10 hover:border-white/20 text-zinc-300";

                    if (isRevealed) {
                      if (opt.label === drill.correct_option) {
                        btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                      } else if (isSelected) {
                        btnStyle = "bg-red-500/20 border-red-500 text-red-300 font-bold";
                      }
                    } else if (isSelected) {
                      btnStyle = "bg-indigo-500/20 border-indigo-400 text-indigo-300 font-bold";
                    }

                    return (
                      <div
                        key={opt.label}
                        onClick={() => handleSelectOption(drill.id, opt.label)}
                        className={`p-3 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-all ${btnStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-[11px]">
                            {opt.label}
                          </span>
                          <span className="text-sm font-semibold">{opt.text}</span>
                        </div>

                        {/* Pronounce option word */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(opt.text);
                          }}
                          className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                          title={`Listen to '${opt.text}'`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Action / Explanation */}
                {!isRevealed ? (
                  <button
                    onClick={() => handleCheckAnswer(drill)}
                    disabled={!chosen}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-40"
                  >
                    Confirm Phonetic Choice
                  </button>
                ) : (
                  <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-fade-in ${
                    isCorrect ? "bg-emerald-950/20 border-emerald-500/40" : "bg-red-950/20 border-red-500/40"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold flex items-center gap-1.5 ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {isCorrect ? "Phonetically Exact! +10 XP" : `Incorrect. Correct Option is ${drill.correct_option}`}
                      </span>
                      <span className="font-mono text-zinc-400 text-[11px]">
                        IPA: <strong className="text-amber-300">{drill.ipa_pronunciation}</strong>
                      </span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">
                      {drill.audio_phoneme_tip}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, Zap, BookOpen, Volume2, VolumeX, Star, 
  HelpCircle, Compass, Award, Play, RotateCcw, ArrowRight
} from "lucide-react";
import { nigerianVoice } from "../lib/nigerianVoice";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

export interface SyllableWord {
  display: string;
  syllables: string[];
  pictogram?: string;
  meaning?: string;
}

export const SAMPLE_PHONIC_WORDS: SyllableWord[] = [
  { display: "Photosynthesis", syllables: ["pho", "to", "syn", "the", "sis"], pictogram: "🌱", meaning: "How plants make food using sunlight" },
  { display: "Respiration", syllables: ["res", "pi", "ra", "tion"], pictogram: "🫁", meaning: "Breathing in clean air and giving energy" },
  { display: "Democracy", syllables: ["de", "moc", "ra", "cy"], pictogram: "🇳🇬", meaning: "Government of the people, by the people" },
  { display: "Multiplication", syllables: ["mul", "ti", "pli", "ca", "tion"], pictogram: "✖️", meaning: "Adding groups of equal numbers together" },
  { display: "Electricity", syllables: ["e", "lec", "tri", "ci", "ty"], pictogram: "⚡", meaning: "Flow of energy that lights up our bulbs" }
];

interface PrimaryPupilModeProps {
  user: any;
  onOpenGuide?: () => void;
  onOpenParentGate?: () => void;
}

export default function PrimaryPupilMode({
  user,
  onOpenGuide,
  onOpenParentGate
}: PrimaryPupilModeProps) {
  const [magicStars, setMagicStars] = useState<number>(142);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [selectedLab, setSelectedLab] = useState<"circuit" | "matter">("circuit");
  
  // Circuit mini experiment state
  const [batteryLevel, setBatteryLevel] = useState<number>(2); // 1, 2, 3
  
  // Matter mini experiment state
  const [tempState, setTempState] = useState<"ice" | "water" | "steam">("water");

  const handlePronounceWord = (word: SyllableWord, index: number) => {
    setActiveWordIndex(index);
    sfx.tap();
    triggerTmaHaptic("light");
    nigerianVoice.speak(word.display, {
      persona: "auntie_bola",
      speed: "slow",
      onEnd: () => setActiveWordIndex(null),
      onError: () => setActiveWordIndex(null)
    });
  };

  const handleReadFullPhonics = () => {
    if (isNarrating) {
      nigerianVoice.stop();
      setIsNarrating(false);
      return;
    }
    sfx.tap();
    setIsNarrating(true);
    const text = "Welcome young scholar! Tap any big word below to hear Auntie Bola sound out each syllable clearly!";
    nigerianVoice.speak(text, {
      persona: "auntie_bola",
      speed: "slow",
      onEnd: () => setIsNarrating(false),
      onError: () => setIsNarrating(false)
    });
  };

  const addMagicStar = () => {
    sfx.streakCelebration();
    triggerTmaHaptic("heavy");
    setMagicStars(s => s + 5);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Primary Pupil Sunshine Cockpit Header */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-emerald-500/20 border-2 border-amber-400/40 p-5 sm:p-7 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-black shadow-sm">
                🎒 BASIC 1-6 PRIMARY COCKPIT
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                100% Safe Sandbox
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight flex items-center gap-2">
              <span>Welcome, {user?.full_name?.split(" ")[0] || "Super Scholar"}! 🌟</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
              Explore science labs, pronounce big words with Auntie Bola, and collect Magic Stars. No lost hearts or test stress here!
            </p>

            {/* Interactive Animated Mascot Buddy Bar */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={addMagicStar}
                className="group flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                title="Tap Ijapa for +5 Magic Stars!"
              >
                <span className="text-2xl animate-bounce filter drop-shadow">🐢</span>
                <span className="text-left leading-tight">
                  <span className="block text-white font-black text-[11px]">Ijapa Buddy: &quot;You can do it!&quot;</span>
                  <span className="text-[10px] text-amber-300 font-mono font-normal">Tap me for +5 Stars ⭐</span>
                </span>
              </button>
            </div>
          </div>

          {/* Magic Star Bank */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-black/60 border-2 border-amber-400 flex items-center gap-2.5 shadow-lg">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400 animate-spin-slow" />
              <div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Magic Stars</div>
                <div className="text-lg font-black text-amber-300 font-mono leading-none">{magicStars} ⭐</div>
              </div>
            </div>

            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className="h-12 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                title="Primary Help Tour"
              >
                <HelpCircle className="w-4 h-4" />
                <span>How to Play</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Phonics & Syllable Reader */}
      <div className="rounded-3xl bg-zinc-950/80 border-2 border-amber-400/30 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center text-xl border border-amber-400/30">
              🗣️
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Phonics &amp; Syllable Explorer</h2>
              <p className="text-xs text-zinc-400">Tap any word to hear syllables pronounced one-by-one!</p>
            </div>
          </div>

          <button
            onClick={handleReadFullPhonics}
            className={`h-11 px-4 rounded-xl flex items-center gap-2 font-bold text-xs transition-all active:scale-95 cursor-pointer ${
              isNarrating
                ? "bg-amber-500 text-black font-black shadow-md"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            {isNarrating ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
            <span>{isNarrating ? "Stop Narration" : "Read Page Aloud"}</span>
          </button>
        </div>

        {/* Syllable Word Tiles (Min 56px touch height) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SAMPLE_PHONIC_WORDS.map((word, idx) => {
            const isSelected = activeWordIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => handlePronounceWord(word, idx)}
                className={`min-h-[72px] p-3.5 rounded-2xl border-2 text-left transition-all active:scale-95 flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 shadow-md scale-[1.02]"
                    : "bg-black/40 hover:bg-white/5 border-white/10 hover:border-amber-400/50"
                }`}
              >
                <span className="text-2xl shrink-0 mt-0.5">{word.pictogram}</span>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1 font-black text-base text-white">
                    {word.syllables.map((syl, sIdx) => (
                      <span
                        key={sIdx}
                        className={sIdx % 2 === 0 ? "text-amber-300" : "text-emerald-400"}
                      >
                        {syl}
                        {sIdx < word.syllables.length - 1 && <span className="text-zinc-500 mx-0.5">·</span>}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">{word.meaning}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive Wonder Labs (Hands-On Play) */}
      <div className="rounded-3xl bg-zinc-950/80 border-2 border-emerald-500/30 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl border border-emerald-500/30">
              🔬
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Wonder Science Labs</h2>
              <p className="text-xs text-zinc-400">Touch and experiment to see science happen in real time!</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLab("circuit")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedLab === "circuit"
                  ? "bg-emerald-500 text-black font-black"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              ⚡ Electric Bulb Lab
            </button>
            <button
              onClick={() => setSelectedLab("matter")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedLab === "matter"
                  ? "bg-emerald-500 text-black font-black"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              🧊 States of Matter Lab
            </button>
          </div>
        </div>

        {selectedLab === "circuit" ? (
          <div className="bg-black/50 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                EXPERIMENT: HOW BATTERIES LIGHT A BULB
              </span>
              <h3 className="text-xl font-black text-white">Change the Batteries!</h3>
              <p className="text-xs text-zinc-300 max-w-sm leading-relaxed">
                Add more batteries to make the electric current stronger and see the light bulb glow super bright!
              </p>

              <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
                {[1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      sfx.tap();
                      setBatteryLevel(lvl);
                      addMagicStar();
                    }}
                    className={`h-12 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                      batteryLevel === lvl
                        ? "bg-amber-400 text-black font-black shadow-lg"
                        : "bg-white/10 hover:bg-white/20 text-zinc-300"
                    }`}
                  >
                    🔋 {lvl} {lvl === 1 ? "Battery" : "Batteries"}
                  </button>
                ))}
              </div>
            </div>

            {/* Glowing Bulb Simulation */}
            <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/80 rounded-3xl border border-white/10 w-48 h-48 relative">
              <div
                className={`text-6xl transition-all duration-300 filter ${
                  batteryLevel === 1
                    ? "brightness-75 drop-shadow-[0_0_15px_rgba(255,184,0,0.4)]"
                    : batteryLevel === 2
                    ? "brightness-110 scale-110 drop-shadow-[0_0_30px_rgba(255,184,0,0.8)]"
                    : "brightness-150 scale-125 drop-shadow-[0_0_50px_rgba(255,230,0,1)]"
                }`}
              >
                💡
              </div>
              <span className="text-[11px] font-bold text-amber-300 mt-3 font-mono">
                {batteryLevel === 1 ? "Dim Light (1.5V)" : batteryLevel === 2 ? "Bright Light (3.0V)" : "SUPER GLOW (4.5V)!"}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-black/50 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                EXPERIMENT: SOLID, LIQUID &amp; GAS
              </span>
              <h3 className="text-xl font-black text-white">Heat Up or Cool Down!</h3>
              <p className="text-xs text-zinc-300 max-w-sm leading-relaxed">
                When water gets very cold below 0°C it turns to ice. When heated above 100°C it boils into steam!
              </p>

              <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
                <button
                  onClick={() => {
                    sfx.tap();
                    setTempState("ice");
                    addMagicStar();
                  }}
                  className={`h-12 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                    tempState === "ice"
                      ? "bg-cyan-400 text-black font-black shadow-lg"
                      : "bg-white/10 hover:bg-white/20 text-zinc-300"
                  }`}
                >
                  🧊 Freeze (-5°C)
                </button>
                <button
                  onClick={() => {
                    sfx.tap();
                    setTempState("water");
                    addMagicStar();
                  }}
                  className={`h-12 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                    tempState === "water"
                      ? "bg-blue-500 text-white font-black shadow-lg"
                      : "bg-white/10 hover:bg-white/20 text-zinc-300"
                  }`}
                >
                  💧 Room Temp (25°C)
                </button>
                <button
                  onClick={() => {
                    sfx.tap();
                    setTempState("steam");
                    addMagicStar();
                  }}
                  className={`h-12 px-4 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                    tempState === "steam"
                      ? "bg-orange-500 text-white font-black shadow-lg"
                      : "bg-white/10 hover:bg-white/20 text-zinc-300"
                  }`}
                >
                  💨 Boil (100°C)
                </button>
              </div>
            </div>

            {/* Matter Simulation Visual */}
            <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/80 rounded-3xl border border-white/10 w-48 h-48 relative">
              <div className="text-6xl transition-all duration-300 filter drop-shadow">
                {tempState === "ice" ? "🧊" : tempState === "water" ? "🌊" : "☁️"}
              </div>
              <span className="text-[11px] font-bold text-white mt-3 font-mono">
                {tempState === "ice" ? "SOLID: Ice Cube" : tempState === "water" ? "LIQUID: Fresh Water" : "GAS: Rising Steam"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Giant 56px Quick Action Launchers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/playground"
          className="h-16 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm flex items-center justify-between shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎮</span>
            <span>All Playground Games</span>
          </div>
          <ArrowRight className="w-5 h-5" />
        </Link>

        <Link
          href="/quiz"
          className="h-16 px-5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-sm flex items-center justify-between shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📝</span>
            <span>Common Entrance Practice</span>
          </div>
          <ArrowRight className="w-5 h-5" />
        </Link>

        <Link
          href="/qa"
          className="h-16 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-between shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🐢</span>
            <span>Ask AI Tutor Any Question</span>
          </div>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

    </div>
  );
}

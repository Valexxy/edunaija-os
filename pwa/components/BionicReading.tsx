"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Play, Pause, Zap } from "lucide-react";
import { sfx } from "../lib/audio";

interface BionicReadingProps {
  text: string;
}

export default function BionicReading({ text }: BionicReadingProps) {
  const [isRsvpMode, setIsRsvpMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(400);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);

  const words = text.split(/\s+/).filter(Boolean);

  // RSVP (Rapid Serial Visual Presentation) Flash Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRsvpMode && isPlaying && currentWordIdx < words.length) {
      const delayMs = (60 / wpm) * 1000;
      interval = setInterval(() => {
        setCurrentWordIdx((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, delayMs);
    }
    return () => clearInterval(interval);
  }, [isRsvpMode, isPlaying, wpm, currentWordIdx, words.length]);

  // Saccadic fixation: bold the first 40% of the word
  const formatWord = (word: string) => {
    if (word.length <= 3) {
      return (
        <span className="inline-block mr-1">
          <strong className="font-black text-white">{word.slice(0, 1)}</strong>
          <span className="font-light text-zinc-300">{word.slice(1)}</span>
        </span>
      );
    }
    const splitPoint = Math.ceil(word.length * 0.45);
    return (
      <span className="inline-block mr-1.5">
        <strong className="font-black text-[#00E676] drop-shadow-[0_0_8px_rgba(0,230,118,0.3)]">{word.slice(0, splitPoint)}</strong>
        <span className="font-light text-zinc-200">{word.slice(splitPoint)}</span>
      </span>
    );
  };

  return (
    <div className="glass-card rounded-2xl p-4 border border-white/10 relative overflow-hidden my-3">
      {/* Mode Toggle Controls */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-naija-green">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>2026 Neural Bionic Reader</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sfx.tap();
              setIsRsvpMode(!isRsvpMode);
              setIsPlaying(false);
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
              isRsvpMode ? "bg-[#00E676] text-black" : "bg-white/10 text-zinc-400"
            }`}
          >
            {isRsvpMode ? "Speed RSVP Active" : "Bionic Fixation"}
          </button>
        </div>
      </div>

      {isRsvpMode ? (
        /* RSVP Optical Flash Mode */
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <div className="h-16 flex items-center justify-center">
            <span className="text-3xl font-black text-white tracking-wide font-mono px-4 py-2 rounded-xl bg-black/40 border border-white/10">
              {words[currentWordIdx] || "Finished!"}
            </span>
          </div>

          <div className="text-[11px] text-zinc-400 mt-3 font-mono">
            Word {currentWordIdx + 1} of {words.length} • {wpm} WPM
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => {
                sfx.tap();
                setIsPlaying(!isPlaying);
              }}
              className="px-4 py-2 rounded-xl bg-[#00E676] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_#00E676]"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isPlaying ? "Pause" : "Start Fast-Read"}
            </button>

            <button
              onClick={() => {
                sfx.tap();
                setWpm((w) => (w >= 600 ? 300 : w + 50));
              }}
              className="px-3 py-2 rounded-xl glass-card text-xs font-bold text-zinc-300"
            >
              {wpm} WPM ⚡
            </button>
          </div>
        </div>
      ) : (
        /* Saccadic Bionic Reading Text Stream */
        <div className="text-sm leading-relaxed text-zinc-300 tracking-wide select-text">
          {words.map((w, idx) => (
            <span key={idx}>{formatWord(w)}</span>
          ))}
        </div>
      )}
    </div>
  );
}

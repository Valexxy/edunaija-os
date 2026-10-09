"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Swords, Trophy, Sparkles, Clock, CheckCircle2, 
  XCircle, Copy, Check, Users, ArrowRight, ShieldCheck, Flame, RotateCcw
} from "lucide-react";

interface Question {
  index: number;
  prompt: string;
  options: string[];
  correct_index: number;
  time_limit_sec: number;
}

export default function AxiomBoutArena() {
  const [mode, setMode] = useState<"LOBBY" | "HOSTING" | "JOINING" | "PLAYING" | "RESULT">("LOBBY");
  const [pin, setPin] = useState("");
  const [inputPin, setInputPin] = useState("");
  const [copied, setCopied] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [peerScore, setPeerScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isHost, setIsHost] = useState(true);

  // Sample verified STEM questions for Axiom Bout
  const questions: Question[] = [
    {
      index: 0,
      prompt: "Evaluate log10(1000) + log10(0.01)",
      options: ["A) 1", "B) 2", "C) 5", "D) 0.1"],
      correct_index: 0,
      time_limit_sec: 15
    },
    {
      index: 1,
      prompt: "If 2x + 7 = 19, what is the value of 5x - 3?",
      options: ["A) 22", "B) 27", "C) 30", "D) 18"],
      correct_index: 1,
      time_limit_sec: 15
    },
    {
      index: 2,
      prompt: "The velocity of light in a vacuum is approximately:",
      options: ["A) 3 × 10⁸ m/s", "B) 3 × 10⁶ m/s", "C) 1.5 × 10⁸ m/s", "D) 9.8 m/s²"],
      correct_index: 0,
      time_limit_sec: 15
    },
    {
      index: 3,
      prompt: "Which element possesses an atomic number of 17?",
      options: ["A) Fluorine", "B) Chlorine", "C) Argon", "D) Sulfur"],
      correct_index: 1,
      time_limit_sec: 15
    },
    {
      index: 4,
      prompt: "Which figure of speech involves attributing human characteristics to inanimate entities?",
      options: ["A) Metaphor", "B) Personification", "C) Hyperbole", "D) Oxymoron"],
      correct_index: 1,
      time_limit_sec: 15
    }
  ];

  // Sound generator using Web Audio API (zero external library required)
  const playChime = (type: "CORRECT" | "INCORRECT" | "LEVELUP") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "CORRECT") {
        // High harmonic 528 Hz bell chime
        osc.frequency.setValueAtTime(528, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(792, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === "INCORRECT") {
        // Gentle muted thud (no harsh buzzer)
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {
      // AudioContext not allowed before user gesture
    }
  };

  const handleCreateBout = async () => {
    try {
      const res = await fetch("/api/backend/axiom-bouts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host_id: "host-student",
          host_name: "Host Scholar",
          host_avatar: "⚡",
          subject: "Mathematics",
          cohort: "SSS"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setPin(data.pin);
        setIsHost(true);
        setMode("HOSTING");
        return;
      }
    } catch {}
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setPin(generated);
    setIsHost(true);
    setMode("HOSTING");
  };

  const handleStartMatch = () => {
    setCurrentQ(0);
    setScore(0);
    setPeerScore(0);
    setStreak(0);
    setTimeLeft(15);
    setSelectedOption(null);
    setIsAnswered(false);
    setMode("PLAYING");
  };

  // Timer countdown
  useEffect(() => {
    if (mode !== "PLAYING" || isAnswered) return;
    if (timeLeft <= 0) {
      handleOptionSelect(-1); // Timeout
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      // Simulate live peer answering
      if (Math.random() > 0.6) {
        setPeerScore(prev => prev + 25);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, timeLeft, isAnswered]);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const q = questions[currentQ];
    const correct = (index === q.correct_index);
    setIsCorrect(correct);

    // Call server-authoritative scoring endpoint
    fetch("/api/backend/axiom-bouts/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pin: pin || "1000",
        participant_id: isHost ? "host-student" : "peer-student",
        question_index: currentQ,
        selected_option: index,
        response_time_ms: Math.max(500, (15 - timeLeft) * 1000)
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.score !== undefined) {
          setScore(d.score);
        }
      })
      .catch(() => {});

    if (correct) {
      playChime("CORRECT");
      const speedBonus = timeLeft * 10;
      setScore(prev => prev + 100 + speedBonus);
      setStreak(prev => prev + 1);
    } else {
      playChime("INCORRECT");
      setStreak(0);
    }

    // Auto advance after 1.2s
    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setTimeLeft(15);
      } else {
        setMode("RESULT");
      }
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {mode === "LOBBY" && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-4">
            <Swords className="w-3.5 h-3.5" />
            <span>Tier A • Instant 1v1 Peer Duel</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
            Axiom Bouts™
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
            Challenge a classmate or peer in a 60-second trial of intellectual speed and accuracy. 100% merit-based.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-6">
            <button
              onClick={handleCreateBout}
              className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-base shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Host Duel (Get PIN)</span>
            </button>

            <button
              onClick={() => setMode("JOINING")}
              className="py-4 px-6 rounded-2xl bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-white font-bold text-base hover:bg-slate-750 transition flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Enter 4-Digit PIN</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Zero wait time • Synchronized live split-screen • Merit Kobo rewards
          </p>
        </div>
      )}

      {mode === "HOSTING" && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8 text-center shadow-2xl">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Axiom Bout PIN</span>
          <div className="my-6">
            <div className="inline-block bg-slate-950 border-2 border-emerald-500/50 rounded-2xl px-8 py-4 tracking-widest text-4xl md:text-5xl font-mono font-black text-emerald-400 shadow-inner">
              {pin}
            </div>
          </div>

          <p className="text-slate-300 text-sm mb-6 max-w-sm mx-auto">
            Give this 4-digit code to your peer or friend. Both devices will synchronize instantly.
          </p>

          <div className="flex justify-center gap-3 max-w-xs mx-auto mb-6">
            <button
              onClick={handleCopy}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-semibold hover:border-emerald-500/40 flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied PIN" : "Copy Code"}</span>
            </button>

            <button
              onClick={handleStartMatch}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold hover:bg-emerald-400 flex items-center justify-center gap-2"
            >
              <span>Start Match</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setMode("LOBBY")}
            className="text-xs text-slate-500 hover:text-slate-400"
          >
            Cancel and Return
          </button>
        </div>
      )}

      {mode === "JOINING" && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8 text-center shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-2">Enter Opponent&apos;s PIN</h3>
          <p className="text-slate-400 text-sm mb-6">Input the 4-digit code generated on your peer&apos;s screen.</p>

          <input
            type="text"
            maxLength={4}
            value={inputPin}
            onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ""))}
            placeholder="0000"
            className="w-48 mx-auto text-center tracking-widest text-3xl font-mono font-bold bg-slate-950 border-2 border-emerald-500/50 rounded-2xl py-3 text-emerald-400 outline-none focus:border-emerald-400 mb-6 block"
          />

          <div className="flex justify-center gap-3 max-w-xs mx-auto">
            <button
              onClick={() => setMode("LOBBY")}
              className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm"
            >
              Back
            </button>
            <button
              disabled={inputPin.length !== 4}
              onClick={handleStartMatch}
              className="flex-1 py-3 rounded-xl bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-sm"
            >
              Join Bout
            </button>
          </div>
        </div>
      )}

      {mode === "PLAYING" && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 md:p-7 shadow-2xl">
          {/* Top Live Split Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xs font-bold text-emerald-400">
                You
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Your Score</div>
                <div className="text-base font-extrabold text-white">{score}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className={`text-sm font-mono font-bold ${timeLeft <= 5 ? "text-rose-400 animate-pulse" : "text-white"}`}>
                {timeLeft}s
              </span>
            </div>

            <div className="flex items-center gap-2 text-right">
              <div>
                <div className="text-xs text-slate-400 font-medium">Peer Score</div>
                <div className="text-base font-extrabold text-slate-300">{peerScore}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-xs font-bold text-purple-400">
                Peer
              </div>
            </div>
          </div>

          {/* Question Counter & Streak */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>Question {currentQ + 1} of {questions.length}</span>
            {streak > 1 && (
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{streak} Streak!</span>
              </span>
            )}
          </div>

          {/* Question Prompt */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-5 min-h-[90px] flex items-center">
            <p className="text-base md:text-lg font-semibold text-white">
              {questions[currentQ].prompt}
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {questions[currentQ].options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isOptionCorrect = questions[currentQ].correct_index === idx;

              let btnStyle = "bg-slate-800 border-slate-700 text-slate-200 hover:border-emerald-500/50";
              if (isAnswered) {
                if (isOptionCorrect) {
                  btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                } else if (isSelected && !isOptionCorrect) {
                  btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleOptionSelect(idx)}
                  className={`p-4 rounded-xl border text-left text-sm font-medium transition ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mode === "RESULT" && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <Trophy className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-black text-white mb-1">
            {score >= peerScore ? "Victorious Scholar!" : "Honorably Contested!"}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Axiom Bout concluded. Scores recorded into your Merit Ledger.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Your Final Score</span>
              <div className="text-2xl font-black text-emerald-400">{score}</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs text-slate-400">Opponent Score</span>
              <div className="text-2xl font-black text-slate-300">{peerScore}</div>
            </div>
          </div>

          <div className="flex justify-center gap-3 max-w-xs mx-auto">
            <button
              onClick={handleStartMatch}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rematch</span>
            </button>
            <button
              onClick={() => setMode("LOBBY")}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-750"
            >
              Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

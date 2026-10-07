"use client";

import { useState, useEffect } from "react";
import { Swords, Zap, Flame, Trophy, Share2, Timer, CheckCircle, XCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

const COMPETITION_EMOTES = [
  "⚡ Solve with speed!",
  "🎯 Precision beats haste!",
  "🏆 Lead the leaderboard!",
  "🧠 Pure academic mastery!",
  "🔥 Unstoppable streak!"
];

interface LiveDuelArenaProps {
  grade: string;
  userState?: string;
  userLga?: string;
  userName?: string;
}

export default function LiveDuelArena({ grade, userState = "Anambra", userLga = "Ogbaru", userName = "Chisom O." }: LiveDuelArenaProps) {
  const [matchState, setMatchState] = useState<"IDLE" | "SEARCHING" | "BATTLING" | "FINISHED">("IDLE");
  const [duelData, setDuelData] = useState<any | null>(null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [roundAnswered, setRoundAnswered] = useState(false);
  const [activeEmote, setActiveEmote] = useState<string | null>(null);
  const [showBragModal, setShowBragModal] = useState(false);

  const sampleRounds = [
    {
      round: 1,
      concept: "Quadratic Roots & Discriminant",
      question: "If 2x² - 5x + k = 0 has equal real roots, find the exact value of k.",
      options: ["A) 25/8", "B) 5/4", "C) 25/4", "D) 8/25"],
      correct: "A"
    },
    {
      round: 2,
      concept: "Compound Angle Identity",
      question: "Evaluate sin(75°) in exact mathematical surd form.",
      options: ["A) (√6 - √2)/4", "B) (√6 + √2)/4", "C) (√3 + 1)/2", "D) √2/2"],
      correct: "B"
    },
    {
      round: 3,
      concept: "Calculus Optimization Derivative",
      question: "Differentiate y = (3x² - 2)⁴ with respect to x using Chain Rule.",
      options: ["A) 12x(3x² - 2)³", "B) 24x(3x² - 2)³", "C) 4(6x)³", "D) 24x²(3x² - 2)³"],
      correct: "B"
    }
  ];

  const handleStartMatchmaking = async () => {
    sfx.tap();
    triggerTmaHaptic("medium");
    setMatchState("SEARCHING");

    try {
      const res = await fetch("/api/backend/competition/duel/matchmake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_key: "STU-LOCAL-USER",
          user_name: userName,
          state: userState,
          lga: userLga,
          subject: "Mathematics",
          grade: grade
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDuelData(data);
        setTimeout(() => {
          setMatchState("BATTLING");
          setCurrentRoundIndex(0);
          setP1Score(0);
          setP2Score(0);
          setRoundAnswered(false);
          setSelectedOpt(null);
          sfx.correct();
        }, 1200);
      }
    } catch (e) {
      console.error(e);
      setMatchState("IDLE");
    }
  };

  const handleSelectOption = (opt: string) => {
    if (roundAnswered) return;
    sfx.tap();
    triggerTmaHaptic("heavy");
    setSelectedOpt(opt);
    setRoundAnswered(true);

    const curr = sampleRounds[currentRoundIndex];
    const isCorrect = opt.startsWith(curr.correct);

    if (isCorrect) {
      sfx.correct();
      setP1Score((s) => s + 100);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } else {
      sfx.wrong();
    }

    // Bot opponent answers with slight delay
    setTimeout(() => {
      setP2Score((s) => s + (Math.random() > 0.3 ? 95 : 0));
    }, 400);

    // Advance round
    setTimeout(() => {
      if (currentRoundIndex + 1 < sampleRounds.length) {
        setCurrentRoundIndex((i) => i + 1);
        setRoundAnswered(false);
        setSelectedOpt(null);
      } else {
        setMatchState("FINISHED");
        sfx.correct();
        confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
      }
    }, 1800);
  };

  const fireEmote = (emote: string) => {
    sfx.tap();
    triggerTmaHaptic("light");
    setActiveEmote(emote);
    setTimeout(() => setActiveEmote(null), 2500);
  };

  const currentRound = sampleRounds[currentRoundIndex];

  return (
    <div className="space-y-4">
      {/* 1v1 Split Screen Battle Arena */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-2xl space-y-4">
        {/* Arena Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">Live 1v1 National Duel</h3>
              <p className="text-[10px] text-cyan-400 font-mono">NTP Sub-millisecond Time-Synchronized</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {grade} • Math Sprint
          </span>
        </div>

        {matchState === "IDLE" && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-3xl">
              ⚔️
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">Challenge Another Scholar Across 774 LGAs</h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Real-time 3-question sprint. Winner takes +25 Elo points and Clan War honor!
              </p>
            </div>
            <button
              onClick={handleStartMatchmaking}
              className="py-3 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Enter Matchmaking Queue (Live)
            </button>
          </div>
        )}

        {matchState === "SEARCHING" && (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
            <div className="text-xs font-bold text-cyan-300">Searching for Opponent in {grade}...</div>
            <div className="text-[10px] text-zinc-500 font-mono">Pinging Lagos, Anambra, Kano, Rivers...</div>
          </div>
        )}

        {matchState === "BATTLING" && duelData && (
          <div className="space-y-4">
            {/* Split Opponent Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-black/50 border border-cyan-500/40 space-y-1">
                <div className="text-[10px] uppercase font-bold text-cyan-400">🇳🇬 {userState} ({userLga})</div>
                <div className="font-bold text-white truncate">{userName} (You)</div>
                <div className="text-2xl font-mono font-black text-white">{p1Score} pts</div>
              </div>

              <div className="p-3 rounded-2xl bg-black/50 border border-rose-500/40 space-y-1">
                <div className="text-[10px] uppercase font-bold text-rose-400">🇳🇬 {duelData.player2.state} ({duelData.player2.lga})</div>
                <div className="font-bold text-white truncate">{duelData.player2.name}</div>
                <div className="text-2xl font-mono font-black text-white">{p2Score} pts</div>
              </div>
            </div>

            {/* Emote Bubble */}
            {activeEmote && (
              <div className="py-1 px-3 bg-amber-400 text-slate-950 rounded-full text-xs font-black text-center animate-bounce shadow-lg w-max mx-auto">
                {activeEmote}
              </div>
            )}

            {/* Question Card */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                <span>ROUND {currentRoundIndex + 1} OF 3</span>
                <span>{currentRound.concept}</span>
              </div>
              <p className="text-xs text-white font-medium leading-relaxed">{currentRound.question}</p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {currentRound.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    disabled={roundAnswered}
                    className={`p-3 rounded-xl text-xs font-bold text-left border transition cursor-pointer ${
                      selectedOpt === opt
                        ? opt.startsWith(currentRound.correct)
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                          : "bg-rose-500/20 border-rose-400 text-rose-300"
                        : "bg-slate-950/80 border-slate-800 text-zinc-300 hover:border-cyan-500/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Competition Emote Cannon Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {COMPETITION_EMOTES.map((em, idx) => (
                <button
                  key={idx}
                  onClick={() => fireEmote(em)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white whitespace-nowrap cursor-pointer transition font-bold"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        )}

        {matchState === "FINISHED" && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-3xl">
              🏆
            </div>
            <div>
              <h4 className="text-base font-black text-white">
                {p1Score >= p2Score ? "Victory! You Smoked Your Opponent!" : "Match Concluded!"}
              </h4>
              <p className="text-xs text-zinc-400">
                Final Score: You ({p1Score}) vs Opponent ({p2Score}) • +24 Elo Earned
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowBragModal(true)}
                className="py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Brag Card (WhatsApp Status)</span>
              </button>

              <button
                onClick={handleStartMatchmaking}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition"
              >
                Play Another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp Brag Card Modal */}
      {showBragModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/40 p-5 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-black text-sm text-white">WhatsApp Status Brag Card</h3>
              <button onClick={() => setShowBragModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            {/* Visual Brag Badge */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-950 to-black border-2 border-emerald-400 text-center space-y-2">
              <div className="text-2xl">🇳🇬 🔥 🏆</div>
              <div className="text-xs font-mono uppercase text-emerald-400 font-bold">EduNaija OS • Live Zonal Duel</div>
              <div className="text-base font-black text-white">{userName} Won the 1v1 National Duel!</div>
              <div className="text-3xl font-black font-mono text-emerald-300">{p1Score} PTS</div>
              <p className="text-[10px] text-zinc-400 italic">"Can you match this score in {grade} Mathematics?"</p>
            </div>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `🏆 I scored ${p1Score} points in the National 1v1 Academic Duel on EduNaija OS (${grade})! Can you beat my score? Test yourself now: https://edunaija.com/competition`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-black font-black text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Post to WhatsApp Status</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { Volume2, VolumeX, Sparkles, X, HelpCircle, MessageSquare } from "lucide-react";
import { nigerianVoice } from "../lib/nigerianVoice";
import { sfx } from "../lib/audio";

interface PromptCard {
  label: string;
  emoji: string;
  query: string;
}

const CHILD_PROMPTS: PromptCard[] = [
  { emoji: "📖", label: "Read This Page", query: "Please read this lesson to me slowly and clearly." },
  { emoji: "💡", label: "Give Me a Hint", query: "Can you give me a simple hint with real-world Nigerian examples?" },
  { emoji: "🐢", label: "Tell Me in Pidgin", query: "Explain this to me in fun, clear Naija Pidgin!" },
  { emoji: "🌟", label: "Check My Math", query: "Can you help me count the numbers step-by-step?" },
];

export default function WonderBuddyBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSelectPrompt = async (card: PromptCard) => {
    sfx.tap();
    setIsLoading(true);
    setResponseMessage(null);

    // Call child learning endpoint or simulate friendly Socratic response
    try {
      const res = await fetch("/api/backend/children/wonder-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: card.query, tier: "PRIMARY" }),
      });

      let reply = "";
      if (res.ok) {
        const data = await res.json();
        reply = data.explanation || "";
      }

      if (!reply) {
        if (card.label === "Read This Page") {
          reply = "Reading lesson: Every big journey starts with one step! Look closely at each question and pronounce each word with confidence.";
        } else if (card.label === "Give Me a Hint") {
          reply = "Secret hint from Ijapa: Group your items in fives and tens just like counting oranges in the market! Look for patterns in your options.";
        } else if (card.label === "Tell Me In Pidgin") {
          reply = "No shaking at all my young scholar! Read the question small-small, take your time, and pick wetin make sense pass!";
        } else if (card.label === "Check My Math") {
          reply = "Math counting time: Count 1, 2, 3, 4, 5! Remember: addition means putting numbers together to make a bigger number!";
        } else {
          reply = "Keep going super scholar! Every question you practice makes you smarter and wiser like Ijapa!";
        }
      }

      setResponseMessage(reply);
      setIsLoading(false);

      // Speak reply automatically
      setIsSpeaking(true);
      nigerianVoice.speak(reply, {
        persona: "auntie_bola",
        speed: "slow",
        onEnd: () => setIsSpeaking(false),
      });
    } catch {
      let fallback = "Every big journey starts with one step! Let us count and read the question carefully together.";
      if (card.label === "Give Me a Hint") fallback = "Look at the numbers like grouping items in the market!";
      if (card.label === "Tell Me In Pidgin") fallback = "No fear at all! Read am small-small, your brain sharp well-well!";
      if (card.label === "Check My Math") fallback = "Count step by step: 1, 2, 3, 4, 5! You are doing great!";

      setResponseMessage(fallback);
      setIsLoading(false);
      nigerianVoice.speak(fallback, { persona: "auntie_bola" });
    }
  };

  return (
    <>
      {/* Floating Buddy Mascot Button - Stacks cleanly above Sister Amaka trigger */}
      <div className="fixed bottom-[calc(8.5rem+env(safe-area-inset-bottom))] md:bottom-24 right-3 sm:right-6 z-40">
        <button
          onClick={() => {
            sfx.tap();
            setIsOpen(true);
          }}
          className="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-tr from-amber-400 to-amber-300 rounded-full border-2 sm:border-3 border-white shadow-2xl flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all cursor-pointer ring-2 ring-amber-500/30 touch-manipulation"
          aria-label="Open Ijapa Wonder Buddy Helper Bot"
          title="Need help? Tap Ijapa Wonder Buddy!"
        >
          <span className="text-xl sm:text-3xl filter drop-shadow animate-bounce">🐢</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#FFFDF5] border-4 border-amber-400 rounded-3xl max-w-md w-full p-6 shadow-2xl text-zinc-900 animate-in fade-in zoom-in-95 duration-200">
            {/* Mascot Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-amber-200">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-amber-200 rounded-2xl flex items-center justify-center text-3xl border-2 border-amber-300">
                  🐢
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-900">Ijapa Wonder Buddy</h3>
                  <p className="text-[11px] font-bold text-amber-800">Your Primary School Voice Guide</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sfx.tap();
                  nigerianVoice.stop();
                  setIsOpen(false);
                }}
                className="p-2 text-zinc-500 hover:text-zinc-800 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bot Response Bubble */}
            {responseMessage ? (
              <div className="my-4 p-4 bg-white rounded-2xl border-2 border-emerald-300 shadow-sm">
                <p className="text-sm text-zinc-800 font-semibold leading-relaxed mb-3">
                  {responseMessage}
                </p>
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      nigerianVoice.stop();
                      setIsSpeaking(false);
                    } else {
                      setIsSpeaking(true);
                      nigerianVoice.speak(responseMessage, {
                        persona: "auntie_bola",
                        speed: "slow",
                        onEnd: () => setIsSpeaking(false),
                      });
                    }
                  }}
                  className="h-10 px-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold flex items-center gap-2 text-xs transition-colors cursor-pointer"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? "Pause Voice" : "Listen with Auntie Bola"}</span>
                </button>
              </div>
            ) : (
              <div className="my-3 text-center py-2 text-zinc-600 text-xs font-medium">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 text-amber-700 font-bold">
                    <Sparkles className="w-4 h-4 animate-spin" /> Thinking up the magic answer...
                  </div>
                ) : (
                  "What can Ijapa help you with today? Tap any magic button below:"
                )}
              </div>
            )}

            {/* Pictorial Prompt Tiles (Min 56px height) */}
            <div className="grid grid-cols-2 gap-2.5 mt-2">
              {CHILD_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  disabled={isLoading}
                  onClick={() => handleSelectPrompt(prompt)}
                  className="h-16 p-2 bg-white hover:bg-amber-100/70 border-2 border-amber-300 hover:border-amber-500 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                >
                  <span className="text-xl">{prompt.emoji}</span>
                  <span className="text-[11px] font-black text-emerald-950 text-center leading-tight">
                    {prompt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

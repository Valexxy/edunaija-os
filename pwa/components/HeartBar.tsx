"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Plus, Zap, Share2 } from "lucide-react";
import { sfx } from "../lib/audio";

export default function HeartBar({ current = 10, max = 20 }: { current?: number; max?: number }) {
  const [showModal, setShowModal] = useState(false);
  const hearts = Array.from({ length: max }, (_, i) => i < current);

  const openRefill = () => {
    sfx.tap();
    setShowModal(true);
  };

  return (
    <>
      <div className="glass-card rounded-2xl p-4 transition-all">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-sm font-semibold tracking-wide text-zinc-300">Hearts</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-zinc-400">
              <span className="text-white">{current}</span>/{max}
            </span>
            <button
              onClick={openRefill}
              className="w-6 h-6 rounded-full bg-[#00E676] text-black flex items-center justify-center font-bold hover:scale-110 active:scale-95 transition-transform shadow-[0_0_10px_#00E676]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {hearts.map((isFull, idx) => (
            <motion.span
              key={idx}
              initial={false}
              animate={isFull ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`text-sm select-none transition-all ${
                isFull
                  ? "filter drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]"
                  : "opacity-20 grayscale brightness-50"
              }`}
            >
              ❤️
            </motion.span>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card bg-[#0d0d12]/95 border border-white/10 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              ❤️
            </div>
            <h3 className="font-syne font-bold text-2xl mb-1.5 text-white">Refill Your Hearts</h3>
            <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
              Don&apos;t let your study streak cool down! Keep practicing for your 300+ JAMB score.
            </p>

            <button
              onClick={() => {
                sfx.streakCelebration();
                setShowModal(false);
              }}
              className="w-full bg-gradient-to-r from-[#00E676] to-[#008751] text-black font-extrabold py-3.5 rounded-xl mb-3 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,230,118,0.4)] hover:brightness-110 active:scale-98 transition-all"
            >
              <Share2 className="w-4 h-4 stroke-[2.5]" />
              Share to WhatsApp Group (+10)
            </button>

            <button
              onClick={() => {
                sfx.tap();
                setShowModal(false);
              }}
              className="w-full bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 rounded-xl mb-4 border border-white/10 flex items-center justify-center gap-2 transition-colors"
            >
              <Zap className="w-4 h-4 text-naija-gold fill-current" />
              Cram Pass — ₦200 for 24h Unlimited
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="text-zinc-500 font-medium text-xs hover:text-zinc-300 transition-colors"
            >
              Maybe Later
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}

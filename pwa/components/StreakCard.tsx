"use client";

import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StreakCard({ days }: { days: number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
          <Flame className="w-6 h-6 text-orange-500 fill-current" />
        </div>
        <div>
          <div className="font-syne font-bold text-xl">{days} Day Streak</div>
          <div className="text-xs text-zinc-400">Omo, you're on fire! 🔥 Keep pushing!</div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`aspect-square rounded-sm ${i < days % 14 || days >= 14 ? 'bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.5)]' : 'bg-zinc-800'}`} 
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Sparkles, X, RotateCcw, ArrowRight } from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

export interface CheckpointData {
  module_type: string;
  module_title: string;
  route: string;
  progress_pct: number;
  checkpoint_state?: any;
  updated_at?: string;
}

export function saveLearnerCheckpoint(
  userKey: string,
  moduleType: string,
  moduleTitle: string,
  route: string,
  progressPct: number,
  state: any = {}
) {
  if (typeof window === "undefined") return;
  // 1. Save locally for instant offline availability
  const payload = {
    user_key: userKey,
    module_type: moduleType,
    module_title: moduleTitle,
    route: route,
    progress_pct: progressPct,
    checkpoint_state: state,
    updated_at: new Date().toISOString()
  };
  localStorage.setItem("edunaija_last_checkpoint", JSON.stringify(payload));

  // 2. Persist to server action stream
  const chkUrl = typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? '/api/backend/tracker/checkpoint'
    : '/api/backend/tracker/checkpoint';
  fetch(chkUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch(() => {});
}

export default function ResumeBeacon() {
  const router = useRouter();
  const pathname = usePathname();
  const [checkpoint, setCheckpoint] = useState<CheckpointData | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkSession = () => {
      const userStr = localStorage.getItem("edunaija_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsLoggedIn(true);
          setUserName(user.full_name || user.fullName || "Scholar");
          const userKey = user.registration_key || user.phone || "DEMO-UTME-2025";
          
          // Check local checkpoint first
          const local = localStorage.getItem("edunaija_last_checkpoint");
          if (local) {
            const parsed = JSON.parse(local);
            if (parsed && parsed.route && parsed.route !== pathname) {
              setCheckpoint(parsed);
            }
          }

          // Fetch from server via secure proxy
          const url = window.location.protocol === "https:"
            ? `/api/backend/tracker/checkpoint/${userKey}`
            : `/api/backend/tracker/checkpoint/${userKey}`;
          fetch(url)
            .then(res => res.json())
            .then(data => {
              if (data.checkpoint && data.checkpoint.route) {
                if (data.checkpoint.route !== pathname) {
                  setCheckpoint(data.checkpoint);
                }
              }
            })
            .catch(() => {});
        } catch {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
        setCheckpoint(null);
      }
    };

    checkSession();
    window.addEventListener("edunaija_user_updated", checkSession);
    return () => window.removeEventListener("edunaija_user_updated", checkSession);
  }, [pathname]);

  if (!checkpoint || isDismissed) return null;

  // Don't show if user is currently on the checkpoint route
  if (pathname === checkpoint.route.split("?")[0]) return null;

  const handleResume = () => {
    sfx.tap();
    triggerTmaHaptic("heavy");
    router.push(checkpoint.route);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg bg-[#0E131F]/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-3 sm:p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(0,230,118,0.25)] flex items-center justify-between gap-3 text-white"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <RotateCcw className="w-4 h-4 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-[#00E676] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Resume Where You Stopped ({Math.round(checkpoint.progress_pct)}%)</span>
            </div>
            <div className="text-xs font-bold text-white truncate max-w-[240px] sm:max-w-xs">
              {checkpoint.module_title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleResume}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-xs shadow-md shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Resume</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => { setIsDismissed(true); sfx.tap(); }}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Maximize2, AlertTriangle, ArrowRight, HelpCircle } from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";
import ExamInstructionsModal, { ExamInstructionType } from "./ExamInstructionsModal";

interface CBTLockdownProps {
  examTitle: string;
  onInfractionLimitReached?: () => void;
  examType?: ExamInstructionType;
  durationMinutes?: number;
  questionCount?: number;
  tier?: string;
}

export default function CBTLockdown({ 
  examTitle, 
  onInfractionLimitReached,
  examType = "cbt_quiz",
  durationMinutes = 40,
  questionCount = 40,
  tier = "JAMB CBT"
}: CBTLockdownProps) {
  const router = useRouter();
  const [infractions, setInfractions] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // 1. Tab-Switch / Page Visibility Anomaly Tracking
    const handleVisibilityChange = () => {
      // Check Developer Mode bypass
      if (typeof window !== "undefined" && localStorage.getItem("edunaija_dev_mode") === "true") {
        return;
      }

      if (document.visibilityState === "hidden") {
        setInfractions((prev) => {
          const next = Math.min(prev + 1, 3);
          sfx.wrong();
          triggerTmaHaptic("heavy");
          setShowAlert(true);
          if (next >= 3 && onInfractionLimitReached) {
            onInfractionLimitReached();
          }
          return next;
        });
      }
    };

    // 2. Prevent Copy/Paste/Cut/ContextMenu
    const blockAction = (e: Event) => e.preventDefault();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", blockAction);
    document.addEventListener("paste", blockAction);
    document.addEventListener("cut", blockAction);
    document.addEventListener("contextmenu", blockAction);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", blockAction);
      document.removeEventListener("paste", blockAction);
      document.removeEventListener("cut", blockAction);
      document.removeEventListener("contextmenu", blockAction);
    };
  }, [onInfractionLimitReached]);

  const toggleFullscreen = () => {
    sfx.tap();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const isDisqualified = infractions >= 3;

  return (
    <>
      {/* Top Proctored Security Strip */}
      <div className="bg-black/60 backdrop-blur-md border-b border-red-500/20 px-3 py-1.5 flex justify-between items-center text-[10px] text-zinc-400">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>PROCTORED CBT LOCKDOWN ACTIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              sfx.tap();
              setShowInstructions(true);
            }} 
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 cursor-pointer transition-colors"
          >
            <HelpCircle className="w-3 h-3" /> Instructions
          </button>
          <span className={infractions > 0 ? "text-red-400 font-bold" : "text-zinc-500"}>
            Infractions: {Math.min(infractions, 3)}/3
          </span>
          <button onClick={toggleFullscreen} className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer">
            <Maximize2 className="w-3 h-3" /> {isFullscreen ? "Exit Full" : "Fullscreen"}
          </button>
        </div>
      </div>

      {/* Official Instructions Modal */}
      <ExamInstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        examType={examType}
        title={examTitle}
        durationMinutes={durationMinutes}
        questionCount={questionCount}
        tier={tier}
      />

      {/* Infraction Warning Modal */}
      {showAlert && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="glass-card bg-[#120a0a] border border-red-500/40 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-syne font-bold text-lg text-white mb-1">
              {isDisqualified ? "🚨 Mock Disqualified!" : "Tab Switch Flagged!"}
            </h3>
            <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
              {isDisqualified
                ? "You have accumulated 3 tab switch infractions. In compliance with JAMB CBT anti-cheat guidelines, this examination score has been disqualified."
                : "Navigating away from the CBT examination screen is logged as a test infraction. 3 infractions will automatically disqualify this mock score."}
            </p>
            <div className="text-sm font-mono font-bold text-red-400 mb-4">
              Current Warning: {Math.min(infractions, 3)} of 3 {isDisqualified ? "(Disqualified)" : ""}
            </div>
            <button
              onClick={() => {
                sfx.tap();
                if (isDisqualified) {
                  if (onInfractionLimitReached) {
                    onInfractionLimitReached();
                  }
                  router.push("/autopsy");
                } else {
                  setShowAlert(false);
                }
              }}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>{isDisqualified ? "Exit & View Forensic Autopsy Report" : "I Understand, Resume Exam"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

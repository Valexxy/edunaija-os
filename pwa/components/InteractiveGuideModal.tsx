"use client";

import React, { useState } from "react";
import { 
  Sparkles, BookOpen, Check, ChevronRight, X, Volume2, 
  HelpCircle, Shield, Award, Users, Video, Zap, GraduationCap
} from "lucide-react";
import { nigerianVoice } from "../lib/nigerianVoice";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

export type GuidePersona = "PRIMARY" | "JAMB" | "PARENT" | "TEACHER";

interface InteractiveGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPersona?: GuidePersona;
}

export const GUIDE_PRESETS: Record<GuidePersona, {
  title: string;
  badge: string;
  badgeColor: string;
  icon: string;
  voiceIntro: string;
  steps: Array<{
    title: string;
    pictogram: string;
    desc: string;
    tip: string;
    narration: string;
  }>;
}> = {
  PRIMARY: {
    title: "Primary Pupil Wonder Quest (Basic 1-6)",
    badge: "K-5 YOUNG SCHOLAR",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: "🎒",
    voiceIntro: "Welcome to Wonder Lab! I am Auntie Bola. Let me show you how to play, learn, and win Magic Stars!",
    steps: [
      {
        title: "1. The Wonder Labs",
        pictogram: "🔬",
        desc: "Tap the big science lab cards to explore Ohm's circuits, see biology cells zoom in, or heat up water into steam!",
        tip: "Touch anything on screen — everything responds with fun sounds and pictures!",
        narration: "Tap the big science lab cards to explore circuits, cells, and experiments!"
      },
      {
        title: "2. Tap to Hear Syllables",
        pictogram: "📖",
        desc: "Whenever you see big words, tap each syllable to hear Auntie Bola pronounce it slowly with Nigerian accent.",
        tip: "Look for words split with little dots like pho-to-syn-the-sis!",
        narration: "Whenever you see big words, tap each syllable to hear me pronounce it slowly!"
      },
      {
        title: "3. Win Magic Stars (No Lost Hearts)",
        pictogram: "⭐",
        desc: "In Primary School mode, you never lose hearts! Every time you try, you earn Golden Cowries and Magic Stars.",
        tip: "If you get stuck, Ijapa the wise tortoise is always floating in the corner to help you.",
        narration: "You never lose hearts here. Every time you practice, you collect magic stars and badges!"
      },
      {
        title: "4. Call Ijapa Wonder Buddy",
        pictogram: "🐢",
        desc: "Tap the floating turtle icon anytime to ask for hints, get stories in Pidgin, or have the lesson read out loud.",
        tip: "No typing needed! Just tap any of Ijapa's picture cards.",
        narration: "Tap Ijapa the turtle anytime for hints or to hear stories in fun Naija Pidgin!"
      }
    ]
  },
  JAMB: {
    title: "SS3 / JAMB Candidate CBT Engine",
    badge: "UTME & WAEC CANDIDATE",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    icon: "⚡",
    voiceIntro: "Welcome scholar. Let us review the JAMB CBT 400-point speed drills and Weakness Autopsy engine.",
    steps: [
      {
        title: "1. CBT Lockdown & Anti-Cheat",
        pictogram: "🛡️",
        desc: "Real JAMB exam simulation locks the browser into fullscreen. Switching tabs 3 times triggers automatic score disqualification.",
        tip: "Steganographic watermarks protect exam papers from being leaked to Telegram groups.",
        narration: "Real JAMB CBT simulation tracks tab switching. Three infractions disqualify the attempt."
      },
      {
        title: "2. Keyboard Shortcuts (A, B, C, D, N, P)",
        pictogram: "⌨️",
        desc: "JAMB centers use physical keyboard navigation. Press A, B, C, or D to select options, N for Next, P for Previous, and S to Submit.",
        tip: "Practicing with 8-key mode increases answering speed by 35% on test day.",
        narration: "Use keys A, B, C, D to pick answers and N for next question to boost speed."
      },
      {
        title: "3. AI Weakness Autopsy",
        pictogram: "🧠",
        desc: "After every mock exam, the system diagnoses your top 3 syllabus blind spots (e.g. Calculus, Organic Chemistry) and creates remedial flash drills.",
        tip: "Check your Post-Mortem card immediately after submitting any practice test.",
        narration: "Our AI diagnoses your exact syllabus bottlenecks and builds custom drills to fix them."
      },
      {
        title: "4. Sunday Showdown & LGA Leaderboard",
        pictogram: "🏆",
        desc: "Compete every Sunday at 8:00 PM against candidates across all 774 Nigerian LGAs for cash scholarships and school pride.",
        tip: "Top 100 scholars receive instant zero-fee bank transfers to their scholar wallet.",
        narration: "Join the Sunday Showdown every week to test your rank across all 774 Local Government Areas."
      }
    ]
  },
  PARENT: {
    title: "Parent & Guardian Cockpit Guide",
    badge: "GUARDIAN AUTHORITY",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    icon: "🛡️",
    voiceIntro: "Welcome guardian. Here is how to link your ward, unlock syllabus autopilot, and fund escrow lessons safely.",
    steps: [
      {
        title: "1. Multi-Ward Student Switcher",
        pictogram: "👨‍👩‍👧‍👦",
        desc: "Monitor multiple children from one parent dashboard — switch between Primary 5, SSS 3, and 100L university students instantly.",
        tip: "Each child has an isolated syllabus progress radar and verifiable scholar ID.",
        narration: "Easily switch between all your children from primary to university in one place."
      },
      {
        title: "2. Syllabus Autopilot (Upload Scheme)",
        pictogram: "📋",
        desc: "Snap a photo of your ward's school syllabus or homework sheet. The AI generates weekly diagnostic radar tests to guarantee they stay ahead.",
        tip: "Autopilot sends you a WhatsApp or SMS alert if your child slips below 65% in any subject.",
        narration: "Upload your child's school scheme of work and receive automated weekly radar summaries."
      },
      {
        title: "3. Zero-Fee Transfer & Voucher Wallet",
        pictogram: "💳",
        desc: "Fund student wallets using Paystack without bank fees. Generate 16-character offline scratch vouchers for data-free offline study.",
        tip: "All educational transfers are 0% VAT exempt under the Federal Republic of Nigeria VAT Act.",
        narration: "Send funds and generate offline study vouchers with zero bank transaction fees."
      },
      {
        title: "4. Guardian PIN & Escrow Custody",
        pictogram: "🔒",
        desc: "Private tutoring fees are held safely in escrow. TRCN tutors only receive payout after you authorize release with your 4-digit Parent PIN.",
        tip: "You can also join live classes in stealth ghost observer mode without distracting your child.",
        narration: "Tutoring fees remain locked in escrow until you approve release with your guardian PIN."
      }
    ]
  },
  TEACHER: {
    title: "TRCN Verified Mentor Portal Guide",
    badge: "EDUCATOR PORTAL",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    icon: "👨‍🏫",
    voiceIntro: "Welcome educator. Here is how to complete TRCN verification, host encrypted live classes, and claim tutoring escrow.",
    steps: [
      {
        title: "1. TRCN & NIN Accreditation",
        pictogram: "📜",
        desc: "Verify your Teachers Registration Council of Nigeria license and National Identity Number to receive the verified gold badge.",
        tip: "Accredited teachers receive 4x more parent lesson requests and premium hourly rates.",
        narration: "Verify your TRCN registration number to unlock verified badge status and tutoring requests."
      },
      {
        title: "2. WebRTC Encrypted Live Classrooms",
        pictogram: "🎥",
        desc: "Host one-on-one or group video classrooms with interactive whiteboards, code editors, and live question push.",
        tip: "Sessions are end-to-end encrypted with short-lived tokens for child privacy compliance.",
        narration: "Host live interactive classes with whiteboards, code editors, and real-time screen sharing."
      },
      {
        title: "3. Automated Rubric Theory Grader",
        pictogram: "✍️",
        desc: "Grade WAEC and NECO written essay responses using official national marking schemes with AI co-pilot assistance.",
        tip: "Step-by-step marking rubrics automatically highlight arithmetic and grammar deductions.",
        narration: "Grade theory questions quickly using official WAEC and NECO step-by-step rubrics."
      },
      {
        title: "4. Guaranteed Escrow Milestone Release",
        pictogram: "💰",
        desc: "Complete scheduled lesson hours and request milestone sign-off. Funds are disbursed directly to your Nigerian bank account within 24 hours.",
        tip: "Parents authorize disbursement using their secure Level 3 Guardian PIN.",
        narration: "Once lesson milestones are completed, parents release payment directly to your bank."
      }
    ]
  }
};

export default function InteractiveGuideModal({
  isOpen,
  onClose,
  defaultPersona = "PRIMARY"
}: InteractiveGuideModalProps) {
  const [activePersona, setActivePersona] = useState<GuidePersona>(defaultPersona);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const preset = GUIDE_PRESETS[activePersona];
  const step = preset.steps[activeStepIndex];

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      nigerianVoice.stop();
      setIsSpeaking(false);
      return;
    }
    sfx.tap();
    setIsSpeaking(true);
    const voice = activePersona === "PRIMARY" ? "auntie_bola" : "uncle_emeka";
    nigerianVoice.speak(text, {
      persona: voice,
      speed: activePersona === "PRIMARY" ? "slow" : "normal",
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const handleNextStep = () => {
    sfx.tap();
    triggerTmaHaptic("light");
    if (activeStepIndex < preset.steps.length - 1) {
      setActiveStepIndex(prev => prev + 1);
    } else {
      sfx.streakCelebration();
      onClose();
    }
  };

  const handlePrevStep = () => {
    sfx.tap();
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
    }
  };

  const handleSelectPersona = (p: GuidePersona) => {
    sfx.tap();
    nigerianVoice.stop();
    setIsSpeaking(false);
    setActivePersona(p);
    setActiveStepIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-zinc-950 border border-white/15 rounded-3xl max-w-2xl w-full p-5 sm:p-7 text-white relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sfx.tap();
            nigerianVoice.stop();
            onClose();
          }}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full transition-colors cursor-pointer"
          aria-label="Close Guide"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-[#00E676] flex items-center justify-center text-xl shadow-md">
            {preset.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${preset.badgeColor}`}>
                {preset.badge}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">2026 Ready-Made Guide</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-black text-white tracking-tight mt-0.5">
              {preset.title}
            </h2>
          </div>
        </div>

        {/* Persona Segment Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-zinc-900/90 rounded-2xl border border-white/10 mb-5">
          <button
            onClick={() => handleSelectPersona("PRIMARY")}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activePersona === "PRIMARY"
                ? "bg-amber-500 text-black shadow-md font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>🎒 Primary (K-5)</span>
          </button>
          <button
            onClick={() => handleSelectPersona("JAMB")}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activePersona === "JAMB"
                ? "bg-emerald-500 text-black shadow-md font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>⚡ SS3 / JAMB</span>
          </button>
          <button
            onClick={() => handleSelectPersona("PARENT")}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activePersona === "PARENT"
                ? "bg-purple-500 text-white shadow-md font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>🛡️ Parent</span>
          </button>
          <button
            onClick={() => handleSelectPersona("TEACHER")}
            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activePersona === "TEACHER"
                ? "bg-blue-500 text-white shadow-md font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>👨‍🏫 Educator</span>
          </button>
        </div>

        {/* Step Carousel Display */}
        <div className="bg-gradient-to-b from-white/5 to-black/40 border border-white/10 rounded-2xl p-5 mb-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Step {activeStepIndex + 1} of {preset.steps.length}
            </span>
            <button
              onClick={() => handleSpeak(step.narration)}
              className="text-xs px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSpeaking ? "Pause Narration" : "Read Aloud"}</span>
            </button>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              {step.pictogram}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">{step.title}</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{step.desc}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="leading-snug">{step.tip}</span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {preset.steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sfx.tap();
                  setActiveStepIndex(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeStepIndex === idx ? "w-8 bg-emerald-400" : "w-2 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrevStep}
            disabled={activeStepIndex === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStepIndex === 0
                ? "opacity-30 cursor-not-allowed bg-zinc-900 text-zinc-500"
                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5"
            }`}
          >
            Previous
          </button>

          <button
            onClick={handleNextStep}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{activeStepIndex === preset.steps.length - 1 ? "Finish Guide 🏆" : "Next Step"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

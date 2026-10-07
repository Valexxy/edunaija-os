"use client";

import React from "react";
import { 
  ShieldCheck, AlertTriangle, BookOpen, Clock, 
  Award, X, ChevronRight 
} from "lucide-react";
import { sfx } from "../lib/audio";

export type ExamInstructionType = 
  | "cbt_quiz" 
  | "national_competition" 
  | "live_duel" 
  | "theory_marking" 
  | "oral_phonetics";

interface ExamInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examType: ExamInstructionType;
  title?: string;
  durationMinutes?: number;
  questionCount?: number;
  tier?: string;
  onConfirmStart?: () => void;
}

interface InstructionDetails {
  title: string;
  badge: string;
  badgeColor: string;
  standard: string;
  rules: Array<{ label: string; detail: string; icon: string }>;
  penalties: string[];
  scoringGuideline: string;
}

const INSTRUCTION_MAP: Record<ExamInstructionType, InstructionDetails> = {
  cbt_quiz: {
    title: "Official CBT Examination Regulations and Guidelines",
    badge: "JAMB / WAEC / NUC STANDARD CBT",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    standard: "In accordance with Federal Ministry of Education and JAMB CBT Center specifications.",
    rules: [
      {
        label: "Proctored Anti-Cheat Lockdown",
        detail: "Tab switches, window blurs, and background navigation are actively monitored. A maximum of 2 warnings are tolerated; a 3rd infraction will immediately terminate and disqualify your exam.",
        icon: "🚨"
      },
      {
        label: "Time Allocation and Auto-Submit",
        detail: "The countdown timer runs continuously on the top bar. When time expires, all marked answers are automatically synchronized and submitted.",
        icon: "⏱️"
      },
      {
        label: "Question Navigation and Flagging",
        detail: "You may navigate freely between questions using the Question Palette. Use the Flag button to bookmark difficult items for review before submission.",
        icon: "📑"
      },
      {
        label: "Calculations and Permitted Aids",
        detail: "An onscreen standard scientific calculator is provided on permitted Quantitative sections. External calculators or secondary devices are prohibited.",
        icon: "🧮"
      }
    ],
    penalties: [
      "3 Tab Switches or Inactive Windows = Disqualification",
      "No answer changes allowed after final submission confirmation",
      "Zero tolerance for screen capture or unverified background extensions"
    ],
    scoringGuideline: "Each correct question awards +1 to +5 XP depending on syllabus weight. No negative marks for incorrect guesses on standard diagnostic modes."
  },
  national_competition: {
    title: "National Inter-School Championship Regulations",
    badge: "STATE AND NATIONAL TOURNAMENT TIER",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    standard: "EduNaija High-Stakes Tournament and Inter-School League Protocol.",
    rules: [
      {
        label: "High-Precision NTP Server Sync",
        detail: "Questions are released simultaneously to all participants nationwide with microsecond time synchronisation. Answers must be locked in within the round window.",
        icon: "⚡"
      },
      {
        label: "Speed and Accuracy Multiplier",
        detail: "Points are calculated dynamically: Base Points (100) + Time Bonus based on remaining seconds. Speed without precision will compromise your school leaderboard.",
        icon: "🏆"
      },
      {
        label: "Strict Single-Session Lockout",
        detail: "Once a tournament round commences, closing the application or disconnecting triggers an automated forfeiture of the active bracket.",
        icon: "🛡️"
      },
      {
        label: "Grade-Tier Isolation",
        detail: "Primary, JSS, SSS, and 100L compete strictly in separate brackets. You are ranked solely against peers in your exact academic cohort.",
        icon: "👥"
      }
    ],
    penalties: [
      "Network dropouts during live duel rounds count as round forfeiture",
      "Anti-collusion checks inspect latency spikes and simultaneous submissions",
      "Disqualification automatically removes school contribution points"
    ],
    scoringGuideline: "Rankings update live on the National Leaderboard and count towards the scholarship pool."
  },
  live_duel: {
    title: "1v1 Head-to-Head Duel Protocol",
    badge: "REAL-TIME PEER BATTLE",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    standard: "Real-time synchronized academic showdown between two peer scholars.",
    rules: [
      {
        label: "First-to-Answer Point Advantage",
        detail: "Both duelists receive the exact same question at the same instant. Faster correct responses receive up to a 50% speed bonus.",
        icon: "⚔️"
      },
      {
        label: "3 to 5 Rapid Rounds",
        detail: "Each round features high-yield problems. The scholar with the highest cumulative round score wins the match and claims the streak wager.",
        icon: "🔥"
      },
      {
        label: "Respectful Emotes and Sportsmanship",
        detail: "Use the in-game academic badges and emotes to motivate your peer. Abusive conduct triggers instant match banning.",
        icon: "🤝"
      }
    ],
    penalties: [
      "Early exit or disconnect awards an automatic victory to the opponent",
      "3 consecutive missed rounds result in a forfeit"
    ],
    scoringGuideline: "Winner gains +25 Trophy Points, 1 Golden Cowrie, and advances in the Zonal Bracket."
  },
  theory_marking: {
    title: "WAEC and University Theory Script Marking Rubric",
    badge: "SUBJECTIVE EXAM AND MARKING SCHEME",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    standard: "Compliant with WAEC Chief Examiner Marking Guides and NUC University Standards.",
    rules: [
      {
        label: "Step-by-Step Method Marks (M)",
        detail: "Marks are allocated for correct working formulae and logical derivations, not just the final answer. Full working out must be shown in your response.",
        icon: "📝"
      },
      {
        label: "Accuracy and Unit Marks (A)",
        detail: "Final answers must include standard SI units, correct decimal places, and clean algebraic representations.",
        icon: "🎯"
      },
      {
        label: "Sub-Agent Rubric Auditor",
        detail: "Your submitted essay or working is evaluated by an AI Chief Examiner sub-agent that breaks down marks by Knowledge, Comprehension, and Application.",
        icon: "🔍"
      }
    ],
    penalties: [
      "Missing units incur an automatic 1-mark deduction per question",
      "Skipping intermediate steps forfeits Method marks"
    ],
    scoringGuideline: "Detailed constructive feedback with examiner corrections is delivered immediately upon grading."
  },
  oral_phonetics: {
    title: "Oral English and Phonetics Drill Standard",
    badge: "PHONEME AND SPECTROGRAM LAB",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    standard: "NERDC English Language Syllabus and International Phonetic Alphabet (IPA).",
    rules: [
      {
        label: "Acoustic Clarity and Headphone Recommendation",
        detail: "Please wear headphones or ensure low ambient background noise for clear discrimination of minimal pairs, vowel length, and consonant clusters.",
        icon: "🎧"
      },
      {
        label: "Tone and Syllable Stress Detection",
        detail: "Pay careful attention to capitalized syllables indicating primary stress (such as pho-TO-graph-y vs PHO-to-graph).",
        icon: "🗣️"
      },
      {
        label: "Interactive Pronunciation Feedback",
        detail: "Listen to Auntie Bola or Brother Socratic for standard native Nigerian and Received Pronunciation benchmarks before locking in your choice.",
        icon: "🔊"
      }
    ],
    penalties: [
      "Rushing without playing audio drills diminishes phonemic pattern retention"
    ],
    scoringGuideline: "Accurate phoneme identification awards +10 XP per mastered syllable."
  }
};

export default function ExamInstructionsModal({
  isOpen,
  onClose,
  examType,
  title,
  durationMinutes,
  questionCount,
  tier,
  onConfirmStart
}: ExamInstructionsModalProps) {
  if (!isOpen) return null;

  const config = INSTRUCTION_MAP[examType] || INSTRUCTION_MAP.cbt_quiz;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-[#0b0f19] border border-white/15 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl text-left my-auto">
        {/* Close button */}
        <button
          onClick={() => {
            sfx.tap();
            onClose();
          }}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${config.badgeColor}`}>
            {config.badge}
          </span>
          {tier && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
              {tier}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold font-syne text-white mb-1.5 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{title || config.title}</span>
        </h2>
        <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
          {config.standard}
        </p>

        {/* Quick Exam Specifications Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-white/[0.03] border border-white/10 rounded-2xl mb-4 text-xs">
          {durationMinutes && (
            <div className="flex items-center gap-2 text-zinc-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Duration</div>
                <div className="font-bold text-white">{durationMinutes} Minutes</div>
              </div>
            </div>
          )}
          {questionCount && (
            <div className="flex items-center gap-2 text-zinc-300">
              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-zinc-500 uppercase font-semibold">Questions</div>
                <div className="font-bold text-white">{questionCount} Items</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-zinc-300 col-span-2 sm:col-span-1">
            <Award className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="text-[10px] text-zinc-500 uppercase font-semibold">Integrity</div>
              <div className="font-bold text-emerald-400">Proctored</div>
            </div>
          </div>
        </div>

        {/* Core Rules List */}
        <div className="space-y-2.5 mb-4 max-h-[36vh] overflow-y-auto pr-1">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
            Candidate Mandatory Instructions:
          </div>
          {config.rules.map((rule, idx) => (
            <div 
              key={idx} 
              className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex items-start gap-3"
            >
              <span className="text-lg shrink-0 mt-0.5">{rule.icon}</span>
              <div>
                <div className="text-xs font-bold text-white mb-0.5">{rule.label}</div>
                <div className="text-[11px] text-zinc-400 leading-relaxed">{rule.detail}</div>
              </div>
            </div>
          ))}

          {/* Penalties and Integrity Notice */}
          <div className="p-3 rounded-2xl bg-red-950/20 border border-red-500/25 text-[11px]">
            <div className="font-bold text-red-400 flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Zero-Tolerance Academic Integrity Policy</span>
            </div>
            <ul className="list-disc list-inside text-zinc-300 space-y-0.5">
              {config.penalties.map((pen, i) => (
                <li key={i}>{pen}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action CTA */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
          <button
            onClick={() => {
              sfx.tap();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition-colors cursor-pointer border border-white/10"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              sfx.correct();
              if (onConfirmStart) onConfirmStart();
              onClose();
            }}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
          >
            <span>I Have Read and Agree — Proceed</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

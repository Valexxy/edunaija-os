"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Target, Sparkles, Brain, ArrowRight, CheckCircle2, 
  AlertTriangle, BookOpen, Layers, Flame, RefreshCw, Zap, Compass,
  Sliders, MessageSquare, Eye, FileText, Headphones, X, Check, Award, Lock, Unlock,
  Volume2, Play, Pause
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface CognitiveGap {
  subject: string;
  topic: string;
  prerequisite: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  accuracy: number;
  remedy: string;
}

interface MilestonePhase {
  phase: number;
  title: string;
  status: "COMPLETED" | "ACTIVE" | "UPCOMING" | "LOCKED";
  score: string;
  desc: string;
}

interface PersonalizationProfile {
  id: string;
  user_key: string;
  class_tier: string;
  grade_level: string;
  current_grade_band: string;
  target_grade_band: string;
  baseline_score: number;
  current_score: number;
  target_score: number;
  learning_modality: string;
  learning_velocity: string;
  active_phase: number;
  phase_progress_pct: number;
  cognitive_gaps: CognitiveGap[];
  custom_study_plan: MilestonePhase[];
}

const MODALITY_OPTIONS = [
  { id: "socratic_dialectic", label: "Socratic Dialectic", icon: MessageSquare, desc: "Master concepts by explaining them to AI junior student Temi." },
  { id: "visual_spatial", label: "Visual & Graph Modeling", icon: Eye, desc: "Dynamic interactive circuit, balance scale, and curve sandboxes." },
  { id: "step_by_step_deductive", label: "Step-by-Step Derivation", icon: FileText, desc: "Rigorous Method (M) and Accuracy (A) theory step-marking." },
  { id: "auditory_phonics", label: "Neural Audio Resonance", icon: Headphones, desc: "Authentic Nigerian English & Pidgin voice narration." }
];

const DIAGNOSTIC_QUESTIONS: Record<string, {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  pedagogicalTip: string;
}> = {
  "Quadratic Factorization & Roots": {
    question: "Factorize the quadratic expression: x² - 5x + 6 = 0.",
    options: ["(x - 2)(x - 3) = 0", "(x - 1)(x - 6) = 0", "(x + 2)(x + 3) = 0", "(x - 5)(x + 1) = 0"],
    correctIndex: 0,
    explanation: "Two numbers whose product is +6 and sum is -5 are -2 and -3. Hence (x - 2)(x - 3) = 0.",
    pedagogicalTip: "Always check the signs: a positive constant (+6) with a negative linear coefficient (-5) requires both factors to be negative."
  },
  "Quadratic Factorization & Polynomial Roots": {
    question: "Factorize the quadratic expression: x² - 5x + 6 = 0.",
    options: ["(x - 2)(x - 3) = 0", "(x - 1)(x - 6) = 0", "(x + 2)(x + 3) = 0", "(x - 5)(x + 1) = 0"],
    correctIndex: 0,
    explanation: "Two numbers whose product is +6 and sum is -5 are -2 and -3. Hence (x - 2)(x - 3) = 0.",
    pedagogicalTip: "Always check the signs: a positive constant (+6) with a negative linear coefficient (-5) requires both factors to be negative."
  },
  "Long Division & Equivalent Fractions": {
    question: "Which of the following fractions is equivalent to 3/4?",
    options: ["6/8", "5/8", "9/16", "3/8"],
    correctIndex: 0,
    explanation: "Multiplying numerator and denominator by 2 gives (3 × 2) / (4 × 2) = 6/8.",
    pedagogicalTip: "Multiply or divide both numerator and denominator by the exact same non-zero number."
  },
  "Phonics: Digraphs & Silent Letters": {
    question: "In the word 'KNIGHT', which letters are silent in Standard English?",
    options: ["'K' and 'GH'", "Only 'K'", "Only 'GH'", "None of them"],
    correctIndex: 0,
    explanation: "'K' before 'N' is silent (/naɪt/), and 'GH' before 'T' is silent.",
    pedagogicalTip: "English historical spelling retained silent consonants from Old English."
  },
  "Linear Equations & Word Problems": {
    question: "Solve for x in the equation: 3x + 7 = 22.",
    options: ["x = 5", "x = 4", "x = 6", "x = 15"],
    correctIndex: 0,
    explanation: "Subtract 7 from both sides: 3x = 15. Divide by 3: x = 5.",
    pedagogicalTip: "Inverse operations: undo addition with subtraction, undo multiplication with division."
  },
  "Vectors & Equilibrium of Forces": {
    question: "Two perpendicular forces of 3N and 4N act on a point. What is the resultant magnitude?",
    options: ["5 N", "7 N", "1 N", "12 N"],
    correctIndex: 0,
    explanation: "Using Pythagoras theorem: R = √(3² + 4²) = √(9 + 16) = √25 = 5 N.",
    pedagogicalTip: "Perpendicular vectors always form a right-angled triangle."
  },
  "Oral Phonology: Monophthongs vs Diphthongs": {
    question: "Which of the following vowel sounds is a diphthong (gliding vowel)?",
    options: ["/aɪ/ (as in 'price')", "/iː/ (as in 'fleece')", "/æ/ (as in 'trap')", "/uː/ (as in 'goose')"],
    correctIndex: 0,
    explanation: "/aɪ/ is a diphthong gliding from /a/ to /ɪ/. The others are monophthongs.",
    pedagogicalTip: "Monophthongs maintain a fixed tongue position; diphthongs glide from one vowel position to another."
  },
  "Academic Research & Referencing Syntax": {
    question: "In APA 7th edition, how should a source with three or more authors be cited in-text?",
    options: ["(Okonkwo et al., 2025)", "(Okonkwo, Adeleke & Bello, 2025)", "(Okonkwo and others, 2025)", "(Okonkwo et al.)"],
    correctIndex: 0,
    explanation: "APA 7th edition mandates using 'FirstAuthor et al., Year' from the very first in-text citation.",
    pedagogicalTip: "Ensure 'et al.' has a period after 'al' and a comma before the publication year."
  },
  "Calculus: Limits & Continuity": {
    question: "Evaluate the limit: lim (x → 2) (x² - 4) / (x - 2).",
    options: ["4", "0", "2", "Undefined"],
    correctIndex: 0,
    explanation: "Factorize numerator: (x - 2)(x + 2) / (x - 2) = x + 2. When x → 2, 2 + 2 = 4.",
    pedagogicalTip: "When encountering 0/0 indeterminate form, algebraic factorization removes the discontinuity."
  }
};

export default function RoadToGradeAWidget({ 
  userKey = "DEMO-UTME-2025",
  isGuestPreview = false 
}: { 
  userKey?: string;
  isGuestPreview?: boolean;
}) {
  const [profile, setProfile] = useState<PersonalizationProfile | null>(null);
  const [pointsToA, setPointsToA] = useState<number>(31.3);
  const [intervention, setIntervention] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingModality, setIsUpdatingModality] = useState(false);

  // In-Place Socratic Remediation Modal State
  const [remediatingGap, setRemediatingGap] = useState<CognitiveGap | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [remediationFeedback, setRemediationFeedback] = useState<{ correct: boolean; explanation: string; tip: string } | null>(null);
  const [isSubmittingGap, setIsSubmittingGap] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Voice Explanation State
  const [voicePersona, setVoicePersona] = useState<string>("uncle_emeka");
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayVoiceExplanation = () => {
    if (isPlayingVoice) {
      if (voiceAudioRef.current) voiceAudioRef.current.pause();
      setIsPlayingVoice(false);
      sfx.tap();
      return;
    }

    if (!activeQuestionData) return;
    sfx.tap();
    triggerTmaHaptic("light");

    const explanationContent = remediationFeedback 
      ? `${remediationFeedback.explanation}. Tip: ${remediationFeedback.tip}` 
      : `${activeQuestionData.explanation}. Tip: ${activeQuestionData.pedagogicalTip}`;
    const narrationText = `${activeQuestionData.question}. ${explanationContent}`.slice(0, 500);
    const audioUrl = `/api/backend/tts/audio?text=${encodeURIComponent(narrationText)}&persona=${voicePersona}&speed=normal`;

    if (voiceAudioRef.current) {
      voiceAudioRef.current.src = audioUrl;
      voiceAudioRef.current.play().catch(e => console.log("Audio play error:", e));
      setIsPlayingVoice(true);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userKey]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/backend/api/intent-personalization/mastery-trajectory/${userKey}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setPointsToA(data.points_to_grade_a);
        setIntervention(data.recommended_intervention);
      }
    } catch {} finally {
      setIsLoading(false);
    }
  };

  const handleModalityChange = async (modalityId: string) => {
    sfx.tap();
    triggerTmaHaptic("medium");
    setIsUpdatingModality(true);
    try {
      const res = await fetch("/api/backend/api/intent-personalization/update-modality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_key: userKey,
          learning_modality: modalityId
        })
      });
      if (res.ok) {
        setToastMessage("Modality updated and saved to database!");
        setTimeout(() => setToastMessage(null), 3000);
        await fetchProfile();
      }
    } catch {} finally {
      setIsUpdatingModality(false);
    }
  };

  const handlePhaseClick = async (phaseNum: number) => {
    sfx.tap();
    try {
      const res = await fetch("/api/backend/api/intent-personalization/update-phase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_key: userKey,
          active_phase: phaseNum
        })
      });
      if (res.ok) {
        await fetchProfile();
      }
    } catch {}
  };

  const handleOpenRemediation = (gap: CognitiveGap) => {
    sfx.tap();
    triggerTmaHaptic("light");
    setRemediatingGap(gap);
    setSelectedOption(null);
    setRemediationFeedback(null);
  };

  const handleAnswerSubmit = async () => {
    if (!remediatingGap || selectedOption === null) return;
    setIsSubmittingGap(true);
    sfx.tap();

    const qData = DIAGNOSTIC_QUESTIONS[remediatingGap.topic] || {
      question: `Evaluate the foundational principle of: ${remediatingGap.topic}`,
      options: ["Concept fully verified", "Partial approximation", "Inverse relationship", "Undefined"],
      correctIndex: 0,
      explanation: `Verified foundational understanding for ${remediatingGap.prerequisite}.`,
      pedagogicalTip: "Active prerequisite recall directly increases exam question accuracy."
    };

    const isCorrect = selectedOption === qData.correctIndex;
    setRemediationFeedback({
      correct: isCorrect,
      explanation: qData.explanation,
      tip: qData.pedagogicalTip
    });

    if (isCorrect) {
      sfx.streakCelebration();
      triggerTmaHaptic("heavy");
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

      try {
        const res = await fetch("/api/backend/api/intent-personalization/resolve-gap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_key: userKey,
            topic: remediatingGap.topic,
            score_achieved: 95.0
          })
        });

        if (res.ok) {
          const result = await res.json();
          setProfile(result.profile);
          setPointsToA(result.points_to_grade_a);
          setToastMessage(result.message);
          setTimeout(() => setToastMessage(null), 4000);

          // Dispatch update event so AppShell header updates XP and Hearts live
          if (typeof window !== "undefined") {
            const stored = localStorage.getItem("edunaija_user");
            if (stored) {
              try {
                const u = JSON.parse(stored);
                u.xp_points = result.total_xp;
                u.hearts = result.total_hearts;
                localStorage.setItem("edunaija_user", JSON.stringify(u));
                window.dispatchEvent(new CustomEvent("edunaija_user_updated", { detail: u }));
              } catch {}
            }
          }
        }
      } catch {}
    } else {
      sfx.wrong();
      triggerTmaHaptic("medium");
    }
    setIsSubmittingGap(false);
  };

  if (isLoading || !profile) {
    return (
      <div className="w-full h-44 rounded-3xl bg-white/[0.02] border border-white/10 animate-pulse flex items-center justify-center">
        <span className="text-xs font-mono text-zinc-500">Calibrating your Grade A Cognitive Trajectory...</span>
      </div>
    );
  }

  const activeQuestionData = remediatingGap ? (DIAGNOSTIC_QUESTIONS[remediatingGap.topic] || {
    question: `Which fundamental principle governs ${remediatingGap.topic}?`,
    options: [
      `Rigorous application of ${remediatingGap.prerequisite}`,
      "Random extrapolation without proof",
      "Qualitative guessing under exam hall pressure",
      "Ignoring prerequisite dependencies"
    ],
    correctIndex: 0,
    explanation: `Foundational mastery of ${remediatingGap.prerequisite} eliminates exam errors in ${remediatingGap.topic}.`,
    pedagogicalTip: "Systematic step derivation guarantees method marks in WAEC and quick elimination in JAMB."
  }) : null;

  return (
    <div className="w-full rounded-3xl bg-gradient-to-br from-white/[0.04] via-black/40 to-white/[0.02] border border-white/15 p-5 sm:p-7 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
      
      {/* Background Specular Mesh */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#00E676] text-black px-4 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30 flex items-center gap-1">
              <Brain className="w-3 h-3 text-[#00E676]" />
              Bloom 2-Sigma Mastery Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-zinc-300 border border-white/10">
              Target: {profile.grade_level || profile.class_tier} &bull; Score: {profile.target_score}%
            </span>
            {isGuestPreview && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Preview Mode
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight flex items-center gap-2">
            Your Individualized Road to Grade A
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-[#00E676] border border-emerald-500/30">
              Phase 0{profile.active_phase} Active
            </span>
          </h2>
          <p className="text-xs text-zinc-400">
            You are not taught like every other student. This system diagnoses your exact prerequisite knowledge gaps and delivers pedagogical interventions tuned to your cognitive style.
          </p>
        </div>

        {/* Current Band vs Target Band Comparison Stat Card */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 shrink-0">
          <div className="text-center px-2">
            <div className="text-[10px] font-mono text-zinc-400">Current Band</div>
            <div className="text-xl font-display font-black text-amber-400">
              Grade {profile.current_grade_band}
            </div>
            <div className="text-[10px] font-mono text-zinc-300">{profile.current_score}%</div>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex flex-col items-center">
            <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase">Delta Needed</div>
            <div className="text-xs font-black text-[#00E676]">+{pointsToA}%</div>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="text-center px-2">
            <div className="text-[10px] font-mono text-zinc-400">Goal Band</div>
            <div className="text-xl font-display font-black text-[#00E676]">
              Grade {profile.target_grade_band}
            </div>
            <div className="text-[10px] font-mono text-zinc-300">{profile.target_score}%</div>
          </div>
        </div>
      </div>

      {/* 4-Phase Stepper */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        {profile.custom_study_plan.map((step) => {
          const isDone = step.status === "COMPLETED";
          const isActive = step.status === "ACTIVE";
          return (
            <button
              key={step.phase}
              onClick={() => handlePhaseClick(step.phase)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(0,230,118,0.15)] ring-1 ring-emerald-500/30"
                  : isDone
                  ? "bg-white/[0.03] border-white/10 opacity-80 hover:opacity-100"
                  : "bg-black/30 border-white/5 opacity-60 hover:opacity-90"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                <span className={`font-bold ${isActive ? "text-[#00E676]" : isDone ? "text-zinc-400" : "text-zinc-500"}`}>
                  PHASE 0{step.phase}
                </span>
                <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                  isActive ? "bg-emerald-500/20 text-[#00E676]" : isDone ? "bg-white/10 text-zinc-300" : "bg-zinc-800 text-zinc-500"
                }`}>
                  {step.status}
                </span>
              </div>
              <div className="text-xs font-bold text-white leading-snug">
                {step.title}
              </div>
              <div className="text-[10px] font-mono text-emerald-400/90 mt-1">
                {step.score}
              </div>
              <div className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                {step.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Split: Modality Switcher (Left) & Cognitive Gaps (Right) */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        
        {/* Left Column: Learning Modality Selector (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400" />
              Your Individual Learning Modality
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              1-Click Switch
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            How your brain absorbs and encodes complex curriculum concepts most effectively:
          </p>

          <div className="space-y-2">
            {MODALITY_OPTIONS.map((opt) => {
              const isSelected = profile.learning_modality === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleModalityChange(opt.id)}
                  disabled={isUpdatingModality}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400 text-white shadow-sm"
                      : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? "bg-emerald-500 text-black font-bold" : "bg-white/10 text-zinc-300"}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-none">
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                        {opt.desc}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#00E676] shadow-[0_0_8px_#00E676] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Modality Intervention Shortcut */}
          {intervention && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 font-mono">
                {intervention.tagline}
              </span>
              <Link
                href={intervention.action_url}
                className="shrink-0 text-xs font-bold text-[#00E676] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{intervention.primary_action}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Zone of Proximal Development (ZPD) Prerequisite Gaps (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              Zone of Proximal Development (Prerequisite Gaps)
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              {profile.cognitive_gaps.length} Targeted Gaps
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            These are the exact underlying prerequisite concepts holding your test accuracy back. Fix these root causes to jump to Grade A:
          </p>

          <div className="space-y-2">
            {profile.cognitive_gaps.map((gap, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold bg-white/10 text-zinc-300 px-1.5 py-0.2 rounded uppercase">
                      {gap.subject}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                      gap.severity === "HIGH" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}>
                      {gap.severity} Priority
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Accuracy: <strong className="text-amber-300">{gap.accuracy}%</strong>
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white">
                    {gap.topic}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Bottleneck: <span className="text-zinc-200">{gap.prerequisite}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenRemediation(gap)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-center shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fix Gap</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Socratic Gap Remediation Modal */}
      <AnimatePresence>
        {remediatingGap && activeQuestionData && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl bg-[#090b14] border border-emerald-500/40 p-6 shadow-2xl relative space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00E676]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                      Socratic Prerequisite Remediation
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {remediatingGap.topic}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setRemediatingGap(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <strong>Prerequisite Bottleneck:</strong> {remediatingGap.prerequisite}
                <div className="text-[10px] text-amber-300/80 mt-0.5">Current accuracy: {remediatingGap.accuracy}% &bull; Target: 90%+</div>
              </div>

              {/* Diagnostic Question */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white">
                  {activeQuestionData.question}
                </p>

                <div className="space-y-2">
                  {activeQuestionData.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        sfx.tap();
                        setSelectedOption(i);
                        setRemediationFeedback(null);
                      }}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                        selectedOption === i
                          ? "bg-emerald-500/20 border-emerald-400 text-white font-bold"
                          : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedOption === i && (
                        <CheckCircle2 className="w-4 h-4 text-[#00E676]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Alert */}
              {remediationFeedback && (
                <div className={`p-3 rounded-xl text-xs space-y-1 ${
                  remediationFeedback.correct
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {remediationFeedback.correct ? "✅ Prerequisite Bottleneck Cleared!" : "❌ Incorrect, let's learn why:"}
                  </div>
                  <p>{remediationFeedback.explanation}</p>
                  <p className="text-[10px] opacity-80">💡 Tip: {remediationFeedback.tip}</p>
                </div>
              )}

              {/* Voice Explanation Audio Player Bar */}
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-semibold text-zinc-300 hidden sm:inline">
                    Voice Explanation:
                  </span>
                  <select
                    value={voicePersona}
                    onChange={(e) => {
                      sfx.tap();
                      setVoicePersona(e.target.value);
                      if (voiceAudioRef.current) voiceAudioRef.current.pause();
                      setIsPlayingVoice(false);
                    }}
                    className="bg-slate-900 border border-white/10 text-[11px] font-bold text-emerald-400 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                  >
                    <option value="uncle_emeka">🎙️ Uncle Emeka (STEM English)</option>
                    <option value="wazobia_broda">🔥 Broda Wazobia (Naija Pidgin)</option>
                    <option value="baba_agba">👴🏾 Bàbá Àgbà (Yorùbá)</option>
                    <option value="nna_anyi">🧔🏾 Nna Anyị (Igbo)</option>
                    <option value="malam_danladi">👳🏾 Malam Danladi (Hausa)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handlePlayVoiceExplanation}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlayingVoice
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/30 animate-pulse"
                      : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black border border-emerald-500/40"
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isPlayingVoice ? "Pause" : "Listen"}</span>
                </button>
              </div>

              {/* Hidden Socratic Audio Element */}
              <audio 
                ref={voiceAudioRef} 
                onEnded={() => setIsPlayingVoice(false)} 
                onError={() => setIsPlayingVoice(false)} 
              />

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => setRemediatingGap(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleAnswerSubmit}
                  disabled={selectedOption === null || isSubmittingGap}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-bold text-xs hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{isSubmittingGap ? "Calibrating..." : "Verify & Fix Gap (+50 XP)"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

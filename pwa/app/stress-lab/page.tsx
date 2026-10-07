"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, Flame, Zap, AlertTriangle, Timer, 
  RotateCcw, CheckCircle2, ArrowRight, Volume2, VolumeX,
  Activity, Award, Radio, EyeOff, Sparkles, Brain
} from "lucide-react";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";
import BackButton from "../../components/BackButton";

interface Scenario {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  stress_level: number;
  triggers: string[];
  question_count: number;
  warning: string;
}

interface Question {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface TriggerEvent {
  question_number: number;
  trigger_type: string;
  message: string;
  duration_seconds: number;
}

export default function StressLabPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Exam State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [triggerSchedule, setTriggerSchedule] = useState<TriggerEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Active Inoculation Stressors
  const [activeTrigger, setActiveTrigger] = useState<TriggerEvent | null>(null);
  const [screenBlackout, setScreenBlackout] = useState(false);
  const [fakeConnectionLost, setFakeConnectionLost] = useState(false);
  const [stressorsSurvived, setStressorsSurvived] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Web Audio Exam Hall Ambient Chatter Simulator
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  useEffect(() => {
    fetchScenarios();
    return () => {
      stopAmbientNoise();
    };
  }, []);

  const fetchScenarios = async () => {
    try {
      const res = await fetch("/api/backend/stress-lab/scenarios");
      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios || []);
      }
    } catch {
      // Fallback
      setScenarios([
        {
          id: "s-last5min",
          name: "Last 5 Minutes Panic Drill",
          description: "A 20-question blitz with sudden red countdown overlays triggering mid-exam",
          duration_minutes: 10,
          stress_level: 5,
          triggers: ["countdown_panic", "question_shuffle"],
          question_count: 20,
          warning: "High-intensity panic simulation. Countdown alert designed to spike adrenaline."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startAmbientNoise = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Pink/Brown noise buffer to simulate exam hall ambient rumble
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 0.15; // Low volume background hum
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      noiseNodeRef.current = noise;
    } catch {
      // Audio not permitted yet
    }
  };

  const stopAmbientNoise = () => {
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  const startScenario = async (sc: Scenario) => {
    sfx.tap();
    setSelectedScenario(sc);
    setLoading(true);

    try {
      const res = await fetch("/api/backend/stress-lab/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: "demo-student",
          scenario_id: sc.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session_id);
        setQuestions(data.questions || []);
        setTriggerSchedule(data.trigger_schedule || []);
        setSecondsRemaining(sc.duration_minutes * 60);
        setCurrentIndex(0);
        setUserAnswers({});
        setExamStarted(true);
        setExamCompleted(false);
        setResults(null);
        setStressorsSurvived(0);

        if (!isAudioMuted && sc.triggers.includes("ambient_noise")) {
          startAmbientNoise();
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  // Exam Countdown Timer
  useEffect(() => {
    if (!examStarted || examCompleted) return;
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, examCompleted]);

  // Check scheduled stressor triggers on question change
  const checkStressorTrigger = (newIndex: number) => {
    const qNum = newIndex + 1;
    const matchedTrigger = triggerSchedule.find(t => t.question_number === qNum);

    if (matchedTrigger) {
      setActiveTrigger(matchedTrigger);
      setStressorsSurvived(prev => prev + 1);
      triggerTmaHaptic("heavy");
      sfx.wrong();

      if (matchedTrigger.trigger_type === "fake_connection_lost") {
        setFakeConnectionLost(true);
        setTimeout(() => setFakeConnectionLost(false), 4000);
      } else if (matchedTrigger.trigger_type === "screen_flash") {
        setScreenBlackout(true);
        setTimeout(() => setScreenBlackout(false), 2500);
      }

      // Auto dismiss banner after duration
      setTimeout(() => {
        setActiveTrigger(null);
      }, (matchedTrigger.duration_seconds || 5) * 1000);
    }
  };

  const handleSelectOption = (optLabel: string) => {
    sfx.tap();
    setUserAnswers(prev => ({ ...prev, [currentIndex]: optLabel }));
  };

  const handleNext = () => {
    sfx.tap();
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      checkStressorTrigger(nextIdx);
    }
  };

  const handlePrev = () => {
    sfx.tap();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitExam = async () => {
    stopAmbientNoise();
    setExamCompleted(true);
    sfx.correct();
    triggerTmaHaptic("success");

    const answersArray = questions.map((_, i) => userAnswers[i] || "");
    const timeSpent = selectedScenario ? (selectedScenario.duration_minutes * 60) - secondsRemaining : 300;

    try {
      const res = await fetch(`/api/backend/stress-lab/session/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersArray,
          time_taken_seconds: timeSpent,
          stressor_events_survived: stressorsSurvived
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch {
      // Fallback result calculation
      const correct = questions.filter((q, i) => userAnswers[i] === q.correct).length;
      const pct = Math.round((correct / questions.length) * 100);
      setResults({
        score: correct,
        total: questions.length,
        score_pct: pct,
        stress_tolerance_index: Math.round(pct * 1.1),
        verdict: pct >= 70 ? "Elite Resilience" : "Good Progress",
        stressors_survived: stressorsSurvived,
        message: `You completed the drill under exam stressors!`,
        xp_earned: 80
      });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in relative">
      
      {/* Fake Screen Blackout Stressor Overlay */}
      {screenBlackout && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-6 text-center animate-fade-in">
          <div className="space-y-2">
            <div className="w-4 h-4 rounded-full bg-amber-400 animate-ping mx-auto" />
            <p className="text-zinc-500 font-mono text-xs">Generator fluctuation... reconnecting to server...</p>
          </div>
        </div>
      )}

      {/* Fake Connection Lost Modal Stressor */}
      {fakeConnectionLost && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#121422] border border-red-500/50 rounded-3xl p-6 text-center space-y-4 shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-bounce">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Connection Lost (Error #408)</h3>
            <p className="text-xs text-zinc-400">
              Exam server did not respond. Attempting automatic socket reconnection...
            </p>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 animate-pulse w-3/4" />
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">Do NOT refresh the page.</p>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div>
        <BackButton fallbackHref="/student" label="Back to Cockpit" />
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-950/60 via-[#0e101c] to-black border border-red-500/30 p-6 md:p-8 shadow-[0_0_60px_rgba(239,68,68,0.15)]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-black tracking-wide uppercase mb-3">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>World-First · Cognitive Resilience Lab</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-display text-white tracking-tight leading-tight mb-2">
            Exam Stress Inoculation: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-rose-200">
              Train Under Extreme Pressure
            </span>
          </h1>

          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed mb-4">
            Stress Inoculation Training (SIT) is used by aerospace pilots and Olympic athletes. 
            EduNaija OS deliberately injects simulated panic alarms, fake disconnects, and exam hall ambient rumble 
            so that real JAMB CBT anxiety produces zero adrenaline freeze on exam day.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-300 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Inoculation Protocol: <strong>Stress Exposure Therapy</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Selection or Active Exam */}
      {!examStarted ? (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Choose Your Stress Inoculation Scenario:
          </h2>

          {loading ? (
            <div className="py-16 text-center text-zinc-400 font-mono text-xs">
              Loading Stress Scenarios...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map(sc => (
                <div
                  key={sc.id}
                  onClick={() => startScenario(sc)}
                  className="rounded-3xl bg-gradient-to-b from-white/[0.04] to-black border border-white/10 hover:border-red-500/50 p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.01] group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1">
                      {"🔥".repeat(sc.stress_level)}
                      <span className="text-zinc-500 text-[10px] ml-1">Lvl {sc.stress_level}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">
                      {sc.duration_minutes} Mins · {sc.question_count} Qs
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-red-300 transition-colors">
                      {sc.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {sc.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1">
                    {sc.triggers.map(tr => (
                      <span key={tr} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-red-500/10 text-red-300 border border-red-500/20">
                        {tr.replace("_", " ")}
                      </span>
                    ))}
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs text-red-400 font-bold">
                    <span>Enter Stress Sim</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : !examCompleted ? (
        /* Active Stress Exam Runtime */
        <div className="space-y-6">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-zinc-400">
                Question <strong className="text-white text-sm">{currentIndex + 1}</strong> of {questions.length}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {questions[currentIndex]?.subject}
              </span>
            </div>

            {/* Live Panic Clock */}
            <div className="flex items-center gap-3">
              <div className={`px-4 py-1.5 rounded-xl font-mono text-sm font-black border flex items-center gap-2 ${
                secondsRemaining < 120 
                  ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" 
                  : "bg-white/5 border-white/10 text-white"
              }`}>
                <Timer className="w-4 h-4" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>

              <button
                onClick={() => {
                  if (audioCtxRef.current) {
                    if (isAudioMuted) {
                      audioCtxRef.current.resume();
                    } else {
                      audioCtxRef.current.suspend();
                    }
                  }
                  setIsAudioMuted(!isAudioMuted);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                title={isAudioMuted ? "Unmute exam hall chatter" : "Mute exam hall chatter"}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>

          {/* Active Stress Banner Trigger Overlay */}
          {activeTrigger && (
            <div className="rounded-2xl bg-red-600/30 border border-red-500 p-4 text-white font-bold text-xs flex items-center justify-between shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-bounce">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
                <span>{activeTrigger.message}</span>
              </div>
              <span className="text-[10px] font-mono text-red-200">Simulated Stressor #{stressorsSurvived}</span>
            </div>
          )}

          {/* Question Card */}
          {questions[currentIndex] && (
            <div className="rounded-3xl bg-[#0c0d18] border border-white/10 p-6 space-y-6">
              <p className="text-base md:text-lg font-bold text-white leading-relaxed">
                {questions[currentIndex].question}
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {questions[currentIndex].options.map((opt, i) => {
                  const optLabel = opt.slice(0, 1);
                  const isSelected = userAnswers[currentIndex] === optLabel;

                  return (
                    <div
                      key={i}
                      onClick={() => handleSelectOption(optLabel)}
                      className={`p-4 rounded-2xl border text-sm font-semibold cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-red-500/20 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                          : "bg-white/5 border-white/10 hover:border-white/20 text-zinc-300"
                      }`}
                    >
                      {opt}
                    </div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 disabled:opacity-30"
                >
                  Previous
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitExam}
                    className="px-6 py-2.5 rounded-xl bg-emerald-400 text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg"
                  >
                    Submit Stress Drill
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Post-Exam Stress Tolerance Index (STI) Analysis */
        <div className="rounded-3xl bg-gradient-to-b from-white/[0.04] to-black border border-white/10 p-6 md:p-8 space-y-6 animate-fade-in text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-3xl mx-auto shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            🏆
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              Inoculation Session Complete
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white mt-1">
              Stress Tolerance Index: <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-400">{results?.stress_tolerance_index || 88}%</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto">
              {results?.verdict} — You maintained cognitive clarity through {stressorsSurvived} simulated crisis events.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl mx-auto text-left text-xs font-mono">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-zinc-500 block">Score Under Stress:</span>
              <strong className="text-white text-base">{results?.score_pct || 0}%</strong>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-zinc-500 block">Stressors Defeated:</span>
              <strong className="text-red-400 text-base">{stressorsSurvived}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-zinc-500 block">Time Spent:</span>
              <strong className="text-white text-base">Completed</strong>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-zinc-500 block">XP Earned:</span>
              <strong className="text-amber-400 text-base">+{results?.xp_earned || 75} XP</strong>
            </div>
          </div>

          <button
            onClick={() => {
              setExamStarted(false);
              setExamCompleted(false);
            }}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
          >
            Try Another Pressure Drill
          </button>
        </div>
      )}

    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Trophy, Users, Flame, ArrowUp, RefreshCw, CheckCircle2, 
  XCircle, MapPin, Award, ChevronRight, Layers, ShieldCheck,
  Radio, Swords, WifiOff, Wifi, Play, AlertTriangle
} from "lucide-react";
import confetti from "canvas-confetti";
import BackButton from "../../components/BackButton";
import ExamCalculator, { isCalculatorPermitted } from "../../components/ExamCalculator";
import StudySquadCard from "../../components/StudySquadCard";
import LiveDuelArena from "../../components/LiveDuelArena";
import ExamInstructionsModal from "../../components/ExamInstructionsModal";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

interface TournamentStage {
  stage_id: number;
  stage_name: string;
  scope: string;
  eligibility: string;
  cutoff_mark: number;
  reward_pool: string;
  current_status: string;
  sample_brackets: Array<{
    bracket_id: string;
    name: string;
    state?: string;
    participants: number;
    leader: string;
  }>;
}

export default function CompetitionPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(167); // 02:47
  const [toastMsg, setToastMsg] = useState("Loading live battle room...");
  const [myScore, setMyScore] = useState(0);
  const [myRank, setMyRank] = useState(3);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCalculator, setShowCalculator] = useState(false);

  // Tournament Hierarchy State: 1 = LGA, 2 = State, 3 = Zonal, 4 = National
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [pyramidStages, setPyramidStages] = useState<TournamentStage[]>([]);
  const [showPyramidDrawer, setShowPyramidDrawer] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Dynamic Data from Backend
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingQuestion, setLoadingQuestion] = useState(true);

  // Specific Grade Level Isolation (Primary 1-6, JSS 1-3, SSS 1-3, 100L)
  const [specificGrade, setSpecificGrade] = useState<string>("SSS 3");
  const [regionFilter, setRegionFilter] = useState<"ALL" | "NIGERIA" | "DIASPORA">("ALL");
  const [ntpOffsetMs, setNtpOffsetMs] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<"SOLO_SPRINT" | "SQUAD_COOP" | "LIVE_DUEL" | "LGA_WARS">("SOLO_SPRINT");
  const [lgaRivalries, setLgaRivalries] = useState<any[]>([]);

  // Live Head-to-Head Lagos vs Onitsha Simulation State
  const [showH2HModal, setShowH2HModal] = useState(false);
  const [h2hRunning, setH2HRunning] = useState(false);
  const [h2hData, setH2HData] = useState<any | null>(null);

  // Offline Mesh Outage Simulator State
  const [showMeshModal, setShowMeshModal] = useState(false);
  const [meshRunning, setMeshRunning] = useState(false);
  const [meshOutageState, setMeshOutageState] = useState<"ONLINE" | "OUTAGE" | "RECOVERED">("ONLINE");
  const [meshData, setMeshData] = useState<any | null>(null);

  const runHeadToHeadSimulation = async () => {
    setH2HRunning(true);
    sfx.tap();
    triggerTmaHaptic("heavy");
    try {
      const res = await fetch("/api/backend/competition/head-to-head/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "Mathematics",
          grade: specificGrade,
          player1_name: "Ayomide F. (Ikeja LGA, Lagos)",
          player1_location: "Ikeja, Lagos State",
          player2_name: "Chukwuemeka O. (Onitsha North LGA, Anambra)",
          player2_location: "Onitsha North, Anambra State"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setH2HData(data);
        sfx.correct();
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      }
    } catch (err) {
      console.error("H2H error:", err);
    } finally {
      setH2HRunning(false);
    }
  };

  const runMeshOutageSimulation = async (targetState: "DISCONNECTED_OUTAGE" | "RECONNECTED_ONLINE") => {
    setMeshRunning(true);
    sfx.tap();
    triggerTmaHaptic("medium");
    try {
      const res = await fetch("/api/backend/zero-data/mesh-outage-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: currentUser?.registration_key || "STU-WAEC-2026-LAGOS",
          grade_level: specificGrade,
          exam_type: `WASSCE / UTME Mathematics (${specificGrade})`,
          network_state: targetState,
          uncommitted_answers_count: 22
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMeshData(data);
        if (targetState === "DISCONNECTED_OUTAGE") {
          setMeshOutageState("OUTAGE");
          sfx.wrong();
        } else {
          setMeshOutageState("RECOVERED");
          sfx.correct();
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
        }
      }
    } catch (err) {
      console.error("Mesh error:", err);
    } finally {
      setMeshRunning(false);
    }
  };

  // Load User & Initial Data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("edunaija_user");
      let detectedGrade = "SSS 3";
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
          setMyScore(parsed.xp_points || 0);
          if (parsed.class_tier) {
            const raw = parsed.class_tier.toUpperCase();
            detectedGrade = raw === "PRIMARY" ? "Primary 1" : raw === "JSS" ? "JSS 2" : raw === "SSS" ? "SSS 3" : raw === "100L" ? "100L" : raw;
          }
        } catch {}
      } else {
        setCurrentUser(null);
        setMyScore(0);
        const storedTier = localStorage.getItem("edunaija_class_tier");
        if (storedTier) {
          const raw = storedTier.toUpperCase();
          detectedGrade = raw === "PRIMARY" ? "Primary 1" : raw === "JSS" ? "JSS 2" : raw === "SSS" ? "SSS 3" : raw === "100L" ? "100L" : raw;
        }
      }
      setSpecificGrade(detectedGrade);
      fetchLiveLeaderboard();
      fetchTournamentPyramid(detectedGrade);
      fetchNextGradeQuestion(detectedGrade);
      fetchLgaRivalries();
    }
  }, []);

  const fetchLgaRivalries = async () => {
    try {
      const res = await fetch("/api/backend/competition/lga-clans/leaderboard");
      if (res.ok) {
        const data = await res.json();
        if (data.rivalries) setLgaRivalries(data.rivalries);
      }
    } catch (e) {
      console.warn("LGA rivalry fetch error:", e);
    }
  };

  // Fetch Live Leaderboard & Contenders
  const fetchLiveLeaderboard = async () => {
    try {
      const res = await fetch("/api/backend/competition/national-leaderboard?limit=10");
      if (res.ok) {
        const data = await res.json();
        if (data.leaderboard && data.leaderboard.length >= 3) {
          setLeaderboard(data.leaderboard);
        }
      }
    } catch (err) {
      console.warn("Leaderboard fetch error:", err);
    }
  };

  // Fetch Tournament Pyramid Data strictly for specific grade
  const fetchTournamentPyramid = async (grade: string) => {
    try {
      const res = await fetch(`/api/backend/competition/tournament-pyramid?specific_grade=${encodeURIComponent(grade)}`);
      if (res.ok) {
        const data = await res.json();
        setPyramidStages(data.stages || []);
        if (data.stages?.[0]?.time_sync?.server_time_epoch_ms) {
          const clientNow = Date.now();
          setNtpOffsetMs(data.stages[0].time_sync.server_time_epoch_ms - clientNow);
        }
      }
    } catch (err) {
      console.warn("Pyramid fetch error:", err);
    }
  };

  // Fetch Next Real Curriculum Question strictly matching specific grade
  const fetchNextGradeQuestion = async (grade: string) => {
    setLoadingQuestion(true);
    setSelected(null);
    setAnswered(false);
    try {
      const normGrade = grade.trim();
      const res = await fetch(`/api/backend/quiz/questions?class_tier=${encodeURIComponent(normGrade)}&limit=15`);
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          const qList = data.questions;
          const randomQ = qList[Math.floor(Math.random() * qList.length)];
          setCurrentQuestion({
            question_text: randomQ.question_text,
            options: [randomQ.option_a, randomQ.option_b, randomQ.option_c, randomQ.option_d],
            correct_option: randomQ.correct_option,
            subject: randomQ.subject,
            topic: randomQ.topic,
            formula_latex: randomQ.formula_latex
          });
          setLoadingQuestion(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Grade question fetch fallback:", e);
    }

    // Default fallback
    setCurrentQuestion({
      question_text: `Class-Locked Competition Drill for ${grade}. What fundamental law governs standard progression?`,
      options: ["A. Standard Definition", "B. Conservation Law", "C. Kinetic Equilibrium", "D. Inverse Proportion"],
      correct_option: "A",
      subject: "Science & Logic",
      topic: "Core Foundations"
    });
    setLoadingQuestion(false);
  };

  // Periodic Leaderboard Poll (Every 6s)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveLeaderboard();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  // Live dynamic battle toasts with real contenders
  useEffect(() => {
    if (leaderboard.length === 0) return;
    const interval = setInterval(() => {
      const randomLeader = leaderboard[Math.floor(Math.random() * leaderboard.length)];
      const actions = [
        `answered correctly ✓ +20 pts`,
        `is on a 5-question streak! 🔥`,
        `climbed to Rank #${randomLeader.rank}!`,
        `earned speed bonus (+5 pts)!`
      ];
      const action = actions[Math.floor(Math.random() * actions.length)];
      setToastMsg(`${randomLeader.full_name} (${randomLeader.state}) ${action}`);
    }, 3200);
    return () => clearInterval(interval);
  }, [leaderboard]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSelect = (optLetter: string) => {
    if (answered || !currentQuestion) return;
    setSelected(optLetter);
    setAnswered(true);
    triggerTmaHaptic("medium");

    const isCorrect = optLetter === currentQuestion.correct_option;
    if (isCorrect) {
      sfx.correct();
      if (currentUser) {
        setMyScore((s) => s + 25);
        setMyRank((r) => Math.max(1, r - 1));
      }
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else {
      sfx.wrong();
    }

    // Auto-advance to next question after 2 seconds
    setTimeout(() => {
      setQuestionIndex((prev) => prev + 1);
      fetchNextGradeQuestion(specificGrade);
    }, 2200);
  };

  const firstPlace = leaderboard[0] || { full_name: "Amina Danjuma", state: "Abuja", xp_points: 4620 };
  const secondPlace = leaderboard[1] || { full_name: "Adeoluwa Balogun", state: "Oyo", xp_points: 4490 };
  const myDisplayName = currentUser?.full_name ? `${currentUser.full_name} (You)` : "Guest (Sign in to rank)";

  const currentStage = pyramidStages.find(s => s.stage_id === activeStageId) || {
    stage_id: 1,
    stage_name: "LGA Qualifiers",
    scope: "774 Local Government Areas",
    cutoff_mark: 75,
    reward_pool: "₦50,000 / LGA + Certificate of Merit",
    sample_brackets: [
      { bracket_id: "LGA-IKJ", name: "Ikeja LGA Division", state: "Lagos", participants: 1420, leader: "Ayomide F. (98%)" },
      { bracket_id: "LGA-AMC", name: "Abuja Municipal (AMAC)", state: "FCT Abuja", participants: 2150, leader: "Fatima M. (99%)" }
    ]
  };

  if (!currentUser) {
    return (
      <main className="p-4 mx-auto min-h-screen pb-24 text-white flex items-center justify-center max-w-md">
        <div className="w-full bg-[#0B0E18] border border-amber-500/40 rounded-3xl p-6 text-center space-y-5 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow & Live Badge */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-[#00E676]" />
          
          <div className="flex items-center justify-between">
            <BackButton fallbackHref="/student" label="Back" />
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold animate-pulse">
              ● 2,450 SCHOLARS LIVE
            </span>
          </div>

          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
            🏆
          </div>

          <div>
            <h1 className="text-xl font-black text-white tracking-wide">
              National Sprint Arena Locked
            </h1>
            <p className="text-xs text-amber-300/90 font-mono mt-1">
              Official 774 LGA Championship & Cash Prize Tournament
            </p>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Anonymous guests cannot enter live competitive duels or earn prize pool ranking. Register your student profile or activate a 24-Hour Sovereign Pass to claim your school rank and unlock real-time match lobbies.
          </p>

          {/* FOMO Incentive Card */}
          <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-left text-xs space-y-2 text-zinc-300 font-mono">
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <span>⚡</span> <span>What is at stake right now:</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">• Active Prize Pool:</span>
              <span className="text-emerald-400 font-bold">₦50,000 / LGA</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">• Current Division Leader:</span>
              <span className="text-cyan-300 font-bold">Ikeja LGA (98%)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">• Cutoff Mark:</span>
              <span className="text-rose-400 font-bold">75% Accuracy</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                sfx.tap();
                window.dispatchEvent(new CustomEvent("edunaija_open_auth"));
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🔑</span>
              <span>Sign In / Claim Student Spot</span>
            </button>

            <button
              onClick={() => {
                sfx.tap();
                window.dispatchEvent(new CustomEvent("edunaija_open_voucher"));
              }}
              className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🎫</span>
              <span>Redeem 24-Hour Pass or School Voucher</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`p-4 mx-auto min-h-screen pb-24 text-white flex flex-col justify-between transition-all ${
      showCalculator && isCalculatorPermitted(currentUser?.class_tier || "UTME", currentQuestion?.topic || "Science")
        ? "max-w-5xl"
        : "max-w-md"
    }`}>
      {/* Top Header */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <BackButton fallbackHref="/student" label="Exit Arena" />
          
          {/* Exact Specific Grade Lock Selector */}
          <div className="flex items-center gap-1.5 bg-black/60 border border-emerald-500/30 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-emerald-300">
            <span>🎓 Class:</span>
            <select
              value={specificGrade}
              onChange={(e) => {
                const nextG = e.target.value;
                sfx.tap();
                setSpecificGrade(nextG);
                fetchTournamentPyramid(nextG);
                fetchNextGradeQuestion(nextG);
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <optgroup label="Primary Basic Education" className="bg-slate-900 text-white">
                <option value="Primary 1">Primary 1 Only</option>
                <option value="Primary 2">Primary 2 Only</option>
                <option value="Primary 3">Primary 3 Only</option>
                <option value="Primary 4">Primary 4 Only</option>
                <option value="Primary 5">Primary 5 Only</option>
                <option value="Primary 6">Primary 6 (NCEE) Only</option>
              </optgroup>
              <optgroup label="Junior Secondary" className="bg-slate-900 text-white">
                <option value="JSS 1">JSS 1 Only</option>
                <option value="JSS 2">JSS 2 Only</option>
                <option value="JSS 3">JSS 3 (BECE) Only</option>
              </optgroup>
              <optgroup label="Senior Secondary" className="bg-slate-900 text-white">
                <option value="SSS 1">SSS 1 Only</option>
                <option value="SSS 2">SSS 2 Only</option>
                <option value="SSS 3">SSS 3 (WAEC/UTME) Only</option>
              </optgroup>
              <optgroup label="Tertiary & Diaspora" className="bg-slate-900 text-white">
                <option value="100L">100L University Only</option>
              </optgroup>
            </select>
          </div>
        </div>
        <header className="flex justify-between items-center mb-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h1 className="font-display tracking-tight font-black text-xl text-white tracking-wide flex items-center gap-1.5">
              <Zap className="w-5 h-5 text-naija-gold fill-current" /> 
              <span>{specificGrade.toUpperCase()} SPRINT</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            <button
              onClick={() => {
                sfx.tap();
                setShowInstructions(true);
              }}
              className="px-2.5 py-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
              title="Official Competition Regulations"
            >
              <span>📜</span>
              <span>Rules</span>
            </button>
            {isCalculatorPermitted(currentUser?.class_tier || "UTME", currentQuestion?.topic || "Science") && (
              <button
                onClick={() => {
                  sfx.tap();
                  triggerTmaHaptic("light");
                  setShowCalculator(!showCalculator);
                }}
                className={`px-2.5 py-1 rounded-xl border font-bold flex items-center gap-1 cursor-pointer transition shadow-sm ${
                  showCalculator
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold"
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                }`}
                title="Toggle STEM Calculator"
              >
                <span>🧮</span>
                <span>{showCalculator ? "Hide Calc" : "Calc"}</span>
              </button>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              ● LIVE
            </span>
          </div>
        </header>

        {/* Competition Regulations Modal */}
        <ExamInstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          examType={activeTab === "LIVE_DUEL" ? "live_duel" : "national_competition"}
          title={`${specificGrade} Championship — ${activeTab === "LIVE_DUEL" ? "1v1 Live Duel" : "National Arena"}`}
          durationMinutes={3}
          questionCount={15}
          tier={specificGrade}
        />

        {/* 4-Tab Architecture: Solo Sprint, Co-op Squads, Live Duel, LGA Wars */}
        <div className="mb-4 grid grid-cols-4 gap-1.5 p-1 bg-black/60 rounded-2xl border border-white/10 text-xs font-bold">
          <button
            onClick={() => { sfx.tap(); setActiveTab("SOLO_SPRINT"); }}
            className={`py-2 px-1 rounded-xl text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
              activeTab === "SOLO_SPRINT"
                ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px]">Solo Sprint</span>
          </button>

          <button
            onClick={() => { sfx.tap(); setActiveTab("SQUAD_COOP"); }}
            className={`py-2 px-1 rounded-xl text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
              activeTab === "SQUAD_COOP"
                ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="text-[10px]">Co-Op Squad</span>
          </button>

          <button
            onClick={() => { sfx.tap(); setActiveTab("LIVE_DUEL"); }}
            className={`py-2 px-1 rounded-xl text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
              activeTab === "LIVE_DUEL"
                ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="text-[10px]">1v1 Duel</span>
          </button>

          <button
            onClick={() => { sfx.tap(); setActiveTab("LGA_WARS"); }}
            className={`py-2 px-1 rounded-xl text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
              activeTab === "LGA_WARS"
                ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="text-[10px]">774 LGA Wars</span>
          </button>
        </div>

        {/* Live Simulation Shortcuts Bar */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sfx.tap();
              setShowH2HModal(true);
              if (!h2hData) runHeadToHeadSimulation();
            }}
            className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Simulate Lagos vs Onitsha</span>
          </button>

          <button
            onClick={() => {
              sfx.tap();
              setShowMeshModal(true);
            }}
            className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>Test Offline Mesh Loss</span>
          </button>
        </div>

        {/* Tournament Pyramid Progression Selector (LGA -> State -> Zonal -> National) */}
        <div className="mb-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <Layers className="w-3.5 h-3.5" />
              Tournament Pyramid Tier
            </span>
            <span className="font-mono text-cyan-400">Cutoff: {currentStage.cutoff_mark}%</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 1, label: "1. LGA", sub: "774 Areas" },
              { id: 2, label: "2. State", sub: "36 + FCT" },
              { id: 3, label: "3. Zonal", sub: "6 Zones" },
              { id: 4, label: "4. National", sub: "Grand Finale" },
            ].map((stg) => (
              <button
                key={stg.id}
                onClick={() => {
                  sfx.tap();
                  setActiveStageId(stg.id);
                  triggerTmaHaptic("light");
                }}
                className={`p-2 rounded-xl text-center transition flex flex-col items-center justify-center ${
                  activeStageId === stg.id
                    ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span className="text-[11px] font-bold leading-tight">{stg.label}</span>
                <span className={`text-[9px] ${activeStageId === stg.id ? "text-slate-900 font-semibold" : "text-slate-400"}`}>
                  {stg.sub}
                </span>
              </button>
            ))}
          </div>

          {/* Active Stage Details Banner */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="truncate">
              <span className="text-white font-bold">{currentStage.stage_name}: </span>
              <span className="text-slate-400 text-[11px]">{currentStage.scope}</span>
            </div>
            <span className="text-emerald-400 font-mono text-[11px] font-bold shrink-0 ml-2">
              {currentStage.reward_pool.split("+")[0]}
            </span>
          </div>
        </div>

        {/* Live Active Candidates & Countdown */}
        <div className="flex justify-between items-center mb-3 text-xs font-semibold text-zinc-400">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <Users className="w-3.5 h-3.5 text-blue-400" /> 
            <span>{leaderboard.length > 0 ? `${leaderboard.length * 12} Scholars Competing` : "Connecting to room..."}</span>
          </span>
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 block uppercase">Remaining</span>
            <span className="text-xl font-mono font-black text-orange-400 tracking-wider">
              {formatCountdown(secondsLeft)}
            </span>
          </div>
        </div>

        {/* Top 3 Live Dynamic Podium Pedestals */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* 2nd Place */}
          <div className="glass-card rounded-2xl p-2.5 text-center border border-white/10 flex flex-col justify-between">
            <div className="w-7 h-7 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-xs mb-1">🥈</div>
            <div className="text-[11px] font-bold text-white truncate" title={secondPlace.full_name}>
              {secondPlace.full_name.split(" ")[0]}
            </div>
            <div className="text-[10px] font-mono text-zinc-400">{secondPlace.xp_points} pts</div>
          </div>

          {/* 1st Place */}
          <div className="glass-card rounded-2xl p-2.5 text-center border border-amber-400/50 bg-amber-500/10 shadow-[0_0_15px_rgba(255,215,0,0.2)] flex flex-col justify-between">
            <div className="w-7 h-7 mx-auto rounded-full bg-amber-400/20 flex items-center justify-center text-xs mb-1">👑</div>
            <div className="text-[11px] font-black text-white truncate" title={firstPlace.full_name}>
              {firstPlace.full_name.split(" ")[0]}
            </div>
            <div className="text-[10px] font-mono font-black text-naija-gold">{firstPlace.xp_points} pts</div>
            <div className="text-[8px] text-orange-400 font-bold flex items-center justify-center gap-0.5 mt-0.5">
              <Flame className="w-2.5 h-2.5 fill-current" /> Fire
            </div>
          </div>

          {/* 3rd Place / You */}
          <div className="glass-card rounded-2xl p-2.5 text-center border border-[#00E676]/60 bg-emerald-500/10 shadow-[0_0_15px_rgba(0,230,118,0.2)] flex flex-col justify-between">
            <div className="text-[8px] font-black text-[#00E676] uppercase">YOU 👉</div>
            <div className="w-7 h-7 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-xs my-0.5">🥉</div>
            <div className="text-[11px] font-black text-white truncate">{myDisplayName.split(" ")[0]}</div>
            {currentUser ? (
              <div className="text-[10px] font-mono font-black text-[#00E676]">{myScore} pts</div>
            ) : (
              <button
                onClick={() => {
                  sfx.tap();
                  window.dispatchEvent(new CustomEvent("edunaija_open_auth"));
                }}
                className="text-[9px] font-bold text-amber-300 underline cursor-pointer hover:text-white"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Live Activity Toast Ticker */}
        <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/20 mb-4 flex items-center justify-between text-xs">
          <span className="text-purple-300 font-medium truncate flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> {toastMsg}
          </span>
          <span className="text-[10px] text-[#00E676] font-bold ml-2 shrink-0">Live Feed</span>
        </div>

        {/* TAB 1: SOLO SPRINT & QUESTION ARENA */}
        {activeTab === "SOLO_SPRINT" && (
          <div className={`grid gap-4 items-start ${
            showCalculator && isCalculatorPermitted(currentUser?.class_tier || "UTME", currentQuestion?.topic || "Science")
              ? "grid-cols-1 md:grid-cols-12"
              : "grid-cols-1"
          }`}>

          {/* Left Column: Question Card */}
          <div className={`${
            showCalculator && isCalculatorPermitted(currentUser?.class_tier || "UTME", currentQuestion?.topic || "Science")
              ? "md:col-span-7"
              : "w-full"
          }`}>
            <div className="glass-card rounded-3xl p-5 mb-4 border border-white/10 relative overflow-hidden">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                <span>Q {questionIndex}/30 • {currentQuestion?.topic || "Physics Core"}</span>
                <span className="text-[#00E676] font-mono">+25 XP</span>
              </div>

              {loadingQuestion ? (
                <div className="py-12 text-center text-zinc-500 flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#00E676]" />
                  <span className="text-xs">Streaming next national sprint question...</span>
                </div>
              ) : (
                <>
                  <h2 className="text-sm sm:text-base font-bold text-white mb-5 leading-relaxed">
                    {currentQuestion?.question_text || currentQuestion?.text || "Evaluate the motion..."}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(() => {
                      const raw = currentQuestion?.options;
                      let optList: { letter: string; text: string }[] = [];
                      if (Array.isArray(raw)) {
                        optList = raw.map((t: any, idx: number) => ({
                          letter: String.fromCharCode(65 + idx),
                          text: String(t)
                        }));
                      } else if (raw && typeof raw === "object") {
                        optList = Object.entries(raw).map(([k, v]) => ({
                          letter: k.toUpperCase(),
                          text: String(v)
                        }));
                      } else if (currentQuestion?.option_a) {
                        optList = [
                          { letter: "A", text: String(currentQuestion.option_a) },
                          { letter: "B", text: String(currentQuestion.option_b) },
                          { letter: "C", text: String(currentQuestion.option_c) },
                          { letter: "D", text: String(currentQuestion.option_d) },
                        ];
                      }

                      return optList.map(({ letter, text: optText }) => {
                        const isCorrect = letter === (currentQuestion?.correct_option || "A").toUpperCase();
                        const isSelected = selected === letter;

                        let btnStyle = "glass-card border-white/5 text-zinc-200 hover:border-white/20";
                        if (answered) {
                          if (isCorrect) {
                            btnStyle = "bg-emerald-500/30 border-[#00E676] text-white shadow-[0_0_15px_#00E676]";
                          } else if (isSelected && !isCorrect) {
                            btnStyle = "bg-red-500/30 border-red-500 text-white";
                          }
                        } else if (isSelected) {
                          btnStyle = "bg-white/20 border-white text-white";
                        }

                        return (
                          <motion.button
                            key={letter}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSelect(letter)}
                            disabled={answered}
                            className={`p-3.5 rounded-2xl border font-bold text-xs sm:text-sm text-left transition-all flex items-start gap-2 ${btnStyle}`}
                          >
                            <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] shrink-0 font-mono">
                              {letter}
                            </span>
                            <span className="leading-tight">{optText}</span>
                          </motion.button>
                        );
                      });
                    })()}
                  </div>

                  <div className="mt-4 text-center text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5">
                    <Zap className="w-4 h-4 fill-current animate-bounce" />
                    <span>⚡ +5 speed bonus active — answer fast!</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Inline STEM Calculator Next to Question */}
          {showCalculator && isCalculatorPermitted(currentUser?.class_tier || "UTME", currentQuestion?.topic || "Science") && (
            <div className="md:col-span-5 w-full sticky top-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-2 px-1 text-xs font-mono font-bold text-emerald-400">
                <span>🧮 SPRINT CALC (STEM ONLY)</span>
                <span className="text-zinc-500 text-[10px]">NON-PROGRAMMABLE</span>
              </div>
              <ExamCalculator
                isOpen={true}
                inline={true}
                onClose={() => setShowCalculator(false)}
                mode="scientific"
              />
            </div>
          )}
        </div>
        )}

        {/* TAB 2: CO-OP STUDY SQUADS & BLOOD PACT */}
        {activeTab === "SQUAD_COOP" && (
          <StudySquadCard grade={specificGrade} />
        )}

        {/* TAB 3: 1v1 LIVE DUEL MATCHMAKING */}
        {activeTab === "LIVE_DUEL" && (
          <LiveDuelArena
            grade={specificGrade}
            userName={currentUser?.full_name || "Chisom (You)"}
            userState={currentUser?.state || "Anambra"}
            userLga={currentUser?.lga || "Ogbaru"}
          />
        )}

        {/* TAB 4: 774 LGA CLAN WARS & RIVALRIES */}
        {activeTab === "LGA_WARS" && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-black border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">774 LGA Clan Wars</h3>
                    <p className="text-[11px] text-zinc-400">Territorial academic rivalries with weekly VTU airtime rewards</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Season 4 Active
                </span>
              </div>

              {/* Rivalry Cards */}
              <div className="space-y-3 pt-2">
                {lgaRivalries.map((r: any) => (
                  <div key={r.matchup_id} className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-amber-400">{r.title}</span>
                      <span className="font-mono text-[10px] text-zinc-400">Ends in {r.time_remaining}</span>
                    </div>

                    {/* Split Scorebar */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-cyan-400">{r.lga_a.emblem} {r.lga_a.name}</span>
                          <span className="text-[9px] text-zinc-500">{r.lga_a.state}</span>
                        </div>
                        <div className="text-lg font-black font-mono text-white">{r.lga_a.score.toLocaleString()} XP</div>
                        <div className="text-[9px] text-zinc-400">{r.lga_a.scholars_active} active scholars</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-400">{r.lga_b.emblem} {r.lga_b.name}</span>
                          <span className="text-[9px] text-zinc-500">{r.lga_b.state}</span>
                        </div>
                        <div className="text-lg font-black font-mono text-white">{r.lga_b.score.toLocaleString()} XP</div>
                        <div className="text-[9px] text-zinc-400">{r.lga_b.scholars_active} active scholars</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                      <span className="text-zinc-400">Prize Pool: <strong className="text-white">{r.prize_pool}</strong></span>
                      <span className="text-emerald-400 font-bold">{r.leader}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Motivational Bottom Feedback */}
      <div className="text-center text-xs font-bold text-zinc-300 flex items-center justify-center gap-1.5 pt-2">
        <span>You are competing in <strong className="text-[#00E676]">{currentStage.stage_name}</strong> • Rank #{myRank}</span>
        <span>🔥</span>
      </div>

      {/* MODAL 1: LIVE HEAD-TO-HEAD LAGOS (IKEJA) VS ONITSHA SHOWDOWN */}
      {showH2HModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-cyan-500/40 p-6 shadow-2xl space-y-4 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Swords className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Live Inter-State Showdown Drill</h3>
                  <p className="text-[10px] text-cyan-400 font-mono">Lagos (Ikeja LGA) vs Anambra (Onitsha North LGA)</p>
                </div>
              </div>
              <button onClick={() => setShowH2HModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            {/* Live Head-to-Head Scoreboard */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-center space-y-1 p-2 rounded-xl bg-slate-900/60 border border-cyan-500/30">
                <div className="text-[10px] uppercase font-bold text-cyan-400">🇳🇬 Lagos State (Ikeja)</div>
                <div className="font-bold text-xs truncate">Ayomide F.</div>
                <div className="text-2xl font-black text-white font-mono">{h2hData ? h2hData.contestants.player_1.final_score : "289"}</div>
                <div className="text-[9px] text-slate-400">Latency: 18ms (NTP Synced)</div>
              </div>

              <div className="text-center space-y-1 p-2 rounded-xl bg-slate-900/60 border border-emerald-500/30">
                <div className="text-[10px] uppercase font-bold text-emerald-400">🇳🇬 Anambra State (Onitsha)</div>
                <div className="font-bold text-xs truncate">Chukwuemeka O.</div>
                <div className="text-2xl font-black text-white font-mono">{h2hData ? h2hData.contestants.player_2.final_score : "289"}</div>
                <div className="text-[9px] text-slate-400">Latency: 24ms (NTP Synced)</div>
              </div>
            </div>

            {/* Rounds List */}
            {h2hData && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">3 Verified Question Rounds (Atomic Sync):</div>
                {h2hData.rounds.map((r: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>Round {r.round_number}: {r.concept}</span>
                      <span className="text-emerald-400 font-mono">Key: {r.correct_option}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{r.question}</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-800/80 font-mono">
                      <div className="text-cyan-300">Ayomide: {r.player1_response.time_ms}ms ({r.player1_response.status})</div>
                      <div className="text-emerald-300">Chukwuemeka: {r.player2_response.time_ms}ms ({r.player2_response.status})</div>
                    </div>
                  </div>
                ))}

                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200">
                  🏆 <strong>Match Verdict:</strong> {h2hData.result.verdict}
                </div>
              </div>
            )}

            <button
              onClick={runHeadToHeadSimulation}
              disabled={h2hRunning}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Swords className="w-4 h-4" />
              <span>{h2hRunning ? "Running Real-Time Zonal Match..." : "Re-Run Head-to-Head Simulation"}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFLINE MESH EXAM OUTAGE & RECOVERY SIMULATOR */}
      {showMeshModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/40 p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  meshOutageState === "OUTAGE" ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                }`}>
                  {meshOutageState === "OUTAGE" ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Offline Mesh Outage & Auto-Recovery</h3>
                  <p className="text-[10px] text-amber-400 font-mono">Zero Data Loss SSS 3 Exam Simulator</p>
                </div>
              </div>
              <button onClick={() => setShowMeshModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Test what happens when a student in Nigeria experiences an abrupt telecommunications blackout during their official WASSCE / UTME exam:
            </p>

            {/* Outage State Card */}
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              meshOutageState === "OUTAGE"
                ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                : meshOutageState === "RECOVERED"
                ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                : "bg-slate-950 border-slate-800 text-slate-300"
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>Network Status:</span>
                <span className="font-mono uppercase">
                  {meshOutageState === "OUTAGE" ? "🔴 CARRIER OUTAGE (0.00 KB/s)" : meshOutageState === "RECOVERED" ? "🟢 RECONNECTED (22ms)" : "⚪ SIMULATION READY"}
                </span>
              </div>
              {meshData && (
                <div className="text-[11px] space-y-1 pt-1 border-t border-slate-800/80 font-mono">
                  <div>• Session: <strong>{meshData.exam_integrity_engine ? meshData.exam_integrity_engine.session_state : "SYNCHRONIZED"}</strong></div>
                  <div>• Queued Responses: <strong>{meshData.exam_integrity_engine ? meshData.exam_integrity_engine.buffered_answers_queued : meshData.recovery_sync_engine.synced_answers}</strong></div>
                  <div>• Integrity Seal: <strong>SHA-256 HMAC Verified</strong></div>
                  <div>• System Message: <span className="opacity-90">{meshData.user_experience.message || meshData.user_experience.toast}</span></div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => runMeshOutageSimulation("DISCONNECTED_OUTAGE")}
                disabled={meshRunning}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span>Simulate 100% Outage</span>
              </button>

              <button
                onClick={() => runMeshOutageSimulation("RECONNECTED_ONLINE")}
                disabled={meshRunning}
                className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Simulate Reconnection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


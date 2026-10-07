"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Lock, KeyRound, Zap, Flame, Trophy, BookOpen, ChevronRight, ChevronDown, ChevronUp,
  Sparkles, Users, Calendar, ArrowRight, FileCheck2, Radio, CheckCircle2,
  ExternalLink, RefreshCw, Bot, MapPin, Compass, GraduationCap, School,
  Brain, AlertTriangle, Play, SlidersHorizontal, Target
} from "lucide-react";
import HeartBar from "../../components/HeartBar";
import UserProfileModal from "../../components/UserProfileModal";
import ClassPromotionModal from "../../components/ClassPromotionModal";
import { DEMO_ACCOUNTS } from "../../components/DemoAccountSwitcher";
import SmartAmbientGreeting from "../../components/SmartAmbientGreeting";
import SmartResumeCard from "../../components/SmartResumeCard";
import VerifiableLearningHistoryModal from "../../components/VerifiableLearningHistoryModal";
import AddToCalendarModal from "../../components/AddToCalendarModal";
import InteractiveCampusMap from "../../components/InteractiveCampusMap";
import RoadToGradeAWidget from "../../components/RoadToGradeAWidget";
import PrimaryPupilMode from "../../components/PrimaryPupilMode";
import InteractiveGuideModal from "../../components/InteractiveGuideModal";
import ForensicCanvasWatermark from "../../components/ForensicCanvasWatermark";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [classTier, setClassTier] = useState<string>("UTME");
  const [academicTrack, setAcademicTrack] = useState<string>("SCIENCE");
  const [showdownCountdown, setShowdownCountdown] = useState({ days: 1, hours: 5, mins: 24, secs: 30 });
  const [showAdvancedRoadmap, setShowAdvancedRoadmap] = useState(false);
  const [showExtraTools, setShowExtraTools] = useState(false);

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isStudentGuideOpen, setIsStudentGuideOpen] = useState(false);
  const [targetPromotionTier, setTargetPromotionTier] = useState<string>("SSS");
  const [essentialTools, setEssentialTools] = useState<any[]>([]);
  const [extendedTools, setExtendedTools] = useState<any[]>([]);
  const [toolsLoading, setToolsLoading] = useState<boolean>(true);

  // Sync user state from localStorage and cross-component custom events
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("edunaija_user");
      let activeTier = "UTME";
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          const raw = parsed.class_tier || parsed.grade_level;
          if (raw) activeTier = String(raw).toUpperCase();
        } catch {}
      } else {
        const savedTier = localStorage.getItem("edunaija_class_tier") || localStorage.getItem("edunaija_academic_tier");
        if (savedTier) activeTier = String(savedTier).toUpperCase();
      }
      setClassTier(activeTier);
      localStorage.setItem("edunaija_class_tier", activeTier);

      const handleUserUpdated = (e: any) => {
        if (e.detail) {
          setUser(e.detail);
          const raw = e.detail.class_tier || e.detail.grade_level;
          if (raw) {
            const norm = String(raw).toUpperCase();
            setClassTier(norm);
            localStorage.setItem("edunaija_class_tier", norm);
          }
        }
      };

      window.addEventListener("edunaija_user_updated", handleUserUpdated);
      return () => {
        window.removeEventListener("edunaija_user_updated", handleUserUpdated);
      };
    }
  }, []);

  // Sunday Showdown Countdown Timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const nextSunday = new Date();
      const day = nextSunday.getDay();
      const daysUntilSunday = (7 - day) % 7;
      nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
      nextSunday.setHours(20, 0, 0, 0);

      const diff = Math.max(0, nextSunday.getTime() - now.getTime());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setShowdownCountdown({ days: d, hours: h, mins: m, secs: s });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Default offline/client fallback tools
  const DEFAULT_ESSENTIAL_TOOLS = [
    { id: "tool-cbt", title: "CBT Exam Engine", description: "Standard timed UTME/WAEC simulation with instant scoring", icon: "⚡", route: "/quiz", badge: "Live Practice", is_featured: true },
    { id: "tool-autopsy", title: "Question Autopsy", description: "Deep forensic post-mortem on questions and tricky traps", icon: "🔬", route: "/autopsy", badge: "AI Analysis", is_featured: true },
    { id: "tool-leaderboard", title: "Class Leaderboard", description: "Track your rank across 15 grades, states, and LGAs", icon: "🏆", route: "/leaderboard", badge: "Rankings", is_featured: true },
    { id: "tool-zero-data", title: "₦0 Data Vault", description: "Download study questions and read offline without internet", icon: "📶", route: "/zero-data", badge: "Offline", is_featured: true },
    { id: "tool-oral-eng", title: "Oral English Lab", description: "Pronunciation, stress patterns, and consonant clusters", icon: "🎙️", route: "/oral-english", badge: "Acoustic AI", is_featured: false },
    { id: "tool-syllabus", title: "Syllabus Tracker", description: "Official NERDC & JAMB curriculum breakdown by topic", icon: "📋", route: "/syllabus", badge: "Curriculum", is_featured: false },
    { id: "tool-literature", title: "Literature Theater", description: "Interactive audio narration of prescribed exam novels", icon: "📖", route: "/reader", badge: "Audiobooks", is_featured: false },
    { id: "tool-competition", title: "Sunday Showdown", description: "Live nationwide academic arena with ₦250k prize pool", icon: "⚔️", route: "/competition", badge: "Arena", is_featured: false },
  ];

  // Fetch cohort-isolated Essential Study Tools from database pipeline with client fallback
  useEffect(() => {
    let isMounted = true;
    const fetchTools = async () => {
      setToolsLoading(true);
      try {
        const tierParam = encodeURIComponent(classTier || "100L");
        const res = await fetch(`/api/backend/tools/essential?tier=${tierParam}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            const featured = data.featured_tools || [];
            const extended = data.extended_tools || [];
            if (featured.length > 0) {
              setEssentialTools(featured);
              setExtendedTools(extended);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Using offline essential tools fallback:", err);
      } finally {
        if (isMounted) {
          setEssentialTools(prev => prev.length > 0 ? prev : DEFAULT_ESSENTIAL_TOOLS.filter(t => t.is_featured));
          setExtendedTools(prev => prev.length > 0 ? prev : DEFAULT_ESSENTIAL_TOOLS.filter(t => !t.is_featured));
          setToolsLoading(false);
        }
      }
    };
    fetchTools();
    return () => { isMounted = false; };
  }, [classTier]);

  const isPrimary = classTier === "PRIMARY";
  const isJss = classTier === "JSS";
  const isSss = classTier === "SSS";
  const isFreshman = classTier === "FRESHMAN" || classTier === "100L" || classTier.includes("100L");

  const isGuest = !user;
  const displayName = user?.full_name || user?.fullName || (isFreshman ? "Damilola Adeleke" : isPrimary ? "Tobi Adeleke" : isJss ? "Fatima Bello" : isSss ? "Emeka Okafor" : "Chisom Jennifer");
  const targetUniText = user?.target_uni || (isFreshman ? "University of Lagos (UNILAG)" : isPrimary ? "King's College Lagos" : isJss ? "FGC Kano" : isSss ? "UNN Engineering" : "UNILAG Pre-Med");
  const targetCourseText = user?.target_course || (isFreshman ? "Computer Science (First Class Honours)" : isPrimary ? "Common Entrance 95% Target" : isJss ? "BECE 9 Distinctions" : isSss ? "WAEC 7 A1s Target" : "Medicine & Surgery (Cutoff: 280)");
  const targetScoreValue = user?.target_score || (isFreshman ? "4.92 CGPA" : isPrimary ? "194/200" : isJss ? "9 As" : isSss ? "7 A1s" : 294);
  const examTypeText = user?.exam_type || (isFreshman ? "100L Undergraduate (Semester 1)" : isPrimary ? "National Common Entrance (NCEE)" : isJss ? "BECE Junior WAEC" : isSss ? "WAEC / NECO SSCE" : "JAMB UTME 2026");

  const activatePersona = (key: string) => {
    sfx.tap();
    triggerTmaHaptic("medium");
    const demo = DEMO_ACCOUNTS.find(d => d.registration_key === key);
    if (!demo) return;
    const userPayload: any = {
      id: demo.id,
      registration_key: demo.registration_key,
      full_name: demo.name,
      phone: demo.phone,
      role: demo.role,
      state: "Lagos",
      exam_type: demo.badge,
      grade_level: demo.tier || "UTME",
      class_tier: demo.tier || "UTME",
      target_uni: demo.subTitle,
      target_course: demo.targetOrDetail,
      target_score: demo.tier === "100L" ? "4.92 CGPA" : demo.tier === "PRIMARY" ? "194/200" : 300,
      hearts: 20,
      xp_points: 15000,
      streak_days: 14
    };
    const effectiveTier = (demo.tier === "FRESHMAN" || demo.tier === "100L") ? "100L" : demo.tier;
    if (effectiveTier) {
      userPayload.grade_level = effectiveTier;
      userPayload.class_tier = effectiveTier;
      if (effectiveTier === "100L") {
        userPayload.faculty = "FACULTY_COMPUTING";
      }
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("edunaija_user", JSON.stringify(userPayload));
      localStorage.setItem("edunaija_user_key", demo.registration_key);
      if (effectiveTier) {
        localStorage.setItem("edunaija_class_tier", effectiveTier);
        localStorage.setItem("edunaija_academic_tier", effectiveTier);
        if (effectiveTier === "100L") {
          localStorage.setItem("edunaija_student_faculty", "FACULTY_COMPUTING");
        }
      }
      localStorage.setItem("edunaija_active_persona", "student");
      window.dispatchEvent(new CustomEvent("edunaija_user_updated", { detail: userPayload }));
    }
    setUser(userPayload);
    if (effectiveTier) setClassTier(effectiveTier);
  };

  // Subject tiles based on active track
  const getSubjectCards = () => {
    if (isPrimary) {
      return [
        { name: "Mathematics", icon: "📐", progress: 85, color: "emerald", topics: "Fractions & Decimals" },
        { name: "English Studies", icon: "📖", progress: 92, color: "blue", topics: "Grammar & Phonics" },
        { name: "Basic Science", icon: "🔬", progress: 78, color: "amber", topics: "Living Things & Energy" },
        { name: "National Values", icon: "🇳🇬", progress: 88, color: "teal", topics: "Civic Rights & Duties" }
      ];
    }
    if (isJss) {
      return [
        { name: "Mathematics", icon: "📐", progress: 74, color: "emerald", topics: "Linear Equations & Angles" },
        { name: "English Language", icon: "📖", progress: 82, color: "blue", topics: "Comprehension & Lexis" },
        { name: "Basic Science & Tech", icon: "⚡", progress: 69, color: "cyan", topics: "Simple Machines & Work" },
        { name: "Business Studies", icon: "💼", progress: 80, color: "amber", topics: "Office Practice & Bookkeeping" }
      ];
    }
    if (isFreshman) {
      return [
        { name: "GST 111 (Communication)", icon: "✍️", progress: 90, color: "emerald", topics: "Academic Writing & Phonetics" },
        { name: "GST 112 (Culture)", icon: "🌍", progress: 85, color: "teal", topics: "Nigerian Peoples & Culture" },
        { name: "GST 113 (Philosophy)", icon: "🧠", progress: 78, color: "purple", topics: "Logic & Critical Thinking" },
        { name: "Faculty Core Course", icon: "🎓", progress: 82, color: "blue", topics: "MTH 101 / CSC 101" }
      ];
    }
    // Default: UTME / SSS 3
    return [
      { name: "Use of English", icon: "📖", progress: 86, color: "blue", topics: "Lexis, Structure & Oral English" },
      { name: "Mathematics", icon: "📐", progress: 78, color: "emerald", topics: "Calculus & Trigonometry" },
      { name: "Physics", icon: "⚡", progress: 64, color: "cyan", topics: "Optics & Current Electricity" },
      { name: "Chemistry", icon: "🧪", progress: 58, color: "amber", topics: "Stoichiometry & Organic Chem" }
    ];
  };

  const subjectCards = getSubjectCards();

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto min-h-screen text-white font-sans space-y-6 pb-24">
      
      {/* 0. 100% Real-Time Ambient Location, Time & Weather Hub */}
      <SmartAmbientGreeting user={user} />

      {/* 1. Sleek Zen Header & Goal Bar (Rendered for Senior Scholars & Guests, not duplicated in Primary mode) */}
      {isGuest ? (
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950/60 via-zinc-900/80 to-black/90 border border-emerald-500/30 p-5 sm:p-7 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Guest / Preview Mode
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Sovereign Nigerian Education OS
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                Welcome to EduNaija Learning Cockpit 🚀
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                Personalized syllabus tracking, AI tutor diagnostics, and verifiable learning checkpoints are strictly tied to student identity. Sign in with your phone or select a 1-click Demo Persona below to activate your account.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  sfx.tap();
                  window.dispatchEvent(new CustomEvent("edunaija_open_auth"));
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-extrabold text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,230,118,0.4)] flex items-center gap-2 cursor-pointer"
              >
                <span>Sign In with Phone &amp; PIN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick 1-Click Persona Selector */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold mr-1">
              Select 1-Click Demo Persona:
            </span>
            <button
              onClick={() => activatePersona("DEMO-100L-2025")}
              className="px-3 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/30 text-[11px] font-bold text-purple-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>🎓 100L Undergraduate (Damilola)</span>
            </button>
            <button
              onClick={() => activatePersona("DEMO-UTME-2025")}
              className="px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>⚡ JAMB UTME (Chisom)</span>
            </button>
            <button
              onClick={() => activatePersona("DEMO-SSS-2025")}
              className="px-3 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/30 text-[11px] font-bold text-blue-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>🔬 SSS 2 Senior (Emeka)</span>
            </button>
            <button
              onClick={() => activatePersona("DEMO-JSS-2025")}
              className="px-3 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-[11px] font-bold text-cyan-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>📘 JSS 2 Junior (Fatima)</span>
            </button>
            <button
              onClick={() => activatePersona("DEMO-PRI-2025")}
              className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-[11px] font-bold text-amber-300 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>🎒 Primary 5 (Tobi)</span>
            </button>
          </div>
        </div>
      ) : !isPrimary ? (
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-zinc-900/60 to-black/80 border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30">
                {examTypeText}
              </span>
              <button
                onClick={() => {
                  sfx.tap();
                  setTargetPromotionTier(classTier);
                  setIsPromotionModalOpen(true);
                }}
                className="text-[10px] font-mono text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Switch Class / Track ({classTier})
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
              Welcome back, {displayName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300">
              Target: <strong className="text-white">{targetUniText}</strong> &bull; {targetCourseText} (Target: <span className="text-[#00E676] font-bold">{targetScoreValue}</span>)
            </p>
          </div>

          {/* Quick Streak & Hearts Widget */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xl">🔥</span>
              <div>
                <div className="text-xs font-black text-orange-400 leading-none">{user.streak_days || 7} Days</div>
                <div className="text-[9px] text-zinc-400 uppercase font-mono">Streak</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xl">❤️</span>
              <div>
                <div className="text-xs font-black text-rose-400 leading-none">{user.hearts ?? 10} / 10</div>
                <div className="text-[9px] text-zinc-400 uppercase font-mono">Hearts</div>
              </div>
            </div>

            <Link
              href="/quiz"
              onClick={() => sfx.tap()}
              className="px-4 py-2.5 rounded-2xl bg-[#00E676] hover:bg-[#00c864] text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(0,230,118,0.3)] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Practice Now</span>
            </Link>
          </div>
        </div>
      ) : null}

      {/* 2. Primary Pupil Safe Mode vs Senior Cockpit Hub */}
      {isPrimary ? (
        <PrimaryPupilMode
          user={user}
          onOpenGuide={() => setIsStudentGuideOpen(true)}
        />
      ) : (
        <>
          {/* Smart Resume Card - The One Primary Learning Action */}
          <SmartResumeCard user={user} />
        </>
      )}

      {/* 3. Core Subject Mastery Grid (Clean 4-Card Bento - Senior/Tertiary) */}
      {!isPrimary && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {isFreshman ? "My 100L University Courses" : "My Curriculum Subjects"} &bull; {classTier}
            </h2>
            <Link
              href="/curriculum"
              className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Full Syllabus</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {subjectCards.map((sub, idx) => (
            <Link
              key={idx}
              href={`/quiz?subject=${encodeURIComponent(sub.name)}&mode=subject_drill`}
              onClick={() => {
                sfx.tap();
                triggerTmaHaptic("light");
              }}
              className="p-4 rounded-3xl bg-zinc-900/60 border border-white/10 hover:border-emerald-500/40 transition-all hover:scale-[1.01] shadow-lg group cursor-pointer flex flex-col justify-between h-40"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{sub.icon}</span>
                  <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {sub.progress}% Mastery
                  </span>
                </div>
                <div className="font-display font-black text-sm text-white group-hover:text-emerald-300 transition-colors">
                  {sub.name}
                </div>
                <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                  {sub.topics}
                </div>
              </div>

              <div>
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#00E676] rounded-full"
                    style={{ width: `${sub.progress}%` }}
                  />
                </div>
                <div className="text-[11px] font-bold text-emerald-400 flex items-center justify-between">
                  <span>Start Topic Drill</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      )}

      {/* 4. Split Bento: Targeted AI Weakness Booster & Sunday Showdown Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left: Targeted AI Weakness Booster (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white/[0.03] border border-white/10 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-sm">
                🎯
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
                  Top Recommended Weak Spot Fix
                </div>
                <div className="text-sm font-display font-black text-white">
                  Organic Chemistry &bull; Alkanes &amp; Alcohols
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              +15 pts potential
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Our AI diagnostic identified that reviewing IUPAC nomenclature and alcohol functional groups will give you the highest score jump in your next mock.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/quiz?subject=Chemistry&topic=Organic%20Chemistry&mode=subject_drill"
              onClick={() => sfx.tap()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:brightness-110 flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>Fix This Gap (5-Minute Drill)</span>
            </Link>

            <button
              onClick={() => {
                sfx.tap();
                setShowAdvancedRoadmap(!showAdvancedRoadmap);
              }}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Brain className="w-3.5 h-3.5 text-emerald-400" />
              <span>{showAdvancedRoadmap ? "Hide Detailed Roadmap ▲" : "View Full 4-Stage Roadmap ▼"}</span>
            </button>
          </div>

          {/* Collapsible Deep Bloom 2-Sigma Trajectory */}
          <AnimatePresence>
            {showAdvancedRoadmap && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-white/10 overflow-hidden"
              >
                <RoadToGradeAWidget userKey={user?.registration_key || "DEMO-UTME-2025"} isGuestPreview={!user} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Sunday Showdown Challenge Card (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-amber-950/30 via-zinc-900/60 to-black/80 border border-amber-500/30 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1.5 animate-pulse font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> SUNDAY 8:00 PM WAT
            </span>
            <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> 14,820 Ready
            </span>
          </div>

          <div>
            <h3 className="font-display font-black text-base text-white">
              National Sunday Showdown Arena
            </h3>
            <p className="text-xs text-zinc-300 mt-0.5">
              Live timed battle royale across Nigeria. Top 10 win 500MB Data &amp; Verified Champion Badge.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "DAYS", value: showdownCountdown.days },
              { label: "HOURS", value: String(showdownCountdown.hours).padStart(2, "0") },
              { label: "MINS", value: String(showdownCountdown.mins).padStart(2, "0") },
              { label: "SECS", value: String(showdownCountdown.secs).padStart(2, "0") }
            ].map(box => (
              <div key={box.label} className="p-2 rounded-xl bg-black/60 border border-white/10">
                <div className="text-base font-mono font-black text-amber-300 leading-none">{box.value}</div>
                <div className="text-[8px] font-bold text-zinc-400 tracking-wider mt-1">{box.label}</div>
              </div>
            ))}
          </div>

          <Link
            href="/competition"
            onClick={() => sfx.tap()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
          >
            <span>Enter Live Arena</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* 5. Essential Study Tools Drawer (Cohort-Isolated Database Pipeline) */}
      <div className="rounded-3xl bg-zinc-900/40 border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="font-display font-black text-sm text-white">
              Essential Study Tools &amp; Resources
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">
              {classTier} Pipeline
            </span>
          </div>
          <button
            onClick={() => {
              sfx.tap();
              setShowExtraTools(!showExtraTools);
            }}
            className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{showExtraTools ? "Hide Extended Tools" : `Explore All ${essentialTools.length + extendedTools.length} Tools`}</span>
            {showExtraTools ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Dynamic 4 Clean Quick Tool Cards from DB */}
        {toolsLoading && essentialTools.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {essentialTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.route}
                onClick={() => sfx.tap()}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all text-left group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl group-hover:scale-110 transition-transform">{tool.icon}</span>
                    {tool.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-white/10 text-emerald-300 font-semibold border border-white/10">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {tool.title}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Expandable Extra Tools from DB */}
        <AnimatePresence>
          {showExtraTools && extendedTools.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {extendedTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.route}
                  onClick={() => sfx.tap()}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-sky-500/30 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg group-hover:scale-110 transition-transform">{tool.icon}</span>
                      {tool.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-white/10 text-sky-300 font-semibold border border-white/10">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                      {tool.title}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Modals */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUserUpdated={(updated) => setUser(updated)}
      />

      <ClassPromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        studentKey={user?.registration_key || "DEMO-UTME-2025"}
        currentTier={classTier}
        targetTier={targetPromotionTier}
        onPromotionSuccess={(newTier) => {
          setClassTier(newTier);
          if (typeof window !== "undefined") {
            localStorage.setItem("edunaija_class_tier", newTier);
            window.dispatchEvent(new CustomEvent("edunaija_user_updated", {
              detail: { ...(user || {}), class_tier: newTier }
            }));
          }
        }}
      />

      <VerifiableLearningHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        user={user}
      />

      <AddToCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
      />

      <InteractiveCampusMap
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      />

      <InteractiveGuideModal
        isOpen={isStudentGuideOpen}
        onClose={() => setIsStudentGuideOpen(false)}
        defaultPersona={isPrimary ? "PRIMARY" : "JAMB"}
      />

      {/* Steganographic forensic watermark during senior CBT preparation */}
      {!isPrimary && (
        <ForensicCanvasWatermark
          userKey={user?.registration_key || "SCHOLAR-DEMO"}
        />
      )}

    </main>
  );
}

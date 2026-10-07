"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, Flag, Clock, 
  HelpCircle, RefreshCw, Send, Zap, Award, Sparkles, BookOpen, 
  ExternalLink, BarChart2, Shield, Heart, Eye, Grid3X3, Volume2, 
  VolumeX, GraduationCap, ChevronDown
} from "lucide-react";
import confetti from "canvas-confetti";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";
import BionicReading from "../../components/BionicReading";
import GhostRacer from "../../components/GhostRacer";
import CBTLockdown from "../../components/CBTLockdown";
import ExamCalculator, { isCalculatorPermitted } from "../../components/ExamCalculator";
import { nigerianVoice, VoicePersona, VoiceLanguage } from "../../lib/nigerianVoice";

export interface Question {
  id: number;
  subject: string;
  exam_type: string;
  year: number;
  topic: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  correct_index: number;
  formula_latex?: string;
  explanation: string;
  wrong_analysis?: string;
  solution_formula_latex?: string;
  academic_track?: string;
  rubric_marking_scheme?: {
    method_marks?: number;
    accuracy_marks?: number;
    conceptual_marks?: number;
    key_concept?: string;
  };
}

const FALLBACK_QUESTIONS: Question[] = [
  {
    id: 1,
    subject: "GST 112 (Culture)",
    exam_type: "University 100L CCMAS",
    year: 2026,
    topic: "National Integration & Republic History",
    question_text: "Nigeria officially attained Republican status and replaced the British Monarch Queen Elizabeth II with a ceremonial President as Head of State on:",
    option_a: "October 1, 1963",
    option_b: "October 1, 1960",
    option_c: "January 15, 1966",
    option_d: "October 1, 1979",
    correct_option: "A",
    correct_index: 0,
    solution_formula_latex: "",
    explanation: "Nigeria attained Independence on Oct 1, 1960, but remained a constitutional monarchy. Republican status was declared on Oct 1, 1963 under the 1963 Constitution, replacing Queen Elizabeth II with Dr. Nnamdi Azikiwe as President.",
    wrong_analysis: "Option B is Independence Day. Option C is the first military coup. Option D is the Second Republic."
  }
];

type ExamMode = "diagnostic" | "micro_drill" | "speed_sprint" | "subject_drill" | "full_jamb" | "showdown";

const EXAM_MODE_CONFIG: Record<ExamMode, { name: string; durationSecs: number; count: number; badge: string }> = {
  diagnostic: { name: "Diagnostic Baseline", durationSecs: 480, count: 10, badge: "8 mins • 10 Qs" },
  micro_drill: { name: "Weak-Topic Micro Drill", durationSecs: 180, count: 5, badge: "3 mins • 5 Qs" },
  speed_sprint: { name: "Speed Sprint", durationSecs: 600, count: 15, badge: "10 mins • 15 Qs" },
  subject_drill: { name: "Subject CBT Drill", durationSecs: 2400, count: 40, badge: "40 mins • 40 Qs" },
  full_jamb: { name: "Full UTME Mock", durationSecs: 7200, count: 40, badge: "120 mins • Official" },
  showdown: { name: "National Showdown", durationSecs: 2700, count: 30, badge: "45 mins • Stand" },
};

export default function QuizPage() {
  const router = useRouter();
  const [examMode, setExamMode] = useState<ExamMode>("subject_drill");
  const [allQuestions, setAllQuestions] = useState<Question[]>(FALLBACK_QUESTIONS);
  const [loading, setLoading] = useState(true);
  
  // Student Cohort State
  const [currentTier, setCurrentTier] = useState<string>("100L");
  const [currentFaculty, setCurrentFaculty] = useState<string>("FACULTY_COMPUTING");
  const [curriculumCourses, setCurriculumCourses] = useState<Array<{ code: string; name: string; category?: string }>>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const isUniversity = currentTier === "100L" || currentTier === "FRESHMAN" || currentTier === "TERTIARY";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, { selectedIndex: number; isCorrect: boolean }>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(2400);
  const [streak, setStreak] = useState(0);
  const [enableBionic, setEnableBionic] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Real-time Student DB Metrics (Strictly for authenticated users)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userKey, setUserKey] = useState<string | null>(null);
  const [hearts, setHearts] = useState<number | null>(null);
  const [xp, setXp] = useState<number | null>(null);

  // Freemium Visitor Limit & Viral FOMO Paywall State
  const [guestAnsweredCount, setGuestAnsweredCount] = useState<number>(0);
  const [showVisitorPaywall, setShowVisitorPaywall] = useState<boolean>(false);

  // Socratic Mentor Brother Socratic state
  const [socraticExplanation, setSocraticExplanation] = useState<string | null>(null);
  const [loadingSocratic, setLoadingSocratic] = useState(false);
  const [socraticLang, setSocraticLang] = useState<"pidgin" | "standard">("pidgin");

  // Authentic Neural Nigerian Voice state
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [voicePersona, setVoicePersona] = useState<VoicePersona>("uncle_emeka");
  const [voiceLanguage, setVoiceLanguage] = useState<VoiceLanguage>("pidgin");
  const [activePressedKey, setActivePressedKey] = useState<string | null>(null);

  const [isParentBlocked, setIsParentBlocked] = useState(false);

  // 1. Detect student tier and faculty on load with live update listener & cohort auto-lock
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPersona = localStorage.getItem("edunaija_active_persona");
      const storedUser = localStorage.getItem("edunaija_user");
      let userRole = "";

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setCurrentUser(parsed);
          if (parsed.role) userRole = parsed.role.toLowerCase();
          const key = parsed.registration_key || parsed.registrationKey || localStorage.getItem("edunaija_user_key");
          if (key) {
            setUserKey(key);
            // Fetch live hearts & XP from backend ledger
            fetch(`/api/backend/api/points/hearts/status/${key}`)
              .then(r => r.json())
              .then(d => { if (d.hearts !== undefined) setHearts(d.hearts); else setHearts(20); })
              .catch(() => setHearts(20));

            fetch(`/api/backend/api/points/ledger/${key}`)
              .then(r => r.json())
              .then(d => { if (d.current_xp !== undefined) setXp(d.current_xp); else setXp(parsed.xp_points ?? 100); })
              .catch(() => setXp(parsed.xp_points ?? 100));
          } else {
            setHearts(20);
            setXp(parsed.xp_points ?? 100);
          }
        } catch {}
      } else {
        // Guest user: Unauthenticated, no points or hearts assigned
        setCurrentUser(null);
        setUserKey(null);
        setHearts(null);
        setXp(null);
      }

      if (savedPersona === "parent" || userRole === "parent") {
        setIsParentBlocked(true);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const sub = params.get("subject");
      const urlTier = params.get("tier");
      const modeParam = params.get("mode") as ExamMode | null;

      let detectedTier = "100L";
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.class_tier || parsed.grade_level) {
            detectedTier = parsed.class_tier || parsed.grade_level;
          }
        } catch {}
      } else {
        const storedTier = localStorage.getItem("edunaija_class_tier");
        if (storedTier) detectedTier = storedTier;
      }

      // Priority: URL tier > URL subject prefix > stored profile
      if (urlTier) {
        detectedTier = urlTier;
      } else if (sub) {
        const s = sub.toUpperCase();
        if (s.startsWith("GST") || s.startsWith("COS") || s.startsWith("MTH 101") || s.startsWith("PHY 101") || s.startsWith("100L")) {
          detectedTier = "100L";
        } else if (s.startsWith("PRIMARY")) {
          detectedTier = "PRIMARY";
        } else if (s.startsWith("BASIC")) {
          detectedTier = "JSS";
        }
      }

      const norm = (detectedTier === "FRESHMAN" || detectedTier === "TERTIARY") ? "100L" : detectedTier;
      setCurrentTier(norm);
      localStorage.setItem("edunaija_class_tier", norm);

      const storedFac = localStorage.getItem("edunaija_student_faculty");
      if (storedFac) setCurrentFaculty(storedFac);

      if (sub && sub !== "All") setSelectedSubject(sub);
      if (modeParam && EXAM_MODE_CONFIG[modeParam]) setExamMode(modeParam);

      const handleUserUpdated = (e: any) => {
        if (e.detail) {
          setCurrentUser(e.detail);
          const key = e.detail.registration_key || e.detail.registrationKey;
          setUserKey(key || null);
          if (e.detail.hearts !== undefined) setHearts(e.detail.hearts);
          if (e.detail.xp_points !== undefined) setXp(e.detail.xp_points);

          const t = e.detail.class_tier || e.detail.grade_level || "100L";
          const normalized = (t === "FRESHMAN" || t === "TERTIARY") ? "100L" : t;
          setCurrentTier(normalized);
          localStorage.setItem("edunaija_class_tier", normalized);
          if (e.detail.faculty) setCurrentFaculty(e.detail.faculty);
          loadTestPack(examMode, "All", normalized);
        } else {
          setCurrentUser(null);
          setUserKey(null);
          setHearts(null);
          setXp(null);
        }
      };
      window.addEventListener("edunaija_user_updated", handleUserUpdated);
      return () => window.removeEventListener("edunaija_user_updated", handleUserUpdated);
    }
  }, []);

  // 2. Fetch dynamic cohort curriculum courses
  useEffect(() => {
    const currUrl = `/api/backend/quiz/curriculum-courses?tier=${encodeURIComponent(currentTier)}&faculty=${encodeURIComponent(currentFaculty)}`;
    fetch(currUrl)
      .then(r => r.json())
      .then(d => {
        if (d.courses && d.courses.length > 0) {
          setCurriculumCourses(d.courses);
        }
      })
      .catch(() => {});
  }, [currentTier, currentFaculty]);

  // 3. Fetch questions matching current cohort & selected subject
  const loadTestPack = useCallback(async (mode: ExamMode, subject: string, tier: string) => {
    setLoading(true);
    const cfg = EXAM_MODE_CONFIG[mode];
    setTimeLeft(cfg.durationSecs);
    setAnswers({});
    setFlagged(new Set());
    setCurrentIndex(0);
    setSelectedOption(null);

    try {
      let endpoint = `/api/backend/quiz/questions?limit=${cfg.count}&class_tier=${encodeURIComponent(tier)}`;
      if (subject !== "All") endpoint += `&subject=${encodeURIComponent(subject)}`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setAllQuestions(data.questions);
          setLoading(false);
          return;
        }
      }
      throw new Error("Drill generation returned empty");
    } catch {
      // Fallback fetch scoped by cohort tier
      try {
        const fallbackRes = await fetch(`/api/backend/quiz/questions?limit=50&class_tier=${encodeURIComponent(tier)}`);
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          if (data.questions && data.questions.length > 0) {
            setAllQuestions(data.questions);
          }
        }
      } catch {}
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTestPack(examMode, selectedSubject, currentTier);
  }, [examMode, selectedSubject, currentTier, loadTestPack]);

  const filteredQuestions = useMemo(() => {
    if (selectedSubject === "All") return allQuestions;
    return allQuestions.filter(q => q.subject.toLowerCase().startsWith(selectedSubject.toLowerCase()));
  }, [allQuestions, selectedSubject]);

  const currentQ: Question = filteredQuestions[currentIndex] || filteredQuestions[0] || FALLBACK_QUESTIONS[0];

  // Stop voice and reset option selection when question index changes
  useEffect(() => {
    nigerianVoice.stop();
    setIsVoiceSpeaking(false);

    if (currentQ && answers[currentQ.id] !== undefined) {
      setSelectedOption(answers[currentQ.id].selectedIndex);
    } else {
      setSelectedOption(null);
    }
    setSocraticExplanation(null);
  }, [currentIndex, currentQ, answers]);

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Time Helper
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Handle Option Select
  const handleSelect = (idx: number) => {
    if (answers[currentQ.id] !== undefined) return;
    sfx.tap();
    triggerTmaHaptic("light");
    setSelectedOption(idx);
  };

  // Submit Answer & Pipe XP/Hearts to Backend
  const handleSubmit = async () => {
    if (selectedOption === null || answers[currentQ.id] !== undefined) return;

    // Strict Visitor Limit: Guests are only permitted 3 preview teaser questions
    if (!currentUser) {
      if (guestAnsweredCount >= 3) {
        setShowVisitorPaywall(true);
        return;
      }
      setGuestAnsweredCount(prev => {
        const next = prev + 1;
        if (next >= 3) {
          setTimeout(() => setShowVisitorPaywall(true), 1200);
        }
        return next;
      });
    }

    const isCorrect = selectedOption === currentQ.correct_index;
    const chosenLetter = ["A", "B", "C", "D"][selectedOption];

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: { selectedIndex: selectedOption, isCorrect }
    }));

    if (isCorrect) {
      sfx.correct();
      triggerTmaHaptic("medium");
      setStreak(s => s + 1);
      if (currentUser && userKey) {
        setXp(x => (x ?? 0) + 10);
      }
    } else {
      sfx.wrong();
      triggerTmaHaptic("heavy");
      setStreak(0);
      if (currentUser && userKey) {
        setHearts(h => Math.max(0, (h ?? 20) - 1));
      }
    }

    // Persist to backend database pipeline ONLY for registered/authenticated students
    if (currentUser && userKey) {
      try {
        await fetch("/api/backend/quiz/submit-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_key: userKey,
            question_id: currentQ.id,
            selected_option: chosenLetter,
            time_spent_secs: 15
          })
        });
      } catch {}
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      sfx.tap();
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      sfx.tap();
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleFlag = () => {
    sfx.tap();
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) next.delete(currentQ.id);
      else next.add(currentQ.id);
      return next;
    });
  };

  // Voice Narration
  const toggleVoice = () => {
    sfx.tap();
    if (isVoiceSpeaking) {
      nigerianVoice.stop();
      setIsVoiceSpeaking(false);
      return;
    }

    const isAnswered = answers[currentQ.id] !== undefined;
    const textToRead = isAnswered
      ? (voiceLanguage === "pidgin"
          ? `Oya listen: The question be: ${currentQ.question_text}. Correct option na ${currentQ.correct_option}. Explanation: ${currentQ.explanation}`
          : `Question ${currentIndex + 1}: ${currentQ.question_text}. The correct option is ${currentQ.correct_option}. Step by step solution: ${currentQ.explanation}`)
      : (voiceLanguage === "pidgin"
          ? `Question ${currentIndex + 1}: ${currentQ.question_text}. Option A: ${currentQ.option_a}. Option B: ${currentQ.option_b}. Option C: ${currentQ.option_c}. Option D: ${currentQ.option_d}. Wetin be your answer?`
          : `Question ${currentIndex + 1}: ${currentQ.question_text}. Option A: ${currentQ.option_a}. Option B: ${currentQ.option_b}. Option C: ${currentQ.option_c}. Option D: ${currentQ.option_d}.`);

    nigerianVoice.speak(textToRead, {
      persona: voicePersona,
      language: voiceLanguage,
      speed: "normal",
      onStart: () => setIsVoiceSpeaking(true),
      onEnd: () => setIsVoiceSpeaking(false),
      onError: () => setIsVoiceSpeaking(false)
    });
  };

  // Ask Socratic Mentor
  const askSocraticMentor = async () => {
    if (loadingSocratic) return;
    setLoadingSocratic(true);
    sfx.tap();

    const chosenLetters = ["A", "B", "C", "D"];
    const chosenLetter = selectedOption !== null ? chosenLetters[selectedOption] : "None";

    try {
      const res = await fetch("/api/backend/quiz/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: currentQ.question_text,
          selected_option: chosenLetter,
          correct_option: currentQ.correct_option,
          subject: currentQ.subject,
          mode: socraticLang
        })
      });
      const data = await res.json();
      setSocraticExplanation(data.explanation || "No explanation returned.");
    } catch {
      setSocraticExplanation("Step by step solution: " + currentQ.explanation);
    } finally {
      setLoadingSocratic(false);
    }
  };

  const currentAnswered = answers[currentQ.id];
  const isQuestionAnswered = currentAnswered !== undefined;

  // Build subject/courses list
  const subjectsList = useMemo(() => {
    const list = ["All"];
    if (curriculumCourses && curriculumCourses.length > 0) {
      curriculumCourses.forEach(c => {
        if (!list.includes(c.name)) list.push(c.name);
      });
    } else {
      // Fallback
      if (currentTier === "100L") {
        list.push("GST 111 (English)", "GST 112 (Culture)", "GST 113 (Philosophy)", "COS 101 (Computing)", "MTH 101 (Calculus & Algebra)", "PHY 101 (Mechanics)");
      } else if (currentTier === "PRIMARY") {
        list.push("English Studies (Primary)", "Mathematics (Primary)", "Basic Science & Technology", "National Values Education");
      } else {
        list.push("Mathematics", "Physics", "Chemistry", "English", "Biology", "Economics", "Government");
      }
    }
    return list;
  }, [curriculumCourses, currentTier]);

  if (isParentBlocked) {
    return (
      <div className="min-h-screen bg-[#06080F] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-purple-500/40 p-8 shadow-2xl space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30 text-3xl">
            🛡️
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Guardian Role Safeguard</h2>
            <p className="text-xs text-purple-300 font-mono mt-0.5">NDPA 2023 Child Data & Transcript Integrity Protection</p>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Parents and guardians do not take exams or sit for academic tests on EduNaija OS. Official assessments are strictly reserved for verified enrolled student accounts to maintain statutory grading validity and tournament rankings.
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-1.5 text-slate-400">
            <div className="text-white font-bold flex items-center gap-1.5">
              <span>👩🏾‍💼 Guardian Features Available:</span>
            </div>
            <div>• Real-time child learning telemetry & weak-point autopsy</div>
            <div>• Book 1-on-1 TRCN-vetted certified mentors</div>
            <div>• Manage tuition milestone escrow & weekly radar reports</div>
          </div>
          <button
            onClick={() => {
              sfx.tap();
              router.push("/parent");
            }}
            className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            <span>Return to Guardian Cockpit (/parent)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080F] text-white flex flex-col justify-between select-none">
      
      {/* 1. Proctored Security Header Strip */}
      <CBTLockdown 
        examTitle={`EduNaija CBT Cockpit — ${EXAM_MODE_CONFIG[examMode].name}`} 
        examType={examMode === "showdown" ? "national_competition" : "cbt_quiz"}
        durationMinutes={Math.round(EXAM_MODE_CONFIG[examMode].durationSecs / 60)}
        questionCount={EXAM_MODE_CONFIG[examMode].count}
        tier={currentTier}
        onInfractionLimitReached={() => {
          router.push("/autopsy");
        }}
      />

      {/* 2. Sleek Compact Navbar with Dynamic Curriculum Mapping */}
      <header className="bg-[#090C16]/95 border-b border-white/10 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0 backdrop-blur-md sticky top-0 z-30">
        
        {/* Left: Exit + Dynamic Course Picker & Tier Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/student")}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all border border-white/10"
            title="Exit to Cockpit"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Exit</span>
          </button>

          {/* Tier Switcher Quick Pill */}
          <div className="flex items-center bg-black/50 border border-white/10 rounded-xl px-2 py-1 text-[11px] font-mono font-bold text-emerald-400">
            <GraduationCap className="w-3.5 h-3.5 mr-1 text-[#00E676]" />
            <select
              value={isUniversity ? "100L" : currentTier}
              onChange={(e) => {
                sfx.tap();
                const newT = e.target.value;
                setCurrentTier(newT);
                localStorage.setItem("edunaija_class_tier", newT);
                setSelectedSubject("All");
                setCurrentIndex(0);
              }}
              className="bg-transparent text-emerald-300 focus:outline-none cursor-pointer"
            >
              <option value="100L" className="bg-slate-900 text-white">100L University</option>
              <option value="SSS" className="bg-slate-900 text-white">SSS 1–3 / UTME</option>
              <option value="JSS" className="bg-slate-900 text-white">JSS 1–3 (BECE)</option>
              <option value="PRIMARY" className="bg-slate-900 text-white">Primary 1–6</option>
            </select>
          </div>

          {/* Dynamic Subject / Course Dropdown */}
          <div className="flex items-center bg-black/60 border border-emerald-500/30 rounded-xl px-2 py-1 text-xs font-bold text-white">
            <select
              value={selectedSubject}
              onChange={(e) => {
                sfx.tap();
                setSelectedSubject(e.target.value);
                setCurrentIndex(0);
              }}
              className="bg-transparent text-white focus:outline-none cursor-pointer max-w-[170px] sm:max-w-[220px] truncate"
            >
              {subjectsList.map((sub) => (
                <option key={sub} value={sub} className="bg-slate-900 text-white">
                  {sub === "All" ? (isUniversity ? "All 100L Courses" : "All Subjects") : sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Question Counter & Timer */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { sfx.tap(); setShowPalette(true); }}
            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-zinc-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Grid3X3 className="w-3.5 h-3.5 text-[#00E676]" />
            <span>Q {currentIndex + 1} of {filteredQuestions.length}</span>
          </button>

          <div className={`px-2.5 py-1 rounded-xl font-mono text-xs font-bold border flex items-center gap-1.5 ${
            timeLeft < 300 
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse" 
              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}>
            <span>⏱️</span>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Right: Calculator (if permitted), Hearts & XP */}
        <div className="flex items-center gap-2">
          {/* STEM Calculator Trigger (STRICT: Prohibited for Primary or non-calculation subjects) */}
          {isCalculatorPermitted(currentTier, currentQ?.subject) && (
            <button
              onClick={() => {
                sfx.tap();
                triggerTmaHaptic("light");
                setShowCalculator(!showCalculator);
              }}
              className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm ${
                showCalculator
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              }`}
              title="Toggle STEM Calculator"
            >
              <span>🧮</span>
              <span className="hidden sm:inline">{showCalculator ? "Hide Calc" : "Calc"}</span>
            </button>
          )}

          {currentUser ? (
            <div className="flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded-xl border border-white/10 text-xs font-mono">
              <span className="flex items-center gap-1 text-rose-400 font-bold" title="Remaining Exam Hearts">
                <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
                {hearts ?? 0}
              </span>
              <span className="text-zinc-600">|</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold" title="Live Academic XP">
                <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                {xp ?? 0} XP
              </span>
            </div>
          ) : (
            <button
              onClick={() => {
                sfx.tap();
                window.dispatchEvent(new CustomEvent("edunaija_open_auth"));
              }}
              className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
              title="Sign in to save test scores, hearts, and earn XP"
            >
              <span>👤</span>
              <span>Sign In to Save XP</span>
            </button>
          )}
        </div>
      </header>

      {/* 3. Main Cockpit Container: Side-by-Side Split Grid when Calculator is active */}
      <main className={`flex-1 w-full mx-auto p-3 sm:p-5 flex flex-col justify-start space-y-4 ${
        showCalculator && isCalculatorPermitted(currentTier, currentQ?.subject)
          ? "max-w-7xl"
          : "max-w-4xl"
      }`}>
        
        {/* Dynamic Layout: Question Area + Inline Calculator Beside It */}
        <div className={`grid gap-4 items-start ${
          showCalculator && isCalculatorPermitted(currentTier, currentQ?.subject)
            ? "grid-cols-1 lg:grid-cols-12"
            : "grid-cols-1"
        }`}>

          {/* Left Column (or full width): Question Prompt + Options */}
          <div className={`space-y-4 ${
            showCalculator && isCalculatorPermitted(currentTier, currentQ?.subject)
              ? "lg:col-span-7"
              : "w-full"
          }`}>
            {/* COMPACT QUESTION PROMPT CARD */}
            <div className="bg-[#0B0E18] rounded-3xl border border-white/15 p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-4">
              
              {/* Metadata Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#00E676] border border-emerald-500/40 font-bold uppercase">
                    {currentQ.subject}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-400 truncate max-w-[220px] sm:max-w-sm">
                    {currentQ.topic}
                  </span>
                </div>

                {/* Quick Actions: Bionic Mode, Voice Trigger & Inline Calc Toggle */}
                <div className="flex items-center gap-2">
                  {isCalculatorPermitted(currentTier, currentQ?.subject) && (
                    <button
                      onClick={() => {
                        sfx.tap();
                        triggerTmaHaptic("light");
                        setShowCalculator(!showCalculator);
                      }}
                      className={`text-[10px] font-bold px-2 py-1 rounded-xl border transition-all flex items-center gap-1 cursor-pointer ${
                        showCalculator
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                      }`}
                      title="Toggle Calculator Next to Questions"
                    >
                      <span>🧮</span>
                      <span>{showCalculator ? "Hide Calc" : "Calc Beside"}</span>
                    </button>
                  )}

                  <button
                    onClick={() => { sfx.tap(); setEnableBionic(!enableBionic); }}
                    className={`text-[10px] font-bold px-2 py-1 rounded-xl border transition-all flex items-center gap-1 cursor-pointer ${
                      enableBionic
                        ? "bg-[#00E676]/20 text-[#00E676] border-[#00E676]/40"
                        : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
                    }`}
                    title="Saccadic Bionic Acceleration"
                  >
                    <Eye className="w-3 h-3 text-[#00E676]" />
                    <span>{enableBionic ? "Bionic ON" : "Bionic"}</span>
                  </button>

                  <button
                    onClick={toggleVoice}
                    className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
                      isVoiceSpeaking
                        ? "bg-rose-500 text-white animate-pulse"
                        : "bg-[#00E676] text-black font-extrabold hover:bg-emerald-400"
                    }`}
                  >
                    {isVoiceSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 fill-current" />}
                    <span>{isVoiceSpeaking ? "Stop Voice" : "Voice Read"}</span>
                  </button>
                </div>
              </div>

              {/* Question Text Prompt */}
              <div className="py-1">
                {enableBionic ? (
                  <BionicReading text={currentQ.question_text} />
                ) : (
                  <h2 className="text-base sm:text-lg font-semibold leading-relaxed text-zinc-100">
                    {currentQ.question_text}
                  </h2>
                )}

                {currentQ.formula_latex && (isQuestionAnswered || !currentQ.formula_latex.includes("=")) && (
                  <div className="mt-2.5 p-2 bg-black/50 rounded-xl border border-white/10 flex items-center justify-center text-emerald-300 text-sm overflow-x-auto">
                    <BlockMath math={currentQ.formula_latex} />
                  </div>
                )}
              </div>

              {/* Ghost Pacer Line */}
              <div className="pt-1">
                <GhostRacer 
                  currentQuestion={currentIndex + 1} 
                  totalQuestions={filteredQuestions.length} 
                  ghostQuestion={Math.min(filteredQuestions.length, currentIndex + 2)} 
                  examType={isUniversity ? "100L" : currentTier === "PRIMARY" ? "PRIMARY" : currentTier === "JSS" ? "BECE" : "UTME"}
                />
              </div>
            </div>

            {/* COMPACT ANSWER OPTIONS SECTION (Tight, Responsive, No Gaping Space) */}
            <div className="bg-[#0B0E18] rounded-3xl border border-white/15 p-4 sm:p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-zinc-400 uppercase font-mono tracking-wider">Select Correct Option:</span>
                <span className="text-[10px] font-mono text-zinc-500">Keys [A] [B] [C] [D] active</span>
              </div>

          {/* 4 Options Grid: 1 Col on Mobile, 2 Cols on Tablet/Desktop for Compact Height */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {[
              { id: 0, label: "A", text: currentQ.option_a },
              { id: 1, label: "B", text: currentQ.option_b },
              { id: 2, label: "C", text: currentQ.option_c },
              { id: 3, label: "D", text: currentQ.option_d },
            ].map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrectAnswer = opt.id === currentQ.correct_index;
              
              let btnClass = "bg-white/5 border-white/10 text-zinc-200 hover:border-emerald-500/40 hover:bg-white/10";

              if (isQuestionAnswered) {
                if (isCorrectAnswer) {
                  btnClass = "border-[#00E676] bg-emerald-500/20 text-white shadow-[0_0_15px_rgba(0,230,118,0.3)] font-bold";
                } else if (isSelected && !currentAnswered.isCorrect) {
                  btnClass = "border-rose-500 bg-rose-500/20 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]";
                }
              } else if (isSelected) {
                btnClass = "border-[#00E676] bg-[#00E676]/20 text-white shadow-[0_0_12px_rgba(0,230,118,0.25)] font-bold";
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  disabled={isQuestionAnswered}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-black shrink-0 transition-colors ${
                      isQuestionAnswered && isCorrectAnswer
                        ? "bg-[#00E676] text-black"
                        : isQuestionAnswered && isSelected && !currentAnswered.isCorrect
                        ? "bg-rose-500 text-white"
                        : isSelected
                        ? "bg-[#00E676] text-black"
                        : "bg-white/10 text-zinc-300"
                    }`}>
                      {opt.label}
                    </span>
                    <span className="text-xs sm:text-sm font-medium leading-snug">{opt.text}</span>
                  </div>

                  {isQuestionAnswered && isCorrectAnswer && (
                    <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
                  )}
                  {isQuestionAnswered && isSelected && !currentAnswered.isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Primary Action Button (Directly beneath options) */}
          <div className="pt-2">
            {!isQuestionAnswered ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,230,118,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{selectedOption !== null ? `✓ Confirm Option ${["A", "B", "C", "D"][selectedOption]}` : "Select an Option to Submit"}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentIndex === filteredQuestions.length - 1}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#00E676] to-teal-400 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,230,118,0.4)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              >
                <span>Next Question ({currentIndex + 1} of {filteredQuestions.length}) →</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* STEP-BY-STEP EXPLAINER & SOCRATIC MENTOR (Appears once answered) */}
        <AnimatePresence>
          {isQuestionAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-[#0B0E18] rounded-3xl border border-emerald-500/30 p-4 sm:p-5 shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className={`p-1 rounded-lg ${currentAnswered.isCorrect ? "bg-emerald-500/20 text-[#00E676]" : "bg-rose-500/20 text-rose-400"}`}>
                    <BookOpen className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-white font-mono uppercase">
                    {currentAnswered.isCorrect ? "Official Derivation & Solution" : "Diagnostic Solution & Trap Analysis"}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                  Correct Key: Option {currentQ.correct_option}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-black/40 p-3 rounded-2xl border border-white/5">
                {currentQ.explanation}
              </p>

              {/* Solution Formula Derivation if present */}
              {currentQ.solution_formula_latex && (
                <div className="p-2.5 bg-black/60 rounded-xl border border-white/10 text-emerald-300 overflow-x-auto text-xs sm:text-sm">
                  <BlockMath math={currentQ.solution_formula_latex} />
                </div>
              )}

              {/* Socratic Mentor Action */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-purple-300 font-bold flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Socratic Mentor (Broda Socratic)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSocraticLang("pidgin")}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold cursor-pointer ${socraticLang === "pidgin" ? "bg-purple-600 text-white" : "text-zinc-500"}`}
                  >
                    Pidgin
                  </button>
                  <button
                    onClick={() => setSocraticLang("standard")}
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold cursor-pointer ${socraticLang === "standard" ? "bg-purple-600 text-white" : "text-zinc-500"}`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={askSocraticMentor}
                    disabled={loadingSocratic}
                    className="px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/30 text-xs font-bold cursor-pointer transition-all"
                  >
                    {loadingSocratic ? "Analyzing..." : "Ask Broda Socratic"}
                  </button>
                </div>
              </div>

              {socraticExplanation && (
                <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs sm:text-sm text-purple-200 leading-relaxed">
                  {socraticExplanation}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
          </div>

          {/* Right Column: Inline STEM Calculator Next to Questions (Only if permitted and active) */}
          {showCalculator && isCalculatorPermitted(currentTier, currentQ?.subject) && (
            <div className="lg:col-span-5 w-full sticky top-20 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between pb-2 px-1">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>🧮</span>
                  <span>STEM WORKBENCH (DESKTOP / SPLIT)</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Synced with Q {currentIndex + 1}</span>
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

      </main>

      {/* 4. Bottom Sticky Navigation Controls Ribbon */}
      <footer className="bg-[#090C16]/95 border-t border-white/10 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md sticky bottom-0 z-30">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="text-xs text-zinc-400 hover:text-white font-bold px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> <span>Prev</span>
        </button>

        {/* Flag Button */}
        <button 
          onClick={toggleFlag} 
          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
            flagged.has(currentQ.id) 
              ? "text-amber-400 border-amber-500/40 bg-amber-500/10" 
              : "text-zinc-400 hover:text-amber-400 border-white/10 bg-white/5"
          }`}
        >
          <Flag className="w-3.5 h-3.5" /> <span>{flagged.has(currentQ.id) ? "Flagged" : "Flag"}</span>
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentIndex === filteredQuestions.length - 1}
          className="text-xs text-black font-bold px-4 py-1.5 rounded-xl bg-[#00E676] hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all shadow-md"
        >
          <span>Next</span> <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </footer>

      {/* FULL QUESTION PALETTE MODAL */}
      <AnimatePresence>
        {showPalette && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0D0D14] border border-white/15 rounded-3xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl text-white"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4 text-[#00E676]" />
                  <span>Question Navigation Grid</span>
                </h3>
                <button
                  onClick={() => setShowPalette(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 py-4 overflow-y-auto flex-1">
                {filteredQuestions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAns = answers[q.id] !== undefined;
                  const isFlag = flagged.has(q.id);

                  let btnStyle = "bg-white/5 border-white/10 text-zinc-400";
                  if (isCurrent) btnStyle = "border-[#00E676] text-[#00E676] font-bold bg-[#00E676]/15";
                  else if (isAns) btnStyle = "bg-emerald-500/20 text-[#00E676] border-emerald-500/40";
                  else if (isFlag) btnStyle = "bg-amber-500/20 text-amber-400 border-amber-500/40";

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        sfx.tap();
                        setCurrentIndex(idx);
                        setShowPalette(false);
                      }}
                      className={`h-10 rounded-xl border flex items-center justify-center text-xs font-mono font-bold cursor-pointer transition-all hover:scale-105 ${btnStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 24-HOUR VIRAL FOMO PAYWALL MODAL FOR VISITORS */}
      <AnimatePresence>
        {showVisitorPaywall && !currentUser && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#090C16] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center space-y-5"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-[#00E676]" />
              
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
                ⚡
              </div>

              <div>
                <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Daily Free Preview Limit Reached (3/3 Qs)
                </span>
                <h2 className="text-xl font-black text-white mt-2">
                  Unlock 24-Hour Unlimited CBT Pass
                </h2>
                <p className="text-xs text-zinc-300 mt-1">
                  You just experienced EduNaija OS speed drills! To continue practicing, preserve your study streak, and enter official state leaderboards, unlock your pass:
                </p>
              </div>

              {/* Pricing & Value Prop Cards */}
              <div className="space-y-2 text-left">
                <div className="p-3 rounded-2xl bg-black/60 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>🎟️</span> <span>24-Hour Sovereign Pass</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">Unlimited questions, AI tutor, voice reader</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-[#00E676] font-mono">₦500</div>
                    <div className="text-[9px] text-zinc-400">One-time 24h</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                      <span>👑</span> <span>Monthly Sovereign Pass</span>
                      <span className="text-[9px] px-1 rounded bg-emerald-500 text-black font-black">POPULAR</span>
                    </div>
                    <div className="text-[10px] text-zinc-300">All subjects, 774 LGA wars, full autopsy</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-[#00E676] font-mono">₦1,500</div>
                    <div className="text-[9px] text-zinc-400">30 days access</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    sfx.tap();
                    setShowVisitorPaywall(false);
                    window.dispatchEvent(new CustomEvent("edunaija_open_auth"));
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🔑</span>
                  <span>Register Free Account / Claim Pass</span>
                </button>

                <button
                  onClick={() => {
                    sfx.tap();
                    setShowVisitorPaywall(false);
                    window.dispatchEvent(new CustomEvent("edunaija_open_voucher"));
                  }}
                  className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🎫</span>
                  <span>Have a School Voucher? Redeem Now</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

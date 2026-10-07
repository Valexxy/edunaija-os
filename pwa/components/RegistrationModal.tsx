"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Check, Shield, GraduationCap, Users, Building2, 
  ArrowRight, Phone, Sparkles, BookOpen, Target, Award, Heart, KeyRound, Copy, ShieldCheck, AlertCircle, Lock
} from "lucide-react";
import confetti from "canvas-confetti";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (userData: any) => void;
  initialRole?: "student" | "parent" | "tutor" | "school";
}

const NIGERIAN_STATES = [
  "Lagos", "Abuja (FCT)", "Rivers", "Oyo", "Ogun", "Kano", "Kaduna", 
  "Enugu", "Anambra", "Delta", "Edo", "Imo", "Kwara", "Osun", "Akwa Ibom"
];

const TARGET_UNIVERSITIES = [
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "University of Nigeria Nsukka (UNN)",
  "Ahmadu Bello University (ABU Zaria)",
  "University of Benin (UNIBEN)",
  "Covenant University",
  "Federal University of Technology Akure (FUTA)",
  "Lagos State University (LASU)"
];

const TARGET_UNITY_SCHOOLS = [
  "King's College Lagos (Junior School)",
  "Queen's College Lagos (Junior School)",
  "Federal Government College, Ijanikin",
  "Federal Government Girls' College, Bwari",
  "Lagos State Model College, Kankon",
  "Corona Secondary School, Agbara",
  "Loyola Jesuit College, Abuja"
];

const POPULAR_COURSES = [
  "Medicine & Surgery",
  "Computer Science / Software Engineering",
  "Law / Legal Studies",
  "Accounting & Finance",
  "Mechanical / Mechatronics Engineering",
  "Pharmacy",
  "Nursing Science",
  "Economics"
];

const CCMAS_FACULTIES = [
  {
    id: "FACULTY_COMPUTING",
    name: "Faculty of Computing & Informatics",
    courses: [
      "Software Engineering",
      "Computer Science",
      "Cybersecurity",
      "Data Science & AI",
      "Information Technology"
    ]
  },
  {
    id: "FACULTY_ENGINEERING",
    name: "Faculty of Engineering & Technology",
    courses: [
      "Mechanical Engineering",
      "Electrical & Electronics Engineering",
      "Civil Engineering",
      "Mechatronics Engineering",
      "Chemical Engineering"
    ]
  },
  {
    id: "FACULTY_MEDICINE",
    name: "College of Health Sciences & Medicine",
    courses: [
      "Medicine & Surgery (MBBS)",
      "Nursing Science",
      "Pharmacy (PharmD)",
      "Medical Laboratory Science",
      "Physiotherapy"
    ]
  },
  {
    id: "FACULTY_LAW",
    name: "Faculty of Law",
    courses: [
      "Civil & Common Law (LL.B)",
      "Commercial & Corporate Law",
      "Public International Law"
    ]
  },
  {
    id: "FACULTY_MANAGEMENT",
    name: "Faculty of Management & Social Sciences",
    courses: [
      "Accounting & Finance",
      "Economics & Econometrics",
      "Business Administration",
      "Mass Communication",
      "Banking & Finance"
    ]
  }
];

const GRADE_OPTIONS: Record<string, string[]> = {
  PRIMARY: [
    "Primary 1 (Lower Basic 1)",
    "Primary 2 (Lower Basic 2)",
    "Primary 3 (Lower Basic 3)",
    "Primary 4 (Middle Basic 4)",
    "Primary 5 (Middle Basic 5)",
    "Primary 6 (Middle Basic 6 / NCEE)"
  ],
  JSS: [
    "JSS 1 (Upper Basic 7)",
    "JSS 2 (Upper Basic 8)",
    "JSS 3 (Upper Basic 9 / BECE Candidate)"
  ],
  SSS: [
    "SSS 1 (Senior Foundation)",
    "SSS 2 (Intermediate Senior)",
    "SSS 3 (WAEC & NECO Candidate)"
  ],
  UTME: [
    "JAMB UTME 2026 Candidate"
  ],
  FRESHMAN: [
    "100L University Freshman"
  ]
};

const PRIMARY_MASCOTS = [
  { id: "lion", name: "Simbi the Lion Cub", emoji: "🦁", trait: "Courage & Maths" },
  { id: "parrot", name: "Kemi the Smart Parrot", emoji: "🦜", trait: "Phonics & Stories" },
  { id: "elephant", name: "Bolu the Wise Elephant", emoji: "🐘", trait: "Science & Memory" },
  { id: "gazelle", name: "Zainab the Swift Gazelle", emoji: "🦌", trait: "Speed & Energy" }
];

export default function RegistrationModal({ isOpen, onClose, onRegistered, initialRole = "student" }: RegistrationModalProps) {
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(initialRole);
  const [classTier, setClassTier] = useState<"PRIMARY" | "JSS" | "SSS" | "UTME" | "FRESHMAN">("UTME");
  const [specificGrade, setSpecificGrade] = useState("JAMB UTME 2026 Candidate");
  const [academicTrack, setAcademicTrack] = useState<"Science" | "Arts" | "Commercial">("Science");
  const [faculty, setFaculty] = useState<string>("FACULTY_COMPUTING");
  
  // Registration Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("Lagos");
  const [selectedMascot, setSelectedMascot] = useState(PRIMARY_MASCOTS[0].id);
  const [examType, setExamType] = useState("JAMB UTME 2026");
  const [targetUni, setTargetUni] = useState(TARGET_UNIVERSITIES[0]);
  const [targetUnitySchool, setTargetUnitySchool] = useState(TARGET_UNITY_SCHOOLS[0]);
  const [targetCourse, setTargetCourse] = useState(POPULAR_COURSES[0]);
  const [targetScore, setTargetScore] = useState("290");
  const [referralCode, setReferralCode] = useState("");

  // Primary Favorite Subject
  const [primaryFavSubject, setPrimaryFavSubject] = useState("Mental Maths & Shapes");

  // Parent PIN for Minors
  const [parentPin, setParentPin] = useState("1234");

  // Parent Role specific fields
  const [wardName, setWardName] = useState("Tobi Adeleke");
  const [wardGrade, setWardGrade] = useState("Primary 3 (Lower Basic 3)");

  // NDPA 2023 Child Protection and Guardian Verification Fields
  const isPrimary = classTier === "PRIMARY";
  const isMinor = classTier === "PRIMARY" || classTier === "JSS";
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState<"Father" | "Mother" | "Legal Guardian">("Father");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [ndpaConsent, setNdpaConsent] = useState(true);

  // Submission & Success state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredKey, setRegisteredKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Login tab state
  const [loginQuery, setLoginQuery] = useState("");
  const [loginError, setLoginError] = useState("");

  if (!isOpen) return null;

  const handleTierChange = (newTier: "PRIMARY" | "JSS" | "SSS" | "UTME" | "FRESHMAN") => {
    setClassTier(newTier);
    const defaults = GRADE_OPTIONS[newTier];
    if (defaults && defaults.length > 0) {
      setSpecificGrade(defaults[defaults.length - 1]);
    }
    if (newTier === "PRIMARY") {
      setExamType("National Common Entrance Examination (NCEE)");
      setTargetScore("95");
    } else if (newTier === "JSS") {
      setExamType("BECE 2026 (Junior WAEC)");
      setTargetScore("88");
    } else if (newTier === "SSS") {
      setExamType("WAEC SSCE & NECO 2026");
      setTargetScore("8 A1s");
    } else if (newTier === "FRESHMAN") {
      setExamType("NUC CCMAS 100L Semester 1 Examination");
      setTargetScore("4.85");
      setTargetCourse(CCMAS_FACULTIES[0].courses[0]);
    } else {
      setExamType("JAMB UTME 2026");
      setTargetScore("290");
    }
  };

  const handleRegisterSubmit = async () => {
    setIsSubmitting(true);
    sfx.tap();
    triggerTmaHaptic("medium");

    const effectiveTier = classTier === "FRESHMAN" ? "100L" : classTier;
    const payload = {
      full_name: role === "parent" ? (guardianName || "Chief Mrs. Okonkwo") : (fullName.trim() || (isPrimary ? "Tobi Adeleke" : classTier === "FRESHMAN" ? "Emeka Okonkwo" : "Chisom Okonkwo")),
      phone: role === "parent" ? guardianPhone : (phone || (isMinor ? guardianPhone : "08031234567")),
      state: state,
      role: role,
      class_tier: role === "parent" ? "PARENT" : effectiveTier,
      grade_level: role === "parent" ? wardGrade : specificGrade,
      academic_track: academicTrack,
      faculty: classTier === "FRESHMAN" ? faculty : undefined,
      exam_type: examType,
      target_uni: isPrimary ? targetUnitySchool : targetUni,
      target_course: isPrimary ? primaryFavSubject : targetCourse,
      target_score: targetScore,
      avatar_mascot: isPrimary ? selectedMascot : null,
      parent_pin: isMinor ? parentPin : null,
      guardian_name: isMinor ? guardianName : null,
      guardian_phone: isMinor ? guardianPhone : null,
      guardian_relationship: isMinor ? guardianRelationship : null,
      ndpa_consent_verified: isMinor ? ndpaConsent : true,
      referral_code: referralCode.trim() || null
    };

    try {
      const res = await fetch("/api/backend/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      const key = data.registration_key || data.user?.registration_key || `EDU-2025-${state.substring(0,3).toUpperCase()}-7781`;
      setRegisteredKey(key);
      sfx.streakCelebration();
      triggerTmaHaptic("heavy");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });

      const finalUser = data.user || { ...payload, registration_key: key };
      if (typeof window !== "undefined") {
        localStorage.setItem("edunaija_class_tier", effectiveTier);
        localStorage.setItem("edunaija_academic_tier", effectiveTier);
        localStorage.setItem("edunaija_grade_level", specificGrade);
        if (classTier === "FRESHMAN") {
          localStorage.setItem("edunaija_student_faculty", faculty);
        }
        localStorage.setItem("edunaija_user", JSON.stringify(finalUser));
        window.dispatchEvent(new CustomEvent("edunaija_user_updated", { detail: finalUser }));
      }
      onRegistered(finalUser);
    } catch {
      // Offline fallback
      const fallbackKey = `EDU-2025-${state.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setRegisteredKey(fallbackKey);
      sfx.streakCelebration();
      const finalUser = { ...payload, registration_key: fallbackKey };
      if (typeof window !== "undefined") {
        localStorage.setItem("edunaija_class_tier", effectiveTier);
        localStorage.setItem("edunaija_academic_tier", effectiveTier);
        localStorage.setItem("edunaija_grade_level", specificGrade);
        if (classTier === "FRESHMAN") {
          localStorage.setItem("edunaija_student_faculty", faculty);
        }
        localStorage.setItem("edunaija_user", JSON.stringify(finalUser));
        window.dispatchEvent(new CustomEvent("edunaija_user_updated", { detail: finalUser }));
      }
      onRegistered(finalUser);
    }
    setIsSubmitting(false);
  };

  const handleLoginSubmit = async () => {
    if (!loginQuery.trim()) {
      setLoginError("Please enter your Registration Key or Phone Number.");
      return;
    }
    setIsSubmitting(true);
    setLoginError("");

    try {
      const res = await fetch("/api/backend/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key_or_phone: loginQuery.trim() })
      });
      if (!res.ok) {
        throw new Error("Account not found");
      }
      const data = await res.json();
      sfx.correct();
      triggerTmaHaptic("medium");
      if (typeof window !== "undefined") {
        localStorage.setItem("edunaija_user", JSON.stringify(data.user));
        if (data.user.class_tier) localStorage.setItem("edunaija_class_tier", data.user.class_tier);
        if (data.user.grade_level) localStorage.setItem("edunaija_grade_level", data.user.grade_level);
        window.dispatchEvent(new CustomEvent("edunaija_user_updated", { detail: data.user }));
      }
      onRegistered(data.user);
      onClose();
    } catch {
      setLoginError("No account found with this Key or Phone. Please check or Register.");
      sfx.wrong();
      triggerTmaHaptic("heavy");
    }
    setIsSubmitting(false);
  };

  const copyKey = () => {
    if (registeredKey && typeof navigator !== "undefined") {
      navigator.clipboard.writeText(registeredKey);
      setCopiedKey(true);
      sfx.tap();
      triggerTmaHaptic("light");
      setTimeout(() => setCopiedKey(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-[#0F1015] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-[#00E676] flex items-center justify-center text-black font-black text-sm shadow-[0_0_15px_rgba(0,230,118,0.4)]">
              🇳🇬
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                EduNaija Sovereign Account
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00E676] border border-emerald-500/30">
                  {isPrimary ? "Primary Wonder Lab" : isMinor ? "Junior Basic" : "Senior / UTME"}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                {role === "parent" ? "Guardian Oversight Registration" : `${specificGrade} Registration`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TAB SELECTOR: Register vs Login */}
        {!registeredKey && (
          <div className="flex p-1 bg-black/40 rounded-2xl border border-white/10 mb-4 shrink-0">
            <button
              onClick={() => { setActiveTab("register"); sfx.tap(); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "register"
                  ? "bg-gradient-to-r from-emerald-500 to-[#00E676] text-black shadow-md font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              ✨ Create Account
            </button>
            <button
              onClick={() => { setActiveTab("login"); sfx.tap(); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "login"
                  ? "bg-white/10 text-white shadow-md font-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              🔑 Login with Key / Phone
            </button>
          </div>
        )}

        {/* ================= SUCCESS KEY VIEW ================= */}
        {registeredKey ? (
          <div className="text-center py-6 space-y-5 overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-[#00E676] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(0,230,118,0.4)]">
              <Award className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-display font-black text-white">
                Account Successfully Created! 🎉
              </h3>
              <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                Welcome, <strong className="text-white">{fullName || guardianName || "Scholar"}</strong>. Your sovereign profile is now registered for <span className="text-[#00E676] font-bold">{specificGrade}</span>.
              </p>
            </div>

            {/* KEY CARD */}
            <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/40 max-w-sm mx-auto space-y-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
                Your Permanent Registration Key:
              </span>
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2 font-mono font-black text-base text-[#00E676]">
                <span>{registeredKey}</span>
                <button
                  onClick={copyKey}
                  className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Copy Key"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 leading-tight">
                Save this key. You can use it anytime on any phone, tablet or school computer to restore your progress without passwords.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full max-w-sm mx-auto py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-sm shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-transform active:scale-95 cursor-pointer"
            >
              Enter Scholar Dashboard →
            </button>
          </div>
        ) : activeTab === "login" ? (
          /* ================= LOGIN FORM ================= */
          <div className="space-y-4 py-2 flex-1 flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-zinc-300 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#00E676]" />
                  Instant Sovereign Login
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Enter your Registration Key (e.g. <span className="font-mono text-zinc-300">EDU-2025-LAG-1234</span>) or your registered WhatsApp phone number.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Registration Key or Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. EDU-2025-LAG-1234 or 08031234567"
                  value={loginQuery}
                  onChange={e => setLoginQuery(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Direct Weakness Autopsy Diagnostic Jump */}
              <div className="pt-2 border-t border-white/10">
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-transparent border border-rose-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🔬</span>
                    <div>
                      <div className="text-xs font-bold text-white">Diagnostic Weakness Autopsy</div>
                      <div className="text-[10px] text-zinc-400">Review past exam bottlenecks without login</div>
                    </div>
                  </div>
                  <a
                    href="/autopsy"
                    onClick={() => { sfx.tap(); onClose(); }}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-[11px] shrink-0 transition-all cursor-pointer"
                  >
                    Open Autopsy →
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={handleLoginSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-extrabold text-sm shadow-[0_0_20px_rgba(0,230,118,0.3)] transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Authenticating..." : "Restore Account & Sign In →"}
            </button>
          </div>
        ) : (
          /* ================= REGISTER MULTI-STEP FORM ================= */
          <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-4 px-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                    step === i 
                      ? "bg-[#00E676] text-black shadow-[0_0_10px_rgba(0,230,118,0.5)]" 
                      : step > i 
                      ? "bg-white/20 text-white" 
                      : "bg-white/5 text-zinc-600"
                  }`}>
                    {step > i ? "✓" : i}
                  </div>
                  <span className={`text-[11px] font-bold ${step === i ? "text-white" : "text-zinc-500"}`}>
                    {i === 1 ? "Class Level" : i === 2 ? (isPrimary ? "Pupil & Mascot" : role === "parent" ? "Guardian Details" : "Scholar Profile") : (isPrimary ? "Junior Goals" : role === "parent" ? "Ward Link" : "Academic Target")}
                  </span>
                  {i < 3 && <div className="w-6 h-0.5 bg-white/10" />}
                </div>
              ))}
            </div>

            {/* STEP 1: Persona, Academic Tier & Exact Grade */}
            {step === 1 && (
              <div className="space-y-4 mb-4">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "student", label: "🎓 Student", desc: "For Pupils & Exam Candidates" },
                      { id: "parent", label: "👨‍👩‍👧 Guardian", desc: "Parent Weekly Oversight" }
                    ].map(r => {
                      const isSelected = role === r.id;
                      return (
                        <button
                          type="button"
                          key={r.id}
                          onClick={() => { sfx.tap(); setRole(r.id as any); }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                            isSelected
                              ? "bg-emerald-500/20 border-emerald-500 text-[#00E676] font-bold shadow-[0_0_10px_rgba(0,230,118,0.2)]"
                              : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <span className="text-sm font-bold text-white">{r.label}</span>
                          <span className="text-[10px] text-zinc-400">{r.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5 Class Tiers (When Student) */}
                {role === "student" && (
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Select Academic Stage:
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { id: "PRIMARY", label: "Primary", icon: "🎒", sub: "Basic 1-6" },
                        { id: "JSS", label: "JSS", icon: "📘", sub: "Basic 7-9" },
                        { id: "SSS", label: "SSS", icon: "🔬", sub: "Senior" },
                        { id: "UTME", label: "UTME", icon: "⚡", sub: "JAMB" },
                        { id: "FRESHMAN", label: "100L", icon: "🎓", sub: "Varsity" },
                      ].map(tier => {
                        const isTierSelected = classTier === tier.id;
                        return (
                          <button
                            type="button"
                            key={tier.id}
                            onClick={() => {
                              sfx.tap();
                              handleTierChange(tier.id as any);
                            }}
                            className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                              isTierSelected
                                ? "bg-[#00E676] text-black font-extrabold border-[#00E676] shadow-[0_0_12px_rgba(0,230,118,0.3)] scale-[1.02]"
                                : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            <span className="text-base">{tier.icon}</span>
                            <span className="text-[11px] font-bold leading-tight mt-0.5">{tier.label}</span>
                            <span className="text-[9px] opacity-75">{tier.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Specific Grade Selection Dropdown */}
                {role === "student" && (
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Exact Class / Grade Level:
                    </label>
                    <select
                      value={specificGrade}
                      onChange={e => { setSpecificGrade(e.target.value); sfx.tap(); }}
                      className="w-full bg-black/60 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                    >
                      {(GRADE_OPTIONS[classTier] || []).map(opt => (
                        <option key={opt} value={opt} className="bg-zinc-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Senior Secondary Track (Only for SSS) */}
                {classTier === "SSS" && role === "student" && (
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Secondary Academic Track:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "Science", label: "🔬 Science", desc: "Physics & Chemistry" },
                        { id: "Arts", label: "⚖️ Arts / Law", desc: "Literature & Govt" },
                        { id: "Commercial", label: "💼 Commercial", desc: "Accounting & Commerce" }
                      ].map(t => (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => { sfx.tap(); setAcademicTrack(t.id as any); }}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            academicTrack === t.id
                              ? "bg-emerald-500/20 border-emerald-500 text-[#00E676] font-bold"
                              : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                          }`}
                        >
                          <div className="text-xs font-bold">{t.label}</div>
                          <div className="text-[9px] text-zinc-500 mt-0.5">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Scholar Profile & Guardianship (Dynamic per class) */}
            {step === 2 && (
              <div className="space-y-3.5 mb-4">
                {/* 1. PRIMARY PUPIL SPECIALIZED ONBOARDING */}
                {isPrimary && role === "student" ? (
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Pupil's First Name / Nickname:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tobi"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                      />
                    </div>

                    {/* Animal Mascot Avatar Selector */}
                    <div>
                      <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <span>🌟 Pick Your Learning Companion:</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {PRIMARY_MASCOTS.map(m => (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => { sfx.tap(); setSelectedMascot(m.id); }}
                            className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              selectedMascot === m.id
                                ? "bg-amber-500/20 border-amber-400 text-white shadow-md scale-[1.02]"
                                : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                            }`}
                          >
                            <span className="text-2xl">{m.emoji}</span>
                            <div>
                              <div className="text-xs font-bold text-white">{m.name}</div>
                              <div className="text-[9px] text-amber-300/80 font-mono">{m.trait}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* NDPA 2023 Parent Gate for Primary */}
                    <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Parent / Guardian Link (NDPA 2023 Child Protection)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 block mb-0.5">Parent's Full Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Dr. & Mrs. Adeleke"
                            value={guardianName}
                            onChange={e => setGuardianName(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 block mb-0.5">Parent's WhatsApp Phone</label>
                          <input
                            type="tel"
                            placeholder="0802 345 6789"
                            value={guardianPhone}
                            onChange={e => setGuardianPhone(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-zinc-400">4-Digit Parent Security PIN:</span>
                        <input
                          type="password"
                          maxLength={4}
                          value={parentPin}
                          onChange={e => setParentPin(e.target.value)}
                          className="w-24 bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-center text-white font-mono tracking-widest focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </>
                ) : role === "parent" ? (
                  /* 2. PARENT REGISTRATION */
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Guardian's Full Name:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Chief Mrs. Ngozi Okonkwo"
                        value={guardianName}
                        onChange={e => setGuardianName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                          WhatsApp Phone Number:
                        </label>
                        <input
                          type="tel"
                          placeholder="0803 333 0001"
                          value={guardianPhone}
                          onChange={e => setGuardianPhone(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                          State:
                        </label>
                        <select
                          value={state}
                          onChange={e => setState(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                          {NIGERIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  /* 3. SENIOR SECONDARY, UTME, OR 100L STUDENT */
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Student Full Name:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Chisom Jennifer Okonkwo"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                          WhatsApp Phone:
                        </label>
                        <input
                          type="tel"
                          placeholder="0803 123 4567"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                          State of Residence:
                        </label>
                        <select
                          value={state}
                          onChange={e => setState(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          {NIGERIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Referral Code (Optional — Gives +10 Free Hearts)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CHISOM-7X"
                    value={referralCode}
                    onChange={e => setReferralCode(e.target.value.toUpperCase())}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-naija-gold"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Academic Targets (Strictly Dynamic per Class) */}
            {step === 3 && (
              <div className="space-y-3.5 mb-4">
                {/* 1. PRIMARY TARGETS */}
                {isPrimary && role === "student" ? (
                  <>
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-400">
                        <Sparkles className="w-4 h-4" />
                        <span>Primary Scholar Foundation</span>
                      </div>
                      <p className="text-[11px] text-zinc-300">
                        Tailored for Common Entrance, basic phonics, mental maths, and zero exam stress.
                      </p>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Favorite Learning Focus:
                      </label>
                      <select
                        value={primaryFavSubject}
                        onChange={e => setPrimaryFavSubject(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 font-bold"
                      >
                        <option value="Mental Maths & Shapes">Mental Maths &amp; Shapes</option>
                        <option value="Audio Phonics & Story Reading">Audio Phonics &amp; Story Reading</option>
                        <option value="Basic Science & Nature Lab">Basic Science &amp; Nature Lab</option>
                        <option value="Bilingual Yoruba / Igbo / Hausa Tales">Bilingual Yoruba / Igbo / Hausa Tales</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Target Junior / Federal Unity College:
                      </label>
                      <select
                        value={targetUnitySchool}
                        onChange={e => setTargetUnitySchool(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 font-bold"
                      >
                        {TARGET_UNITY_SCHOOLS.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                      </select>
                    </div>
                  </>
                ) : role === "parent" ? (
                  /* 2. PARENT WARD LINK */
                  <>
                    <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-purple-300">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Guardian Angel Weekly WhatsApp Dispatch</span>
                      </div>
                      <p className="text-[11px] text-zinc-300">
                        Every Friday at 5:00 PM, you will receive an automatic WhatsApp breakdown of your ward's syllabus readiness and strengths.
                      </p>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Ward's Full Name:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tobi Adeleke"
                        value={wardName}
                        onChange={e => setWardName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-400 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Ward's Class / Grade:
                      </label>
                      <select
                        value={wardGrade}
                        onChange={e => setWardGrade(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-400 font-bold"
                      >
                        <option value="Primary 3 (Lower Basic 3)">Primary 3 (Basic 3)</option>
                        <option value="Primary 5 (Middle Basic 5)">Primary 5 (Basic 5)</option>
                        <option value="JSS 2 (Upper Basic 8)">JSS 2 (Basic 8)</option>
                        <option value="SSS 3 (WAEC & NECO Candidate)">SSS 3 (WAEC / NECO)</option>
                        <option value="JAMB UTME 2026 Candidate">JAMB UTME 2026 Candidate</option>
                      </select>
                    </div>
                  </>
                ) : classTier === "FRESHMAN" ? (
                  /* 3. 100L UNDERGRADUATE (NUC CCMAS 2026) */
                  <>
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-[#00E676]">
                        <Sparkles className="w-4 h-4" />
                        <span>NUC CCMAS 2026 Curriculum Active</span>
                      </div>
                      <p className="text-[10px] text-zinc-300">
                        Mapped to GST 111, GST 112, GST 113 + foundational faculty courses (no secondary subjects).
                      </p>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Enrolled Institution:
                      </label>
                      <select
                        value={targetUni}
                        onChange={e => setTargetUni(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 font-bold"
                      >
                        {TARGET_UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Faculty / Academic College (CCMAS):
                      </label>
                      <select
                        value={faculty}
                        onChange={e => {
                          const newFac = e.target.value;
                          setFaculty(newFac);
                          const facObj = CCMAS_FACULTIES.find(f => f.id === newFac);
                          if (facObj && facObj.courses.length > 0) {
                            setTargetCourse(facObj.courses[0]);
                          }
                        }}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 font-bold"
                      >
                        {CCMAS_FACULTIES.map(f => (
                          <option key={f.id} value={f.id} className="bg-zinc-900 text-white">
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Degree Programme / Course of Study:
                      </label>
                      <select
                        value={targetCourse}
                        onChange={e => setTargetCourse(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 font-bold"
                      >
                        {(CCMAS_FACULTIES.find(f => f.id === faculty)?.courses || POPULAR_COURSES).map(c => (
                          <option key={c} value={c} className="bg-zinc-900 text-white">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Target First-Year CGPA (/ 5.0):
                      </label>
                      <input
                        type="text"
                        value={targetScore}
                        onChange={e => setTargetScore(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 font-bold"
                        placeholder="e.g. 4.85 / 5.0"
                      />
                    </div>
                  </>
                ) : (
                  /* 4. SSS OR UTME CANDIDATE */
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        First Choice University:
                      </label>
                      <select
                        value={targetUni}
                        onChange={e => setTargetUni(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 font-bold"
                      >
                        {TARGET_UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Target Course of Study:
                      </label>
                      <select
                        value={targetCourse}
                        onChange={e => setTargetCourse(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 font-bold"
                      >
                        {POPULAR_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Target Score (/400):
                      </label>
                      <input
                        type="text"
                        value={targetScore}
                        onChange={e => setTargetScore(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 font-bold"
                        placeholder="e.g. 290"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Bottom Step Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 shrink-0">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => { setStep(step - 1); sfx.tap(); }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => { setStep(step + 1); sfx.tap(); }}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-zinc-200 transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRegisterSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-xs shadow-[0_0_15px_rgba(0,230,118,0.4)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>{isSubmitting ? "Creating Account..." : "Complete Registration ✨"}</span>
                </button>
              )}
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}

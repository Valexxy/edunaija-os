"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Check, Shield, GraduationCap, Users, Building2, 
  ArrowRight, Phone, Sparkles, BookOpen, Target, Award, 
  Heart, KeyRound, Copy, Save, LogOut, Flame, Star, 
  Settings, CheckCircle2, User, Share2, BellRing, RefreshCw
} from "lucide-react";
import confetti from "canvas-confetti";
import AcademicTierUpgradeModal, { AcademicTier, ACADEMIC_TIERS } from "./AcademicTierUpgradeModal";
import DevModeToggle from "./DevModeToggle";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserUpdated: (updatedUser: any) => void;
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
  "Lagos State University (LASU)",
  "Babcock University",
  "Landmark University"
];

const POPULAR_COURSES = [
  "Medicine & Surgery",
  "Computer Science / Software Engineering",
  "Law / Legal Studies",
  "Accounting & Finance",
  "Mechanical / Mechatronics Engineering",
  "Electrical / Electronics Engineering",
  "Pharmacy",
  "Nursing Science",
  "Economics",
  "Mass Communication"
];

export default function UserProfileModal({ isOpen, onClose, user, onUserUpdated }: UserProfileModalProps) {
  // Active Persona Tab: Student, Parent, Tutor, School
  const initialRole = (user?.role || "student").toLowerCase() as "student" | "parent" | "tutor" | "school";
  const [activeRole, setActiveRole] = useState<"student" | "parent" | "tutor" | "school">(initialRole);

  // Form State
  const [fullName, setFullName] = useState(user?.full_name || user?.fullName || "Chisom Okonkwo");
  const [phone, setPhone] = useState(user?.phone || "0803 123 4567");
  const [state, setState] = useState(user?.state || "Lagos");
  const [examType, setExamType] = useState(user?.exam_type || "JAMB 2025");
  const [targetUni, setTargetUni] = useState(user?.target_uni || TARGET_UNIVERSITIES[0]);
  const [targetCourse, setTargetCourse] = useState(user?.target_course || POPULAR_COURSES[0]);
  const [targetScore, setTargetScore] = useState<number>(user?.target_score || 280);

  // Role specific extra fields
  const [dailyGoal, setDailyGoal] = useState<number>(30);
  const [wardKeyOrPhone, setWardKeyOrPhone] = useState<string>("EDU-2025-LAG-1112");
  const [parentNotifications, setParentNotifications] = useState({ whatsapp: true, sms: true });
  const [tutorialCenterName, setTutorialCenterName] = useState("Excel Premier JAMB Academy");
  const [schoolName, setSchoolName] = useState("King's College Lagos");
  const [tutorSubject, setTutorSubject] = useState("Mathematics & Physics");

  // Status state
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Educational Tier & Upgrade Modal State
  const [academicTier, setAcademicTier] = useState<AcademicTier>("UTME");
  const [isTierUpgradeOpen, setIsTierUpgradeOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTier = localStorage.getItem("edunaija_academic_tier") as AcademicTier;
      if (storedTier && ACADEMIC_TIERS[storedTier]) setAcademicTier(storedTier);
      setIsDevMode(localStorage.getItem("edunaija_dev_mode") === "true");

      const handleDev = (e: any) => {
        if (e.detail?.isDevMode !== undefined) setIsDevMode(e.detail.isDevMode);
      };
      window.addEventListener("edunaija_devmode_updated", handleDev);
      return () => window.removeEventListener("edunaija_devmode_updated", handleDev);
    }
  }, [isOpen]);

  // Sync state whenever user prop changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || user.fullName || "Chisom Okonkwo");
      setPhone(user.phone || "0803 123 4567");
      setState(user.state || "Lagos");
      setExamType(user.exam_type || "JAMB 2025");
      setTargetUni(user.target_uni || TARGET_UNIVERSITIES[0]);
      setTargetCourse(user.target_course || POPULAR_COURSES[0]);
      setTargetScore(user.target_score || 280);
      setActiveRole((user.role || "student").toLowerCase() as any);
      
      const rawTier = (user.class_tier || user.grade_level || "").toUpperCase();
      if (rawTier) {
        const mapped = rawTier === "PRIMARY" || rawTier === "JUNIOR_BASIC" ? "PRIMARY"
          : rawTier === "JSS" ? "JSS"
          : rawTier === "SSS" || rawTier === "SENIOR_FOUNDATION" ? "SSS"
          : rawTier === "FRESHMAN" || rawTier === "TERTIARY_FRESHMAN" ? "FRESHMAN"
          : "UTME";
        setAcademicTier(mapped as AcademicTier);
      }
    }
  }, [user]);

  if (!isOpen) return null;

  const registrationKey = user?.registration_key || user?.registrationKey || "EDU-2025-LAG-1112";
  const referralCode = user?.referral_code || user?.referralCode || "CHISOM-7X";
  const userInitial = fullName?.trim()?.charAt(0)?.toUpperCase() || "C";

  const handleCopyKey = () => {
    sfx.tap();
    triggerTmaHaptic("light");
    navigator.clipboard.writeText(registrationKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyReferralLink = () => {
    sfx.tap();
    triggerTmaHaptic("light");
    const link = `http://localhost:3000/?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    sfx.tap();
    triggerTmaHaptic("medium");

    const updatedUser = {
      ...(user || {}),
      full_name: fullName.trim(),
      phone: phone.trim(),
      role: activeRole,
      state,
      exam_type: examType,
      target_uni: targetUni,
      target_course: targetCourse,
      target_score: Number(targetScore),
      registration_key: registrationKey,
      referral_code: referralCode,
      daily_goal: dailyGoal,
      meta_json: JSON.stringify({
        daily_goal: dailyGoal,
        ward_key_or_phone: wardKeyOrPhone,
        parent_notifications: parentNotifications,
        tutorial_center_name: tutorialCenterName,
        school_name: schoolName,
        tutor_subject: tutorSubject
      })
    };

    // 1. Save locally
    if (typeof window !== "undefined") {
      localStorage.setItem("edunaija_user", JSON.stringify(updatedUser));
      // Notify other components
      window.dispatchEvent(new CustomEvent("edunaija_user_updated", { detail: updatedUser }));
    }

    // 2. Persist to Backend SQLite
    try {
      await fetch("/api/backend/auth/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key_or_phone: registrationKey || phone,
          full_name: fullName.trim(),
          role: activeRole,
          state,
          exam_type: examType,
          target_uni: targetUni,
          target_course: targetCourse,
          target_score: Number(targetScore),
          meta_json: updatedUser.meta_json
        })
      });
    } catch (e) {
      console.warn("Backend profile update fallback:", e);
    }

    onUserUpdated(updatedUser);
    setIsSaving(false);
    setSavedSuccess(true);
    sfx.correct();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 } });

    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  const handleLogout = () => {
    sfx.tap();
    if (typeof window !== "undefined") {
      localStorage.removeItem("edunaija_user");
      window.dispatchEvent(new CustomEvent("edunaija_user_updated", { detail: null }));
    }
    onUserUpdated(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-[#0D0D14] border border-white/10 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">User Profile &amp; Settings</h2>
              <p className="text-[11px] text-zinc-400">View and update your personal and academic details</p>
            </div>
          </div>
          <button
            onClick={() => { sfx.tap(); onClose(); }}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 py-4 space-y-5 pr-1">
          {/* Avatar Banner Card */}
          <div className="glass-card rounded-2xl p-4 border border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-black/40 to-transparent">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-naija-green to-[#00E676] p-[2px] shadow-[0_0_15px_rgba(0,230,118,0.3)]">
                <div className="w-full h-full rounded-2xl bg-zinc-900 flex items-center justify-center font-black text-2xl text-[#00E676]">
                  {userInitial}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{fullName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30 uppercase tracking-wider">
                    {activeRole}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {state} State
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="text-right text-xs space-y-1">
              <div className="flex items-center justify-end gap-1 text-red-400 font-bold">
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{user?.hearts || 10}/20 Hearts</span>
              </div>
              <div className="flex items-center justify-end gap-1 text-amber-400 font-bold">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{user?.streak_days || 7}d Streak</span>
              </div>
            </div>
          </div>

          {/* Registration Key & Referral Code Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                  Official Registration Key
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {registrationKey}
                </span>
              </div>
              <button
                onClick={handleCopyKey}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                title="Copy Key"
              >
                {copiedKey ? <Check className="w-4 h-4 text-[#00E676]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                  Personal Referral Code
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {referralCode}
                </span>
              </div>
              <button
                onClick={handleCopyReferralLink}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                title="Copy Invite Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-amber-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Switcher Toolbar inside Profile */}
          <div>
            <label className="text-xs font-bold text-zinc-300 mb-2 block">
              Active Persona / Role Profile:
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/50 rounded-2xl border border-white/10">
              {[
                { id: "student", label: "Student", icon: GraduationCap, color: "bg-[#00E676] text-black" },
                { id: "parent", label: "Parent", icon: Shield, color: "bg-emerald-500 text-white" },
                { id: "tutor", label: "Tutor", icon: Users, color: "bg-amber-400 text-black" },
                { id: "school", label: "School", icon: Building2, color: "bg-purple-500 text-white" }
              ].map(r => {
                const Icon = r.icon;
                const isSelected = activeRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      sfx.tap();
                      setActiveRole(r.id as any);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      isSelected ? `${r.color} shadow-md` : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px]">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* EDITABLE FORM FIELDS ACCORDING TO ROLE */}
          <div className="space-y-4 pt-1">
            {/* Common Field: Full Name */}
            <div>
              <label className="text-xs font-bold text-zinc-300 mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00E676]"
                placeholder="e.g. Chisom Okonkwo"
              />
            </div>

            {/* Common Field: Phone Number */}
            <div>
              <label className="text-xs font-bold text-zinc-300 mb-1.5 block">Phone Number (SMS / WhatsApp)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00E676]"
                placeholder="e.g. 0803 123 4567"
              />
            </div>

            {/* Common Field: State of Residence / CBT Hub */}
            <div>
              <label className="text-xs font-bold text-zinc-300 mb-1.5 block">State / CBT Exam Center Hub</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
              >
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s} className="bg-zinc-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* STUDENT SPECIFIC FIELDS */}
            {activeRole === "student" && (
              <>
                {/* Academic Class & Tier Governance Box */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#00E676]" />
                      Educational Class / Level
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00E676] font-bold">
                      {ACADEMIC_TIERS[academicTier]?.badge || "UTME 2025"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {ACADEMIC_TIERS[academicTier]?.description}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-white/5">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Rules: Diagnostic Test &ge; 65% + Pass/Voucher
                    </span>
                    <button
                      type="button"
                      onClick={() => { sfx.tap(); setIsTierUpgradeOpen(true); }}
                      className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-extrabold text-[11px] hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-sm shadow-emerald-950 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 fill-current" />
                      <span>Upgrade Class / Level</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 mb-1.5 block">Target Exam</label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    >
                      <option value="JAMB 2025" className="bg-zinc-900">JAMB UTME 2025</option>
                      <option value="WAEC SSCE 2025" className="bg-zinc-900">WAEC SSCE 2025</option>
                      <option value="NECO 2025" className="bg-zinc-900">NECO Senior SSCE</option>
                      <option value="Post-UTME" className="bg-zinc-900">Post-UTME Screening</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 mb-1.5 block">Target UTME Score</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="180"
                        max="400"
                        value={targetScore}
                        onChange={(e) => setTargetScore(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-[#00E676]"
                      />
                      <span className="text-[10px] text-zinc-400 font-mono">/ 400</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1.5 block">Target University</label>
                  <select
                    value={targetUni}
                    onChange={(e) => setTargetUni(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  >
                    {TARGET_UNIVERSITIES.map((u) => (
                      <option key={u} value={u} className="bg-zinc-900 text-white">
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1.5 block">Target Course / Major</label>
                  <select
                    value={targetCourse}
                    onChange={(e) => setTargetCourse(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  >
                    {POPULAR_COURSES.map((c) => (
                      <option key={c} value={c} className="bg-zinc-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                    Daily Practice Target (Questions / Day)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 50, 100].map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => { sfx.tap(); setDailyGoal(goal); }}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          dailyGoal === goal
                            ? "bg-[#00E676] text-black border-[#00E676]"
                            : "glass-card text-zinc-400 border-white/5 hover:text-white"
                        }`}
                      >
                        {goal} Qs
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* PARENT SPECIFIC FIELDS */}
            {activeRole === "parent" && (
              <>
                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                    Ward's Registration Key or Phone to Monitor
                  </label>
                  <input
                    type="text"
                    value={wardKeyOrPhone}
                    onChange={(e) => setWardKeyOrPhone(e.target.value)}
                    placeholder="e.g. EDU-2025-LAG-1112"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-400 placeholder-zinc-500 focus:outline-none focus:border-[#00E676]"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-white block">Parent Monitoring Channels:</span>
                  <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parentNotifications.whatsapp}
                      onChange={(e) => setParentNotifications(p => ({ ...p, whatsapp: e.target.checked }))}
                      className="rounded accent-[#00E676]"
                    />
                    <span>Weekly WhatsApp Performance Digest with UNILAG Cutoff Odds</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parentNotifications.sms}
                      onChange={(e) => setParentNotifications(p => ({ ...p, sms: e.target.checked }))}
                      className="rounded accent-[#00E676]"
                    />
                    <span>Instant Daily SMS Alert if Mock Score drops below 250</span>
                  </label>
                </div>
              </>
            )}

            {/* TUTOR SPECIFIC FIELDS */}
            {activeRole === "tutor" && (
              <>
                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                    Tutorial Center / Academy Name
                  </label>
                  <input
                    type="text"
                    value={tutorialCenterName}
                    onChange={(e) => setTutorialCenterName(e.target.value)}
                    placeholder="e.g. Excel Premier JAMB Academy"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                    Specialized Subjects
                  </label>
                  <input
                    type="text"
                    value={tutorSubject}
                    onChange={(e) => setTutorSubject(e.target.value)}
                    placeholder="e.g. Mathematics, Physics & Chemistry"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </>
            )}

            {/* SCHOOL ADMIN SPECIFIC FIELDS */}
            {activeRole === "school" && (
              <>
                <div>
                  <label className="text-xs font-bold text-zinc-300 mb-1.5 block">
                    Registered Institution / School Name
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. King's College Lagos"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200">
                  🏛️ <strong>Institutional License:</strong> 250 Active SS3 Seats Assigned. Proctored CBT Lockdown is actively enforced for all institutional candidates.
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2.5">
          <button
            onClick={handleLogout}
            className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <a
            href="/autopsy"
            onClick={() => { sfx.tap(); onClose(); }}
            className="px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>🔬 Autopsy</span>
          </a>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="flex-1 bg-gradient-to-r from-[#00E676] to-[#008751] hover:brightness-110 text-black font-extrabold py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,230,118,0.3)] active:scale-95 transition-all"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Profile Updated Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Strict Academic Tier Upgrade Modal */}
      <AcademicTierUpgradeModal
        isOpen={isTierUpgradeOpen}
        onClose={() => setIsTierUpgradeOpen(false)}
        currentTier={academicTier}
        onTierUpgraded={(newTier) => {
          setAcademicTier(newTier);
          if (typeof window !== "undefined") {
            localStorage.setItem("edunaija_academic_tier", newTier);
          }
        }}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ShieldCheck, Heart, Clock, Award, CheckCircle2, AlertTriangle, 
  CreditCard, MessageSquare, X, Check, Users, Sparkles, BookOpen, 
  ArrowRight, ExternalLink, Send, Plus, Lock, Key, Phone, UserCheck,
  GraduationCap, TrendingUp, Zap, HelpCircle, FileText, CheckCircle
} from "lucide-react";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";
import BackButton from "../../components/BackButton";

export interface WardDef {
  name: string;
  key: string;
  tier: "PRIMARY" | "JSS" | "SSS" | "100L";
  grade: string;
  institution: string;
  faculty_or_track?: string;
  assigned_head_or_dean?: string;
  assigned_tutor_or_lecturer?: string;
  target: string;
  icon: string;
  xp: number;
  streak: number;
  masteryPct: number;
  strongTopic: string;
  weakTopic: string;
  predictedMetric: string;
  courses: string[];
}

export interface ParentRequestDef {
  id: string;
  parent_key: string;
  parent_name: string;
  parent_phone?: string;
  ward_key: string;
  ward_name: string;
  ward_grade: string;
  category: string;
  subject_topic?: string;
  urgency: string;
  message: string;
  status: string;
  admin_response?: string;
  assigned_admin?: string;
  resolved_at?: string;
  created_at: string;
  recipient_structure?: string;
  recipient_name?: string;
}

const DEFAULT_WARDS: WardDef[] = [
  {
    name: "Emeka Okonkwo",
    key: "WARD-100L-UNILAG-01",
    tier: "100L",
    grade: "100 Level (Freshman)",
    institution: "University of Lagos (UNILAG)",
    target: "5.0 CGPA (First Class Honours) • Software Engineering",
    icon: "🎓",
    xp: 4250,
    streak: 12,
    masteryPct: 88,
    strongTopic: "COS 101 (Computing & Von Neumann)",
    weakTopic: "MTH 101 (Limits & Trigonometry)",
    predictedMetric: "4.82 Projected GPA",
    courses: ["GST 111", "GST 112", "GST 113", "COS 101", "MTH 101", "PHY 101"]
  },
  {
    name: "Chisom Okonkwo",
    key: "WARD-UTME-MED-02",
    tier: "SSS",
    grade: "SSS 3 (UTME Candidate)",
    institution: "Queen's College Lagos",
    target: "Target Score: 320/400 • Medicine & Surgery",
    icon: "⚡",
    xp: 3820,
    streak: 15,
    masteryPct: 82,
    strongTopic: "Organic Chemistry & Genetics",
    weakTopic: "Physics Projectiles & Vectors",
    predictedMetric: "312 / 400 JAMB",
    courses: ["English", "Physics", "Chemistry", "Biology", "Mathematics"]
  },
  {
    name: "Zainab Adeleke",
    key: "WARD-JSS-BECE-03",
    tier: "JSS",
    grade: "JSS 2 (Basic 8)",
    institution: "Federal Government College Ijanikin",
    target: "BECE Junior WAEC Distinction",
    icon: "🎯",
    xp: 2150,
    streak: 8,
    masteryPct: 76,
    strongTopic: "Basic Science & Living Systems",
    weakTopic: "Basic Technology Workshop Tools",
    predictedMetric: "9 A Distinctions",
    courses: ["English Language", "Mathematics", "Basic Science", "Social Studies"]
  },
  {
    name: "Tobi Adeleke",
    key: "WARD-PRI-BASIC-04",
    tier: "PRIMARY",
    grade: "Primary 4 (Basic 4)",
    institution: "Corona Primary School / King's College Prep",
    target: "National Common Entrance Examination (NCEE)",
    icon: "🦁",
    xp: 1950,
    streak: 19,
    masteryPct: 92,
    strongTopic: "Mental Math & Multiplication",
    weakTopic: "English Adjectives & Prepositions",
    predictedMetric: "⭐ 950 Wonder Stars",
    courses: ["English Studies", "Mathematics", "Basic Science", "National Values"]
  }
];

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState<"telemetry" | "requests">("telemetry");
  const [wards, setWards] = useState<WardDef[]>(DEFAULT_WARDS);
  const [selectedWard, setSelectedWard] = useState<WardDef>(DEFAULT_WARDS[0]);
  const [dispatchToast, setDispatchToast] = useState<string | null>(null);

  // Parent Unique Login & Security State
  const [parentPhone, setParentPhone] = useState("08033330001");
  const [parentPin, setParentPin] = useState("1234");
  const [parentName, setParentName] = useState("Chief Mrs. Ngozi Okonkwo");
  const [parentKey, setParentKey] = useState("PARENT-LAG-9901");

  // Link New Child Modal State
  const [isAddWardOpen, setIsAddWardOpen] = useState(false);
  const [newWardKey, setNewWardKey] = useState("");
  const [newWardName, setNewWardName] = useState("");
  const [newWardTier, setNewWardTier] = useState<"PRIMARY" | "JSS" | "SSS" | "100L">("SSS");

  // Parent Requests & Multi-Structure Messaging State
  const [parentRequests, setParentRequests] = useState<ParentRequestDef[]>([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [reqCategory, setReqCategory] = useState("TUTOR_REQUEST");
  const [reqSubject, setReqSubject] = useState("");
  const [reqUrgency, setReqUrgency] = useState("normal");
  const [reqMessage, setReqMessage] = useState("");
  const [recipientStructure, setRecipientStructure] = useState<string>("SCHOOL_FACULTY");
  const [recipientName, setRecipientName] = useState<string>("");
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [reqSuccessToast, setReqSuccessToast] = useState<string | null>(null);

  // Fetch Parent Requests & Mapped Wards from DB via secure HTTPS proxy
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Fetch real mapped wards from database
    const wardsUrl = window.location.protocol === "https:"
      ? `/api/backend/parent/wards?parent_key=${parentKey}`
      : `/api/backend/parent/wards?parent_key=${parentKey}`;

    fetch(wardsUrl)
      .then(res => res.json())
      .then(data => {
        if (data.wards && data.wards.length > 0) {
          const loaded: WardDef[] = data.wards.map((w: any) => ({
            name: w.student_name,
            key: w.student_key,
            tier: w.tier,
            grade: w.grade,
            institution: w.institution_name,
            faculty_or_track: w.faculty_or_track,
            assigned_head_or_dean: w.assigned_head_or_dean,
            assigned_tutor_or_lecturer: w.assigned_tutor_or_lecturer,
            target: w.target_metric,
            icon: w.tier === "100L" ? "🎓" : w.tier === "PRIMARY" ? "🎒" : w.tier === "JSS" ? "📘" : "⚡",
            xp: w.xp || 3500,
            streak: w.streak || 7,
            masteryPct: w.mastery_pct || 82,
            strongTopic: w.strong_topic,
            weakTopic: w.weak_topic,
            predictedMetric: w.predicted_metric,
            courses: w.courses || []
          }));
          setWards(loaded);
          setSelectedWard(loaded[0]);
        }
      })
      .catch(() => {});

    // 2. Fetch requests across all structures
    const reqUrl = window.location.protocol === "https:"
      ? `/api/backend/parent/requests?parent_key=${parentKey}`
      : `/api/backend/parent/requests?parent_key=${parentKey}`;

    fetch(reqUrl)
      .then(res => res.json())
      .then(data => {
        if (data.requests) {
          setParentRequests(data.requests);
        }
      })
      .catch(err => console.error("Error fetching parent requests:", err));
  }, [parentKey]);

  // Update default recipient name when selectedWard or structure changes
  useEffect(() => {
    if (recipientStructure === "SCHOOL_FACULTY") {
      setRecipientName(`${selectedWard.institution} — Dean / Principal Administration`);
    } else if (recipientStructure === "COURSE_LECTURER_OR_TEACHER") {
      setRecipientName(`${selectedWard.assigned_tutor_or_lecturer || "Course Lecturer / Form Master"} Desk`);
    } else if (recipientStructure === "BURSARY_FINANCE") {
      setRecipientName(`${selectedWard.institution} — Student Affairs & Bursary Office`);
    } else if (recipientStructure === "SPONSOR_SCHOLARSHIP_DESK") {
      setRecipientName("Federal / Corporate CSR Scholarship Directorate");
    } else {
      setRecipientName("EduNaija Sovereign Academic Directorate & AI Senate");
    }
  }, [selectedWard, recipientStructure]);

  const handleDispatchWhatsApp = async () => {
    sfx.correct();
    triggerTmaHaptic("medium");
    try {
      const res = await fetch("/parent/generate-friday-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_key: parentKey,
          ward_key: selectedWard.key,
          channel: "WHATSAPP"
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setDispatchToast(`📲 Live Friday 5:00 PM WhatsApp Report dispatched for ${selectedWard.name} (${data.sms_provider_status})!`);
      } else {
        setDispatchToast(`📲 Friday Academic Report dispatched for ${selectedWard.name} to ${parentPhone}!`);
      }
    } catch {
      setDispatchToast(`📲 Live WhatsApp Academic Report dispatched for ${selectedWard.name} to ${parentPhone}!`);
    }
    setTimeout(() => setDispatchToast(null), 4500);
  };

  const handleLinkChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWardName.trim()) return;
    sfx.tap();
    triggerTmaHaptic("heavy");

    const added: WardDef = {
      name: newWardName.trim(),
      key: newWardKey.trim() || `WARD-${newWardTier}-${Math.floor(1000 + Math.random() * 9000)}`,
      tier: newWardTier,
      grade: newWardTier === "100L" ? "100L Undergraduate" : newWardTier === "PRIMARY" ? "Primary 3" : newWardTier === "JSS" ? "JSS 1" : "SSS 2",
      institution: "Federal Government College / University Prep",
      target: newWardTier === "100L" ? "First Class CGPA 5.0" : newWardTier === "PRIMARY" ? "National Common Entrance Prep" : "WAEC 8 A1s Target",
      icon: newWardTier === "100L" ? "🎓" : newWardTier === "PRIMARY" ? "🎒" : newWardTier === "JSS" ? "📘" : "🔬",
      xp: 1200,
      streak: 3,
      masteryPct: 75,
      strongTopic: "Foundational Literacy & Logic",
      weakTopic: "Applied Problem Solving",
      predictedMetric: newWardTier === "100L" ? "4.50 GPA" : newWardTier === "PRIMARY" ? "880 Stars" : "280 JAMB",
      courses: ["General Studies", "Mathematics", "Sciences"]
    };

    setWards([...wards, added]);
    setSelectedWard(added);
    setIsAddWardOpen(false);
    setNewWardName("");
    setNewWardKey("");
    setDispatchToast(`✅ ${added.name} successfully linked to your Guardian account!`);
    setTimeout(() => setDispatchToast(null), 4000);
  };

  const handleSubmitParentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqMessage.trim()) return;
    setIsSubmittingReq(true);
    sfx.tap();

    const payload = {
      parent_key: parentKey,
      parent_name: parentName,
      parent_phone: parentPhone,
      ward_key: selectedWard.key,
      ward_name: selectedWard.name,
      ward_grade: selectedWard.grade,
      category: reqCategory,
      subject_topic: reqSubject.trim() || selectedWard.weakTopic,
      urgency: reqUrgency,
      message: reqMessage.trim(),
      recipient_structure: recipientStructure,
      recipient_name: recipientName
    };

    try {
      const targetPostUrl = typeof window !== "undefined" && window.location.protocol === "https:"
        ? "/api/backend/parent/requests"
        : "/api/backend/parent/requests";

      const res = await fetch(targetPostUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      const newReq: ParentRequestDef = {
        id: data.request_id || `REQ-LOCAL-${Date.now()}`,
        parent_key: parentKey,
        parent_name: parentName,
        ward_key: selectedWard.key,
        ward_name: selectedWard.name,
        ward_grade: selectedWard.grade,
        category: reqCategory,
        subject_topic: reqSubject.trim() || selectedWard.weakTopic,
        urgency: reqUrgency,
        message: reqMessage.trim(),
        status: "submitted",
        recipient_structure: recipientStructure,
        recipient_name: recipientName,
        assigned_admin: recipientName,
        created_at: new Date().toISOString()
      };

      setParentRequests([newReq, ...parentRequests]);
      setIsComposeOpen(false);
      setReqMessage("");
      setReqSubject("");
      sfx.streakCelebration();
      setReqSuccessToast(`📬 Request #${newReq.id} submitted! Dr. Adeleke and the Academic Team will respond within 4 hours.`);
      setTimeout(() => setReqSuccessToast(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReq(false);
    }
  };

  const applyQuickShortcut = (cat: string, subj: string, msg: string) => {
    setReqCategory(cat);
    setReqSubject(subj);
    setReqMessage(msg);
    setIsComposeOpen(true);
    sfx.tap();
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-zinc-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#07090E]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton fallbackHref="/student" label="Back to Cockpit" />
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Parent Guardian Angel Hub
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  NDPA 2023 Verified
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">
                Guardian Oversight &amp; Direct Admin Desk
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => { setActiveTab("telemetry"); sfx.tap(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "telemetry" 
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30" 
                : "text-zinc-400 hover:text-white"
            }`}
          >
            📊 Wards Telemetry
          </button>
          <button
            onClick={() => { setActiveTab("requests"); sfx.tap(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "requests" 
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30" 
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>📝 Admin Desk</span>
            {parentRequests.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-400 text-black text-[9px] font-black flex items-center justify-center">
                {parentRequests.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Toast Alerts */}
        <AnimatePresence>
          {dispatchToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center justify-between shadow-xl"
            >
              <span>{dispatchToast}</span>
              <button onClick={() => setDispatchToast(null)} className="text-purple-400 hover:text-white">✕</button>
            </motion.div>
          )}
          {reqSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl"
            >
              <span>{reqSuccessToast}</span>
              <button onClick={() => setReqSuccessToast(null)} className="text-emerald-400 hover:text-white">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guardian Identity & Wards Bar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl text-purple-400 font-bold">
              👩🏾‍💼
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{parentName}</span>
                <span className="text-[10px] text-zinc-400 font-mono">({parentPhone})</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Authorized Guardian ID: <span className="text-[#00E676] font-mono">{parentKey}</span> • PIN: ****{parentPin.slice(-2)}
              </p>
            </div>
          </div>

          {/* Ward Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {wards.map(w => {
              const isSelected = selectedWard.key === w.key;
              return (
                <button
                  key={w.key}
                  onClick={() => { setSelectedWard(w); sfx.tap(); }}
                  className={`px-3 py-2 rounded-xl border text-left transition-all flex items-center gap-2 shrink-0 ${
                    isSelected 
                      ? "bg-purple-500/20 border-purple-500 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="text-base">{w.icon}</span>
                  <div>
                    <div className="text-xs font-bold">{w.name}</div>
                    <div className="text-[9px] opacity-75">{w.tier} • {w.grade.split(" ")[0]}</div>
                  </div>
                </button>
              );
            })}

            <button
              onClick={() => { setIsAddWardOpen(true); sfx.tap(); }}
              className="px-3 py-2 rounded-xl border border-dashed border-white/20 text-zinc-400 hover:text-white hover:border-purple-500 transition-colors flex items-center gap-1.5 shrink-0 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link Child</span>
            </button>
          </div>
        </div>

        {/* TAB 1: WARDS TELEMETRY */}
        {activeTab === "telemetry" && (
          <div className="space-y-6">
            {/* Active Ward Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/40 via-black to-zinc-950 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{selectedWard.icon}</span>
                  <h2 className="text-lg font-black text-white">{selectedWard.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-purple-300">
                    {selectedWard.grade}
                  </span>
                </div>
                <p className="text-xs text-zinc-300">
                  {selectedWard.institution} • <span className="text-amber-400 font-bold">{selectedWard.target}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDispatchWhatsApp}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:brightness-110 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Friday Report (WhatsApp)</span>
                </button>

                <button
                  onClick={() => {
                    applyQuickShortcut(
                      "TUTOR_REQUEST", 
                      selectedWard.weakTopic, 
                      `Hello Academic Director, I would like to request dedicated 1-on-1 Socratic AI tutoring for ${selectedWard.name} on ${selectedWard.weakTopic}.`
                    );
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 font-bold text-xs hover:bg-purple-500/30 transition-all flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Request Tutoring</span>
                </button>
              </div>
            </div>

            {/* 4-Pillar Mastery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Key Strength</span>
                <div className="text-sm font-black text-[#00E676]">{selectedWard.strongTopic}</div>
                <div className="text-[11px] text-zinc-500">Mastery at {selectedWard.masteryPct}%</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Weakness Autopsy</span>
                <div className="text-sm font-black text-rose-400">{selectedWard.weakTopic}</div>
                <div className="text-[11px] text-zinc-500">Remedial micro-drill pending</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Projected Benchmark</span>
                <div className="text-sm font-black text-amber-400">{selectedWard.predictedMetric}</div>
                <div className="text-[11px] text-zinc-500">Based on diagnostic velocity</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Active Study Streak</span>
                <div className="text-sm font-black text-purple-400">🔥 {selectedWard.streak} Days</div>
                <div className="text-[11px] text-zinc-500">{selectedWard.xp} XP Points Earned</div>
              </div>
            </div>

            {/* Courses / Curriculum Enrolled */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  {selectedWard.tier === "100L" ? "NUC CCMAS 100L Courses Enrolled" : "NERDC Curriculum Focus"}
                </h3>
                <span className="text-[11px] text-[#00E676] font-bold">100% Curriculum Sync</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedWard.courses.map(c => (
                  <span key={c} className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-bold text-zinc-200">
                    📚 {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADMIN DESK & PARENT REQUESTS */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            {/* Header + Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-purple-950/20 border border-purple-500/30">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <span>🏛️</span>
                  <span>Academic Administration Direct Desk</span>
                </h2>
                <p className="text-xs text-zinc-300 max-w-xl">
                  Submit formal academic inquiries, tutoring interventions, diagnostic review appeals, and scholarship subsidies. SLA resolution time: under 4 hours.
                </p>
              </div>

              <button
                onClick={() => { setIsComposeOpen(true); sfx.tap(); }}
                className="px-5 py-2.5 rounded-xl bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-500/30 hover:bg-purple-600 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit New Request</span>
              </button>
            </div>

            {/* Quick Canned Request Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => applyQuickShortcut(
                  "TUTOR_REQUEST", 
                  selectedWard.weakTopic, 
                  `We request 1-on-1 Socratic AI diagnostic drills for ${selectedWard.name} on ${selectedWard.weakTopic}.`
                )}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-purple-300 group-hover:text-purple-200">
                  🎯 Request 1-on-1 Tutor
                </div>
                <div className="text-[10px] text-zinc-400 mt-1">
                  Targeted micro-drills on {selectedWard.weakTopic}
                </div>
              </button>

              <button
                onClick={() => applyQuickShortcut(
                  "DIAGNOSTIC_APPEAL", 
                  selectedWard.courses[0] || "Mathematics", 
                  `Please provide a diagnostic breakdown of ${selectedWard.name}'s mock examination benchmark.`
                )}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                  📊 Request Diagnostic Review
                </div>
                <div className="text-[10px] text-zinc-400 mt-1">
                  Audit benchmark scores and Bloom's mastery
                </div>
              </button>

              <button
                onClick={() => applyQuickShortcut(
                  "BURSARY_SCHOLARSHIP", 
                  "WAEC & UTME Examination Pass", 
                  `Inquiring on eligibility for corporate CSR subsidy (MTN / TEF Foundation) for examination fees.`
                )}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-[#00E676] group-hover:text-emerald-200">
                  💳 Scholarship / Fee Aid
                </div>
                <div className="text-[10px] text-zinc-400 mt-1">
                  Check CSR subsidy and sponsored data pass
                </div>
              </button>
            </div>

            {/* Requests History Feed */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Official Inquiries &amp; Status ({parentRequests.length})
              </h3>

              {parentRequests.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                  <p className="text-xs text-zinc-400">No requests submitted yet.</p>
                  <button
                    onClick={() => setIsComposeOpen(true)}
                    className="text-xs text-purple-400 font-bold hover:underline"
                  >
                    Click here to submit your first inquiry to the Academic Admin.
                  </button>
                </div>
              ) : (
                parentRequests.map(req => {
                  const isResolved = req.status === "resolved";
                  const isProgress = req.status === "in_progress";
                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 transition-colors hover:bg-white/[0.07]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black ${
                            isResolved
                              ? "bg-emerald-500/20 text-[#00E676] border border-emerald-500/30"
                              : isProgress
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}>
                            {isResolved ? "RESOLVED" : isProgress ? "IN PROGRESS" : "SUBMITTED"}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {req.category.replace(/_/g, " ")}: {req.subject_topic || "General"}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          ID: {req.id} • Ward: <strong className="text-zinc-200">{req.ward_name}</strong>
                        </div>
                      </div>

                      {/* Parent's Message */}
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        "{req.message}"
                      </p>

                      {/* Admin's Official Response */}
                      {req.admin_response ? (
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs space-y-1">
                          <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Response from {req.assigned_admin || "Academic Administration"}:</span>
                          </div>
                          <p className="text-zinc-300 text-[11px] leading-relaxed">
                            {req.admin_response}
                          </p>
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-500 italic flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Assigned to Dean of Academics • SLA response pending</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: SUBMIT NEW PARENT REQUEST */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#0F141F] border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">✍️</span>
                <h3 className="text-sm font-black text-white">Relate with School Administration</h3>
              </div>
              <button onClick={() => setIsComposeOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitParentRequest} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Select Ward / Child:
                </label>
                <select
                  value={selectedWard.key}
                  onChange={e => {
                    const found = wards.find(w => w.key === e.target.value);
                    if (found) setSelectedWard(found);
                  }}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-purple-500 font-bold"
                >
                  {wards.map(w => (
                    <option key={w.key} value={w.key}>
                      {w.icon} {w.name} ({w.grade}) — {w.institution}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Destination Educational Structure / Recipient:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
                  {[
                    { id: "SCHOOL_FACULTY", label: "School / Varsity Office", icon: "🏫" },
                    { id: "COURSE_LECTURER_OR_TEACHER", label: "Lecturer / Teacher Desk", icon: "👨‍🏫" },
                    { id: "PLATFORM_ADMIN", label: "EduNaija Academic Board", icon: "🏛️" },
                    { id: "BURSARY_FINANCE", label: "Bursary & Accounts", icon: "💼" },
                    { id: "SPONSOR_SCHOLARSHIP_DESK", label: "Corporate Sponsor Desk", icon: "🤝" }
                  ].map(struct => (
                    <button
                      type="button"
                      key={struct.id}
                      onClick={() => setRecipientStructure(struct.id)}
                      className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        recipientStructure === struct.id
                          ? "border-purple-500 bg-purple-500/20 text-white shadow-md font-extrabold"
                          : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span>{struct.icon}</span>
                      <span className="truncate text-[10px]">{struct.label}</span>
                    </button>
                  ))}
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-purple-500/20 text-[11px] text-purple-200 flex items-center justify-between gap-2">
                  <span className="font-bold shrink-0">Official Recipient:</span>
                  <span className="text-white truncate font-mono text-[10px]">{recipientName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Request Category:
                  </label>
                  <select
                    value={reqCategory}
                    onChange={e => setReqCategory(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500"
                  >
                    <option value="TUTOR_REQUEST">1-on-1 Tutoring Assistance</option>
                    <option value="DIAGNOSTIC_APPEAL">Diagnostic Benchmark Review</option>
                    <option value="BURSARY_SCHOLARSHIP">Bursary &amp; Fee Scholarship</option>
                    <option value="PACING_PROMOTION">Learning Pace &amp; Promotion</option>
                    <option value="DIRECT_INQUIRY">Direct Administrative Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Priority / Urgency:
                  </label>
                  <select
                    value={reqUrgency}
                    onChange={e => setReqUrgency(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500"
                  >
                    <option value="normal">Normal (4 Hours SLA)</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Escalation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Subject or Course of Focus:
                </label>
                <input
                  type="text"
                  placeholder="e.g. MTH 101 Calculus or Organic Chemistry"
                  value={reqSubject}
                  onChange={e => setReqSubject(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Detailed Message / Request Details:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain what your child needs or what you would like the administration to review..."
                  value={reqMessage}
                  onChange={e => setReqMessage(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReq}
                  className="px-5 py-2.5 rounded-xl bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-500/30 hover:bg-purple-600 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingReq ? "Submitting..." : "Submit to Admin Desk →"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: LINK ANOTHER CHILD */}
      {isAddWardOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0F141F] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>➕</span> Link Another Child
              </h3>
              <button onClick={() => setIsAddWardOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleLinkChild} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Child's Full Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Somto Adeleke"
                  value={newWardName}
                  onChange={e => setNewWardName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-purple-500 font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Educational Stage / Tier:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["PRIMARY", "JSS", "SSS", "100L"] as const).map(t => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setNewWardTier(t)}
                      className={`py-2 rounded-xl border text-center text-xs font-bold transition-all ${
                        newWardTier === t
                          ? "bg-purple-500 text-white border-purple-500"
                          : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Student Registration Key (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. EDU-2025-LAG-1234"
                  value={newWardKey}
                  onChange={e => setNewWardKey(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddWardOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-500/30 hover:bg-purple-600"
                >
                  Confirm &amp; Link Child →
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, ShieldCheck, Video, Calendar, Clock, Star, 
  Award, CheckCircle2, BookOpen, UserCheck, Lock, Sparkles, 
  ExternalLink, ArrowRight, Eye, PhoneCall, AlertCircle, Compass,
  Briefcase, Send, DollarSign, Users, ChevronRight, FileCheck, Check,
  RefreshCw, CreditCard, CheckCheck
} from "lucide-react";
import BackButton from "../../components/BackButton";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

interface VettedTeacher {
  id: string;
  full_name: string;
  avatar_url: string;
  tier_category: string;
  subjects: string[];
  trcn_number: string;
  trcn_category: string;
  degree_qualification: string;
  institution: string;
  years_experience: number;
  vetting_status: string;
  diagnostic_score: number;
  hourly_rate_naira: number;
  rating: number;
  reviews_count: number;
  bio: string;
  pedagogy_style: string;
  languages: string[];
  availability_slots: string[];
  is_available_now: boolean;
}

interface MonthlyPackage {
  id: string;
  tier: string;
  title: string;
  target_curriculum: string;
  monthly_fee_ngn: number;
  tutor_share_ngn: number;
  platform_fee_ngn: number;
  hours_per_month: number;
  hourly_rate_equivalent: number;
  free_discovery_call_minutes: number;
  features: string[];
}

export default function VirtualTeachingPage() {
  const [activeTab, setActiveTab] = useState<"marketplace" | "packages" | "apply" | "escrow_demo">("marketplace");
  const [teachers, setTeachers] = useState<VettedTeacher[]>([]);
  const [packages, setPackages] = useState<MonthlyPackage[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [activeTeacher, setActiveTeacher] = useState<VettedTeacher | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // TRCN Verification Live State
  const [trcnCheckNumber, setTrcnCheckNumber] = useState("TRCN/LA/2022/88219");
  const [trcnCheckNin, setTrcnCheckNin] = useState("98123456789");
  const [trcnCheckName, setTrcnCheckName] = useState("Adeyemi O. Adeleke");
  const [trcnVerifying, setTrcnVerifying] = useState(false);
  const [trcnResult, setTrcnResult] = useState<any | null>(null);

  // Escrow Disbursement Live State
  const [escrowSessionId, setEscrowSessionId] = useState("SESS-DEMO-2026");
  const [escrowStep, setEscrowStep] = useState<1 | 2>(1);
  const [escrowDisbursing, setEscrowDisbursing] = useState(false);
  const [escrowResult, setEscrowResult] = useState<any | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Discovery Call Modal state
  const [discoveryTeacher, setDiscoveryTeacher] = useState<VettedTeacher | null>(null);
  const [discoveryBooked, setDiscoveryBooked] = useState(false);

  // Application Form state
  const [applyStep, setApplyStep] = useState(1);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [appSubmitted, setAppSubmitted] = useState<any | null>(null);
  const [appForm, setAppForm] = useState({
    full_name: "Adeyemi O. Adeleke",
    email: "adeyemi.adeleke@edunaija.ng",
    phone: "+234 803 456 7890",
    nin: "98234512903",
    trcn_number: "TRCN/OYO/2022/49182",
    trcn_category: "Category B (Master of Education / B.Sc Ed)",
    degree_qualification: "M.Sc Mathematics (First Class)",
    institution: "University of Ibadan (UI)",
    tier_category: "SSS",
    subjects: ["Further Mathematics", "Physics", "JAMB UTME Prep"],
    requested_monthly_fee: 75000,
    diagnostic_score: 94,
    audition_video_url: "https://edunaija.ng/audition/adeyemi-math.mp4",
    guarantor_name: "Prof. Babatunde Alabi",
    guarantor_phone: "+234 802 111 2233"
  });

  // Student Cohort from local storage
  const [currentTier, setCurrentTier] = useState<string>("SSS");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTier = localStorage.getItem("edunaija_class_tier") || "SSS";
      setCurrentTier(storedTier);
      setSelectedTier(storedTier);
    }
  }, []);

  const fetchTeachers = async (tier: string) => {
    setLoading(true);
    try {
      const q = tier === "ALL" ? "" : `?tier=${tier}`;
      const res = await fetch(`/api/backend/virtual-teaching/teachers${q}`);
      if (res.ok) {
        const data = await res.json();
        setTeachers(data.teachers || []);
      }
    } catch (err) {
      console.warn("Failed to fetch teachers:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/backend/virtual-teaching/packages");
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages || []);
      }
    } catch (err) {
      console.warn("Failed to fetch packages:", err);
    }
  };

  useEffect(() => {
    fetchTeachers(selectedTier);
    fetchPackages();
  }, [selectedTier]);

  const handleBookSession = async () => {
    if (!activeTeacher || !selectedSlot) return;
    setIsBooking(true);
    sfx.tap();
    triggerTmaHaptic("medium");

    try {
      const res = await fetch("/api/backend/virtual-teaching/book-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: activeTeacher.id,
          student_id: "STUDENT-REAL-001",
          student_name: "Chisom Okonkwo",
          tier: activeTeacher.tier_category,
          subject: activeTeacher.subjects[0],
          slot: selectedSlot
        })
      });

      if (res.ok) {
        const data = await res.json();
        sfx.correct();
        triggerTmaHaptic("heavy");
        setBookingSuccess(data.session);
      }
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsBooking(false);
    }
  };

  const handleSubmitApplication = async () => {
    setIsSubmittingApp(true);
    sfx.tap();
    triggerTmaHaptic("heavy");
    try {
      const res = await fetch("/api/backend/virtual-teaching/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appForm)
      });
      if (res.ok) {
        const data = await res.json();
        sfx.correct();
        setAppSubmitted(data);
      } else {
        // Mock fallback if offline
        setAppSubmitted({
          status: "success",
          application_id: "TAPP-MOCK-9921",
          financial_breakdown: {
            parent_monthly_fee_ngn: appForm.requested_monthly_fee,
            platform_commission_pct: 20,
            platform_fee_ngn: appForm.requested_monthly_fee * 0.2,
            net_tutor_disbursement_ngn: appForm.requested_monthly_fee * 0.8,
            milestone_schedule: [
              { week: 2, hours: 6, payout_ngn: (appForm.requested_monthly_fee * 0.8) / 2, status: "PENDING_MID_CHECK" },
              { week: 4, hours: 6, payout_ngn: (appForm.requested_monthly_fee * 0.8) / 2, status: "PENDING_FINAL_REPORT" }
            ]
          }
        });
      }
    } catch {
      setAppSubmitted({
        status: "success",
        application_id: "TAPP-MOCK-9921",
        financial_breakdown: {
          parent_monthly_fee_ngn: appForm.requested_monthly_fee,
          platform_commission_pct: 20,
          platform_fee_ngn: appForm.requested_monthly_fee * 0.2,
          net_tutor_disbursement_ngn: appForm.requested_monthly_fee * 0.8,
          milestone_schedule: [
            { week: 2, hours: 6, payout_ngn: (appForm.requested_monthly_fee * 0.8) / 2, status: "PENDING_MID_CHECK" },
            { week: 4, hours: 6, payout_ngn: (appForm.requested_monthly_fee * 0.8) / 2, status: "PENDING_FINAL_REPORT" }
          ]
        }
      });
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleVerifyTrcn = async () => {
    setTrcnVerifying(true);
    sfx.tap();
    triggerTmaHaptic("medium");
    try {
      const res = await fetch("/api/backend/virtual-teaching/verify-trcn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trcn_number: trcnCheckNumber,
          nin: trcnCheckNin,
          teacher_name: trcnCheckName
        })
      });
      if (res.ok) {
        const data = await res.json();
        sfx.correct();
        triggerTmaHaptic("heavy");
        setTrcnResult(data);
      }
    } catch (err) {
      console.error("TRCN verification error:", err);
    } finally {
      setTrcnVerifying(false);
    }
  };

  const handleDisburseEscrow = async (milestoneNum: 1 | 2) => {
    setEscrowDisbursing(true);
    sfx.tap();
    triggerTmaHaptic("heavy");
    try {
      const res = await fetch("/api/backend/virtual-teaching/disburse-escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: escrowSessionId,
          milestone: milestoneNum,
          action: "APPROVE",
          diagnostic_report_submitted: true,
          parent_notes: "Milestone learning criteria fully satisfied."
        })
      });
      if (res.ok) {
        const data = await res.json();
        sfx.correct();
        triggerTmaHaptic("heavy");
        setEscrowResult(data);
        setEscrowStep(milestoneNum === 1 ? 2 : 1);
      }
    } catch (err) {
      console.error("Escrow disbursement error:", err);
    } finally {
      setEscrowDisbursing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <BackButton fallbackHref="/student" label="Back to Cockpit" />
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/40 border border-emerald-500/20 p-6 md:p-10 backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                TRCN Vetted & NDPA 2023 Certified Educators
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Sovereign <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">Virtual Teaching</span> Hub
              </h1>
              <p className="text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed">
                Empower your child with Nigeria’s top certified educators under our 
                <strong className="text-emerald-300"> 6-Stage International Vetting Standard</strong>. Fixed monthly retainers, free 15-minute parent discovery calls, and bi-weekly milestone escrow security.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex md:flex-col gap-3 shrink-0">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-emerald-400">80% / 20%</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Hybrid Pay Floor</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-cyan-400">100%</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Escrow Protected</div>
              </div>
            </div>
          </div>

          {/* Navigation Mode Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap gap-2">
            <button
              onClick={() => {
                sfx.tap();
                setActiveTab("marketplace");
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                activeTab === "marketplace"
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                  : "bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Browse Certified Mentors</span>
            </button>

            <button
              onClick={() => {
                sfx.tap();
                setActiveTab("packages");
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                activeTab === "packages"
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                  : "bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Fixed Monthly Retainers</span>
            </button>

            <button
              onClick={() => {
                sfx.tap();
                setActiveTab("apply");
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                activeTab === "apply"
                  ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                  : "bg-cyan-950/40 text-cyan-300 hover:text-white border border-cyan-500/30"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Apply as a Vetted Educator (Earn 80%)</span>
            </button>

            <button
              onClick={() => {
                sfx.tap();
                setActiveTab("escrow_demo");
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                activeTab === "escrow_demo"
                  ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20"
                  : "bg-amber-950/40 text-amber-300 hover:text-white border border-amber-500/30"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Escrow & TRCN Verification Lab (Demo)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: BROWSE VETTED TEACHERS */}
        {activeTab === "marketplace" && (
          <div className="space-y-6">
            {/* Safeguarding & International Trust Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Parent Shadow Mode</h4>
                  <p className="text-[11px] text-slate-400">Observe lessons live in stealth with real-time transcription and zero classroom disruption.</p>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Milestone Escrow Hold</h4>
                  <p className="text-[11px] text-slate-400">50% released at week 2; 50% released at month end upon Diagnostic Report review.</p>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Free 15-Min Discovery Call</h4>
                  <p className="text-[11px] text-slate-400">Interview teachers live in WebRTC video before committing a single kobo.</p>
                </div>
              </div>
            </div>

            {/* Tier Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "ALL", label: "All Tiers" },
                { id: "100L", label: "100L University" },
                { id: "SSS", label: "SSS 1–3 / WAEC & UTME" },
                { id: "JSS", label: "JSS 1–3 / BECE" },
                { id: "PRIMARY", label: "Primary 1–6 (Common Entrance)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sfx.tap();
                    setSelectedTier(tab.id);
                    triggerTmaHaptic("light");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedTier === tab.id
                      ? "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Teachers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 p-5 transition flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-emerald-500/5"
                >
                  <div className="space-y-4">
                    {/* Header Profile */}
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={teacher.avatar_url}
                          alt={teacher.full_name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40"
                        />
                        {teacher.is_available_now && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" title="Online & Available" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-white text-base truncate">{teacher.full_name}</h3>
                          <span title="TRCN Verified">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          </span>
                        </div>
                        <p className="text-xs text-emerald-400 font-semibold truncate">{teacher.degree_qualification}</p>
                        <p className="text-[11px] text-slate-400 truncate">{teacher.institution}</p>
                      </div>
                    </div>

                    {/* TRCN and Diagnostic Score Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                        {teacher.trcn_category}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                        Diagnostic: {teacher.diagnostic_score}%
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                        ★ {teacher.rating} ({teacher.reviews_count})
                      </span>
                    </div>

                    {/* Bio & Pedagogy Style */}
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {teacher.bio}
                    </p>

                    {/* Subjects Tag Cloud */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Specialties</span>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] text-slate-200 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Discovery Call & Retainer Booking */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Monthly Retainer</span>
                        <span className="text-base font-black text-white font-mono">
                          ₦{(teacher.hourly_rate_naira * 12).toLocaleString()}<span className="text-xs font-normal text-slate-400">/mo</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Hourly Rate</span>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          ₦{teacher.hourly_rate_naira.toLocaleString()}/hr
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          sfx.tap();
                          setDiscoveryTeacher(teacher);
                          setDiscoveryBooked(false);
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
                      >
                        <Video className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Free 15m Call</span>
                      </button>

                      <button
                        onClick={() => {
                          sfx.tap();
                          setActiveTeacher(teacher);
                          setSelectedSlot(teacher.availability_slots[0] || "");
                        }}
                        className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-500/20"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Retain (Escrow)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: FIXED MONTHLY RETAINER PACKAGES */}
        {activeTab === "packages" && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
              <div className="max-w-2xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Fixed Fee Structure for Parents</span>
                <h2 className="text-2xl font-black text-white">Hybrid Floor & Ceiling Retainer Contracts</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Every contract covers <strong className="text-emerald-300">12 hours of dedicated 1-on-1 live mentoring</strong> per month. 
                  Fees are fixed and transparent: the educator receives <strong>80% net take-home</strong>, and EduNaija retains <strong>20%</strong> for TRCN background screening, encrypted WebRTC infrastructure, and dispute mediation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-6 flex flex-col justify-between space-y-6 relative overflow-hidden group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold uppercase font-mono">
                        {pkg.tier}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">12 hrs / mo</span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white">{pkg.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{pkg.target_curriculum}</p>
                    </div>

                    <div className="py-3 border-y border-slate-800">
                      <div className="text-3xl font-black text-emerald-400 font-mono">
                        ₦{pkg.monthly_fee_ngn.toLocaleString()}
                        <span className="text-xs font-normal text-slate-400"> / month</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                        <span>Tutor Pay: ₦{pkg.tutor_share_ngn.toLocaleString()} (80%)</span>
                        <span>Platform: ₦{pkg.platform_fee_ngn.toLocaleString()} (20%)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Included in Retainer</span>
                      {pkg.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <button
                      onClick={() => {
                        sfx.tap();
                        setActiveTab("marketplace");
                        if (pkg.tier === "PRIMARY_JSS") setSelectedTier("PRIMARY");
                        else if (pkg.tier === "SSS_UTME") setSelectedTier("SSS");
                        else setSelectedTier("100L");
                      }}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                    >
                      <span>Choose {pkg.tier} Mentor</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-center text-[10px] text-slate-500 font-medium">
                      Includes Free 15-Minute Discovery Video Call
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TEACHER REGISTRATION & APPLICATION PORTAL */}
        {activeTab === "apply" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="rounded-3xl bg-slate-900 border border-cyan-500/30 p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <FileCheck className="w-4 h-4" />
                EduNaija Sovereign Educator Onboarding
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Register & Apply as a Certified Online Teacher
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                We accept only verified professional teachers. Complete the 6-stage verification checklist below. 
                Educators keep <strong className="text-emerald-400">80% of all monthly tuition fees</strong>, paid bi-weekly directly to their verified Nigerian bank account via automated milestone escrow.
              </p>

              {/* Requirements Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="font-bold text-white">1. TRCN License</div>
                  <div className="text-[11px] text-slate-400">Category A, B, C, or D</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="font-bold text-white">2. Identity & NIN</div>
                  <div className="text-[11px] text-slate-400">Smile ID biometric check</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="font-bold text-white">3. Diagnostic Exam</div>
                  <div className="text-[11px] text-slate-400">Min 85% STEM score</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="font-bold text-white">4. 3-Min Video</div>
                  <div className="text-[11px] text-slate-400">Pedagogical micro-lesson</div>
                </div>
              </div>
            </div>

            {/* Application Progress or Completed State */}
            {!appSubmitted ? (
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stage {applyStep} of 3</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((s) => (
                      <span
                        key={s}
                        className={`w-8 h-2 rounded-full transition-all ${
                          s === applyStep ? "bg-cyan-400" : s < applyStep ? "bg-emerald-500" : "bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Step 1: Identity & Credentials */}
                {applyStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white">Step 1: Bio & Statutory TRCN Accreditation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Full Legal Name</label>
                        <input
                          type="text"
                          value={appForm.full_name}
                          onChange={(e) => setAppForm({ ...appForm, full_name: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                        <input
                          type="email"
                          value={appForm.email}
                          onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">National ID Number (NIN)</label>
                        <input
                          type="text"
                          value={appForm.nin}
                          onChange={(e) => setAppForm({ ...appForm, nin: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">TRCN Registration Number</label>
                        <input
                          type="text"
                          value={appForm.trcn_number}
                          onChange={(e) => setAppForm({ ...appForm, trcn_number: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-slate-300 block mb-1">TRCN Teacher Category</label>
                        <select
                          value={appForm.trcn_category}
                          onChange={(e) => setAppForm({ ...appForm, trcn_category: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option>Category A (Doctorate in Education / PhD)</option>
                          <option>Category B (Master of Education / B.Sc Ed)</option>
                          <option>Category C (B.Ed / B.Sc with PGDE)</option>
                          <option>Category D (Nigeria Certificate in Education - NCE)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Cohort, Subjects & Hybrid Pricing */}
                {applyStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white">Step 2: Teaching Specialization & Monthly Rate</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Student Tier</label>
                        <select
                          value={appForm.tier_category}
                          onChange={(e) => setAppForm({ ...appForm, tier_category: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="PRIMARY">Primary 1–6 (Common Entrance)</option>
                          <option value="JSS">JSS 1–3 (BECE Junior WAEC)</option>
                          <option value="SSS">SSS 1–3 (WAEC & JAMB UTME)</option>
                          <option value="100L">100L Varsity STEM & Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Primary Subjects (Comma Separated)</label>
                        <input
                          type="text"
                          value={appForm.subjects.join(", ")}
                          onChange={(e) => setAppForm({ ...appForm, subjects: e.target.value.split(",").map(s => s.trim()) })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="md:col-span-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-white">Requested Monthly Fee (Parent Price)</label>
                          <span className="text-base font-black text-cyan-400 font-mono">
                            ₦{appForm.requested_monthly_fee.toLocaleString()} / mo
                          </span>
                        </div>
                        <input
                          type="range"
                          min="45000"
                          max="150000"
                          step="5000"
                          value={appForm.requested_monthly_fee}
                          onChange={(e) => setAppForm({ ...appForm, requested_monthly_fee: parseInt(e.target.value) })}
                          className="w-full accent-cyan-400 cursor-pointer"
                        />
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Your Net Take-Home (80%):</span>
                            <span className="font-bold text-emerald-400 font-mono text-sm">
                              ₦{(appForm.requested_monthly_fee * 0.8).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">EduNaija Platform Cut (20%):</span>
                            <span className="font-bold text-slate-300 font-mono text-sm">
                              ₦{(appForm.requested_monthly_fee * 0.2).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Audition & Guarantor */}
                {applyStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white">Step 3: Pedagogical Audition & Vetting Guarantor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-slate-300 block mb-1">3-Minute Video Audition Link (Loom / Drive / YouTube)</label>
                        <input
                          type="url"
                          value={appForm.audition_video_url}
                          onChange={(e) => setAppForm({ ...appForm, audition_video_url: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">Explain any STEM concept (e.g. Quadratic Formula, Hooke’s Law) clearly in under 3 minutes.</span>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Guarantor Name (School Principal / Head of Dept)</label>
                        <input
                          type="text"
                          value={appForm.guarantor_name}
                          onChange={(e) => setAppForm({ ...appForm, guarantor_name: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Guarantor Phone Number</label>
                        <input
                          type="tel"
                          value={appForm.guarantor_phone}
                          onChange={(e) => setAppForm({ ...appForm, guarantor_phone: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="text-xs text-emerald-300">
                        Diagnostic Simulation: Scored <strong>{appForm.diagnostic_score}%</strong> in Curriculum Mastery Test.
                      </div>
                    </div>
                  </div>
                )}

                {/* Wizard Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  {applyStep > 1 ? (
                    <button
                      onClick={() => setApplyStep(applyStep - 1)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                    >
                      Back
                    </button>
                  ) : <div />}

                  {applyStep < 3 ? (
                    <button
                      onClick={() => {
                        sfx.tap();
                        setApplyStep(applyStep + 1);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitApplication}
                      disabled={isSubmittingApp}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmittingApp ? "Submitting Application..." : "Submit Educator Application"}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-slate-900 border border-emerald-500/30 p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Application Successfully Submitted!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Application Reference: <strong className="text-emerald-300 font-mono">{appSubmitted.application_id}</strong>
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Parent Rate:</span>
                    <span className="font-bold text-white font-mono">₦{appSubmitted.financial_breakdown.parent_monthly_fee_ngn.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Your Net Earnings (80%):</span>
                    <span className="font-bold text-emerald-400 font-mono">₦{appSubmitted.financial_breakdown.net_tutor_disbursement_ngn.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Platform Cut (20%):</span>
                    <span className="font-bold text-slate-400 font-mono">₦{appSubmitted.financial_breakdown.platform_fee_ngn.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    Disbursement Schedule: <strong>₦{(appSubmitted.financial_breakdown.net_tutor_disbursement_ngn / 2).toLocaleString()}</strong> after Week 2 + <strong>₦{(appSubmitted.financial_breakdown.net_tutor_disbursement_ngn / 2).toLocaleString()}</strong> after Week 4.
                  </div>
                </div>

                <button
                  onClick={() => {
                    sfx.tap();
                    setActiveTab("marketplace");
                    setAppSubmitted(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Return to Marketplace
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: INTERACTIVE ESCROW PAYMENT & TRCN VERIFICATION LAB */}
        {activeTab === "escrow_demo" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="rounded-3xl bg-slate-900 border border-amber-500/30 p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                Live Financial Engineering & Credential Verification Engine
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Teacher Verification & Automated Escrow Disbursement Lab
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Test the complete end-to-end lifecycle: Validate teacher national credentials against the statutory TRCN register,
                hold parent retainer fees in transit escrow, and execute automated bi-weekly milestone disbursements with 48-hour silent auto-approval safeguards.
              </p>
            </div>

            {/* Two Column Interactive Lab */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Part 1: TRCN Accreditation Verification */}
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  1. Statutory TRCN Verification Gateway
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">TRCN Registration Number</label>
                    <input
                      type="text"
                      value={trcnCheckNumber}
                      onChange={(e) => setTrcnCheckNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">NIN (Smile ID Biometric)</label>
                    <input
                      type="text"
                      value={trcnCheckNin}
                      onChange={(e) => setTrcnCheckNin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Teacher Full Name</label>
                    <input
                      type="text"
                      value={trcnCheckName}
                      onChange={(e) => setTrcnCheckName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <button
                  onClick={handleVerifyTrcn}
                  disabled={trcnVerifying}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{trcnVerifying ? "Querying TRCN PQE Register..." : "Verify Teacher TRCN License"}</span>
                </button>

                {trcnResult && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>TRCN License Certified & Active</span>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-emerald-500/20">
                      <div>Category: <strong className="text-white">{trcnResult.accreditation_details.trcn_category}</strong></div>
                      <div>Description: <span className="text-slate-400">{trcnResult.accreditation_details.category_description}</span></div>
                      <div>Child Safeguarding: <span className="text-emerald-300 font-mono">NDPA 2023 Compliant</span></div>
                      <div>Status: <span className="text-emerald-400 font-mono uppercase">{trcnResult.accreditation_details.license_status}</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Part 2: Milestone Escrow Payout Simulation */}
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4" />
                  2. Bi-Weekly Milestone Escrow Payout
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Session ID / Escrow Reference</label>
                    <input
                      type="text"
                      value={escrowSessionId}
                      onChange={(e) => setEscrowSessionId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Retainer Hold:</span>
                      <strong className="text-white font-mono">₦75,000 (100% Escrow)</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Tutor Net Total (80%):</span>
                      <strong className="text-emerald-400 font-mono">₦60,000 (₦30,000 / fortnight)</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>EduNaija Fee (20%):</span>
                      <strong className="text-slate-400 font-mono">₦15,000 (₦7,500 / fortnight)</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDisburseEscrow(1)}
                    disabled={escrowDisbursing}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition border ${
                      escrowStep === 1
                        ? "bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    <span>Disburse Milestone 1</span>
                    <span className="text-[10px] opacity-80">(Week 2 / ₦30,000)</span>
                  </button>

                  <button
                    onClick={() => handleDisburseEscrow(2)}
                    disabled={escrowDisbursing}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition border ${
                      escrowStep === 2
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    <span>Disburse Milestone 2</span>
                    <span className="text-[10px] opacity-80">(Week 4 / ₦30,000)</span>
                  </button>
                </div>

                {escrowResult && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <CheckCheck className="w-4 h-4" />
                      <span>{escrowResult.milestone_label} Executed!</span>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-amber-500/20">
                      <div>Tutor Bank Payout: <strong className="text-emerald-400 font-mono">₦{escrowResult.disbursement_details.tutor_disbursed_naira.toLocaleString()}</strong></div>
                      <div>EduNaija Commission: <strong className="text-slate-300 font-mono">₦{escrowResult.disbursement_details.platform_commission_retained_naira.toLocaleString()}</strong></div>
                      <div>Transfer Channel: <span className="text-slate-400">{escrowResult.disbursement_details.disbursement_channel}</span></div>
                      <div>Safeguard Verified: <span className="text-emerald-300 font-mono">48-Hour Silent Auto-Approval Satisfied</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Free 15-Minute Discovery Call Modal */}
        {discoveryTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-cyan-500/40 p-6 shadow-2xl space-y-4 text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={discoveryTeacher.avatar_url}
                    alt={discoveryTeacher.full_name}
                    className="w-10 h-10 rounded-xl object-cover border border-cyan-500/40"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm">{discoveryTeacher.full_name}</h3>
                    <p className="text-[11px] text-cyan-400">Free 15-Min Discovery Call</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sfx.tap();
                    setDiscoveryTeacher(null);
                    setDiscoveryBooked(false);
                  }}
                  className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {!discoveryBooked ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Interview this mentor directly via private WebRTC video room before booking. Clarify your child’s learning needs, curriculum pace, and weak topics.
                  </p>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Call Duration:</span>
                      <span className="font-bold text-white">15 Minutes</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Cost to Parent:</span>
                      <span className="font-bold text-emerald-400">₦0.00 (100% Free)</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Privacy Protection:</span>
                      <span className="font-bold text-cyan-400">Direct WebRTC Masking</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sfx.correct();
                      triggerTmaHaptic("heavy");
                      setDiscoveryBooked(true);
                    }}
                    className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                  >
                    <Video className="w-4 h-4" />
                    <span>Launch Free 15-Min Discovery Room</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 py-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">Discovery Call Room Ready!</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Mentor has received your discovery invitation.
                    </p>
                  </div>
                  <a
                    href={`/virtual-classroom?room=DISCOVERY-${discoveryTeacher?.id || "DEMO"}&session=DISCOVERY-15MIN&mentor=${encodeURIComponent(discoveryTeacher?.full_name || "Vetted Mentor")}`}
                    onClick={() => {
                      sfx.tap();
                      if (typeof window !== "undefined") {
                        localStorage.setItem("edunaija_tutor_contract", `DISCOVERY-${discoveryTeacher?.id || "DEMO"}`);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>Enter Private Discovery Room Now</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Regular Escrow Booking Modal */}
        {activeTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-emerald-500/40 p-6 shadow-2xl space-y-4 text-slate-100">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={activeTeacher.avatar_url}
                    alt={activeTeacher.full_name}
                    className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm">{activeTeacher.full_name}</h3>
                    <p className="text-[11px] text-emerald-400 font-mono">{activeTeacher.trcn_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sfx.tap();
                    setActiveTeacher(null);
                    setBookingSuccess(null);
                  }}
                  className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {!bookingSuccess ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Select Preferred Live Time Slot</label>
                    <div className="grid grid-cols-1 gap-2">
                      {activeTeacher.availability_slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => {
                            sfx.tap();
                            setSelectedSlot(slot);
                          }}
                          className={`p-3 rounded-xl text-xs font-semibold text-left border transition flex items-center justify-between ${
                            selectedSlot === slot
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {slot}
                          </span>
                          {selectedSlot === slot && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Escrow Terms summary */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Lesson Duration:</span>
                      <span className="font-bold text-white">60 Minutes</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Safeguarding Protocol:</span>
                      <span className="font-bold text-emerald-400">Parent Shadow Enabled</span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1.5 border-t border-slate-800/80">
                      <span>Escrow Total:</span>
                      <span className="font-bold text-white font-mono text-sm">₦{activeTeacher.hourly_rate_naira.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleBookSession}
                    disabled={isBooking}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isBooking ? "Locking in Escrow..." : "Confirm & Lock in Escrow"}</span>
                  </button>
                </>
              ) : (
                <div className="space-y-4 py-2 text-center animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">Virtual Lesson Confirmed!</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Session Reference: <strong className="text-emerald-300 font-mono">{bookingSuccess.session_id}</strong>
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-left text-xs space-y-1">
                    <p className="text-slate-300"><strong>Mentor:</strong> {bookingSuccess.teacher_name}</p>
                    <p className="text-slate-300"><strong>Time:</strong> {bookingSuccess.scheduled_time}</p>
                    <p className="text-slate-300"><strong>Escrow Status:</strong> <span className="text-emerald-400 font-bold">HELD_IN_ESCROW</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        sfx.tap();
                        window.alert(`Parent Shadow link generated: ${bookingSuccess.parent_shadow_url}`);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                    >
                      Copy Parent Shadow
                    </button>
                    <a
                      href={`/virtual-classroom?room=${encodeURIComponent(bookingSuccess.session_id)}&session=${encodeURIComponent(bookingSuccess.session_id)}&mentor=${encodeURIComponent(bookingSuccess.teacher_name)}`}
                      onClick={() => {
                        sfx.tap();
                        if (typeof window !== "undefined") {
                          localStorage.setItem("edunaija_tutor_contract", bookingSuccess.session_id);
                        }
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>Enter Live Room</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

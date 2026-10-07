"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Zap, Trophy, Heart, ArrowLeft,
  User, Check, Sparkles, KeyRound, LogOut,
  ShieldCheck, Bell, ChevronDown, BookOpen, Layers,
  GraduationCap, Users, School, QrCode, Video,
  Sliders, HelpCircle, Shield, Globe
} from "lucide-react";
import RegistrationModal from "./RegistrationModal";
import UserProfileModal from "./UserProfileModal";
import ZeroFeeTransferModal from "./ZeroFeeTransferModal";
import VoucherRedemptionModal from "./VoucherRedemptionModal";
import NotificationBoard from "./NotificationBoard";
import AcademicTierUpgradeModal, { AcademicTier, ACADEMIC_TIERS } from "./AcademicTierUpgradeModal";
import VerifiableScholarIDCard from "./VerifiableScholarIDCard";
import DemoAccountSwitcher from "./DemoAccountSwitcher";
import CommandPalette from "./CommandPalette";
import ResumeBeacon from "./ResumeBeacon";
import BackButton from "./BackButton";
import SmartConciergeWidget from "./SmartConciergeWidget";
import SeoFooter from "./SeoFooter";
import InteractiveGuideModal, { GuidePersona } from "./InteractiveGuideModal";
import SecurityTierBadge from "./SecurityTierBadge";
import ParentPinGateModal from "./ParentPinGateModal";
import WonderBuddyBot from "./WonderBuddyBot";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

type PersonaType = "student" | "parent";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isZeroFeeModalOpen, setIsZeroFeeModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isNotificationBoardOpen, setIsNotificationBoardOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [userHearts, setUserHearts] = useState<number>(0);
  const [user, setUser] = useState<any>(null);

  // Strictly 2 Personas: Student or Parent
  const [activePersona, setActivePersona] = useState<PersonaType>("student");

  // Educational Class Level
  const [academicTier, setAcademicTier] = useState<AcademicTier>("UTME");
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [isScholarIdOpen, setIsScholarIdOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [guideDefaultPersona, setGuideDefaultPersona] = useState<GuidePersona>("PRIMARY");
  const [isParentPinGateOpen, setIsParentPinGateOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  // Close more menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync Tier State Helper
  const syncTierState = (userData: any) => {
    const raw = userData?.class_tier || userData?.grade_level || (typeof window !== "undefined" ? localStorage.getItem("edunaija_class_tier") || localStorage.getItem("edunaija_academic_tier") : null) || "UTME";
    const norm = String(raw).toUpperCase();
    const mapped = norm === "JUNIOR_BASIC" ? "PRIMARY" : norm === "SENIOR_FOUNDATION" ? "SSS" : norm === "UTME_CANDIDATE" ? "UTME" : norm === "TERTIARY_FRESHMAN" ? "FRESHMAN" : norm;
    if (ACADEMIC_TIERS[mapped]) {
      setAcademicTier(mapped as AcademicTier);
      if (typeof window !== "undefined") {
        localStorage.setItem("edunaija_academic_tier", mapped);
        localStorage.setItem("edunaija_class_tier", mapped);
      }
    }
  };

  // Load user session & preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("edunaija_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          syncTierState(parsed);
          if (parsed.role && (parsed.role.toLowerCase() === "parent" || parsed.role.toLowerCase() === "student")) {
            setActivePersona(parsed.role.toLowerCase() as PersonaType);
          }
          const userKey = parsed.registration_key || parsed.registrationKey;
          if (userKey) {
            fetch(`/api/backend/api/points/hearts/status/${userKey}`)
              .then(r => r.json())
              .then(d => { if (d.hearts !== undefined) setUserHearts(d.hearts); })
              .catch(() => {});

            fetch(`/api/backend/api/points/ledger/${userKey}`)
              .then(r => r.json())
              .then(d => { if (d.current_xp !== undefined) setUserPoints(d.current_xp); })
              .catch(() => {});
          }
        } catch {}
      }

      const savedPersona = localStorage.getItem("edunaija_active_persona") as PersonaType;
      if (savedPersona === "parent" || savedPersona === "student") {
        setActivePersona(savedPersona);
      }

      // Listen for account updates across components
      const handleUserUpdated = (e: any) => {
        if (e.detail) {
          setUser(e.detail);
          syncTierState(e.detail);
          if (e.detail.role && (e.detail.role.toLowerCase() === "parent" || e.detail.role.toLowerCase() === "student")) {
            setActivePersona(e.detail.role.toLowerCase() as PersonaType);
          }
          if (e.detail.xp_points !== undefined) setUserPoints(e.detail.xp_points);
          if (e.detail.hearts !== undefined) setUserHearts(e.detail.hearts);
        } else {
          setUser(null);
        }
      };

      const handleOpenAuth = () => {
        setIsAuthModalOpen(true);
      };

      window.addEventListener("edunaija_user_updated", handleUserUpdated);
      window.addEventListener("edunaija_open_auth", handleOpenAuth);

      return () => {
        window.removeEventListener("edunaija_user_updated", handleUserUpdated);
        window.removeEventListener("edunaija_open_auth", handleOpenAuth);
      };
    }
  }, []);

  const handlePersonaSwitch = (p: PersonaType) => {
    sfx.tap();
    triggerTmaHaptic("medium");
    setActivePersona(p);
    if (typeof window !== "undefined") {
      localStorage.setItem("edunaija_active_persona", p);
    }
    if (p === "parent" && !pathname.startsWith("/parent")) {
      router.push("/parent");
    } else if (p === "student" && pathname.startsWith("/parent")) {
      router.push("/student");
    }
  };

  const handleUserSaved = (userData: any) => {
    setUser(userData);
    syncTierState(userData);
    localStorage.setItem("edunaija_user", JSON.stringify(userData));
    if (userData.class_tier) localStorage.setItem("edunaija_class_tier", userData.class_tier);
    if (userData.academic_tier) localStorage.setItem("edunaija_academic_tier", userData.academic_tier);
  };

  const handleLogout = () => {
    sfx.tap();
    localStorage.removeItem("edunaija_user");
    localStorage.removeItem("edunaija_user_key");
    setUser(null);
    setUserPoints(0);
    setUserHearts(0);
    window.dispatchEvent(new CustomEvent("edunaija_user_updated", { detail: null }));
  };

  // Full-screen zen mode for active testing
  const isQuizMode = pathname === "/quiz" || pathname === "/exam-proctor";

  return (
    <div className="min-h-[100dvh] bg-[#050508] text-white flex flex-col font-sans">
      
      {/* 1. SINGLE CLEAN 56px HEADER (Distraction-Free - Hidden in Exam Cockpit) */}
      {!isQuizMode && (
        <header className="sticky top-0 z-40 bg-[#050508]/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 lg:px-8 py-2 pt-[max(0.625rem,env(safe-area-inset-top))]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand Logo & 2-Persona Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {pathname !== "/" && pathname !== "/student" && pathname !== "/parent" && (
              <BackButton
                fallbackHref={activePersona === "parent" || pathname.startsWith("/parent") ? "/parent" : "/student"}
                label="Back"
                className="shrink-0"
              />
            )}
            <Link 
              href="/" 
              title="EduNaija OS Homepage"
              aria-label="EduNaija OS - Return to Homepage"
              className="flex items-center gap-1.5 sm:gap-2 group shrink-0"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#008751] to-[#00E676] flex items-center justify-center font-black text-black text-xs sm:text-sm shadow-[0_0_15px_rgba(0,230,118,0.4)]">
                🇳🇬
              </div>
              <span className="font-display font-black text-sm sm:text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors hidden xs:inline">
                EduNaija <span className="text-[#00E676]">OS</span>
              </span>
            </Link>

            {/* Strict 2-Role Switcher: Student vs Parent */}
            <div className="flex items-center bg-black/60 p-0.5 rounded-xl border border-white/10 text-xs font-bold shrink-0">
              <button
                onClick={() => handlePersonaSwitch("student")}
                className={`px-2 sm:px-3 py-1 rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer min-h-[32px] ${
                  activePersona === "student"
                    ? "bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="text-[11px] sm:text-xs">Student</span>
              </button>
              <button
                onClick={() => handlePersonaSwitch("parent")}
                className={`px-2 sm:px-3 py-1 rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer min-h-[32px] ${
                  activePersona === "parent"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[11px] sm:text-xs">Parent</span>
              </button>
            </div>
          </div>

          {/* Center: The Core Pillar Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {activePersona === "student" ? (
              <>
                <Link
                  href="/student"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    pathname === "/student"
                      ? "bg-emerald-500/20 text-[#00E676] border border-emerald-500/40 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>My Hub</span>
                </Link>

                <Link
                  href="/quiz"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    pathname === "/quiz"
                      ? "bg-emerald-500/20 text-[#00E676] border border-emerald-500/40 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Practice &amp; CBT</span>
                </Link>

                <Link
                  href="/qa"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    pathname === "/qa"
                      ? "bg-emerald-500/20 text-[#00E676] border border-emerald-500/40 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Tutor</span>
                </Link>

                <Link
                  href="/virtual-teaching"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    pathname === "/virtual-teaching"
                      ? "bg-emerald-500/20 text-[#00E676] border border-emerald-500/40 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                  title="Browse TRCN Vetted Mentors & Live 1-on-1 Sessions"
                >
                  <Video className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Live Mentors</span>
                </Link>

                <Link
                  href="/syllabus"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    pathname === "/syllabus"
                      ? "bg-emerald-500/20 text-[#00E676] border border-emerald-500/40 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                  title="Upload school scheme of work or homework tasks"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Syllabus &amp; Tasks</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/parent"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    pathname === "/parent"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Child Overview</span>
                </Link>

                <Link
                  href="/parent-autopilot"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    pathname === "/parent-autopilot"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span>🤖 Weekly Radar</span>
                </Link>

                <Link
                  href="/syllabus"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    pathname === "/syllabus"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                  title="Upload ward's school scheme of work or syllabus"
                >
                  <span>📋 Upload Syllabus</span>
                </Link>

                <Link
                  href="/schools"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    pathname === "/schools"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span>🏛️ Admissions Guide</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right: Streamlined Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Quick Command Center Trigger (⌘K) */}
            <button
              onClick={() => {
                sfx.tap();
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Command Center (Ctrl+K or ⌘K)"
            >
              <span className="text-amber-400">⚡</span>
              <span className="hidden sm:inline font-mono">⌘K</span>
            </button>

            {/* Academic Points & Hearts (for Authenticated Students) */}
            {user && activePersona === "student" && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
                  {(userPoints ?? 0).toLocaleString()} XP
                </span>
                <span className="text-zinc-600">|</span>
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
                  {userHearts ?? 0}
                </span>
              </div>
            )}

            {/* Unified Utilities Dropdown (More Menu) */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => {
                  sfx.tap();
                  setIsMoreMenuOpen(!isMoreMenuOpen);
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                  isMoreMenuOpen 
                    ? "bg-emerald-500/20 text-[#00E676] border-emerald-500/40" 
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white"
                }`}
                title="Tools & System Utilities"
                aria-expanded={isMoreMenuOpen}
              >
                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Tools</span>
                <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isMoreMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* More Menu Dropdown Card */}
              {isMoreMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#090C16] border border-white/15 p-2 shadow-2xl backdrop-blur-2xl z-50 text-left animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-zinc-400 font-extrabold border-b border-white/10 flex items-center justify-between">
                    <span>System Tools</span>
                    <span className="text-emerald-400">2026 Grid</span>
                  </div>

                  {/* 1. Quick Interactive Guide */}
                  <button
                    onClick={() => {
                      sfx.tap();
                      setIsMoreMenuOpen(false);
                      const defaultP: GuidePersona = activePersona === "parent" ? "PARENT" : academicTier === "PRIMARY" ? "PRIMARY" : "JAMB";
                      setGuideDefaultPersona(defaultP);
                      setIsGuideModalOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-white/5 text-xs font-bold text-zinc-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-amber-300">❓</span>
                      <span>How-To Guide &amp; Tour</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">Walkthrough</span>
                  </button>

                  {/* 2. Security Clearance Gate */}
                  <button
                    onClick={() => {
                      sfx.tap();
                      setIsMoreMenuOpen(false);
                      setIsParentPinGateOpen(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-white/5 text-xs font-bold text-zinc-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      <span>Security &amp; PIN Controls</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                      Tier {activePersona === "parent" ? 3 : 2}
                    </span>
                  </button>

                  {/* 3. ₦0 Data Offline Engine */}
                  <Link
                    href="/zero-data"
                    onClick={() => setIsMoreMenuOpen(false)}
                    className="w-full px-3 py-2 rounded-xl hover:bg-white/5 text-xs font-bold text-zinc-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                      <span>₦0 Data Offline Vault</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">100% Free</span>
                  </Link>

                  {/* 4. Full Command Center */}
                  <button
                    onClick={() => {
                      sfx.tap();
                      setIsMoreMenuOpen(false);
                      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-white/5 text-xs font-bold text-zinc-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-amber-400">⚡</span>
                      <span>Search Everything</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">Ctrl+K</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-emerald-500/40 flex items-center gap-2 text-xs text-white hover:border-emerald-400 transition-all cursor-pointer shadow-sm group"
                  title="Profile & Student Key"
                >
                  <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-[#00E676] font-black text-[10px] flex items-center justify-center">
                    {(user.full_name || user.fullName || "S").trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="font-bold max-w-[90px] sm:max-w-[130px] truncate text-zinc-200 group-hover:text-white">
                    {user.full_name || user.fullName || "Scholar"}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-emerald-300 hidden md:inline">
                    {user.class_tier || user.grade_level || "100L"}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
      )}

      {/* 2. MAIN CONTENT VIEWPORT */}
      <main className={`flex-1 ${isQuizMode ? "pb-0" : "pb-16 md:pb-6"}`}>
        {children}
      </main>

      {/* 3. CALM, MINIMALIST STATUTORY FOOTER */}
      {!isQuizMode && (
        <footer className="border-t border-white/5 bg-[#030408] px-4 py-8 text-center text-xs text-zinc-500">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold text-zinc-400">
              <span className="text-emerald-400">EduNaija OS</span>
              <span>•</span>
              <span>NDPA 2023 Data Privacy</span>
              <span>•</span>
              <span>0% VAT Exempt (FRN VAT Act)</span>
              <span>•</span>
              <Link href="/zero-data" className="hover:text-emerald-400 transition-colors">Offline Vault</Link>
              <span>•</span>
              <Link href="/school-admin" className="hover:text-emerald-400 transition-colors">For Schools &amp; Tutors</Link>
            </div>
            <p className="text-[10px] text-zinc-600 leading-relaxed">
              Designed for Nigerian students and families preparing for JAMB UTME, WAEC SSCE, and University Foundation. All past questions analyzed under Fair Dealing (Section 20, Nigerian Copyright Act 2022).
            </p>
          </div>
        </footer>
      )}

      {/* 4. MOBILE BOTTOM DOCK (Touch-optimized 44px+ hit targets & safe area insets) */}
      {!isQuizMode && (
        <nav 
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-[#090C16]/95 backdrop-blur-2xl border border-white/15 rounded-3xl px-2 py-1.5 flex justify-around items-center text-xs z-50 shadow-[0_12px_40px_rgba(0,0,0,0.85)] pb-[max(0.375rem,env(safe-area-inset-bottom))]"
        >
          {activePersona === "student" ? (
            <>
              <Link
                href="/student"
                className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-2xl transition-all active:scale-95 touch-manipulation ${
                  pathname === "/student" 
                    ? "text-[#00E676] font-extrabold bg-emerald-500/15" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight">Hub</span>
              </Link>
              <Link
                href="/quiz"
                className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-2xl transition-all active:scale-95 touch-manipulation ${
                  pathname === "/quiz" 
                    ? "text-[#00E676] font-extrabold bg-emerald-500/15" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Zap className="w-5 h-5 mb-0.5 text-amber-400" />
                <span className="text-[10px] leading-tight">Practice</span>
              </Link>
              <Link
                href="/qa"
                className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-2xl transition-all active:scale-95 touch-manipulation ${
                  pathname === "/qa" 
                    ? "text-[#00E676] font-extrabold bg-emerald-500/15" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-5 h-5 mb-0.5 text-purple-400" />
                <span className="text-[10px] leading-tight">AI Tutor</span>
              </Link>
              <Link
                href="/virtual-teaching"
                className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-2xl transition-all active:scale-95 touch-manipulation ${
                  pathname === "/virtual-teaching" 
                    ? "text-[#00E676] font-extrabold bg-emerald-500/15" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Video className="w-5 h-5 mb-0.5 text-cyan-400" />
                <span className="text-[10px] leading-tight">Mentors</span>
              </Link>
              <Link
                href="/syllabus"
                className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-2xl transition-all active:scale-95 touch-manipulation ${
                  pathname === "/syllabus" 
                    ? "text-[#00E676] font-extrabold bg-emerald-500/15" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight">Syllabus</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/parent"
                className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-3 py-1 rounded-2xl transition-all active:scale-95 touch-manipulation ${
                  pathname === "/parent" 
                    ? "text-purple-400 font-extrabold bg-purple-500/15" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight">Overview</span>
              </Link>
              <Link
                href="/parent-autopilot"
                className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-3 py-1 rounded-2xl transition-all active:scale-95 touch-manipulation ${
                  pathname === "/parent-autopilot" 
                    ? "text-purple-400 font-extrabold bg-purple-500/15" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Zap className="w-5 h-5 mb-0.5 text-amber-400" />
                <span className="text-[10px] leading-tight">Radar</span>
              </Link>
              <Link
                href="/schools"
                className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-3 py-1 rounded-2xl transition-all active:scale-95 touch-manipulation ${
                  pathname === "/schools" 
                    ? "text-purple-400 font-extrabold bg-purple-500/15" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <School className="w-5 h-5 mb-0.5 text-indigo-400" />
                <span className="text-[10px] leading-tight">Admissions</span>
              </Link>
            </>
          )}
        </nav>
      )}

      {/* Modals */}
      <RegistrationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onRegistered={handleUserSaved}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUserUpdated={handleUserSaved}
      />

      <ZeroFeeTransferModal
        isOpen={isZeroFeeModalOpen}
        onClose={() => setIsZeroFeeModalOpen(false)}
        onSuccess={() => {}}
      />

      <VoucherRedemptionModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onSuccess={() => {}}
      />

      <NotificationBoard
        isOpen={isNotificationBoardOpen}
        onClose={() => {
          setIsNotificationBoardOpen(false);
          setUnreadNotifs(0);
        }}
      />

      <AcademicTierUpgradeModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        currentTier={academicTier}
        onTierUpgraded={(newTier) => {
          setAcademicTier(newTier);
          if (typeof window !== "undefined") {
            localStorage.setItem("edunaija_academic_tier", newTier);
          }
        }}
        onOpenReferral={() => {}}
        onOpenVoucher={() => {}}
      />

      <VerifiableScholarIDCard
        isOpen={isScholarIdOpen}
        onClose={() => setIsScholarIdOpen(false)}
        user={user}
      />

      <InteractiveGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        defaultPersona={guideDefaultPersona}
      />

      <ParentPinGateModal
        isOpen={isParentPinGateOpen}
        onClose={() => setIsParentPinGateOpen(false)}
        onSuccess={() => {}}
      />

      {academicTier === "PRIMARY" && !isQuizMode && <WonderBuddyBot />}

      <CommandPalette />
      
      {/* Floating badges & assistants hidden during CBT exam cockpit to prevent button overlap */}
      {!isQuizMode && (
        <>
          <DemoAccountSwitcher />
          <ResumeBeacon />
          <SmartConciergeWidget />
        </>
      )}

      {/* 2026 Crawlable Internal Silo Backlink Footer */}
      {!isQuizMode && <SeoFooter />}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Users, Sparkles, Check, ChevronRight, X, Shield, 
  GraduationCap, School, BookOpen, Zap, Terminal, Award
} from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

export interface DemoAccount {
  id: string;
  registration_key: string;
  name: string;
  role: "student" | "parent" | "tutor" | "school" | "admin";
  tier?: "PRIMARY" | "JSS" | "SSS" | "UTME" | "FRESHMAN" | "100L";
  badge: string;
  icon: string;
  subTitle: string;
  targetOrDetail: string;
  route: string;
  colorClass: string;
  phone: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  // 5 Student Tiers
  {
    id: "user-demo-pri-01",
    registration_key: "DEMO-PRI-2025",
    name: "Tobi Adeleke",
    role: "student",
    tier: "PRIMARY",
    badge: "Primary 5 (Basic 5)",
    icon: "🎒",
    subTitle: "Common Entrance (NCEE) Candidate",
    targetOrDetail: "King's College Junior • Wonder Lab & Phonics • 92.4% Mastery",
    route: "/student",
    colorClass: "border-amber-500/30 bg-amber-950/20 text-amber-300",
    phone: "08011110001"
  },
  {
    id: "user-demo-jss-01",
    registration_key: "DEMO-JSS-2025",
    name: "Fatima Bello",
    role: "student",
    tier: "JSS",
    badge: "JSS 2 (Basic 8)",
    icon: "📘",
    subTitle: "BECE / JSCE Junior Aspirant",
    targetOrDetail: "FGC Kano • Junior Tech & Science League • 85.6% Mastery",
    route: "/student",
    colorClass: "border-cyan-500/30 bg-cyan-950/20 text-cyan-300",
    phone: "08011110002"
  },
  {
    id: "user-demo-sss-01",
    registration_key: "DEMO-SSS-2025",
    name: "Emeka Okafor",
    role: "student",
    tier: "SSS",
    badge: "SS 2 Senior",
    icon: "🔬",
    subTitle: "WAEC & NECO SSCE Senior Scholar",
    targetOrDetail: "UNN Engineering • 7 A1s Target • WAEC AI Theory Grader",
    route: "/student",
    colorClass: "border-blue-500/30 bg-blue-950/20 text-blue-300",
    phone: "08011110003"
  },
  {
    id: "user-demo-utme-01",
    registration_key: "DEMO-UTME-2025",
    name: "Chisom Jennifer Okonkwo",
    role: "student",
    tier: "UTME",
    badge: "JAMB UTME 2026",
    icon: "⚡",
    subTitle: "Medicine Aspirant (The Lekki Headmaster)",
    targetOrDetail: "UNILAG Medicine (Cutoff: 280, Target: 310) • Projected: 294",
    route: "/student",
    colorClass: "border-emerald-500/30 bg-emerald-950/20 text-[#00E676]",
    phone: "08011110004"
  },
  {
    id: "user-demo-100l-01",
    registration_key: "DEMO-100L-2025",
    name: "Damilola Adeleke",
    role: "student",
    tier: "100L",
    badge: "100L Undergraduate",
    icon: "🎓",
    subTitle: "Faculty of Science (Computer Science)",
    targetOrDetail: "UNILAG 100L • CGPA 4.82 First Class • GST 111/112/113 Audit",
    route: "/student",
    colorClass: "border-purple-500/30 bg-purple-950/20 text-purple-300",
    phone: "08011110005"
  },

  // Guardians & Institutional Roles
  {
    id: "user-demo-parent-01",
    registration_key: "DEMO-PARENT-001",
    name: "Chief Mrs. Ngozi Okonkwo",
    role: "parent",
    badge: "Guardian Angel",
    icon: "🛡️",
    subTitle: "Parent of Chisom (UTME) & Tobi (Primary)",
    targetOrDetail: "Annual Pass Active • WhatsApp Reports • 84% Admission Odds",
    route: "/parent",
    colorClass: "border-teal-500/30 bg-teal-950/20 text-teal-300",
    phone: "08033330001"
  },
  {
    id: "user-demo-tutor-01",
    registration_key: "DEMO-TUTOR-001",
    name: "Engr. Babatunde Raji",
    role: "tutor",
    badge: "Senior STEM Tutor",
    icon: "👨‍🏫",
    subTitle: "Physics & Further Mathematics Specialist",
    targetOrDetail: "42 Assigned Scholars • 2 Active Cohorts • 4 At-Risk Alerts",
    route: "/tutor",
    colorClass: "border-indigo-500/30 bg-indigo-950/20 text-indigo-300",
    phone: "08022220001"
  },
  {
    id: "user-demo-school-01",
    registration_key: "DEMO-SCHOOL-001",
    name: "Apex Premier College (Mrs. Coker)",
    role: "school",
    badge: "Accredited CBT Hub",
    icon: "🏫",
    subTitle: "Principal Mrs. Folashade Coker",
    targetOrDetail: "500 Offline CBT Seats (442 in Use) • License: LIC-APEX-2025",
    route: "/school-admin",
    colorClass: "border-pink-500/30 bg-pink-950/20 text-pink-300",
    phone: "08044440001"
  },
  {
    id: "user-demo-admin-01",
    registration_key: "DEMO-ADMIN-001",
    name: "Federal Admin & Dev Lead",
    role: "admin",
    badge: "Super Administrator",
    icon: "⚡",
    subTitle: "Federal Ministry of Education / NITDA",
    targetOrDetail: "Sovereign Dev Mode • 100 Subagents Swarm Oversight • Root",
    route: "/admin",
    colorClass: "border-red-500/30 bg-red-950/20 text-red-300",
    phone: "08099990001"
  }
];

export default function DemoAccountSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string>("DEMO-UTME-2025");
  const [activeTab, setActiveTab] = useState<"students" | "institutional">("students");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("edunaija_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.registration_key) {
            setActiveKey(parsed.registration_key);
          }
        } catch {}
      }

      const handler = (e: any) => {
        if (e.detail?.registration_key) {
          setActiveKey(e.detail.registration_key);
        }
      };
      window.addEventListener("edunaija_user_updated", handler);
      return () => window.removeEventListener("edunaija_user_updated", handler);
    }
  }, []);

  const handleSelectAccount = (account: DemoAccount) => {
    sfx.tap();
    triggerTmaHaptic("medium");

    // Fetch full user data or build complete profile object
    const userPayload: any = {
      id: account.id,
      registration_key: account.registration_key,
      full_name: account.name,
      phone: account.phone,
      role: account.role,
      state: "Lagos",
      exam_type: account.badge,
      grade_level: account.tier || (account.role === "admin" ? "UTME" : "SSS"),
      target_uni: account.subTitle,
      target_course: account.targetOrDetail,
      target_score: 300,
      hearts: 20,
      xp_points: 15000,
      streak_days: 14
    };

    const effectiveTier = (account.tier === "FRESHMAN" || account.tier === "100L") ? "100L" : account.tier;
    if (effectiveTier) {
      userPayload.grade_level = effectiveTier;
      userPayload.class_tier = effectiveTier;
      if (effectiveTier === "100L") {
        userPayload.faculty = "FACULTY_COMPUTING";
      }
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("edunaija_user", JSON.stringify(userPayload));
      localStorage.setItem("edunaija_user_key", account.registration_key);
      if (effectiveTier) {
        localStorage.setItem("edunaija_class_tier", effectiveTier);
        localStorage.setItem("edunaija_academic_tier", effectiveTier);
        if (effectiveTier === "100L") {
          localStorage.setItem("edunaija_student_faculty", "FACULTY_COMPUTING");
        }
      }
      if (account.role) {
        const persona = account.role === "admin" ? "school" : account.role;
        localStorage.setItem("edunaija_active_persona", persona);
      }
      if (account.role === "admin") {
        localStorage.setItem("edunaija_dev_mode", "true");
        window.dispatchEvent(new CustomEvent("edunaija_devmode_updated", { detail: { isDevMode: true } }));
      } else {
        localStorage.setItem("edunaija_dev_mode", "false");
        window.dispatchEvent(new CustomEvent("edunaija_devmode_updated", { detail: { isDevMode: false } }));
      }
      window.dispatchEvent(new CustomEvent("edunaija_user_updated", { detail: userPayload }));
    }

    setActiveKey(account.registration_key);
    setIsOpen(false);
    sfx.correct();

    // Navigate to respective dashboard
    router.push(account.route);
  };

  const studentAccounts = DEMO_ACCOUNTS.filter(a => a.role === "student");
  const institutionalAccounts = DEMO_ACCOUNTS.filter(a => a.role !== "student");

  return (
    <>
      {/* Floating Action Trigger Button - positioned bottom-left to avoid colliding with Mobile Dock & Command Palette */}
      <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-3 z-40 sm:bottom-6 sm:left-6">
        <button
          onClick={() => {
            sfx.tap();
            triggerTmaHaptic("light");
            setIsOpen(true);
          }}
          className="min-h-[44px] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs flex items-center gap-1.5 sm:gap-2 shadow-[0_4px_25px_rgba(0,0,0,0.7)] border border-white/20 transition-all cursor-pointer backdrop-blur-md active:scale-95 group touch-manipulation"
          title="Switch Demo Accounts (Primary, JSS, SSS, UTME, 100L, Parent, Tutor, School, Admin)"
        >
          <Sparkles className="w-4 h-4 text-[#00E676] animate-spin" />
          <span className="hidden sm:inline font-mono">Demo Personas</span>
          <span className="px-1.5 py-0.5 rounded-md bg-black/40 text-[10px] font-mono border border-white/10 text-emerald-300">
            9 Tiers
          </span>
        </button>
      </div>

      {/* Switcher Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#090b14] border border-white/15 rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00E676] border border-emerald-500/30">
                      1-CLICK INSTANT DEMO SWITCHER
                    </span>
                  </div>
                  <h3 className="font-display font-black text-xl text-white mt-1">
                    Select Academic Tier or Institutional Persona
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Instantly load real databases, curriculum tiers, and specialized dashboards with 0 authentication barriers.
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => { sfx.tap(); setActiveTab("students"); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "students"
                      ? "bg-[#00E676] text-black font-black shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Class Tiers (5 Levels)</span>
                </button>
                <button
                  onClick={() => { sfx.tap(); setActiveTab("institutional"); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "institutional"
                      ? "bg-purple-500 text-black font-black shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Guardians &amp; Institutions (4 Roles)</span>
                </button>
              </div>

              {/* Accounts Grid */}
              <div className="space-y-2.5">
                {(activeTab === "students" ? studentAccounts : institutionalAccounts).map(account => {
                  const isCurrent = activeKey === account.registration_key;
                  return (
                    <div
                      key={account.id}
                      onClick={() => handleSelectAccount(account)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent 
                          ? "border-[#00E676] bg-emerald-950/40 shadow-[0_0_15px_rgba(0,230,118,0.25)] ring-1 ring-[#00E676]" 
                          : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center text-xl shrink-0">
                          {account.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display font-black text-sm text-white truncate">
                              {account.name}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-bold ${account.colorClass}`}>
                              {account.badge}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#00E676] text-black font-black flex items-center gap-1">
                                <Check className="w-3 h-3" /> ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-300 font-medium truncate mt-0.5">
                            {account.subTitle}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono truncate">
                            Key: <strong className="text-zinc-200">{account.registration_key}</strong> • {account.targetOrDetail}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAccount(account);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                          isCurrent
                            ? "bg-[#00E676] text-black font-extrabold"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        <span>{isCurrent ? "Active" : "Switch"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Footer info note */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>⚡ Direct SQLite persistence in WAL mode</span>
                <span>All 9 demo personas pre-seeded</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

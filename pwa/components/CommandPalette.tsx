"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Command, X, ArrowRight, Sparkles, GraduationCap,
  Shield, Users, Building2, BookOpen, Brain, Zap, Globe,
  Coins, Terminal, Award, HelpCircle, ArrowUpRight, Flame,
  Compass, ShieldAlert, Headphones, Activity, Video, Trophy
} from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

interface CommandItem {
  id: string;
  title: string;
  category: "Demographics & Tiers" | "Fast Jump" | "Live Encyclopedic Wiki" | "Forex & Financials" | "World-First EdTech Engines";
  icon: any;
  action: () => void;
  subtitle?: string;
  badge?: string;
}

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiResult, setWikiResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      sfx.tap();
      triggerTmaHaptic("light");
    } else {
      setQuery("");
      setWikiResult(null);
    }
  }, [isOpen]);

  const switchAccount = (accountKey: string, tier: string, role: string, path: string) => {
    sfx.correct();
    triggerTmaHaptic("medium");
    if (typeof window !== "undefined") {
      fetch(`/api/backend/auth/me/${accountKey}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && data.user) {
            localStorage.setItem("edunaija_user", JSON.stringify(data.user));
            localStorage.setItem("edunaija_class_tier", tier);
            localStorage.setItem("edunaija_academic_tier", tier);
            localStorage.setItem("edunaija_active_persona", role);
            if (accountKey === "DEMO-ADMIN-001") {
              localStorage.setItem("edunaija_dev_mode", "true");
            }
            window.dispatchEvent(new CustomEvent("edunaija_user_updated", { detail: data.user }));
            window.dispatchEvent(new CustomEvent("edunaija_devmode_updated", { detail: { isDevMode: accountKey === "DEMO-ADMIN-001" } }));
            router.push(path);
          }
        })
        .catch(() => {
          router.push(path);
        });
    }
    setIsOpen(false);
  };

  const handleWikiSearch = async (term: string) => {
    if (!term.trim()) return;
    setWikiLoading(true);
    sfx.tap();
    try {
      const res = await fetch(`/api/backend/api/realtime/wiki/${encodeURIComponent(term.trim())}`);
      const data = await res.json();
      setWikiResult(data);
      sfx.correct();
    } catch {
      setWikiResult({
        title: term,
        extract: `Could not reach live Wikipedia server for ${term}. Please verify backend network connection.`,
        source: "Offline Diagnostic Notice"
      });
    } finally {
      setWikiLoading(false);
    }
  };

  const baseItems: CommandItem[] = [
    // Personas & Tiers
    {
      id: "persona-pri",
      title: "Switch to Tobi Adeleke (Primary 5)",
      category: "Demographics & Tiers",
      subtitle: "Common Entrance (NCEE), Phonics, Wonder Lab & Mental Maths",
      icon: GraduationCap,
      badge: "PRIMARY BASIC 5",
      action: () => switchAccount("DEMO-PRI-2025", "PRIMARY", "student", "/student")
    },
    {
      id: "persona-jss",
      title: "Switch to Fatima Bello (JSS 2)",
      category: "Demographics & Tiers",
      subtitle: "BECE Junior WAEC, Basic Science, Introductory Tech",
      icon: BookOpen,
      badge: "JSS 2",
      action: () => switchAccount("DEMO-JSS-2025", "JSS", "student", "/student")
    },
    {
      id: "persona-sss",
      title: "Switch to Emeka Okafor (SS 2)",
      category: "Demographics & Tiers",
      subtitle: "WAEC SSCE Prep, AI Theory Grader, Organic Chemistry",
      icon: Award,
      badge: "SSS 2 (WAEC)",
      action: () => switchAccount("DEMO-SSS-2025", "SSS", "student", "/student")
    },
    {
      id: "persona-utme",
      title: "Switch to Chisom Jennifer Okonkwo (JAMB 2026)",
      category: "Demographics & Tiers",
      subtitle: "UNILAG Medicine & Surgery • 400-Point Mock • Lekki Headmaster",
      icon: Zap,
      badge: "UTME 2026",
      action: () => switchAccount("DEMO-UTME-2025", "UTME", "student", "/student")
    },
    {
      id: "persona-100l",
      title: "Switch to Damilola Adeleke (100L Undergraduate)",
      category: "Demographics & Tiers",
      subtitle: "UNILAG Computer Science • 5.0 CGPA Simulator • GST 111/112/113",
      icon: Terminal,
      badge: "100 LEVEL",
      action: () => switchAccount("DEMO-100L-2025", "FRESHMAN", "student", "/student")
    },
    {
      id: "persona-parent",
      title: "Switch to Chief Mrs. Ngozi Okonkwo (Parent / Guardian)",
      category: "Demographics & Tiers",
      subtitle: "Multi-Ward Oversight (Chisom & Tobi) • Phonics & Screen Time",
      icon: Shield,
      badge: "GUARDIAN",
      action: () => switchAccount("DEMO-PARENT-001", "UTME", "parent", "/parent")
    },
    {
      id: "persona-tutor",
      title: "Switch to Engr. Babatunde Raji (Senior STEM Tutor)",
      category: "Demographics & Tiers",
      subtitle: "42 Scholars • 2 Active Cohorts • At-Risk Diagnostic Alerts",
      icon: Users,
      badge: "TUTOR",
      action: () => switchAccount("DEMO-TUTOR-001", "SSS", "tutor", "/tutor")
    },
    {
      id: "persona-school",
      title: "Switch to Apex Premier College (School Admin)",
      category: "Demographics & Tiers",
      subtitle: "500 Offline CBT Lab Seats • Term License LIC-APEX-2025-GOLD",
      icon: Building2,
      badge: "SCHOOL ADMIN",
      action: () => switchAccount("DEMO-SCHOOL-001", "SSS", "school", "/school-admin")
    },
    {
      id: "persona-admin",
      title: "Switch to Federal Sovereign Admin & Root Lead",
      category: "Demographics & Tiers",
      subtitle: "Developer Mode Bypasses • 100 Subagents Swarm • Master Telemetry",
      icon: Sparkles,
      badge: "DEV ROOT",
      action: () => switchAccount("DEMO-ADMIN-001", "UTME", "admin", "/admin")
    },

    // Fast Jumps
    {
      id: "jump-funding",
      title: "Scholarship Funding & Corporate Sponsors",
      category: "Fast Jump",
      subtitle: "Corporate CSR endowments, NGO scholarships & student funding pool",
      icon: Coins,
      badge: "/sponsors",
      action: () => { router.push("/sponsors"); setIsOpen(false); }
    },
    {
      id: "jump-referrals",
      title: "Referral Rewards & Airtime Vouchers",
      category: "Fast Jump",
      subtitle: "Invite classmates to earn +10 free hearts and ₦500 data vouchers",
      icon: Sparkles,
      badge: "/referral",
      action: () => { router.push("/referral"); setIsOpen(false); }
    },
    {
      id: "jump-competitions",
      title: "National Competitions & Multiplayer Battles",
      category: "Fast Jump",
      subtitle: "Live multiplayer battle rooms, clan tournaments & speed sprints",
      icon: Flame,
      badge: "/competition",
      action: () => { router.push("/competition"); setIsOpen(false); }
    },
    {
      id: "jump-institutions",
      title: "Accredited Universities & Poly Directory",
      category: "Fast Jump",
      subtitle: "Official accredited directories for Federal, State & Private universities",
      icon: Building2,
      badge: "/institutions",
      action: () => { router.push("/institutions"); setIsOpen(false); }
    },
    {
      id: "jump-career",
      title: "Career Pathfinder & JAMB CAPS Navigator",
      category: "Fast Jump",
      subtitle: "Secondary-to-Tertiary career guidance and subject combination matcher",
      icon: Compass,
      badge: "/career",
      action: () => { router.push("/career"); setIsOpen(false); }
    },
    {
      id: "jump-languages",
      title: "Bilingual Indigenous Languages (Yorùbá, Igbo, Hausa)",
      category: "Fast Jump",
      subtitle: "Dual-language audio phonics, Do-Re-Mi tonal markers & proverb vault",
      icon: Globe,
      badge: "/indigenous-voices",
      action: () => { router.push("/indigenous-voices"); setIsOpen(false); }
    },
    {
      id: "jump-playground",
      title: "Wonder Lab Interactive Quests",
      category: "Fast Jump",
      subtitle: "Hands-on science & gamified learning arena for young scholars",
      icon: Brain,
      badge: "/playground",
      action: () => { router.push("/playground"); setIsOpen(false); }
    },
    {
      id: "jump-live-classroom",
      title: "Encrypted WebRTC Live Classroom & Whiteboard",
      category: "Fast Jump",
      subtitle: "1-on-1 certified mentor live audio/video and interactive collaborative canvas",
      icon: Video,
      badge: "/virtual-classroom",
      action: () => { router.push("/virtual-classroom"); setIsOpen(false); }
    },
    {
      id: "jump-autopsy",
      title: "Diagnostic Weakness Autopsy Engine",
      category: "Fast Jump",
      subtitle: "Post-exam root cause breakdown, trap analysis and individualized remedy pack",
      icon: Trophy,
      badge: "/autopsy",
      action: () => { router.push("/autopsy"); setIsOpen(false); }
    },
    {
      id: "jump-cbt",
      title: "Full Proctored 400-Point CBT Mock Simulator",
      category: "Fast Jump",
      subtitle: "Timed simulation with anti-cheat lockdown & question jump matrix",
      icon: Zap,
      badge: "/quiz",
      action: () => { router.push("/quiz"); setIsOpen(false); }
    },
    {
      id: "jump-theory",
      title: "WAEC & SSCE AI Theory Grader",
      category: "Fast Jump",
      subtitle: "Step-by-step marking scheme rubrics with point allocation",
      icon: BookOpen,
      badge: "/theory",
      action: () => { router.push("/theory"); setIsOpen(false); }
    },
    {
      id: "jump-reader",
      title: "Prescribed Literature & Bionic Reader",
      category: "Fast Jump",
      subtitle: "Things Fall Apart, Lion & Jewel, Life Changer with Saccadic Bionic Acceleration",
      icon: BookOpen,
      badge: "/reader",
      action: () => { router.push("/reader"); setIsOpen(false); }
    },
    {
      id: "jump-cutoffs",
      title: "National University Cutoff & Aggregate Radar",
      category: "Fast Jump",
      subtitle: "Official 150+ Nigerian university formula aggregators",
      icon: GraduationCap,
      badge: "/admissions",
      action: () => { router.push("/admissions"); setIsOpen(false); }
    },
    {
      id: "jump-showdown",
      title: "Sunday 8:00 PM National Showdown Arena",
      category: "Fast Jump",
      subtitle: "Synchronized nationwide competitive exam league with cash prizes",
      icon: Flame,
      badge: "/showdown",
      action: () => { router.push("/showdown"); setIsOpen(false); }
    },
    {
      id: "jump-subagents",
      title: "100 Autonomous Subagents Swarm Directory",
      category: "Fast Jump",
      subtitle: "Directory across 10 specialized battalions with peer citations",
      icon: Brain,
      badge: "/subagents",
      action: () => { router.push("/subagents"); setIsOpen(false); }
    },

    // World-First EdTech Engines
    {
      id: "worldfirst-teach-ai",
      title: "The Protégé Effect: Teach AI Junior Temi",
      category: "World-First EdTech Engines",
      subtitle: "90% retention protocol — you teach AI peer via Socratic active recall",
      icon: Brain,
      badge: "/teach-ai",
      action: () => { router.push("/teach-ai"); setIsOpen(false); }
    },
    {
      id: "worldfirst-ghost-pacer",
      title: "Ghost Pacing Engine (Top 1% CBT Pacer)",
      category: "World-First EdTech Engines",
      subtitle: "Race live against translucent ghost of national top-1% scorer in CBT",
      icon: Zap,
      badge: "/quiz",
      action: () => { router.push("/quiz"); setIsOpen(false); }
    },
    {
      id: "worldfirst-oral-spectrogram",
      title: "Web Audio Acoustic Oral Examiner & Spectrogram",
      category: "World-First EdTech Engines",
      subtitle: "Live browser microphone FFT formant analysis (F1/F2) vs British RP",
      icon: Headphones,
      badge: "/oral-english",
      action: () => { router.push("/oral-english"); setIsOpen(false); }
    },
    {
      id: "worldfirst-stress-lab",
      title: "Exam Stress Inoculation Lab (SIT Protocol)",
      category: "World-First EdTech Engines",
      subtitle: "Deliberate cognitive pressure drills to inoculate against JAMB CBT panic",
      icon: ShieldAlert,
      badge: "/stress-lab",
      action: () => { router.push("/stress-lab"); setIsOpen(false); }
    },
    {
      id: "worldfirst-case-studies",
      title: "Socratic Street: Nigerian Case Studies",
      category: "World-First EdTech Engines",
      subtitle: "Apply physics, chemistry, biology and math to real-world Nigerian crises",
      icon: Compass,
      badge: "/case-study",
      action: () => { router.push("/case-study"); setIsOpen(false); }
    },

    // Forex & Financials
    {
      id: "forex-live",
      title: "Live Foreign Exchange & Tuition Cost Calculator",
      category: "Forex & Financials",
      subtitle: "Real-time USD, GBP, EUR to NGN rates & international vouchers",
      icon: Coins,
      badge: "LIVE API",
      action: () => {
        setQuery("forex");
        handleWikiSearch("Thermodynamics");
      }
    },

    // Live Wikipedia Concept Search Quick Shortcuts
    {
      id: "wiki-photosynthesis",
      title: "Wikipedia Concept: Photosynthesis (Biology)",
      category: "Live Encyclopedic Wiki",
      subtitle: "Live API: Chlorophyll light reactions & biochemical equations",
      icon: Globe,
      badge: "WIKI LIVE",
      action: () => handleWikiSearch("Photosynthesis")
    },
    {
      id: "wiki-thermodynamics",
      title: "Wikipedia Concept: Thermodynamics (Physics)",
      category: "Live Encyclopedic Wiki",
      subtitle: "Live API: First & second laws of thermodynamics, heat engines",
      icon: Globe,
      badge: "WIKI LIVE",
      action: () => handleWikiSearch("Thermodynamics")
    },
    {
      id: "wiki-calculus",
      title: "Wikipedia Concept: Calculus & Differentiation",
      category: "Live Encyclopedic Wiki",
      subtitle: "Live API: Derivatives, tangent slopes, and chain rule",
      icon: Globe,
      badge: "WIKI LIVE",
      action: () => handleWikiSearch("Calculus")
    },
    {
      id: "wiki-achebe",
      title: "Wikipedia Concept: Chinua Achebe (Literature)",
      category: "Live Encyclopedic Wiki",
      subtitle: "Live API: Things Fall Apart, African prose & literary critique",
      icon: Globe,
      badge: "WIKI LIVE",
      action: () => handleWikiSearch("Chinua Achebe")
    }
  ];

  const filteredItems = baseItems.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDownNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      } else if (query.trim()) {
        handleWikiSearch(query.trim());
      }
    }
  };

  return (
    <>
      {/* Raycast / Linear Obsidian Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-2xl bg-[#08090C] border border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Search Bar Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
                <Search className="w-5 h-5 text-emerald-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDownNav}
                  placeholder="Type a command, switch persona, or type any academic concept..."
                  className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(""); setWikiResult(null); }}
                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="hidden sm:flex items-center gap-1">
                  <kbd className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400">ESC</kbd>
                </div>
              </div>

              {/* Wiki Inspector Preview Card (if loaded) */}
              {wikiResult && (
                <div className="p-4 mx-4 mt-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-black to-teal-950/30 border border-emerald-500/30 text-white flex gap-3.5 relative overflow-hidden">
                  {wikiResult.thumbnail && (
                    <img
                      src={wikiResult.thumbnail}
                      alt={wikiResult.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        {wikiResult.display_title || wikiResult.title}
                      </h4>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00E676] font-bold">
                        {wikiResult.source || "Live Wikipedia"}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-1 line-clamp-3 leading-relaxed">
                      {wikiResult.extract}
                    </p>
                    {wikiResult.page_url && (
                      <a
                        href={wikiResult.page_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:underline mt-1.5"
                      >
                        Read Full Article on Wikipedia <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Scrollable Command List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {wikiLoading && (
                  <div className="py-6 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                    Querying real-time Wikipedia REST API...
                  </div>
                )}

                {filteredItems.length === 0 && !wikiLoading && (
                  <div className="py-10 text-center">
                    <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-xs text-zinc-400">No exact command matches found for &quot;{query}&quot;</p>
                    <button
                      onClick={() => handleWikiSearch(query)}
                      className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                    >
                      Look up &quot;{query}&quot; on Wikipedia Live API &rarr;
                    </button>
                  </div>
                )}

                {filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        sfx.tap();
                        item.action();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-emerald-500/15 via-white/[0.04] to-transparent border border-emerald-500/30 text-white"
                          : "text-zinc-400 hover:text-white border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-[#00E676] text-black shadow-[0_0_10px_rgba(0,230,118,0.4)]"
                              : "bg-white/5 text-zinc-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span className="truncate">{item.title}</span>
                            {item.badge && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 font-semibold shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-[#00E676] shrink-0">
                          <span>Execute</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Obsidian Bottom Status Footer */}
              <div className="px-4 py-2.5 border-t border-white/10 bg-black/40 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <div className="flex items-center gap-3">
                  <span><kbd className="px-1 py-0.5 rounded bg-white/5">↑↓</kbd> to navigate</span>
                  <span><kbd className="px-1 py-0.5 rounded bg-white/5">↵</kbd> to execute</span>
                  <span><kbd className="px-1 py-0.5 rounded bg-white/5">ESC</kbd> to close</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse"></span>
                  EduNaija Spotlight v2.0
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
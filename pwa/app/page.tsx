"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, Trophy, Shield, BookOpen, Users, Star, Zap, 
  ChevronRight, Bell, Sparkles, Award, ArrowRight, CheckCircle2, 
  Clock, School, Building2, Check, ExternalLink, Compass, Flame,
  FileText, Microscope, Radio, Laptop
} from "lucide-react";
import AIVisitorIntentEngine from "../components/AIVisitorIntentEngine";
import BentoModuleCard from "../components/BentoModuleCard";
import GithubHeroGlobe from "../components/GithubHeroGlobe";

type PersonaFocus = "student" | "parent" | "tutor" | "school";

const JAMB_CUTOFFS_2024 = [
  { university: "University of Lagos (UNILAG)", course: "Medicine & Surgery", cutoff: 270, model: "50:30:20" },
  { university: "University of Lagos (UNILAG)", course: "Law", cutoff: 240, model: "50:30:20" },
  { university: "University of Lagos (UNILAG)", course: "Computer Science", cutoff: 220, model: "50:30:20" },
  { university: "University of Ibadan (UI)", course: "Medicine & Surgery", cutoff: 260, model: "50:50" },
  { university: "University of Ibadan (UI)", course: "Law", cutoff: 250, model: "50:50" },
  { university: "Obafemi Awolowo University (OAU)", course: "Medicine & Surgery", cutoff: 250, model: "50:50" },
  { university: "Ahmadu Bello University (ABU)", course: "Medicine & Surgery", cutoff: 240, model: "60:20:20" },
  { university: "University of Nigeria, Nsukka (UNN)", course: "Medicine & Surgery", cutoff: 240, model: "50:30:20" },
  { university: "Lagos State University (LASU)", course: "Law", cutoff: 210, model: "50:50 (O-Level)" },
  { university: "Federal Univ of Tech Akure (FUTA)", course: "Computer Science", cutoff: 200, model: "50:30:20" },
];

const BENTO_SHOWCASE = [
  {
    title: "Official 2026 CBT Simulation & Ghost Pacer",
    subtitle: "JAMB UTME 400-Point Mock Terminal",
    description: "Race against the national top 1% benchmark. Zero-answer-leak hardware simulation with authentic 8-key mode.",
    href: "/exam-proctor",
    badge: "400pt Mock",
    badgeColor: "emerald",
    tag: "High-Speed CBT",
    icon: Laptop,
    accentGlow: "emerald" as const,
    colSpan: "col-span-12 md:col-span-8" as const,
    imageSrc: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
    actionLabel: "Launch CBT Exam Hall"
  },
  {
    title: "Prescribed Literature Bionic Reader",
    subtitle: "Saccadic Eye-Fixation Engine",
    description: "Read 'The Lekki Headmaster' and 'Things Fall Apart' 35% faster with neural voice audio and chapter quizzes.",
    href: "/reader",
    badge: "Bionic Reader",
    badgeColor: "cyan",
    tag: "Prescribed Texts",
    icon: BookOpen,
    accentGlow: "cyan" as const,
    colSpan: "col-span-12 md:col-span-4" as const,
    imageSrc: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
    actionLabel: "Open Bionic Reader"
  },
  {
    title: "WAEC Theory Grader & Step Autopsy",
    subtitle: "Method (M) & Accuracy (A) Feedback",
    description: "Instant rubric marking for Senior Science & Humanities theory papers with line-by-line derivation errors.",
    href: "/theory",
    badge: "AI Rubric",
    badgeColor: "purple",
    tag: "Senior SSS 1-3",
    icon: Microscope,
    accentGlow: "purple" as const,
    colSpan: "col-span-12 md:col-span-4" as const,
    imageSrc: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
    actionLabel: "Submit Theory Paper"
  },
  {
    title: "Sunday 8PM National Showdown League",
    subtitle: "36 States Cash Bounty Arena",
    description: "Live 50-player sprint arena. Real Elo ratings, inter-school clan rivalries, and ₦50,000 weekly cash prizes.",
    href: "/showdown",
    badge: "₦50k Bounty",
    badgeColor: "amber",
    tag: "National League",
    icon: Radio,
    accentGlow: "amber" as const,
    colSpan: "col-span-12 md:col-span-4" as const,
    imageSrc: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    actionLabel: "Enter Showdown Arena"
  },
  {
    title: "Course-to-Career & 5.0 CGPA Navigator",
    subtitle: "NUC Higher Education & Graduate Salaries",
    description: "Model First Class Honours units and connect directly to top Nigerian employers (Paystack, NLNG, PwC).",
    href: "/career",
    badge: "5.0 CGPA",
    badgeColor: "emerald",
    tag: "100L to Alum",
    icon: GraduationCap,
    accentGlow: "emerald" as const,
    colSpan: "col-span-12 md:col-span-4" as const,
    imageSrc: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    actionLabel: "Explore Careers"
  }
];

const STATS = [
  { value: "14,820+", label: "Active Nigerian Scholars" },
  { value: "37 States", label: "+ FCT Sovereign Atlas" },
  { value: "5,000+", label: "Verified Past Questions" },
  { value: "98.7%", label: "Admission Success Rate" },
];

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("edunaija_user");
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          setUser(parsed);
        } catch (e) {}
      }
    }

    // Fetch live educational news
    fetch("/api/backend/news/latest?limit=3")
      .then((r) => r.json())
      .then((data) => setNews(data.feeds || []))
      .catch(() => {
        setNews([
          { headline: "2026 UTME/DE Registration Protocols Released by JAMB", category: "JAMB", published_at: "2026-10-02T10:00:00Z" },
          { headline: "NERDC 2025 Revised Senior Secondary STEM Curriculum Live", category: "CURRICULUM", published_at: "2026-10-01T14:30:00Z" },
          { headline: "WAEC May/June Digital Certificate Portal Now Active", category: "WAEC", published_at: "2026-09-25T16:00:00Z" },
        ]);
      });
  }, []);

  return (
    <div className="min-h-screen text-white font-sans">
      
      {/* 1. Hero Title & Subtitle */}
      <section className="relative pt-8 md:pt-14 pb-4 px-4 text-center overflow-hidden max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
          <Zap className="w-3.5 h-3.5 fill-current" /> 🇳🇬 Universal Education Operating System for Nigerian Scholars
        </div>

        <h1 className="font-display font-black text-3xl md:text-5xl lg:text-6xl mb-4 leading-tight">
          Sovereign Learning Grid: From Primary to Campus &amp; High-Growth Careers
        </h1>

        <p className="text-zinc-300 text-sm md:text-base max-w-2xl mx-auto mb-6 leading-relaxed">
          The complete academic operating system: foundational science, proctored mock exams, WAEC theory step-marking, university 5.0 CGPA navigation, and top employer pathways.
        </p>

        {/* 2. Interactive 3D Holographic Sovereign Knowledge Globe & Mascots */}
        <GithubHeroGlobe />

        {/* 3. Interactive AI Visitor Intent Engine */}
        <AIVisitorIntentEngine />
      </section>

      {/* 3. Modern Bento Grid Feature Showcase */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> High-Performance Learning Infrastructure
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
              Curated Academic Cockpits &amp; Diagnostics
            </h2>
          </div>
          <Link
            href="/student"
            className="hidden sm:flex items-center gap-1 text-xs font-mono font-bold text-[#00E676] hover:underline cursor-pointer"
          >
            <span>Open Student Hub</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-12 gap-4 lg:gap-5">
          {BENTO_SHOWCASE.map((item, idx) => (
            <BentoModuleCard
              key={idx}
              title={item.title}
              subtitle={item.subtitle}
              description={item.description}
              href={item.href}
              badge={item.badge}
              badgeColor={item.badgeColor}
              tag={item.tag}
              icon={item.icon}
              imageSrc={item.imageSrc}
              accentGlow={item.accentGlow}
              colSpan={item.colSpan}
              actionLabel={item.actionLabel}
            />
          ))}
        </div>
      </section>

      {/* 4. Live Statutory Cutoff & Admissions Quotas */}
      <section className="py-10 px-4 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-widest">
                JAMB CAPS Statutory Benchmark Radar
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-black text-white mt-1">
                Official Competitive Cutoffs &amp; Quota Models
              </h3>
            </div>
            <Link
              href="/admissions"
              className="text-xs font-mono font-bold text-amber-300 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Explore All 40+ University Cutoffs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {JAMB_CUTOFFS_2024.slice(0, 6).map((c, i) => (
              <div key={i} className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-amber-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white line-clamp-1">{c.university}</span>
                  <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {c.cutoff}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-300 mt-1">{c.course}</div>
                <div className="text-[10px] font-mono text-zinc-500 mt-2">
                  Quota Model: <strong className="text-zinc-300">{c.model}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. National Trust & Observability Metrics */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#090b14]/70 border border-white/10 text-center">
              <div className="text-2xl sm:text-3xl font-display font-black text-[#00E676]">{s.value}</div>
              <div className="text-xs text-zinc-400 font-mono mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

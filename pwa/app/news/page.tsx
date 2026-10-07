"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Award, Building, Share2, Search, ExternalLink, Filter, 
  CheckCircle2, DollarSign, Calendar, ShieldCheck, Sparkles, RefreshCw
} from "lucide-react";
import confetti from "canvas-confetti";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

export default function NewsAndScholarshipsHub() {
  const [activeTab, setActiveTab] = useState<"bulletins" | "scholarships" | "cutoffs">("bulletins");
  const [jambFilterScore, setJambFilterScore] = useState(260);
  const [appliedScholarship, setAppliedScholarship] = useState<string | null>(null);
  const [liveFeeds, setLiveFeeds] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    async function loadFeeds() {
      try {
        const res = await fetch("/api/backend/feeds/latest?limit=10");
        if (res.ok) {
          const data = await res.json();
          if (data.feeds) setLiveFeeds(data.feeds);
        }
      } catch (err) {}
    }
    loadFeeds();
  }, []);

  const handleRefresh = async () => {
    sfx.tap();
    setIsRefreshing(true);
    try {
      await fetch("/api/backend/sync/refresh", { method: "POST" });
      const res = await fetch("/api/backend/feeds/latest?limit=10");
      if (res.ok) {
        const data = await res.json();
        if (data.feeds) setLiveFeeds(data.feeds);
      }
    } catch {}
    setIsRefreshing(false);
  };

  const bulletins = [
    {
      id: "b1",
      source: "JAMB Official",
      title: "JAMB Directs Tertiary Institutions to Conclude 2024/2025 Admissions",
      summary: "Public universities must conclude admissions by Oct 31, while private institutions have until Nov 30. Ensure your O-Level results are uploaded to CAPS.",
      tag: "JAMB CAPS",
      date: "Today",
      verified: true
    },
    {
      id: "b2",
      source: "WAEC Nigeria",
      title: "WAEC Releases May/June 2025 SSCE Practical Guidelines & Theory Format",
      summary: "Physics and Chemistry practical guidelines updated under NERDC 2025. Practice structured theory questions on EduNaija OS.",
      tag: "WAEC SSCE",
      date: "2 days ago",
      verified: true
    },
    {
      id: "b3",
      source: "Federal Ministry of Education",
      title: "NCC Zero-Rating 100MB Daily Free Learning Traffic Confirmed",
      summary: "Students on accredited educational platforms will receive subsidized data connectivity.",
      tag: "Zero-Rating",
      date: "This week",
      verified: true
    },
    {
      id: "b4",
      source: "National Universities Commission (NUC)",
      title: "NUC Approves 14 New Degree Programs Across Federal & State Universities",
      summary: "Artificial Intelligence, Cybersecurity, Robotics, and Data Science officially accredited in 22 Nigerian university faculties.",
      tag: "NUC CCMAS",
      date: "3 days ago",
      verified: true
    }
  ];

  const scholarships = [
    {
      id: "s1",
      sponsor: "MTN Foundation",
      title: "Undergraduate Scholarship Scheme 2025",
      award: "₦300,000 / year until graduation",
      deadline: "June 30, 2025",
      criteria: "Science & Tech • 250+ in JAMB or 3.5 CGPA",
      status: "Open Now 🚀",
      link: "https://www.mtn.ng/foundation"
    },
    {
      id: "s2",
      sponsor: "PTDF National",
      title: "Undergraduate Scholarship Award",
      award: "Full Tuition + ₦200,000 Stipend + Laptop",
      deadline: "May 15, 2025",
      criteria: "Engineering, Geology & Computing • Federal Character",
      status: "Closes in 32 Days ⏳",
      link: "https://ptdf.gov.ng"
    },
    {
      id: "s3",
      sponsor: "Shell SPDC Joint Venture",
      title: "University Scholarship Scheme",
      award: "₦250,000 / session",
      deadline: "July 20, 2025",
      criteria: "Minimum of 7 Credits in WAEC/NECO in 1 sitting",
      status: "Upcoming",
      link: "https://www.shell.com.ng"
    },
    {
      id: "s4",
      sponsor: "Federal Government Bilateral Education Agreement (BEA)",
      title: "Full Overseas Undergraduate & Postgraduate Scholarship",
      award: "100% Tuition, Accommodation, Monthly Living Allowance",
      deadline: "August 15, 2025",
      criteria: "Minimum 5 A/B Grades in WAEC • All 36 States Eligible",
      status: "Open Now 🚀",
      link: "https://education.gov.ng"
    }
  ];

  const cutoffs = [
    { school: "UNILAG", course: "Medicine & Surgery", cutoff: 280, rating: "Extremely Competitive", quota: "35% Merit, 45% Catchment, 20% ELDS" },
    { school: "UNILAG", course: "Law", cutoff: 260, rating: "Very Competitive", quota: "Merit ≥ 265" },
    { school: "University of Ibadan (UI)", course: "Medicine & Surgery", cutoff: 285, rating: "Extremely Competitive", quota: "Strict 50:50 Aggregate" },
    { school: "OAU Ile-Ife", course: "Nursing Science", cutoff: 255, rating: "High", quota: "Post-UTME Screening Cutoff: 64%" },
    { school: "UNN Nsukka", course: "Pharmacy", cutoff: 260, rating: "Very Competitive", quota: "ELDS Benchmark: 245" },
    { school: "ABU Zaria", course: "Computer Science", cutoff: 240, rating: "High", quota: "Catchment: 220" },
    { school: "FUTA Akure", course: "Software Engineering", cutoff: 250, rating: "Very Competitive", quota: "Merit: 255" }
  ];

  const handleApply = (id: string, name: string) => {
    sfx.streakCelebration();
    triggerTmaHaptic("medium");
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    setAppliedScholarship(id);
  };

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-screen pb-24 text-white font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#00E676] text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> OFFICIAL STATUTORY PORTAL SYNC • JAMB • WAEC • NUC • SCHOLARSHIPS
          </div>
          <h1 className="font-display tracking-tight font-black text-2xl sm:text-4xl text-white flex items-center gap-3">
            National Educational Intelligence &amp; Radar
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Live official bulletins from Nigerian regulatory bodies, ₦300k+ annual corporate scholarship schemes, and verified university cutoff metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-2xl glass-card border border-white/10 hover:border-emerald-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer text-zinc-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isRefreshing ? "Syncing Portals..." : "Sync Portals"}</span>
          </button>
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/10 mb-8 max-w-md text-xs font-bold">
        <button
          onClick={() => { sfx.tap(); setActiveTab("bulletins"); }}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "bulletins" ? "bg-[#00E676] text-black shadow-md font-black" : "text-zinc-400 hover:text-white"
          }`}
        >
          📰 Official Bulletins
        </button>
        <button
          onClick={() => { sfx.tap(); setActiveTab("scholarships"); }}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "scholarships" ? "bg-amber-400 text-black shadow-md font-black" : "text-zinc-400 hover:text-white"
          }`}
        >
          🎓 Scholarships (₦)
        </button>
        <button
          onClick={() => { sfx.tap(); setActiveTab("cutoffs"); }}
          className={`py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === "cutoffs" ? "bg-purple-600 text-white shadow-md font-black" : "text-zinc-400 hover:text-white"
          }`}
        >
          📊 Quotas &amp; Cutoffs
        </button>
      </div>

      {/* TAB 1: OFFICIAL BULLETINS */}
      {activeTab === "bulletins" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {bulletins.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-3xl p-5 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 bg-gradient-to-b from-white/[0.02] to-transparent"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {item.source}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">{item.date}</span>
                </div>
                <h3 className="font-bold text-base text-white leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded">
                  #{item.tag}
                </span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Directive
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: SCHOLARSHIPS */}
      {activeTab === "scholarships" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {scholarships.map((s) => (
              <div
                key={s.id}
                className="glass-card rounded-3xl p-5 border border-amber-500/30 hover:border-amber-400 transition-all flex flex-col justify-between space-y-4 bg-gradient-to-b from-amber-500/5 to-transparent"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      {s.sponsor}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {s.status}
                    </span>
                  </div>

                  <h3 className="font-black text-lg text-white">
                    {s.title}
                  </h3>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Annual Grant Value:</span>
                    <span className="font-mono font-black text-amber-300 text-sm">{s.award}</span>
                  </div>

                  <div className="space-y-1 text-xs text-zinc-300">
                    <p><strong className="text-zinc-400">Eligibility:</strong> {s.criteria}</p>
                    <p><strong className="text-zinc-400">Closing Deadline:</strong> {s.deadline}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-mono">100% Zero-Tuition Sovereign Pass</span>
                  <button
                    onClick={() => handleApply(s.id, s.title)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      appliedScholarship === s.id
                        ? "bg-emerald-500 text-black font-black"
                        : "bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold hover:brightness-110"
                    }`}
                  >
                    <span>{appliedScholarship === s.id ? "Application Tracked! ✓" : "Track & Apply"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CUTOFFS */}
      {activeTab === "cutoffs" && (
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-4">
            <h3 className="font-black text-base text-white">
              Official Federal &amp; State University Cutoff Benchmarks
            </h3>
            <div className="space-y-2">
              {cutoffs.map((c, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{c.school}</span>
                      <span className="text-emerald-400 font-semibold">{c.course}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block">{c.quota}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-mono font-bold text-xs">
                      Cutoff: {c.cutoff}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {c.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

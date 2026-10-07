"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, Globe, ShieldCheck, Award, Heart, Sparkles, 
  BookOpen, Volume2, Download, Printer, CheckCircle2, 
  ArrowRight, RefreshCw, MessageSquare, ChevronRight,
  Star, ExternalLink, Calendar, Compass, Flame
} from "lucide-react";
import { sfx } from "../../../lib/audio";
import { triggerTmaHaptic } from "../../../lib/telegram";

export default function DiasporaGuardianPortalPage() {
  const [parentEmail, setParentEmail] = useState<string>("kunle.adeleke@nhs.uk");
  const [portalData, setPortalData] = useState<any>(null);
  const [selectedChildIdx, setSelectedChildIdx] = useState<number>(0);
  const [dossierData, setDossierData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const fetchPortalData = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/backend/monetization/diaspora/portal/${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setPortalData(data);
        if (data.children && data.children.length > 0) {
          fetchDossier(data.children[0].learner_registration_key);
        }
      }
    } catch (err) {
      console.error("Portal fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDossier = async (childKey: string) => {
    try {
      const res = await fetch(`/api/backend/monetization/diaspora/report-card/${encodeURIComponent(childKey)}`);
      if (res.ok) {
        const d = await res.json();
        setDossierData(d.dossier);
      }
    } catch (err) {
      console.error("Dossier fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPortalData(parentEmail);
  }, []);

  const handleChildSelect = (idx: number) => {
    sfx.tap();
    triggerTmaHaptic("light");
    setSelectedChildIdx(idx);
    if (portalData?.children?.[idx]) {
      fetchDossier(portalData.children[idx].learner_registration_key);
    }
  };

  const handlePrintDossier = () => {
    sfx.tap();
    triggerTmaHaptic("medium");
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const activeChild = portalData?.children?.[selectedChildIdx] || portalData?.children?.[0];

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-purple-500/30 selection:text-purple-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header & Guardian Profile Bar */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-purple-950/40 via-[#0a0d16] to-emerald-950/30 p-8 sm:p-10 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
                <Globe className="w-4 h-4 text-purple-400" />
                DIASPORA GUARDIAN COMMAND PORTAL
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white">
                Welcome, {portalData?.parent?.name || "Guardian"}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                <span>Account: <strong className="text-zinc-200">{parentEmail}</strong></span>
                <span>•</span>
                <span>Location: <strong className="text-zinc-200">{portalData?.parent?.country || "United Kingdom"}</strong></span>
                <span>•</span>
                <span className="text-[#00E676] font-bold">Active Family Annual Plan</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/diaspora"
                onClick={() => sfx.tap()}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Manage Seats</span>
              </Link>

              <a
                href="https://wa.me/2348000000000?text=Hello%20EduNaija%20Diaspora%20Concierge"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sfx.tap()}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-[#00E676] text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Concierge</span>
              </a>
            </div>
          </div>
        </div>

        {/* Family KPI Metrics Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-black/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">Total Family XP</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {portalData?.family_summary?.total_family_xp?.toLocaleString() || "1,480"} XP
            </div>
            <div className="text-[11px] text-[#00E676] font-mono">+680 XP earned this week</div>
          </div>

          <div className="p-5 rounded-3xl bg-black/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">Shared Streak Multiplier</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-300">
              {portalData?.family_summary?.family_streak_multiplier || "1.5x"}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              {portalData?.family_summary?.shared_streak_days || 4}-Day Household Learning Run
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-black/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">Enrolled Child Seats</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-indigo-300">
              {portalData?.children?.length || 2} Active
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">Heritage Fluency On Track</div>
          </div>

          <div className="p-5 rounded-3xl bg-black/60 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">Next Friday Dossier</span>
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-white mt-1">Friday 5:00 PM WAT</div>
            <div className="text-[11px] text-[#00E676] font-mono">Automated WhatsApp &amp; Email</div>
          </div>
        </div>

        {/* Child Learner Selector Pill Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider shrink-0">Select Child:</span>
          {portalData?.children?.map((child: any, idx: number) => {
            const isSelected = selectedChildIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => handleChildSelect(idx)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg border border-purple-400/40"
                    : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isSelected ? "text-amber-300" : "text-zinc-500"}`} />
                <span>{child.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({child.grade_level})</span>
              </button>
            );
          })}
        </div>

        {/* Active Child Details & Friday Dossier */}
        {activeChild && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Child Profile Snapshot Card */}
            <div className="rounded-3xl bg-black/60 border border-white/10 p-6 space-y-6">
              <div className="border-b border-white/10 pb-4 space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest">
                  Individual Learner Profile
                </span>
                <h3 className="text-2xl font-black text-white">{activeChild.name}</h3>
                <div className="text-xs text-zinc-400 font-mono">
                  Learner Key: <strong className="text-amber-300">{activeChild.learner_registration_key}</strong>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>Heritage Language Focus:</span>
                    <span className="font-bold text-[#00E676]">{activeChild.heritage_language}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Tone Accuracy Index:</span>
                    <span className="font-bold text-cyan-300">{activeChild.tone_accuracy_pct}%</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Proverbs Mastered:</span>
                    <span className="font-bold text-amber-300">{activeChild.proverbs_mastered} Cultural Maxims</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Bionic Chapters Read:</span>
                    <span className="font-bold text-purple-300">{activeChild.chapters_read} Chapters</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2.5">
                  <Link
                    href="/reader"
                    onClick={() => sfx.tap()}
                    className="w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Launch Bionic Reader for {activeChild.name.split(" ")[0]}</span>
                  </Link>

                  <Link
                    href="/indigenous-voices"
                    onClick={() => sfx.tap()}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Open Do-Re-Mi Tonal Lab</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Friday Progress Dossier Preview */}
            <div className="lg:col-span-2 rounded-3xl bg-black/60 border border-emerald-500/30 p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 uppercase font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4" /> Automated Friday Dossier Preview
                  </div>
                  <h3 className="text-xl font-black text-white">{dossierData?.report_title || "Weekly Progress Dossier"}</h3>
                  <div className="text-xs text-zinc-400 font-mono">Period: {dossierData?.period}</div>
                </div>

                <button
                  onClick={handlePrintDossier}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black text-xs font-black transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer self-start"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
              </div>

              {dossierData && (
                <div className="space-y-6">
                  {/* Proverb Mastery Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                      Heritage Cultural Fluency &amp; Proverbs Mastered:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {dossierData.proverbs_mastered?.map((p: any, i: number) => (
                        <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                          <div className="text-sm font-bold text-white font-serif">{p.proverb}</div>
                          <div className="text-xs text-zinc-400 italic">{p.translation}</div>
                          <div className="text-[10px] font-mono font-bold text-[#00E676] pt-1">{p.accuracy}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Curriculum Bridging */}
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300">Curriculum Dual-Bridge Synchronization</span>
                      <span className="text-[10px] font-mono text-[#00E676] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {dossierData.curriculum_bridge?.mastery_score}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-300">
                      <strong>International Standard:</strong> {dossierData.curriculum_bridge?.british_us_standard}
                    </div>
                    <div className="text-xs text-zinc-300">
                      <strong>NERDC Curriculum Alignment:</strong> {dossierData.curriculum_bridge?.nerdc_curriculum}
                    </div>
                  </div>

                  {/* AI Mentor Endorsement */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Pedagogical Socratic Endorsement</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed italic">
                      &quot;{dossierData.ai_mentor_endorsement}&quot;
                    </p>
                  </div>

                  {/* Statutory Seal */}
                  <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 font-mono border-t border-white/5">
                    <span>{dossierData.statutory_seal}</span>
                    <span>Verified by EduNaija Sovereign Engine</span>
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

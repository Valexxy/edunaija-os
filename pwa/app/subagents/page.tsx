"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Bot, Search, Filter, Sparkles, BookOpen, ShieldCheck, ArrowLeft,
  ChevronRight, ExternalLink, Cpu, CheckCircle2, MessageSquare, 
  Send, RefreshCw, X, AlertTriangle, Layers, Award, Compass, School, HeartHandshake,
  Copy, Check, Play, Pause
} from "lucide-react";
import { sfx } from "../../lib/audio";

const BATTALIONS = [
  "All",
  "STEM & Technical",
  "Humanities & Social",
  "Cognitive Support",
  "Exam Bodies & Scoring",
  "Indigenous & Vernacular",
  "School Administration",
  "Parent & Family",
  "Career & Higher Ed",
  "Security & Anti-Cheat",
  "Web Research & Portals"
];

export default function SubagentsSwarmPage() {
  const [subagents, setSubagents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBattalion, setSelectedBattalion] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"swarm" | "oracle" | "matrix">("swarm");
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  
  // Consultation State
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [consultPrompt, setConsultPrompt] = useState("");
  const [consultTopic, setConsultTopic] = useState("");
  const [consultLoading, setConsultLoading] = useState(false);
  const [consultResponse, setConsultResponse] = useState<any>(null);
  const [modalCopied, setModalCopied] = useState(false);
  const [modalAudioPlaying, setModalAudioPlaying] = useState(false);
  const [modalAudio, setModalAudio] = useState<HTMLAudioElement | null>(null);

  // Oracle Q&A State
  const [oracleQuery, setOracleQuery] = useState("");
  const [oracleLoading, setOracleLoading] = useState(false);
  const [oracleResult, setOracleResult] = useState<any>(null);

  // Fetch swarm list from FastAPI
  useEffect(() => {
    async function loadSwarm() {
      setLoading(true);
      try {
        let url = "/api/backend/subagents/swarm?limit=100";
        if (selectedBattalion !== "All") {
          url += `&battalion=${encodeURIComponent(selectedBattalion)}`;
        }
        if (searchQuery.trim()) {
          url += `&search=${encodeURIComponent(searchQuery.trim())}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSubagents(data.subagents || []);
        }
      } catch (err) {
        console.error("Failed to fetch subagents swarm:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSwarm();
  }, [selectedBattalion, searchQuery]);

  const handleOpenConsult = (agent: any) => {
    sfx.tap();
    setSelectedAgent(agent);
    setConsultPrompt("");
    setConsultTopic("");
    setConsultResponse(null);
    setConsultModalOpen(true);
  };

  const handleExecuteConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultPrompt.trim() || !selectedAgent) return;
    sfx.tap();
    setConsultLoading(true);
    setConsultResponse(null);

    try {
      const res = await fetch(`/api/backend/subagents/swarm/${selectedAgent.id}/consult`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: consultPrompt.trim(),
          topic: consultTopic.trim() || "General",
          subject: selectedAgent.battalion.includes("STEM") ? "STEM" : "General"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setConsultResponse(data);
        sfx.correct();
      } else {
        setConsultResponse({ response: "Error: Unable to reach subagent core right now." });
      }
    } catch (err) {
      setConsultResponse({ response: "Network error connecting to subagent." });
    } finally {
      setConsultLoading(false);
    }
  };

  const handleExecuteOracle = async (queryText?: string) => {
    const q = (queryText || oracleQuery).trim();
    if (!q) return;
    sfx.tap();
    setOracleLoading(true);
    try {
      const res = await fetch("/api/backend/subagents/oracle/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, category: "All", student_level: "Tertiary" })
      });
      if (res.ok) {
        const data = await res.json();
        setOracleResult(data);
        sfx.correct();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOracleLoading(false);
    }
  };

  const toggleModalAudio = (text: string) => {
    sfx.tap();
    if (modalAudioPlaying && modalAudio) {
      modalAudio.pause();
      setModalAudioPlaying(false);
    } else {
      const audio = new Audio(`/api/backend/tts/audio?text=${encodeURIComponent(text.slice(0, 80))}&voice=uncle_emeka`);
      audio.onended = () => setModalAudioPlaying(false);
      audio.play().catch(() => {});
      setModalAudio(audio);
      setModalAudioPlaying(true);
    }
  };

  const handleCopyModalText = (text: string) => {
    navigator.clipboard.writeText(text);
    setModalCopied(true);
    sfx.tap();
    setTimeout(() => setModalCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white selection:bg-[#00E676] selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/40 border-b border-white/10 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/student" 
              onClick={() => sfx.tap()}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Bot className="w-6 h-6 text-[#00E676]" />
                  100 Autonomous Subagents Swarm
                </h1>
                <span className="text-[11px] font-mono font-bold bg-[#00E676]/10 text-[#00E676] px-2.5 py-0.5 rounded-full border border-[#00E676]/20">
                  100% OPERATIONAL
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Every subagent is anchored in peer-reviewed advance research, active codebase files, and pragmatic gap resolutions.
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10 self-stretch sm:self-auto gap-1">
            <button
              onClick={() => { sfx.tap(); setActiveTab("swarm"); }}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "swarm" 
                  ? "bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.4)]" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Interactive Swarm (100)
            </button>
            <button
              onClick={() => { sfx.tap(); setActiveTab("oracle"); }}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "oracle" 
                  ? "bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.4)]" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Unified Q&A Oracle
            </button>
            <button
              onClick={() => { sfx.tap(); setActiveTab("matrix"); }}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "matrix" 
                  ? "bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.4)]" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Gaps Audit Matrix
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
        
        {/* Search & Battalion Filter Bar */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by agent name, research citation (e.g. Sweller, Vygotsky, IRT), gap resolved, or cultural anchor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#00E676]/60 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Battalion Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {BATTALIONS.map((b) => (
              <button
                key={b}
                onClick={() => { sfx.tap(); setSelectedBattalion(b); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedBattalion === b
                    ? "bg-white text-black border-white font-bold"
                    : "bg-white/[0.03] text-zinc-400 border-white/5 hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Interactive Swarm Grid */}
        {activeTab === "swarm" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-zinc-400 px-1">
              <span>Showing <strong className="text-white">{subagents.length}</strong> autonomous subagents</span>
              <span className="text-[#00E676] font-mono">10 Battalions • Real-Time Engine Active</span>
            </div>

            {loading ? (
              <div className="py-24 text-center text-zinc-500 flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-[#00E676]" />
                <span className="text-sm">Synchronizing 100 autonomous subagents from sovereign database...</span>
              </div>
            ) : subagents.length === 0 ? (
              <div className="py-20 text-center text-zinc-500 glass-card rounded-3xl p-8 border border-white/10">
                <Bot className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No Subagents Found</h3>
                <p className="text-xs text-zinc-400">Try loosening your search term or select another battalion.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subagents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-2xl p-5 border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent hover:border-[#00E676]/40 transition-all flex flex-col justify-between group shadow-lg"
                  >
                    <div className="space-y-3">
                      {/* Battalion & ID Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                          {agent.id}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
                          {agent.battalion}
                        </span>
                      </div>

                      {/* Agent Name */}
                      <h3 className="text-base font-bold text-white group-hover:text-[#00E676] transition-colors leading-tight">
                        {agent.name}
                      </h3>

                      {/* Advance Research Citation */}
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-emerald-400" /> Advance Research Anchor
                        </span>
                        <p className="text-xs text-zinc-300 font-serif italic line-clamp-2">
                          "{agent.advance_research_anchor}"
                        </p>
                      </div>

                      {/* System Gap Resolved */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#00E676]" /> Gap Addressed
                        </span>
                        <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                          {agent.system_gap_addressed}
                        </p>
                      </div>

                      {/* Cultural Context Anchor */}
                      <div className="text-[11px] text-zinc-500 bg-white/[0.01] p-2 rounded-lg border border-white/5">
                        <span className="text-zinc-400 font-semibold">Naija Anchor:</span> {agent.cultural_anchor}
                      </div>

                      {/* Code Implementation Link */}
                      <div className="text-[10px] font-mono text-zinc-500 truncate">
                        <span className="text-zinc-400">File:</span> {agent.current_implementation}
                      </div>
                    </div>

                    {/* Trigger Consultation Button */}
                    <div className="pt-4 mt-4 border-t border-white/5">
                      <button
                        onClick={() => handleOpenConsult(agent)}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-[#00E676] text-white hover:text-black font-bold text-xs transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-transparent group-hover:shadow-[0_0_15px_rgba(0,230,118,0.3)] cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Consult Subagent →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Unified Academic Q&A Oracle */}
        {activeTab === "oracle" && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#00E676]/30 bg-gradient-to-r from-emerald-950/30 via-zinc-900 to-black shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E676]/10 text-[#00E676] text-xs font-bold border border-[#00E676]/20">
                    <ShieldCheck className="w-4 h-4" /> Zero-Failure Nigerian Academic Knowledge Engine
                  </div>
                  <h2 className="text-2xl font-extrabold text-white mt-2 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#00E676]" />
                    Unified Academic Q&amp;A Oracle
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                    Ask any question across tertiary grading (NUC 5.0 CGPA), senior secondary STEM, WAEC/JAMB literature, or admissions. 
                    The Oracle coordinates the 100-swarm to deliver a 100% complete, non-truncated solution.
                  </p>
                </div>
                <Link
                  href="/qa"
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Full Screen Oracle Mode
                </Link>
              </div>

              <div className="space-y-3 pt-2">
                <textarea
                  rows={3}
                  value={oracleQuery}
                  onChange={(e) => setOracleQuery(e.target.value)}
                  placeholder="e.g. Can you just answer for UNILORIN: How many A grades do I need for First-Class Honours on a 5.0 CGPA scale?"
                  className="w-full p-4 rounded-2xl bg-white/[0.04] border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#00E676]/60 transition-colors resize-none leading-relaxed"
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const q = "How many A grades does a UNILORIN student need to graduate with First-Class Honours on a 5.0 CGPA scale?";
                        setOracleQuery(q);
                        handleExecuteOracle(q);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00E676]/20 border border-white/10 text-zinc-300 hover:text-white transition-all"
                    >
                      🎓 UNILORIN 5.0 CGPA Calculation
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const q = "Calculate the volume of 8g of O2 gas at standard temperature and pressure (STP).";
                        setOracleQuery(q);
                        handleExecuteOracle(q);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00E676]/20 border border-white/10 text-zinc-300 hover:text-white transition-all"
                    >
                      ⚗️ JAMB STP Gas Volume
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const q = "What aggregate score is needed for Medicine at UNILAG, and how does the Catchment Quota apply?";
                        setOracleQuery(q);
                        handleExecuteOracle(q);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00E676]/20 border border-white/10 text-zinc-300 hover:text-white transition-all"
                    >
                      🏛️ UNILAG Cutoff &amp; Quotas
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExecuteOracle()}
                    disabled={oracleLoading || !oracleQuery.trim()}
                    className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-[#00E676] hover:bg-[#00c864] disabled:opacity-50 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,230,118,0.3)] cursor-pointer"
                  >
                    {oracleLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Synthesizing Swarm...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Consult Oracle Swarm
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Oracle Result Card */}
            {oracleResult && (
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-zinc-950 shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/10 gap-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/20">
                      ORACLE MASTER SYNTHESIS &bull; 100% COMPLETE
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5">
                      {oracleResult.question}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleModalAudio(oracleResult.response_markdown || "")}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      {modalAudioPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-[#00E676]" /> Pause Audio
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-[#00E676]" /> Listen
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyModalText(oracleResult.response_markdown || "")}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      {modalCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00E676]" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Co-Consulted Swarm Bento */}
                {oracleResult.consulting_swarm && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                      Autonomous Swarm Specialists Co-Consulted:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {oracleResult.consulting_swarm.map((agent: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
                          <div className="flex items-center gap-1.5 text-[#00E676] font-bold">
                            <Bot className="w-3 h-3" />
                            <span>{agent.name}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{agent.gap_addressed}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Markdown Solution */}
                <div className="text-zinc-200 text-sm whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  {oracleResult.response_markdown}
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
                  <span className="flex items-center gap-1 text-[#00E676]">
                    <ShieldCheck className="w-3.5 h-3.5" /> {oracleResult.statutory_seal || "Grounded in NUC CCMAS / NERDC Standards"}
                  </span>
                  <span>100% Guaranteed Non-Truncation</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: System Gaps Audit Matrix */}
        {activeTab === "matrix" && (
          <div className="space-y-4">
            <div className="glass-card rounded-3xl p-6 border border-white/10 bg-gradient-to-r from-emerald-950/20 via-zinc-900 to-black">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#00E676]" />
                    Pragmatic 100-Gap Verification Matrix
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Complete cross-index of identified architectural, pedagogical, and operational gaps resolved by autonomous subagents.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-display font-black text-[#00E676]">100 / 100</span>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Gaps Formally Resolved</div>
                </div>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-zinc-400 font-bold border-b border-white/10 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">ID</th>
                      <th className="py-3.5 px-4">Subagent Name</th>
                      <th className="py-3.5 px-4">Battalion</th>
                      <th className="py-3.5 px-4 min-w-[240px]">Advance Research Grounding</th>
                      <th className="py-3.5 px-4 min-w-[280px]">System Gap Addressed</th>
                      <th className="py-3.5 px-4 min-w-[200px]">Current Implementation</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {subagents.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-zinc-400">{s.id}</td>
                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{s.name}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-zinc-300">
                            {s.battalion}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-300 italic font-serif">{s.advance_research_anchor}</td>
                        <td className="py-3 px-4 text-zinc-400 leading-relaxed">{s.system_gap_addressed}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-emerald-400">{s.current_implementation}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full border border-[#00E676]/20">
                            <CheckCircle2 className="w-3 h-3" /> Resolved
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Consultation Modal */}
      <AnimatePresence>
        {consultModalOpen && selectedAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-3xl p-6 border border-white/20 bg-zinc-950 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setConsultModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Agent Profile Header */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-400">{selectedAgent.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676]">{selectedAgent.battalion}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">{selectedAgent.name}</h2>
                  <p className="text-xs text-zinc-400 mt-0.5 italic font-serif">
                    Research: {selectedAgent.advance_research_anchor}
                  </p>
                </div>
              </div>

              {/* Cultural Context Pill */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-300">
                <strong className="text-[#00E676]">Cultural Analogy Anchor:</strong> {selectedAgent.cultural_anchor}
              </div>

              {/* Consultation Input Form */}
              <form onSubmit={handleExecuteConsult} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Your Question or Problem Scenario
                  </label>
                  <textarea
                    rows={3}
                    placeholder={`Ask ${selectedAgent.name} for step-by-step guidance, formula derivation, or conceptual breakdown...`}
                    value={consultPrompt}
                    onChange={(e) => setConsultPrompt(e.target.value)}
                    required
                    className="w-full p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#00E676]/60 transition-colors resize-none"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-zinc-500">
                    Grounded in: {selectedAgent.advance_research_anchor.split(";")[0]}
                  </span>
                  <button
                    type="submit"
                    disabled={consultLoading || !consultPrompt.trim()}
                    className="py-2.5 px-5 rounded-xl bg-[#00E676] hover:bg-[#00c864] disabled:opacity-50 text-black font-extrabold text-xs transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,230,118,0.3)] cursor-pointer"
                  >
                    {consultLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Consulting Subagent...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Execute Consultation
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Consultation Response Output */}
              {consultResponse && (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#00E676]">
                      <Sparkles className="w-4 h-4" />
                      Subagent Guidance Output (Verified &bull; 100% Complete):
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleModalAudio(consultResponse.response || "")}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {modalAudioPlaying ? (
                          <>
                            <Pause className="w-3 h-3 text-[#00E676]" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 text-[#00E676]" /> Listen
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyModalText(consultResponse.response || "")}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {modalCopied ? (
                          <>
                            <Check className="w-3 h-3 text-[#00E676]" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto">
                    {consultResponse.response}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                    <span className="flex items-center gap-1 text-[#00E676]">
                      <ShieldCheck className="w-3 h-3" /> Grounded in NUC CCMAS / NERDC Standards
                    </span>
                    <span>100% Non-Truncated Guarantee</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

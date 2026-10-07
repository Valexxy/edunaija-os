"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, Search, SlidersHorizontal, Calculator, GraduationCap, 
  Sparkles, ExternalLink, ShieldCheck, CheckCircle2, AlertTriangle, 
  BookOpen, ArrowRight, RefreshCw, Compass, Award, Percent
} from "lucide-react";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

export default function InstitutionsClearinghousePage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");

  // Calculator State
  const [calcJambScore, setCalcJambScore] = useState<number>(275);
  const [calcOlevelCredits, setCalcOlevelCredits] = useState<number>(5);
  const [calcState, setCalcState] = useState<string>("Lagos");
  const [calcInstitution, setCalcInstitution] = useState<string>("UNILAG");
  const [calcCourse, setCalcCourse] = useState<string>("Medicine & Surgery");
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [oddsResult, setOddsResult] = useState<any>(null);

  // States list
  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
    "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
    "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  // Fetch Institutional Radar Data
  useEffect(() => {
    async function loadRadar() {
      setLoading(true);
      try {
        const res = await fetch("/api/backend/api/tracks/institutional-radar?limit=100");
        if (res.ok) {
          const data = await res.json();
          setInstitutions(data.radar_data || []);
        }
      } catch (err) {
        console.error("Failed to load institutional radar:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRadar();
  }, []);

  // Handle Calculate Odds
  const handleCalculateOdds = async () => {
    sfx.tap();
    triggerTmaHaptic("medium");
    setIsCalculating(true);

    try {
      const res = await fetch("/api/backend/api/tracks/calculate-odds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jamb_score: calcJambScore,
          olevel_credits: calcOlevelCredits,
          state_of_origin: calcState,
          institution: calcInstitution,
          course: calcCourse
        })
      });

      if (res.ok) {
        const data = await res.json();
        setOddsResult(data);
        if (data.admission_odds?.probability_pct >= 70) {
          sfx.streakCelebration();
          triggerTmaHaptic("success");
        } else {
          sfx.wrong();
          triggerTmaHaptic("warning");
        }
      }
    } catch (err) {
      console.error("Calculation error:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch = !searchQuery || 
      inst.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.short_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTrack = selectedTrack === "ALL" || inst.academic_track === selectedTrack;
    const matchesState = selectedState === "ALL" || inst.state?.toLowerCase().includes(selectedState.toLowerCase());

    return matchesSearch && matchesTrack && matchesState;
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-emerald-500/30 selection:text-emerald-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-indigo-950/40 via-[#0a0d16] to-emerald-950/30 p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-bold">
              <Building2 className="w-4 h-4 text-indigo-400" />
              NATIONAL TERTIARY CLEARINGHOUSE &amp; ADMISSION RADAR
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Real-Time <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-[#00E676] bg-clip-text text-transparent">JAMB &amp; Post-UTME Cut-Offs</span> Across Nigerian Universities
            </h1>

            <p className="text-zinc-300 text-base leading-relaxed">
              Verify accredited cut-off marks, Post-UTME screening formats, tuition estimates, and official admission quotas (Merit 45%, Catchment 35%, ELDS 20%) across Federal, State, and Private tertiary institutions in Nigeria.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> NUC &amp; JAMB CAPS Verified
              </span>
              <span className="flex items-center gap-1.5 text-indigo-300">
                <Calculator className="w-4 h-4" /> Real-Time Quota Odds Engine
              </span>
              <span className="flex items-center gap-1.5 text-amber-300">
                <Percent className="w-4 h-4" /> Catchment Area Analysis
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Admission Odds Calculator Bento Card */}
        <div className="rounded-3xl bg-black/60 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Interactive Admission Probability Calculator</h3>
                <p className="text-xs text-zinc-400">Calculates composite index against official Merit, Catchment, and ELDS concessions.</p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              2025/2026 Session Standards
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Your JAMB Score (0-400)</label>
              <input
                type="number"
                min="100"
                max="400"
                value={calcJambScore}
                onChange={(e) => setCalcJambScore(parseInt(e.target.value) || 200)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">O-Level Credits (C6+)</label>
              <select
                value={calcOlevelCredits}
                onChange={(e) => setCalcOlevelCredits(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={5}>5 Credits (Standard)</option>
                <option value={6}>6 Credits</option>
                <option value={7}>7 Credits</option>
                <option value={8}>8 Credits</option>
                <option value={9}>9 Credits (Distinction)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">State of Origin</label>
              <select
                value={calcState}
                onChange={(e) => setCalcState(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {nigerianStates.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 block mb-1">Target Institution</label>
              <select
                value={calcInstitution}
                onChange={(e) => setCalcInstitution(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="UNILAG">University of Lagos (UNILAG)</option>
                <option value="UI">University of Ibadan (UI)</option>
                <option value="OAU">Obafemi Awolowo University (OAU)</option>
                <option value="ABU">Ahmadu Bello University (ABU)</option>
                <option value="UNN">University of Nigeria, Nsukka (UNN)</option>
                <option value="COVENANT">Covenant University, Ota</option>
                <option value="FUTA">Fed. Univ. of Technology, Akure (FUTA)</option>
                <option value="UNIBEN">University of Benin (UNIBEN)</option>
                <option value="UNILORIN">University of Ilorin (UNILORIN)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleCalculateOdds}
                disabled={isCalculating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isCalculating ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>Calculate Odds</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Outcome Banner */}
          {oddsResult && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-black/80 to-slate-900 border border-white/15 animate-in fade-in zoom-in-95 duration-150 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs font-mono text-zinc-400">Target Department:</div>
                  <div className="text-lg font-black text-white">{oddsResult.institution.department} @ {oddsResult.institution.name}</div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Admission Pathway: <span className="text-cyan-300 font-bold">{oddsResult.candidate.quota_category}</span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div className="text-4xl font-black text-[#00E676]">{oddsResult.admission_odds.probability_pct}%</div>
                  <div>
                    <div className="text-xs font-bold text-white">{oddsResult.admission_odds.verdict}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">Admission Confidence Index</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-zinc-400">Candidate Aggregate</div>
                  <div className="text-sm font-bold text-white">{oddsResult.score_analysis.student_aggregate} / 100</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-zinc-400">Effective Cut-Off</div>
                  <div className="text-sm font-bold text-amber-300">{oddsResult.score_analysis.effective_cutoff} / 100</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-zinc-400">Competitive Margin</div>
                  <div className={`text-sm font-bold ${oddsResult.score_analysis.margin >= 0 ? "text-[#00E676]" : "text-red-400"}`}>
                    {oddsResult.score_analysis.margin >= 0 ? `+${oddsResult.score_analysis.margin}` : oddsResult.score_analysis.margin} pts
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-zinc-400">Screening Format</div>
                  <div className="text-xs font-bold text-cyan-300 truncate">{oddsResult.institution.screening_format}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Directory Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search institution, state, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {["ALL", "SCIENCE", "ARTS", "COMMERCIAL"].map(t => (
              <button
                key={t}
                onClick={() => { sfx.tap(); setSelectedTrack(t); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTrack === t
                    ? "bg-indigo-600 text-white shadow-md border border-indigo-400/30"
                    : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
                }`}
              >
                {t === "ALL" ? "All Tracks" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Institutions Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutions.map((inst, idx) => (
            <div
              key={inst.id || idx}
              className="rounded-3xl bg-black/40 border border-white/10 p-6 space-y-4 hover:border-indigo-500/50 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      {inst.short_name || "UNI"} • {inst.ownership || "Federal"}
                    </span>
                    <h3 className="font-bold text-white text-base mt-1.5 group-hover:text-indigo-300 transition-colors">
                      {inst.name}
                    </h3>
                    <div className="text-xs text-zinc-400">{inst.state} State, Nigeria</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono text-zinc-400">Post-UTME Cutoff</div>
                    <div className="text-lg font-black text-[#00E676]">{inst.post_utme_aggregate}</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-500">Benchmark Course:</span>
                    <span className="font-semibold text-white">{inst.department}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-500">Min. JAMB UTME:</span>
                    <span className="font-mono text-amber-300 font-bold">{inst.jamb_cut_off}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span className="text-zinc-500">Screening Format:</span>
                    <span className="font-medium text-cyan-300">{inst.screening_format}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => {
                    sfx.tap();
                    setCalcInstitution(inst.short_name || "UNILAG");
                    setCalcCourse(inst.department || "Medicine & Surgery");
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                  className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" /> Check My Odds
                </button>

                {inst.official_portal_url && (
                  <a
                    href={inst.official_portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-400 hover:text-[#00E676] flex items-center gap-1 font-mono transition-colors"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredInstitutions.length === 0 && !loading && (
          <div className="text-center py-16 space-y-3">
            <Building2 className="w-10 h-10 text-zinc-600 mx-auto" />
            <div className="text-sm font-bold text-zinc-400">No institutions matched your query.</div>
            <div className="text-xs text-zinc-500">Try broadening your search term or clearing the track filter.</div>
          </div>
        )}

      </div>
    </div>
  );
}

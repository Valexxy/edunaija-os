"use client";

import { useState, useEffect } from "react";
import { 
  Compass, MapPin, Award, BookOpen, Users, Landmark, 
  History, Search, Building2, School, X, ArrowLeft, Sparkles,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

interface StateHeritage {
  state_code: string;
  state_name: string;
  capital: string;
  geopolitical_zone: string;
  motto: string;
  creation_year: number;
  historical_summary: string;
  educational_heritage: string;
  notable_scholars_and_heroes: string;
  cultural_landmarks: string;
  accent_theme: string;
  institutions?: any[];
  secondary_schools?: any[];
}

export default function StatesHeritagePage() {
  const [states, setStates] = useState<StateHeritage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStateDetail, setSelectedStateDetail] = useState<StateHeritage | null>(null);

  useEffect(() => {
    fetch("/api/backend/quiz/directory/states")
      .then((res) => res.json())
      .then((data) => {
        if (data.states) setStates(data.states);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleInspectState = async (stateName: string) => {
    sfx.tap();
    triggerTmaHaptic("light");
    try {
      const res = await fetch(`/api/backend/quiz/directory/state/${encodeURIComponent(stateName)}`);
      const data = await res.json();
      if (data.state) setSelectedStateDetail(data.state);
    } catch {}
  };

  const zones = ["ALL", "South West", "South East", "South South", "North Central", "North West", "North East"];

  const filteredStates = states.filter((s) => {
    const matchesZone = selectedZone === "ALL" || s.geopolitical_zone === selectedZone;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      s.state_name.toLowerCase().includes(query) ||
      s.capital.toLowerCase().includes(query) ||
      s.motto.toLowerCase().includes(query) ||
      (s.notable_scholars_and_heroes && s.notable_scholars_and_heroes.toLowerCase().includes(query)) ||
      (s.cultural_landmarks && s.cultural_landmarks.toLowerCase().includes(query));
    return matchesZone && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#050508] text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Hero Header */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-black to-teal-950/30 border border-emerald-500/20 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#00E676] text-xs font-black uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>The Federation of Learning</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight">
                Nigeria’s 36 States &amp; FCT Educational Heritage
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Celebrating the official state mottos, literary titans, pioneering universities, and ancient civilisations that power the intellectual sovereignty of the Federal Republic of Nigeria.
              </p>
            </div>

            <Link
              href="/quiz"
              className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-2 transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-[#00E676]" />
              <span>Back to Practice Cockpit</span>
            </Link>
          </div>

          {/* Search & Geopolitical Zone Filters */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Geopolitical Zone Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {zones.map((zone) => (
                <button
                  key={zone}
                  onClick={() => { sfx.tap(); setSelectedZone(zone); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedZone === zone
                      ? "bg-gradient-to-r from-emerald-500 to-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.35)]"
                      : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state, motto, scholar, or landmark..."
                className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* States Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStates.map((state) => (
            <div
              key={state.state_code}
              onClick={() => handleInspectState(state.state_name)}
              className="group rounded-3xl bg-[#090b14] border border-white/10 hover:border-emerald-500/40 p-5 shadow-xl transition-all hover:scale-[1.01] cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                {/* State Title & Year */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                        {state.state_name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                        Est. {state.creation_year}
                      </span>
                    </div>
                    {/* Official Motto Banner */}
                    <div className="mt-1 text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-emerald-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>&ldquo;{state.motto}&rdquo;</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                    {state.geopolitical_zone}
                  </span>
                </div>

                {/* Capital & Synopsis */}
                <div className="mt-3 text-[11px] text-zinc-400 font-mono">
                  Capital: <strong className="text-white">{state.capital}</strong>
                </div>

                <p className="mt-2 text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                  {state.historical_summary}
                </p>
              </div>

              {/* Footer Landmarks & Action */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[10px] text-zinc-500 truncate max-w-[200px]">
                  🏛️ {state.cultural_landmarks?.split(",")[0] || state.capital}
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[11px]">
                  <span>Explore Heritage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* State In-Depth Heritage Modal */}
        {selectedStateDetail && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
            <div className="relative w-full max-w-3xl bg-[#090b14] border border-emerald-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-[92vh] flex flex-col text-white">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-white">{selectedStateDetail.state_name} State</h2>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300">
                      Est. {selectedStateDetail.creation_year}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                      {selectedStateDetail.geopolitical_zone}
                    </span>
                  </div>
                  
                  {/* Official State Motto Highlight */}
                  <div className="mt-1.5 text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-[#00E676] to-emerald-400 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>&ldquo;{selectedStateDetail.motto}&rdquo;</span>
                  </div>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">
                    State Capital: <strong className="text-white">{selectedStateDetail.capital}</strong>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStateDetail(null)}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                
                {/* Section 1: Historical Summary */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                  <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <History className="w-3.5 h-3.5" /> Historical Synopsis &amp; Origins
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {selectedStateDetail.historical_summary}
                  </p>
                </div>

                {/* Section 2: Educational Heritage */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                  <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <BookOpen className="w-3.5 h-3.5" /> Educational Breakthroughs &amp; Centers
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {selectedStateDetail.educational_heritage}
                  </p>
                </div>

                {/* Section 3: Notable Scholars and Heroes */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                  <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <Users className="w-3.5 h-3.5" /> Notable Scholars, Literary Giants &amp; Heroes
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {selectedStateDetail.notable_scholars_and_heroes}
                  </p>
                </div>

                {/* Section 4: Cultural Landmarks */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                  <h3 className="text-xs font-bold text-purple-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <Landmark className="w-3.5 h-3.5" /> Cultural &amp; Geographic Monuments
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {selectedStateDetail.cultural_landmarks}
                  </p>
                </div>

                {/* Section 5: Institutions in this State */}
                {selectedStateDetail.institutions && selectedStateDetail.institutions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Accredited Higher Institutions in {selectedStateDetail.state_name}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedStateDetail.institutions.map((inst: any) => (
                        <div key={inst.id} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                          <div className="text-xs font-bold text-white">{inst.name} ({inst.short_name})</div>
                          {inst.motto && (
                            <div className="text-[10px] text-cyan-300 italic">&ldquo;{inst.motto}&rdquo;</div>
                          )}
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {inst.institution_type} • Est. {inst.founded_year || "Heritage"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 6: Secondary Schools in this State */}
                {selectedStateDetail.secondary_schools && selectedStateDetail.secondary_schools.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <School className="w-3.5 h-3.5 text-amber-400" /> Premier Secondary Schools in {selectedStateDetail.state_name}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedStateDetail.secondary_schools.map((sch: any) => (
                        <div key={sch.id} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                          <div className="text-xs font-bold text-white">{sch.name}</div>
                          {sch.motto && (
                            <div className="text-[10px] text-amber-300 italic">&ldquo;{sch.motto}&rdquo;</div>
                          )}
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {sch.school_type} • Est. {sch.founded_year || "Heritage"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="border-t border-white/10 pt-3 mt-3 flex justify-end">
                <button
                  onClick={() => setSelectedStateDetail(null)}
                  className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

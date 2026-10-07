"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, Sparkles, Volume2, VolumeX, ArrowRight, Lightbulb, 
  AlertTriangle, Star, CheckCircle, Search, Filter, ShieldCheck, Zap
} from "lucide-react";
import { nigerianVoice } from "../../lib/nigerianVoice";
import { sfx } from "../../lib/audio";

interface Tutorial {
  id: string;
  class_tier: string;
  subject: string;
  topic_title: string;
  concept_summary: string;
  nigerian_analogy: string;
  visual_lab_type?: string;
  key_formula_latex?: string;
  common_mistake_trap: string;
  difficulty_stars: number;
}

const TIERS = [
  { id: "ALL", label: "All Tiers", icon: "🌐" },
  { id: "PRIMARY", label: "Primary 4–6", icon: "🎒", sub: "Ages 7–10" },
  { id: "JSS", label: "JSS 1–3", icon: "📘", sub: "Junior WAEC" },
  { id: "SSS", label: "SSS 1–2", icon: "🔬", sub: "Senior Foundation" },
  { id: "UTME", label: "SSS 3 & JAMB", icon: "⚡", sub: "Exam Speed" },
  { id: "FRESHMAN", label: "100L Freshman", icon: "🎓", sub: "University 100L" },
];

export default function CurriculumPage() {
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTutorials() {
      setLoading(true);
      try {
        let url = "/api/backend/curriculum/tutorials";
        const params = new URLSearchParams();
        if (selectedTier !== "ALL") params.append("tier", selectedTier);
        if (selectedSubject !== "ALL") params.append("subject", selectedSubject);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setTutorials(data.tutorials || []);
        }
      } catch (err) {
        console.warn("Error fetching tutorials:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTutorials();
  }, [selectedTier, selectedSubject]);

  const handleNarrate = (tut: Tutorial) => {
    if (isSpeaking === tut.id) {
      nigerianVoice.stop();
      setIsSpeaking(null);
      return;
    }
    sfx.tap();
    setIsSpeaking(tut.id);
    const speechText = `${tut.topic_title}. In simple Nigerian terms: ${tut.nigerian_analogy}. Watch out for this common mistake: ${tut.common_mistake_trap}`;
    
    // Choose persona based on tier
    const persona = tut.class_tier === "PRIMARY" ? "auntie_bola" : "uncle_emeka";
    nigerianVoice.speak(speechText, {
      persona,
      speed: "slow",
      onEnd: () => setIsSpeaking(null),
      onError: () => setIsSpeaking(null)
    });
  };

  const filteredTutorials = tutorials.filter(t => 
    t.topic_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.concept_summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-[#071322] to-black border-b border-blue-500/20 px-4 py-8">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" /> Universal Multi-Tier Curriculum Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white">
            Class Progression <span className="text-blue-400">Academy</span> 📚🇳🇬
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            As students grow from Primary School into Junior Secondary, Senior Secondary, JAMB, and University 100-Level, the curriculum advances with them.
          </p>

          {/* Tier Switcher Pills */}
          <div className="flex justify-center gap-2 pt-4 flex-wrap">
            {TIERS.map(t => (
              <button
                key={t.id}
                onClick={() => { sfx.tap(); setSelectedTier(t.id); }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  selectedTier === t.id
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                <span className="flex items-center gap-1">
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </span>
                {t.sub && <span className={`text-[9px] font-normal ${selectedTier === t.id ? "text-blue-200" : "text-zinc-500"}`}>{t.sub}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        
        {/* Search & Subject Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-2xl border border-white/10">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics, formulas, concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* Subject Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs">
            {["ALL", "Mathematics", "Physics", "Chemistry", "Biology", "English"].map(subj => (
              <button
                key={subj}
                onClick={() => { sfx.tap(); setSelectedSubject(subj); }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                  selectedSubject === subj
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* Tutorials List */}
        {loading ? (
          <div className="text-center py-16 text-zinc-500 text-xs">Loading curriculum modules...</div>
        ) : filteredTutorials.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-zinc-400 text-xs">No tutorials found for this search/filter combination.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTutorials.map((tut) => (
              <div 
                key={tut.id} 
                className="glass-card rounded-3xl p-5 border border-white/10 bg-black/50 shadow-xl space-y-4 flex flex-col justify-between hover:border-blue-500/30 transition-all"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {tut.class_tier}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-semibold">{tut.subject}</span>
                      </div>
                      <h3 className="font-bold text-base text-white">{tut.topic_title}</h3>
                    </div>

                    <button
                      onClick={() => handleNarrate(tut)}
                      title="Listen in Nigerian English"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400 transition-all active:scale-95"
                    >
                      {isSpeaking === tut.id ? <VolumeX className="w-4 h-4 text-red-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Concept Summary */}
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {tut.concept_summary}
                  </p>

                  {/* Formula if present */}
                  {tut.key_formula_latex && (
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 font-mono text-center text-xs text-[#00E676]">
                      {tut.key_formula_latex}
                    </div>
                  )}

                  {/* Nigerian Street Analogy */}
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Everyday Nigerian Street Analogy:</span>
                    </div>
                    <p className="text-xs text-zinc-300 italic leading-relaxed">
                      "{tut.nigerian_analogy}"
                    </p>
                  </div>

                  {/* Common Mistake Trap */}
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>⚠️ Common Exam Mistake Trap:</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {tut.common_mistake_trap}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                    <span>Difficulty:</span>
                    <div className="flex text-amber-400">
                      {Array.from({ length: tut.difficulty_stars }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>

                  {tut.visual_lab_type ? (
                    <Link
                      href="/playground"
                      className="text-xs font-bold text-[#00E676] hover:text-emerald-300 flex items-center gap-1"
                    >
                      <span>Interactive Lab</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href="/quiz"
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <span>Practice Questions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

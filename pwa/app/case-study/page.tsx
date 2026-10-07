"use client";

import { useState, useEffect } from "react";
import { 
  Building2, BookOpen, CheckCircle2, AlertCircle, Award, 
  ArrowRight, RotateCcw, Share2, Compass, Sparkles, MapPin
} from "lucide-react";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

interface CaseSummary {
  id: string;
  title: string;
  setting: string;
  subject: string;
  class_tier: string;
  difficulty: number;
  icon: string;
  color: string;
  scenario_narrative: string;
  curriculum_link: string;
}

interface ChallengeQuestion {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface FullCase extends CaseSummary {
  challenge_questions: ChallengeQuestion[];
  real_curriculum_topics: string[];
  verdict_message: string;
}

export default function CaseStudyPage() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [selectedCase, setSelectedCase] = useState<FullCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backend/case-studies/");
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
      }
    } catch {
      // Fallback cases
      setCases([
        {
          id: "case-01",
          title: "Lagos Emergency Room Crisis",
          setting: "Lagos University Teaching Hospital, Lagos",
          subject: "Biology / Chemistry",
          class_tier: "UTME",
          difficulty: 4,
          icon: "🏥",
          color: "red",
          scenario_narrative: "You are the on-call doctor at LUTH Emergency Room on a rainy Thursday evening...",
          curriculum_link: "JAMB Biology: Excretory System, Homeostasis | JAMB Chemistry: Electrolytes"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCaseDetail = async (caseId: string) => {
    sfx.tap();
    setLoading(true);
    setUserAnswers({});
    setSubmitted(false);
    setResults(null);

    try {
      const res = await fetch(`/api/backend/case-studies/${caseId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCase(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, optLabel: string) => {
    if (submitted) return;
    sfx.tap();
    setUserAnswers(prev => ({ ...prev, [qIdx]: optLabel }));
  };

  const handleSubmitCase = async () => {
    if (!selectedCase || submitting) return;
    setSubmitting(true);
    sfx.tap();

    const answersArray = selectedCase.challenge_questions.map((_, i) => userAnswers[i] || "");

    try {
      const res = await fetch(`/api/backend/case-studies/${selectedCase.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: "demo-student",
          answers: answersArray
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setSubmitted(true);
        sfx.correct();
        triggerTmaHaptic("success");
      }
    } catch {
      // Fallback evaluation
      const correct = selectedCase.challenge_questions.filter((q, i) => userAnswers[i] === q.correct).length;
      const pct = Math.round((correct / selectedCase.challenge_questions.length) * 100);
      setResults({
        case_title: selectedCase.title,
        score: correct,
        total: selectedCase.challenge_questions.length,
        score_pct: pct,
        xp_earned: pct * 2 + 40,
        verdict_message: selectedCase.verdict_message,
        certificate_earned: pct >= 75
      });
      setSubmitted(true);
      sfx.correct();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/60 via-[#0e101c] to-black border border-amber-500/30 p-6 md:p-8 shadow-[0_0_60px_rgba(245,158,11,0.15)]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black tracking-wide uppercase mb-3">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>World-First · Applied Socratic Case Studies</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-display text-white tracking-tight leading-tight mb-2">
            Socratic Street: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-300 to-indigo-300">
              Apply Knowledge to Nigeria
            </span>
          </h1>

          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed mb-4">
            Instead of abstract multiple-choice drill cards, drop directly into high-stakes Nigerian scenarios: 
            a midnight emergency at LUTH, a structural crisis on an Abuja bridge, a pipeline spill in the Niger Delta, 
            or a drought in Kano. Apply your curriculum knowledge where it matters most.
          </p>

          <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>10 Curated Real-World Case Studies · NERDC &amp; JAMB Mapped</span>
          </div>
        </div>
      </div>

      {/* Case List or Detail View */}
      {!selectedCase ? (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            Select a Nigerian Case Study:
          </h2>

          {loading ? (
            <div className="py-16 text-center text-zinc-400 font-mono text-xs">
              Loading Case Studies from National Archives...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cases.map(cs => (
                <div
                  key={cs.id}
                  onClick={() => loadCaseDetail(cs.id)}
                  className="rounded-3xl bg-gradient-to-b from-white/[0.04] to-black border border-white/10 hover:border-amber-500/50 p-6 space-y-3 cursor-pointer transition-all hover:scale-[1.01] group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{cs.icon}</span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {"★".repeat(cs.difficulty)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      {cs.subject}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {cs.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>{cs.setting}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {cs.scenario_narrative}
                  </p>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-amber-400">
                    <span className="text-zinc-500 text-[11px] font-normal">{cs.class_tier}</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Enter Case <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Case Detail & Challenge Interface */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedCase(null)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Back to All Cases
            </button>

            <span className="text-xs font-mono text-amber-400 font-bold">
              {selectedCase.subject} · {selectedCase.class_tier}
            </span>
          </div>

          {/* Narrative Card */}
          <div className="rounded-3xl bg-[#0d0e19] border border-amber-500/30 p-6 md:p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
              <MapPin className="w-4 h-4" />
              <span>{selectedCase.setting}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white font-display">
              {selectedCase.title}
            </h2>

            <div className="text-sm md:text-base text-zinc-200 leading-relaxed space-y-4 border-l-2 border-amber-500/40 pl-4 py-1">
              {selectedCase.scenario_narrative.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-zinc-400">
                <strong className="text-amber-300">Curriculum Connection:</strong> {selectedCase.curriculum_link}
              </div>
            </div>
          </div>

          {/* Challenge Questions */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Applied Decision Questions:
            </h3>

            {selectedCase.challenge_questions?.map((cq, qIdx) => {
              const chosen = userAnswers[qIdx];
              const isCorrect = chosen === cq.correct;

              return (
                <div key={qIdx} className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-mono text-xs flex items-center justify-center shrink-0">
                      Q{qIdx + 1}
                    </span>
                    <p className="text-sm font-bold text-white leading-relaxed">
                      {cq.question}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                    {cq.options.map(opt => {
                      const optLabel = opt.slice(0, 1);
                      const isSelected = chosen === optLabel;
                      let style = "bg-white/5 border-white/10 text-zinc-300 hover:border-white/20";

                      if (submitted) {
                        if (optLabel === cq.correct) {
                          style = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                        } else if (isSelected) {
                          style = "bg-red-500/20 border-red-500 text-red-300 font-bold";
                        }
                      } else if (isSelected) {
                        style = "bg-amber-500/20 border-amber-400 text-amber-300 font-bold";
                      }

                      return (
                        <div
                          key={opt}
                          onClick={() => handleSelectOption(qIdx, optLabel)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${style}`}
                        >
                          {opt}
                        </div>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div className="pt-2 text-xs text-zinc-400 border-t border-white/5">
                      <strong className={isCorrect ? "text-emerald-400" : "text-amber-400"}>
                        {isCorrect ? "Correct: " : `Correct Option is ${cq.correct}: `}
                      </strong>
                      {cq.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submission and Results */}
          {!submitted ? (
            <button
              onClick={handleSubmitCase}
              disabled={submitting || Object.keys(userAnswers).length < (selectedCase.challenge_questions?.length || 4)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-400 text-black font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg disabled:opacity-40 cursor-pointer"
            >
              {submitting ? "Analyzing Your Solutions..." : "Submit Case Solutions"}
            </button>
          ) : (
            <div className="rounded-3xl bg-gradient-to-b from-white/[0.04] to-black border border-amber-500/40 p-6 text-center space-y-4 animate-fade-in">
              <Award className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-xl font-black text-white">
                Applied Mastery: {results?.score_pct || 0}%
              </h3>
              <p className="text-xs text-zinc-300 max-w-lg mx-auto">
                {results?.verdict_message}
              </p>
              <div className="text-xs font-mono text-amber-400">
                +{results?.xp_earned} XP Awarded
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
              >
                Solve Another Case
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

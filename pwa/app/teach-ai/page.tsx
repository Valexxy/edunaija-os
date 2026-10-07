"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, Brain, Award, ArrowRight, RotateCcw, 
  MessageSquare, CheckCircle2, AlertTriangle, Lightbulb, 
  Flame, BookOpen, Send, User, Bot, HelpCircle
} from "lucide-react";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";
import BackButton from "../../components/BackButton";

interface Topic {
  id: string;
  subject: string;
  class_tier: string;
  concept: string;
  description: string;
  temi_confusion_level: number;
  color: string;
  icon: string;
  curriculum_ref: string;
}

interface Exchange {
  turn: number;
  student_explanation: string;
  mastery_score: number;
  ai_response: string;
  follow_up_question: string;
  confusion_type: string;
}

export default function TeachAiPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  
  // Interactive Teaching Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [explanation, setExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<any>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("edunaija_user");
      let activeTier = "ALL";
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const t = (parsed.class_tier || parsed.grade_level || "").toUpperCase();
          if (t === "100L" || t === "FRESHMAN" || t === "TERTIARY") activeTier = "100L";
          else if (t.startsWith("PRI")) activeTier = "PRIMARY";
          else if (t.startsWith("JSS")) activeTier = "JSCE";
          else if (t === "SSS") activeTier = "WAEC";
          else if (t === "UTME") activeTier = "UTME";
        } catch {}
      } else {
        const rawTier = localStorage.getItem("edunaija_class_tier") || "";
        if (rawTier === "100L" || rawTier === "FRESHMAN") activeTier = "100L";
        else if (rawTier.startsWith("PRI")) activeTier = "PRIMARY";
        else if (rawTier.startsWith("JSS")) activeTier = "JSCE";
      }
      if (activeTier !== "ALL") {
        setSelectedTier(activeTier);
      }
    }
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backend/teach-ai/topics");
      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics || []);
      }
    } catch {
      // Fallback
      setTopics([
        {
          id: "t-phys-01",
          subject: "Physics",
          class_tier: "UTME",
          concept: "Osmosis & Diffusion",
          description: "Movement of particles across semi-permeable membranes",
          temi_confusion_level: 3,
          color: "indigo",
          icon: "⚗️",
          curriculum_ref: "JAMB Syllabus — Cell Biology 2.1"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startTeachingTopic = (t: Topic) => {
    sfx.tap();
    setSelectedTopic(t);
    setSessionId(null);
    setExplanation("");
    setExchanges([]);
    setLatestFeedback(null);
    setSessionComplete(false);
  };

  const handleSendExplanation = async () => {
    if (!explanation.trim() || isSubmitting || !selectedTopic) return;
    setIsSubmitting(true);
    sfx.tap();

    try {
      if (!sessionId) {
        // Start new session
        const res = await fetch("/api/backend/teach-ai/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: "demo-student",
            topic_id: selectedTopic.id,
            student_explanation: explanation
          })
        });
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.session_id);
          setLatestFeedback(data);
          setTotalXp(prev => prev + (data.xp_earned || 20));
          setExchanges([
            {
              turn: 1,
              student_explanation: explanation,
              mastery_score: data.mastery_score,
              ai_response: data.ai_response,
              follow_up_question: data.follow_up_question,
              confusion_type: data.confusion_type
            }
          ]);
          sfx.correct();
          triggerTmaHaptic("success");
        }
      } else {
        // Continue multi-turn
        const res = await fetch(`/api/backend/teach-ai/session/${sessionId}/continue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_response: explanation
          })
        });
        if (res.ok) {
          const data = await res.json();
          setLatestFeedback(data);
          setTotalXp(prev => prev + (data.xp_earned || 15));
          if (data.session_complete) {
            setSessionComplete(true);
          }
          setExchanges(prev => [
            ...prev,
            {
              turn: data.turn,
              student_explanation: explanation,
              mastery_score: data.mastery_score,
              ai_response: data.ai_response,
              follow_up_question: data.follow_up_question,
              confusion_type: data.confusion_type
            }
          ]);
          sfx.correct();
          triggerTmaHaptic("medium");
        }
      }
      setExplanation("");
    } catch {
      sfx.wrong();
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTopics = selectedTier === "ALL" 
    ? topics 
    : topics.filter(t => t.class_tier === selectedTier);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <BackButton fallbackHref="/student" label="Back to Cockpit" />
      </div>
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/70 via-[#0e101c] to-black border border-indigo-500/30 p-6 md:p-8 shadow-[0_0_60px_rgba(99,102,241,0.18)]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-black tracking-wide uppercase mb-3">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>World-First · Cognitive Science Protocol</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-display text-white tracking-tight leading-tight mb-2">
            The Protégé Effect: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-300 to-indigo-300">
              Teach AI Junior &quot;Temi&quot;
            </span>
          </h1>

          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed mb-4">
            Educational cognitive science (NTL Institute & CHI 2026) proves that teaching someone else achieves 
            <strong className="text-amber-400"> 90% retention rate</strong> vs just 10% from passive reading. 
            Meet Temi, an inquisitive junior student who will ask Socratic &quot;Why?&quot;, &quot;Can you give an everyday Nigerian example?&quot;, 
            and spot the gaps in your understanding before the examiner does.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Teaching XP: <strong className="text-white">+{totalXp} XP</strong></span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Socratic Dialectic: <strong>Multi-turn Active Recall</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      {!selectedTopic ? (
        <div className="space-y-6">
          {/* Class Tier Filters */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Select a Concept to Teach Temi:
            </h2>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {["ALL", "100L", "UTME", "WAEC", "JSCE", "PRIMARY"].map(tier => (
                <button
                  key={tier}
                  onClick={() => {
                    sfx.tap();
                    setSelectedTier(tier);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedTier === tier
                      ? "bg-indigo-500 text-black font-black"
                      : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Topics Grid */}
          {loading ? (
            <div className="py-16 text-center text-zinc-400">
              <Brain className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-400" />
              <p className="text-xs font-mono">Calibrating Temi&apos;s Knowledge Base...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map(t => (
                <div
                  key={t.id}
                  onClick={() => startTeachingTopic(t)}
                  className="group rounded-3xl bg-gradient-to-b from-white/[0.04] to-black border border-white/10 hover:border-indigo-500/50 p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{t.icon}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                      {t.class_tier}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      {t.subject}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {t.concept}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {t.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      Temi Confusion: 
                      <span className="text-amber-400 font-bold">
                        {"★".repeat(t.temi_confusion_level)}
                      </span>
                    </span>
                    <span className="text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Teach <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Active Teaching Split Workspace */
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setSelectedTopic(null)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Choose Another Concept
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span>Teaching: <strong className="text-white">{selectedTopic.concept}</strong></span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400">{selectedTopic.subject}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Student Explanation Editor (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-3xl bg-[#0c0d18] border border-white/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Your Socratic Explanation
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {explanation.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>

                <p className="text-xs text-zinc-400">
                  Explain <strong className="text-white">{selectedTopic.concept}</strong> as if teaching a younger junior student in secondary school. 
                  Use real examples, why it happens, and what to watch out for.
                </p>

                <textarea
                  value={explanation}
                  onChange={e => setExplanation(e.target.value)}
                  placeholder={`"Look Temi, ${selectedTopic.concept} works like this: imagine when..."`}
                  rows={6}
                  disabled={isSubmitting || sessionComplete}
                  className="w-full bg-black/50 border border-white/10 focus:border-indigo-500/60 rounded-2xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none transition-all resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-zinc-500 italic">
                    Tip: Explaining the &quot;why&quot; scores 3x higher mastery than memorized facts.
                  </span>

                  <button
                    onClick={handleSendExplanation}
                    disabled={isSubmitting || !explanation.trim() || sessionComplete}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-indigo-400 text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-40 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Brain className="w-4 h-4 animate-spin" />
                        Temi is Thinking...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send to Temi
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Exchanges History */}
              {exchanges.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Teaching Transcript:
                  </h4>
                  {exchanges.map((ex, i) => (
                    <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                        <span>Turn {ex.turn}</span>
                        <span className="text-amber-400 font-bold">Mastery: {ex.mastery_score}%</span>
                      </div>
                      <p className="text-zinc-300 italic border-l-2 border-emerald-500/40 pl-3">
                        &quot;{ex.student_explanation}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: AI Junior Temi's Response & Cognitive Analysis (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Temi Avatar Card */}
              <div className="rounded-3xl bg-gradient-to-b from-indigo-950/40 via-black to-black border border-indigo-500/30 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                    {sessionComplete ? "🎓" : isSubmitting ? "🤔" : "🙋🏽‍♂️"}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      Temi <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">Junior Peer</span>
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {sessionComplete ? "Concept Mastered!" : "Listening to your explanation..."}
                    </p>
                  </div>
                </div>

                {latestFeedback ? (
                  <div className="space-y-3 pt-2">
                    {/* Mastery Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-400">Temi&apos;s Comprehension:</span>
                        <strong className="text-amber-400 font-mono">{latestFeedback.mastery_score || 0}%</strong>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-700"
                          style={{ width: `${latestFeedback.mastery_score || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Temi Speech Bubble */}
                    <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Temi says:</span>
                      </div>
                      <p className="text-xs text-white leading-relaxed">
                        {latestFeedback.ai_response}
                      </p>
                    </div>

                    {/* Socratic Follow-Up */}
                    {!sessionComplete && latestFeedback.follow_up_question && (
                      <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-4 space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Temi&apos;s Follow-Up Question:</span>
                        </div>
                        <p className="text-xs text-indigo-100 font-semibold leading-relaxed">
                          &quot;{latestFeedback.follow_up_question}&quot;
                        </p>
                        <p className="text-[10px] text-indigo-300 italic pt-1">
                          Reply in the editor on the left to complete this teaching turn!
                        </p>
                      </div>
                    )}

                    {/* Misconception Tip if detected */}
                    {latestFeedback.misconception_tip && (
                      <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3 space-y-1 text-xs">
                        <span className="font-bold text-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Common JAMB Trap:
                        </span>
                        <p className="text-zinc-300 text-[11px]">
                          {latestFeedback.misconception_tip}
                        </p>
                      </div>
                    )}

                    {/* Session Completed Celebratory Card */}
                    {sessionComplete && (
                      <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                        <h4 className="text-sm font-bold text-white">Full Protégé Cycle Complete!</h4>
                        <p className="text-xs text-zinc-300">
                          You successfully answered all of Temi&apos;s doubts. Cognitive recall consolidated in long-term memory.
                        </p>
                        <button
                          onClick={() => setSelectedTopic(null)}
                          className="mt-2 px-4 py-1.5 rounded-xl bg-emerald-400 text-black font-bold text-xs"
                        >
                          Teach Next Topic (+{totalXp} XP Earned)
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-zinc-500 space-y-2">
                    <p className="text-xs font-mono">
                      Type your explanation on the left and click &quot;Send to Temi&quot; to begin the Socratic dialogue.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

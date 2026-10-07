"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, X, Volume2, VolumeX, RotateCcw, Send, 
  Lightbulb, Layers, Users, BookOpen, CheckCircle2, Play, Square
} from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";
import { nigerianVoice, VoicePersona } from "../lib/nigerianVoice";

interface SubagentBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionText: string;
  subject: string;
  topic: string;
  selectedOption?: string;
  correctOption?: string;
  formula?: string;
}

export default function SubagentBreakdownModal({
  isOpen,
  onClose,
  questionText,
  subject,
  topic,
  selectedOption,
  correctOption,
  formula
}: SubagentBreakdownModalProps) {
  const [activeTab, setActiveTab] = useState<"feynman" | "scaffold" | "tobi">("feynman");
  
  // Voice state
  const [voicePersona, setVoicePersona] = useState<VoicePersona>("uncle_emeka");
  const [voiceSpeed, setVoiceSpeed] = useState<"slow" | "normal">("slow");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Subagents data state
  const [analogy, setAnalogy] = useState<string | null>(null);
  const [analogyLoading, setAnalogyLoading] = useState(false);

  const [scaffold, setScaffold] = useState<any>(null);
  const [scaffoldLoading, setScaffoldLoading] = useState(false);

  // Tobi Teachable Peer Chat
  const [tobiChat, setTobiChat] = useState<{ sender: "tobi" | "student"; text: string }[]>([
    {
      sender: "tobi",
      text: "Abeg, I'm finding this question difficult. Can you explain to me why your option or formula works here?"
    }
  ]);
  const [tobiInput, setTobiInput] = useState("");
  const [tobiLoading, setTobiLoading] = useState(false);

  // Fetch Feynman Analogy when modal opens or tab switched
  useEffect(() => {
    if (!isOpen) {
      nigerianVoice.stop();
      setIsPlayingAudio(false);
      return;
    }

    if (activeTab === "feynman" && !analogy) {
      loadFeynman();
    } else if (activeTab === "scaffold" && !scaffold) {
      loadScaffold();
    }
  }, [isOpen, activeTab]);

  const loadFeynman = async () => {
    setAnalogyLoading(true);
    try {
      const res = await fetch("/api/backend/subagents/feynman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          topic,
          question: questionText,
          concept: topic
        })
      });
      const data = await res.json();
      setAnalogy(data.analogy);
    } catch {
      setAnalogy("Think of this concept like water pressure from a compound overhead tank. The higher the tank, the more pressure you get below!");
    } finally {
      setAnalogyLoading(false);
    }
  };

  const loadScaffold = async () => {
    setScaffoldLoading(true);
    try {
      const res = await fetch("/api/backend/subagents/scaffold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          subject,
          formula: formula || "Standard Governing Formula"
        })
      });
      const data = await res.json();
      setScaffold(data);
    } catch {
      setScaffold({
        steps: [
          { step_num: 1, title: "Identify Given Values", action: "Write down the known quantities from the question." },
          { step_num: 2, title: "Select Governing Formula", action: formula || "Use the standard relation." },
          { step_num: 3, title: "Calculate and Check Units", action: "Substitute carefully without rounding early." }
        ],
        detailed_guidance: "Step 1: Check values. Step 2: Apply formula. Step 3: Solve arithmetic."
      });
    } finally {
      setScaffoldLoading(false);
    }
  };

  const handleSendToTobi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tobiInput.trim()) return;

    const userMsg = tobiInput.trim();
    setTobiChat(prev => [...prev, { sender: "student", text: userMsg }]);
    setTobiInput("");
    setTobiLoading(true);
    sfx.tap();
    triggerTmaHaptic("light");

    try {
      const res = await fetch("/api/backend/subagents/tobi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_message: userMsg,
          topic,
          context_question: questionText
        })
      });
      const data = await res.json();
      setTobiChat(prev => [...prev, { sender: "tobi", text: data.reply }]);
      sfx.correct();
      triggerTmaHaptic("medium");
    } catch {
      setTobiChat(prev => [...prev, {
        sender: "tobi",
        text: "Ah! I understand now! Thank you, you explained that so clearly."
      }]);
    } finally {
      setTobiLoading(false);
    }
  };

  // Nigerian Voice Narration Control
  const handleToggleAudio = () => {
    sfx.tap();
    if (isPlayingAudio) {
      nigerianVoice.stop();
      setIsPlayingAudio(false);
      return;
    }

    let textToSpeak = "";
    if (activeTab === "feynman" && analogy) {
      textToSpeak = `Here is a simple analogy for ${topic}. ${analogy}`;
    } else if (activeTab === "scaffold" && scaffold) {
      textToSpeak = `Let us break down this question into three simple steps. Step one: ${scaffold.steps[0].action}. Step two: ${scaffold.steps[1].action}. Step three: ${scaffold.steps[2].action}.`;
    } else if (activeTab === "tobi") {
      const lastMsg = tobiChat[tobiChat.length - 1];
      textToSpeak = lastMsg ? lastMsg.text : "Let us teach Tobi together.";
    }

    if (!textToSpeak) return;

    nigerianVoice.speak(textToSpeak, {
      persona: voicePersona,
      speed: voiceSpeed,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c0d18] border border-emerald-500/30 rounded-3xl p-6 shadow-[0_0_60px_rgba(0,230,118,0.15)] max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={() => {
            nigerianVoice.stop();
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 pr-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#00E676] text-[10px] font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Pedagogical Scaffolding Specialist Swarm</span>
          </div>
          <h2 className="text-lg font-black font-display text-white">
            Break It Down For Me
          </h2>
          <p className="text-xs text-zinc-400">
            {subject} • <strong className="text-zinc-200">{topic}</strong>
          </p>
        </div>

        {/* Nigerian Voice Synthesis Toolbar */}
        <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-bold">Voice:</span>
            
            <button
              onClick={() => {
                sfx.tap();
                setVoicePersona("uncle_emeka");
                if (isPlayingAudio) nigerianVoice.stop();
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                voicePersona === "uncle_emeka" 
                  ? "bg-emerald-500/20 text-[#00E676] border border-emerald-500/40" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>👨 Uncle Emeka</span>
            </button>

            <button
              onClick={() => {
                sfx.tap();
                setVoicePersona("auntie_bola");
                if (isPlayingAudio) nigerianVoice.stop();
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                voicePersona === "auntie_bola" 
                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/40" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>👩 Auntie Bola</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sfx.tap();
                setVoiceSpeed(prev => prev === "slow" ? "normal" : "slow");
              }}
              className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300 hover:text-white"
              title="Toggle slow learner pace"
            >
              Pace: <strong className="text-emerald-400 uppercase">{voiceSpeed}</strong>
            </button>

            <button
              onClick={handleToggleAudio}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                isPlayingAudio 
                  ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse" 
                  : "bg-gradient-to-r from-emerald-500 to-[#00E676] text-black shadow-md font-black"
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Listen Aloud</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Subagent Mode Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => { sfx.tap(); setActiveTab("feynman"); }}
            className={`py-2 px-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "feynman"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black shadow-md"
                : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Naija Analogy</span>
          </button>

          <button
            onClick={() => { sfx.tap(); setActiveTab("scaffold"); }}
            className={`py-2 px-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "scaffold"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black shadow-md"
                : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3-Step Breakdown</span>
          </button>

          <button
            onClick={() => { sfx.tap(); setActiveTab("tobi"); }}
            className={`py-2 px-2 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "tobi"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-black shadow-md"
                : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Teach Tobi (Peer)</span>
          </button>
        </div>

        {/* Tab 1: Feynman Analogy */}
        {activeTab === "feynman" && (
          <div className="flex-1 overflow-y-auto space-y-3 p-1">
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-100 text-sm leading-relaxed">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-2">
                <Lightbulb className="w-4 h-4" />
                <span>Everyday Street & Cultural Analogy</span>
              </div>
              {analogyLoading ? (
                <div className="py-8 text-center text-zinc-400 text-xs font-mono">
                  Synthesizing Nigerian cultural anchor via Groq...
                </div>
              ) : (
                <p className="whitespace-pre-line leading-relaxed">{analogy}</p>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-zinc-400">
              💡 <strong>Why this works:</strong> Abstract jargon locks the working memory. Anchoring the law to everyday items like soaking garri, danfo buses, or generator tanks creates permanent neural retention.
            </div>
          </div>
        )}

        {/* Tab 2: Step-by-Step Cognitive Scaffolder */}
        {activeTab === "scaffold" && (
          <div className="flex-1 overflow-y-auto space-y-3 p-1">
            {scaffoldLoading ? (
              <div className="py-8 text-center text-zinc-400 text-xs font-mono">
                Deconstructing into 3 bite-sized micro-steps...
              </div>
            ) : scaffold ? (
              <div className="space-y-2.5">
                {scaffold.steps?.map((st: any) => (
                  <div 
                    key={st.step_num} 
                    className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-[#00E676] font-bold text-xs flex items-center justify-center shrink-0">
                      {st.step_num}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white mb-0.5">{st.title}</h4>
                      <p className="text-xs text-zinc-300">{st.action}</p>
                    </div>
                  </div>
                ))}

                {scaffold.detailed_guidance && (
                  <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-zinc-300 font-mono">
                    {scaffold.detailed_guidance}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Tab 3: Teachable Peer 'Tobi' */}
        {activeTab === "tobi" && (
          <div className="flex-1 flex flex-col overflow-hidden space-y-3">
            <div className="flex-1 overflow-y-auto p-2 space-y-2.5 bg-black/40 rounded-2xl border border-white/5 max-h-64">
              {tobiChat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "student"
                        ? "bg-emerald-600 text-white font-medium"
                        : "bg-white/10 text-zinc-200 border border-white/10"
                    }`}
                  >
                    <span className="block text-[10px] font-bold text-zinc-400 mb-0.5 uppercase">
                      {msg.sender === "student" ? "You (Teacher)" : "Tobi (Peer)"}
                    </span>
                    {msg.text}
                  </div>
                </div>
              ))}
              {tobiLoading && (
                <div className="text-left text-[11px] text-zinc-400 italic">
                  Tobi is thinking about what you said...
                </div>
              )}
            </div>

            <form onSubmit={handleSendToTobi} className="flex gap-2">
              <input
                type="text"
                value={tobiInput}
                onChange={(e) => setTobiInput(e.target.value)}
                placeholder="Teach Tobi: 'In this question, we first find...'"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={tobiLoading}
                className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

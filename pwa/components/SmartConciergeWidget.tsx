"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, MessageSquare, Send, Sparkles, X, ChevronRight, CheckCircle2, 
  Volume2, VolumeX, Shield, Clock, Award, PhoneCall, HelpCircle, User
} from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

export interface StudentMemory {
  userId: string;
  name: string;
  academicTier: string;
  state: string;
  lga: string;
  weakTopics: Array<{ subject: string; topic: string; score: number }>;
  subscription: {
    status: "Free" | "Active" | "Expired";
    plan: string;
    expiresAt: string;
  };
  lgaRank: number;
  totalStudentsInLga: number;
}

const DEFAULT_MEMORY: StudentMemory = {
  userId: "REG-2025-8841",
  name: "Chinedu Okafor",
  academicTier: "SSS 3 (JAMB/WAEC)",
  state: "Lagos",
  lga: "Lagos Island",
  weakTopics: [
    { subject: "Physics", topic: "Simple Harmonic Motion", score: 42 },
    { subject: "Chemistry", topic: "Organic Electrolysis", score: 51 }
  ],
  subscription: {
    status: "Active",
    plan: "Standard Scholar Retainer",
    expiresAt: "Nov 30, 2026"
  },
  lgaRank: 14,
  totalStudentsInLga: 420
};

interface ChatMessage {
  id: string;
  sender: "user" | "concierge";
  text: string;
  tier: 0 | 1 | 2;
  chips?: string[];
  timestamp: string;
}

export default function SmartConciergeWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [persona, setPersona] = useState<"Amaka" | "Femi">("Amaka");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>("Guest Scholar");
  const [academicTier, setAcademicTier] = useState<string>("UTME");
  const [userLga, setUserLga] = useState<string>("Lagos Island");
  const [userState, setUserState] = useState<string>("Lagos");
  const [userWeakTopic, setUserWeakTopic] = useState<string>("Mathematics");
  
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize Real Auth & Cohort Memory from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTier = localStorage.getItem("edunaija_class_tier") || localStorage.getItem("edunaija_academic_tier") || "UTME";
      const storedUser = localStorage.getItem("edunaija_user");
      
      let authenticated = false;
      let name = "Guest Scholar";
      let tierLabel = storedTier === "100L" ? "100L University" : storedTier === "PRIMARY" ? "Primary 1–6" : storedTier === "JSS" ? "JSS 1–3 (BECE)" : "SSS 3 (JAMB/WAEC)";
      let lga = "Lagos Island";
      let state = "Lagos";

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && (parsed.full_name || parsed.fullName || parsed.registration_key)) {
            authenticated = true;
            name = (parsed.full_name || parsed.fullName || "Scholar").trim();
            if (parsed.state) state = parsed.state;
            if (parsed.lga) lga = parsed.lga;
            if (parsed.class_tier || parsed.grade_level) {
              const ct = parsed.class_tier || parsed.grade_level;
              tierLabel = ct === "100L" ? "100L University" : ct === "PRIMARY" ? "Primary 1–6" : ct === "JSS" ? "JSS 1–3 (BECE)" : "SSS 3 (JAMB/WAEC)";
            }
          }
        } catch {}
      }

      setIsAuthenticated(authenticated);
      setUserName(name);
      setAcademicTier(tierLabel);
      setUserLga(lga);
      setUserState(state);

      // Seed Initial Welcome Message accurately
      const greeting = authenticated 
        ? `Ẹ n lẹ o, ${name}! Sister Amaka is right here with you. I remember you are preparing for ${tierLabel} in ${lga} LGA. How may I guide your studies or assist your parent today?`
        : `Ẹ n lẹ o! Welcome to EduNaija OS. I am Sister Amaka, your lead AI Academic Concierge. Are you preparing for Primary, JSS BECE, SSS UTME/WAEC, or 100L University? How can I assist you today?`;

      const initialChips = authenticated
        ? [
            "Check My LGA Rank",
            "Review My Weak Topics",
            "Book 15-Min Teacher Interview",
            "Explain Monthly Retainer Fee",
            "Talk to Human Agent"
          ]
        : [
            "Explore Primary 1–6",
            "Prepare for JAMB/WAEC",
            "100L University Courses",
            "Book 15-Min Teacher Interview",
            "Sign In / Register"
          ];

      setMessages([
        {
          id: "m-init",
          sender: "concierge",
          text: greeting,
          tier: 0,
          chips: initialChips,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;
    sfx.tap();
    triggerTmaHaptic("light");

    const newMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userText,
      tier: 0,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    setIsTyping(true);

    // Call Real LLM Concierge Endpoint
    try {
      const historyPayload = messages.slice(-5).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch("/api/backend/smart/concierge-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userText,
          persona: persona,
          user_name: userName,
          is_authenticated: isAuthenticated,
          academic_tier: academicTier,
          lga: userLga,
          state: userState,
          history: historyPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        setIsTyping(false);
        const reply = data.reply || "I am right here with you. How can I further assist your preparation?";
        const chips = data.chips || ["Ask Another Question", "Take Practice Drill", "Explore Tutors"];

        const qLower = userText.toLowerCase();

        // If user triggers auth or test without login, pop registration modal
        if (qLower.includes("sign in") || qLower.includes("register") || qLower.includes("login")) {
          window.dispatchEvent(new CustomEvent("edunaija_open_auth"));
        } else if (qLower.includes("test my knowledge") || qLower.includes("test me") || qLower.includes("quiz me") || qLower.includes("set exam")) {
          if (!isAuthenticated) {
            window.dispatchEvent(new CustomEvent("edunaija_open_auth"));
          }
        }

        // Check if query implies human escalation
        if (qLower.includes("human") || qLower.includes("call agent") || qLower.includes("escalat")) {
          setShowEscalationModal(true);
        }

        setMessages(prev => [
          ...prev,
          {
            id: `c-${Date.now()}`,
            sender: "concierge",
            text: reply,
            tier: 2,
            chips: chips,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
        sfx.correct();
        return;
      }
    } catch (err) {
      console.warn("LLM Chat API fallback:", err);
    }

    // Intelligent Fallback if offline
    setIsTyping(false);
    let fallbackReply = `Well done on asking this, ${userName}. As your academic mentor, I recommend consistent daily micro-drills over midnight cramming. Shall we test your knowledge with a precision sprint?`;
    let fallbackChips = ["Start 3-Question Sprint", "Show Formula Sheet", "Talk to Sister Amaka"];
    const q = userText.toLowerCase();

    // Check if query is clicking "Sign In / Register" or "Register"
    if (q.includes("sign in") || q.includes("register") || q.includes("login")) {
      window.dispatchEvent(new CustomEvent("edunaija_open_auth"));
      fallbackReply = `I have opened the registration portal for you! Once you complete your enrollment or sign in, your XP streaks, LGA tournament ranking, and full proctored CBT mocks will be unlocked.`;
      fallbackChips = ["Explain System Features", "Explore Vetted Tutors", "Back to Studies"];
    } else if (q.includes("test my knowledge") || q.includes("test me") || q.includes("quiz me") || q.includes("set exam")) {
      // Trigger registration modal if user is not authenticated
      if (!isAuthenticated) {
        window.dispatchEvent(new CustomEvent("edunaija_open_auth"));
      }
      fallbackReply = `🌟 **EduNaija OS Official Examination Standard**:\n\nAs your AI Academic Concierge, my role is strictly advisory — I do not set or grade live tests in this chat window.\n\nTo test your knowledge, calculate your live predicted score, and record your performance on your official transcript:\n\n1. **Register / Sign In** so your verified student key, LGA ranking, and XP streaks are recorded.\n2. Access our proctored exam engine at **Practice & Mock (/quiz)**, where all tests run in an isolated CBT lockdown environment with atomic time-sync and marking schemes.`;
      fallbackChips = ["Open Practice & Mock (/quiz)", "Sign In / Register", "Explain Retainer Fees"];
    } else if (q.includes("parent") && (q.includes("exam") || q.includes("test") || q.includes("study"))) {
      fallbackReply = `🛡️ **Strict Parental Oversight Protocol (NDPA 2023 Compliant)**:\n\nOn EduNaija OS, **parents and guardians do not take exams or study courses**. Academic tests and XP are strictly reserved for enrolled students to guarantee 100% transcript integrity.\n\nParents have access to our dedicated **Guardian Cockpit (/parent)** to monitor live ward telemetry, review weekly radar summaries, and book TRCN-vetted tutors.`;
      fallbackChips = ["Go to Guardian Cockpit (/parent)", "Book 15-Min Teacher Interview", "Sign In / Register"];
    } else if (q.includes("calculator") || q.includes("math")) {
      fallbackReply = `Official Examination Rule: Non-programmable on-screen STEM calculators are permitted for Senior Secondary (WAEC/NECO/UTME) and 100L university sciences. Primary school pupils are strictly barred to foster mental arithmetic!`;
      fallbackChips = ["Try STEM Calculator", "Open Quiz Simulator", "Understood"];
    } else if (q.includes("teacher") || q.includes("tutor") || q.includes("retainer") || q.includes("fee") || q.includes("pay") || q.includes("cost")) {
      fallbackReply = `EduNaija uses a Tiered Floor/Ceiling Fixed Monthly Retainer model (₦45k–₦150k/mo) with 100% Free 15-Minute Video Discovery Interviews before paying, and payments held in Milestone Escrow!`;
      fallbackChips = ["Book Free 15-Min Discovery Call", "View 6-Stage Vetted Tutors", "Apply as a Teacher"];
    } else if (q.includes("human") || q.includes("call") || q.includes("support")) {
      setShowEscalationModal(true);
      fallbackReply = `I understand. I have opened a direct channel for our Senior Academic Supervisor helpline (0800-EDUNAIJA) with your profile details intact!`;
      fallbackChips = ["Call Helpline (+234 1 800-EDUNAIJA)", "Back to Studies"];
    }

    setMessages(prev => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        sender: "concierge",
        text: fallbackReply,
        tier: 1,
        chips: fallbackChips,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    sfx.correct();
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const ngVoice = voices.find(v => v.lang.startsWith("en-NG") || v.name.toLowerCase().includes("nigeria")) || voices[0];
    if (ngVoice) utter.voice = ngVoice;
    utter.pitch = persona === "Amaka" ? 1.05 : 0.95;
    utter.rate = 0.95;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            sfx.tap();
            triggerTmaHaptic("medium");
            setIsOpen(true);
          }}
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-[#00E676] text-slate-950 font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-400/40 select-none"
          title="Open Sister Amaka AI Customer Care"
        >
          <div className="relative">
            <span className="text-xl">👩🏾‍🏫</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
          </div>
          <div className="text-left text-xs font-bold leading-tight">
            <div className="font-extrabold text-white flex items-center gap-1">
              <span>Sister Amaka AI</span>
              <Sparkles className="w-3 h-3 text-amber-300 fill-current" />
            </div>
            <div className="text-[10px] text-emerald-100 font-mono">0-Token Frugal Concierge</div>
          </div>
        </button>
      )}

      {/* Main Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[390px] h-[580px] rounded-3xl bg-[#090C16] border border-emerald-500/40 shadow-2xl flex flex-col overflow-hidden text-white backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-[#0B0F19] border-b border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
                {persona === "Amaka" ? "👩🏾‍🏫" : "👨🏾‍🏫"}
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1">
                  <span>Sister {persona} Concierge</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[#00E676] text-[9px] font-mono">LIVE AI</span>
                </div>
                <div className="text-[10px] text-zinc-400">Always Remembers • Empathetic Guide</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPersona(p => p === "Amaka" ? "Femi" : "Amaka")}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-zinc-300 font-mono border border-white/10 cursor-pointer"
                title="Switch Persona"
              >
                {persona === "Amaka" ? "⇄ Femi" : "⇄ Amaka"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Persistent Memory Badge (Adaptive: Guest vs Authenticated Scholar) */}
          <div className="px-3.5 py-1.5 bg-emerald-950/40 border-b border-emerald-500/20 text-[10px] text-emerald-300 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
            <span className="truncate">
              {isAuthenticated ? (
                <>Remembers: <strong>{userName}</strong> • {academicTier} • {userLga} LGA</>
              ) : (
                <>Status: <strong>Guest Scholar</strong> • Cohort: {academicTier} • Sign In to Save XP</>
              )}
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-emerald-600 to-[#00E676] text-slate-950 font-semibold rounded-tr-none shadow-md"
                    : "bg-slate-900/90 border border-white/10 text-zinc-100 rounded-tl-none shadow-md"
                }`}>
                  {msg.text}
                </div>

                {/* Subtext info & voice play */}
                {msg.sender === "concierge" && (
                  <div className="flex items-center gap-2 mt-1 px-1 text-[9px] text-zinc-500 font-mono">
                    <button
                      onClick={() => speakText(msg.text)}
                      className="text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      <span>Voice</span>
                    </button>
                    <span>•</span>
                    <span>{msg.tier === 0 ? "⚡ 0-Token Trie" : msg.tier === 1 ? "📚 Client KB" : "🤖 Edge Context"}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>
                )}

                {/* Quick Action Chips */}
                {msg.chips && msg.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip)}
                        className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-[#00E676] font-bold transition cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-zinc-400 text-xs w-max animate-pulse">
                <span>Sister {persona} is reflecting...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-950 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              placeholder={`Ask Sister ${persona} anything...`}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendMessage(inputText)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim()}
              className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 flex items-center justify-center transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Human Escalation Modal */}
      {showEscalationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-purple-500/40 p-5 shadow-2xl flex flex-col gap-3.5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Express Human Escalation</h3>
              </div>
              <button onClick={() => setShowEscalationModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              We have compiled a zero-repetition diagnostic payload for our Lead Academic Supervisor:
            </p>

            <div className="p-3 rounded-2xl bg-black/50 border border-white/10 text-[11px] font-mono space-y-1 text-purple-300">
              <div>• <strong>Caller:</strong> {userName} ({isAuthenticated ? "Verified Student" : "Guest Explorer"})</div>
              <div>• <strong>Cohort:</strong> {academicTier}</div>
              <div>• <strong>Location:</strong> {userState} / {userLga} LGA</div>
              <div>• <strong>Priority Subject:</strong> {userWeakTopic}</div>
              <div>• <strong>Escrow Retainer:</strong> Tiered Milestone Escrow Active</div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEscalationModal(false)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Diagnostic Ticket #EDN-${Math.floor(Math.random() * 9000 + 1000)} created! An officer will call your registered line within 15 minutes.`);
                  setShowEscalationModal(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

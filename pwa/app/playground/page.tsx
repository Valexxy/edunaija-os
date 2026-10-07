"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, Zap, BookOpen, Volume2, VolumeX, CheckCircle2, 
  XCircle, RotateCcw, Lightbulb, Search, Award, Flame, ArrowRight,
  Sliders, Shield, Layers, HelpCircle
} from "lucide-react";
import { nigerianVoice } from "../../lib/nigerianVoice";
import { sfx } from "../../lib/audio";
import BackButton from "../../components/BackButton";

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<"labs" | "detective" | "mnemonics" | "story">("labs");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- LAB 1: OHM'S ELECTRIC CIRCUIT LAB ---
  const [voltage, setVoltage] = useState(6);
  const [resistance, setResistance] = useState(3);
  const current = Number((voltage / resistance).toFixed(2));
  const isFuseBlown = voltage >= 22 && resistance <= 2;

  // --- LAB 2: BIOLOGY CELL EXPLORER ---
  const [selectedOrganelle, setSelectedOrganelle] = useState<string>("nucleus");

  // --- LAB 3: ALGEBRA BALANCE SCALE (2x + 4 = 10) ---
  const [balanceStep, setBalanceStep] = useState<number>(1);

  // --- LAB 4: CHEMISTRY STATES OF MATTER (HEAT) ---
  const [temperature, setTemperature] = useState<number>(25);

  // --- DETECTIVE GAME STATE ---
  const [detectiveCases, setDetectiveCases] = useState<any[]>([]);
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [selectedDetectiveStep, setSelectedDetectiveStep] = useState<number | null>(null);
  const [detectiveFeedback, setDetectiveFeedback] = useState<any | null>(null);
  const [detectiveScore, setDetectiveScore] = useState(0);

  // --- MNEMONICS STATE ---
  const [mnemonics, setMnemonics] = useState<any[]>([]);
  const [selectedMnemonic, setSelectedMnemonic] = useState<any | null>(null);
  const [mnemonicSearch, setMnemonicSearch] = useState("");

  // --- STORYBOOK STATE ---
  const [storyTopic, setStoryTopic] = useState("Photosynthesis");
  const [characterName, setCharacterName] = useState("Kemi");
  const [generatedStory, setGeneratedStory] = useState<any | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);

  // Fetch Detective cases & Mnemonics from backend
  useEffect(() => {
    async function loadData() {
      try {
        const mRes = await fetch("/api/backend/children/mnemonics");
        if (mRes.ok) {
          const mData = await mRes.json();
          setMnemonics(mData.mnemonics || []);
          if (mData.mnemonics?.length > 0) setSelectedMnemonic(mData.mnemonics[0]);
        }
        const dRes = await fetch("/api/backend/children/detective-cases");
        if (dRes.ok) {
          const dData = await dRes.json();
          setDetectiveCases(dData.cases || []);
        }
      } catch (err) {
        console.warn("Could not load children data from backend:", err);
      }
    }
    loadData();
  }, []);

  // Voice narration helper
  const handleNarrate = (text: string) => {
    if (isSpeaking) {
      nigerianVoice.stop();
      setIsSpeaking(false);
      return;
    }
    sfx.tap();
    setIsSpeaking(true);
    nigerianVoice.speak(text, {
      persona: "auntie_bola",
      speed: "slow",
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  // Detective check answer
  const handleCheckDetectiveStep = (stepNumber: number) => {
    const curCase = detectiveCases[currentCaseIndex];
    if (!curCase) return;

    setSelectedDetectiveStep(stepNumber);
    if (stepNumber === curCase.culprit_line) {
      sfx.correct();
      setDetectiveScore(s => s + 20);
      setDetectiveFeedback({
        isCorrect: true,
        message: "🎉 BINGO DETECTIVE! You caught Chidi's exact error!",
        correction: curCase.steps.find((s: any) => s.line_number === stepNumber)?.correction,
        rule: curCase.rule_learned
      });
    } else {
      sfx.wrong();
      setDetectiveFeedback({
        isCorrect: false,
        message: "🧐 Look closer! That line was actually calculated correctly. Try checking another step!",
        correction: null,
        rule: null
      });
    }
  };

  // Generate Illustrated Storybook
  const handleGenerateStory = async (topicToUse?: string) => {
    const topic = topicToUse || storyTopic;
    setLoadingStory(true);
    sfx.tap();
    try {
      const res = await fetch("/api/backend/children/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          character_name: characterName,
          age_group: "8-14"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedStory(data);
        sfx.correct();
      }
    } catch {
      sfx.wrong();
    } finally {
      setLoadingStory(false);
    }
  };

  const organelles: Record<string, { name: string; naija_title: string; job: string; color: string }> = {
    nucleus: {
      name: "The Nucleus",
      naija_title: "👑 The Royal King's Palace (Command Center)",
      job: "The brain and boss of the cell! It stores your DNA recipe book that decides if you have black hair, tall height, or brown eyes.",
      color: "from-purple-500 to-indigo-600"
    },
    mitochondria: {
      name: "The Mitochondria",
      naija_title: "⚡ The Mikano Generator (Powerhouse)",
      job: "The power station of the cell! It burns the Jollof rice and yam you eat to generate pure energy (ATP) so you can run and think.",
      color: "from-amber-500 to-red-600"
    },
    chloroplast: {
      name: "The Chloroplast (Plant Cells)",
      naija_title: "🍳 Mama Put Kitchen (Solar Cooker)",
      job: "Exclusive to plant leaves! It traps golden sunlight from the sky to cook delicious glucose sugar from carbon dioxide and water.",
      color: "from-emerald-500 to-green-600"
    },
    membrane: {
      name: "The Cell Membrane",
      naija_title: "🚪 Uniformed Security Guard",
      job: "The vigilant gatekeeper! It inspects everything entering or leaving the cell. It lets water and food in, but kicks dangerous viruses out!",
      color: "from-blue-500 to-cyan-600"
    },
    vacuole: {
      name: "The Vacuole",
      naija_title: "🚰 Giant GP Tank (Water Reservoir)",
      job: "The storage warehouse! In plant cells, it fills with fresh water like a water tank. When full, the plant stands tall and strong!",
      color: "from-teal-500 to-emerald-600"
    }
  };

  const currentCase = detectiveCases[currentCaseIndex];

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#0a1a12] to-black border-b border-emerald-500/20 px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <BackButton fallbackHref="/student" label="Back to Cockpit" />
          </div>
          <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> For Children & Slow Learners • Visual & Auditory Learning
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white">
            EduNaija <span className="text-[#00E676]">Wonder Lab</span> 🎨🔬
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Where dry science and maths turn into interactive playgrounds, animated cartoons, mystery detective games, and catchy memory hooks!
          </p>

          {/* Navigation Tabs */}
          <div className="flex justify-center gap-2 pt-4 flex-wrap">
            {[
              { id: "labs", label: "🧪 Visual Micro-Labs", desc: "Touch & See" },
              { id: "detective", label: "🕵️‍♂️ Mistake Detective", desc: "Catch the Error" },
              { id: "mnemonics", label: "🧠 Memory Mnemonic Vault", desc: "Naija Rhymes" },
              { id: "story", label: "📖 Science Storybook", desc: "Bedtime Science" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { sfx.tap(); setActiveTab(tab.id as any); }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#00E676] text-black shadow-[0_0_20px_rgba(0,230,118,0.3)] scale-105"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[9px] font-normal ${activeTab === tab.id ? "text-black/70" : "text-zinc-500"}`}>{tab.desc}</span>
              </button>
            ))}
          </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* ================= TAB 1: VISUAL MICRO-LABS ================= */}
        {activeTab === "labs" && (
          <div className="space-y-8">
            
            {/* LAB 1: OHM'S LAW ELECTRIC CIRCUIT */}
            <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-black/60 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Physics Interactive Lab</span>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    ⚡ The Electric Lightbulb Circuit
                  </h2>
                </div>
                <button
                  onClick={() => handleNarrate(`In this electric circuit, voltage pushes the electrons while resistance tries to slow them down. Your current is ${current} amperes.`)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-emerald-400 flex items-center gap-1.5"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeaking ? "Stop" : "Listen"}</span>
                </button>
              </div>

              {/* Interactive Circuit Canvas */}
              <div className="relative rounded-2xl bg-zinc-950 p-6 border border-white/10 flex flex-col items-center justify-center min-h-[220px] overflow-hidden">
                {isFuseBlown ? (
                  <div className="text-center space-y-2 animate-bounce">
                    <div className="text-5xl">💥💨</div>
                    <div className="text-base font-black text-red-400">BOOM! FUSE BLOWN!</div>
                    <div className="text-xs text-zinc-400 max-w-sm">
                      The current ({current}A) was too intense for this tiny circuit! Increase Resistance or reduce Voltage to reset the fuse!
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    {/* Glowing Bulb */}
                    <div className="relative flex items-center justify-center">
                      <div 
                        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all duration-300"
                        style={{
                          backgroundColor: `rgba(255, 230, 0, ${Math.min(1, current * 0.15 + 0.1)})`,
                          boxShadow: `0 0 ${Math.min(80, current * 12)}px rgba(255, 230, 0, ${Math.min(1, current * 0.2)})`
                        }}
                      >
                        💡
                      </div>
                    </div>
                    {/* Live Instrument Readout */}
                    <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-xl border border-white/10 font-mono text-xs">
                      <div><span className="text-zinc-500">Voltage:</span> <span className="text-amber-400 font-bold">{voltage}V</span></div>
                      <span className="text-zinc-600">÷</span>
                      <div><span className="text-zinc-500">Resistance:</span> <span className="text-blue-400 font-bold">{resistance}Ω</span></div>
                      <span className="text-zinc-600">=</span>
                      <div><span className="text-zinc-500">Current (I):</span> <span className="text-[#00E676] font-black text-sm">{current}A</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-zinc-300">🔋 Battery Push (Voltage: {voltage} Volts)</span>
                    <span className="text-amber-400 font-mono font-bold">{voltage} V</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={voltage}
                    onChange={(e) => setVoltage(Number(e.target.value))}
                    className="w-full accent-amber-400 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500">Think of Voltage like how hard Uncle Emeka pushes a heavy wheelbarrow!</p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-zinc-300">🧱 Narrow Pipe (Resistance: {resistance} Ohms)</span>
                    <span className="text-blue-400 font-mono font-bold">{resistance} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={resistance}
                    onChange={(e) => setResistance(Number(e.target.value))}
                    className="w-full accent-blue-400 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500">Resistance is like Lagos Go-Slow traffic slowing the flow of electrons!</p>
                </div>
              </div>
            </div>

            {/* LAB 2: BIOLOGY CARTOON CELL EXPLORER */}
            <div className="glass-card rounded-3xl p-6 border border-purple-500/30 bg-black/60 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Biology Interactive Lab</span>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    🔬 The Secret City Inside a Living Cell
                  </h2>
                </div>
                <button
                  onClick={() => handleNarrate(`${organelles[selectedOrganelle].naija_title}. ${organelles[selectedOrganelle].job}`)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-purple-400 flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Explain Out Loud</span>
                </button>
              </div>

              {/* Clickable Organelle Buttons */}
              <div className="flex flex-wrap gap-2">
                {Object.keys(organelles).map((key) => (
                  <button
                    key={key}
                    onClick={() => { sfx.tap(); setSelectedOrganelle(key); }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedOrganelle === key
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105"
                        : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
                    }`}
                  >
                    {organelles[key].name}
                  </button>
                ))}
              </div>

              {/* Organelle Spotlight Card */}
              <div className={`p-6 rounded-2xl bg-gradient-to-br ${organelles[selectedOrganelle].color} bg-opacity-20 border border-white/20 space-y-3`}>
                <div className="text-sm font-black text-white uppercase tracking-wide">
                  {organelles[selectedOrganelle].naija_title}
                </div>
                <p className="text-sm text-zinc-100 leading-relaxed font-medium">
                  {organelles[selectedOrganelle].job}
                </p>
                <div className="pt-2 text-[11px] text-white/80 font-mono flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Every living creature in Nigeria is built from trillions of these busy little cities!
                </div>
              </div>
            </div>

            {/* LAB 3: ALGEBRA MARKET BALANCE SCALE */}
            <div className="glass-card rounded-3xl p-6 border border-blue-500/30 bg-black/60 shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Mathematics Interactive Lab</span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  ⚖️ The Market Scale Algebra Secret (2x + 4 = 10)
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Algebra isn't magic! It is simply an African market balance scale that must stay level!
                </p>
              </div>

              {/* Visual Balance Illustration */}
              <div className="bg-zinc-950 p-6 rounded-2xl border border-white/10 flex flex-col items-center space-y-4">
                <div className="flex items-center justify-between w-full max-w-md gap-4">
                  {/* Left Pan */}
                  <div className="flex-1 bg-blue-500/10 border-2 border-blue-500/40 rounded-2xl p-4 text-center space-y-2">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">Left Pan</span>
                    {balanceStep === 1 && (
                      <div>
                        <div className="text-2xl font-black text-blue-300">📦📦 + 🍏🍏🍏🍏</div>
                        <div className="text-xs font-mono text-zinc-300">2x + 4</div>
                      </div>
                    )}
                    {balanceStep === 2 && (
                      <div>
                        <div className="text-2xl font-black text-blue-300">📦📦</div>
                        <div className="text-xs font-mono text-zinc-300">2x</div>
                      </div>
                    )}
                    {balanceStep === 3 && (
                      <div>
                        <div className="text-2xl font-black text-[#00E676]">📦</div>
                        <div className="text-xs font-mono text-emerald-400 font-bold">1x</div>
                      </div>
                    )}
                  </div>

                  {/* Equal Sign Fulcrum */}
                  <div className="text-3xl font-black text-zinc-500">=</div>

                  {/* Right Pan */}
                  <div className="flex-1 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 text-center space-y-2">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">Right Pan</span>
                    {balanceStep === 1 && (
                      <div>
                        <div className="text-2xl font-black text-amber-300">🍏🍏🍏🍏🍏🍏🍏🍏🍏🍏</div>
                        <div className="text-xs font-mono text-zinc-300">10 Apples</div>
                      </div>
                    )}
                    {balanceStep === 2 && (
                      <div>
                        <div className="text-2xl font-black text-amber-300">🍏🍏🍏🍏🍏🍏</div>
                        <div className="text-xs font-mono text-zinc-300">6 Apples</div>
                      </div>
                    )}
                    {balanceStep === 3 && (
                      <div>
                        <div className="text-2xl font-black text-[#00E676]">🍏🍏🍏</div>
                        <div className="text-xs font-mono text-emerald-400 font-bold">3 Apples</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step Explanation */}
                <div className="text-center space-y-1">
                  {balanceStep === 1 && (
                    <p className="text-xs text-zinc-300">
                      <strong>Step 1:</strong> The scale is balanced: Two mystery boxes plus 4 apples weigh the same as 10 apples.
                    </p>
                  )}
                  {balanceStep === 2 && (
                    <p className="text-xs text-emerald-300 font-medium">
                      <strong>Step 2:</strong> We took away 4 apples from BOTH pans! Now two mystery boxes weigh 6 apples (2x = 6).
                    </p>
                  )}
                  {balanceStep === 3 && (
                    <p className="text-xs text-[#00E676] font-bold">
                      🎉 <strong>Step 3:</strong> We divided both pans into two equal piles! Each mystery box <strong>x = 3</strong>!
                    </p>
                  )}
                </div>

                {/* Step Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { sfx.tap(); setBalanceStep(1); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${balanceStep === 1 ? "bg-white/20 text-white" : "bg-white/5 text-zinc-400"}`}
                  >
                    1. Starting Scale
                  </button>
                  <button
                    onClick={() => { sfx.tap(); setBalanceStep(2); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${balanceStep === 2 ? "bg-blue-600 text-white" : "bg-white/5 text-zinc-400"}`}
                  >
                    2. Remove 4 Apples
                  </button>
                  <button
                    onClick={() => { sfx.correct(); setBalanceStep(3); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold ${balanceStep === 3 ? "bg-[#00E676] text-black" : "bg-white/5 text-zinc-400"}`}
                  >
                    3. Solve for x!
                  </button>
                </div>
              </div>
            </div>

            {/* LAB 4: CHEMISTRY KINETIC HEAT SIMULATOR */}
            <div className="glass-card rounded-3xl p-6 border border-amber-500/30 bg-black/60 shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Chemistry Interactive Lab</span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  🔥 States of Matter & Dancing Molecules
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Heat is just kinetic energy! Watch how water molecules dance when you turn up the burner!
                </p>
              </div>

              <div className="bg-zinc-950 p-6 rounded-2xl border border-white/10 flex flex-col items-center space-y-4">
                <div className="text-5xl">
                  {temperature <= 0 ? "🧊" : temperature < 100 ? "💧" : "💨"}
                </div>
                <div className="text-center">
                  <div className="text-xl font-black font-mono text-amber-400">{temperature}°C</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {temperature <= 0 && "Solid (Ice): Molecules are locked tight, shivering in place!"}
                    {temperature > 0 && temperature < 100 && "Liquid (Water): Molecules are sliding smoothly past each other!"}
                    {temperature >= 100 && "Gas (Steam): Molecules broke free and are zooming at supersonic speed!"}
                  </div>
                </div>

                <div className="w-full max-w-sm space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>-10°C (Freezer)</span>
                    <span>150°C (Hot Pot)</span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="150"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full accent-amber-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: MISTAKE DETECTIVE ================= */}
        {activeTab === "detective" && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-black/60 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Diagnostic Practice</span>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    🕵️‍♂️ Catch Chidi's Homework Blunder!
                  </h2>
                </div>
                <div className="bg-[#00E676]/10 border border-[#00E676]/30 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-[#00E676] flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Score: {detectiveScore} XP
                </div>
              </div>

              {currentCase ? (
                <div className="space-y-4">
                  {/* Scenario Banner */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-bold">{currentCase.subject}</span>
                      <span className="text-zinc-500 font-mono">{currentCase.difficulty}</span>
                    </div>
                    <h3 className="font-bold text-base text-white">{currentCase.title}</h3>
                    <p className="text-xs text-zinc-300 leading-relaxed">{currentCase.scenario}</p>
                  </div>

                  {/* Steps list with click to convict */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-400">👇 Click on the exact line where Chidi made an error:</p>
                    {currentCase.steps.map((st: any) => {
                      const isSelected = selectedDetectiveStep === st.line_number;
                      return (
                        <button
                          key={st.line_number}
                          onClick={() => handleCheckDetectiveStep(st.line_number)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? st.is_error
                                ? "bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_20px_rgba(0,230,118,0.3)]"
                                : "bg-red-500/20 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                              : "bg-white/5 border-white/10 text-zinc-300 hover:border-emerald-500/40 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-zinc-400">
                              L{st.line_number}
                            </span>
                            <span className="font-mono text-xs font-medium">{st.text}</span>
                          </div>
                          {isSelected && (
                            st.is_error ? <CheckCircle2 className="w-5 h-5 text-[#00E676]" /> : <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Drawer */}
                  {detectiveFeedback && (
                    <div className={`p-4 rounded-2xl border space-y-2 ${
                      detectiveFeedback.isCorrect ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200" : "bg-red-500/10 border-red-500/30 text-red-200"
                    }`}>
                      <div className="font-bold text-sm">{detectiveFeedback.message}</div>
                      {detectiveFeedback.correction && (
                        <p className="text-xs text-white leading-relaxed">{detectiveFeedback.correction}</p>
                      )}
                      {detectiveFeedback.rule && (
                        <div className="pt-2 text-xs font-mono text-emerald-400 border-t border-emerald-500/20">
                          💡 <strong>Golden Rule:</strong> {detectiveFeedback.rule}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Switch Case Buttons */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => {
                        sfx.tap();
                        setSelectedDetectiveStep(null);
                        setDetectiveFeedback(null);
                        setCurrentCaseIndex((i) => (i > 0 ? i - 1 : detectiveCases.length - 1));
                      }}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-400"
                    >
                      ← Previous Mystery
                    </button>
                    <button
                      onClick={() => {
                        sfx.tap();
                        setSelectedDetectiveStep(null);
                        setDetectiveFeedback(null);
                        setCurrentCaseIndex((i) => (i + 1) % detectiveCases.length);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black text-xs font-black"
                    >
                      Next Mystery →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500 text-xs">Loading detective mysteries...</div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: MNEMONICS VAULT ================= */}
        {activeTab === "mnemonics" && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-black/60 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Naija Memory Anchors</span>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    🧠 The Nigerian Exam Mnemonic Vault
                  </h2>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search mnemonic..."
                    value={mnemonicSearch}
                    onChange={(e) => setMnemonicSearch(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Mnemonic Chips */}
              <div className="flex flex-wrap gap-2">
                {mnemonics
                  .filter(m => m.title.toLowerCase().includes(mnemonicSearch.toLowerCase()) || m.subject.toLowerCase().includes(mnemonicSearch.toLowerCase()))
                  .map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { sfx.tap(); setSelectedMnemonic(m); }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedMnemonic?.id === m.id
                          ? "bg-[#00E676] text-black shadow-md shadow-emerald-500/20 scale-105"
                          : "bg-white/5 text-zinc-300 hover:text-white border border-white/5"
                      }`}
                    >
                      {m.title}
                    </button>
                  ))}
              </div>

              {/* Selected Mnemonic Display */}
              {selectedMnemonic && (
                <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {selectedMnemonic.subject}
                      </span>
                      <h3 className="text-lg font-black text-white mt-1">{selectedMnemonic.title}</h3>
                    </div>
                    <button
                      onClick={() => handleNarrate(`${selectedMnemonic.naija_hook}. ${selectedMnemonic.fun_fact}`)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-emerald-400 flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Recite Aloud
                    </button>
                  </div>

                  {/* The Acronym Hero Box */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                    <span className="text-[10px] text-zinc-400 font-mono">CATCHY NIGERIAN HOOK</span>
                    <div className="text-lg sm:text-xl font-black text-[#00E676]">{selectedMnemonic.acronym}</div>
                    <p className="text-xs text-zinc-300 italic">{selectedMnemonic.naija_hook}</p>
                  </div>

                  {/* Letter Breakdown Table */}
                  <div className="space-y-1.5">
                    {selectedMnemonic.expansion.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono font-black text-[#00E676] shrink-0">
                          {item.letter}
                        </span>
                        <div>
                          <strong className="text-white block">{item.word}</strong>
                          <span className="text-zinc-400 text-[11px]">{item.meaning}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fun Fact */}
                  {selectedMnemonic.fun_fact && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-400 flex items-start gap-2">
                      <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{selectedMnemonic.fun_fact}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: SCIENCE STORYBOOK ================= */}
        {activeTab === "story" && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-black/60 shadow-2xl space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Story-Based Comprehension</span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  📖 Auntie Simi's Bedtime Science Adventures
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Tell any complex concept as a heartwarming African story that a child will remember for life!
                </p>
              </div>

              {/* Topic Selectors */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 block">Pick or type a topic:</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Photosynthesis in Plants",
                    "Why Rain Falls From Clouds",
                    "How Gravity Keeps Us On Earth",
                    "Electric Current in Wires",
                    "Fractions and Sharing Pizza",
                    "How Blood Circulates in the Heart"
                  ].map(topic => (
                    <button
                      key={topic}
                      onClick={() => {
                        setStoryTopic(topic);
                        handleGenerateStory(topic);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        storyTopic === topic
                          ? "bg-emerald-500 text-black font-bold"
                          : "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={storyTopic}
                    onChange={(e) => setStoryTopic(e.target.value)}
                    placeholder="Enter any topic (e.g. Chemical Bonding, Fractions)..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    onClick={() => handleGenerateStory()}
                    disabled={loadingStory}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{loadingStory ? "Writing Story..." : "Generate Story"}</span>
                  </button>
                </div>
              </div>

              {/* Generated Story Display */}
              {generatedStory && (
                <div className="p-6 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-lg font-black text-white">{generatedStory.title}</h3>
                    <button
                      onClick={() => handleNarrate(`${generatedStory.title}. ${generatedStory.scenes?.map((s: any) => s.story_text).join(" ")} ${generatedStory.big_lesson}`)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                    </button>
                  </div>

                  {/* 3 Story Scenes */}
                  {generatedStory.scenes && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {generatedStory.scenes.map((scene: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">ACT {i + 1}</span>
                            <h4 className="text-xs font-bold text-white mt-0.5 mb-1.5">{scene.scene_title}</h4>
                            <p className="text-xs text-zinc-300 leading-relaxed">{scene.story_text}</p>
                          </div>
                          <div className="pt-2 text-[10px] text-zinc-500 italic border-t border-white/5">
                            🎨 {scene.visual_description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Raw story fallback only if structured scenes are missing */}
                  {(!generatedStory.scenes || generatedStory.scenes.length === 0) && generatedStory.raw_story && (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                      <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                        {typeof generatedStory.raw_story === 'string'
                          ? generatedStory.raw_story.replace(/```json[\s\S]*?```/gi, '').replace(/```[\s\S]*?```/gi, '').trim() || generatedStory.raw_story
                          : JSON.stringify(generatedStory.raw_story)}
                      </p>
                    </div>
                  )}

                  {/* Big Lesson & Fun Word */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {generatedStory.big_lesson && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 font-mono">🌟 THE BIG LESSON</span>
                        <p className="text-xs text-white font-medium">{generatedStory.big_lesson}</p>
                      </div>
                    )}
                    {generatedStory.fun_word && (
                      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                        <span className="text-[10px] font-bold text-purple-400 font-mono">💡 NEW WORD TO REMEMBER</span>
                        <p className="text-xs text-white font-medium">{generatedStory.fun_word}</p>
                      </div>
                    )}
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

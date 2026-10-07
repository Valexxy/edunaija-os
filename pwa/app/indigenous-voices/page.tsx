"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Volume2, Play, Pause, Sparkles, BookOpen, Music, 
  RotateCcw, Award, Globe, MessageSquare, Mic, Sliders,
  CheckCircle2, Compass, ArrowRight, Download, Share2
} from "lucide-react";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";
import IndigenousToneGrader from "../../components/IndigenousToneGrader";
import BackButton from "../../components/BackButton";

interface VoicePersona {
  id: string;
  name: string;
  gender: string;
  language: string;
  title: string;
  description: string;
  type: string;
  accent?: string;
  pitch_tier?: string;
  signature_greeting?: string;
}

interface GoldenPhrase {
  id: string;
  language: string;
  category: string;
  text_indigenous: string;
  phonetic_ipa: string;
  english_translation: string;
  persona_id: string;
  cultural_context: string;
  tone_sequence?: string[];
}

export default function IndigenousVoicesPage() {
  const [personas, setPersonas] = useState<Record<string, VoicePersona>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedPersona, setSelectedPersona] = useState<string>("baba_agba");
  const [phrases, setPhrases] = useState<GoldenPhrase[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  
  // Custom Speech Synthesis
  const [customText, setCustomText] = useState<string>("Ẹ kú àárọ̀ o, gbogbo ilé!");
  const [customSpeed, setCustomSpeed] = useState<string>("normal");
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlayingCustom, setIsPlayingCustom] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tonal Analysis for Visualizer
  const [tonalWord, setTonalWord] = useState<string>("ọ̀kọ́");
  const [tonalAnalysis, setTonalAnalysis] = useState<any[]>([]);

  // ADR (Automatic Diacritic Restoration) Engine State
  const [adrInputText, setAdrInputText] = useState<string>("E kaaro bawo ni gbogbo ile?");
  const [adrLanguage, setAdrLanguage] = useState<string>("yoruba");
  const [adrPersona, setAdrPersona] = useState<string>("baba_agba");
  const [isRestoringAdr, setIsRestoringAdr] = useState<boolean>(false);
  const [adrResult, setAdrResult] = useState<any | null>(null);

  const handleRestoreDiacritics = async () => {
    if (!adrInputText.trim()) return;
    setIsRestoringAdr(true);
    triggerTmaHaptic("medium");
    sfx.tap();
    try {
      const res = await fetch("/api/backend/tts/restore-diacritics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: adrInputText,
          language: adrLanguage
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAdrResult(data);
      }
    } catch (err) {
      console.error("ADR Error:", err);
    } finally {
      setIsRestoringAdr(false);
    }
  };

  // Fetch personas and golden vault
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [resPersonas, resPhrases] = await Promise.all([
          fetch("/api/backend/tts/personas"),
          fetch("/api/backend/tts/indigenous/phrasebook")
        ]);

        if (resPersonas.ok) {
          const pData = await resPersonas.json();
          setPersonas(pData.personas || {});
        }

        if (resPhrases.ok) {
          const phData = await resPhrases.json();
          setPhrases(phData.phrases || []);
        }
      } catch (err) {
        console.error("Failed to load voice lab data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch Tonal Analysis when word changes
  useEffect(() => {
    async function analyzeTone() {
      try {
        const res = await fetch(`/api/backend/tts/indigenous/tonal-analysis?text=${encodeURIComponent(tonalWord)}`);
        if (res.ok) {
          const data = await res.json();
          setTonalAnalysis(data.analysis || []);
        }
      } catch {
        // Fallback
      }
    }
    analyzeTone();
  }, [tonalWord]);

  // Audio Playback Handler
  const playAudio = (text: string, personaKey: string, lang: string = "english") => {
    triggerTmaHaptic("light");
    sfx.tap();

    const cleanPersona = personaKey.toLowerCase();
    const encodedText = encodeURIComponent(text);
    const audioUrl = `/api/backend/tts/audio?text=${encodedText}&persona=${cleanPersona}&language=${encodeURIComponent(lang.toLowerCase())}`;
    
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(e => console.log("Audio playback error:", e));
      setCurrentAudioUrl(audioUrl);
      setIsPlayingCustom(true);
    }
  };

  // Filter Personas
  const filteredPersonas = Object.values(personas).filter(p => {
    if (selectedLanguage === "all") return true;
    if (selectedLanguage === "yoruba") return p.language.toLowerCase().includes("yorùbá") || p.language.toLowerCase().includes("yoruba");
    if (selectedLanguage === "igbo") return p.language.toLowerCase().includes("igbo");
    if (selectedLanguage === "hausa") return p.language.toLowerCase().includes("hausa");
    if (selectedLanguage === "warri") return p.language.toLowerCase().includes("warri") || p.language.toLowerCase().includes("edo") || p.language.toLowerCase().includes("delta") || p.language.toLowerCase().includes("benin") || p.id.includes("warri") || p.id.includes("edo");
    if (selectedLanguage === "english") return p.language.toLowerCase().includes("english") || p.language.toLowerCase().includes("pidgin");
    return true;
  });

  // Filter Phrases
  const filteredPhrases = phrases.filter(ph => {
    const lang = ph.language.toLowerCase();
    const langMatch = selectedLanguage === "all" || 
      (selectedLanguage === "warri" && (lang.includes("warri") || lang.includes("edo") || lang.includes("delta") || lang.includes("benin"))) ||
      (selectedLanguage === "english" && (lang.includes("english") || (lang.includes("pidgin") && !lang.includes("warri") && !lang.includes("edo")))) ||
      (selectedLanguage === "yoruba" && (lang.includes("yorùbá") || lang.includes("yoruba"))) ||
      (selectedLanguage === "igbo" && lang.includes("igbo")) ||
      (selectedLanguage === "hausa" && lang.includes("hausa"));
    const catMatch = activeCategory === "all" || ph.category.toLowerCase().includes(activeCategory.toLowerCase());
    return langMatch && catMatch;
  });

  const languageTabs = [
    { id: "all", label: "🌍 All Voices", flag: "🇳🇬" },
    { id: "yoruba", label: "Yorùbá", flag: "🟢" },
    { id: "igbo", label: "Igbo", flag: "🔴" },
    { id: "hausa", label: "Hausa", flag: "🟡" },
    { id: "warri", label: "Warri & Edo Pidgin", flag: "⚓" },
    { id: "english", label: "Naija English & Pidgin", flag: "✨" },
  ];

  const tonePresets = [
    { word: "ọkọ", label: "ọkọ (Husband)", desc: "Mid - Mid (Re - Re)" },
    { word: "ọkọ̀", label: "ọkọ̀ (Vehicle / Canoe)", desc: "Mid - Low (Re - Dò)" },
    { word: "ọ̀kọ́", label: "ọ̀kọ́ (Farming Hoe)", desc: "Low - High (Dò - Mí)" },
    { word: "ọ̀kọ̀", label: "ọ̀kọ̀ (War Spear)", desc: "Low - Low (Dò - Dò)" },
    { word: "àkwà", label: "àkwà (Bed / Bridge)", desc: "Low - Low (Ụ́daala)" },
    { word: "ákwà", label: "ákwà (Cloth)", desc: "High - Low (Ụ́daelu)" },
    { word: "àkwá", label: "àkwá (Egg)", desc: "Low - High" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlayingCustom(false)} 
        onError={() => setIsPlayingCustom(false)} 
      />

      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <BackButton fallbackHref="/student" label="Back to Cockpit" />
        </div>
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-amber-950/40 border border-emerald-500/20 p-6 md:p-10 backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                Sovereign Indigenous Voice & Acoustic Lab
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Authentic Nigerian <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Voices & Tonal AI</span>
              </h1>
              <p className="text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed">
                Experience high-fidelity indigenous speech calibrated to typical native speakers across 
                <strong className="text-emerald-300"> Yorùbá</strong>, 
                <strong className="text-red-300"> Igbo</strong>, 
                <strong className="text-amber-300"> Hausa</strong>, 
                <strong className="text-orange-300"> Warri / Edo Pidgin</strong>, and 
                <strong className="text-cyan-300"> West African English</strong>. Zero robotic accent flattening—preserving true lexical tones, syllable timing, and cultural warmth.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex md:flex-col gap-3 shrink-0">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-emerald-400">11</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Native Personas</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-amber-400">100%</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Tonal Diacritics</div>
              </div>
            </div>
          </div>
        </div>

        {/* Language Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {languageTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedLanguage(tab.id);
                triggerTmaHaptic("light");
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedLanguage === tab.id
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span>{tab.flag}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* AI DIACRITIC & TONE RESTORER PLAYGROUND */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30 p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Automatic Diacritic Restoration (ADR) & Prosody Engine
              </div>
              <h2 className="text-xl md:text-3xl font-black text-white tracking-tight">
                AI Diacritic & Tone Restoration <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Playground</span>
              </h2>
              <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Global AI models fail on Nigerian languages due to missing diacritics and tonal blindness. 
                Type unaccented text below; our sovereign ADR engine contextually infers tone marks (ẹ, ọ, ṣ, à, á, ị, ọ, ụ, ṅ, ɓ, ɗ, ƙ), 
                calculates Do-Re-Mi frequencies, and injects authentic Warri / Edo regional prosody.
              </p>
            </div>

            {/* Quick Test Presets */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() => {
                  setAdrInputText("E kaaro bawo ni o, gbogbo ile?");
                  setAdrLanguage("yoruba");
                  setAdrPersona("baba_agba");
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all"
              >
                🟢 Yorùbá Test
              </button>
              <button
                onClick={() => {
                  setAdrInputText("Kedu ka i mere taa, nnoo nwa m?");
                  setAdrLanguage("igbo");
                  setAdrPersona("nna_anyi");
                }}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold transition-all"
              >
                🔴 Igbo Test
              </button>
              <button
                onClick={() => {
                  setAdrInputText("Ina kwana sannu da zuwa babban malami");
                  setAdrLanguage("hausa");
                  setAdrPersona("malam_danladi");
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all"
              >
                🟡 Hausa Test
              </button>
              <button
                onClick={() => {
                  setAdrInputText("Warri no dey carry last, wetin dey sup my area broda!");
                  setAdrLanguage("warri_pidgin");
                  setAdrPersona("warri_bros_oghene");
                }}
                className="px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold transition-all"
              >
                ⚓ Warri Test
              </button>
              <button
                onClick={() => {
                  setAdrInputText("Koyo o, oba gha to kpere ise!");
                  setAdrLanguage("edo_pidgin");
                  setAdrPersona("edo_queen_esosa");
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all"
              >
                👑 Edo Test
              </button>
            </div>
          </div>

          {/* Interactive Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={adrInputText}
                  onChange={(e) => setAdrInputText(e.target.value)}
                  placeholder="Type unaccented text (e.g. 'E kaaro bawo ni' or 'Warri no dey carry last')..."
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRestoreDiacritics();
                  }}
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={adrLanguage}
                  onChange={(e) => {
                    setAdrLanguage(e.target.value);
                    if (e.target.value === "yoruba") setAdrPersona("baba_agba");
                    else if (e.target.value === "igbo") setAdrPersona("nna_anyi");
                    else if (e.target.value === "hausa") setAdrPersona("malam_danladi");
                    else if (e.target.value === "warri_pidgin") setAdrPersona("warri_bros_oghene");
                    else if (e.target.value === "edo_pidgin") setAdrPersona("edo_queen_esosa");
                  }}
                  className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="yoruba">Yorùbá</option>
                  <option value="igbo">Igbo</option>
                  <option value="hausa">Hausa</option>
                  <option value="warri_pidgin">Warri / Delta Pidgin</option>
                  <option value="edo_pidgin">Edo / Benin Pidgin</option>
                </select>

                <button
                  onClick={handleRestoreDiacritics}
                  disabled={isRestoringAdr}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 disabled:opacity-50"
                >
                  {isRestoringAdr ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Restore Diacritics
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Display */}
            {adrResult && (
              <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-5 md:p-6 space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Canonical Diacritic Restoration Result
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-emerald-300 font-mono tracking-wide">
                      {adrResult.restored_text}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playAudio(adrResult.restored_text, adrPersona, adrResult.language)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 hover:scale-105 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      Listen Native Voice
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* IPA & Respell */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Phonetic IPA & Respell
                    </span>
                    <div className="text-xs font-mono text-cyan-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      {adrResult.phonetic_ipa}
                    </div>
                    {adrResult.phonetic_respelling && (
                      <div className="text-[11px] text-slate-300 italic">
                        Pronounced: <span className="font-semibold text-white">"{adrResult.phonetic_respelling}"</span>
                      </div>
                    )}
                  </div>

                  {/* Prosody & Inflection */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Acoustic & Prosody Blueprint
                    </span>
                    <p className="text-xs text-amber-300 font-medium leading-relaxed">
                      ⚡ {adrResult.prosody_notes}
                    </p>
                  </div>

                  {/* Contextual Translation */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Curriculum Gloss / Meaning
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      💡 {adrResult.contextual_gloss}
                    </p>
                  </div>
                </div>

                {/* Do-Re-Mi Tonal Solfège Sequence */}
                {adrResult.tonal_analysis && adrResult.tonal_analysis.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-amber-400" />
                        Tonal Pitch Sequence (Do - Re - Mi Syllable Heights)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {adrResult.tonal_analysis.length} Syllables Calibrated
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {adrResult.tonal_analysis.map((syl: any, sIdx: number) => {
                        const isHigh = syl.tone === "HIGH";
                        const isLow = syl.tone === "LOW";
                        return (
                          <div
                            key={sIdx}
                            className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-mono font-bold ${
                              isHigh
                                ? "bg-red-500/15 border-red-500/40 text-red-300"
                                : isLow
                                ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
                                : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                            }`}
                          >
                            <span className="text-sm font-black text-white">{syl.char}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/80">
                              {syl.solfege || syl.tone}
                            </span>
                            <span className="text-[9px] text-slate-400">{syl.freq_ratio}x</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 1. NATIVE VOICE PERSONA CARDS (Bento Grid) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Verified Indigenous Voice Personas
            </h2>
            <span className="text-xs text-slate-400">Click any persona to listen to their signature greeting</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPersonas.map((persona) => {
              const isSelected = selectedPersona === persona.id;
              return (
                <div
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona.id)}
                  className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500"
                      : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-lg text-white">{persona.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            persona.language.toLowerCase().includes("yoruba") || persona.language.toLowerCase().includes("yorùbá") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                            persona.language.toLowerCase().includes("igbo") ? "bg-red-500/10 text-red-400 border border-red-500/30" :
                            persona.language.toLowerCase().includes("hausa") ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                            persona.language.toLowerCase().includes("warri") || persona.language.toLowerCase().includes("delta") ? "bg-orange-500/10 text-orange-400 border border-orange-500/30" :
                            persona.language.toLowerCase().includes("edo") || persona.language.toLowerCase().includes("benin") ? "bg-purple-500/10 text-purple-400 border border-purple-500/30" :
                            "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                          }`}>
                            {persona.language}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-300 mt-0.5">{persona.title}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(persona.signature_greeting || persona.name, persona.id, persona.language);
                        }}
                        className="w-10 h-10 rounded-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 transition-all flex items-center justify-center shrink-0 border border-emerald-500/30"
                        title="Listen to Signature Greeting"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {persona.description}
                    </p>

                    {persona.accent && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Compass className="w-3.5 h-3.5 text-slate-500" />
                        <span>Dialect: <strong className="text-slate-300">{persona.accent}</strong></span>
                      </div>
                    )}
                  </div>

                  {persona.signature_greeting && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 italic truncate max-w-[80%]">
                        "{persona.signature_greeting}"
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider shrink-0">
                        Audition
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. DO-RE-MI TONAL PITCH VISUALIZER */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Music className="w-4 h-4" />
                The Lexical Tone Engine
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white">
                Yorùbá & Igbo Tonal Pitch Analyzer (Do - Re - Mi)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Notice how the pitch curve changes meaning completely across minimal word pairs.
              </p>
            </div>

            {/* Quick Word Presets */}
            <div className="flex flex-wrap gap-2">
              {tonePresets.map((tp) => (
                <button
                  key={tp.word}
                  onClick={() => setTonalWord(tp.word)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    tonalWord === tp.word
                      ? "bg-amber-400 text-slate-950 border-amber-400"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {tp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Visualizer Canvas */}
          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl md:text-4xl font-black tracking-wider text-emerald-300 font-mono">
                  {tonalWord}
                </span>
                <button
                  onClick={() => playAudio(tonalWord, selectedPersona, "yoruba")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  Pronounce
                </button>
              </div>

              <span className="text-xs text-slate-400">
                Fundamental Frequency ($F_0$) Waveform
              </span>
            </div>

            {/* Tonal Bars Waveform Visualizer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {tonalAnalysis.flatMap((item: any) => item.syllables || []).map((syl: any, sIdx: number) => {
                const isHigh = syl.tone === "HIGH";
                const isLow = syl.tone === "LOW";
                return (
                  <div 
                    key={sIdx}
                    className={`rounded-xl p-4 border flex flex-col justify-between h-32 transition-all ${
                      isHigh ? "bg-red-500/10 border-red-500/30 text-red-300" :
                      isLow ? "bg-blue-500/10 border-blue-500/30 text-blue-300" :
                      "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xl font-bold font-mono">{syl.char}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-900">
                        {syl.solfege || syl.tone}
                      </span>
                    </div>

                    {/* Animated Tone Height Bar */}
                    <div className="space-y-1">
                      <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHigh ? "bg-red-400 w-full" :
                            isLow ? "bg-blue-400 w-1/3" :
                            "bg-emerald-400 w-2/3"
                          }`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Pitch Factor</span>
                        <span>{syl.freq_ratio}x</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2B. INTERACTIVE DO-RE-MI MICROPHONE PITCH GRADER */}
        <IndigenousToneGrader
          phraseText={tonalWord}
          language={selectedLanguage === "all" ? "Yorùbá" : selectedLanguage}
          expectedTones={tonalAnalysis.map(a => a.tone)}
          phoneticIPA={tonalAnalysis.map(a => a.char).join("")}
        />

        {/* 3. PROVERBS & CULTURAL PHRASEBOOK (Golden Vault) */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                The Golden Vault: Proverbs & Phonics Phrasebook
              </h2>
              <p className="text-xs text-slate-400">Master-crafted indigenous phrases with 100% native acoustic recordings</p>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {["all", "greetings", "proverbs", "affirmations", "phonics"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    activeCategory === cat
                      ? "bg-slate-200 text-slate-950 font-black"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPhrases.map((phrase) => (
              <div 
                key={phrase.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase tracking-wider">
                      {phrase.category}
                    </span>
                    <h4 className="text-lg font-black text-white">{phrase.text_indigenous}</h4>
                  </div>

                  <button
                    onClick={() => playAudio(phrase.text_indigenous, phrase.persona_id, phrase.language)}
                    className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center hover:scale-105 transition-all shadow-md shadow-emerald-500/20 shrink-0"
                    title="Play Native Pronunciation"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                  </button>
                </div>

                <div className="text-xs font-mono text-emerald-400/90 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  {phrase.phonetic_ipa}
                </div>

                <p className="text-xs text-slate-300">
                  <strong className="text-slate-100">Translation:</strong> {phrase.english_translation}
                </p>

                {phrase.cultural_context && (
                  <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/60">
                    💡 {phrase.cultural_context}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. LIVE SPEECH SYNTHESIS STUDIO */}
        <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Live Speech Synthesis Studio
            </h2>
            <p className="text-xs text-slate-400">
              Type or paste any text in Yorùbá, Igbo, Hausa, Pidgin, or English to hear it synthesized instantly.
            </p>
          </div>

          <div className="space-y-4">
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter indigenous or Nigerian English text with or without diacritics..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium text-sm leading-relaxed"
            />

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                  <span className="text-xs text-slate-400">Persona:</span>
                  <select
                    value={selectedPersona}
                    onChange={(e) => setSelectedPersona(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    {Object.values(personas).map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                        {p.name} ({p.language})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                  <span className="text-xs text-slate-400">Cadence:</span>
                  <select
                    value={customSpeed}
                    onChange={(e) => setCustomSpeed(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="slow" className="bg-slate-900 text-white">Paced (Elder)</option>
                    <option value="normal" className="bg-slate-900 text-white">Normal</option>
                    <option value="brisk" className="bg-slate-900 text-white">Brisk (Youth)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const chosen = personas[selectedPersona];
                    playAudio(customText, selectedPersona, chosen ? chosen.language : "english");
                  }}
                  className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  Speak with Native Tone
                </button>

                {currentAudioUrl && (
                  <a
                    href={currentAudioUrl}
                    download="indigenous_speech.wav"
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all flex items-center justify-center"
                    title="Download Audio Clip"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Eye, Play, Pause, RotateCcw, Volume2, 
  CheckCircle2, ArrowRight, ChevronLeft, ChevronRight,
  Sparkles, Award, Bookmark, Settings, Sliders, Type, Check,
  Languages, Headphones, VolumeX, Flame, Zap
} from "lucide-react";
import confetti from "canvas-confetti";
import { sfx } from "../lib/audio";
import { paperAudio } from "../lib/paperAudio";
import { triggerTmaHaptic } from "../lib/telegram";

interface BookMeta {
  id: string;
  title: string;
  author: string;
  category: string;
  prescribed_for: string;
  grade_levels: string[];
  cover_emoji: string;
  description: string;
  total_chapters: number;
}

interface ChapterData {
  book_id: string;
  book_title: string;
  author: string;
  chapter_number: number;
  title: string;
  raw_text: string;
  bionic_html: string;
  bionic_enabled: boolean;
  word_count: number;
  estimated_read_time_mins: number;
  themes: string[];
  theatrical_prologues: {
    english: string;
    pidgin: string;
    yoruba: string;
    igbo: string;
    hausa: string;
  };
  page_1: {
    raw: string;
    bionic: string;
  };
  page_2: {
    raw: string;
    bionic: string;
  };
  indigenous_translations: {
    pidgin?: string;
    yoruba?: string;
    igbo?: string;
    hausa?: string;
  };
  comprehension_questions: Array<{
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  }>;
}

export default function BionicReader({ userTier = "SSS" }: { userTier?: string }) {
  const [books, setBooks] = useState<BookMeta[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>("things-fall-apart");
  const [currentChapterNum, setCurrentChapterNum] = useState<number>(1);
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 3D Flip Page State
  const [activePage, setActivePage] = useState<1 | 2>(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");

  // Language / Translation Tab State
  const [textLanguage, setTextLanguage] = useState<"english" | "pidgin" | "yoruba" | "igbo" | "hausa">("english");

  // Reader Customization State
  const [bionicEnabled, setBionicEnabled] = useState(true);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("lg");
  const [fontFamily, setFontFamily] = useState<"sans" | "serif">("serif");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Audio TTS & Karaoke State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState<0.85 | 1.0 | 1.15>(1.0);
  const [selectedNarrator, setSelectedNarrator] = useState<string>("wazobia_broda");
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);
  const [currentSpeechPhase, setCurrentSpeechPhase] = useState<"idle" | "prologue" | "body">("idle");
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const karaokeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Comprehension Assessment State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Live Reading Pace HUD
  const [readingPaceWpm, setReadingPaceWpm] = useState<number>(145);
  const [bookmarked, setBookmarked] = useState(false);

  // User state
  const [userKey, setUserKey] = useState("EDU-DEMO-SCHOLAR");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("edunaija_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.registration_key) setUserKey(parsed.registration_key);
        } catch {}
      }
    }
  }, []);

  // 1. Fetch available prescribed books
  useEffect(() => {
    fetch(`/api/backend/api/literature/books?tier=${userTier}`)
      .then(r => r.json())
      .then(d => {
        if (d.books && d.books.length > 0) {
          setBooks(d.books);
          // Set initial book matching tier if current not in tier
          if (!d.books.some((b: BookMeta) => b.id === selectedBookId)) {
            setSelectedBookId(d.books[0].id);
          }
        }
      })
      .catch(() => {});
  }, [userTier]);

  // 2. Fetch chapter content when book or chapter changes
  useEffect(() => {
    if (!selectedBookId) return;
    setIsLoading(true);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setActivePage(1);
    setBookmarked(false);

    // Stop ongoing audio when switching chapters
    stopAudio();

    fetch(`/api/backend/api/literature/chapter/${selectedBookId}/${currentChapterNum}?bionic=${bionicEnabled}`)
      .then(r => r.json())
      .then(data => {
        setChapterData(data);
        setIsLoading(false);

        // Record reading progress in SQLite
        fetch("/api/backend/api/literature/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_key: userKey,
            book_id: selectedBookId,
            book_title: data.book_title,
            current_chapter: currentChapterNum,
            scroll_progress_pct: 10.0,
            bionic_mode_enabled: bionicEnabled ? 1 : 0
          })
        }).catch(() => {});
      })
      .catch(() => setIsLoading(false));
  }, [selectedBookId, currentChapterNum, bionicEnabled, userKey]);

  // Handle Page Turn with 3D Flip & Acoustic Paper Rustle
  const handleTurnPage = (targetPage: 1 | 2) => {
    if (targetPage === activePage || isFlipping) return;
    
    // Play realistic paper rustle sound
    paperAudio.playPageTurn(speechRate > 1 ? "brisk" : "normal");
    sfx.tap();
    triggerTmaHaptic("medium");

    setFlipDirection(targetPage > activePage ? "next" : "prev");
    setIsFlipping(true);

    setTimeout(() => {
      setActivePage(targetPage);
      setIsFlipping(false);
    }, 450);
  };

  // Stop Audio and clear karaoke timer
  const stopAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    if (karaokeIntervalRef.current) {
      clearInterval(karaokeIntervalRef.current);
    }
    setIsPlayingAudio(false);
    setCurrentSpeechPhase("idle");
    setActiveSentenceIndex(0);
  };

  // Determine language mapping from narrator
  const getNarratorLanguage = (narrator: string): "english" | "pidgin" | "yoruba" | "igbo" | "hausa" => {
    if (narrator === "wazobia_broda") return "pidgin";
    if (narrator === "baba_agba" || narrator === "anti_bola_yoruba") return "yoruba";
    if (narrator === "nna_anyi" || narrator === "nneoma") return "igbo";
    if (narrator === "malam_danladi") return "hausa";
    return "english";
  };

  // Neural TTS Narration: Plays Prologue then Body with Karaoke
  const toggleTTS = () => {
    if (isPlayingAudio) {
      stopAudio();
      sfx.tap();
      return;
    }

    if (!chapterData) return;

    sfx.tap();
    triggerTmaHaptic("heavy");

    const lang = getNarratorLanguage(selectedNarrator);
    // 1. Get theatrical prologue introducing title and author
    const prologueText = chapterData.theatrical_prologues?.[lang] || 
      `Welcome to EduNaija Literature Theater. You are listening to ${chapterData.book_title}, written by ${chapterData.author}. ${chapterData.title}.`;

    // 2. Get body narration text matching selected language or English
    let bodyText = chapterData.page_1.raw;
    if (lang !== "english" && chapterData.indigenous_translations?.[lang]) {
      bodyText = chapterData.indigenous_translations[lang] || chapterData.page_1.raw;
    }

    // Build unified narration script: Prologue + Body
    const fullSpokenScript = `${prologueText} ... ${bodyText}`;
    const speedParam = speechRate < 1 ? "slow" : speechRate > 1 ? "brisk" : "normal";
    const audioUrl = `/api/backend/tts/audio?text=${encodeURIComponent(fullSpokenScript)}&persona=${selectedNarrator}&speed=${speedParam}&language=${lang}`;

    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play().then(() => {
        setIsPlayingAudio(true);
        setCurrentSpeechPhase("prologue");

        // Start karaoke timer: move through sentences every 3.5 seconds
        if (karaokeIntervalRef.current) clearInterval(karaokeIntervalRef.current);
        let sIdx = 0;
        karaokeIntervalRef.current = setInterval(() => {
          sIdx = (sIdx + 1) % 6;
          setActiveSentenceIndex(sIdx);
          // After prologue finishes (~4-5 seconds), switch to body phase
          setCurrentSpeechPhase("body");
        }, 3600);
      }).catch(e => {
        console.warn("Audio autoplay blocked or failed:", e);
        // Fallback: browser speech synthesis if backend network latency occurs
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const utter = new SpeechSynthesisUtterance(fullSpokenScript);
          utter.rate = speechRate;
          window.speechSynthesis.speak(utter);
          setIsPlayingAudio(true);
        }
      });
    }
  };

  // Handle quiz question selection
  const handleOptionSelect = (qIdx: number, option: string) => {
    if (quizSubmitted) return;
    sfx.tap();
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  // Submit Comprehension Quiz
  const handleSubmitQuiz = () => {
    if (!chapterData?.comprehension_questions?.length) return;
    let correct = 0;
    chapterData.comprehension_questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) correct++;
    });

    setQuizScore(correct);
    setQuizSubmitted(true);
    const scorePct = Math.round((correct / chapterData.comprehension_questions.length) * 100);

    if (scorePct >= 70) {
      sfx.streakCelebration();
      triggerTmaHaptic("heavy");
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      // Award XP in points ledger
      fetch("/api/backend/api/points/transact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_key: userKey,
          amount: 50,
          transaction_type: "LITERATURE_COMPREHENSION",
          reason: `Mastered Comprehension for ${chapterData.book_title} (Ch. ${chapterData.chapter_number})`
        })
      }).catch(() => {});
    } else {
      sfx.wrong();
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    if (next) {
      paperAudio.playBookmarkChime();
      sfx.streakCelebration();
      triggerTmaHaptic("medium");
    } else {
      sfx.tap();
    }
  };

  const selectedBook = books.find(b => b.id === selectedBookId) || books[0];

  // Helper to split text into sentences for karaoke highlighting
  const renderKaraokeSentences = (rawText: string) => {
    const sentences = rawText.match(/[^.!?]+[.!?]+/g) || [rawText];
    return (
      <div className="space-y-3.5">
        {sentences.map((sentence, idx) => {
          const isHighlighted = isPlayingAudio && currentSpeechPhase === "body" && (idx === activeSentenceIndex % sentences.length);
          return (
            <motion.p
              key={idx}
              animate={{
                backgroundColor: isHighlighted ? "rgba(0, 230, 118, 0.12)" : "transparent",
                borderColor: isHighlighted ? "rgba(0, 230, 118, 0.4)" : "transparent"
              }}
              className={`p-2.5 rounded-2xl border transition-all duration-300 ${
                isHighlighted
                  ? "text-white font-semibold shadow-[0_0_20px_rgba(0,230,118,0.2)] scale-[1.01]"
                  : "text-zinc-200"
              }`}
            >
              {sentence.trim()}
            </motion.p>
          );
        })}
      </div>
    );
  };

  // Determine current active page text based on language tab
  const getPageText = (page: 1 | 2) => {
    if (!chapterData) return "";
    if (textLanguage === "english") {
      return page === 1 ? chapterData.page_1.raw : chapterData.page_2.raw;
    }
    const translation = chapterData.indigenous_translations?.[textLanguage];
    if (translation) {
      // Split translation roughly into 2 halves for the 2 pages
      const words = translation.split(" ");
      const mid = Math.ceil(words.length / 2);
      return page === 1 ? words.slice(0, mid).join(" ") : words.slice(mid).join(" ");
    }
    return page === 1 ? chapterData.page_1.raw : chapterData.page_2.raw;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 select-none">
      {/* Hidden Audio Element for Streaming */}
      <audio
        ref={audioPlayerRef}
        onEnded={() => {
          setIsPlayingAudio(false);
          setCurrentSpeechPhase("idle");
          if (karaokeIntervalRef.current) clearInterval(karaokeIntervalRef.current);
        }}
      />

      {/* 1. TOP BOOK SELECTOR CAROUSEL */}
      <div className="glass-card p-4 rounded-3xl border border-white/10 bg-black/40 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[#00E676]">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
              WAEC, NECO &amp; JAMB Prescribed African Literature
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#00E676] border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>3D Tactile Flipbook</span>
            </span>
          </div>
        </div>

        {/* Horizontal Book Pill Strip */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none py-1">
          {books.map(b => {
            const isSelected = b.id === selectedBookId;
            return (
              <button
                key={b.id}
                onClick={() => {
                  sfx.tap();
                  setSelectedBookId(b.id);
                  setCurrentChapterNum(1);
                  stopAudio();
                }}
                className={`px-3.5 py-2.5 rounded-2xl border text-left whitespace-nowrap shrink-0 transition-all flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-emerald-500/25 to-[#00E676]/20 border-[#00E676] shadow-[0_0_18px_rgba(0,230,118,0.25)] scale-[1.02]"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                <span className="text-2xl">{b.cover_emoji}</span>
                <div>
                  <div className={`text-xs font-bold ${isSelected ? "text-[#00E676]" : "text-white"}`}>
                    {b.title}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    {b.author} • {b.category}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. THEATRICAL PROLOGUE & VOICE INTRO BANNER */}
      {chapterData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent border border-amber-500/25 flex flex-wrap items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Headphones className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                <span>🎭 EduNaija Literature Theater (Theatrical Edition)</span>
                {isPlayingAudio && currentSpeechPhase === "prologue" && (
                  <span className="bg-amber-400 text-black text-[9px] px-1.5 py-0.2 rounded-full font-bold animate-bounce">
                    SPEAKING PROLOGUE
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-300 mt-0.5 italic">
                "{chapterData.theatrical_prologues?.[getNarratorLanguage(selectedNarrator)] || chapterData.theatrical_prologues?.english}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTTS}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-2 cursor-pointer transition-all ${
                isPlayingAudio
                  ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              }`}
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlayingAudio ? "Pause Narrator" : "Listen With Prologue"}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* 3. 3D TACTILE BOOK STAGE */}
      <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-[#0E1118] to-[#08090D] shadow-2xl overflow-hidden">
        {/* Ambient Mood Lighting Backlight */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_20%,rgba(0,230,118,0.12),transparent_70%)]" />

        {/* Top Control Bar: Language Tabs, Bionic Toggle, Narrator Persona */}
        <div className="relative z-10 px-5 py-3.5 border-b border-white/10 bg-black/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          {/* Language Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 overflow-x-auto scrollbar-none">
            <button
              onClick={() => { sfx.tap(); setTextLanguage("english"); }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                textLanguage === "english" ? "bg-emerald-500 text-black shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              🇬🇧 English (Original)
            </button>
            <button
              onClick={() => { sfx.tap(); setTextLanguage("pidgin"); setSelectedNarrator("wazobia_broda"); }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                textLanguage === "pidgin" ? "bg-amber-500 text-black shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              🇳🇬 Naija Pidgin
            </button>
            <button
              onClick={() => { sfx.tap(); setTextLanguage("yoruba"); setSelectedNarrator("baba_agba"); }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                textLanguage === "yoruba" ? "bg-emerald-500 text-black shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              🇳🇬 Yorùbá
            </button>
            <button
              onClick={() => { sfx.tap(); setTextLanguage("igbo"); setSelectedNarrator("nna_anyi"); }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                textLanguage === "igbo" ? "bg-emerald-500 text-black shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              🇳🇬 Igbo
            </button>
            <button
              onClick={() => { sfx.tap(); setTextLanguage("hausa"); setSelectedNarrator("malam_danladi"); }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                textLanguage === "hausa" ? "bg-emerald-500 text-black shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              🇳🇬 Hausa
            </button>
          </div>

          {/* Right Action Tools: Voice Selector, Bionic Switch, Font Settings */}
          <div className="flex items-center gap-2">
            {/* Voice Narrator Dropdown */}
            <div className="flex items-center gap-1.5 bg-black/60 border border-white/15 rounded-xl px-2.5 py-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                value={selectedNarrator}
                onChange={(e) => {
                  sfx.tap();
                  setSelectedNarrator(e.target.value);
                  const newLang = getNarratorLanguage(e.target.value);
                  setTextLanguage(newLang);
                  stopAudio();
                }}
                className="bg-transparent text-xs font-bold text-zinc-200 focus:outline-none cursor-pointer max-w-[155px]"
                title="Select Native Narrator"
              >
                <option value="uncle_emeka" className="bg-slate-900 text-white">🎙️ Uncle Emeka (English)</option>
                <option value="auntie_bola" className="bg-slate-900 text-white">🌸 Auntie Bola (English)</option>
                <option value="wazobia_broda" className="bg-slate-900 text-white">🔥 Broda Wazobia (Pidgin)</option>
                <option value="baba_agba" className="bg-slate-900 text-white">👴🏾 Bàbá Àgbà (Yorùbá)</option>
                <option value="nna_anyi" className="bg-slate-900 text-white">🧔🏾 Nna Anyị (Igbo)</option>
                <option value="malam_danladi" className="bg-slate-900 text-white">👳🏾 Malam Danladi (Hausa)</option>
              </select>
            </div>

            {/* Saccadic Bionic Reading Toggle */}
            <button
              onClick={() => {
                sfx.tap();
                setBionicEnabled(!bionicEnabled);
              }}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                bionicEnabled
                  ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(0,230,118,0.4)]"
                  : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
              }`}
              title="Toggle Bionic Saccadic Anchors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bionic:</span> {bionicEnabled ? "ON" : "OFF"}
            </button>

            {/* Typography Popover */}
            <div className="relative">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Typography & Styling"
              >
                <Type className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-64 p-3.5 bg-black/95 border border-white/15 rounded-2xl shadow-2xl z-30 space-y-3"
                  >
                    <div>
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                        Font Size
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {(["sm", "base", "lg", "xl"] as const).map(sz => (
                          <button
                            key={sz}
                            onClick={() => setFontSize(sz)}
                            className={`py-1 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer ${
                              fontSize === sz ? "bg-emerald-500 text-black" : "bg-white/5 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                        Typography Style
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setFontFamily("sans")}
                          className={`py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                            fontFamily === "sans" ? "bg-emerald-500 text-black" : "bg-white/5 text-zinc-400"
                          }`}
                        >
                          Modern Sans
                        </button>
                        <button
                          onClick={() => setFontFamily("serif")}
                          className={`py-1.5 rounded-lg text-xs font-serif font-bold cursor-pointer ${
                            fontFamily === "serif" ? "bg-emerald-500 text-black" : "bg-white/5 text-zinc-400"
                          }`}
                        >
                          Classic Serif
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 3D BOOK SPREAD CANVAS */}
        <div className="relative min-h-[480px] p-6 md:p-12 flex flex-col justify-between">
          {/* Tactile Dog-Ear Interactive Bookmark Corner */}
          <div
            onClick={handleToggleBookmark}
            title={bookmarked ? "Bookmarked! Tap to remove" : "Tap dog-ear corner to bookmark page"}
            className="absolute top-0 right-0 w-12 h-12 cursor-pointer z-20 group"
          >
            <div className={`w-0 h-0 border-solid border-t-0 border-r-[44px] border-b-[44px] border-l-0 transition-transform duration-200 group-hover:scale-110 ${
              bookmarked
                ? "border-r-emerald-500 border-b-transparent shadow-[0_0_15px_rgba(0,230,118,0.5)]"
                : "border-r-white/20 border-b-transparent"
            }`} />
            <Bookmark className={`w-3.5 h-3.5 absolute top-1.5 right-1.5 transition-colors ${
              bookmarked ? "text-black" : "text-zinc-400"
            }`} />
          </div>

          {isLoading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-xs font-mono text-zinc-400">Loading Prescribed Text...</div>
            </div>
          ) : chapterData ? (
            <div className="space-y-6">
              {/* Chapter Header */}
              <div className="space-y-2 border-b border-white/10 pb-5 text-center relative">
                <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 font-bold uppercase tracking-wider">
                  {chapterData.book_title} • Chapter {chapterData.chapter_number}
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-2">
                  {chapterData.title}
                </h1>
                <p className="text-xs text-zinc-400 font-medium">By {chapterData.author}</p>
              </div>

              {/* 3D Flipping Page Sheet */}
              <div style={{ perspective: "1800px" }} className="relative min-h-[260px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activePage}-${textLanguage}`}
                    initial={{
                      rotateY: flipDirection === "next" ? 70 : -70,
                      opacity: 0,
                      scale: 0.96
                    }}
                    animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                    exit={{
                      rotateY: flipDirection === "next" ? -70 : 70,
                      opacity: 0,
                      scale: 0.96
                    }}
                    transition={{ duration: 0.42, ease: [0.25, 1, 0.5, 1] }}
                    className={`p-6 md:p-8 rounded-3xl bg-[#12151E]/90 border border-white/10 shadow-2xl relative overflow-hidden ${
                      fontFamily === "serif" ? "font-serif text-slate-100" : "font-sans"
                    } ${
                      fontSize === "sm" ? "text-sm leading-6" :
                      fontSize === "base" ? "text-base leading-7" :
                      fontSize === "lg" ? "text-lg leading-8" : "text-xl leading-9"
                    }`}
                  >
                    {/* Realistic Page Paper Sheen & Spine Shadow */}
                    <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
                    <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/30 to-transparent pointer-events-none" />

                    {/* Page Content: Karaoke-highlighted or Bionic HTML */}
                    {isPlayingAudio ? (
                      renderKaraokeSentences(getPageText(activePage))
                    ) : bionicEnabled && textLanguage === "english" ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: activePage === 1 ? chapterData.page_1.bionic : chapterData.page_2.bionic
                        }}
                        className="leading-relaxed"
                      />
                    ) : (
                      <p className="leading-relaxed text-zinc-200">
                        {getPageText(activePage)}
                      </p>
                    )}

                    {/* Bottom Page Folio Number */}
                    <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-500">
                      <span>{chapterData.book_title} — Page {activePage} of 2</span>
                      <span className="text-[#00E676] font-bold">
                        {textLanguage.toUpperCase()} EDITION
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Page Turning Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleTurnPage(1)}
                  disabled={activePage === 1}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold font-mono flex items-center gap-2 cursor-pointer transition-all ${
                    activePage === 1
                      ? "opacity-30 cursor-not-allowed bg-white/5 text-zinc-500"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Page (1)</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full transition-colors ${activePage === 1 ? "bg-[#00E676]" : "bg-white/20"}`} />
                  <span className={`w-2.5 h-2.5 rounded-full transition-colors ${activePage === 2 ? "bg-[#00E676]" : "bg-white/20"}`} />
                </div>

                <button
                  onClick={() => handleTurnPage(2)}
                  disabled={activePage === 2}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold font-mono flex items-center gap-2 cursor-pointer transition-all ${
                    activePage === 2
                      ? "opacity-30 cursor-not-allowed bg-white/5 text-zinc-500"
                      : "bg-[#00E676] text-black font-bold shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:scale-105"
                  }`}
                >
                  <span>Next Page (2)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* 4. COMPREHENSION QUIZ SECTION */}
        {chapterData && chapterData.comprehension_questions?.length > 0 && (
          <div className="p-6 md:p-8 bg-black/60 border-t border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Chapter Comprehension &amp; WAEC Drills
                </h3>
              </div>
              {quizSubmitted && (
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                  quizScore === chapterData.comprehension_questions.length
                    ? "bg-emerald-500/20 text-[#00E676] border border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                }`}>
                  Score: {quizScore} / {chapterData.comprehension_questions.length} Correct
                </span>
              )}
            </div>

            <div className="space-y-4">
              {chapterData.comprehension_questions.map((q, idx) => {
                const isAnswered = selectedAnswers[idx] !== undefined;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <p className="text-xs md:text-sm font-bold text-zinc-200">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options.map((opt) => {
                        const isSelected = selectedAnswers[idx] === opt;
                        const isCorrect = opt === q.answer;
                        let btnStyle = "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10";
                        if (quizSubmitted) {
                          if (isCorrect) btnStyle = "bg-emerald-500/20 border-emerald-500 text-[#00E676] font-bold";
                          else if (isSelected) btnStyle = "bg-red-500/20 border-red-500 text-red-300";
                        } else if (isSelected) {
                          btnStyle = "bg-emerald-500/20 border-[#00E676] text-white font-bold";
                        }

                        return (
                          <button
                            key={opt}
                            disabled={quizSubmitted}
                            onClick={() => handleOptionSelect(idx, opt)}
                            className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {!quizSubmitted && (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length < chapterData.comprehension_questions.length}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Submit Comprehension Answers &amp; Claim 50 XP
              </button>
            )}
          </div>
        )}
      </div>

      {/* 5. FLOATING 2026 AUDIO DOCK */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4">
        <div className="p-3 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3">
          {/* Animated Equalizer Visualizer */}
          <div className="flex items-center gap-1.5 pl-2">
            {[40, 80, 100, 60, 90, 50, 75].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full bg-gradient-to-t from-emerald-500 to-[#00E676] transition-all duration-200 ${
                  isPlayingAudio ? "animate-pulse" : "h-1 opacity-30"
                }`}
                style={{
                  height: isPlayingAudio ? `${Math.max(12, h * (0.6 + Math.random() * 0.4))}%` : "4px"
                }}
              />
            ))}
            <div className="ml-2 hidden sm:block">
              <div className="text-[10px] font-mono font-bold text-white leading-tight">
                {selectedNarrator.replace("_", " ").toUpperCase()}
              </div>
              <div className="text-[9px] text-zinc-400 font-mono">
                {currentSpeechPhase === "prologue" ? "Speaking Intro..." : isPlayingAudio ? "Narrating..." : "Ready"}
              </div>
            </div>
          </div>

          {/* Central Play/Pause Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTTS}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all cursor-pointer ${
                isPlayingAudio
                  ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse"
                  : "bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.5)] hover:scale-105"
              }`}
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
          </div>

          {/* Speed Presets & WPM Pace */}
          <div className="flex items-center gap-1.5 pr-2">
            <div className="flex items-center p-0.5 bg-white/10 rounded-xl border border-white/10">
              {([0.85, 1.0, 1.15] as const).map(rate => (
                <button
                  key={rate}
                  onClick={() => {
                    sfx.tap();
                    setSpeechRate(rate);
                    stopAudio();
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold cursor-pointer ${
                    speechRate === rate ? "bg-emerald-500 text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Reading Pace WPM HUD */}
            <div className="hidden md:flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-1 rounded-xl border border-white/10">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{readingPaceWpm} WPM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

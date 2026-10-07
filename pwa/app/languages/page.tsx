"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Volume2, Play, Pause, Lock, Unlock, Sparkles, BookOpen, 
  ArrowRight, ShieldCheck, Check, Globe, Award, HelpCircle
} from "lucide-react";
import DynamicPaywallModal from "../../components/DynamicPaywallModal";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

interface BilingualLesson {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Mastery";
  isLocked: boolean;
  english_prompt: string;
  indigenous_text: string;
  phonetic_ipa: string;
  tone_contour: string;
  cultural_context: string;
  audio_text: string;
  persona_key: string;
}

const BILINGUAL_CURRICULUM: Record<string, {
  name: string;
  flag: string;
  tutor: string;
  desc: string;
  lessons: BilingualLesson[];
}> = {
  yoruba: {
    name: "Yorùbá & English",
    flag: "🟢",
    tutor: "Bàbá Àgbà & Auntie Bola",
    desc: "Master the 3 tones (Dò-Re-Mí), respectful honorifics (Ìkíni), and deep traditional proverbs (Òwe).",
    lessons: [
      {
        id: "yo-1",
        title: "Lesson 1: Morning & Elder Greetings (Ìkíni Àárọ̀)",
        level: "Beginner",
        isLocked: false,
        english_prompt: "Good morning, father! I hope you slept well with peace.",
        indigenous_text: "Ẹ kú àárọ̀ o, bàbá mi! Ṣé ẹ jí dáadáa?",
        phonetic_ipa: "/ɛ́ kú àːrɔ̀ o, bàbá mi! ʃé ɛ́ d͡ʒí dáːdáː/",
        tone_contour: "High - High - Low - Mid - Mid - Low - High - High - High - High - Mid",
        cultural_context: "In Yorùbá culture, greeting an elder requires honorific plural 'Ẹ' and prostrating (dobálẹ̀) or kneeling (ìkúnlẹ̀).",
        audio_text: "Ẹ kú àárọ̀ o, bàbá mi! Ṣé ẹ jí dáadáa?",
        persona_key: "baba_agba"
      },
      {
        id: "yo-2",
        title: "Lesson 2: Core Proverb & Character (Òwe Ìwà)",
        level: "Beginner",
        isLocked: false,
        english_prompt: "Good character begins at home before stepping out.",
        indigenous_text: "Ilé la ti ń kọ́ ẹ̀ṣọ́ ròde.",
        phonetic_ipa: "/ī.lé lā tī ń kɔ́ ɛ̀.ʃɔ́ rò.dē/",
        tone_contour: "Mid - High - Mid - Mid - High - Low - High - Low - Mid",
        cultural_context: "Emphasizes Omowáàbí virtues. True pride and moral upbringing are nurtured within the household.",
        audio_text: "Ilé la ti ń kọ́ ẹ̀ṣọ́ ròde.",
        persona_key: "baba_agba"
      },
      {
        id: "yo-3",
        title: "Lesson 3: Market Negotiation & Counting (Ètò Ọjà)",
        level: "Intermediate",
        isLocked: true,
        english_prompt: "How much is this basket of tomatoes? Please give me discount.",
        indigenous_text: "Èló ni agbọ̀n tòmáátì yìí? Ẹ dín owó rẹ̀ kù fún mi.",
        phonetic_ipa: "/è.ló nī ā.gbɔ̀̃ tò.máː.tì jìː? ɛ́ dĩ́ ō.wó rɛ̀ kù fṹ mī/",
        tone_contour: "Low - High - Mid - Mid - Low - Low - High - Low - High - High - High - Mid - High - Low - Low - High - Mid",
        cultural_context: "Lively market negotiation protocol where friendly banter and respect lead to favorable pricing.",
        audio_text: "Èló ni agbọ̀n tòmáátì yìí? Ẹ dín owó rẹ̀ kù fún mi.",
        persona_key: "auntie_bola"
      }
    ]
  },
  igbo: {
    name: "Igbo & English",
    flag: "🔴",
    tutor: "Nna Anyị & Nneoma",
    desc: "Explore vowel harmony (Nkwekọrịta Udaume), terrace downstep (Ụ̀dàmelí), and ancient proverbs (Ilu).",
    lessons: [
      {
        id: "ig-1",
        title: "Lesson 1: Courteous Morning Greetings (Ekene Ụtụtụ)",
        level: "Beginner",
        isLocked: false,
        english_prompt: "Good morning! How did you sleep through the night?",
        indigenous_text: "Ụtụtụ ọma! Kedu ka i si hie ụra?",
        phonetic_ipa: "/ʊ̀.tʊ́.tʊ́ ɔ̀.má! ké.du ka i si hie ʊ̀.rá/",
        tone_contour: "Low - High - High - Low - High - High - Mid - Low - Low - Mid",
        cultural_context: "Ekene is essential in Igbo social bonding; inquiring warmly after one's household establishes immediate trust.",
        audio_text: "Ụtụtụ ọma! Kedu ka i si hie ụra?",
        persona_key: "nna_anyi"
      },
      {
        id: "ig-2",
        title: "Lesson 2: Elder Proverb (Ilu Ụmụaka)",
        level: "Beginner",
        isLocked: false,
        english_prompt: "When a child washes their hands clean, they dine with respected elders.",
        indigenous_text: "Nwata kwochaa aka ya, ya na ndị okenye erie nri.",
        phonetic_ipa: "/nwa.ta kwo.tʃaː a.ka ja, ja na nɗi o.ke.nje e.ri.e nri/",
        tone_contour: "High - Low - High - Mid - Low - High - Low - High - Mid - High",
        cultural_context: "Signifies that merit, humility, and diligent character elevate youth into councils of wisdom.",
        audio_text: "Nwata kwochaa aka ya, ya na ndị okenye erie nri.",
        persona_key: "nna_anyi"
      },
      {
        id: "ig-3",
        title: "Lesson 3: Commerce & Numbers (Ọnụọgụgụ na Ahịa)",
        level: "Intermediate",
        isLocked: true,
        english_prompt: "How much is this yam? Reduce the price so I can buy two.",
        indigenous_text: "Ego ole ka ji a bụ? Belata ego ka m zụọ abụọ.",
        phonetic_ipa: "/e.go o.le ka d͡ʒi a bʊ̀? be.la.ta e.go ka m zʊ̀.ɔ a.bʊ̀.ɔ́/",
        tone_contour: "Mid - Mid - Low - High - High - Low - Low - Mid - Mid - Low - High - Low - Low - High",
        cultural_context: "Yam is celebrated as the king of crops; respectful negotiation in market trade honors the harvest.",
        audio_text: "Ego ole ka ji a bụ? Belata ego ka m zụọ abụọ.",
        persona_key: "nna_anyi"
      }
    ]
  },
  hausa: {
    name: "Hausa & English",
    flag: "🟡",
    tutor: "Malam Danladi & Gwaggo Hadiza",
    desc: "Master hooked consonants (ɓ, ɗ, ƙ), courteous greetings (Gaisuwan Hausa), and traditional tales (Tatsuniyoyi).",
    lessons: [
      {
        id: "ha-1",
        title: "Lesson 1: Respectful Greetings (Gaisuwa da Ladabi)",
        level: "Beginner",
        isLocked: false,
        english_prompt: "Good morning! How are you and your household today?",
        indigenous_text: "Ina kwana? Yaya kake da iyalinka yau?",
        phonetic_ipa: "/i.na kwa.na? ja.ja ka.ke da i.ja.liŋ.ka jau?/",
        tone_contour: "Mid - Mid - Low - High - Mid - Low - Mid - High - Mid - High",
        cultural_context: "Inquiring after family health and peace (*Lafiya*) is central to Hausa social etiquette.",
        audio_text: "Ina kwana? Yaya kake da iyalinka yau?",
        persona_key: "malam_danladi"
      },
      {
        id: "ha-2",
        title: "Lesson 2: Hausa Wisdom (Karin Magana)",
        level: "Beginner",
        isLocked: false,
        english_prompt: "Patience and perseverance conquer any hardship.",
        indigenous_text: "Haƙuri maganin zaman duniya.",
        phonetic_ipa: "/ha.ƙu.ri ma.ga.nin za.man du.ni.ja/",
        tone_contour: "High - Low - Low - Mid - Low - Mid - Mid - High - Mid",
        cultural_context: "Haƙuri (patience/fortitude) is celebrated as the bedrock of enduring prosperity and inner peace.",
        audio_text: "Haƙuri maganin zaman duniya.",
        persona_key: "malam_danladi"
      },
      {
        id: "ha-3",
        title: "Lesson 3: Market Bargaining (Ciniki a Kasuwa)",
        level: "Intermediate",
        isLocked: true,
        english_prompt: "How much is this measure of rice? I want three bags.",
        indigenous_text: "Nawa ne wannan mudun shinkafa? Ina son buhu uku.",
        phonetic_ipa: "/na.wa ne wan.nan mu.dun ʃiŋ.ka.fa? i.na son bu.hu u.ku/",
        tone_contour: "Low - High - Mid - High - Mid - High - Mid - High - Mid - Low",
        cultural_context: "Traditional mudu grain measurements in bustling northern markets.",
        audio_text: "Nawa ne wannan mudun shinkafa? Ina son buhu uku.",
        persona_key: "malam_danladi"
      }
    ]
  }
};

export default function LanguagesPage() {
  const [selectedLangKey, setSelectedLangKey] = useState<string>("yoruba");
  const [activeLesson, setActiveLesson] = useState<BilingualLesson>(BILINGUAL_CURRICULUM.yoruba.lessons[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentLang = BILINGUAL_CURRICULUM[selectedLangKey];

  const handleSelectLang = (key: string) => {
    sfx.tap();
    triggerTmaHaptic("light");
    setSelectedLangKey(key);
    setActiveLesson(BILINGUAL_CURRICULUM[key].lessons[0]);
  };

  const handleSelectLesson = (lesson: BilingualLesson) => {
    sfx.tap();
    triggerTmaHaptic("light");
    if (lesson.isLocked) {
      setIsPaywallOpen(true);
    } else {
      setActiveLesson(lesson);
    }
  };

  const playLessonAudio = () => {
    sfx.tap();
    triggerTmaHaptic("medium");
    const encoded = encodeURIComponent(activeLesson.audio_text);
    const audioUrl = `/api/backend/tts/audio?text=${encoded}&persona=${activeLesson.persona_key}&language=${selectedLangKey}`;
    
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto min-h-screen text-white font-sans space-y-6 pb-24">
      {/* Hidden audio tag */}
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlayingAudio(false)} 
        onError={() => setIsPlayingAudio(false)} 
      />

      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900/60 to-black/80 border border-amber-500/20 p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            NERDC Accredited Dual-Language Mastery Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
            Bilingual Indigenous Languages &amp; Speech Lab
          </h1>
          <p className="text-xs text-zinc-300 mt-0.5">
            Learn English paired with authentic <strong className="text-emerald-400">Yorùbá</strong>, <strong className="text-rose-400">Igbo</strong>, and <strong className="text-amber-400">Hausa</strong>. Precision lexical tones (Dò-Re-Mí) and cultural proverbs.
          </p>
        </div>

        <button
          onClick={() => { sfx.tap(); setIsPaywallOpen(true); }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          <span>Unlock Polyglot Pass (₦1,200/mo)</span>
        </button>
      </div>

      {/* Language Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Object.entries(BILINGUAL_CURRICULUM).map(([k, l]) => {
          const isSelected = selectedLangKey === k;
          return (
            <button
              key={k}
              onClick={() => handleSelectLang(k)}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isSelected
                  ? "bg-amber-500/20 border-amber-400 text-white shadow-md font-black"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Split Content: Active Lesson Card (Left 7 Cols) & Curriculum List (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Active Bilingual Flashcard & Tonal Explorer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-zinc-900/60 border border-white/10 p-6 space-y-5 shadow-xl relative overflow-hidden">
            {/* Top Tag */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                {activeLesson.level} &bull; Taught by {currentLang.tutor}
              </span>
              <button
                onClick={playLessonAudio}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPlayingAudio ? "Playing..." : "Hear Native Audio"}</span>
              </button>
            </div>

            {/* English Prompt */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                English Meaning:
              </span>
              <div className="text-base sm:text-lg font-medium text-zinc-200">
                "{activeLesson.english_prompt}"
              </div>
            </div>

            {/* Big Indigenous Text with Tonal Diacritics */}
            <div className="p-4 rounded-2xl bg-black/60 border border-amber-500/30 space-y-2">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <span>🇳🇬 {currentLang.name.split("&")[0].trim()} Orthography (With Tone Accents):</span>
              </span>
              <div className="text-xl sm:text-2xl font-display font-black text-white leading-relaxed">
                {activeLesson.indigenous_text}
              </div>
              <div className="text-xs font-mono text-amber-300/80 pt-1 border-t border-white/10">
                Phonetic IPA: <span className="text-zinc-300">{activeLesson.phonetic_ipa}</span>
              </div>
            </div>

            {/* Tone Contour Map (Do-Re-Mi) */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">
                Musical Lexical Tone Contour:
              </span>
              <div className="text-xs font-mono text-emerald-400">
                {activeLesson.tone_contour}
              </div>
            </div>

            {/* Cultural Context */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                Cultural Etiquette &amp; Context:
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {activeLesson.cultural_context}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Lesson Pathway (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
              {currentLang.name} Curriculum Units
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">
              {currentLang.lessons.filter(l => !l.isLocked).length} Free Previews
            </span>
          </div>

          <div className="space-y-2">
            {currentLang.lessons.map(lesson => {
              const isCurrent = activeLesson.id === lesson.id;
              return (
                <div
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isCurrent
                      ? "bg-amber-500/15 border-amber-400 text-white shadow-md"
                      : lesson.isLocked
                      ? "bg-white/[0.02] border-white/5 opacity-75 hover:opacity-100"
                      : "bg-zinc-900/60 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white line-clamp-1">{lesson.title}</span>
                      {lesson.isLocked && (
                        <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-black border border-amber-500/30">
                          PRO
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-400 line-clamp-1 font-mono">
                      {lesson.indigenous_text}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {lesson.isLocked ? (
                      <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Play className="w-3 h-3 fill-emerald-400" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Polyglot Pass Upsell Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/40 via-zinc-900 to-black border border-amber-500/30 space-y-2.5 shadow-xl mt-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">
                Mother Tongue Polyglot Pass
              </span>
              <span className="text-xs font-mono font-black text-amber-300">₦1,200/mo</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Unlock unlimited interactive Do-Re-Mi speech grading, market dialogue roleplays, and 50+ NERDC proverbs.
            </p>
            <button
              onClick={() => { sfx.tap(); setIsPaywallOpen(true); }}
              className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs transition-all shadow-md cursor-pointer"
            >
              Unlock All Lessons &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Paywall Modal */}
      <DynamicPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        currentTier="LANGUAGES"
      />
    </main>
  );
}

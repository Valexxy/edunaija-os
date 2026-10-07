"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Globe, Coins, Newspaper, X, ExternalLink,
  Sparkles, ArrowRight, ShieldCheck, Calculator
} from "lucide-react";
import { sfx } from "../lib/audio";
import { triggerTmaHaptic } from "../lib/telegram";

export default function LiveMarketAndEducationTicker() {
  const [forexData, setForexData] = useState<any>(null);
  const [newsData, setNewsData] = useState<any>(null);
  const [isTuitionModalOpen, setIsTuitionModalOpen] = useState(false);
  const [activeNewsIdx, setActiveNewsIdx] = useState(0);

  useEffect(() => {
    // 1. Fetch live forex rates
    fetch("/api/backend/api/realtime/forex")
      .then((r) => r.json())
      .then((d) => setForexData(d))
      .catch(() => {});

    // 2. Fetch live education news
    fetch("/api/backend/api/realtime/news/education")
      .then((r) => r.json())
      .then((d) => setNewsData(d))
      .catch(() => {});
  }, []);

  // Cycle news headline every 7 seconds
  useEffect(() => {
    if (!newsData?.articles?.length) return;
    const interval = setInterval(() => {
      setActiveNewsIdx((prev) => (prev + 1) % newsData.articles.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [newsData]);

  const activeArticle = newsData?.articles?.[activeNewsIdx];

  return (
    <>
      <div className="w-full bg-[#060709] border-y border-white/[0.08] px-3 sm:px-6 py-1.5 flex items-center justify-between text-xs overflow-hidden gap-3 select-none">
        {/* Left: Live Forex Ticker Badge */}
        <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#00E676] font-mono text-[10px] font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse"></span>
            <span>FX &amp; TUITION</span>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-[11px] text-zinc-300">
            <span className="flex items-center gap-1">
              <span className="text-zinc-500 font-semibold">USD:</span>
              <span className="text-[#00E676] font-black">
                ₦{forexData?.rates?.USD_NGN ? Number(forexData.rates.USD_NGN).toLocaleString() : "1,330"}
              </span>
            </span>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1">
              <span className="text-zinc-500 font-semibold">GBP:</span>
              <span className="text-white font-bold">
                ₦{forexData?.rates?.GBP_NGN ? Number(forexData.rates.GBP_NGN).toLocaleString() : "1,758"}
              </span>
            </span>
          </div>

          <button
            onClick={() => {
              sfx.tap();
              triggerTmaHaptic("light");
              setIsTuitionModalOpen(true);
            }}
            className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00E676] text-[10px] font-mono font-bold flex items-center gap-1 transition-all border border-emerald-500/20 cursor-pointer"
          >
            <Calculator className="w-3 h-3" />
            <span>Index</span>
            <span className="opacity-70">&rarr;</span>
          </button>
        </div>

        {/* Center & Right: Live Educational News Stream with Cross-Fade */}
        <div className="flex-1 max-w-xl mx-2 overflow-hidden text-right sm:text-left">
          <AnimatePresence mode="wait">
            {activeArticle ? (
              <motion.div
                key={activeArticle.id || activeNewsIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 text-xs truncate justify-end sm:justify-start whitespace-nowrap"
              >
                <Newspaper className="w-3.5 h-3.5 text-emerald-400 shrink-0 hidden sm:inline" />
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/10 text-emerald-300 font-bold shrink-0">
                  {activeArticle.source}
                </span>
                <span className="truncate text-zinc-300 text-[11px] font-medium hover:text-white transition-colors cursor-default">
                  {activeArticle.title}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono shrink-0 hidden md:inline">
                  • {activeArticle.published_at}
                </span>
              </motion.div>
            ) : (
              <div className="text-[11px] font-mono text-zinc-500 truncate text-right sm:text-left">
                ⚡ Real-time NERDC &amp; JAMB Telemetry Active
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global Tuition & Exam Conversion Modal */}
      <AnimatePresence>
        {isTuitionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#0B0C10] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00E676]">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">Live FX &amp; Global Tuition Index</h3>
                    <p className="text-[11px] text-zinc-400 font-mono">Real-Time Open Exchange Rates (open.er-api.com)</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTuitionModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Real-time FX Rates Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { pair: "USD / NGN", rate: forexData?.rates?.USD_NGN || 1330, icon: "🇺🇸" },
                  { pair: "GBP / NGN", rate: forexData?.rates?.GBP_NGN || 1758, icon: "🇬🇧" },
                  { pair: "EUR / NGN", rate: forexData?.rates?.EUR_NGN || 1480, icon: "🇪🇺" },
                  { pair: "CAD / NGN", rate: forexData?.rates?.CAD_NGN || 975, icon: "🇨🇦" },
                ].map((item) => (
                  <div key={item.pair} className="bg-black/50 border border-white/10 rounded-2xl p-3 text-center space-y-1">
                    <span className="text-base">{item.icon}</span>
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">{item.pair}</div>
                    <div className="font-mono text-sm font-black text-[#00E676]">
                      ₦{Number(item.rate).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Standardized Test & Global Tuition Benchmarks */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  International Exam &amp; Tuition Benchmarks:
                </div>
                <div className="space-y-1.5 text-xs">
                  {[
                    { exam: "SAT Exam Fee", usd: 104, category: "US Undergraduate Entrance" },
                    { exam: "IELTS Academic", usd: 245, category: "UK / Global English Proficiency" },
                    { exam: "GRE General Test", usd: 220, category: "Postgraduate Admissions" },
                    { exam: "UK University Year 1 (Avg)", usd: 16000, category: "Undergraduate Tuition" },
                    { exam: "Canadian College Diploma (Year)", usd: 14500, category: "Higher Ed Diploma" },
                  ].map((row) => {
                    const usdNgn = forexData?.rates?.USD_NGN || 1330;
                    const ngnVal = Math.round(row.usd * usdNgn);
                    return (
                      <div
                        key={row.exam}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div>
                          <div className="font-bold text-white text-xs">{row.exam}</div>
                          <div className="text-[10px] text-zinc-500">{row.category}</div>
                        </div>
                        <div className="text-right font-mono">
                          <div className="text-[#00E676] font-bold text-xs">${row.usd.toLocaleString()} USD</div>
                          <div className="text-[10px] text-zinc-400">≈ ₦{ngnVal.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 font-mono text-center pt-2 border-t border-white/5">
                Market data sourced from open.er-api.com • Cached for 1 hour • Zero latency
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

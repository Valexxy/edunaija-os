"use client";

import { useState, useEffect } from "react";
import { 
  Wifi, WifiOff, Download, Database, CheckCircle2, 
  PhoneCall, Zap, Shield, ArrowRight, RotateCcw, AlertTriangle, Sparkles 
} from "lucide-react";
import { 
  saveOfflinePack, getOfflineQuestions, getOfflineFormulas, queueOfflineResult, 
  getQueuedResults, syncOfflineQueueWithServer, OfflineQuestion 
} from "../../lib/offlineStore";
import { sfx } from "../../lib/audio";
import BackButton from "../../components/BackButton";

export default function ZeroDataPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [cachedCount, setCachedCount] = useState(0);
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);
  const [queuedResultsCount, setQueuedResultsCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Subject Filter & Formula Vault
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [offlineFormulas, setOfflineFormulas] = useState<Record<string, Array<{ name: string; formula: string }>> | null>(null);
  const [showFormulaVault, setShowFormulaVault] = useState(false);

  // Offline Quiz Practice Mode
  const [offlineQuestions, setOfflineQuestions] = useState<OfflineQuestion[]>([]);
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // USSD Interactive Simulator (*384*24#)
  const [ussdInput, setUssdInput] = useState("");
  const [ussdScreen, setUssdScreen] = useState<string | null>(null);
  const [ussdHistory, setUssdHistory] = useState<string[]>([]);
  const [ussdAction, setUssdAction] = useState<"CONTINUE" | "END">("CONTINUE");

  // Track online/offline status & load cached state
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        triggerSync();
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      refreshLocalData();

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const refreshLocalData = async (subjectFilter?: string) => {
    try {
      const activeFilter = subjectFilter !== undefined ? subjectFilter : selectedSubject;
      const allQs = await getOfflineQuestions();
      setCachedCount(allQs.length);

      const filteredQs = activeFilter === "All" ? allQs : allQs.filter(q => q.subject.toLowerCase() === activeFilter.toLowerCase());
      setOfflineQuestions(filteredQs);
      setActiveQuizIndex(0);
      setSelectedOpt(null);
      setQuizComplete(false);
      setQuizScore(0);

      const formulas = await getOfflineFormulas();
      if (formulas) setOfflineFormulas(formulas);

      const queue = await getQueuedResults();
      setQueuedResultsCount(queue.length);
      const storedDate = localStorage.getItem("edunaija_pack_date");
      if (storedDate) setLastDownloaded(storedDate);
    } catch (e) {
      console.warn("IndexedDB init check:", e);
    }
  };

  // Download Offline Pack
  const handleDownloadPack = async () => {
    setDownloading(true);
    sfx.tap();
    try {
      const res = await fetch("/api/backend/zero-data/pack");
      if (res.ok) {
        const data = await res.json();
        const count = await saveOfflinePack(data);
        setCachedCount(count);
        const dateStr = new Date().toLocaleDateString("en-NG", {
          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
        });
        localStorage.setItem("edunaija_pack_date", dateStr);
        setLastDownloaded(dateStr);
        await refreshLocalData();
        sfx.correct();
      }
    } catch {
      sfx.wrong();
    } finally {
      setDownloading(false);
    }
  };

  // Trigger Sync
  const triggerSync = async () => {
    setSyncStatus("Syncing offline test results...");
    const res = await syncOfflineQueueWithServer();
    if (res && res.synced > 0) {
      setSyncStatus(`🎉 Synced ${res.synced} offline tests! +${res.xp} XP credited to your profile!`);
      sfx.correct();
      await refreshLocalData();
    } else {
      setSyncStatus("All results are up to date!");
    }
    setTimeout(() => setSyncStatus(null), 4000);
  };

  // Offline Quiz Answer Selection
  const handleAnswerOffline = (idx: number) => {
    if (selectedOpt !== null) return;
    sfx.tap();
    setSelectedOpt(idx);
    const q = offlineQuestions[activeQuizIndex];
    if (idx === q.correct) {
      setQuizScore(s => s + 1);
      sfx.correct();
    } else {
      sfx.wrong();
    }
  };

  const handleNextOfflineQuestion = async () => {
    if (activeQuizIndex < Math.min(offlineQuestions.length - 1, 9)) {
      setActiveQuizIndex(i => i + 1);
      setSelectedOpt(null);
    } else {
      // Quiz complete -> queue result in IndexedDB
      setQuizComplete(true);
      await queueOfflineResult({
        subject: offlineQuestions[0]?.subject || "General",
        score: quizScore,
        total: Math.min(offlineQuestions.length, 10),
        timestamp: Date.now(),
        synced: false
      });
      await refreshLocalData();
    }
  };

  // USSD Dial helper
  const handleDialUSSD = async (inputStr?: string) => {
    sfx.tap();
    const textToSend = inputStr !== undefined ? inputStr : ussdInput;
    try {
      const res = await fetch("/api/backend/zero-data/ussd-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: "demo-session",
          phone_number: "08031234567",
          service_code: "*384*24#",
          text: textToSend
        })
      });
      if (res.ok) {
        const data = await res.json();
        setUssdScreen(data.response);
        setUssdAction(data.action);
        if (inputStr) {
          setUssdHistory(prev => [...prev, inputStr]);
        }
      }
    } catch {
      setUssdScreen("Network Error. Telco USSD gateway unreachable.");
    }
    setUssdInput("");
  };

  const handleResetUSSD = () => {
    setUssdHistory([]);
    setUssdInput("");
    setUssdScreen(null);
    handleDialUSSD("");
  };

  const currentOfflineQ = offlineQuestions[activeQuizIndex];

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#06180e] to-black border-b border-emerald-500/20 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <BackButton fallbackHref="/student" label="Back to Cockpit" />
          </div>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" /> 100% Offline-First • 0.00 KB Internet Required
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white">
            EduNaija <span className="text-[#00E676]">₦0 Data Engine</span> 🛡️📶
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Never let expired data bundles stop your child from preparing for JAMB & WAEC. Download once, study disconnected forever in the village or during power outages.
          </p>

          {/* Live Status Bar */}
          <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
              isOnline 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}>
              {isOnline ? <Wifi className="w-4 h-4 text-[#00E676]" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
              <span>{isOnline ? "Online (Sync Ready)" : "Airplane / Zero-Data Mode Active"}</span>
            </div>

            <div className="bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 font-mono text-xs text-zinc-300">
              Data Consumed: <strong className="text-[#00E676]">0.00 KB</strong>
            </div>

            {queuedResultsCount > 0 && (
              <button
                onClick={triggerSync}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Sync {queuedResultsCount} Offline Tests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {syncStatus && (
            <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 py-1.5 px-4 rounded-xl inline-block mt-2">
              {syncStatus}
            </div>
          )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* DOWNLOAD STUDY PACK CARD */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 bg-black/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Database className="w-5 h-5 text-[#00E676]" />
              <h2 className="text-lg font-bold text-white">Local Study Pack (IndexedDB)</h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-md">
              Downloads 80+ past questions, mnemonics, and formulas in a tiny <strong>35 KB</strong> package. Once downloaded, the entire app runs with <strong>0 KB data</strong>!
            </p>
            <div className="text-[11px] text-zinc-500 font-mono">
              Status: <span className="text-white font-bold">{cachedCount} Questions Cached</span> • {lastDownloaded ? `Updated: ${lastDownloaded}` : "Not yet downloaded"}
            </div>
          </div>

          <button
            onClick={handleDownloadPack}
            disabled={downloading}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? "Downloading (35KB)..." : "📥 Download Offline Pack"}</span>
          </button>
        </div>

        {/* 100% OFFLINE CBT PRACTICE TEST */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 bg-black/60 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Local Device Engine</span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📝 100% Disconnected Offline Mock CBT
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFormulaVault(!showFormulaVault)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  showFormulaVault ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{showFormulaVault ? "Hide Formulas" : "📐 Formula Vault"}</span>
              </button>
              <span className="text-xs font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl text-zinc-400">
                Q {activeQuizIndex + 1} of {Math.min(offlineQuestions.length, 10)}
              </span>
            </div>
          </div>

          {/* Subject Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {["All", "Mathematics", "English", "Physics", "Chemistry", "Biology", "Economics"].map((subj) => {
              const isSelected = selectedSubject === subj;
              return (
                <button
                  key={subj}
                  onClick={() => {
                    setSelectedSubject(subj);
                    refreshLocalData(subj);
                    sfx.tap();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {subj}
                </button>
              );
            })}
          </div>

          {/* OFFLINE FORMULA CHEAT-SHEET ACCORDION */}
          {showFormulaVault && (
            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-amber-500/30 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">Offline High-Yield Formula Vault</h3>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">0 KB Data Required</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {offlineFormulas ? (
                  Object.entries(offlineFormulas).map(([subject, list]) => (
                    <div key={subject} className="p-3.5 rounded-xl bg-black/60 border border-white/5 space-y-2">
                      <div className="font-bold text-emerald-400 uppercase text-[11px]">{subject}</div>
                      <div className="space-y-1.5">
                        {list.map((f, i) => (
                          <div key={i} className="text-zinc-300">
                            <span className="text-zinc-500 block text-[10px]">{f.name}:</span>
                            <code className="text-amber-300 font-mono text-[11px] bg-white/5 px-1.5 py-0.5 rounded block mt-0.5">{f.formula}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-xs">Download the study pack above to unlock offline formulas.</p>
                )}
              </div>
            </div>
          )}

          {cachedCount === 0 ? (
            <div className="text-center py-8 space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-xs text-zinc-400">No questions downloaded yet. Click "Download Offline Pack" above to get started!</p>
            </div>
          ) : offlineQuestions.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-xs text-zinc-400">No questions found for subject "{selectedSubject}". Switch to "All" or download the latest pack!</p>
            </div>
          ) : quizComplete ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-5xl">🏆</div>
              <h3 className="text-2xl font-black text-white">Offline Test Completed!</h3>
              <div className="text-3xl font-mono font-black text-[#00E676]">
                {quizScore} / {Math.min(offlineQuestions.length, 10)}
              </div>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Your score and diagnostic results have been queued safely on your phone's memory! As soon as you connect to Wi-Fi or mobile data, your XP and ranking will automatically sync!
              </p>
              <button
                onClick={() => {
                  setQuizComplete(false);
                  setActiveQuizIndex(0);
                  setSelectedOpt(null);
                  setQuizScore(0);
                }}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
              >
                Take Another Offline Test
              </button>
            </div>
          ) : currentOfflineQ ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2">
                <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                  <span>{currentOfflineQ.subject} ({currentOfflineQ.year})</span>
                  <span>{currentOfflineQ.topic}</span>
                </div>
                <h3 className="text-sm font-semibold text-white leading-relaxed">
                  {currentOfflineQ.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentOfflineQ.options.map((opt, idx) => {
                  const isSelected = selectedOpt === idx;
                  const isCorrectAnswer = idx === currentOfflineQ.correct;
                  let btnColor = "bg-white/5 border-white/10 text-zinc-300 hover:border-white/20";
                  if (selectedOpt !== null) {
                    if (isCorrectAnswer) btnColor = "bg-emerald-500/20 border-emerald-500 text-white";
                    else if (isSelected) btnColor = "bg-red-500/20 border-red-500 text-white";
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerOffline(idx)}
                      disabled={selectedOpt !== null}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${btnColor}`}
                    >
                      <span className="text-xs font-medium">{String.fromCharCode(65 + idx)}. {opt}</span>
                      {selectedOpt !== null && isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-[#00E676]" />}
                    </button>
                  );
                })}
              </div>

              {/* Offline Explanation */}
              {selectedOpt !== null && (
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-xs">
                  <div className="font-bold text-emerald-400">📖 Step-by-Step Solution:</div>
                  <p className="text-zinc-300 leading-relaxed">{currentOfflineQ.explanation}</p>
                  <button
                    onClick={handleNextOfflineQuestion}
                    className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black text-xs"
                  >
                    Next Question →
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* TELCO USSD HARDWARE SIMULATOR (*384*24#) */}
        <div className="glass-card rounded-3xl p-6 border border-amber-500/30 bg-black/60 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">GSM Feature Phone Simulation</span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-amber-400" />
              Telco USSD Offline CBT (*384*24#)
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Works on torchlight phones (Nokia 3310, itel) using GSM signalling with <strong>0.00 KB mobile data</strong> on MTN, Airtel, Glo & 9mobile!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Retro Phone Screen */}
            <div className="bg-[#1a2e1f] p-5 rounded-3xl border-4 border-zinc-700 shadow-inner font-mono text-emerald-300 min-h-[200px] flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-emerald-500 border-b border-emerald-500/30 pb-1 mb-2 flex justify-between">
                  <span>MTN-NG 0-DATA</span>
                  <span>*384*24#</span>
                </div>
                <div className="text-xs whitespace-pre-line leading-relaxed">
                  {ussdScreen || "Dial *384*24# below to start a zero-data CBT session on your phone!"}
                </div>
              </div>

              {ussdAction === "CONTINUE" && ussdScreen && (
                <div className="pt-3 border-t border-emerald-500/30 flex gap-2">
                  <input
                    type="text"
                    placeholder="Reply..."
                    value={ussdInput}
                    onChange={(e) => setUssdInput(e.target.value)}
                    className="w-full bg-black/50 border border-emerald-500/40 rounded px-2 py-1 text-xs text-emerald-200 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const fullPath = ussdHistory.length > 0 ? `${ussdHistory.join("*")}*${ussdInput}` : ussdInput;
                      handleDialUSSD(fullPath);
                    }}
                    className="px-3 py-1 bg-emerald-500 text-black font-black text-xs rounded"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={handleResetUSSD}
                className="w-full py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Dial *384*24# on MTN / Airtel / Glo</span>
              </button>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 space-y-1.5 text-xs">
                <span className="font-bold text-zinc-300">💡 Why USSD is a game-changer:</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Millions of Nigerian secondary school students in rural areas have no smartphone or cannot afford data bundles. USSD delivers test questions straight to ANY simple mobile device!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* NIGERIAN PARENT DATA SAVINGS CALCULATOR */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 to-black border border-emerald-500/20 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Parent Financial Relief Calculator</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-500">Video Tutorials App</span>
              <div className="text-lg font-mono font-bold text-red-400">~300 MB / day</div>
              <div className="text-xs text-zinc-400">₦12,000 / month</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] text-zinc-500">EduNaija 0-Data Engine</span>
              <div className="text-lg font-mono font-bold text-[#00E676]">0.00 KB / day</div>
              <div className="text-xs text-emerald-400 font-bold">₦0.00 / month</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] text-zinc-400">Parent Monthly Savings</span>
              <div className="text-2xl font-mono font-black text-[#00E676]">₦12,000</div>
              <div className="text-[10px] text-emerald-300 font-bold">Kept in family pocket!</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

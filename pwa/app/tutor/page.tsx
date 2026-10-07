"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, AlertCircle, FileCheck, BookOpen, Send, CheckCircle2, 
  RefreshCw, Check, Sparkles, Award, ArrowRight
} from "lucide-react";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";

export default function TutorDashboard() {
  const router = useRouter();
  const [tutorUser, setTutorUser] = useState<any>(null);
  const [cohorts, setCohorts] = useState<any[]>([
    { id: "c1", name: "SS3 Gold — Physics & Further Maths", count: 24, avg: 76.5 },
    { id: "c2", name: "JAMB 2026 300+ Intensive Crash Squad", count: 18, avg: 82.1 }
  ]);

  const [atRiskList, setAtRiskList] = useState<any[]>([
    { name: "Emeka Okafor", topic: "Physics • Calculus in Kinematics", fails: 4, action: "Assign Remedial Drill" },
    { name: "Fatimah Aliyu", topic: "Chemistry • Organic Mechanisms", fails: 3, action: "Send WhatsApp Nudge" },
    { name: "Tobi Adeleke", topic: "Mathematics • Fractions & Ratios", fails: 2, action: "Assign Phonics Audio" }
  ]);
  const [loadingAtRisk, setLoadingAtRisk] = useState(false);
  const [inAppToast, setInAppToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    sfx.correct();
    triggerTmaHaptic("medium");
    setInAppToast(msg);
    setTimeout(() => setInAppToast(null), 3500);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("edunaija_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.role === "tutor") setTutorUser(parsed);
        } catch {}
      }
    }

    async function loadTutorData() {
      setLoadingAtRisk(true);
      try {
        const res = await fetch("/api/backend/dashboards/tutor/DEMO-TUTOR-001");
        if (res.ok) {
          const data = await res.json();
          if (data.active_cohorts && data.active_cohorts.length > 0) {
            setCohorts(data.active_cohorts.map((c: any, idx: number) => ({
              id: `c_${idx}`,
              name: c.name,
              count: c.student_count || 20,
              avg: Math.min(95, Math.round((c.avg_xp / 15000) * 100) || 75)
            })));
          }
          if (data.at_risk_alerts && data.at_risk_alerts.length > 0) {
            setAtRiskList(data.at_risk_alerts.map((item: any) => ({
              name: item.user_key || "Scholar",
              topic: `${item.subject} • ${item.topic}`,
              fails: Math.max(2, Math.round((100 - item.mastery_percentage) / 15)),
              action: "Assign Remedial Quiz"
            })));
          }
        }
      } catch (e) {
        console.warn("Failed fetching tutor dashboard:", e);
      } finally {
        setLoadingAtRisk(false);
      }
    }
    loadTutorData();
  }, []);

  const tutorName = tutorUser?.full_name || "Engr. Babatunde Raji";

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto min-h-screen pb-24 text-white relative space-y-6">
      {/* In-App Notification Toast */}
      <AnimatePresence>
        {inAppToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{inAppToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-bold text-naija-gold tracking-widest uppercase flex items-center gap-1.5 font-mono">
            <Award className="w-3.5 h-3.5" /> Pedagogical Command Center • Senior STEM Instructor
          </span>
          <h1 className="font-display tracking-tight font-extrabold text-2xl sm:text-3xl text-white mt-1">
            {tutorName}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Specialization: <strong className="text-white">Physics, Further Mathematics &amp; Chemistry</strong> • 42 Enrolled Scholars
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-naija-gold/10 border border-naija-gold/30 flex items-center justify-center text-naija-gold font-display font-black text-lg">
          BR
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Cohorts & Rubric Grading */}
        <div className="space-y-6">
          {/* Cohorts Overview */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                Active Assigned Cohorts ({cohorts.length})
              </h2>
              <span className="text-[11px] font-mono text-emerald-400">Class Target: &gt;75%</span>
            </div>

            <div className="space-y-3">
              {cohorts.map((c) => (
                <div key={c.id} className="glass-card p-4 rounded-2xl border border-white/10 bg-black/40 flex justify-between items-center shadow-lg">
                  <div>
                    <div className="text-sm font-bold text-white">{c.name}</div>
                    <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-zinc-500" /> {c.count} Students Enrolled
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-[#00E676]">{c.avg}%</div>
                    <div className="text-[10px] text-zinc-400 font-mono">Cohort Mastery</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* WAEC Theory Rubric Grading Queue */}
          <div className="glass-card p-4 rounded-2xl border border-purple-500/20 bg-purple-950/20 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">WAEC &amp; NECO Theory Submissions</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">18 Rubric-graded step-by-step solutions awaiting validation</div>
              </div>
            </div>
            <button 
              onClick={() => { sfx.tap(); router.push("/quiz"); }}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
            >
              Review →
            </button>
          </div>
        </div>

        {/* Right Column: Interventions & Broadcast */}
        <div className="space-y-6">
          {/* At-Risk Intervention Alert Queue */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <AlertCircle className="w-4 h-4" /> Intervention Alerts (At-Risk Topics)
              </h2>
              <span className="text-[10px] font-mono text-zinc-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                {atRiskList.length} flagged
              </span>
            </div>

            <div className="space-y-2.5">
              {atRiskList.map((s, idx) => (
                <div key={idx} className="glass-card p-3.5 rounded-2xl border border-red-500/20 bg-red-950/10 flex justify-between items-center shadow-md">
                  <div>
                    <div className="text-xs font-bold text-white">{s.name}</div>
                    <div className="text-[10px] text-red-300 mt-0.5">Struggling with: {s.topic} ({s.fails} failed attempts)</div>
                  </div>
                  <button 
                    onClick={() => { sfx.tap(); showToast(`Dispatched ${s.action} to ${s.name}`); }}
                    className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30 hover:bg-red-500/30 active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    {s.action}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Broadcast Mock Dispatch */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { sfx.tap(); showToast("30-Question Calibration Drill Pack successfully dispatched to all 42 candidates!"); }}
            className="w-full bg-gradient-to-r from-naija-gold to-amber-500 text-black font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.3)] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Dispatch Timed Quiz Pack to All Cohorts
          </motion.button>
        </div>
      </div>
    </main>
  );
}

"use client";
import { useState } from "react";
import FormulaWorkbench from "../../components/FormulaWorkbench";
import BackButton from "../../components/BackButton";

const UNIVERSITIES = [
  { id: "UNILAG", name: "UNILAG", full: "University of Lagos", state: "Lagos", logo: "\ud83c\udf46" },
  { id: "UI", name: "UI", full: "University of Ibadan", state: "Oyo", logo: "\ud83c\udf3f" },
  { id: "OAU", name: "OAU", full: "Obafemi Awolowo University", state: "Osun", logo: "\ud83c\udf33" },
  { id: "ABU", name: "ABU", full: "Ahmadu Bello University", state: "Kaduna", logo: "\ud83c\udfd4\ufe0f" },
  { id: "UNN", name: "UNN", full: "University of Nigeria, Nsukka", state: "Enugu", logo: "\ud83e\udded" },
  { id: "UNIBEN", name: "UNIBEN", full: "University of Benin", state: "Edo", logo: "\ud83c\udf31" },
  { id: "UNIPORT", name: "UNIPORT", full: "University of Port Harcourt", state: "Rivers", logo: "\ud83d\udef3\ufe0f" },
];

const GRADES = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];

const STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nassarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

export default function AdmissionsPage() {
  const [step, setStep] = useState(1);
  const [university, setUniversity] = useState("");
  const [jambScore, setJambScore] = useState(200);
  const [stateOfOrigin, setStateOfOrigin] = useState("");
  const [course, setCourse] = useState("Medicine and Surgery");
  const [grades, setGrades] = useState<Record<string, string>>({ english: "B3", mathematics: "C4", biology: "C4", chemistry: "C4", physics: "C4" });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    if (!university || !stateOfOrigin) { setError("Please select a university and state of origin."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/backend/admissions/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jamb_score: jambScore, university, course, state_of_origin: stateOfOrigin, o_level_grades: grades })
      });
      const data = await res.json();
      setResult(data);
      setStep(5);
    } catch (e) { setError("Failed to calculate. Please ensure backend is running on port 8000."); }
    finally { setLoading(false); }
  };

  const probabilityColor = (p: string) => p.includes("High") ? "text-emerald-400" : p.includes("Medium") ? "text-amber-400" : "text-red-400";
  const probabilityBg = (p: string) => p.includes("High") ? "bg-emerald-500/10 border-emerald-500/30" : p.includes("Medium") ? "bg-amber-500/10 border-amber-500/30" : "bg-red-500/10 border-red-500/30";

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <BackButton fallbackHref="/student" label="Back to Cockpit" />
        </div>
        {/* Hero */}
        <div className="text-center space-y-2">
          <div className="text-5xl">\ud83c\udf93</div>
          <h1 className="text-2xl font-display font-black text-white">University Admission Calculator</h1>
          <p className="text-zinc-400 text-sm">Nigeria&apos;s most accurate JAMB composite score &amp; quota probability calculator</p>
          <div className="flex items-center justify-center gap-4 text-xs text-zinc-500 flex-wrap">
            <span>\u2705 UNILAG \u2022 UI \u2022 OAU \u2022 ABU \u2022 UNN \u2022 UNIBEN \u2022 UNIPORT</span>
          </div>
        </div>

        {/* Step Indicator */}
        {step < 5 && (
          <div className="flex items-center justify-center gap-2">
            {[1,2,3,4].map(s => (
              <div key={s} className={`flex items-center gap-2`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                  step === s ? "bg-[#00E676] text-black" : step > s ? "bg-emerald-500/30 text-emerald-400" : "bg-white/10 text-zinc-500"}`}>
                  {step > s ? "\u2713" : s}
                </div>
                {s < 4 && <div className={`w-8 h-0.5 ${step > s ? "bg-emerald-500" : "bg-white/10"}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Select University */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-center">Step 1: Choose Your Target University</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {UNIVERSITIES.map(u => (
                <button key={u.id} onClick={() => { setUniversity(u.id); setStep(2); }}
                  className={`p-4 rounded-2xl text-center transition-all border-2 ${
                    university === u.id ? "bg-emerald-500/20 border-emerald-500 text-white" : "bg-white/5 border-white/10 text-zinc-300 hover:border-emerald-500/50 hover:text-white"}`}>
                  <div className="text-3xl mb-2">{u.logo}</div>
                  <div className="font-black text-sm">{u.name}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{u.full}</div>
                  <div className="text-[10px] text-zinc-500">{u.state} State</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: JAMB Score */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-center">Step 2: Your JAMB Score</h2>
            <div className="bg-zinc-900 rounded-2xl p-6 text-center space-y-4">
              <div className="text-6xl font-mono font-black text-[#00E676]">{jambScore}</div>
              <div className="text-xs text-zinc-400">JAMB UTME Score <span className="text-zinc-600">(100 \u2013 400)</span></div>
              <input type="range" min={100} max={400} step={1} value={jambScore}
                onChange={e => setJambScore(parseInt(e.target.value))}
                className="w-full accent-emerald-400 h-2" />
              <div className="flex justify-between text-xs text-zinc-600">
                <span>100</span><span className="text-zinc-400 font-bold">National Cutoff: 140</span><span>400</span>
              </div>
              <div className={`px-4 py-2 rounded-xl text-xs font-bold ${
                jambScore >= 280 ? "bg-emerald-500/20 text-emerald-400" :
                jambScore >= 200 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                {jambScore >= 280 ? "\ud83d\udd25 Excellent Score" : jambScore >= 200 ? "\ud83d\udc4d Good Score" : "\u26a0\ufe0f Below Average \u2014 Consider supplementary prep"}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-bold">\u2190 Back</button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black">Next \u2192</button>
            </div>
          </div>
        )}

        {/* Step 3: O'Level Grades */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-center">Step 3: Your O&apos;Level Grades</h2>
            <p className="text-xs text-zinc-400 text-center">Select your grades for your 5 best relevant subjects</p>
            <div className="space-y-3">
              {Object.keys(grades).map(subject => (
                <div key={subject} className="flex items-center gap-3 bg-zinc-900/50 rounded-xl p-3">
                  <div className="capitalize text-sm font-semibold text-white w-28">{subject.replace("_", " ")}</div>
                  <div className="flex gap-2 flex-wrap">
                    {GRADES.map(g => (
                      <button key={g} onClick={() => setGrades(prev => ({ ...prev, [subject]: g }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          grades[subject] === g 
                            ? g.startsWith("A") ? "bg-emerald-500 text-black" 
                            : g.startsWith("B") ? "bg-blue-500 text-white"
                            : g.startsWith("C") ? "bg-amber-500 text-black"
                            : "bg-red-500 text-white"
                            : "bg-white/10 text-zinc-400 hover:bg-white/20"}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-bold">\u2190 Back</button>
              <button onClick={() => setStep(4)} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black">Next \u2192</button>
            </div>
          </div>
        )}

        {/* Step 4: State of Origin + Calculate */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-center">Step 4: State of Origin &amp; Course</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-2">State of Origin</label>
                <select value={stateOfOrigin} onChange={e => setStateOfOrigin(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50">
                  <option value="">-- Select your state --</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-2">Target Course</label>
                <input type="text" value={course} onChange={e => setCourse(e.target.value)}
                  placeholder="e.g. Medicine and Surgery, Law, Engineering..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 placeholder:text-zinc-600" />
              </div>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400">{error}</div>}
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-bold">\u2190 Back</button>
              <button onClick={handleCalculate} disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-black hover:brightness-110 active:scale-95 disabled:opacity-50">
                {loading ? "Calculating..." : "\ud83e\uddee Calculate My Chances"}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Results */}
        {step === 5 && result && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="text-5xl font-mono font-black text-[#00E676]">{result.composite_score?.toFixed(1)}</div>
              <div className="text-zinc-400 text-sm">Composite Score <span className="text-zinc-600">/ 100</span></div>
              <div className="text-lg font-bold text-white">{result.university} \u2014 {result.course}</div>
            </div>

            {/* Probability Badge */}
            {result.quota_analysis && (
              <div className={`rounded-2xl border p-4 text-center ${probabilityBg(result.quota_analysis.admission_probability)}`}>
                <div className={`text-xl font-black ${probabilityColor(result.quota_analysis.admission_probability)}`}>
                  {result.quota_analysis.admission_probability}
                </div>
                <div className="text-xs text-zinc-400 mt-1">{result.quota_analysis.candidate_quota_type}</div>
              </div>
            )}

            {/* Formula Breakdown */}
            {result.formula_breakdown && (
              <div className="bg-zinc-900 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-zinc-300">\ud83d\udcca Score Breakdown</h3>
                <div className="text-xs text-zinc-500 font-mono">{result.formula_breakdown.formula_used}</div>
                <div className="space-y-2">
                  {[
                    { label: "JAMB Component", value: result.formula_breakdown.jamb_component, max: 50, color: "bg-blue-500" },
                    { label: "O'Level Component", value: result.formula_breakdown.o_level_component, max: 30, color: "bg-emerald-500" },
                    { label: "Post-UTME Estimate", value: result.formula_breakdown.post_utme_estimate, max: 20, color: "bg-purple-500" },
                  ].map(bar => (
                    <div key={bar.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400">{bar.label}</span>
                        <span className="text-white font-bold">{bar.value?.toFixed(1)} / {bar.max}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: `${Math.min(100, (bar.value / bar.max) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quota Analysis */}
            {result.quota_analysis && (
              <div className="bg-zinc-900 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-zinc-300">\ud83c\udfaf Quota Analysis</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Merit", cutoff: result.quota_analysis.merit_cutoff, slots: result.quota_analysis.merit_slots_percent, color: "emerald" },
                    { label: "Catchment", cutoff: result.quota_analysis.catchment_cutoff, slots: result.quota_analysis.catchment_slots_percent, color: "blue" },
                    { label: "ELDS", cutoff: result.quota_analysis.elds_cutoff, slots: result.quota_analysis.elds_slots_percent, color: "amber" },
                  ].map(q => (
                    <div key={q.label} className={`bg-${q.color}-500/10 border border-${q.color}-500/30 rounded-xl p-3 text-center`}>
                      <div className="text-xs font-bold text-zinc-300">{q.label}</div>
                      <div className={`text-lg font-mono font-black text-${q.color}-400`}>{q.cutoff}</div>
                      <div className="text-[10px] text-zinc-500">{q.slots}% slots</div>
                      <div className={`text-[10px] font-bold mt-1 ${result.composite_score >= q.cutoff ? "text-emerald-400" : "text-red-400"}`}>
                        {result.composite_score >= q.cutoff ? "\u2713 Eligible" : "\u2717 Below"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            {result.recommendation && (
              <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-zinc-300 mb-2">\ud83d\udcdd Expert Analysis</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{result.recommendation}</p>
              </div>
            )}

            {/* Alternatives */}
            {result.alternative_courses && result.alternative_courses.length > 0 && (
              <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-zinc-300 mb-2">\ud83d\udd04 Alternative Courses</h3>
                <div className="flex flex-wrap gap-2">
                  {result.alternative_courses.map((c: string) => (
                    <span key={c} className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-300 text-xs font-semibold">{c}</span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => { setStep(1); setResult(null); setUniversity(""); setStateOfOrigin(""); }}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white font-bold text-sm">
              \ud83d\udd04 Calculate Again
            </button>
          </div>
        )}

        {/* Formula Workbench Section */}
        <div className="border-t border-white/10 pt-8 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-display font-black text-white">\ud83e\uddee Slow Learner Formula Workbench</h2>
            <p className="text-zinc-400 text-sm">Can&apos;t solve formulas? Fill in the blanks and see the step-by-step working!</p>
            <div className="text-xs text-zinc-600">Perfect for Physics, Chemistry &amp; Mathematics</div>
          </div>
          <FormulaWorkbench />
        </div>

        {/* Disclaimer */}
        <div className="text-center text-[10px] text-zinc-600 leading-relaxed">
          \u26a0\ufe0f Disclaimer: All cutoff scores and quota percentages are estimates based on historical data and publicly available JAMB admission policies. Actual admission decisions are made solely by individual universities and JAMB. EduNaija OS is not affiliated with JAMB or any federal university.
        </div>
      </div>
    </div>
  );
}

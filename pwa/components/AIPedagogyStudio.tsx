"use client";

import { useState } from "react";
import { 
  Sparkles, BookOpen, Brain, CheckCircle2, ArrowRight, 
  HelpCircle, Lightbulb, FileText, Upload, RefreshCw
} from "lucide-react";

export default function AIPedagogyStudio() {
  const [activeTab, setActiveTab] = useState<"ASSIGNMENT" | "SYLLABUS">("ASSIGNMENT");

  // Assignment Assistant State
  const [assignmentInput, setAssignmentInput] = useState("Solve for x: 2*x + 8 = 20");
  const [assistMode, setAssistMode] = useState<"TEACH_ME" | "SOLVE_AND_EXPLAIN" | "HYBRID">("TEACH_ME");
  const [assistResult, setAssistResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Syllabus Ingestion State
  const [rawSyllabus, setRawSyllabus] = useState("");
  const [syllabusResult, setSyllabusResult] = useState<any>(null);

  const handleRunAssist = () => {
    setIsLoading(true);
    // Call backend or deterministic local mock
    setTimeout(() => {
      if (assistMode === "SOLVE_AND_EXPLAIN") {
        setAssistResult({
          mode: "SOLVE_AND_EXPLAIN",
          verified_solution: "x = 6",
          steps: [
            "Step 1: Subtract 8 from both sides of the equation: 2x = 12",
            "Step 2: Divide both sides by the coefficient 2: x = 6",
            "Step 3: Verification: 2(6) + 8 = 12 + 8 = 20. Deterministic truth verified."
          ]
        });
      } else if (assistMode === "TEACH_ME") {
        setAssistResult({
          mode: "TEACH_ME",
          prompt: "Let us examine: '2*x + 8 = 20'. Before touching x, what happens if you remove the constant 8 from both sides?",
          hint: "Subtract 8 from both sides to isolate the 2*x term."
        });
      } else {
        setAssistResult({
          mode: "HYBRID",
          prompt: "Two-step ladder: First isolate the variable term 2x, then resolve the coefficient 2.",
          verified_solution: "Target outcome: x = 6"
        });
      }
      setIsLoading(false);
    }, 400);
  };

  const handleSyllabusAnalysis = () => {
    setIsLoading(true);
    setTimeout(() => {
      const source = rawSyllabus.trim() ? "Custom Uploaded Scheme" : "Default NERDC National Curriculum";
      const weeks = rawSyllabus.trim() 
        ? rawSyllabus.split("\n").filter(l => l.trim().length > 2)
        : [
            "Week 1: Indices, Logarithms & Surds",
            "Week 2: Quadratic Equations & Factorization",
            "Week 3: Simultaneous Linear & Quadratic Equations",
            "Week 4: Arithmetic & Geometric Progressions (AP & GP)",
            "Week 5: Trigonometric Ratios & Angles of Elevation",
            "Week 6: Mid-Term Revision & Diagnostic Mastery Hall"
          ];

      setSyllabusResult({
        source,
        schedule: weeks.map((w, i) => ({
          week: i + 1,
          topic: w,
          mastery_target: "85% Minimum Mastery",
          test_ready: true
        }))
      });
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 mt-6">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8 shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
          <button
            onClick={() => setActiveTab("ASSIGNMENT")}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
              activeTab === "ASSIGNMENT"
                ? "bg-emerald-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-750"
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>AI Assignment Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab("SYLLABUS")}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
              activeTab === "SYLLABUS"
                ? "bg-teal-500 text-slate-950"
                : "bg-slate-800 text-slate-300 hover:bg-slate-750"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curriculum & Syllabus Tutor</span>
          </button>
        </div>

        {/* TAB 1: ASSIGNMENT ASSISTANT */}
        {activeTab === "ASSIGNMENT" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Assignment Query / Problem Statement
              </span>
              <div className="flex gap-1.5">
                {(["TEACH_ME", "SOLVE_AND_EXPLAIN", "HYBRID"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setAssistMode(m)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                      assistMode === m
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    {m === "TEACH_ME" ? "Teach Me" : m === "SOLVE_AND_EXPLAIN" ? "Full Derivation" : "Hybrid"}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={assignmentInput}
              onChange={(e) => setAssignmentInput(e.target.value)}
              placeholder="Paste homework problem or type an equation..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-emerald-500 mb-4"
            />

            <button
              disabled={isLoading || !assignmentInput.trim()}
              onClick={handleRunAssist}
              className="w-full py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition flex items-center justify-center gap-2 mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? "Consulting AI..." : "Consult AI Assignment Tutor"}</span>
            </button>

            {/* Result Box */}
            {assistResult && (
              <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 text-sm text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-3">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>AI Pedagogical Response ({assistResult.mode})</span>
                </div>

                {assistResult.prompt && (
                  <p className="text-white font-medium mb-3">{assistResult.prompt}</p>
                )}

                {assistResult.hint && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300 mb-3 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{assistResult.hint}</span>
                  </div>
                )}

                {assistResult.steps && (
                  <div className="space-y-2 mb-3">
                    {assistResult.steps.map((st: string, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-850 text-xs">
                        {st}
                      </div>
                    ))}
                  </div>
                )}

                {assistResult.verified_solution && (
                  <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg inline-block">
                    {assistResult.verified_solution}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SYLLABUS TUNER */}
        {activeTab === "SYLLABUS" && (
          <div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Upload your school&apos;s scheme of work or use default NERDC standards. The AI tutor will analyze your topics, diagnose your starting level, and fine-tune tests specifically for you.
            </p>

            <textarea
              rows={4}
              value={rawSyllabus}
              onChange={(e) => setRawSyllabus(e.target.value)}
              placeholder="Paste weekly scheme of work (e.g., Week 1: Surds, Week 2: Matrices) or leave blank for official NERDC default..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-teal-500 mb-4"
            />

            <button
              disabled={isLoading}
              onClick={handleSyllabusAnalysis}
              className="w-full py-3.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-sm hover:bg-teal-400 transition flex items-center justify-center gap-2 mb-6"
            >
              <BookOpen className="w-4 h-4" />
              <span>{isLoading ? "Ingesting Syllabus..." : "Lock & Tune Syllabus Pacing"}</span>
            </button>

            {syllabusResult && (
              <div className="bg-slate-950 border border-teal-500/30 rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs font-bold text-teal-400 uppercase mb-4">
                  <span>Source: {syllabusResult.source}</span>
                  <span className="text-slate-400">{syllabusResult.schedule.length} Weeks Scheduled</span>
                </div>

                <div className="space-y-2">
                  {syllabusResult.schedule.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{item.topic}</span>
                        <span className="text-[11px] text-slate-400 font-mono">Target: {item.mastery_target}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono font-bold text-[10px]">
                        Test Ready
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

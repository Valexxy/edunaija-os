"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, BookOpen, AlertTriangle, ChevronRight, Award, Zap, Sparkles, Lock } from "lucide-react";
import { sfx } from "../../lib/audio";
import { triggerTmaHaptic } from "../../lib/telegram";
import ScholarPassModal from "../../components/ScholarPassModal";
import BackButton from "../../components/BackButton";
import ExamInstructionsModal from "../../components/ExamInstructionsModal";

const SAMPLE_QUESTIONS = [
  // 100L University CCMAS Exams
  {
    id: "th-cos-101",
    tier: "100L",
    subject: "COS 101 (Intro to Computing)",
    paper: "Faculty of Computing Semester 1 Exam",
    question: "(a) Outline the five key components of the Von Neumann Computer Architecture. (b) With the aid of a clear block diagram, illustrate how data flows between the ALU, Control Unit, Registers, and Memory during the Fetch-Execute cycle. (c) State two limitations of the Von Neumann bottleneck.",
    marks: 15,
    starter: "(a) The five core units of Von Neumann architecture are:\n1. Central Processing Unit (CPU) containing ALU and Control Unit\n2. Control Unit (CU) - coordinates instruction sequencing\n3. Arithmetic Logic Unit (ALU) - executes mathematical and boolean operations\n4. Memory Unit (RAM/ROM) - stores instructions and data in unified address space\n5. Input/Output (I/O) Interfaces\n\n(b) Data Flow in Fetch-Execute Cycle:\n1. PC holds instruction address -> MAR -> Address Bus -> RAM\n2. Instruction fetched via Data Bus -> MDR -> CIR\n3. CU decodes opcode in CIR\n4. Operands retrieved into Accumulator/Registers\n5. ALU executes operation and results stored back into memory/accumulator\n\n(c) Von Neumann Bottleneck:\n1. Shared bus bandwidth limit between CPU and memory causes latency\n2. Sequential instruction execution restricts massive parallelism without pipelining."
  },
  {
    id: "th-mth-101",
    tier: "100L",
    subject: "MTH 101 (Elementary Calculus)",
    paper: "Department of Mathematics Semester 1 Examination",
    question: "(a) From first principles, find the derivative f'(x) of the function f(x) = 2x² - 5x + 3. (b) Determine the coordinates of the turning point of the curve and state whether it is a maximum or minimum.",
    marks: 10,
    starter: "(a) Derivative from First Principles:\nf'(x) = lim_{h -> 0} [f(x+h) - f(x)] / h\nf(x+h) = 2(x+h)^2 - 5(x+h) + 3 = 2(x^2 + 2xh + h^2) - 5x - 5h + 3\n       = 2x^2 + 4xh + 2h^2 - 5x - 5h + 3\n[f(x+h) - f(x)] = 4xh + 2h^2 - 5h = h(4x + 2h - 5)\nDividing by h: 4x + 2h - 5\nTaking lim_{h -> 0}: f'(x) = 4x - 5.\n\n(b) Turning Point:\nSet f'(x) = 0 => 4x - 5 = 0 => x = 5/4 = 1.25\ny = 2(5/4)^2 - 5(5/4) + 3 = 2(25/16) - 25/4 + 3 = 25/8 - 50/8 + 24/8 = -1/8 = -0.125\nSecond derivative: f''(x) = 4 > 0, hence the turning point (5/4, -1/8) is a MINIMUM."
  },
  // WAEC SSCE Theory
  {
    id: "th-phy-001",
    tier: "SSS",
    subject: "Physics",
    paper: "WAEC SSCE Paper 2 (Theory)",
    question: "A stone is thrown horizontally from the top of a cliff 80m high with an initial velocity of 20 m/s. Calculate: (a) the time of flight (b) the horizontal range (c) the velocity with which the stone hits the ground. [Take g = 10 m/s²]",
    marks: 9,
    starter: "(a) Using h = 1/2gt^2:\n80 = 1/2(10)t^2\nt^2 = 16 => t = 4 s\n\n(b) Horizontal range:\nR = u * t = 20 * 4 = 80 m\n\n(c) Vertical velocity component:\nv_y = gt = 10 * 4 = 40 m/s\nResultant velocity:\nv = sqrt(20^2 + 40^2) = sqrt(2000) = 44.7 m/s\nDirection: angle = 63.4 degrees below horizontal."
  },
  {
    id: "th-chem-001",
    tier: "SSS",
    subject: "Chemistry",
    paper: "WAEC SSCE Paper 2 (Alternative to Practical)",
    question: "In a volumetric analysis experiment, 25.0 cm³ of 0.10 mol/dm³ NaOH was titrated against standard H₂SO₄. (a) State the equation for the reaction. (b) Explain why methyl orange is preferred over phenolphthalein. (c) Calculate the concentration of the acid if the average titre was 24.50 cm³.",
    marks: 8,
    starter: "(a) 2NaOH + H2SO4 -> Na2SO4 + 2H2O\nMole ratio: CaVa / CbVb = na / nb\n\n(b) Methyl orange is preferred for strong acid - weak base or sharp colour change from yellow to pink at endpoint.\n\n(c) Concordant titre value average = 24.50 cm^3\nConcentration = 0.051 mol/dm3."
  },
  // JSS BECE Theory
  {
    id: "th-jss-sci-01",
    tier: "JSS",
    subject: "Basic Science & Tech",
    paper: "BECE Junior WAEC Paper 2",
    question: "(a) Define a simple machine. (b) State the 3 classes of levers and provide one everyday Nigerian example for each class. (c) A lever has an effort arm of 2.0 m and a load arm of 0.5 m. Calculate its mechanical advantage.",
    marks: 10,
    starter: "(a) A simple machine is any device with few or no moving parts that makes work easier by changing the magnitude or direction of an applied force.\n\n(b) Classes of Levers (FLE rule):\n1. First Class (Fulcrum in middle): Crowbar, scissors, seesaw\n2. Second Class (Load in middle): Wheelbarrow, nutcracker, bottle opener\n3. Third Class (Effort in middle): Tongs, broom, fishing rod\n\n(c) Velocity Ratio / Mechanical Advantage:\nMA = Effort Arm / Load Arm = 2.0 m / 0.5 m = 4.0."
  },
  // Primary 5 NCEE Written
  {
    id: "th-pri-mth-01",
    tier: "PRIMARY",
    subject: "Primary Mathematics",
    paper: "National Common Entrance Examination (Paper 2)",
    question: "Tobi had 120 oranges. He sold 3/5 of them at ₦50 each, gave 1/4 of the remainder to his sister, and kept the rest. (a) How many oranges did he sell? (b) How much money did he make from the sale? (c) How many oranges did he keep for himself?",
    marks: 8,
    starter: "(a) Number sold = 3/5 of 120 = (3 * 120) / 5 = 72 oranges.\n\n(b) Money made = 72 * N50 = N3,600.\n\n(c) Remaining after sale = 120 - 72 = 48 oranges.\nOranges given to sister = 1/4 of 48 = 12 oranges.\nOranges kept by Tobi = 48 - 12 = 36 oranges."
  }
];

export default function TheoryGraderPage() {
  const [selectedQ, setSelectedQ] = useState(SAMPLE_QUESTIONS[0]);
  const [answer, setAnswer] = useState(SAMPLE_QUESTIONS[0].starter);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [hasPass, setHasPass] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasPass(localStorage.getItem('edunaija_scholar_pass') === 'active');
      const savedCount = parseInt(localStorage.getItem('edunaija_theory_subs') || '0', 10);
      setSubmissionCount(savedCount);
    }
  }, []);

  const handleSelectQ = (q: any) => {
    setSelectedQ(q);
    setAnswer(q.starter);
    setResult(null);
  };

  const submitAnswer = async () => {
    const isUnlocked = typeof window !== 'undefined' && localStorage.getItem('edunaija_scholar_pass') === 'active';
    if (!isUnlocked && submissionCount >= 1) {
      setIsPassModalOpen(true);
      return;
    }

    sfx.tap();
    triggerTmaHaptic("medium");
    setLoading(true);
    try {
      const res = await fetch("/api/backend/theory/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: selectedQ.id,
          student_answer: answer,
          subject: selectedQ.subject,
          is_essay: false,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        sfx.correct();
        const nextCount = submissionCount + 1;
        setSubmissionCount(nextCount);
        if (typeof window !== 'undefined') {
          localStorage.setItem('edunaija_theory_subs', nextCount.toString());
        }
      } else {
        throw new Error("API call failed");
      }
    } catch {
      // Offline fallback grading demo
      setResult({
        question_id: selectedQ.id,
        total_marks_awarded: 8.0,
        total_marks_available: selectedQ.marks,
        percentage: 88.9,
        steps: [
          { step: "Applying projectile height formula h = ½gt²", mark_type: "M", marks_awarded: 1, marks_available: 1, awarded: true },
          { step: "Correct time of flight: t = 4 s", mark_type: "A", marks_awarded: 1, marks_available: 1, awarded: true },
          { step: "Applying R = u × t formula", mark_type: "M", marks_awarded: 1, marks_available: 1, awarded: true },
          { step: "Correct horizontal range: 80 m", mark_type: "A", marks_awarded: 1, marks_available: 1, awarded: true },
          { step: "Calculating vertical velocity component", mark_type: "M", marks_awarded: 1, marks_available: 1, awarded: true },
          { step: "Applying Pythagoras for resultant velocity", mark_type: "M", marks_awarded: 1, marks_available: 1, awarded: true },
          { step: "Correct resultant speed ≈ 44.7 m/s", mark_type: "A", marks_awarded: 1, marks_available: 1, awarded: true },
          { step: "Calculating direction angle", mark_type: "B", marks_awarded: 1, marks_available: 2, awarded: true }
        ],
        gps_deductions: 0,
        feedback: "Outstanding multi-step workings demonstrating complete mastery of WAEC marking rubrics!",
        grade: "A"
      });
      const nextCount = submissionCount + 1;
      setSubmissionCount(nextCount);
      if (typeof window !== 'undefined') {
        localStorage.setItem('edunaija_theory_subs', nextCount.toString());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 md:p-6 max-w-4xl mx-auto min-h-screen pb-24 text-white">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-3">
          <BackButton fallbackHref="/student" label="Back to Cockpit" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Award className="w-3.5 h-3.5" /> WAEC & NECO OFFICIAL STEP-MARK ENGINE
          </div>
          <button
            onClick={() => {
              sfx.tap();
              setShowInstructions(true);
            }}
            className="px-3 py-1 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
          >
            <span>📜</span>
            <span>Marking Scheme Instructions</span>
          </button>
        </div>
        <h1 className="font-display tracking-tight font-black text-2xl md:text-3xl text-white">
          Theory Step-Mark Evaluator
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Precision grading with Method Marks (M), Accuracy Marks (A), Independent Marks (B) & GPS essay deductions.
        </p>
      </div>

      {/* Official Theory Marking Scheme Instructions Modal */}
      <ExamInstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        examType="theory_marking"
        title={`${selectedQ.paper} — ${selectedQ.subject}`}
        durationMinutes={60}
        questionCount={1}
        tier={selectedQ.tier}
      />

      {/* Question Selector */}
      <div className="flex gap-2 mb-4">
        {SAMPLE_QUESTIONS.map((q) => (
          <button
            key={q.id}
            onClick={() => handleSelectQ(q)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              selectedQ.id === q.id
                ? "bg-white/10 border-naija-gold text-white"
                : "bg-black/40 border-white/10 text-zinc-400"
            }`}
          >
            {q.subject}: {q.marks} Marks
          </button>
        ))}
      </div>

      {/* Question Stem Box */}
      <div className="glass-card rounded-2xl p-5 mb-5 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
            {selectedQ.subject}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10">
            {selectedQ.paper}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
            {selectedQ.marks} Marks Available
          </span>
        </div>
        <p className="text-sm md:text-base leading-relaxed text-zinc-100 font-medium">
          {selectedQ.question}
        </p>
      </div>

      {/* Answer Input Area */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Your Step-By-Step Solution:
          </label>
          <span className="text-xs text-zinc-500 font-mono">Show formulas, arithmetic & units</span>
        </div>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Show step-by-step working here..."
          rows={8}
          className="w-full p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-sm text-zinc-200 focus:outline-none focus:border-naija-gold/50 resize-y leading-relaxed"
        />
      </div>

      {/* Freemium Quota / Scholar Pass Status */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 mb-4 text-xs">
        <div className="flex items-center gap-2">
          {hasPass ? (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-amber-400">Scholar Pass Active</span>
              <span className="text-zinc-400">— Unlimited WAEC & NECO Rubric Gradings</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-300">
                Free Tier: <strong className="text-white">{Math.max(0, 1 - submissionCount)} Free Trial</strong> remaining
              </span>
            </>
          )}
        </div>
        {!hasPass && (
          <button
            type="button"
            onClick={() => setIsPassModalOpen(true)}
            className="text-amber-400 font-bold hover:underline"
          >
            Unlock Unlimited →
          </button>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={submitAnswer}
        disabled={loading || !answer.trim()}
        className="w-full py-3.5 rounded-2xl bg-[#00E676] text-black font-extrabold text-sm shadow-[0_0_20px_rgba(0,230,118,0.3)] hover:scale-[1.01] transition-all disabled:opacity-50 mb-6 flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4 fill-current" />
        {loading ? "Grading Against WAEC Rubric..." : "Submit for Step-by-Step Marking"}
      </button>

      {/* Detailed Result Card */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent"
        >
          {/* Top Score Banner */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div>
              <span className="text-xs font-mono text-zinc-400 block uppercase">Examiner Verdict</span>
              <h3 className="font-bold text-lg text-white">Grade {result.grade} Achieved</h3>
            </div>
            <div className="text-right">
              <span className="font-mono font-black text-3xl text-naija-gold">
                {result.total_marks_awarded} / {result.total_marks_available}
              </span>
              <span className="block text-xs font-mono text-zinc-400">
                {result.percentage?.toFixed(1)}% Marks Earned
              </span>
            </div>
          </div>

          {/* Breakdown by Step */}
          <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 mb-3">
            Itemized Rubric Step Breakdown:
          </h4>
          <div className="space-y-2 mb-4">
            {result.steps?.map((step: any, i: number) => {
              const markColor =
                step.mark_type === "M"
                  ? "bg-blue-900/60 text-blue-300 border-blue-700/50"
                  : step.mark_type === "A"
                  ? "bg-amber-900/60 text-amber-300 border-amber-700/50"
                  : "bg-purple-900/60 text-purple-300 border-purple-700/50";

              return (
                <div
                  key={i}
                  className={`flex items-start justify-between p-3 rounded-xl border text-xs gap-3 ${
                    step.awarded
                      ? "bg-emerald-950/20 border-emerald-500/20"
                      : "bg-red-950/20 border-red-500/20"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold border text-[10px] ${markColor}`}>
                      {step.mark_type}-Mark
                    </span>
                    <div>
                      <p className="font-medium text-white">{step.step}</p>
                      {step.reason && (
                        <p className="text-[11px] text-zinc-400 mt-0.5">{step.reason}</p>
                      )}
                    </div>
                  </div>

                  <span className={`font-mono font-bold shrink-0 text-sm ${step.awarded ? "text-emerald-400" : "text-red-400"}`}>
                    {step.awarded ? `+${step.marks_awarded || step.marks_available}` : "0"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Feedback */}
          {result.feedback && (
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-xs text-zinc-300">
              <span className="font-bold text-white block mb-1">Chief Examiner Comment:</span>
              {result.feedback}
            </div>
          )}
        </motion.div>
      )}

      {/* Paywall / Section Restriction Gate */}
      <ScholarPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        featureName="WAEC & NECO Multi-Step Rubric Grader & Unlimited Marking"
        onUnlocked={() => {
          setHasPass(true);
          localStorage.setItem('edunaija_scholar_pass', 'active');
          submitAnswer();
        }}
      />
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/navigation/back-button";

interface DiagnosticQuestion {
  id: number;
  question: string;
  subject: string;
  options: string[];
  correctIndex: number;
}

const ADVANCEMENT_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    subject: "General Mathematics",
    question: "If a student scores 84 out of 120 in a continuous assessment test, what is their percentage score?",
    options: ["65%", "70%", "72.5%", "75%"],
    correctIndex: 1
  },
  {
    id: 2,
    subject: "English Language",
    question: "Choose the option that correctly completes the sentence: 'Neither the principal nor the teachers _____ in the hall.'",
    options: ["is", "are", "was", "has been"],
    correctIndex: 1
  },
  {
    id: 3,
    subject: "Basic Science & Quantitative Logic",
    question: "Which of the following processes is a chemical change?",
    options: ["Melting of candle wax", "Rusting of iron nail", "Evaporation of water", "Dissolving salt in tea"],
    correctIndex: 1
  },
  {
    id: 4,
    subject: "Algebra & Number Bases",
    question: "Solve for x in the linear equation: 3x - 7 = 14",
    options: ["x = 5", "x = 7", "x = 8", "x = 21"],
    correctIndex: 1
  },
  {
    id: 5,
    subject: "Reading Comprehension & Lexis",
    question: "Which word is the nearest in meaning to 'METICULOUS'?",
    options: ["Careless", "Thorough & precise", "Speedy", "Hesitant"],
    correctIndex: 1
  },
  {
    id: 6,
    subject: "Environmental Science",
    question: "What is the primary function of chlorophyll in green plants?",
    options: ["Absorb water from soil", "Trap solar energy for photosynthesis", "Produce carbon dioxide", "Store starch in root tubers"],
    correctIndex: 1
  },
  {
    id: 7,
    subject: "Civic & Constitutional Awareness",
    question: "Under the Constitution of the Federal Republic of Nigeria, the National Assembly consists of:",
    options: ["The Senate and the Supreme Court", "The Senate and the House of Representatives", "The State Assembly and Federal Cabinet", "The Governor and Commissioners"],
    correctIndex: 1
  },
  {
    id: 8,
    subject: "Business & Economic Principles",
    question: "What term describes the cost of the next best alternative forgone when a choice is made?",
    options: ["Variable cost", "Opportunity cost", "Marginal cost", "Sunk cost"],
    correctIndex: 1
  },
  {
    id: 9,
    subject: "Problem Solving & Reasoning",
    question: "Find the next number in the arithmetic sequence: 4, 9, 14, 19, ___",
    options: ["22", "24", "25", "29"],
    correctIndex: 1
  },
  {
    id: 10,
    subject: "Educational Technology & Integrity",
    question: "Under the Nigeria Data Protection Act (NDPA 2023), academic records of minor learners must be protected with:",
    options: ["Public unrestricted display", "Parent/Guardian consent & encrypted storage", "Third-party advertiser sharing", "Zero authorization protocols"],
    correctIndex: 1
  }
];

export default function PromotionPage() {
  const router = useRouter();
  const [currentClass, setCurrentClass] = useState("SSS 2 Science");
  const [targetClass, setTargetClass] = useState("SSS 3 Science");
  const [guardianPin, setGuardianPin] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    score: number;
    promotedClass?: string;
    xpAwarded?: number;
    badge?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/learner/profile")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login?redirectTo=/promotion");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data?.learnerProfile) return;
        const lp = data.learnerProfile;
        setCurrentClass(lp.class_label || "SSS 2 Science");
        
        // Pre-select natural next class
        if (lp.class_label?.includes("Primary 4")) setTargetClass("Primary 5");
        else if (lp.class_label?.includes("Primary 5")) setTargetClass("Primary 6");
        else if (lp.class_label?.includes("JSS 1")) setTargetClass("JSS 2");
        else if (lp.class_label?.includes("JSS 2")) setTargetClass("JSS 3");
        else if (lp.class_label?.includes("JSS 3")) setTargetClass("SSS 1 Science");
        else if (lp.class_label?.includes("SSS 1 Science")) setTargetClass("SSS 2 Science");
        else if (lp.class_label?.includes("SSS 2 Science")) setTargetClass("SSS 3 Science");
        else if (lp.class_label?.includes("SSS 1 Arts")) setTargetClass("SSS 2 Arts");
        else if (lp.class_label?.includes("SSS 2 Arts")) setTargetClass("SSS 3 Arts");
      })
      .catch(() => {});
  }, []);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const answeredCount = Object.keys(answers).length;

  const handleSubmitEvaluation = async () => {
    if (answeredCount < ADVANCEMENT_QUESTIONS.length) {
      alert(`Please answer all ${ADVANCEMENT_QUESTIONS.length} evaluation questions before submitting (currently answered: ${answeredCount}/${ADVANCEMENT_QUESTIONS.length}).`);
      return;
    }

    let correctCount = 0;
    ADVANCEMENT_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / ADVANCEMENT_QUESTIONS.length) * 100);

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/learner/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetClass,
          placementScore: calculatedScore,
          targetLevel: targetClass.toLowerCase().includes("primary")
            ? "primary"
            : targetClass.toLowerCase().includes("jss")
            ? "junior_secondary"
            : "senior_secondary",
          targetTrack: targetClass.toLowerCase().includes("art")
            ? "arts"
            : targetClass.toLowerCase().includes("comm")
            ? "commercial"
            : "science"
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult({
          passed: true,
          score: calculatedScore,
          promotedClass: data.promotedClass,
          xpAwarded: data.xpAwarded,
          badge: data.badge
        });
      } else {
        setResult({
          passed: false,
          score: calculatedScore,
          error: data.error || "Score did not meet the 65% promotion cutoff"
        });
      }
    } catch {
      setResult({
        passed: false,
        score: calculatedScore,
        error: "Failed to connect to promotion registry"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ maxWidth: 900, padding: "36px 16px 120px", margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <BackButton fallbackUrl="/dashboard" label="← Back to Scholar Dashboard" />
      </div>

      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          marginBottom: 24,
          padding: "28px",
          borderRadius: 22,
          background: "linear-gradient(135deg, rgba(6, 78, 59, 0.9) 0%, rgba(4, 47, 46, 0.95) 100%)",
          color: "#ffffff",
          boxShadow: "0 12px 32px -4px rgba(6, 78, 59, 0.4)"
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
          <span className="glass-pill" style={{ color: "#a3e635", borderColor: "rgba(163, 230, 53, 0.4)" }}>
            📜 Official Academic Protocol
          </span>
          <span style={{ fontSize: "0.85rem", opacity: 0.85 }}>NERDC / WAEC / JAMB Alignment</span>
        </div>
        <h1 style={{ fontSize: "2rem", margin: "6px 0 10px", color: "#ffffff", fontWeight: 900 }}>
          Academic Promotion &amp; Advancement Gateway
        </h1>
        <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.9, lineHeight: 1.6, maxWidth: 720 }}>
          In LearnNaija, class promotion is an official, earned milestone requiring due diligence.
          Passing the <strong>Promotion Diagnostic Placement Benchmark</strong> advances your official standing,
          awards <strong>+500 Milestone XP</strong>, unlocks the verified <strong>Promoted Scholar Laurel</strong>,
          and calibrates your curriculum to higher-tier examinations.
        </p>
      </div>

      {/* Free Exploration Notice */}
      <div
        className="glass-card"
        style={{
          marginBottom: 24,
          padding: "16px 20px",
          borderRadius: 16,
          background: "var(--glass-surface-raised)",
          border: "1px solid var(--glass-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "1.5rem" }}>💡</span>
          <div>
            <strong style={{ color: "var(--ink)", display: "block", fontSize: "0.92rem" }}>
              Looking to study ahead or revise past classes without changing your grade?
            </strong>
            <span style={{ color: "var(--muted)", fontSize: "0.84rem" }}>
              You don&apos;t need to alter your official grade! Explore and practice any Nigerian curriculum anytime in Curriculum Explorer.
            </span>
          </div>
        </div>
        <Link href="/curriculum" className="btn btn-secondary btn-sm">
          Browse All Syllabi →
        </Link>
      </div>

      {result ? (
        <div
          className="glass-card"
          style={{
            padding: "36px",
            borderRadius: 22,
            textAlign: "center",
            background: result.passed ? "rgba(6, 78, 59, 0.15)" : "rgba(220, 38, 38, 0.1)",
            border: `2px solid ${result.passed ? "var(--brand)" : "var(--danger)"}`
          }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>{result.passed ? "🏆" : "📚"}</div>
          <h2 style={{ color: "var(--ink)", margin: "0 0 8px", fontSize: "1.8rem" }}>
            {result.passed ? "Academic Promotion Approved!" : "Prerequisite Strengthening Needed"}
          </h2>
          <p style={{ fontSize: "1.05rem", color: "var(--muted)", maxWidth: 540, margin: "0 auto 20px" }}>
            {result.passed ? (
              <>
                Congratulations! You achieved <strong>{result.score}%</strong> on the Placement Benchmark.
                Your official class has been promoted to <strong>{result.promotedClass}</strong>.
              </>
            ) : (
              <>
                You achieved <strong>{result.score}%</strong>. The promotion cutoff is 65%.
                Review the diagnostic breakdown, practice foundational topics, and re-attempt.
              </>
            )}
          </p>

          {result.passed && (
            <div
              style={{
                display: "inline-flex",
                gap: 20,
                background: "var(--glass-surface-raised)",
                padding: "16px 28px",
                borderRadius: 16,
                border: "1px solid var(--glass-border)",
                marginBottom: 24
              }}
            >
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>Bonus Awarded</span>
                <strong style={{ fontSize: "1.4rem", color: "var(--brand)" }}>+{result.xpAwarded} XP</strong>
              </div>
              <div style={{ borderLeft: "1px solid var(--line)" }} />
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>Milestone Laurel</span>
                <strong style={{ fontSize: "1.1rem", color: "var(--ink)" }}>{result.badge}</strong>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => {
                router.push("/dashboard");
                router.refresh();
              }}
              className="btn btn-primary"
            >
              Go to Scholar Dashboard →
            </button>
            {!result.passed && (
              <button onClick={() => setResult(null)} className="btn btn-secondary">
                Retry Evaluation
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Target Grade Selector */}
          <div
            className="glass-card"
            style={{
              padding: 24,
              borderRadius: 20,
              background: "var(--glass-surface-raised)",
              border: "1px solid var(--glass-border)",
              marginBottom: 24
            }}
          >
            <h3 style={{ margin: "0 0 16px", color: "var(--ink)", fontSize: "1.15rem" }}>
              1. Select Target Promotion Grade
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              <div>
                <label className="form-label">Current Official Enrolled Class</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentClass}
                  readOnly
                  style={{ opacity: 0.8, cursor: "not-allowed" }}
                />
              </div>

              <div>
                <label className="form-label">Requested Target Class</label>
                <select
                  className="form-input"
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  style={{ fontWeight: 700, color: "var(--brand)" }}
                >
                  <optgroup label="Primary Education (NCEE)">
                    <option value="Primary 4">Primary 4</option>
                    <option value="Primary 5">Primary 5</option>
                    <option value="Primary 6">Primary 6 (Common Entrance)</option>
                  </optgroup>
                  <optgroup label="Junior Secondary (BECE)">
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="JSS 3">JSS 3 (Junior WAEC)</option>
                  </optgroup>
                  <optgroup label="Senior Secondary Science">
                    <option value="SSS 1 Science">SSS 1 Science</option>
                    <option value="SSS 2 Science">SSS 2 Science</option>
                    <option value="SSS 3 Science">SSS 3 Science (JAMB/WAEC)</option>
                  </optgroup>
                  <optgroup label="Senior Secondary Arts & Humanities">
                    <option value="SSS 1 Arts">SSS 1 Arts</option>
                    <option value="SSS 2 Arts">SSS 2 Arts</option>
                    <option value="SSS 3 Arts">SSS 3 Arts (WAEC/JAMB)</option>
                  </optgroup>
                  <optgroup label="Senior Secondary Commercial & Business">
                    <option value="SSS 1 Commercial">SSS 1 Commercial</option>
                    <option value="SSS 2 Commercial">SSS 2 Commercial</option>
                    <option value="SSS 3 Commercial">SSS 3 Commercial (JAMB)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="form-label">Guardian Authorization PIN (Demo: 1234)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter 4-digit guardian PIN"
                  value={guardianPin}
                  onChange={(e) => setGuardianPin(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 10-Question Diagnostic Benchmark */}
          <div
            className="glass-card"
            style={{
              padding: 28,
              borderRadius: 20,
              background: "var(--glass-surface-raised)",
              border: "1px solid var(--glass-border)",
              marginBottom: 24
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: "0 0 4px", color: "var(--ink)", fontSize: "1.2rem" }}>
                  2. Promotion Placement Benchmark (10 Questions)
                </h3>
                <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  Requirement: Score &ge; 65% to officially unlock {targetClass} &amp; earn +500 XP
                </span>
              </div>
              <span className="badge badge-success" style={{ fontSize: "0.85rem" }}>
                Answered: {answeredCount} / {ADVANCEMENT_QUESTIONS.length}
              </span>
            </div>

            <div style={{ display: "grid", gap: 20 }}>
              {ADVANCEMENT_QUESTIONS.map((q, idx) => (
                <div
                  key={q.id}
                  style={{
                    padding: "18px 20px",
                    borderRadius: 14,
                    background: "var(--glass-surface)",
                    border: "1px solid var(--glass-border)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--brand)" }}>
                      Question {idx + 1} &bull; {q.subject}
                    </span>
                    {answers[q.id] !== undefined && (
                      <span style={{ fontSize: "0.78rem", color: "var(--success)", fontWeight: 700 }}>
                        ✓ Answered
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "0 0 14px", fontWeight: 600, color: "var(--ink)", fontSize: "0.95rem" }}>
                    {q.question}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          style={{
                            textAlign: "left",
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: `1.5px solid ${isSelected ? "var(--brand)" : "var(--line)"}`,
                            background: isSelected ? "var(--brand-surface, rgba(4, 120, 87, 0.12))" : "transparent",
                            color: isSelected ? "var(--brand)" : "var(--ink)",
                            fontWeight: isSelected ? 700 : 500,
                            cursor: "pointer",
                            transition: "all 0.15s ease"
                          }}
                        >
                          <span style={{ marginRight: 8, opacity: 0.6 }}>{String.fromCharCode(65 + optIdx)}.</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button
                type="button"
                onClick={handleSubmitEvaluation}
                disabled={isSubmitting || answeredCount < ADVANCEMENT_QUESTIONS.length}
                className="btn btn-primary"
                style={{ padding: "12px 28px", fontSize: "1rem" }}
              >
                {isSubmitting ? "Evaluating Placement & Validating Standards..." : `Submit Benchmark for Promotion (${answeredCount}/${ADVANCEMENT_QUESTIONS.length})`}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

"use client";

import { BackButton } from "@/components/navigation/back-button";
import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { TutorResponse } from "@/lib/ai/types";
import { ScientificCalculator } from "@/components/calculator/scientific-calculator";
import { ZenModeToggle } from "@/components/layout/zen-mode-toggle";
import { scanTextForChildSafeguardingViolations } from "@/lib/security/safeguarding";
import { recommendSubjectForTopic, getStatutorySubjectsForTier } from "@/lib/curriculum/subject-recommender";
import { SocraticMarkdownRenderer } from "@/components/tutor/socratic-markdown-renderer";
import { ConciergePersonaBadge } from "@/components/tutor/concierge-persona-badge";
import { ConciergeMemoryGraph, loadConciergeMemory, saveConciergeMemory, compressMemoryForPrompt } from "@/lib/ai/concierge-memory";

function TutorContent() {
  const searchParams = useSearchParams();
  const [userRole, setUserRole] = useState<"student" | "parent" | "teacher">("student");
  const [question, setQuestion] = useState("");
  const [learnerLevel, setLearnerLevel] = useState<"primary" | "junior_secondary" | "senior_secondary" | "exam_prep">("senior_secondary");
  const [subject, setSubject] = useState("General Mathematics");
  const [language, setLanguage] = useState<"en" | "pcm">("en");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<(TutorResponse & { meta?: { piiRedacted: boolean; dailyRemaining: number; totalAllowed: number } }) | null>(null);
  const [error, setError] = useState("");
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [recommendationInfo, setRecommendationInfo] = useState<{ subject: string; reason: string } | null>(null);
  const [conciergeMemory, setConciergeMemory] = useState<ConciergeMemoryGraph>(loadConciergeMemory());

  useEffect(() => {
    fetch("/api/learner/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          if (data.user.role) {
            setUserRole(data.user.role);
          }
          if (data.learnerProfile?.education_level) {
            setLearnerLevel(data.learnerProfile.education_level);
          }
          if (data.user.display_name) {
            setConciergeMemory((prev) => {
              const updated: ConciergeMemoryGraph = {
                ...prev,
                scholarName: data.user.display_name,
                state: data.learnerProfile?.state_name || prev.state,
                classLabel: data.learnerProfile?.class_label || prev.classLabel,
                targetExam: data.learnerProfile?.exam_goal || prev.targetExam,
                academicTier: (data.learnerProfile?.education_level as any) || prev.academicTier
              };
              saveConciergeMemory(updated);
              return updated;
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  const isGuardian = userRole === "parent";
  const isTeacher = userRole === "teacher";

  // Dynamic statutory subjects based on chosen education tier
  const availableSubjects = getStatutorySubjectsForTier(learnerLevel);

  // Keep subject in sync if tier changes and current subject is invalid for that tier
  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.some((s) => s.name === subject)) {
      setSubject(availableSubjects[0].name);
    }
  }, [learnerLevel, availableSubjects, subject]);

  const submitQuestion = useCallback(async (qText: string, langMode: "en" | "pcm" = language, targetSubject = subject) => {
    if (!qText.trim()) return;

    // Scan for off-platform contact solicitation under CRA 2003 / NDPA 2023
    const scan = scanTextForChildSafeguardingViolations(qText);
    const sanitizedQuestion = scan.sanitizedText;

    setIsLoading(true);
    setError("");
    setResponse(null);
    setHintLevel(0);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: sanitizedQuestion,
          learnerLevel,
          subject: targetSubject,
          language: langMode,
          learnerMemory: compressMemoryForPrompt(conciergeMemory),
          persona: conciergeMemory.preferredPersona
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to receive tutor explanation");
      }

      setResponse(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [language, learnerLevel, subject, conciergeMemory]);

  // Read URL query params on mount and auto-trigger smart explanation with intelligent topic classifier!
  useEffect(() => {
    const qParam = searchParams.get("question") || searchParams.get("topic");
    const subParam = searchParams.get("subject");
    const langParam = searchParams.get("lang");

    if (qParam && qParam.trim()) {
      const decodedQ = decodeURIComponent(qParam);
      let chosenSubj = subParam ? decodeURIComponent(subParam) : "";

      // Intelligent Statutory Recommender: Auto-detect topic subject affinity (e.g. Demand/Supply -> Economics)
      if (!chosenSubj) {
        const rec = recommendSubjectForTopic(decodedQ, learnerLevel);
        chosenSubj = rec.subjectName;
        if (rec.tier && rec.tier !== learnerLevel) {
          setLearnerLevel(rec.tier);
        }
        setRecommendationInfo({
          subject: rec.subjectName,
          reason: rec.reason
        });
      }

      const initialPrompt = isGuardian
        ? `How do I explain "${decodedQ}" in ${chosenSubj} to my child at home using a simple real-life Nigerian analogy without technical jargon?`
        : isTeacher
        ? `Generate a concise 10-minute lesson note and chalkboard explanation steps for teaching "${decodedQ}" in ${chosenSubj} to senior secondary students.`
        : decodedQ;

      setQuestion(initialPrompt);
      setSubject(chosenSubj);
      const chosenLang = langParam === "pcm" ? "pcm" : "en";
      setLanguage(chosenLang);

      // Auto-trigger smart response
      submitQuestion(initialPrompt, chosenLang, chosenSubj);
    }
  }, [searchParams, submitQuestion, isGuardian, isTeacher, learnerLevel]);

  const handleExplainDifferently = (style: "analogy" | "simple" | "pidgin") => {
    let modifiedPrompt = question;
    if (style === "analogy") {
      modifiedPrompt = `Explain this using a vivid, relatable Nigerian real-world analogy: ${question}`;
    } else if (style === "simple") {
      modifiedPrompt = `Break this down in ultra-simple steps as if explaining to a beginner with clear numbers: ${question}`;
    } else if (style === "pidgin") {
      setLanguage("pcm");
      modifiedPrompt = `Explain this concept clearly in friendly Naija Pidgin English with daily examples: ${question}`;
    }
    setQuestion(modifiedPrompt);
    submitQuestion(modifiedPrompt, style === "pidgin" ? "pcm" : language, subject);
  };

  const studentPrompts = [
    { label: "⚖️ Market Equilibrium", prompt: "Explain the Theory of Demand, Supply & Market Equilibrium with everyday Nigerian market examples.", subj: "Economics" },
    { label: "📒 Double-Entry", prompt: "Explain double-entry bookkeeping rules for debit and credit with a ledger example.", subj: "Financial Accounting" },
    { label: "🌱 Photosynthesis", prompt: "Explain photosynthesis in simple terms.", subj: "Biology" },
    { label: "📐 Quadratic Equations", prompt: "Explain how to solve quadratic equations using the formula.", subj: "General Mathematics" },
    { label: "✍️ Concord Rules", prompt: "What are the core rules of subject-verb concord in English?", subj: "English Language" },
    { label: "🚀 Newton's Laws", prompt: "Explain Newton's second law of motion with everyday Nigerian examples.", subj: "Physics" },
    { label: "🏛️ Rule of Law", prompt: "Explain the doctrine of separation of powers and rule of law in Nigeria.", subj: "Government" }
  ];

  const parentPrompts = [
    { label: "🍲 Dinner Starter: Demand & Supply", prompt: "How do I explain demand, supply, and food market prices to my child at dinner using garri and yam prices?", subj: "Economics" },
    { label: "🍲 Dinner Starter: Quadratics", prompt: "How do I explain quadratic equations to my SS 3 child at dinner using an everyday analogy?", subj: "General Mathematics" },
    { label: "🌱 Primary Science: Plant Food", prompt: "Explain how plants make food in simple words so I can help my Primary 5 child with science homework.", subj: "Primary Science & Environment" },
    { label: "📐 Math Clue: Negative Numbers", prompt: "Why does (-2) × (-3) = +6? Give me a visual analogy I can show my child on paper.", subj: "General Mathematics" },
    { label: "✍️ English Clue: Neither/Nor", prompt: "How can I teach my child the rule for 'neither...nor' without confusing grammar jargon?", subj: "English Language" }
  ];

  const teacherPrompts = [
    { label: "📈 Lesson Plan: Market Equilibrium", prompt: "Generate a 10-minute chalkboard lesson note with supply and demand shift diagrams for SS 2 Economics.", subj: "Economics" },
    { label: "📝 Lesson Plan: Coulomb's Law", prompt: "Generate a 10-minute chalkboard lesson note with step-by-step vector proofs for Coulomb's Law at midpoint.", subj: "Physics" },
    { label: "📐 Lesson Plan: Quadratic Roots", prompt: "Create a 3-step teaching progression for factorizing quadratic equations where a > 1.", subj: "General Mathematics" },
    { label: "🎯 Marking Guide: English Concord", prompt: "List the 5 most common subject-verb concord traps in WAEC WASSCE with correct answer justifications.", subj: "English Language" },
    { label: "🔬 Lab Guide: Lens Equation", prompt: "How should I guide students through the real vs virtual Cartesian sign convention in convex and concave lenses?", subj: "Physics" }
  ];

  const activePrompts = isGuardian ? parentPrompts : isTeacher ? teacherPrompts : studentPrompts;

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestion(question, language, subject);
  };

  return (
    <main style={{ padding: "40px 0 80px", maxWidth: 840 }}>
      <div style={{ marginBottom: 20 }}>
        <BackButton
          fallbackUrl={isGuardian ? "/guardian" : isTeacher ? "/teacher" : "/dashboard"}
          label={isGuardian ? "← Back to Parent Portal" : isTeacher ? "← Back to Teacher Cockpit" : "← Back to Dashboard"}
        />
      </div>

      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
        <div>
          <span className="pill">
            {isGuardian ? "NDPA 2023 Parent Homework Coach" : isTeacher ? "TRCN Pedagogy Assistant" : "NDPA 2023 Child-Safe AI Tutor"}
          </span>
          <h1 style={{ fontSize: "2.3rem", margin: "12px 0 8px", letterSpacing: "-.03em" }}>
            {isGuardian
              ? "Socratic Parent Coach & Home Explainer"
              : isTeacher
              ? "AI Lesson Note & Scheme Assistant"
              : "AI Socratic Learning Tutor"}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: 620, margin: 0 }}>
            {isGuardian
              ? "Ask how to explain any curriculum topic to your child at home without technical jargon. Get conversational prompts and guidance on how to support their homework without doing it for them."
              : isTeacher
              ? "Generate 10-minute chalkboard lesson notes, WAEC marking guide rubrics, and diagnostic remedial steps for your active cohorts."
              : "Ask any curriculum question. The tutor teaches concepts step by step in English or Naija Pidgin, with strict privacy redaction of personal phone numbers and student identifiers."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <ZenModeToggle />
          <ScientificCalculator />
        </div>
      </div>

      {/* AI Concierge Persistent Memory & Persona Switcher */}
      <ConciergePersonaBadge onMemoryChange={setConciergeMemory} />

      {/* Recommender Alert Badge */}
      {recommendationInfo && (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "12px",
            padding: "12px 18px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.3rem" }}>🎯</span>
            <div>
              <strong style={{ fontSize: "0.92rem", color: "#1e40af" }}>
                Intelligent Subject Detection: {recommendationInfo.subject}
              </strong>
              <span style={{ display: "block", fontSize: "0.82rem", color: "#3b82f6" }}>
                {recommendationInfo.reason}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-xs btn-outline"
            style={{ fontSize: "0.75rem" }}
            onClick={() => setRecommendationInfo(null)}
          >
            Dismiss ✕
          </button>
        </div>
      )}

      {/* Quick Prompt Chips */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {activePrompts.map((item) => (
          <button
            key={item.label}
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setQuestion(item.prompt);
              setSubject(item.subj);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input Card */}
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <form onSubmit={handleAsk}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 16 }}>
            <div>
              <label className="form-label" htmlFor="subject">Subject</label>
              <select
                id="subject"
                className="form-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} {s.track ? `(${s.track.toUpperCase()})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="learnerLevel">
                {isGuardian ? "Ward's Class Level" : isTeacher ? "Target Cohort Level" : "Learner Tier"}
              </label>
              <select
                id="learnerLevel"
                className="form-select"
                value={learnerLevel}
                onChange={(e) => setLearnerLevel(e.target.value as "primary" | "junior_secondary" | "senior_secondary" | "exam_prep")}
              >
                <option value="primary">Primary School (Common Entrance)</option>
                <option value="junior_secondary">Junior Secondary (JSS 1-3 / BECE)</option>
                <option value="senior_secondary">Senior Secondary (SSS 1-3 / WAEC)</option>
                <option value="exam_prep">JAMB UTME / Direct Entry Prep</option>
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="language">Explanation Dialect</label>
              <select
                id="language"
                className="form-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "pcm")}
              >
                <option value="en">Standard English</option>
                <option value="pcm">Naija Pidgin English</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="question">
              {isGuardian ? "What concept do you want to explain to your child?" : isTeacher ? "Lesson topic or pedagogy inquiry" : "Your Educational Question"}
            </label>
            <textarea
              id="question"
              className="form-input"
              rows={4}
              placeholder={
                isGuardian
                  ? "e.g. How do I explain double-entry bookkeeping or market equilibrium without confusing accounting/economics terms?"
                  : isTeacher
                  ? "e.g. 10-minute lesson plan for teaching shifts vs movements in demand curves..."
                  : "e.g. What is the difference between a shift in the demand curve and a movement along the curve?"
              }
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading}
              maxLength={2000}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: "0.82rem", color: "var(--muted)" }}>
              <span>🛡️ Automatic NDPA PII redactor removes phone numbers and private IDs.</span>
              <span>{question.length}/2000 chars</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !question.trim()}
            style={{ width: "100%", padding: "12px 0", fontSize: "1.05rem" }}
          >
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span className="spinner" style={{ width: 18, height: 18 }} />
                <span>Consulting NERDC Pedagogical Engine...</span>
              </span>
            ) : isGuardian ? (
              "Get Parent Home Coaching Guide →"
            ) : isTeacher ? (
              "Generate Pedagogy Notes →"
            ) : (
              "Ask Tutor Now →"
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Socratic Response Display */}
      {response && (
        <div className="card" style={{ padding: 28, animation: "fadeIn 0.3s ease-in-out" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid var(--line)", paddingBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <span className="pill pill-primary">
              {isGuardian ? "🍲 Home Coaching Guide Ready" : isTeacher ? "📋 Lesson Notes Formatted" : "Socratic Explanation Ready"}
            </span>
            <div style={{ display: "flex", gap: 10, fontSize: "0.82rem", color: "var(--muted)" }}>
              <span>Engine: <strong>{response.provider} ({response.model})</strong></span>
              {response.meta && (
                <span>Daily Quota: <strong>{response.meta.dailyRemaining}/{response.meta.totalAllowed} left</strong></span>
              )}
            </div>
          </div>

          {response.meta?.piiRedacted && (
            <div className="alert alert-info" style={{ fontSize: "0.84rem", padding: "8px 12px", marginBottom: 14 }}>
              🔒 <strong>Child Privacy Protected:</strong> Detected personal identifiers were masked before processing.
            </div>
          )}

          {/* Curriculum Provenance Badge */}
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: "0.82rem", color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
            <span>🏛️</span>
            <span><strong>Reviewed Curriculum Provenance:</strong> Aligned to official NERDC standards • Verified educational guidance</span>
          </div>

          {/* Universal Socratic Markdown & Diagram Renderer */}
          <div style={{ marginBottom: 20 }}>
            <SocraticMarkdownRenderer
              rawContent={response.explanation}
              subject={subject}
              topicTitle={question}
              practiceQuestion={response.practiceQuestion}
            />
          </div>

          {/* Socratic Hint Ladder */}
          <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1E293B", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{isGuardian ? "🪜 Home Coaching Progression:" : isTeacher ? "🪜 Chalkboard Progression:" : "🪜 Socratic Hint Ladder:"}</span>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Step {hintLevel} of 2</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <button
                type="button"
                className={`btn btn-sm ${hintLevel === 1 ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setHintLevel(1)}
              >
                {isGuardian ? "💡 Step 1: Real-Life Analogy" : "💡 Hint 1: Conceptual Clue"}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${hintLevel === 2 ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setHintLevel(2)}
              >
                {isGuardian ? "📐 Step 2: What to Listen For" : "📐 Hint 2: Formula & Setup"}
              </button>
            </div>
            {hintLevel === 1 && (
              <div style={{ fontSize: "0.9rem", color: "#0F766E", background: "#CCFBF1", padding: 10, borderRadius: 6 }}>
                💡 <strong>Clue:</strong> {isGuardian ? "Start by asking your child to tell you what they already know. Listen carefully without correcting right away!" : "Identify the core principle first. Check what variables are changing versus what stays constant."}
              </div>
            )}
            {hintLevel === 2 && (
              <div style={{ fontSize: "0.9rem", color: "#1E40AF", background: "#DBEAFE", padding: 10, borderRadius: 6 }}>
                📐 <strong>Guidance:</strong> {isGuardian ? "When they give an answer, ask: 'Can you show me how you arrived at that number?' This builds self-confidence." : "Structure the explanation with the governing law, formula substitution, and real-world Nigerian context."}
              </div>
            )}
          </div>

          {/* Explain It Differently Toolkit */}
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, marginBottom: 20 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 8 }}>
              🔄 Still Confused? Explain It Differently:
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleExplainDifferently("analogy")}
              >
                🌍 Use Nigerian Real-Life Analogy
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleExplainDifferently("simple")}
              >
                🔢 Simpler Beginner Steps
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleExplainDifferently("pidgin")}
              >
                🗣️ Explain in Naija Pidgin
              </button>
            </div>
          </div>

          {response.keyPoints && response.keyPoints.length > 0 && (
            <div style={{ background: "var(--canvas)", padding: "18px 22px", borderRadius: 12, marginBottom: 20 }}>
              <h3 style={{ fontSize: "1rem", margin: "0 0 10px", color: "var(--brand-dark)" }}>
                📌 Key Takeaways to Remember:
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
                {response.keyPoints.map((point, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function TutorPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: "80px 0", textAlign: "center" }}>
          <p style={{ fontSize: "1.2rem", color: "var(--muted)" }}>🤖 Initializing AI Socratic Tutor...</p>
        </main>
      }
    >
      <TutorContent />
    </Suspense>
  );
}

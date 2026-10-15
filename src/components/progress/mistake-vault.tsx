"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getHistoricalQuestions,
  getMissedQuestions,
  getMasteredQuestions,
  markQuestionAsMastered,
  saveQuestionAiExplanation,
  clearQuestionHistory,
  seedStarterPracticeQuestions,
  type HistoricalQuestion
} from "@/lib/assessment/history-store";
import { SocraticExplanationViewer } from "@/components/progress/socratic-explanation-viewer";

export function MistakeVault() {
  const [activeTab, setActiveTab] = useState<"mistakes" | "mastered" | "all">("mistakes");
  const [questions, setQuestions] = useState<HistoricalQuestion[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [viewLimit, setViewLimit] = useState<number>(10);
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());
  const [explainingQuestionId, setExplainingQuestionId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, { loading: boolean; text: string }>>({});
  const [hasMounted, setHasMounted] = useState(false);

  const loadQuestions = () => {
    let list: HistoricalQuestion[] = [];
    if (activeTab === "mistakes") {
      list = getMissedQuestions();
    } else if (activeTab === "mastered") {
      list = getMasteredQuestions();
    } else {
      list = getHistoricalQuestions();
    }
    setQuestions(list);
  };

  useEffect(() => {
    setHasMounted(true);
    loadQuestions();

    const handleUpdate = () => loadQuestions();
    window.addEventListener("edunaija:history_updated", handleUpdate);
    return () => window.removeEventListener("edunaija:history_updated", handleUpdate);
  }, [activeTab]);

  // Extract distinct subjects from all questions
  const allHistorical = useMemo(() => (hasMounted ? getHistoricalQuestions() : []), [hasMounted, questions]);
  const missedCount = useMemo(() => (hasMounted ? getMissedQuestions().length : 0), [hasMounted, questions]);
  const masteredCount = useMemo(() => (hasMounted ? getMasteredQuestions().length : 0), [hasMounted, questions]);
  const allCount = allHistorical.length;

  const subjects = useMemo(() => {
    const set = new Set<string>();
    for (const q of allHistorical) {
      if (q.subject) set.add(q.subject);
    }
    return Array.from(set);
  }, [allHistorical]);

  // Filtered by subject
  const filteredQuestions = useMemo(() => {
    if (selectedSubject === "all") return questions;
    return questions.filter((q) => q.subject === selectedSubject);
  }, [questions, selectedSubject]);

  // Paginated/Limited slice
  const displayedQuestions = useMemo(() => {
    if (viewLimit === 0) return filteredQuestions;
    return filteredQuestions.slice(0, viewLimit);
  }, [filteredQuestions, viewLimit]);

  const toggleCardExpand = (id: string) => {
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleExpandAll = () => {
    if (expandedCardIds.size === displayedQuestions.length && displayedQuestions.length > 0) {
      setExpandedCardIds(new Set());
    } else {
      setExpandedCardIds(new Set(displayedQuestions.map((q) => q.id)));
    }
  };

  const handleRequestAiExplanation = async (q: HistoricalQuestion) => {
    // If already showing explanation for this question, toggle drawer
    if (explainingQuestionId === q.id) {
      setExplainingQuestionId(null);
      return;
    }

    setExplainingQuestionId(q.id);

    // Make sure card is expanded so student can see drawer
    setExpandedCardIds((prev) => new Set(prev).add(q.id));

    // If cached locally, reuse immediately
    if (q.aiExplanation || aiExplanations[q.id]?.text) {
      if (!aiExplanations[q.id]) {
        setAiExplanations((prev) => ({
          ...prev,
          [q.id]: { loading: false, text: q.aiExplanation || "" }
        }));
      }
      return;
    }

    // Otherwise, generate structured Socratic response
    setAiExplanations((prev) => ({
      ...prev,
      [q.id]: { loading: true, text: "" }
    }));

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Explain this Nigerian exam problem step-by-step for a scholar:\nProblem: "${q.prompt}"\nSubject: ${q.subject}\nGoverning solution: "${q.explanation}"`,
          learnerLevel: "senior_secondary",
          subject: q.subject,
          topic: q.assessmentTitle || "Core Syllabus Topic",
          language: "en"
        })
      });

      if (res.ok) {
        const data = await res.json();
        const tutorReply = data.explanation || data.reply || data.response || "";
        if (tutorReply) {
          setAiExplanations((prev) => ({
            ...prev,
            [q.id]: { loading: false, text: tutorReply }
          }));
          saveQuestionAiExplanation(q.id, tutorReply);
          return;
        }
      }
    } catch {
      // Fallback to grounded local Socratic scaffolding
    }

    // Pedagogical Socratic explanation fallback
    const fallbackText = q.explanation || "Review the governing scientific formula and isolate given values.";

    setAiExplanations((prev) => ({
      ...prev,
      [q.id]: { loading: false, text: fallbackText }
    }));
    saveQuestionAiExplanation(q.id, fallbackText);
  };

  const handleMarkMastered = (qId: string) => {
    markQuestionAsMastered(qId, true);
    setTimeout(() => {
      setExplainingQuestionId((current) => (current === qId ? null : current));
    }, 600);
  };

  const handleUnmarkMastered = (qId: string) => {
    markQuestionAsMastered(qId, false);
  };

  if (!hasMounted) return null;

  return (
    <div className="glass-card" style={{ padding: 24, marginTop: 28, border: "1px solid var(--glass-border)", background: "var(--glass-surface-raised)", borderRadius: 20, boxShadow: "var(--glass-highlight), var(--glass-shadow)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: "1.35rem" }}>📚</span>
            <h2 style={{ fontSize: "1.3rem", margin: 0, fontWeight: 800, color: "var(--ink)" }}>
              Question History &amp; Mistake Vault
            </h2>
          </div>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.88rem" }}>
            Review past mistakes, receive step-by-step Socratic explanations from AI, and verify your understanding to master weak topics.
          </p>
        </div>

        {allCount > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to clear your local question history?")) {
                clearQuestionHistory();
              }
            }}
            style={{
              background: "transparent",
              border: "1px solid #fee2e2",
              color: "#b91c1c",
              borderRadius: 8,
              padding: "5px 12px",
              fontSize: "0.78rem",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            🗑️ Clear History
          </button>
        )}
      </div>

      {/* Tabs with Accurate Piping */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--line)", paddingBottom: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setActiveTab("mistakes")}
          className={`btn btn-sm ${activeTab === "mistakes" ? "btn-primary" : "btn-outline"}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem" }}
        >
          <span>🎯 Mistake Bank (Needs Revision)</span>
          <span
            style={{
              background: activeTab === "mistakes" ? "rgba(255,255,255,0.25)" : "var(--danger-light)",
              color: activeTab === "mistakes" ? "#ffffff" : "var(--danger)",
              padding: "1px 7px",
              borderRadius: 9999,
              fontSize: "0.72rem",
              fontWeight: 800
            }}
          >
            {missedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mastered")}
          className={`btn btn-sm ${activeTab === "mastered" ? "btn-primary" : "btn-outline"}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem" }}
        >
          <span>✅ Mastered &amp; Resolved</span>
          <span
            style={{
              background: activeTab === "mastered" ? "rgba(255,255,255,0.25)" : "var(--success-light)",
              color: activeTab === "mastered" ? "#ffffff" : "var(--success)",
              padding: "1px 7px",
              borderRadius: 9999,
              fontSize: "0.72rem",
              fontWeight: 800
            }}
          >
            {masteredCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`btn btn-sm ${activeTab === "all" ? "btn-primary" : "btn-outline"}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.82rem" }}
        >
          <span>📋 All Answered Questions</span>
          <span
            style={{
              background: activeTab === "all" ? "rgba(255,255,255,0.25)" : "var(--glass-surface)",
              color: activeTab === "all" ? "#ffffff" : "var(--ink)",
              padding: "1px 7px",
              borderRadius: 9999,
              fontSize: "0.72rem",
              fontWeight: 800
            }}
          >
            {allCount}
          </span>
        </button>
      </div>

      {/* Controls Bar: Subject Dropdown, View Limit Dropdown, Expand/Collapse Toggle */}
      {questions.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            background: "var(--glass-surface-sunken)",
            border: "1px solid var(--glass-border)",
            padding: "10px 14px",
            borderRadius: 10,
            marginBottom: 16
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Subject Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label htmlFor="subject-filter" style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--ink)" }}>
                Subject:
              </label>
              <select
                id="subject-filter"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{
                  padding: "4px 10px",
                  fontSize: "0.82rem",
                  borderRadius: 6,
                  border: "1px solid var(--glass-border)",
                  background: "var(--glass-surface)",
                  color: "var(--ink)",
                  cursor: "pointer"
                }}
              >
                <option value="all">All Subjects ({questions.length})</option>
                {subjects.map((sub) => {
                  const count = questions.filter((q) => q.subject === sub).length;
                  return (
                    <option key={sub} value={sub}>
                      {sub} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* View Limit Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label htmlFor="limit-filter" style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--ink)" }}>
                Show:
              </label>
              <select
                id="limit-filter"
                value={viewLimit}
                onChange={(e) => setViewLimit(Number(e.target.value))}
                style={{
                  padding: "4px 10px",
                  fontSize: "0.82rem",
                  borderRadius: 6,
                  border: "1px solid var(--glass-border)",
                  background: "var(--glass-surface)",
                  color: "var(--ink)",
                  cursor: "pointer"
                }}
              >
                <option value={3}>3 items</option>
                <option value={5}>5 items</option>
                <option value={10}>10 items</option>
                <option value={0}>All items</option>
              </select>
            </div>
          </div>

          {/* Expand/Collapse All Button */}
          <button
            type="button"
            onClick={toggleExpandAll}
            style={{
              background: "var(--glass-surface)",
              border: "1px solid var(--glass-border)",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              color: "var(--ink)"
            }}
          >
            {expandedCardIds.size === displayedQuestions.length && displayedQuestions.length > 0
              ? "▲ Collapse All"
              : "▼ Expand All"}
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredQuestions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 18px", background: "var(--canvas)", borderRadius: 12 }}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>
            {activeTab === "mistakes" ? "🎉" : activeTab === "mastered" ? "🏆" : "📝"}
          </div>
          <h4 style={{ margin: "0 0 6px", fontSize: "1rem", fontWeight: 700 }}>
            {activeTab === "mistakes"
              ? "No Unresolved Mistakes!"
              : activeTab === "mastered"
              ? "No Mastered Questions Yet"
              : "No Questions Answered Yet"}
          </h4>
          <p style={{ margin: "0 0 16px", color: "var(--muted)", fontSize: "0.85rem", maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
            {activeTab === "mistakes"
              ? "Excellent work! When you miss a question during a CBT drill, it appears here until you understand and master it."
              : activeTab === "mastered"
              ? "When you review a missed question with the AI Tutor and click 'Mark as Mastered', it will be tracked here."
              : "Start a practice drill or CBT test to build your personalized question bank."}
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {activeTab === "mistakes" && allCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="btn btn-secondary btn-sm"
              >
                📋 View All {allCount} Answered Questions ({allCount - missedCount} Correct)
              </button>
            )}
            <Link href="/assessments" className="btn btn-primary btn-sm">
              🚀 Practice CBT Questions →
            </Link>
            {allCount === 0 && (
              <button
                type="button"
                onClick={() => {
                  seedStarterPracticeQuestions();
                  loadQuestions();
                }}
                className="btn btn-secondary btn-sm"
              >
                💡 Load Sample WAEC/JAMB Drill Items
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Question List */
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {displayedQuestions.map((q, idx) => {
            const isExpanded = expandedCardIds.has(q.id);
            const isExplaining = explainingQuestionId === q.id;
            const explanationState = aiExplanations[q.id];

            return (
              <div
                key={`${q.id || "question"}-${idx}`}
                style={{
                  border: "1px solid var(--glass-border)",
                  borderLeft: `5px solid ${
                    q.mastered
                      ? "var(--brand-primary, #047857)"
                      : q.isCorrect
                      ? "var(--success, #10b981)"
                      : "var(--danger, #ef4444)"
                  }`,
                  borderRadius: 14,
                  background: "var(--glass-surface)",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s ease"
                }}
              >
                {/* Accordion Card Header */}
                <div
                  onClick={() => toggleCardExpand(q.id)}
                  style={{
                    padding: "14px 18px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    background: isExpanded ? "var(--glass-surface-raised)" : "transparent",
                    userSelect: "none"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "var(--brand-dark)",
                          background: "var(--brand-light)",
                          padding: "2px 8px",
                          borderRadius: 6
                        }}
                      >
                        {q.subject}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                        {q.assessmentTitle}
                      </span>

                      {/* Status Badges */}
                      {q.mastered ? (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "#dcfce7",
                            color: "#166534"
                          }}
                        >
                          🎉 Mastered
                        </span>
                      ) : q.isCorrect ? (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "#dcfce7",
                            color: "#166534"
                          }}
                        >
                          ✓ Correct
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "#fee2e2",
                            color: "#991b1b"
                          }}
                        >
                          ✗ Needs Revision
                        </span>
                      )}
                    </div>

                    {/* Question Summary */}
                    <div
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: 600,
                        color: "var(--ink)",
                        lineHeight: 1.4,
                        marginTop: 2
                      }}
                    >
                      {isExpanded ? q.prompt : q.prompt.length > 90 ? `${q.prompt.slice(0, 90)}...` : q.prompt}
                    </div>
                  </div>

                  <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 700, marginLeft: 8 }}>
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>

                {/* Expanded Question Body */}
                {isExpanded && (
                  <div style={{ padding: "0 18px 16px 18px", borderTop: "1px solid var(--line)" }}>
                    {/* Full Pedagogical Explanation Callout */}
                    {/* Student vs Correct Answer Comparison */}
                    {(q.userAnswer || q.correctAnswer) && (
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "10px 0", fontSize: "0.85rem" }}>
                        <div style={{ background: q.isCorrect ? "#f0fdf4" : "#fef2f2", border: `1px solid ${q.isCorrect ? "#bbf7d0" : "#fecaca"}`, borderRadius: 6, padding: "5px 12px" }}>
                          <strong>Your Answer:</strong> {q.userAnswer || "None recorded"} {q.isCorrect ? "✓" : "✗"}
                        </div>
                        {!q.isCorrect && q.correctAnswer && (
                          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "5px 12px", color: "#166534" }}>
                            <strong>Correct Answer:</strong> {q.correctAnswer} ✓
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        background: "var(--canvas)",
                        padding: "10px 14px",
                        borderRadius: 8,
                        fontSize: "0.86rem",
                        margin: "12px 0",
                        lineHeight: 1.5,
                        color: "var(--ink)"
                      }}
                    >
                      💡 <strong>Pedagogical Solution:</strong> {q.explanation}
                    </div>

                    {/* Action Bar */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10,
                        marginTop: 10
                      }}
                    >
                      <div style={{ display: "flex", gap: 8 }}>
                        {q.mastered ? (
                          <button
                            type="button"
                            onClick={() => handleUnmarkMastered(q.id)}
                            style={{
                              background: "transparent",
                              border: "1px solid var(--line)",
                              color: "var(--muted)",
                              borderRadius: 6,
                              padding: "4px 10px",
                              fontSize: "0.76rem",
                              cursor: "pointer"
                            }}
                          >
                            ↩ Move back to Mistake Bank
                          </button>
                        ) : !q.isCorrect ? (
                          <button
                            type="button"
                            onClick={() => handleMarkMastered(q.id)}
                            className="btn btn-sm"
                            style={{
                              background: "#dcfce7",
                              color: "#166534",
                              border: "1px solid #bbf7d0",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              padding: "4px 10px"
                            }}
                          >
                            ✓ Mark as Mastered
                          </button>
                        ) : null}
                      </div>

                      {/* Inline AI Explanation Trigger */}
                      <button
                        type="button"
                        onClick={() => handleRequestAiExplanation(q)}
                        className={`btn btn-sm ${isExplaining ? "btn-outline" : "btn-primary"}`}
                        style={{
                          fontSize: "0.8rem",
                          padding: "5px 12px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <span>{isExplaining ? "✕ Close Explanation" : "🤖 Ask AI Tutor to Explain Step-by-Step"}</span>
                      </button>
                    </div>

                    {/* Inline Expandable Socratic Explanation Drawer */}
                    {isExplaining && (
                      <div
                        style={{
                          marginTop: 16,
                          padding: "16px 18px",
                          borderRadius: 12,
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          position: "relative"
                        }}
                      >
                        {/* Drawer Header */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom: "1px solid #bbf7d0",
                            paddingBottom: 10,
                            marginBottom: 12
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: "1.1rem" }}>🧠</span>
                            <div>
                              <strong style={{ fontSize: "0.88rem", color: "#166534" }}>
                                LearnNaija Socratic Tutor
                              </strong>
                              <div style={{ fontSize: "0.72rem", color: "#15803d" }}>
                                Grounded in Nigerian NERDC Syllabus &amp; WAEC/JAMB Standards
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setExplainingQuestionId(null)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#166534",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: 700
                            }}
                          >
                            ✕ Close
                          </button>
                        </div>

                        {/* Content Area */}
                        {explanationState?.loading ? (
                          <div style={{ padding: "20px 0", textAlign: "center", color: "#15803d" }}>
                            <div style={{ fontSize: "1.3rem", marginBottom: 6 }}>⏳</div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                              Analyzing concept and preparing Socratic breakdown...
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ marginBottom: 16 }}>
                              <SocraticExplanationViewer
                                rawText={explanationState?.text || q.aiExplanation || q.explanation}
                                questionPrompt={q.prompt}
                                pedagogicalSolution={q.explanation}
                                subject={q.subject}
                              />
                            </div>

                            {/* Interactive Understanding Check */}
                            <div
                              style={{
                                background: "var(--glass-surface-raised)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: 10,
                                padding: "12px 16px",
                                marginTop: 12
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: "1rem" }}>🤔</span>
                                <strong style={{ fontSize: "0.85rem", color: "#166534" }}>
                                  Understanding Confirmation:
                                </strong>
                              </div>
                              <p style={{ margin: "0 0 12px", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.4 }}>
                                Did this step-by-step breakdown help you understand? Confirming mastery marks your progress and moves this item out of your revision bank.
                              </p>

                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                                <div style={{ display: "flex", gap: 8 }}>
                                  {!q.mastered ? (
                                    <button
                                      type="button"
                                      onClick={() => handleMarkMastered(q.id)}
                                      className="btn btn-sm"
                                      style={{
                                        background: "#166534",
                                        color: "#FFFFFF",
                                        border: "none",
                                        padding: "6px 14px",
                                        fontSize: "0.8rem",
                                        fontWeight: 700,
                                        borderRadius: 8
                                      }}
                                    >
                                      ✓ I understand now! Mark as Mastered
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: "0.8rem", color: "#166534", fontWeight: 700 }}>
                                      🎉 Mastered &amp; Resolved!
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => setExplainingQuestionId(null)}
                                    style={{
                                      background: "transparent",
                                      border: "1px solid var(--line)",
                                      color: "var(--ink)",
                                      padding: "5px 12px",
                                      fontSize: "0.78rem",
                                      borderRadius: 8,
                                      cursor: "pointer"
                                    }}
                                  >
                                    ✕ Close Explanation
                                  </button>
                                </div>

                                <Link
                                  href={`/tutor?question=${encodeURIComponent("Explain this concept step by step: " + q.prompt)}&subject=${encodeURIComponent(q.subject)}`}
                                  style={{
                                    fontSize: "0.78rem",
                                    color: "var(--brand-dark)",
                                    textDecoration: "underline",
                                    fontWeight: 600
                                  }}
                                >
                                  Open full chat in AI Tutor →
                                </Link>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination / View More Notice */}
      {viewLimit > 0 && filteredQuestions.length > viewLimit && (
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setViewLimit(0)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--brand-dark)",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            Showing {displayedQuestions.length} of {filteredQuestions.length} questions — Click to show all ↓
          </button>
        </div>
      )}
    </div>
  );
}

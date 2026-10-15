"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { CurriculumTopic } from "@/lib/curriculum/types";

interface TopicMasteryIndexProps {
  topics: CurriculumTopic[];
  masteryData: Record<string, { attempts: number; correct: number; score: number }>;
  trackLabel?: string;
}

export function TopicMasteryIndex({
  topics = [],
  masteryData = {},
  trackLabel = "Curriculum"
}: TopicMasteryIndexProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Map subject ID to human-readable name
  const subjectNameMap = useMemo(() => {
    const map: Record<string, string> = {
      "sub-math-01": "General Mathematics",
      "sub-eng-02": "English Language",
      "sub-phy-03": "Physics",
      "sub-chem-04": "Chemistry",
      "sub-bio-05": "Biology",
      "sub-lit-12": "Literature-in-English",
      "sub-gov-13": "Government",
      "sub-crs-14": "Christian Religious Studies",
      "sub-comm-15": "Commerce",
      "sub-acc-16": "Financial Accounting",
      "sub-econ-17": "Economics",
      "sub-jss-math-06": "Junior Mathematics",
      "sub-jss-eng-07": "Junior English",
      "sub-jss-sci-08": "Basic Science",
      "sub-pri-math-09": "Primary Mathematics",
      "sub-pri-eng-10": "Primary English",
      "sub-pri-sci-11": "Basic Science & Hygiene"
    };
    return map;
  }, []);

  // Extract distinct subjects present in these topics
  const distinctSubjects = useMemo(() => {
    const subs = new Map<string, string>();
    for (const t of topics) {
      const name = subjectNameMap[t.subject_id] || t.subject_id.replace(/^sub-/, "").toUpperCase();
      subs.set(t.subject_id, name);
    }
    return Array.from(subs.entries()).map(([id, name]) => ({ id, name }));
  }, [topics, subjectNameMap]);

  // Filter topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchesSubject = selectedSubject === "all" || t.subject_id === selectedSubject;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        t.title.toLowerCase().includes(q) ||
        (t.code && t.code.toLowerCase().includes(q)) ||
        (subjectNameMap[t.subject_id] && subjectNameMap[t.subject_id].toLowerCase().includes(q));
      return matchesSubject && matchesSearch;
    });
  }, [topics, selectedSubject, searchQuery, subjectNameMap]);

  // Aggregate KPI stats
  const stats = useMemo(() => {
    let masteredCount = 0;
    let progressingCount = 0;
    let needsDrillCount = 0;
    let totalScore = 0;
    let evaluatedCount = 0;

    for (const t of topics) {
      const d = masteryData[t.id];
      if (d && d.attempts > 0) {
        evaluatedCount++;
        totalScore += d.score;
        if (d.score >= 80) masteredCount++;
        else if (d.score >= 50) progressingCount++;
        else needsDrillCount++;
      }
    }

    const avgScore = evaluatedCount > 0 ? (totalScore / evaluatedCount).toFixed(1) : "0.0";
    const masteryPercentage = topics.length > 0 ? Math.round((masteredCount / topics.length) * 100) : 0;

    return {
      totalTopics: topics.length,
      masteredCount,
      progressingCount,
      needsDrillCount,
      avgScore,
      masteryPercentage
    };
  }, [topics, masteryData]);

  return (
    <section style={{ marginTop: 28, marginBottom: 32 }}>
      {/* Container Glass Card */}
      <div
        className="glass-card"
        style={{
          background: "var(--glass-surface-raised)",
          border: "1px solid var(--glass-border)",
          borderRadius: 22,
          padding: "26px 28px",
          boxShadow: "var(--glass-highlight), var(--glass-shadow-lg)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 20,
            borderBottom: "1px solid var(--line)",
            paddingBottom: 18
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="glass-pill" style={{ color: "var(--brand)", borderColor: "var(--brand-border)" }}>
                📊 Competence Telemetry
              </span>
              <span className="badge badge-success" style={{ textTransform: "none" }}>
                Server Evaluated
              </span>
              <span className="badge badge-neutral" style={{ textTransform: "none" }}>
                🏛️ {trackLabel}
              </span>
            </div>
            <h2
              style={{
                fontSize: "1.6rem",
                margin: 0,
                letterSpacing: "-0.03em",
                color: "var(--ink)",
                fontWeight: 900
              }}
            >
              Topic Mastery &amp; Competence Index
            </h2>
            <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
              Continuous diagnostic radar tracking your syllabus retention and cognitive mastery across all curriculum modules.
            </p>
          </div>

          {/* Quick Search Input */}
          <div style={{ minWidth: 260, flex: "1 1 auto", maxWidth: 360 }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search topic or code (e.g. ACC-SSS-01)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--glass-surface)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 12,
                  padding: "10px 14px 10px 36px",
                  fontSize: "0.88rem",
                  color: "var(--ink)",
                  outline: "none",
                  transition: "border-color 0.2s ease"
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.95rem",
                  color: "var(--muted)"
                }}
              >
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--muted)",
                    cursor: "pointer",
                    fontSize: "0.85rem"
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
            marginBottom: 20
          }}
        >
          <div
            style={{
              background: "var(--glass-surface)",
              border: "1px solid var(--glass-border)",
              borderRadius: 14,
              padding: "12px 16px"
            }}
          >
            <div style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Active Modules
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--ink)", marginTop: 2 }}>
              {stats.totalTopics}
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>In your academic scope</div>
          </div>

          <div
            style={{
              background: "var(--glass-surface)",
              border: "1px solid var(--glass-border)",
              borderRadius: 14,
              padding: "12px 16px"
            }}
          >
            <div style={{ fontSize: "0.78rem", color: "var(--success)", fontWeight: 700, textTransform: "uppercase" }}>
              Mastered (≥80%)
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--success)", marginTop: 2 }}>
              {stats.masteredCount} <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>({stats.masteryPercentage}%)</span>
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>Retained in long-term memory</div>
          </div>

          <div
            style={{
              background: "var(--glass-surface)",
              border: "1px solid var(--glass-border)",
              borderRadius: 14,
              padding: "12px 16px"
            }}
          >
            <div style={{ fontSize: "0.78rem", color: "var(--warning)", fontWeight: 700, textTransform: "uppercase" }}>
              Progressing (50-79%)
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--warning)", marginTop: 2 }}>
              {stats.progressingCount}
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>Actively building accuracy</div>
          </div>

          <div
            style={{
              background: "var(--glass-surface)",
              border: "1px solid var(--glass-border)",
              borderRadius: 14,
              padding: "12px 16px"
            }}
          >
            <div style={{ fontSize: "0.78rem", color: "var(--brand)", fontWeight: 700, textTransform: "uppercase" }}>
              Average Accuracy
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--brand)", marginTop: 2 }}>
              {stats.avgScore}%
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>Across evaluated items</div>
          </div>
        </div>

        {/* Subject Filter Pills */}
        {distinctSubjects.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 20
            }}
          >
            <button
              onClick={() => setSelectedSubject("all")}
              style={{
                border: "none",
                background: selectedSubject === "all" ? "var(--brand)" : "var(--glass-surface)",
                color: selectedSubject === "all" ? "#ffffff" : "var(--ink-secondary)",
                padding: "6px 14px",
                borderRadius: 9999,
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: selectedSubject === "all" ? "0 2px 8px var(--brand-glow)" : "none",
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: selectedSubject === "all" ? "var(--brand)" : "var(--glass-border)"
              }}
            >
              All Topics ({topics.length})
            </button>
            {distinctSubjects.map((sub) => {
              const isSelected = selectedSubject === sub.id;
              const count = topics.filter((t) => t.subject_id === sub.id).length;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  style={{
                    border: "none",
                    background: isSelected ? "var(--brand)" : "var(--glass-surface)",
                    color: isSelected ? "#ffffff" : "var(--ink-secondary)",
                    padding: "6px 14px",
                    borderRadius: 9999,
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected ? "0 2px 8px var(--brand-glow)" : "none",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: isSelected ? "var(--brand)" : "var(--glass-border)"
                  }}
                >
                  {sub.name} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* High-Density Modern Topic Mastery Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 8px",
              textAlign: "left"
            }}
          >
            <thead>
              <tr style={{ color: "var(--muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <th style={{ padding: "8px 16px", fontWeight: 800 }}>Curriculum Topic</th>
                <th style={{ padding: "8px 16px", fontWeight: 800 }}>Subject Area</th>
                <th style={{ padding: "8px 16px", fontWeight: 800 }}>Attempts</th>
                <th style={{ padding: "8px 16px", fontWeight: 800, minWidth: 180 }}>Accuracy Gauge</th>
                <th style={{ padding: "8px 16px", fontWeight: 800, textAlign: "center" }}>Mastery Status</th>
                <th style={{ padding: "8px 16px", fontWeight: 800, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopics.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "var(--muted)" }}>
                    No curriculum topics matched your search filter.
                  </td>
                </tr>
              ) : (
                filteredTopics.map((topic) => {
                  const topicScore = masteryData[topic.id];
                  const score = topicScore ? topicScore.score : 0;
                  const attempts = topicScore ? topicScore.attempts : 0;
                  const subjectName = subjectNameMap[topic.subject_id] || "General";

                  let statusBadge = (
                    <span className="badge badge-neutral" style={{ fontSize: "0.78rem" }}>
                      Untested
                    </span>
                  );
                  let barColor = "var(--line)";
                  if (attempts > 0) {
                    if (score >= 80) {
                      statusBadge = (
                        <span
                          style={{
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#10b981",
                            border: "1px solid rgba(16, 185, 129, 0.35)",
                            padding: "4px 10px",
                            borderRadius: 9999,
                            fontSize: "0.78rem",
                            fontWeight: 800,
                            display: "inline-block"
                          }}
                        >
                          🟢 Mastered
                        </span>
                      );
                      barColor = "linear-gradient(90deg, #10b981 0%, #34d399 100%)";
                    } else if (score >= 50) {
                      statusBadge = (
                        <span
                          style={{
                            background: "rgba(245, 158, 11, 0.15)",
                            color: "#f59e0b",
                            border: "1px solid rgba(245, 158, 11, 0.35)",
                            padding: "4px 10px",
                            borderRadius: 9999,
                            fontSize: "0.78rem",
                            fontWeight: 800,
                            display: "inline-block"
                          }}
                        >
                          🟡 Progressing
                        </span>
                      );
                      barColor = "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)";
                    } else {
                      statusBadge = (
                        <span
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "#ef4444",
                            border: "1px solid rgba(239, 68, 68, 0.35)",
                            padding: "4px 10px",
                            borderRadius: 9999,
                            fontSize: "0.78rem",
                            fontWeight: 800,
                            display: "inline-block"
                          }}
                        >
                          🔴 Needs Drill
                        </span>
                      );
                      barColor = "linear-gradient(90deg, #ef4444 0%, #f87171 100%)";
                    }
                  }

                  return (
                    <tr
                      key={topic.id}
                      style={{
                        background: "var(--glass-surface)",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {/* Topic Name & Code */}
                      <td style={{ padding: "14px 16px", borderRadius: "12px 0 0 12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span
                            style={{
                              background: "rgba(255, 255, 255, 0.06)",
                              padding: "3px 8px",
                              borderRadius: 6,
                              fontSize: "0.74rem",
                              fontWeight: 800,
                              color: "var(--brand)",
                              border: "1px solid var(--glass-border)",
                              fontFamily: "monospace"
                            }}
                          >
                            {topic.code || "TOPIC"}
                          </span>
                          <span style={{ fontWeight: 800, color: "var(--ink)", fontSize: "0.93rem" }}>
                            {topic.title}
                          </span>
                        </div>
                      </td>

                      {/* Subject Name */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "0.84rem", color: "var(--muted)", fontWeight: 600 }}>
                          {subjectName}
                        </span>
                      </td>

                      {/* Attempts */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--ink-secondary)", fontWeight: 700 }}>
                          {attempts} {attempts === 1 ? "attempt" : "attempts"}
                        </span>
                      </td>

                      {/* Accuracy Gauge Bar */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              flex: 1,
                              height: 8,
                              background: "rgba(255, 255, 255, 0.08)",
                              borderRadius: 4,
                              overflow: "hidden"
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(100, Math.max(attempts > 0 ? 8 : 0, score))}%`,
                                height: "100%",
                                background: barColor,
                                borderRadius: 4,
                                transition: "width 0.4s ease"
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "var(--ink)", minWidth: 42, textAlign: "right" }}>
                            {attempts > 0 ? `${score}%` : "—"}
                          </span>
                        </div>
                      </td>

                      {/* Mastery Status */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        {statusBadge}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 16px", borderRadius: "0 12px 12px 0", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <Link
                            href={`/tutor?topic=${encodeURIComponent(topic.title)}`}
                            className="btn btn-outline btn-sm"
                            style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                            title="Ask AI Tutor for Socratic Scaffolding"
                          >
                            🤖 Hints
                          </Link>
                          <Link
                            href={`/assessments`}
                            className="btn btn-primary btn-sm"
                            style={{ padding: "4px 12px", fontSize: "0.78rem" }}
                          >
                            Drill →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";

interface WardCompletedTest {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  completedAt: string;
  scorePercentage: number;
  timeSpentMinutes: number;
  totalQuestions: number;
  status: "Mastered" | "Proficient" | "Needs Practice";
  misconceptions: string[];
}

interface WardData {
  id: string;
  name: string;
  classLabel: string;
  avatar: string;
  targetExam: string;
  averageAccuracy: number;
  totalTestsCompleted: number;
  completedTests: WardCompletedTest[];
}

export function GuardianAssessmentAudit() {
  const [selectedWardId, setSelectedWardId] = useState("ward-1");
  const [assignedSuccessMsg, setAssignedSuccessMsg] = useState("");
  const [selectedMisconceptionTest, setSelectedMisconceptionTest] = useState<WardCompletedTest | null>(null);

  const wardsData: WardData[] = [
    {
      id: "ward-1",
      name: "Chisom Okonkwo",
      classLabel: "SSS 3 Science",
      avatar: "👩🏾‍🎓",
      targetExam: "JAMB UTME 2026",
      averageAccuracy: 86,
      totalTestsCompleted: 14,
      completedTests: [
        {
          id: "test-1",
          title: "General Mathematics: Quadratic Equations & Roots",
          subject: "Mathematics",
          classLevel: "SSS 3",
          completedAt: "Yesterday at 4:15 PM WAT",
          scorePercentage: 85,
          timeSpentMinutes: 12,
          totalQuestions: 15,
          status: "Proficient",
          misconceptions: [
            "Sign inversion error when expanding negative parentheses (-a)(-b)",
            "Divided by 4 instead of 8 when simplifying discriminant fraction"
          ]
        },
        {
          id: "test-2",
          title: "Physics: Electric Field Vectors & Coulomb's Law",
          subject: "Physics",
          classLevel: "SSS 3",
          completedAt: "2 days ago at 6:30 PM WAT",
          scorePercentage: 74,
          timeSpentMinutes: 14,
          totalQuestions: 15,
          status: "Needs Practice",
          misconceptions: [
            "Treated electric field vectors as scalars at midpoint between opposite charges",
            "Confused permittivity of free space with relative permittivity"
          ]
        },
        {
          id: "test-3",
          title: "Use of English: Concord & Sentence Structure",
          subject: "English",
          classLevel: "SSS 3",
          completedAt: "3 days ago at 5:00 PM WAT",
          scorePercentage: 93,
          timeSpentMinutes: 10,
          totalQuestions: 20,
          status: "Mastered",
          misconceptions: [
            "Minor hesitation on correlative conjunctions (neither...nor)"
          ]
        }
      ]
    },
    {
      id: "ward-2",
      name: "Tobi Adeleke",
      classLabel: "Primary 5",
      avatar: "👦🏾",
      targetExam: "National Common Entrance (NCEE 2026)",
      averageAccuracy: 94,
      totalTestsCompleted: 11,
      completedTests: [
        {
          id: "test-4",
          title: "Quantitative Reasoning: Number Patterns & Sequences",
          subject: "Quantitative Reasoning",
          classLevel: "Primary 5",
          completedAt: "Today at 2:20 PM WAT",
          scorePercentage: 94,
          timeSpentMinutes: 8,
          totalQuestions: 10,
          status: "Mastered",
          misconceptions: [
            "Alternating subtraction sequences with negative delta (-3, +5)"
          ]
        },
        {
          id: "test-5",
          title: "Basic Science: Living Things & Habitats",
          subject: "Basic Science",
          classLevel: "Primary 5",
          completedAt: "3 days ago at 3:45 PM WAT",
          scorePercentage: 90,
          timeSpentMinutes: 9,
          totalQuestions: 10,
          status: "Mastered",
          misconceptions: [
            "Difference between cold-blooded and warm-blooded classification"
          ]
        }
      ]
    },
    {
      id: "ward-3",
      name: "Emeka Okonkwo",
      classLabel: "100L Undergraduate",
      avatar: "🧑🏾‍💻",
      targetExam: "First Semester University CGPA",
      averageAccuracy: 91,
      totalTestsCompleted: 18,
      completedTests: [
        {
          id: "test-6",
          title: "Computer Science: Memory Architecture & Logic Gates",
          subject: "Computer Science",
          classLevel: "100L",
          completedAt: "Yesterday at 8:10 PM WAT",
          scorePercentage: 91,
          timeSpentMinutes: 18,
          totalQuestions: 20,
          status: "Proficient",
          misconceptions: [
            "Boolean simplification using De Morgan's second law"
          ]
        }
      ]
    }
  ];

  const currentWard = wardsData.find((w) => w.id === selectedWardId) || wardsData[0];

  const handleAssignPractice = (subject: string) => {
    setAssignedSuccessMsg(`✓ 15-Minute Socratic Practice Sprint on ${subject} has been assigned to ${currentWard.name}'s student daily loop! They will receive a notification upon logging in.`);
    setTimeout(() => setAssignedSuccessMsg(""), 6000);
  };

  return (
    <div>
      {/* Sibling Switcher Bar */}
      <div
        className="glass-card"
        style={{
          marginBottom: 24,
          background: "var(--glass-surface-raised)",
          border: "1px solid var(--glass-border)",
          borderRadius: 20,
          padding: "18px 22px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--brand)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Household Learner Oversight ({wardsData.length} Linked Wards)
            </span>
            <h2 style={{ fontSize: "1.25rem", margin: "2px 0 0", color: "var(--ink)", fontWeight: 800 }}>
              Select Ward to Audit CBT Performance:
            </h2>
          </div>
          <span className="badge badge-success">NDPA 2023 Verified Vault</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {wardsData.map((ward) => {
            const isSelected = ward.id === selectedWardId;
            return (
              <div
                key={ward.id}
                onClick={() => {
                  setSelectedWardId(ward.id);
                  setSelectedMisconceptionTest(null);
                }}
                style={{
                  background: isSelected ? "rgba(16, 185, 129, 0.12)" : "var(--glass-surface)",
                  border: isSelected ? "2px solid #10b981" : "1px solid var(--glass-border)",
                  borderRadius: 14,
                  padding: "12px 16px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ fontSize: "1.8rem" }}>{ward.avatar}</div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--ink)" }}>
                    {ward.name}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    {ward.classLabel} • {ward.averageAccuracy}% Accuracy
                  </div>
                  <div style={{ fontSize: "0.72rem", color: isSelected ? "#10b981" : "var(--muted)", fontWeight: 700 }}>
                    {ward.completedTests.length} Proctored Tests
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ward CBT Overview KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: 16, borderRadius: 14 }}>
          <div style={{ fontSize: "0.74rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Average CBT Accuracy</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#10b981", margin: "4px 0" }}>{currentWard.averageAccuracy}%</div>
          <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>Across all timed evaluations</div>
        </div>

        <div className="glass-card" style={{ padding: 16, borderRadius: 14 }}>
          <div style={{ fontSize: "0.74rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Completed Test Sprints</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--ink)", margin: "4px 0" }}>{currentWard.totalTestsCompleted} Tests</div>
          <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>Server-authoritative records</div>
        </div>

        <div className="glass-card" style={{ padding: 16, borderRadius: 14 }}>
          <div style={{ fontSize: "0.74rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Target Examination</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#06b6d4", margin: "4px 0" }}>{currentWard.targetExam}</div>
          <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>NERDC &amp; WAEC benchmarked</div>
        </div>

        <div className="glass-card" style={{ padding: 16, borderRadius: 14 }}>
          <div style={{ fontSize: "0.74rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Parent Action</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#f59e0b", margin: "4px 0" }}>Review &amp; Assign</div>
          <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>Queues drills to child&apos;s loop</div>
        </div>
      </div>

      {assignedSuccessMsg && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          {assignedSuccessMsg}
        </div>
      )}

      {/* Ward Completed CBT Assessments Table */}
      <div
        className="glass-card"
        style={{
          background: "var(--glass-surface-raised)",
          border: "1px solid var(--glass-border)",
          borderRadius: 20,
          padding: 24,
          marginBottom: 24
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 800, color: "var(--ink)" }}>
              {currentWard.name}&apos;s Completed CBT Assessment History
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.84rem", color: "var(--muted)" }}>
              Server-evaluated examination scores. Guardians have read-only audit rights under NDPA 2023.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentWard.completedTests, null, 2));
              const a = document.createElement("a");
              a.setAttribute("href", dataStr);
              a.setAttribute("download", `${currentWard.name.replace(/\s+/g, "_")}_CBT_Report_${Date.now()}.json`);
              document.body.appendChild(a);
              a.click();
              a.remove();
            }}
            className="btn btn-secondary btn-sm"
          >
            📥 Export Result Slips (PDF / JSON)
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--glass-border)", textAlign: "left" }}>
                <th style={{ padding: "12px 14px", color: "var(--muted)", fontWeight: 700 }}>Assessment Title</th>
                <th style={{ padding: "12px 14px", color: "var(--muted)", fontWeight: 700 }}>Completed</th>
                <th style={{ padding: "12px 14px", color: "var(--muted)", fontWeight: 700 }}>Score</th>
                <th style={{ padding: "12px 14px", color: "var(--muted)", fontWeight: 700 }}>Time Spent</th>
                <th style={{ padding: "12px 14px", color: "var(--muted)", fontWeight: 700 }}>Status</th>
                <th style={{ padding: "12px 14px", color: "var(--muted)", fontWeight: 700, textAlign: "right" }}>Diagnostic Action</th>
              </tr>
            </thead>
            <tbody>
              {currentWard.completedTests.map((test) => (
                <tr key={test.id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                  <td style={{ padding: "14px 14px", fontWeight: 700, color: "var(--ink)" }}>
                    <div>{test.title}</div>
                    <div style={{ fontSize: "0.76rem", color: "var(--muted)", fontWeight: 500 }}>
                      {test.subject} • {test.totalQuestions} Questions
                    </div>
                  </td>
                  <td style={{ padding: "14px 14px", color: "var(--muted)", fontSize: "0.82rem" }}>
                    {test.completedAt}
                  </td>
                  <td style={{ padding: "14px 14px" }}>
                    <span style={{ fontSize: "1.05rem", fontWeight: 900, color: test.scorePercentage >= 80 ? "#10b981" : "#f59e0b" }}>
                      {test.scorePercentage}%
                    </span>
                  </td>
                  <td style={{ padding: "14px 14px", color: "var(--muted)" }}>
                    ⏱️ {test.timeSpentMinutes} mins
                  </td>
                  <td style={{ padding: "14px 14px" }}>
                    <span className={`badge ${test.status === "Mastered" ? "badge-success" : test.status === "Proficient" ? "badge-warning" : "badge-danger"}`}>
                      {test.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 14px", textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedMisconceptionTest(test)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: "0.76rem", padding: "4px 10px" }}
                    >
                      🔍 View Misconceptions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Misconception Diagnostic Inspection Modal / Drawer */}
      {selectedMisconceptionTest && (
        <div
          className="glass-card"
          style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: 20,
            padding: 24,
            marginBottom: 24
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge badge-danger">Misconception Autopsy</span>
              <h4 style={{ margin: 0, fontSize: "1.1rem", color: "var(--ink)", fontWeight: 800 }}>
                {selectedMisconceptionTest.title}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMisconceptionTest(null)}
              style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.1rem" }}
            >
              ✕
            </button>
          </div>

          <p style={{ margin: "0 0 14px", fontSize: "0.85rem", color: "var(--muted)" }}>
            These are the specific errors {currentWard.name} made during this timed test. Socratic AI has diagnosed the root causes:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {selectedMisconceptionTest.misconceptions.map((m, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--glass-surface)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: "0.86rem",
                  color: "var(--ink)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10
                }}
              >
                <span style={{ color: "#ef4444", fontSize: "1rem" }}>❌</span>
                <div>
                  <strong>Misconception #{idx + 1}:</strong> {m}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => handleAssignPractice(selectedMisconceptionTest.subject)}
              className="btn btn-primary btn-sm"
            >
              ⚡ Assign Follow-Up Remedial Sprint to {currentWard.name}
            </button>
            <Link
              href={`/tutor?topic=${encodeURIComponent(selectedMisconceptionTest.subject)}`}
              className="btn btn-secondary btn-sm"
            >
              🍲 Ask Parent Coach How to Explain This at Home
            </Link>
          </div>
        </div>
      )}

      {/* Proactive Parent Assign Drill Card */}
      <div
        className="glass-card"
        style={{
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(16, 185, 129, 0.05) 100%)",
          border: "1px solid rgba(6, 182, 212, 0.3)",
          borderRadius: 20,
          padding: 24
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                color: "#0891b2",
                background: "rgba(6, 182, 212, 0.15)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                padding: "3px 10px",
                borderRadius: 9999,
                textTransform: "uppercase"
              }}
            >
              🎯 Assign Practice To Ward
            </span>
            <h3 style={{ fontSize: "1.25rem", margin: "6px 0 4px", fontWeight: 800, color: "var(--ink)" }}>
              Recommend a Timed Socratic Practice Session for {currentWard.name}
            </h3>
            <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--muted)", maxWidth: 680 }}>
              Guardians do not take tests. Selecting a subject below automatically schedules a 15-minute diagnostic sprint into {currentWard.name}&apos;s student dashboard.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 18 }}>
          <button
            type="button"
            onClick={() => handleAssignPractice("General Mathematics")}
            className="btn btn-outline"
            style={{ textAlign: "left", padding: "12px 14px", height: "auto" }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>📐 Mathematics</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Quadratic &amp; Trigonometry Sprints</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAssignPractice("Physics")}
            className="btn btn-outline"
            style={{ textAlign: "left", padding: "12px 14px", height: "auto" }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>🔬 Physics</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Electric Fields &amp; Motion Sprints</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAssignPractice("English Language")}
            className="btn btn-outline"
            style={{ textAlign: "left", padding: "12px 14px", height: "auto" }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>📖 English Language</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Lexis, Structure &amp; Concord</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAssignPractice("Chemistry & Biology")}
            className="btn btn-outline"
            style={{ textAlign: "left", padding: "12px 14px", height: "auto" }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>🧪 Natural Sciences</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Stoichiometry &amp; Cell Biology</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

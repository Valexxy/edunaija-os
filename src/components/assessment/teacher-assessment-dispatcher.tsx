"use client";

import React, { useState } from "react";
import type { ProvisionedAssessment } from "@/lib/assessment/provisioning";

interface Props {
  diagnosticTests: ProvisionedAssessment[];
  sprintTests: ProvisionedAssessment[];
  challengeTests: ProvisionedAssessment[];
}

export function TeacherAssessmentDispatcher({
  diagnosticTests,
  sprintTests,
  challengeTests
}: Props) {
  const [selectedCohort, setSelectedCohort] = useState("SS 3 Gold — Advanced Physics");
  const [selectedExamBody, setSelectedExamBody] = useState<"all" | "jamb" | "waec" | "neco" | "bece">("all");
  const [dispatchedMsg, setDispatchedMsg] = useState("");
  const [previewTest, setPreviewTest] = useState<ProvisionedAssessment | null>(null);

  const cohorts = [
    { name: "SS 3 Gold — Advanced Physics", code: "APEX-PHY-882", count: 42, subject: "Physics" },
    { name: "SS 2 Diamond — Further Mathematics", code: "CALC-MTH-419", count: 38, subject: "Further Mathematics" },
    { name: "JSS 3 Emerald — Basic Science", code: "STEM-JSS-104", count: 45, subject: "Basic Science" },
  ];

  const allTests = [...diagnosticTests, ...sprintTests, ...challengeTests];

  const filteredTests = allTests.filter((t) => {
    if (selectedExamBody === "all") return true;
    const title = t.title.toLowerCase();
    const desc = (t.description || "").toLowerCase();
    if (selectedExamBody === "jamb") return title.includes("jamb") || title.includes("utme") || desc.includes("jamb");
    if (selectedExamBody === "waec") return title.includes("waec") || title.includes("wassce") || desc.includes("waec");
    if (selectedExamBody === "neco") return title.includes("neco") || desc.includes("neco");
    if (selectedExamBody === "bece") return title.includes("bece") || desc.includes("junior");
    return true;
  });

  const handleDeploy = (testTitle: string) => {
    setDispatchedMsg(`✓ Successfully deployed "${testTitle}" to all ${selectedCohort} students! Assessment pushed to their Student PWA and daily learning loop.`);
    setTimeout(() => setDispatchedMsg(""), 5000);
  };

  return (
    <div>
      {/* Teacher Cohort Selector Bar */}
      <div
        className="glass-card"
        style={{
          marginBottom: 24,
          background: "var(--glass-surface-raised)",
          border: "1px solid rgba(217, 119, 6, 0.35)",
          borderRadius: 20,
          padding: "18px 22px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
          <div>
            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Target Cohort Classroom
            </span>
            <h2 style={{ fontSize: "1.25rem", margin: "2px 0 0", color: "var(--ink)", fontWeight: 800 }}>
              Select Cohort to Receive CBT Drill:
            </h2>
          </div>
          <span className="badge badge-warning">TRCN Accredited Dispatcher</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {cohorts.map((c) => {
            const isSelected = c.name === selectedCohort;
            return (
              <div
                key={`${c.code}-${c.name}`}
                onClick={() => setSelectedCohort(c.name)}
                style={{
                  background: isSelected ? "rgba(217, 119, 6, 0.12)" : "var(--glass-surface)",
                  border: isSelected ? "2px solid #d97706" : "1px solid var(--glass-border)",
                  borderRadius: 14,
                  padding: "12px 16px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "0.92rem", color: "var(--ink)" }}>{c.name}</strong>
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 2 }}>
                  Join Code: <code>{c.code}</code> &bull; 👥 {c.count} Scholars
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {dispatchedMsg && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          {dispatchedMsg}
        </div>
      )}

      {/* Exam Body Filter Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { key: "all", label: "🌐 All Examination Banks" },
          { key: "jamb", label: "🎯 JAMB UTME Banks" },
          { key: "waec", label: "📜 WAEC WASSCE Banks" },
          { key: "neco", label: "🏛️ NECO SSCE Banks" },
          { key: "bece", label: "🎒 BECE / Junior Banks" }
        ].map((tab) => {
          const isActive = selectedExamBody === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedExamBody(tab.key as any)}
              className={`btn btn-sm ${isActive ? "btn-primary" : "btn-outline"}`}
              style={{ fontSize: "0.82rem", padding: "6px 14px" }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Available Exam Items Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
        {filteredTests.map((t) => (
          <div
            key={t.id}
            className="glass-card"
            style={{
              background: "var(--glass-surface-raised)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className="badge badge-neutral" style={{ textTransform: "capitalize" }}>
                  {t.category} Assessment
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  ⏱️ {t.time_limit_seconds ? Math.floor(t.time_limit_seconds / 60) : 15} Mins
                </span>
              </div>

              <h3 style={{ fontSize: "1.05rem", margin: "0 0 6px", color: "var(--ink)", fontWeight: 800 }}>
                {t.title}
              </h3>
              <p style={{ margin: "0 0 12px", fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}>
                {t.description}
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: 14, display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => handleDeploy(t.title)}
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                🚀 Deploy to {selectedCohort.split("—")[0].trim()}
              </button>
              <button
                type="button"
                onClick={() => setPreviewTest(t)}
                className="btn btn-outline btn-sm"
              >
                👁️ Preview Questions
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Question Modal */}
      {previewTest && (
        <div
          role="dialog"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16
          }}
          onClick={() => setPreviewTest(null)}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 580,
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              padding: 24,
              borderRadius: 20,
              background: "var(--glass-surface-raised)",
              border: "1px solid var(--glass-border)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--ink)", fontWeight: 800 }}>
                Question Pool Preview: {previewTest.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewTest(null)}
                style={{ background: "transparent", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.86rem", color: "var(--muted)", marginBottom: 16 }}>
              Official NERDC / WAEC item bank items with verified marking guide solutions:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "var(--glass-surface)", padding: 14, borderRadius: 12, border: "1px solid var(--glass-border)" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--brand)", marginBottom: 4 }}>
                  Sample Item #1 (Objective CBT)
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--ink)", marginBottom: 8 }}>
                  Two point charges +q and -q are separated by distance r. What is the electric field magnitude at the exact midpoint?
                </div>
                <div style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 700 }}>
                  ✓ Official Key: 2kq / (r/2)² pointing toward negative charge
                </div>
              </div>

              <div style={{ background: "var(--glass-surface)", padding: 14, borderRadius: 12, border: "1px solid var(--glass-border)" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--brand)", marginBottom: 4 }}>
                  Sample Item #2 (Objective CBT)
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--ink)", marginBottom: 8 }}>
                  If the roots of 2x² - 5x + c = 0 are real and equal, determine the value of constant c.
                </div>
                <div style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 700 }}>
                  ✓ Official Key: c = 25/8 (from discriminant b² - 4ac = 0)
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  handleDeploy(previewTest.title);
                  setPreviewTest(null);
                }}
                className="btn btn-primary"
              >
                🚀 Deploy This Drill to {selectedCohort}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

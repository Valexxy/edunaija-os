"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ProvisionedAssessment } from "@/lib/assessment/provisioning";
import { resolveQuestionIdsForAssessment } from "@/lib/assessment/provisioning";
import type { Assessment } from "@/lib/assessment/types";

interface Props {
  diagnosticTests: ProvisionedAssessment[];
  sprintTests: ProvisionedAssessment[];
  challengeTests: ProvisionedAssessment[];
  seedAssessments: Assessment[];
  educationLevel?: string;
}

export function AssessmentFilterView({
  diagnosticTests,
  sprintTests,
  challengeTests,
  seedAssessments,
  educationLevel
}: Props) {
  const [selectedFocus, setSelectedFocus] = useState<"all" | "math" | "physics" | "chemistry" | "biology" | "english" | "arts_comm">("all");

  // Filter sprints based on subject focus
  const filteredSprints = sprintTests.filter((asm) => {
    if (selectedFocus === "all") return true;
    const sub = (asm.subject_id || "").toLowerCase();
    const title = asm.title.toLowerCase();
    if (selectedFocus === "math") return sub.includes("math") || title.includes("math") || title.includes("algebra");
    if (selectedFocus === "physics") return sub.includes("phy") || title.includes("physics") || title.includes("kinematics");
    if (selectedFocus === "chemistry") return sub.includes("chem") || title.includes("chemistry") || title.includes("atom");
    if (selectedFocus === "biology") return sub.includes("bio") || title.includes("biology") || title.includes("cell");
    if (selectedFocus === "english") return sub.includes("eng") || title.includes("english") || title.includes("concord");
    if (selectedFocus === "arts_comm") return sub.includes("lit") || sub.includes("gov") || sub.includes("crs") || sub.includes("comm") || sub.includes("acc") || sub.includes("econ");
    return true;
  });

  const isMathOnly = selectedFocus === "math";

  return (
    <div>
      {/* Subject Focus Selector Bar */}
      <div className="card" style={{ padding: "18px 22px", marginBottom: 30, background: "#f8fafc", border: "1.5px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div>
            <strong style={{ fontSize: "0.92rem", color: "var(--brand-dark)" }}>🎯 Focus Your Practice Session:</strong>
            <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--muted)" }}>
              Choose a multi-subject mixed benchmark, or focus 100% on a single subject like Mathematics.
            </p>
          </div>
          {selectedFocus !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedFocus("all")}
              style={{ background: "transparent", border: "none", color: "var(--brand)", fontSize: "0.82rem", cursor: "pointer", fontWeight: 700 }}
            >
              Reset to All Focuses ↺
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setSelectedFocus("all")}
            className={`btn btn-sm ${selectedFocus === "all" ? "btn-primary" : "btn-outline"}`}
            style={{ fontSize: "0.82rem", padding: "6px 14px" }}
          >
            🌟 All (Mixed &amp; Sprints)
          </button>
          <button
            type="button"
            onClick={() => setSelectedFocus("math")}
            className={`btn btn-sm ${selectedFocus === "math" ? "btn-primary" : "btn-outline"}`}
            style={{ fontSize: "0.82rem", padding: "6px 14px" }}
          >
            📐 Mathematics Focus Only
          </button>
          <button
            type="button"
            onClick={() => setSelectedFocus("physics")}
            className={`btn btn-sm ${selectedFocus === "physics" ? "btn-primary" : "btn-outline"}`}
            style={{ fontSize: "0.82rem", padding: "6px 14px" }}
          >
            🔬 Physics Focus
          </button>
          <button
            type="button"
            onClick={() => setSelectedFocus("chemistry")}
            className={`btn btn-sm ${selectedFocus === "chemistry" ? "btn-primary" : "btn-outline"}`}
            style={{ fontSize: "0.82rem", padding: "6px 14px" }}
          >
            🧪 Chemistry Focus
          </button>
          <button
            type="button"
            onClick={() => setSelectedFocus("biology")}
            className={`btn btn-sm ${selectedFocus === "biology" ? "btn-primary" : "btn-outline"}`}
            style={{ fontSize: "0.82rem", padding: "6px 14px" }}
          >
            🧬 Biology Focus
          </button>
          <button
            type="button"
            onClick={() => setSelectedFocus("english")}
            className={`btn btn-sm ${selectedFocus === "english" ? "btn-primary" : "btn-outline"}`}
            style={{ fontSize: "0.82rem", padding: "6px 14px" }}
          >
            📖 English Language Focus
          </button>
          <button
            type="button"
            onClick={() => setSelectedFocus("arts_comm")}
            className={`btn btn-sm ${selectedFocus === "arts_comm" ? "btn-primary" : "btn-outline"}`}
            style={{ fontSize: "0.82rem", padding: "6px 14px" }}
          >
            🏛️ Arts &amp; Commercial Sprints
          </button>
        </div>

        {isMathOnly && (
          <div style={{ marginTop: 12, padding: "8px 14px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 8, fontSize: "0.82rem", color: "#065F46" }}>
            💡 <strong>Mathematics Focus Active:</strong> Showing dedicated SSS Mathematics drills on Quadratic Equations, Trigonometry, and Algebra. Perfect for deliberate blocked practice!
          </div>
        )}
      </div>

      {/* Section 1: Multi-Subject Mixed Benchmark (Hidden when focused on a single subject, unless 'all') */}
      {selectedFocus === "all" && diagnosticTests.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <h2 className="section-title" style={{ margin: 0 }}>🎯 Target Diagnostic Benchmarks (Multi-Subject Mix)</h2>
            <span className="badge badge-warning">Discipline Interleaving</span>
          </div>

          <div className="grid">
            {diagnosticTests.map((asm) => {
              const qCount = resolveQuestionIdsForAssessment(asm.id).length;
              const mins = asm.time_limit_seconds ? Math.floor(asm.time_limit_seconds / 60) : 10;

              return (
                <div className="card" key={asm.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderTop: "3px solid var(--brand)" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span className="badge badge-success">Official Benchmark</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>⏱️ {mins} mins</span>
                    </div>
                    <h3>{asm.title}</h3>
                    <p>{asm.description}</p>
                    <div style={{ display: "flex", gap: 14, fontSize: "0.85rem", color: "var(--muted)", margin: "16px 0" }}>
                      <span>📊 <strong>{qCount}</strong> Questions</span>
                      <span>🎯 {asm.class_target}</span>
                      <span>🏆 {asm.exam_target}</span>
                    </div>
                  </div>
                  <Link href={`/assessments/${asm.id}`} className="btn btn-primary" style={{ width: "100%" }}>
                    Start Diagnostic Exam →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 2: Targeted Subject Sprints */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            ⚡ {selectedFocus === "all" ? "Targeted Class Subject Sprints" : `${selectedFocus.toUpperCase()} Focused Practice Sprints`}
          </h2>
          <span className="badge badge-neutral">
            {filteredSprints.length} {filteredSprints.length === 1 ? "Drill Available" : "Drills Available"}
          </span>
        </div>

        {filteredSprints.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 32 }}>
            <p style={{ color: "var(--muted)" }}>No sprint tests found for this filter. Try another subject focus chip above.</p>
          </div>
        ) : (
          <div className="grid">
            {filteredSprints.map((asm) => {
              const qCount = resolveQuestionIdsForAssessment(asm.id).length;
              const mins = asm.time_limit_seconds ? Math.floor(asm.time_limit_seconds / 60) : 5;

              return (
                <div className="card" key={asm.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span className="badge badge-neutral">Single-Subject Sprint</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>⏱️ {mins} mins</span>
                    </div>
                    <h3>{asm.title}</h3>
                    <p>{asm.description}</p>
                    <div style={{ display: "flex", gap: 14, fontSize: "0.85rem", color: "var(--muted)", margin: "16px 0" }}>
                      <span>📊 <strong>{qCount}</strong> Questions</span>
                      <span>🎯 {asm.class_target}</span>
                    </div>
                  </div>
                  <Link href={`/assessments/${asm.id}`} className="btn btn-primary btn-sm" style={{ width: "100%" }}>
                    Start Sprint →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 3: National Competitions & Archives */}
      {selectedFocus === "all" && (
        <>
          {challengeTests.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <h2 className="section-title" style={{ margin: 0 }}>🏆 State Academic Championship Qualifier</h2>
                <span className="badge badge-success">36-State Circuit</span>
              </div>
              <div className="grid">
                {challengeTests.map((asm) => (
                  <div className="card" key={asm.id} style={{ borderColor: "#a3e635", background: "#fcfef8" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span className="badge badge-success">State League</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>⏱️ 6 mins</span>
                    </div>
                    <h3>{asm.title}</h3>
                    <p>{asm.description}</p>
                    <Link href={`/assessments/${asm.id}`} className="btn btn-primary btn-sm" style={{ marginTop: 14, width: "100%" }}>
                      Enter State Qualifier →
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(() => {
            const relevantArchive = seedAssessments.filter((asm) => {
              if (educationLevel === "primary") return asm.education_level === "primary";
              if (educationLevel === "junior_secondary") return asm.education_level === "junior_secondary";
              return asm.education_level === "senior_secondary" || !asm.education_level;
            });

            if (relevantArchive.length === 0) return null;

            return (
              <section>
                <h2 className="section-title" style={{ marginBottom: 16 }}>📚 Official Archive &amp; Foundational Papers</h2>
                <div className="grid">
                  {relevantArchive.map((asm) => (
                    <div className="card" key={asm.id}>
                      <span className="badge badge-neutral" style={{ marginBottom: 8 }}>Archive Paper</span>
                      <h3>{asm.title}</h3>
                      <p>{asm.description}</p>
                      <Link href={`/assessments/${asm.id}`} className="btn btn-outline btn-sm" style={{ marginTop: 14, width: "100%" }}>
                        Practise Archive →
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}
        </>
      )}
    </div>
  );
}

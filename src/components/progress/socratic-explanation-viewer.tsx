"use client";

import React from "react";

interface SocraticExplanationViewerProps {
  rawText: string;
  questionPrompt?: string;
  pedagogicalSolution?: string;
  subject?: string;
}

/**
 * Universal Socratic Explanation Viewer
 * Dynamically parses pedagogical solutions and explanation steps for any subject
 * (Sciences, Commercial, Arts, Primary/JSS) with zero hardcoded quadratic stubs.
 */
export function SocraticExplanationViewer({
  rawText,
  questionPrompt,
  pedagogicalSolution,
  subject
}: SocraticExplanationViewerProps) {
  // Use pedagogical solution if available, otherwise rawText
  const sourceText = pedagogicalSolution || rawText || "";

  // Split into lines and extract pedagogical steps
  const lines = sourceText.split("\n").map((l) => l.trim()).filter(Boolean);

  // Extract core concept (first paragraph or line with principle/concept)
  const coreConcept =
    lines.find((l) => {
      const lower = l.toLowerCase();
      return lower.includes("principle") || lower.includes("concept") || lower.includes("rule") || lower.includes("law") || lower.includes("formula");
    }) || lines[0] || "Governing curriculum principle and step-by-step resolution.";

  // Extract step lines (e.g. "Step 1:", "1.", or numbered sections)
  const stepLines: Array<{ stepNumber: number; title: string; detail: string }> = [];
  let currentStep = 1;

  for (const line of lines) {
    const stepMatch = line.match(/^(?:step\s*(\d+)[:.]?|(\d+)[:.]\s*|\*\*(?:step\s*(\d+)[:.]?|(\d+)[:.]))\s*(.*)/i);
    if (stepMatch) {
      const num = Number(stepMatch[1] || stepMatch[2] || stepMatch[3] || stepMatch[4] || currentStep);
      const text = (stepMatch[5] || "").replace(/\*\*/g, "").trim();
      const [title, ...rest] = text.split(/[:-]/);
      stepLines.push({
        stepNumber: num,
        title: (title || `Step ${num}`).trim(),
        detail: rest.join(":").trim() || text
      });
      currentStep = num + 1;
    }
  }

  // If no numbered steps found, chunk paragraphs into 2-3 logical steps
  if (stepLines.length === 0) {
    const meaningfulLines = lines.filter((l) => l.length > 20 && l !== coreConcept);
    if (meaningfulLines.length > 0) {
      meaningfulLines.slice(0, 3).forEach((line, idx) => {
        const clean = line.replace(/^[-*]\s*/, "").replace(/\*\*/g, "");
        stepLines.push({
          stepNumber: idx + 1,
          title: idx === 0 ? "Identify Given Quantities & Terms" : idx === 1 ? "Apply Statutory Formula / Rule" : "Calculate Final Result",
          detail: clean
        });
      });
    } else {
      stepLines.push({
        stepNumber: 1,
        title: "Pedagogical Resolution",
        detail: sourceText.replace(/\*\*/g, "").trim()
      });
    }
  }

  // Detect common pitfall or trap
  const pitfallLine = lines.find((l) => {
    const lower = l.toLowerCase();
    return lower.includes("trap") || lower.includes("mistake") || lower.includes("pitfall") || lower.includes("distractor") || lower.includes("warning") || lower.includes("caution");
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        color: "var(--ink)"
      }}
    >
      {questionPrompt && (
        <div style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--muted)", padding: "0 4px" }}>
          Curriculum Item: <span style={{ color: "var(--ink)" }}>{questionPrompt}</span>
        </div>
      )}

      {/* 1. Core Intuition & Foundational Concept */}
      <div
        className="glass-card"
        style={{
          padding: "16px 20px",
          borderRadius: 16,
          background: "var(--glass-surface-raised)",
          border: "1px solid var(--brand-border)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: "1.2rem" }}>💡</span>
          <strong style={{ fontSize: "0.95rem", color: "var(--brand-dark)" }}>
            Core Intuition &amp; Foundational Concept {subject ? `(${subject})` : ""}
          </strong>
        </div>
        <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.6, color: "var(--ink-secondary)" }}>
          {coreConcept.replace(/\*\*/g, "")}
        </p>
      </div>

      {/* 2. Step-by-Step Worked Resolution */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10
        }}
      >
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Step-by-Step Pedagogical Resolution
        </div>

        {stepLines.map((step) => (
          <div
            key={step.stepNumber}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              background: "var(--surface)",
              border: "1px solid var(--line)",
              display: "flex",
              alignItems: "flex-start",
              gap: 12
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "var(--brand)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.78rem",
                fontWeight: 800,
                flexShrink: 0,
                marginTop: 2
              }}
            >
              {step.stepNumber}
            </span>
            <div>
              <strong style={{ fontSize: "0.88rem", color: "var(--ink)", display: "block" }}>
                {step.title}
              </strong>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}>
                {step.detail}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Statutory Exam Pitfall / Trap Highlight */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 14,
          background: "rgba(220, 38, 38, 0.08)",
          border: "1px solid rgba(220, 38, 38, 0.25)",
          display: "flex",
          alignItems: "flex-start",
          gap: 10
        }}
      >
        <span style={{ fontSize: "1.3rem" }}>⚠️</span>
        <div>
          <strong style={{ fontSize: "0.86rem", color: "var(--danger)", display: "block" }}>
            WAEC / NECO / JAMB Common Distractor Pitfall
          </strong>
          <span style={{ fontSize: "0.82rem", color: "var(--ink-secondary)", lineHeight: 1.45 }}>
            {pitfallLine
              ? pitfallLine.replace(/\*\*/g, "").replace(/^.*pitfall[:.]?/i, "").trim()
              : "Examiners frequently include common arithmetic sign errors or reciprocal inversions as options. Double-check your formula substitution before confirming your answer!"}
          </span>
        </div>
      </div>
    </div>
  );
}

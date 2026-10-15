"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface QuickLaunchCBTSprintProps {
  examGoal?: string;
  classLabel?: string;
  assessmentId?: string;
  subjectTitle?: string;
}

export function QuickLaunchCBTSprint({
  examGoal = "Statutory Exam Cycle",
  classLabel = "SSS 3 Science",
  assessmentId = "asm-sprint-sss-math-trig",
  subjectTitle = "General Mathematics & Trigonometry"
}: QuickLaunchCBTSprintProps) {
  const router = useRouter();
  const [isKeyboardHintOpen, setIsKeyboardHintOpen] = useState(false);

  // Global Hotkey: Cmd/Ctrl + Enter launches test immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        router.push(`/assessments/${assessmentId}`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [assessmentId, router]);

  return (
    <div
      className="glass-card"
      style={{
        marginBottom: 28,
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 78, 59, 0.03) 100%)",
        border: "1px solid rgba(16, 185, 129, 0.35)",
        borderRadius: 20,
        padding: "24px 28px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 18 }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                color: "#10b981",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "3px 10px",
                borderRadius: 9999,
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}
            >
              ⚡ {new Date().getFullYear()} Flight Deck • 10-Question Sprint
            </span>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--muted)",
                background: "var(--surface-sunken)",
                padding: "3px 8px",
                borderRadius: 6
              }}
            >
              📶 2G Offline Resilient
            </span>
          </div>

          <h3 style={{ fontSize: "1.4rem", margin: "4px 0 8px", color: "var(--ink)", fontWeight: 800 }}>
            Quick-Launch CBT Fire Sprint: {subjectTitle}
          </h3>

          <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.5, margin: "0 0 14px 0" }}>
            Simulate real examination hall conditions. Uses authentic JAMB hotkeys:{" "}
            <kbd style={{ background: "var(--surface-sunken)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 4, fontSize: "0.78rem" }}>A</kbd>,{" "}
            <kbd style={{ background: "var(--surface-sunken)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 4, fontSize: "0.78rem" }}>B</kbd>,{" "}
            <kbd style={{ background: "var(--surface-sunken)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 4, fontSize: "0.78rem" }}>C</kbd>,{" "}
            <kbd style={{ background: "var(--surface-sunken)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 4, fontSize: "0.78rem" }}>D</kbd>{" "}
            to answer, <kbd style={{ background: "var(--surface-sunken)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 4, fontSize: "0.78rem" }}>N</kbd> next,{" "}
            <kbd style={{ background: "var(--surface-sunken)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 4, fontSize: "0.78rem" }}>P</kbd> previous.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: "0.82rem", color: "var(--muted)" }}>
            <span>🎯 Target: <strong>{classLabel}</strong></span>
            <span>🏆 Standard: <strong>{examGoal}</strong></span>
            <span>⏱️ Timer: <strong>10 Mins (60s/Q)</strong></span>
            <span>🔒 Anti-Malpractice: <strong>Active</strong></span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "stretch", minWidth: 200 }}>
          <Link
            href={`/assessments/${assessmentId}`}
            className="btn btn-primary"
            style={{
              padding: "14px 22px",
              fontSize: "0.98rem",
              fontWeight: 800,
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(16, 185, 129, 0.35)",
              borderRadius: 12
            }}
          >
            🚀 Launch CBT Sprint Now →
          </Link>

          <button
            type="button"
            onClick={() => setIsKeyboardHintOpen(!isKeyboardHintOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              fontSize: "0.78rem",
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            {isKeyboardHintOpen ? "Hide Hotkey Guide ▲" : "⌨️ View Keyboard Shortcuts ▾"}
          </button>
        </div>
      </div>

      {isKeyboardHintOpen && (
        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid rgba(16, 185, 129, 0.2)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 10,
            fontSize: "0.8rem"
          }}
        >
          <div style={{ background: "var(--surface)", padding: 8, borderRadius: 8 }}>
            <strong>[A] [B] [C] [D]</strong>: Pick Option
          </div>
          <div style={{ background: "var(--surface)", padding: 8, borderRadius: 8 }}>
            <strong>[N] / [Right Arrow]</strong>: Next Question
          </div>
          <div style={{ background: "var(--surface)", padding: 8, borderRadius: 8 }}>
            <strong>[P] / [Left Arrow]</strong>: Previous Question
          </div>
          <div style={{ background: "var(--surface)", padding: 8, borderRadius: 8 }}>
            <strong>[S]</strong>: Submit Assessment
          </div>
          <div style={{ background: "var(--surface)", padding: 8, borderRadius: 8 }}>
            <strong>[Ctrl+Enter]</strong>: Quick-Launch Sprint
          </div>
        </div>
      )}
    </div>
  );
}

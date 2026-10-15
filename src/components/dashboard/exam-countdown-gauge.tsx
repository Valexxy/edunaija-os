"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  calculateLiveExamCountdown, 
  recalibrateDailyStudyPace 
} from "@/lib/curriculum/exam-calendar";

interface ExamCountdownGaugeProps {
  examGoal?: string;
  classLabel?: string;
  targetCutoff?: number;
  projectedScore?: number;
  learnerCompetencies?: Array<{ name: string; accuracyPercent: number; masteryPercent: number; status: string; questionsAttempted?: number }>;
}

export function ExamCountdownGauge({
  examGoal = "JAMB UTME / WAEC WASSCE",
  classLabel = "SSS 3 Science",
  targetCutoff = 310,
  projectedScore = 0,
  learnerCompetencies
}: ExamCountdownGaugeProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Initial calculation from local baseline engine
  const initialLiveExam = calculateLiveExamCountdown(examGoal);
  const [liveExam, setLiveExam] = useState(initialLiveExam);
  const [studyPace, setStudyPace] = useState(() => recalibrateDailyStudyPace(initialLiveExam.daysRemaining));

  // Dynamic live sync: check if JAMB or WAEC has published date adjustments
  useEffect(() => {
    let isMounted = true;
    async function syncOfficialExamSchedule() {
      try {
        const res = await fetch(`/api/curriculum/exam-calendar?examGoal=${encodeURIComponent(examGoal)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.countdown) {
          setLiveExam(data.countdown);
          if (data.studyPace) {
            setStudyPace(data.studyPace);
          }
        }
      } catch {
        // Graceful offline fallback to in-memory calculations
      }
    }
    syncOfficialExamSchedule();
    return () => { isMounted = false; };
  }, [examGoal]);

  const daysLeft = liveExam.daysRemaining;
  const hasAttempts = Boolean(
    (projectedScore > 0) ||
    (learnerCompetencies && learnerCompetencies.some((c) => ((c.questionsAttempted && c.questionsAttempted > 0) || c.accuracyPercent > 0)))
  );
  const percentage = hasAttempts ? Math.min(100, Math.round((projectedScore / targetCutoff) * 100)) : 0;

  const palette = ["#10b981", "#06b6d4", "#f59e0b", "#ec4899", "#8b5cf6"];
  const subjectReadiness = (learnerCompetencies && learnerCompetencies.length > 0)
    ? learnerCompetencies.slice(0, 4).map((c, i) => {
        const attempted = Boolean((c.questionsAttempted && c.questionsAttempted > 0) || c.accuracyPercent > 0);
        const accuracy = attempted ? Math.min(100, Math.round(c.accuracyPercent)) : 0;
        return {
          subject: c.name,
          target: 80,
          current: accuracy,
          color: palette[i % palette.length],
          status: !attempted ? "Drill Needed" : accuracy >= 85 ? "Strong" : accuracy >= 70 ? "On Track" : "Needs Practice"
        };
      })
    : [
        { subject: "Use of English", target: 80, current: 0, color: "#10b981", status: "Drill Needed" },
        { subject: "Mathematics", target: 85, current: 0, color: "#06b6d4", status: "Drill Needed" },
        { subject: "Physics", target: 75, current: 0, color: "#f59e0b", status: "Drill Needed" },
        { subject: "Chemistry", target: 75, current: 0, color: "#ec4899", status: "Drill Needed" },
      ];

  return (
    <div
      className="glass-card"
      style={{
        marginBottom: 28,
        background: "var(--glass-surface-raised)",
        border: "1px solid var(--glass-border)",
        boxShadow: "var(--glass-highlight), var(--glass-shadow)",
        padding: "24px 28px",
        borderRadius: 20,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Official Regulatory Date Shift Notice Banner */}
      {liveExam.status === "POSTPONED_SHIFTED" && (
        <div
          style={{
            marginBottom: 18,
            padding: "12px 16px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            borderRadius: 12,
            display: "flex",
            alignItems: "flex-start",
            gap: 12
          }}
        >
          <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>📢</span>
          <div style={{ flex: 1, fontSize: "0.85rem", color: "var(--ink)" }}>
            <strong style={{ color: "#f59e0b" }}>
              Official Regulatory Schedule Adjustment:
            </strong>{" "}
            {liveExam.governingBody} has adjusted {liveExam.officialName} timetable from{" "}
            <del style={{ color: "var(--muted)" }}>{liveExam.previousStartDate}</del> to{" "}
            <strong>{liveExam.startDateIso}</strong>.
            {liveExam.shiftReason && (
              <div style={{ marginTop: 4, color: "var(--muted)", fontStyle: "italic" }}>
                Reason: &ldquo;{liveExam.shiftReason}&rdquo;
              </div>
            )}
            <div style={{ marginTop: 4, fontWeight: 700, color: "#10b981" }}>
              ✓ Daily study targets have automatically recalibrated to maintain optimal pacing.
            </div>
          </div>
        </div>
      )}

      {/* Top Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                color: liveExam.status === "POSTPONED_SHIFTED" ? "#f59e0b" : "#10b981",
                background: liveExam.status === "POSTPONED_SHIFTED" ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)",
                border: liveExam.status === "POSTPONED_SHIFTED" ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
                padding: "3px 10px",
                borderRadius: 9999,
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}
            >
              {liveExam.status === "POSTPONED_SHIFTED" ? "🔄 Timetable Adjusted" : "⏳ Countdown Gauge"}
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              {liveExam.officialName} • {liveExam.statutorySource}
            </span>
          </div>
          <h2 style={{ fontSize: "1.45rem", margin: 0, fontWeight: 900, letterSpacing: "-0.02em", color: "var(--ink)" }}>
            {examGoal} Readiness Flight Path
          </h2>
        </div>

        {/* Days Left Highlight Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "10px 18px",
            borderRadius: 14
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Countdown
            </div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: daysLeft <= 50 ? "#ef4444" : "#10b981", lineHeight: 1 }}>
              {daysLeft} <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Days</span>
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: daysLeft <= 50 ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
              border: daysLeft <= 50 ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem"
            }}
          >
            🎯
          </div>
        </div>
      </div>

      {/* Main Cutoff Meter & Projections */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          alignItems: "center",
          background: "var(--glass-surface)",
          border: "1px solid var(--glass-border)",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 20
        }}
      >
        {/* Score Meter */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink)" }}>
              Projected Mock Aggregate
            </span>
            <span style={{ fontSize: "1.1rem", fontWeight: 900, color: hasAttempts ? "#10b981" : "#f59e0b" }}>
              {hasAttempts ? projectedScore : 0} <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 500 }}>/ {targetCutoff} Goal {hasAttempts ? "" : "(Baseline Needed)"}</span>
            </span>
          </div>

          {/* Progress Bar with Milestones */}
          <div style={{ position: "relative", height: 14, background: "rgba(255, 255, 255, 0.08)", borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
            <div
              style={{
                width: `${percentage}%`,
                height: "100%",
                background: "linear-gradient(90deg, #10b981 0%, #06b6d4 100%)",
                borderRadius: 8,
                transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--muted)" }}>
            <span>Min Cutoff: {examGoal.includes("Primary") || examGoal.includes("NCEE") ? 100 : examGoal.includes("BECE") ? 50 : 200}</span>
            <span>Target Cutoff: {targetCutoff}</span>
            <span>Status: <strong style={{ color: hasAttempts ? "#10b981" : "#f59e0b" }}>{hasAttempts ? `${percentage}% Pace` : "Baseline Required"}</strong></span>
          </div>
        </div>

        {/* Dynamic Study Pace Recalibration Card */}
        <div
          style={{
            borderLeft: "1px solid var(--glass-border)",
            paddingLeft: 20,
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.95rem" }}>⚡</span>
            <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink)" }}>
              Dynamic Study Pace:
            </span>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 800,
                color: studyPace.pacingState === "emergency" ? "#ef4444" : studyPace.pacingState === "sprint" ? "#f59e0b" : "#10b981",
                background: studyPace.pacingState === "emergency" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                padding: "2px 8px",
                borderRadius: 9999,
                textTransform: "uppercase"
              }}
            >
              {studyPace.pacingState} ({studyPace.recommendedHoursPerDay} hrs/day)
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.45 }}>
            Target: <strong>{studyPace.dailyTargetQuestions} questions daily</strong> across {studyPace.remainingTopics} remaining curriculum topics.
          </p>
          <div style={{ fontSize: "0.78rem", color: "var(--brand)", fontWeight: 600 }}>
            {studyPace.guidanceMessage}
          </div>
        </div>
      </div>

      {/* Subject-by-Subject Readiness Chips */}
      <div>
        <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>
          Four-Subject Breakdown:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {subjectReadiness.map((sub) => (
            <div
              key={sub.subject}
              onClick={() => setSelectedSubject(sub.subject === selectedSubject ? null : sub.subject)}
              style={{
                background: selectedSubject === sub.subject ? "rgba(16, 185, 129, 0.1)" : "var(--glass-surface)",
                border: selectedSubject === sub.subject ? "1px solid var(--brand)" : "1px solid var(--glass-border)",
                borderRadius: 12,
                padding: "12px 14px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--ink)" }}>{sub.subject}</span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: sub.color,
                    background: `${sub.color}15`,
                    padding: "2px 6px",
                    borderRadius: 6
                  }}
                >
                  {sub.status}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--muted)" }}>
                <span>Score: {sub.current > 0 ? `${sub.current}%` : "0% (Diagnostic Needed)"}</span>
                <span>Target: {sub.target}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
        <Link href="/assessments/asm-jamb-full-mock" className="btn btn-secondary btn-sm">
          📝 Simulate Full CBT Mock
        </Link>
        <Link href="/pricing" className="btn btn-outline btn-sm">
          🔍 Verify Statutory Exam Standards →
        </Link>
      </div>
    </div>
  );
}

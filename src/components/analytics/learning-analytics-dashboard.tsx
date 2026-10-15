"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  getDynamicExamForecast,
  getRollingWeeklyVelocity,
  getTrackScholarBadges
} from "@/lib/curriculum/learner-curriculum";

interface SubjectMetric {
  name: string;
  code: string;
  masteryPercent: number;
  accuracyPercent: number;
  questionsAttempted: number;
  status: "Secure" | "Proficient" | "Developing" | "Drill Needed";
  strongTopic: string;
  weakTopic: string;
}

interface DailyVelocity {
  day: string;
  date: string;
  minutes: number;
  targetMinutes: number;
  questionsCount: number;
}

interface LearningAnalyticsDashboardProps {
  userName?: string;
  classLabel?: string;
  examGoal?: string;
  stateName?: string;
  streakDays?: number;
  totalXp?: number;
  studyMinutes?: number;
  masteryData?: Record<string, { attempts: number; correct: number; score: number }>;
  learnerCompetencies?: SubjectMetric[];
}

const DEFAULT_SUBJECTS: SubjectMetric[] = [
  {
    name: "General Mathematics",
    code: "MTH",
    masteryPercent: 0,
    accuracyPercent: 0,
    questionsAttempted: 0,
    status: "Drill Needed",
    strongTopic: "Algebra & Number Bases",
    weakTopic: "Surds & Trigonometry"
  },
  {
    name: "English Language",
    code: "ENG",
    masteryPercent: 0,
    accuracyPercent: 0,
    questionsAttempted: 0,
    status: "Drill Needed",
    strongTopic: "Lexis & Structure",
    weakTopic: "Oral English & Stress"
  },
  {
    name: "Physics",
    code: "PHY",
    masteryPercent: 0,
    accuracyPercent: 0,
    questionsAttempted: 0,
    status: "Drill Needed",
    strongTopic: "Mechanics & Kinematics",
    weakTopic: "Electromagnetism & Waves"
  },
  {
    name: "Chemistry",
    code: "CHM",
    masteryPercent: 0,
    accuracyPercent: 0,
    questionsAttempted: 0,
    status: "Drill Needed",
    strongTopic: "Periodic Table & Bonding",
    weakTopic: "Organic Chemistry"
  },
  {
    name: "Biology",
    code: "BIO",
    masteryPercent: 0,
    accuracyPercent: 0,
    questionsAttempted: 0,
    status: "Drill Needed",
    strongTopic: "Cell Structure & Genetics",
    weakTopic: "Ecology & Energy Flow"
  }
];

export function LearningAnalyticsDashboard({
  userName = "Scholar",
  classLabel = "SSS 3",
  examGoal = "JAMB UTME 2026",
  stateName = "Anambra",
  streakDays = 0,
  totalXp = 0,
  studyMinutes = 0,
  masteryData = {},
  learnerCompetencies
}: LearningAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "exam_readiness" | "velocity">("overview");

  // Dynamic weekly rolling velocity
  const weeklyVelocity = useMemo(() => getRollingWeeklyVelocity(studyMinutes), [studyMinutes]);
  const [selectedDay, setSelectedDay] = useState<DailyVelocity>(weeklyVelocity[weeklyVelocity.length - 1]);

  // Active Subject List (dynamically matching learner's grade and track)
  const activeSubjectList = useMemo(() => {
    return (learnerCompetencies && learnerCompetencies.length > 0) ? learnerCompetencies : DEFAULT_SUBJECTS;
  }, [learnerCompetencies]);

  // Dynamic calculations from real mastery evidence
  const masteryValues = Object.values(masteryData);
  const totalMasteryAttempts = masteryValues.reduce((acc, m) => acc + m.attempts, 0);
  const hasCompetencyAttempts = Boolean(
    learnerCompetencies && learnerCompetencies.some((c) => (c.questionsAttempted || 0) > 0 || (c.accuracyPercent || 0) > 0 || (c.masteryPercent || 0) > 0)
  );
  const hasAttempts = totalMasteryAttempts > 0 || masteryValues.length > 0 || hasCompetencyAttempts;
  const isExplicitZeroNewUser = !hasAttempts;

  // Real average mastery score - never fake 78% when user has no attempts!
  const avgMasteryScore = hasAttempts
    ? (masteryValues.length > 0
        ? Math.round(masteryValues.reduce((acc, m) => acc + m.score, 0) / (masteryValues.length || 1))
        : Math.round(activeSubjectList.reduce((acc, s) => acc + s.masteryPercent, 0) / (activeSubjectList.length || 1)))
    : 0;
  const overallMastery = avgMasteryScore;

  // Dynamic multi-track exam forecast predictions
  const examForecast = useMemo(() => {
    return getDynamicExamForecast(activeSubjectList, classLabel, examGoal);
  }, [activeSubjectList, classLabel, examGoal]);

  // Dynamic track-specific scholar badges
  const scholarBadges = useMemo(() => {
    return getTrackScholarBadges(classLabel, classLabel);
  }, [classLabel]);

  // Aggregate stats: strictly respect 0 values without falsy fallback to 475 mins
  const totalMinutes = typeof studyMinutes === "number" ? studyMinutes : weeklyVelocity.reduce((acc, d) => acc + d.minutes, 0);
  const totalQuestions = hasAttempts
    ? totalMasteryAttempts
    : (typeof studyMinutes === "number" && studyMinutes > 0 ? weeklyVelocity.reduce((acc, d) => acc + d.questionsCount, 0) : 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const predictedJambScore = examForecast.compositeScore;
  const maxDayMinutes = Math.max(...weeklyVelocity.map((d) => d.minutes), 1);

  // Gamification calculations
  const scholarLevel = Math.max(1, Math.floor(totalXp / 300));
  const currentLevelFloor = (scholarLevel - 1) * 300;
  const nextLevelCeil = scholarLevel * 300 + 300;
  const xpPercent = totalXp === 0 ? 0 : Math.min(100, Math.max(0, Math.round(((totalXp - currentLevelFloor) / (nextLevelCeil - currentLevelFloor)) * 100)));
  const xpNeeded = Math.max(0, nextLevelCeil - totalXp);
  const earnedTodayXp = Math.min(totalXp, Math.round(totalXp % 300));

  // Mastery categories
  const secureCount = activeSubjectList.filter((s) => s.status === "Secure").length;
  const proficientCount = activeSubjectList.filter((s) => s.status === "Proficient").length;
  const developingCount = activeSubjectList.filter((s) => s.status === "Developing").length;


  return (
    <section
      style={{
        marginBottom: 32,
        position: "relative"
      }}
      aria-label="Academic Analytics Dashboard"
    >
      {/* Outer Glass Container */}
      <div
        className="glass-card"
        style={{
          padding: "28px",
          border: "1px solid var(--glass-border)",
          background: "var(--glass-surface)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "var(--glass-highlight), var(--glass-shadow-lg)",
          borderRadius: 24,
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Ambient Top Glow Mesh */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: 80,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--canvas-mesh-1) 0%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(20px)"
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -50,
            left: 40,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--canvas-mesh-2) 0%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(20px)"
          }}
        />

        {/* Section Header with Real-Time Pill & Filter Tabs */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
            borderBottom: "1px solid var(--line)",
            paddingBottom: 18
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="glass-pill" style={{ color: "var(--brand)", borderColor: "var(--brand-border)" }}>
                ⚡ Live Academic Intelligence
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.8rem",
                  color: "var(--muted)",
                  fontWeight: 600
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "var(--brand)",
                    boxShadow: "0 0 8px var(--brand)"
                  }}
                />
                Syncing with NERDC Item Bank
              </span>
            </div>
            <h2
              style={{
                fontSize: "1.65rem",
                margin: 0,
                letterSpacing: "-0.03em",
                color: "var(--ink)",
                fontWeight: 900
              }}
            >
              Academic Analytics &amp; Mastery Engine
            </h2>
            <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.92rem" }}>
              Calibrated for {userName} &bull; {classLabel} &bull; Target: {examGoal} ({stateName} State)
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div
            style={{
              display: "flex",
              gap: 6,
              background: "var(--glass-surface-raised)",
              padding: "4px",
              borderRadius: 14,
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--glass-highlight)"
            }}
          >
            {[
              { id: "overview", label: "📊 Overview" },
              { id: "subjects", label: "📚 Subject Mastery" },
              { id: "exam_readiness", label: "🎯 Exam Forecast" },
              { id: "velocity", label: "⏱️ Study Velocity" }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  style={{
                    border: "none",
                    background: isActive ? "var(--brand)" : "transparent",
                    color: isActive ? "#ffffff" : "var(--ink-secondary)",
                    padding: "8px 14px",
                    borderRadius: 10,
                    fontSize: "0.84rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? "0 4px 12px var(--brand-glow)" : "none"
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            TAB 1: OVERVIEW COMPREHENSIVE VIEW
            ========================================================================= */}
        {activeTab === "overview" && (
          <div>
            {/* Top Stat Row: Key High-Velocity Metrics */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 16,
                marginBottom: 24
              }}
            >
              {/* Stat 1: Overall Mastery */}
              <div
                style={{
                  background: "var(--glass-surface-raised)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 18,
                  padding: "18px 20px",
                  boxShadow: "var(--glass-highlight)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--muted)" }}>Curriculum Mastery</span>
                  <span className={`badge ${!isExplicitZeroNewUser ? "badge-success" : "badge-neutral"}`} style={{ fontSize: "0.75rem" }}>
                    {!isExplicitZeroNewUser ? (overallMastery >= 75 ? "Top 4%" : overallMastery >= 50 ? "Proficient" : "Calibrating") : "Baseline Pending"}
                  </span>
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--brand)", letterSpacing: "-0.03em" }}>
                  {overallMastery}%
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 4 }}>
                  {!isExplicitZeroNewUser
                    ? `🟢 ${secureCount} Secure • 🔵 ${proficientCount} Proficient • 🟡 ${developingCount} Developing`
                    : "Complete 1 diagnostic CBT to establish curriculum baseline"}
                </div>
              </div>

              {/* Stat 2: Projected JAMB UTME */}
              <div
                style={{
                  background: "var(--glass-surface-raised)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 18,
                  padding: "18px 20px",
                  boxShadow: "var(--glass-highlight)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--muted)" }}>
                    {classLabel.toLowerCase().includes("primary")
                      ? "Projected Common Entrance"
                      : classLabel.toLowerCase().includes("jss")
                      ? "Projected BECE Result"
                      : "Projected UTME Score"}
                  </span>
                  <span className={`badge ${!isExplicitZeroNewUser ? "badge-warning" : "badge-neutral"}`} style={{ fontSize: "0.75rem" }}>
                    {!isExplicitZeroNewUser ? "Predicted" : "Diagnostic Needed"}
                  </span>
                </div>
                <div style={{ fontSize: !isExplicitZeroNewUser ? "2rem" : "1.6rem", fontWeight: 900, color: "var(--accent-gold)", letterSpacing: "-0.03em" }}>
                  {!isExplicitZeroNewUser ? (
                    <>
                      {examForecast.compositeScore}{" "}
                      <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--muted)" }}>/ {examForecast.maxComposite}</span>
                    </>
                  ) : (
                    "Calibrating..."
                  )}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 4 }}>
                  {!isExplicitZeroNewUser ? (
                    <span>{examForecast.secondaryTitle}: <strong>{examForecast.secondaryScoreText}</strong></span>
                  ) : (
                    "Take 1 diagnostic test to unlock predictive cutoff score"
                  )}
                </div>
              </div>

              {/* Stat 3: 7-Day Study Hours */}
              <div
                style={{
                  background: "var(--glass-surface-raised)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 18,
                  padding: "18px 20px",
                  boxShadow: "var(--glass-highlight)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--muted)" }}>Weekly Study Velocity</span>
                  <span className="badge badge-neutral" style={{ fontSize: "0.75rem" }}>
                    {totalMinutes > 0 ? `${totalMinutes}m logged` : "Baseline Week"}
                  </span>
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.03em" }}>
                  {totalHours} <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--muted)" }}>hours</span>
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 4 }}>
                  {totalQuestions} questions completed across 7 days
                </div>
              </div>

              {/* Stat 4: Active Flame Streak */}
              <div
                style={{
                  background: "var(--glass-surface-raised)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 18,
                  padding: "18px 20px",
                  boxShadow: "var(--glass-highlight)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--muted)" }}>Retention Streak</span>
                  <span className={`badge ${streakDays >= 3 ? "badge-success" : "badge-neutral"}`} style={{ fontSize: "0.75rem" }}>
                    {streakDays >= 3 ? "🛡️ Shield Active" : streakDays > 0 ? "🔥 In Progress" : "Start Today"}
                  </span>
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "#EA580C", letterSpacing: "-0.03em" }}>
                  🔥 {streakDays} Days
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 4 }}>
                  Level {scholarLevel} Scholar &bull; {totalXp.toLocaleString()} / {nextLevelCeil.toLocaleString()} XP
                </div>
              </div>
            </div>

            {/* Split Grid: Left = Radial Mastery Dial & Competencies; Right = 7-Day Velocity Chart */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                gap: 20,
                marginBottom: 20
              }}
            >
              {/* Left Card: Concentric Radial Mastery Gauge */}
              <div
                style={{
                  background: "var(--glass-surface-raised)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: "var(--glass-highlight)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--ink)" }}>🎯 Mastery Gauge</h3>
                  <span className="pill">Pillars 4 &amp; 5</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
                  {/* Circular SVG Progress Meter */}
                  <div style={{ position: "relative", width: 140, height: 140 }}>
                    <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
                      {/* Background track circle */}
                      <circle
                        cx="70"
                        cy="70"
                        r="56"
                        fill="none"
                        stroke="var(--line)"
                        strokeWidth="12"
                      />
                      {/* Active progress stroke */}
                      <circle
                        cx="70"
                        cy="70"
                        r="56"
                        fill="none"
                        stroke="var(--brand)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 56}
                        strokeDashoffset={2 * Math.PI * 56 * (1 - overallMastery / 100)}
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <span style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--ink)", lineHeight: 1 }}>
                        {overallMastery}%
                      </span>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--muted)", marginTop: 4, letterSpacing: "0.05em" }}>
                        PROFICIENT
                      </span>
                    </div>
                  </div>

                  {/* Competency Tiers Breakdown */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: 4 }}>
                        <span style={{ color: "var(--success)" }}>🟢 Secure (&ge;85%)</span>
                        <span style={{ color: "var(--ink)" }}>{secureCount} {secureCount === 1 ? "Subject" : "Subjects"}</span>
                      </div>
                      <div style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((secureCount / (activeSubjectList.length || 1)) * 100)}%`, height: "100%", background: "var(--success)" }} />
                      </div>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: 4 }}>
                        <span style={{ color: "var(--info)" }}>🔵 Proficient (70-84%)</span>
                        <span style={{ color: "var(--ink)" }}>{proficientCount} {proficientCount === 1 ? "Subject" : "Subjects"}</span>
                      </div>
                      <div style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((proficientCount / (activeSubjectList.length || 1)) * 100)}%`, height: "100%", background: "var(--info)" }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: 4 }}>
                        <span style={{ color: "var(--warning)" }}>🟡 Developing (&lt;70%)</span>
                        <span style={{ color: "var(--ink)" }}>{developingCount} {developingCount === 1 ? "Subject" : "Subjects"}</span>
                      </div>
                      <div style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${Math.round((developingCount / (activeSubjectList.length || 1)) * 100)}%`, height: "100%", background: "var(--warning)" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    padding: "10px 14px",
                    background: "var(--glass-surface)",
                    borderRadius: 12,
                    border: "1px solid var(--glass-border)",
                    fontSize: "0.84rem",
                    color: "var(--muted)",
                    lineHeight: 1.5
                  }}
                >
                  {hasAttempts ? (() => {
                    const focusSubject = activeSubjectList.find((s) => s.status === "Developing" || s.status === "Drill Needed") || activeSubjectList[0];
                    return (
                      <span>
                        💡 <strong>Recommendation:</strong> {focusSubject?.name || "Subject"} is currently in <em>{focusSubject?.status || "Calibration"}</em> (focus area: {focusSubject?.weakTopic || "Core Concepts"}). Completing 2 targeted drills will accelerate your overall curriculum mastery.
                      </span>
                    );
                  })() : (
                    <span>
                      💡 <strong>Recommendation:</strong> Complete your first diagnostic drill or CBT sprint to establish baseline competencies and personalized study recommendations.
                    </span>
                  )}
                </div>
              </div>

              {/* Right Card: Weekly Study Velocity Interactive Bar Chart */}
              <div
                style={{
                  background: "var(--glass-surface-raised)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: "var(--glass-highlight)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--ink)" }}>⏱️ Study Velocity (Last 7 Days)</h3>
                    <span className="badge badge-success">Target: 30m / day</span>
                  </div>
                  <p style={{ margin: "0 0 16px 0", fontSize: "0.84rem", color: "var(--muted)" }}>
                    Tap any day to view practice time and question volume.
                  </p>

                  {/* Bar Chart Container */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      height: 140,
                      gap: 8,
                      paddingBottom: 8,
                      borderBottom: "1px solid var(--line)"
                    }}
                  >
                    {weeklyVelocity.map((item) => {
                      const isSelected = selectedDay.day === item.day;
                      const heightPercent = Math.round((item.minutes / maxDayMinutes) * 100);
                      const metTarget = item.minutes >= item.targetMinutes;

                      return (
                        <div
                          key={item.day}
                          onClick={() => setSelectedDay(item)}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            cursor: "pointer",
                            gap: 6
                          }}
                        >
                          <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700 }}>
                            {item.minutes}m
                          </span>
                          <div
                            style={{
                              width: "100%",
                              maxWidth: 32,
                              height: `${heightPercent}%`,
                              minHeight: 12,
                              borderRadius: "6px 6px 2px 2px",
                              background: isSelected
                                ? "var(--brand)"
                                : metTarget
                                ? "rgba(8, 127, 91, 0.45)"
                                : "var(--line)",
                              transition: "all 0.2s ease",
                              boxShadow: isSelected ? "0 0 12px var(--brand-glow)" : "none"
                            }}
                          />
                          <span
                            style={{
                              fontSize: "0.76rem",
                              fontWeight: isSelected ? 800 : 600,
                              color: isSelected ? "var(--brand)" : "var(--ink-secondary)"
                            }}
                          >
                            {item.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Day Detail Pill */}
                <div
                  style={{
                    marginTop: 14,
                    padding: "10px 14px",
                    background: "var(--glass-surface)",
                    borderRadius: 12,
                    border: "1px solid var(--glass-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span style={{ fontSize: "0.84rem", color: "var(--ink)", fontWeight: 700 }}>
                    📅 {selectedDay.day} ({selectedDay.date}): {selectedDay.minutes} mins studied
                  </span>
                  <span className="badge badge-neutral" style={{ fontSize: "0.78rem" }}>
                    {selectedDay.questionsCount} questions solved
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Quick Subject Summary Strip */}
            <div
              style={{
                background: "var(--glass-surface-raised)",
                border: "1px solid var(--glass-border)",
                borderRadius: 20,
                padding: "20px 24px",
                boxShadow: "var(--glass-highlight)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--ink)" }}>📚 Core Subject Competencies</h3>
                <button
                  onClick={() => setActiveTab("subjects")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--brand)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  View Full Subject Breakdown &rarr;
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12
                }}
              >
                {activeSubjectList.map((sub) => {
                  const statusColor =
                    sub.status === "Secure"
                      ? "var(--success)"
                      : sub.status === "Proficient"
                      ? "var(--info)"
                      : "var(--warning)";

                  return (
                    <div
                      key={`${sub.code}-${sub.name}`}
                      style={{
                        background: "var(--glass-surface)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 14,
                        padding: "12px 14px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--ink)" }}>{sub.name}</span>
                        <span style={{ fontSize: "0.76rem", fontWeight: 700, color: statusColor }}>{sub.masteryPercent}%</span>
                      </div>
                      <div style={{ height: 6, background: "var(--line)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                        <div style={{ width: `${sub.masteryPercent}%`, height: "100%", background: statusColor }} />
                      </div>
                      <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                        {sub.questionsAttempted} questions &bull; {sub.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: SUBJECT MASTERY DEEP DRILL-DOWN
            ========================================================================= */}
        {activeTab === "subjects" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.92rem" }}>
                {classLabel.toLowerCase().includes("primary")
                  ? "Detailed accuracy, question provenance, and targeted intervention points per NCEE / Primary curriculum module."
                  : classLabel.toLowerCase().includes("jss")
                  ? "Detailed accuracy, question provenance, and targeted intervention points per NECO / BECE curriculum module."
                  : "Detailed accuracy, question provenance, and targeted intervention points per WAEC / JAMB syllabus module."}
              </p>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {activeSubjectList.map((subj) => (
                <div
                  key={`${subj.code}-${subj.name}`}
                  style={{
                    background: "var(--glass-surface-raised)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: 18,
                    padding: "20px 24px",
                    boxShadow: "var(--glass-highlight)"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 12,
                      marginBottom: 14
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span className="badge badge-neutral" style={{ fontSize: "0.76rem" }}>{subj.code}</span>
                        <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--ink)" }}>{subj.name}</h3>
                      </div>
                      <div style={{ fontSize: "0.84rem", color: "var(--muted)" }}>
                        {subj.questionsAttempted} Questions Practiced &bull; Accuracy: <strong>{subj.accuracyPercent}%</strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        className={
                          subj.status === "Secure"
                            ? "badge badge-success"
                            : subj.status === "Proficient"
                            ? "badge badge-neutral"
                            : "badge badge-warning"
                        }
                        style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                      >
                        {subj.status}
                      </span>
                      <Link
                        href={`/assessments?subject=${encodeURIComponent(subj.name)}`}
                        className="btn btn-primary btn-sm"
                        style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                      >
                        Practice Topic &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 700, marginBottom: 4 }}>
                      <span style={{ color: "var(--muted)" }}>Syllabus Coverage &amp; Mastery</span>
                      <span style={{ color: "var(--ink)" }}>{subj.masteryPercent}%</span>
                    </div>
                    <div style={{ height: 8, background: "var(--line)", borderRadius: 4, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${subj.masteryPercent}%`,
                          height: "100%",
                          background:
                            subj.status === "Secure"
                              ? "var(--success)"
                              : subj.status === "Proficient"
                              ? "var(--brand)"
                              : "var(--warning)"
                        }}
                      />
                    </div>
                  </div>

                  {/* Strong vs Weak Subtopic Intelligence */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                      background: "var(--glass-surface)",
                      borderRadius: 14,
                      padding: "12px 16px",
                      border: "1px solid var(--glass-border)"
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--success)", display: "block", marginBottom: 2 }}>
                        ✅ Highest Accuracy Area:
                      </span>
                      <span style={{ fontSize: "0.86rem", color: "var(--ink)", fontWeight: 600 }}>
                        {subj.strongTopic}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--danger)", display: "block", marginBottom: 2 }}>
                        ⚠️ Recommended Focus Drill:
                      </span>
                      <span style={{ fontSize: "0.86rem", color: "var(--ink)", fontWeight: 600 }}>
                        {subj.weakTopic}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: EXAM FORECAST & BENCHMARK PREDICTIONS
            ========================================================================= */}
        {activeTab === "exam_readiness" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.92rem" }}>
                Algorithmic projection based on your simulated CBT timing, error patterns, and NERDC syllabus depth.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                gap: 20,
                marginBottom: 20
              }}
            >
              {/* Box 1: Dynamic Primary Exam Composite */}
              <div
                style={{
                  background: "var(--glass-surface-raised)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: "var(--glass-highlight)"
                }}
              >
                <span className="pill" style={{ marginBottom: 10 }}>🎯 {examForecast.examName}</span>
                <h3 style={{ fontSize: "1.1rem", margin: "6px 0 12px", color: "var(--ink)" }}>Predicted Composite Score</h3>
                <div style={{ fontSize: "2.8rem", fontWeight: 900, color: "var(--brand)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                  {examForecast.compositeScore} <span style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--muted)" }}>/ {examForecast.maxComposite}</span>
                </div>
                <div style={{ marginTop: 12, fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.5 }}>
                  🎉 {examForecast.percentileText}
                </div>

                <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
                    Projected Subject Distribution:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.82rem" }}>
                    {examForecast.subjectForecasts.map((sub, idx) => (
                      <div key={idx} style={{ background: "var(--glass-surface)", padding: "6px 10px", borderRadius: 8 }}>
                        {sub.name}: <strong>{sub.score} / {sub.maxScore}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Box 2: Dynamic Secondary Grade Portfolio */}
              <div
                style={{
                  background: "var(--glass-surface-raised)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: "var(--glass-highlight)"
                }}
              >
                <span className="pill" style={{ marginBottom: 10 }}>📜 {examForecast.secondaryTitle}</span>
                <h3 style={{ fontSize: "1.1rem", margin: "6px 0 12px", color: "var(--ink)" }}>Estimated Portfolio</h3>
                <div style={{ fontSize: "2.8rem", fontWeight: 900, color: "var(--accent-gold)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                  {examForecast.secondaryScoreText}
                </div>
                <div style={{ marginTop: 12, fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.5 }}>
                  {examForecast.secondaryDetailText}
                </div>

                <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
                    Predicted Grade Matrix:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.82rem" }}>
                    {examForecast.subjectForecasts.map((sub, idx) => (
                      <div key={idx} style={{ background: "var(--glass-surface)", padding: "6px 10px", borderRadius: 8 }}>
                        {sub.name}: <span style={{ color: "var(--success)", fontWeight: 800 }}>{sub.grade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Benchmark Action Card */}
            <div
              style={{
                background: "var(--glass-surface-raised)",
                border: "1px solid var(--glass-border)",
                borderRadius: 18,
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16
              }}
            >
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: "1.05rem", color: "var(--ink)" }}>
                  Want to confirm your 320+ projection with a full 2-hour simulation?
                </h4>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--muted)" }}>
                  Take a complete 4-subject proctored mock examination under real JAMB timing rules.
                </p>
              </div>
              <Link href="/assessments" className="btn btn-primary">
                Launch Full Mock Exam &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: STUDY VELOCITY & GAMIFICATION
            ========================================================================= */}
        {activeTab === "velocity" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.92rem" }}>
                Consistency tracking, time management, and gamified XP progress designed to build healthy daily learning habits.
              </p>
            </div>

            {/* Level & XP Progress Card */}
            <div
              style={{
                background: "var(--glass-surface-raised)",
                border: "1px solid var(--glass-border)",
                borderRadius: 20,
                padding: 24,
                marginBottom: 20,
                boxShadow: "var(--glass-highlight)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                <div>
                  <span className="pill" style={{ marginBottom: 6 }}>Level {scholarLevel} Scholar</span>
                  <h3 style={{ margin: "4px 0 0", fontSize: "1.3rem", color: "var(--ink)" }}>Senior Academic Scholar</h3>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--brand)" }}>
                    {totalXp.toLocaleString()} <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>/ {nextLevelCeil.toLocaleString()} XP</span>
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{xpNeeded} XP until Level {scholarLevel + 1}</span>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div style={{ height: 12, background: "var(--line)", borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
                <div
                  style={{
                    width: `${xpPercent}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, var(--brand) 0%, #34D399 100%)",
                    boxShadow: "0 0 10px var(--brand-glow)"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--muted)" }}>
                <span>🔥 {streakDays}-Day Active Flame Streak</span>
                <span>⚡ +{earnedTodayXp} XP earned today</span>
              </div>
            </div>

            {/* Achievement Badges Showcase */}
            <div
              style={{
                background: "var(--glass-surface-raised)",
                border: "1px solid var(--glass-border)",
                borderRadius: 20,
                padding: 24,
                boxShadow: "var(--glass-highlight)"
              }}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", color: "var(--ink)" }}>🏅 Earned Scholar Badges</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 14
                }}
              >
                {scholarBadges.map((badge, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "var(--glass-surface)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: 14,
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12
                    }}
                  >
                    <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>{badge.icon}</span>
                    <div>
                      <h4 style={{ margin: "0 0 4px", fontSize: "0.92rem", color: "var(--ink)" }}>{badge.title}</h4>
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.4 }}>
                        {badge.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

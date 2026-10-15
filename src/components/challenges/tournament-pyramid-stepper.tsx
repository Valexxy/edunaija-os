"use client";

import React, { useState } from "react";
import { NIGERIAN_ACADEMIC_PYRAMID, PyramidStageConfig } from "@/lib/challenges/tournament-bracket";

interface TournamentPyramidStepperProps {
  currentStage?: "lga" | "state" | "zonal" | "national";
  onSelectStage?: (stage: PyramidStageConfig) => void;
}

export function TournamentPyramidStepper({
  currentStage = "state",
  onSelectStage
}: TournamentPyramidStepperProps) {
  const [selectedStageKey, setSelectedStageKey] = useState<string>(currentStage);

  const selectedStageConfig = NIGERIAN_ACADEMIC_PYRAMID.find((p) => p.stage === selectedStageKey) || NIGERIAN_ACADEMIC_PYRAMID[1];

  const handleStageClick = (stage: PyramidStageConfig) => {
    setSelectedStageKey(stage.stage);
    if (onSelectStage) {
      onSelectStage(stage);
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "lga": return "🏘️";
      case "state": return "🏙️";
      case "zonal": return "🗺️";
      case "national": return "🏛️";
      default: return "🎯";
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: "26px 28px",
        borderRadius: 20,
        marginBottom: 28,
        background: "var(--glass-surface-raised)",
        border: "1px solid var(--glass-border)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="badge badge-success">🏆 4-STAGE TOURNAMENT PYRAMID</span>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              Official National Academic Competition Progression
            </span>
          </div>
          <h2 style={{ fontSize: "1.45rem", margin: 0, fontWeight: 900, letterSpacing: "-0.02em" }}>
            Grassroots to National Grand Finale
          </h2>
        </div>
        <div style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 700, background: "rgba(16, 185, 129, 0.1)", padding: "6px 14px", borderRadius: 9999 }}>
          ● Active Diet: 36 States + FCT State Championships
        </div>
      </div>

      {/* Stepper Navigation Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 20
        }}
      >
        {NIGERIAN_ACADEMIC_PYRAMID.map((stage, idx) => {
          const isSelected = selectedStageKey === stage.stage;
          const isCompleted = idx < 1; // LGA completed
          const isCurrent = stage.stage === currentStage;

          return (
            <div
              key={stage.stage}
              onClick={() => handleStageClick(stage)}
              style={{
                background: isSelected
                  ? "rgba(16, 185, 129, 0.15)"
                  : "var(--glass-surface)",
                border: isSelected
                  ? "2px solid #10b981"
                  : isCurrent
                  ? "1px solid rgba(245, 158, 11, 0.5)"
                  : "1px solid var(--glass-border)",
                borderRadius: 14,
                padding: "16px 14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "1.3rem" }}>{getStageIcon(stage.stage)}</span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    padding: "2px 6px",
                    borderRadius: 6,
                    background: isCompleted ? "rgba(16, 185, 129, 0.2)" : isCurrent ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.08)",
                    color: isCompleted ? "#34d399" : isCurrent ? "#fbbf24" : "var(--muted)"
                  }}
                >
                  {isCompleted ? "Completed" : isCurrent ? "Live Now" : "Upcoming"}
                </span>
              </div>
              <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--ink)", marginBottom: 2 }}>
                Stage {idx + 1}: {stage.stage.toUpperCase()}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                {stage.totalCompetitors.toLocaleString()} Competitors
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stage Detail Card */}
      <div
        style={{
          background: "rgba(0, 0, 0, 0.25)",
          border: "1px solid var(--glass-border)",
          borderRadius: 14,
          padding: "18px 22px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--ink)" }}>
            {selectedStageConfig.name}
          </h3>
          <span style={{ fontSize: "0.82rem", color: "#10b981", fontWeight: 700 }}>
            Advancement: {selectedStageConfig.advancingPerUnit} Champion per administrative unit
          </span>
        </div>
        <p style={{ margin: "0 0 12px", fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.5 }}>
          {selectedStageConfig.description}
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: "0.8rem", color: "var(--ink)" }}>
          <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "6px 12px", borderRadius: 8 }}>
            👥 Pool Size: <strong>{selectedStageConfig.totalCompetitors.toLocaleString()} Scholars</strong>
          </div>
          <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "6px 12px", borderRadius: 8 }}>
            ⏱️ Format: <strong>15-Minute Live Speed CBT</strong>
          </div>
          <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "6px 12px", borderRadius: 8 }}>
            🏅 Award: <strong>Federal Ministry of Education Certificate</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

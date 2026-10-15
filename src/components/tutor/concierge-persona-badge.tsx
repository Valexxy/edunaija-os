"use client";

import React, { useState, useEffect } from "react";
import {
  ConciergeMemoryGraph,
  ConciergePersona,
  loadConciergeMemory,
  saveConciergeMemory,
  wipeConciergeMemory
} from "@/lib/ai/concierge-memory";

interface ConciergePersonaBadgeProps {
  onMemoryChange?: (memory: ConciergeMemoryGraph) => void;
}

export function ConciergePersonaBadge({ onMemoryChange }: ConciergePersonaBadgeProps) {
  const [memory, setMemory] = useState<ConciergeMemoryGraph>(loadConciergeMemory());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetGoalInput, setTargetGoalInput] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => {
    const mem = loadConciergeMemory();
    setMemory(mem);
    setTargetGoalInput(mem.targetGoal);
    if (onMemoryChange) onMemoryChange(mem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTogglePersona = (persona: ConciergePersona) => {
    const updated = saveConciergeMemory({ preferredPersona: persona });
    setMemory(updated);
    if (onMemoryChange) onMemoryChange(updated);
  };

  const handleSaveMemory = () => {
    const updated = saveConciergeMemory({ targetGoal: targetGoalInput });
    setMemory(updated);
    if (onMemoryChange) onMemoryChange(updated);
    setEditSuccess(true);
    setTimeout(() => {
      setEditSuccess(false);
      setIsModalOpen(false);
    }, 1500);
  };

  const handleWipeMemory = () => {
    if (confirm("Reset AI Concierge memory? Sister Amaka and Brother Femi will forget personalized history under NDPA 2023.")) {
      wipeConciergeMemory();
      const fresh = loadConciergeMemory();
      setMemory(fresh);
      setTargetGoalInput(fresh.targetGoal);
      if (onMemoryChange) onMemoryChange(fresh);
      setIsModalOpen(false);
    }
  };

  const isAmaka = memory.preferredPersona === "sister_amaka";

  return (
    <div
      className="glass-card"
      style={{
        padding: "16px 20px",
        borderRadius: 16,
        marginBottom: 20,
        background: isAmaka
          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)"
          : "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)",
        border: "1px solid var(--glass-border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12
      }}
    >
      {/* Left: Persona Emblem & Memory summary */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: isAmaka ? "rgba(16, 185, 129, 0.2)" : "rgba(6, 182, 212, 0.2)",
            border: isAmaka ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(6, 182, 212, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem"
          }}
        >
          {isAmaka ? "👩🏾‍🏫" : "👨🏾‍🏫"}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--ink)" }}>
              {isAmaka ? "Sister Amaka" : "Brother Femi"}
            </span>
            <span
              className="badge"
              style={{
                fontSize: "0.7rem",
                background: isAmaka ? "rgba(16, 185, 129, 0.15)" : "rgba(6, 182, 212, 0.15)",
                color: isAmaka ? "#10b981" : "#06b6d4",
                border: "none"
              }}
            >
              {isAmaka ? "Empathetic • Nigerian Analogies" : "Disciplined • WAEC/JAMB Drillmaster"}
            </span>
          </div>

          <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 2 }}>
            🧠 <strong>Remembers:</strong> {memory.classLabel} ({memory.state}) • Goal: {memory.targetGoal}
          </div>
        </div>
      </div>

      {/* Right: Persona Toggle & Settings */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ display: "inline-flex", background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 3 }}>
          <button
            type="button"
            onClick={() => handleTogglePersona("sister_amaka")}
            style={{
              background: isAmaka ? "var(--brand, #10b981)" : "transparent",
              color: isAmaka ? "#fff" : "var(--muted)",
              border: "none",
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Sister Amaka
          </button>
          <button
            type="button"
            onClick={() => handleTogglePersona("brother_femi")}
            style={{
              background: !isAmaka ? "#06b6d4" : "transparent",
              color: !isAmaka ? "#fff" : "var(--muted)",
              border: "none",
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Brother Femi
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-outline btn-sm"
          style={{ fontSize: "0.75rem", padding: "5px 10px" }}
          title="NDPA 2023 Memory Settings"
        >
          ⚙️ Memory
        </button>
      </div>

      {/* Memory Inspector & NDPA Erasure Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: 20
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 480,
              width: "100%",
              padding: "28px 24px",
              borderRadius: 20,
              background: "var(--glass-surface-raised)",
              border: "1px solid var(--glass-border)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem" }}>AI Concierge Memory Sovereignty</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5, marginBottom: 16 }}>
              Under the Nigerian Data Protection Act (NDPA 2023), you hold complete sovereignty over facts remembered by Sister Amaka and Brother Femi.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: 4 }}>
                Target Examination &amp; University Goal:
              </label>
              <input
                type="text"
                value={targetGoalInput}
                onChange={(e) => setTargetGoalInput(e.target.value)}
                className="input"
                style={{ width: "100%", padding: "10px", borderRadius: 8, background: "var(--glass-surface)", color: "var(--ink)" }}
                placeholder="e.g. UNILAG Medicine & Surgery (Target: 310+)"
              />
            </div>

            <div style={{ background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 10, fontSize: "0.78rem", color: "var(--muted)", marginBottom: 18 }}>
              <div>Scholar: <strong>{memory.scholarName}</strong></div>
              <div>Class: <strong>{memory.classLabel}</strong> ({memory.state} State)</div>
              <div>Weak Topics: <strong>{memory.weakTopics.join(", ") || "None"}</strong></div>
              <div>Token Cost: <strong>Zero extra tokens</strong> (compressed into &le; 60 tokens)</div>
            </div>

            {editSuccess && (
              <div style={{ color: "#10b981", fontSize: "0.85rem", fontWeight: 700, textAlign: "center", marginBottom: 12 }}>
                ✓ Memory updated successfully!
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={handleSaveMemory} className="btn btn-primary" style={{ flex: 1 }}>
                Save Updates
              </button>
              <button
                type="button"
                onClick={handleWipeMemory}
                className="btn btn-outline"
                style={{ color: "#ef4444", borderColor: "#ef4444" }}
              >
                Wipe Memory (NDPA)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

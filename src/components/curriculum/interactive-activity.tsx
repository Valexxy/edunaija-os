"use client";

import React, { useState } from "react";
import { H5PActivityDefinition, H5PEvaluationResult, h5pEngine } from "@/lib/curriculum/h5p-adapter";

interface InteractiveActivityProps {
  activity: H5PActivityDefinition;
  onComplete?: (result: H5PEvaluationResult) => void;
}

export function InteractiveActivity({ activity, onComplete }: InteractiveActivityProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<H5PEvaluationResult | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleMultiChoiceSubmit = () => {
    if (selectedOption === null) return;
    const res = h5pEngine.evaluate(activity, selectedOption);
    setResult(res);
    onComplete?.(res);
  };

  return (
    <div
      style={{
        border: "1px solid var(--line, #1f4730)",
        borderRadius: 12,
        padding: 20,
        background: "var(--card, #0f2318)",
        margin: "16px 0",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            color: "#4ade80",
            background: "#163824",
            padding: "4px 8px",
            borderRadius: 6,
          }}
        >
          {activity.library.replace("H5P.", "")} Activity
        </span>
        <span style={{ fontSize: 13, color: "var(--muted, #86efac)" }}>{activity.subject}</span>
      </div>

      <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 12px 0", color: "#ffffff" }}>
        {activity.title}
      </h3>

      {/* MultiChoice Activity */}
      {activity.library === "H5P.MultiChoice" && (
        <div>
          <p style={{ fontSize: 15, margin: "0 0 16px 0", color: "#d1fae5" }}>
            {activity.params.question}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activity.params.options?.map((opt, idx) => (
              <button
                key={idx}
                disabled={Boolean(result)}
                onClick={() => setSelectedOption(idx)}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: selectedOption === idx ? "2px solid #22c55e" : "1px solid #1f4730",
                  background: selectedOption === idx ? "#14532d" : "#0d1f15",
                  color: "#ffffff",
                  cursor: result ? "default" : "pointer",
                  fontSize: 14,
                  transition: "all 0.2s",
                }}
              >
                {opt.text}
              </button>
            ))}
          </div>

          {!result && (
            <button
              onClick={handleMultiChoiceSubmit}
              disabled={selectedOption === null}
              style={{
                marginTop: 16,
                background: selectedOption === null ? "#1f4730" : "#16a34a",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                fontWeight: 600,
                cursor: selectedOption === null ? "not-allowed" : "pointer",
              }}
            >
              Check Answer
            </button>
          )}
        </div>
      )}

      {/* Flashcard Dialogcards Activity */}
      {activity.library === "H5P.Dialogcards" && activity.params.cards && (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div
            onClick={() => setFlipped(!flipped)}
            style={{
              padding: "40px 20px",
              background: "#143725",
              borderRadius: 12,
              border: "1px dashed #22c55e",
              cursor: "pointer",
              minHeight: 120,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: 13, color: "#86efac", margin: "0 0 8px 0" }}>
              {flipped ? "Explanation (Click to flip)" : "Concept (Click to reveal)"}
            </p>
            <p style={{ fontSize: 18, fontWeight: 600, color: "#ffffff", margin: 0 }}>
              {flipped
                ? activity.params.cards[cardIndex]?.back
                : activity.params.cards[cardIndex]?.front}
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
            <button
              disabled={cardIndex === 0}
              onClick={() => {
                setCardIndex((c) => Math.max(0, c - 1));
                setFlipped(false);
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                background: "#163824",
                border: "1px solid #1f4730",
                color: "#ffffff",
              }}
            >
              Previous Card
            </button>
            <span style={{ fontSize: 13, color: "#a7d3b5", alignSelf: "center" }}>
              {cardIndex + 1} of {activity.params.cards.length}
            </span>
            <button
              disabled={cardIndex >= activity.params.cards.length - 1}
              onClick={() => {
                setCardIndex((c) => Math.min(activity.params.cards!.length - 1, c + 1));
                setFlipped(false);
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                background: "#163824",
                border: "1px solid #1f4730",
                color: "#ffffff",
              }}
            >
              Next Card
            </button>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            background: result.passed ? "#14532d" : "#451a03",
            border: `1px solid ${result.passed ? "#22c55e" : "#ea580c"}`,
            color: "#ffffff",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14 }}>{result.feedback}</div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.9 }}>
            Score: {result.score} / {result.maxScore} (Mastery: {Math.round(result.scaledScore * 100)}%)
          </div>
        </div>
      )}
    </div>
  );
}

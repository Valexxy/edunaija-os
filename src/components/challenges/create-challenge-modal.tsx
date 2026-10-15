"use client";

import React, { useState } from "react";
import type { Challenge, ChallengeTier } from "@/lib/challenges/types";

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengeCreated: (challenge: Challenge) => void;
  defaultTier?: ChallengeTier;
}

export function CreateChallengeModal({
  isOpen,
  onClose,
  onChallengeCreated,
  defaultTier = "senior_science"
}: CreateChallengeModalProps) {
  const [title, setTitle] = useState("");
  const [tier, setTier] = useState<ChallengeTier>(defaultTier);
  const [customPrize, setCustomPrize] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdChallenge, setCreatedChallenge] = useState<Challenge | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a title for your challenge");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          tier,
          stage: "lga",
          prize_description: customPrize.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create challenge");
      }

      setCreatedChallenge(data.challenge);
      onChallengeCreated(data.challenge);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating challenge");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (createdChallenge?.join_code) {
      navigator.clipboard.writeText(createdChallenge.join_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: 540,
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          padding: 28,
          borderRadius: 20,
          background: "var(--glass-surface-raised)",
          border: "1px solid var(--glass-border)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, color: "var(--ink)", fontSize: "1.3rem", fontWeight: 800 }}>
              ⚔️ Create Peer Challenge / Study Battle
            </h3>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              Challenge your friends, study circle, or school to a timed CBT duel
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
              color: "var(--muted)"
            }}
          >
            ✕
          </button>
        </div>

        {createdChallenge ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: 10 }}>🎉</div>
            <h4 style={{ fontSize: "1.25rem", margin: "0 0 8px", color: "var(--brand)" }}>
              Challenge Ready for Battle!
            </h4>
            <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: 20 }}>
              Share this 6-character battle code with your classmates. All participants will answer the exact same vetted questions.
            </p>

            <div
              style={{
                background: "var(--glass-surface)",
                border: "2px dashed var(--brand)",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>INVITE CODE</span>
                <strong style={{ fontSize: "1.6rem", letterSpacing: "0.08em", color: "var(--brand)" }}>
                  {createdChallenge.join_code}
                </strong>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="btn btn-primary btn-sm"
              >
                {copiedCode ? "✓ Copied!" : "📋 Copy Code"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                View Challenge in Arena →
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="battle-title">
                Competition Title *
              </label>
              <input
                id="battle-title"
                type="text"
                className="form-input"
                placeholder="e.g. Kings College vs Queens College Quadratic Duel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="battle-tier">
                Academic Tier / Level
              </label>
              <select
                id="battle-tier"
                className="form-input"
                value={tier}
                onChange={(e) => setTier(e.target.value as ChallengeTier)}
              >
                <option value="primary">🎒 Primary 4-6 (NCEE Common Entrance Tier)</option>
                <option value="junior">📘 Junior Secondary 1-3 (BECE Junior WAEC Tier)</option>
                <option value="senior_science">🔬 Senior Secondary (SSS STEM & JAMB UTME)</option>
                <option value="senior_arts">🎭 Senior Secondary (SSS Arts & Literature)</option>
                <option value="senior_commercial">💼 Senior Secondary (SSS Commercial & Accounting)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="battle-prize">
                Prize / Bragging Rights Stakes
              </label>
              <input
                id="battle-prize"
                type="text"
                className="form-input"
                placeholder="e.g. +250 Milestone XP, Winner gets free canteen lunch, or Gold Badge"
                value={customPrize}
                onChange={(e) => setCustomPrize(e.target.value)}
              />
            </div>

            <div
              style={{
                background: "rgba(4, 120, 87, 0.08)",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 20,
                fontSize: "0.82rem",
                color: "var(--ink)"
              }}
            >
              🔒 <strong>Anti-Cheating Assurance:</strong> All opponents receive identical, official curriculum questions under server-authoritative timer. Ranks are determined strictly by High Score → Lowest Seconds.
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Generating Arena..." : "⚔️ Launch Battle Room"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateChallengeModal;

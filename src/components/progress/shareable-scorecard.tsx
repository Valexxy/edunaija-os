"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface ShareableScorecardProps {
  studentName: string;
  classLabel: string;
  subject: string;
  topic: string;
  scorePercentage: number;
  demonstratedMastery: "Starting" | "Developing" | "Proficient" | "Secure" | string;
  accuracyText?: string;
}

export function ShareableScorecard({
  studentName,
  classLabel,
  subject,
  topic,
  scorePercentage,
  demonstratedMastery,
  accuracyText = "Demonstrated Mastery on NERDC Curriculum"
}: ShareableScorecardProps) {
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  const displayMastery =
    demonstratedMastery === "Starting"
      ? "Foundational (Needs Revision)"
      : demonstratedMastery;

  const shareText = `🎓 Verified Learning Milestone: ${studentName} (${classLabel}) achieved ${scorePercentage}% on ${subject} ("${topic}") on LearnNaija! 💡 Test your own skills here:`;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/curriculum` : "http://localhost:3000/curriculum";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setShareMsg("✓ Share text and link copied to clipboard!");
      setTimeout(() => {
        setCopied(false);
        setShareMsg("");
      }, 3500);
    } catch {
      setShareMsg("Select and copy link manually.");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `LearnNaija Scholar Milestone — ${studentName}`,
          text: shareText,
          url: shareUrl
        });
      } catch {
        // User canceled or dismissed share sheet
      }
    } else {
      handleCopyLink();
    }
  };

  const masteryBadgeColor = 
    demonstratedMastery.includes("Secure") || demonstratedMastery.includes("Master") ? "#047857" :
    demonstratedMastery.includes("Proficient") || demonstratedMastery.includes("Credit") ? "#1E40AF" :
    demonstratedMastery.includes("Developing") || demonstratedMastery.includes("Pass") ? "#B45309" : "#B91C1C";

  return (
    <div style={{ marginTop: 24, marginBottom: 24 }}>
      {/* Visual Shareable Card Canvas */}
      <div
        id="learnnaija-scorecard-card"
        style={{
          background: "linear-gradient(135deg, #064E3B 0%, #047857 60%, #0F766E 100%)",
          borderRadius: 16,
          padding: "28px 24px",
          color: "#FFFFFF",
          boxShadow: "0 10px 25px -5px rgba(4, 120, 87, 0.25)",
          border: "2px solid rgba(255, 255, 255, 0.15)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Background Decorative Rings */}
        <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        {/* Card Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.4rem" }}>🇳🇬</span>
            <div>
              <span style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "0.02em", textTransform: "uppercase" }}>LearnNaija</span>
              <span style={{ display: "block", fontSize: "0.72rem", opacity: 0.85 }}>Sovereign Learning Evidence</span>
            </div>
          </div>
          <span
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(4px)",
              padding: "4px 12px",
              borderRadius: 9999,
              fontSize: "0.78rem",
              fontWeight: 700
            }}
          >
            Verified Milestone
          </span>
        </div>

        {/* Scholar Info & Topic */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.85rem", opacity: 0.9, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Scholar Achievement
          </div>
          <h2 style={{ fontSize: "1.6rem", margin: "4px 0 2px", fontWeight: 800 }}>
            {studentName}
          </h2>
          <div style={{ fontSize: "0.88rem", opacity: 0.9 }}>
            Class: <strong>{classLabel}</strong> • Subject: <strong>{subject}</strong>
          </div>
        </div>

        {/* Score & Mastery Box */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(6px)",
            borderRadius: 12,
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", opacity: 0.85 }}>Curriculum Topic</div>
            <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>{topic}</div>
            <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: 2 }}>{accuracyText}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1 }}>{scorePercentage}%</div>
            <span
              style={{
                display: "inline-block",
                marginTop: 4,
                background: masteryBadgeColor,
                color: "#FFFFFF",
                fontSize: "0.72rem",
                fontWeight: 800,
                padding: "2px 8px",
                borderRadius: 4
              }}
            >
              {displayMastery}
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", opacity: 0.85, borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 12 }}>
          <span>🛡️ NDPA 2023 Child-Safe Protected</span>
          <span>Zero Manipulative Screen Time</span>
        </div>
      </div>

      {/* Share Action Controls (No external chat bot required - 100% universal) */}
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button
          type="button"
          onClick={handleNativeShare}
          className="btn btn-primary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <span>📤</span>
          <span>Share Milestone (Any App / Chat)</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="btn btn-secondary btn-sm"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <span>📋</span>
          <span>{copied ? "Copied!" : "Copy Share Link"}</span>
        </button>

        <Link
          href={`/curriculum`}
          className="btn btn-outline btn-sm"
          style={{ marginLeft: "auto", fontSize: "0.82rem" }}
        >
          🎯 Invite a Friend to Try a 5-Min Diagnostic
        </Link>
      </div>

      {shareMsg && (
        <div className="alert alert-success" style={{ marginTop: 10, padding: "8px 14px", fontSize: "0.85rem" }}>
          {shareMsg}
        </div>
      )}
    </div>
  );
}

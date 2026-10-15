"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  label?: string;
  fallbackUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function BackButton({
  label = "← Back",
  fallbackUrl = "/dashboard",
  className = "",
  style = {}
}: BackButtonProps) {
  const router = useRouter();
  const [resolvedLabel, setResolvedLabel] = useState(label);
  const [resolvedFallback, setResolvedFallback] = useState(fallbackUrl);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("learnnaija_session_user");
        if (cached) {
          const u = JSON.parse(cached);
          if (u.role === "parent") {
            if (fallbackUrl === "/dashboard") setResolvedFallback("/guardian");
            if (label === "← Back to Dashboard" || label === "← Back") setResolvedLabel("← Back to Parent Portal");
          } else if (u.role === "teacher") {
            if (fallbackUrl === "/dashboard") setResolvedFallback("/teacher");
            if (label === "← Back to Dashboard" || label === "← Back") setResolvedLabel("← Back to Teacher Cockpit");
          }
        }
      } catch {}
    }
  }, [fallbackUrl, label]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(resolvedFallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`btn-back ${className}`}
      aria-label={resolvedLabel}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "var(--surface)",
        color: "var(--ink)",
        border: "1px solid var(--line)",
        padding: "6px 14px",
        borderRadius: 8,
        fontSize: "0.84rem",
        fontWeight: 600,
        cursor: "pointer",
        minHeight: 40,
        minWidth: 44,
        transition: "all 0.15s ease",
        boxShadow: "var(--shadow-xs)",
        ...style
      }}
    >
      <span>{resolvedLabel}</span>
    </button>
  );
}

export default BackButton;

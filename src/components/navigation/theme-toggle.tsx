"use client";

import React from "react";
import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn-theme-toggle ${className}`}
      aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
        color: "var(--ink)",
        border: "1px solid var(--line)",
        borderRadius: 8,
        width: 38,
        height: 38,
        minWidth: 38,
        minHeight: 38,
        cursor: "pointer",
        fontSize: "1rem",
        transition: "all 0.15s ease",
        boxShadow: "var(--shadow-xs)",
        ...style
      }}
    >
      <span>{resolvedTheme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
}

export default ThemeToggle;

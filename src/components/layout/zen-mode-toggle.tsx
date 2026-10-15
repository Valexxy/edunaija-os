"use client";

import { useEffect, useState } from "react";

export function ZenModeToggle() {
  const [isZenActive, setIsZenActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("edunaija_zen_mode") === "true";
    if (saved) {
      setIsZenActive(true);
      document.body.classList.add("zen-mode-active");
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "z" || e.key === "Z")) {
        toggleZen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleZen = () => {
    setIsZenActive((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        if (next) {
          document.body.classList.add("zen-mode-active");
        } else {
          document.body.classList.remove("zen-mode-active");
        }
        localStorage.setItem("edunaija_zen_mode", String(next));
      }
      return next;
    });
  };

  return (
    <button
      onClick={toggleZen}
      type="button"
      className="btn btn-sm"
      style={{
        background: isZenActive ? "#064e3b" : "var(--surface-raised)",
        color: isZenActive ? "#ffffff" : "var(--ink-secondary)",
        border: "1px solid " + (isZenActive ? "#059669" : "var(--line)"),
        borderRadius: 20,
        padding: "5px 12px",
        fontSize: "0.78rem",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
        transition: "all 0.15s ease",
        boxShadow: isZenActive ? "0 0 10px rgba(5, 150, 105, 0.25)" : "none"
      }}
      title="Toggle Distraction-Free Zen Focus Mode (Alt + Z)"
      aria-label="Toggle Zen Focus Mode"
    >
      <span>{isZenActive ? "🧘 Exit Focus" : "🧘 Zen Mode"}</span>
      <span style={{ fontSize: "0.68rem", opacity: 0.75, background: "rgba(0,0,0,0.1)", padding: "1px 5px", borderRadius: 4 }}>
        Alt+Z
      </span>
    </button>
  );
}

/**
 * Universal Floating Zen Mode Supervisor:
 * Always mounted in RootLayout so that if Zen Mode is ever toggled,
 * a floating 'Restore Menu' action is ALWAYS visible to the student on any page.
 */
export function ZenModeFloatingSupervisor() {
  const [isZenActive, setIsZenActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkZen = () => {
      const active = document.body.classList.contains("zen-mode-active") || localStorage.getItem("edunaija_zen_mode") === "true";
      setIsZenActive(active);
    };

    checkZen();
    const interval = setInterval(checkZen, 500);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "z" || e.key === "Z")) {
        checkZen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const exitZen = () => {
    if (typeof window !== "undefined") {
      document.body.classList.remove("zen-mode-active");
      localStorage.removeItem("edunaija_zen_mode");
      setIsZenActive(false);
    }
  };

  if (!isZenActive) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 14,
        right: 18,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#064E3B",
        color: "#ffffff",
        border: "1.5px solid #10B981",
        borderRadius: 9999,
        padding: "6px 14px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        fontSize: "0.82rem",
        fontWeight: 600,
        animation: "fadeIn 0.2s ease"
      }}
    >
      <span>🧘 Zen Focus Active</span>
      <button
        type="button"
        onClick={exitZen}
        style={{
          background: "#10B981",
          color: "#064E3B",
          border: "none",
          borderRadius: 9999,
          padding: "3px 10px",
          fontWeight: 800,
          cursor: "pointer",
          fontSize: "0.78rem"
        }}
        title="Restore full navigation menu (Alt + Z)"
      >
        Restore Menu ✕
      </button>
    </div>
  );
}

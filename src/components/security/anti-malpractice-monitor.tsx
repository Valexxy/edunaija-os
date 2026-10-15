"use client";

import React, { useEffect, useState, useRef } from "react";
import type { IntegrityAuditEvent } from "@/lib/security/anti-malpractice";

interface Props {
  maxStrikes?: number;
  onViolation?: (event: IntegrityAuditEvent, strikesLeft: number) => void;
  onExceededStrikes?: () => void;
}

export function AntiMalpracticeMonitor({
  maxStrikes = 3,
  onViolation,
  onExceededStrikes
}: Props) {
  const [strikes, setStrikes] = useState(0);
  const [warningMsg, setWarningMsg] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const eventsRef = useRef<IntegrityAuditEvent[]>([]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const ev: IntegrityAuditEvent = {
          timestamp: new Date().toISOString(),
          type: "TAB_SWITCH",
          details: "Tab switch or browser minimization detected"
        };
        eventsRef.current.push(ev);
        setStrikes((prev) => {
          const next = prev + 1;
          const left = Math.max(0, maxStrikes - next);
          setWarningMsg(`⚠️ Warning: Tab switch detected (${next}/${maxStrikes} strikes). Defocus logged in server audit!`);
          if (onViolation) onViolation(ev, left);
          if (next >= maxStrikes && onExceededStrikes) onExceededStrikes();
          return next;
        });
      }
    };

    const handleBlur = () => {
      const ev: IntegrityAuditEvent = {
        timestamp: new Date().toISOString(),
        type: "WINDOW_BLUR",
        details: "Exam window lost focus"
      };
      eventsRef.current.push(ev);
      setStrikes((prev) => {
        const next = prev + 1;
        const left = Math.max(0, maxStrikes - next);
        setWarningMsg(`⚠️ Warning: Window defocus detected (${next}/${maxStrikes} strikes).`);
        if (onViolation) onViolation(ev, left);
        if (next >= maxStrikes && onExceededStrikes) onExceededStrikes();
        return next;
      });
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      const ev: IntegrityAuditEvent = {
        timestamp: new Date().toISOString(),
        type: "COPY_ATTEMPT",
        details: "Copying question text is prohibited in CBT exam"
      };
      eventsRef.current.push(ev);
      setWarningMsg("⚠️ Copying question text is blocked by the CBT integrity shield.");
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setWarningMsg("⚠️ Right-click context menu is locked during CBT exam.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [maxStrikes, onViolation, onExceededStrikes]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="anti-malpractice-badge">
            🛡️ Proctored Exam Shield Active
          </span>
          <span style={{ fontSize: "0.8rem", color: strikes > 0 ? "var(--danger)" : "var(--muted)", fontWeight: 600 }}>
            Infractions: {strikes} / {maxStrikes} max
          </span>
        </div>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: "0.78rem", padding: "3px 10px" }}
        >
          {isFullscreen ? "🗗 Exit Fullscreen" : "🔒 Proctored Fullscreen Lock"}
        </button>
      </div>

      {warningMsg && (
        <div className="anti-malpractice-warning-box" style={{ marginTop: 10 }}>
          <span>{warningMsg}</span>
          <button
            type="button"
            onClick={() => setWarningMsg("")}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "inherit", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

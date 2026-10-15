"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface SocraticAiQuickBarProps {
  preferredLanguage?: string;
  currentSubject?: string;
  learnerLevel?: string;
}

export function SocraticAiQuickBar({
  preferredLanguage = "en",
  currentSubject = "General Mathematics",
  learnerLevel = "senior_secondary"
}: SocraticAiQuickBarProps) {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState(preferredLanguage);
  const [isAsking, setIsAsking] = useState(false);
  const [hintResponse, setHintResponse] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const inputEl = document.getElementById("socratic-quick-input");
        if (inputEl) inputEl.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isAsking) return;

    setIsAsking(true);
    setHintResponse(null);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: query,
          learnerLevel,
          subject: currentSubject,
          language: lang === "pcm" ? "pcm" : "en"
        })
      });

      const data = await res.json();
      if (res.ok && data.explanation) {
        setHintResponse(data.explanation);
      } else {
        setHintResponse(data.error || "Unable to reach Socratic Tutor. Please try again.");
      }
    } catch {
      setHintResponse("Network offline. Saved question for Socratic AI breakdown once connection resumes.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        marginBottom: 28,
        border: "1px solid rgba(2, 132, 199, 0.3)",
        background: "linear-gradient(135deg, rgba(2, 132, 199, 0.06) 0%, rgba(15, 23, 42, 0.02) 100%)",
        borderRadius: 20,
        padding: "22px 26px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.3rem" }}>🤖</span>
          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--ink)" }}>
            Socratic AI Study Terminal
          </span>
          <span style={{ fontSize: "0.72rem", background: "rgba(2, 132, 199, 0.15)", color: "#0284c7", padding: "2px 8px", borderRadius: 9999, fontWeight: 700 }}>
            Cmd+K Quick Access
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Language:</span>
          <button
            type="button"
            onClick={() => setLang("en")}
            style={{
              background: lang === "en" ? "#0284c7" : "transparent",
              color: lang === "en" ? "#ffffff" : "var(--muted)",
              border: `1px solid ${lang === "en" ? "#0284c7" : "var(--line)"}`,
              padding: "2px 8px",
              borderRadius: 6,
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang("pcm")}
            style={{
              background: lang === "pcm" ? "#0284c7" : "transparent",
              color: lang === "pcm" ? "#ffffff" : "var(--muted)",
              border: `1px solid ${lang === "pcm" ? "#0284c7" : "var(--line)"}`,
              padding: "2px 8px",
              borderRadius: 6,
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Naija Pidgin
          </button>
        </div>
      </div>

      <form onSubmit={handleAsk} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          id="socratic-quick-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === "pcm" ? "Wetin you wan ask AI tutor on your homework or WAEC question?..." : "Ask Socratic AI any concept, formula derivation, or WAEC/JAMB doubt..."}
          className="form-input"
          style={{ flex: 1, minWidth: 260, fontSize: "0.92rem", padding: "10px 14px", borderRadius: 10 }}
        />
        <button
          type="submit"
          disabled={isAsking || !query.trim()}
          className="btn btn-primary"
          style={{ padding: "10px 20px", fontWeight: 700, fontSize: "0.88rem" }}
        >
          {isAsking ? "Thinking..." : "Get Hint →"}
        </button>
        <Link
          href={`/tutor${query ? `?topic=${encodeURIComponent(query)}` : ""}`}
          className="btn btn-secondary"
          style={{ padding: "10px 14px", fontSize: "0.88rem" }}
        >
          Full Chat ↗
        </Link>
      </form>

      {hintResponse && (
        <div
          style={{
            marginTop: 14,
            padding: "14px 18px",
            background: "var(--surface)",
            border: "1px solid var(--brand-border)",
            borderRadius: 12,
            fontSize: "0.9rem",
            color: "var(--ink)",
            lineHeight: 1.6
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontWeight: 800, fontSize: "0.82rem", color: "var(--brand)" }}>
              💡 Socratic Step-by-Step Breakdown:
            </span>
            <button
              type="button"
              onClick={() => setHintResponse(null)}
              style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.8rem" }}
            >
              ✕ Close
            </button>
          </div>
          <p style={{ margin: 0 }}>{hintResponse}</p>
        </div>
      )}
    </div>
  );
}

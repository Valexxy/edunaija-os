"use client";

import { useEffect } from "react";
import Link from "next/link";
import { sentry } from "@/lib/monitoring/sentry";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    sentry.captureException(error, {
      component: "AppErrorBoundary",
      extra: { digest: error.digest },
    });

    // Enterprise Admin Alert: Asynchronously notify monitoring team
    fetch("/api/monitoring/error-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message || "Unhandled Client Exception",
        stack: error.stack,
        component: "AppErrorBoundary",
        digest: error.digest,
        url: typeof window !== "undefined" ? window.location.href : undefined
      })
    }).catch(() => {});
  }, [error]);

  return (
    <main style={{ maxWidth: 520, margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
      <div className="glass-card" style={{ padding: "40px 24px", borderRadius: 20 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🛡️ 🇳🇬</div>
        <span className="pill" style={{ marginBottom: 16, background: "rgba(220, 38, 38, 0.15)", color: "#f87171" }}>
          Temporary System Glitch Handled
        </span>
        <h2 style={{ fontSize: "1.8rem", margin: "12px 0 8px", letterSpacing: "-0.03em", color: "#4ade80" }}>
          No worry, your learning data is intact!
        </h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.6, fontSize: "0.95rem", marginBottom: 28 }}>
          We caught an unexpected error. Your answers, scores, and streak days are preserved in the offline-first vault.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ padding: "10px 22px", cursor: "pointer" }}
          >
            Try Again
          </button>
          <Link href="/dashboard" className="btn btn-secondary" style={{ padding: "10px 20px" }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

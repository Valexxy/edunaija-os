"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sentry } from "@/lib/monitoring/sentry";

export interface RouteErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  sectionTitle: string;
  subtitle?: string;
  icon?: string;
  badge?: string;
  actionText?: string;
  fallbackUrl?: string;
  fallbackText?: string;
}

export function RouteErrorBoundary({
  error,
  reset,
  sectionTitle,
  subtitle = "No worry! Your learning progress and answers are securely preserved in offline storage.",
  icon = "🛡️",
  badge = "System Guard Active",
  actionText = "Try Again",
  fallbackUrl = "/dashboard",
  fallbackText = "Back to Dashboard"
}: RouteErrorBoundaryProps) {
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // 1. Report to client Sentry
    sentry.captureException(error, {
      component: sectionTitle,
      extra: { digest: error.digest }
    });

    // 2. Dispatch Enterprise Error Alert to backend monitoring
    fetch("/api/monitoring/error-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message || `Unhandled exception in ${sectionTitle}`,
        stack: error.stack,
        component: `Section:${sectionTitle}`,
        digest: error.digest,
        url: typeof window !== "undefined" ? window.location.href : undefined
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.incidentId) {
          setIncidentId(data.incidentId);
        }
      })
      .catch(() => {});
  }, [error, sectionTitle]);

  return (
    <div
      style={{
        maxWidth: 580,
        margin: "40px auto",
        padding: "0 20px",
        textAlign: "center"
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: "36px 28px",
          borderRadius: 20,
          background: "var(--glass-surface-raised, rgba(15, 23, 42, 0.75))",
          border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.12))",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 14 }}>{icon}</div>

        <span
          className="pill"
          style={{
            marginBottom: 16,
            display: "inline-block",
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            fontSize: "0.78rem",
            fontWeight: 800,
            padding: "4px 12px",
            borderRadius: 9999
          }}
        >
          {badge}
        </span>

        <h2
          style={{
            fontSize: "1.6rem",
            margin: "8px 0 10px",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "var(--ink, #f8fafc)"
          }}
        >
          {sectionTitle} Interrupted
        </h2>

        <p
          style={{
            color: "var(--muted, #94a3b8)",
            lineHeight: 1.6,
            fontSize: "0.95rem",
            marginBottom: 24
          }}
        >
          {subtitle}
        </p>

        {incidentId && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: "0.78rem",
              color: "#34d399",
              marginBottom: 24,
              fontFamily: "monospace"
            }}
          >
            <span>Tracking Incident ID:</span>
            <strong>{incidentId}</strong>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 20
          }}
        >
          <button
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ padding: "10px 24px", cursor: "pointer", fontWeight: 700 }}
          >
            🔄 {actionText}
          </button>
          <Link
            href={fallbackUrl}
            className="btn btn-secondary"
            style={{ padding: "10px 20px", textDecoration: "none" }}
          >
            {fallbackText}
          </Link>
        </div>

        {/* Technical toggle for debugging */}
        <div style={{ marginTop: 12, textAlign: "left" }}>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted, #94a3b8)",
              fontSize: "0.75rem",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline"
            }}
          >
            {showDetails ? "Hide technical diagnostic" : "Show technical diagnostic"}
          </button>
          {showDetails && (
            <div
              style={{
                marginTop: 8,
                padding: 12,
                borderRadius: 8,
                background: "rgba(0, 0, 0, 0.5)",
                fontSize: "0.75rem",
                color: "#cbd5e1",
                fontFamily: "monospace",
                wordBreak: "break-word",
                maxHeight: 140,
                overflowY: "auto"
              }}
            >
              <div>{error.message || "Unknown client error"}</div>
              {error.digest && <div>Digest: {error.digest}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

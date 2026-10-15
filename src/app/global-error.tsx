"use client";

import { useEffect } from "react";
import Link from "next/link";
import { sentry } from "@/lib/monitoring/sentry";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    sentry.captureException(error, {
      component: "GlobalError",
      extra: { digest: error.digest },
    });

    // Enterprise Admin Alert: Asynchronously notify monitoring team
    fetch("/api/monitoring/error-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message || "Fatal Global Client Error",
        stack: error.stack,
        component: "GlobalError",
        digest: error.digest,
        url: typeof window !== "undefined" ? window.location.href : undefined
      })
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#08150e",
          color: "#f5fdf7",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "90%",
            padding: "36px 28px",
            background: "#0f2318",
            border: "1px solid #1f4730",
            borderRadius: 16,
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#163824",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
              fontSize: 28,
            }}
          >
            🇳🇬
          </div>

          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin: "0 0 10px 0",
              color: "#4ade80",
            }}
          >
            No worry, your progress is safe!
          </h2>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#a7d3b5",
              margin: "0 0 24px 0",
            }}
          >
            We encountered a temporary hiccup, but your answers, streaks, and scores are recorded.
            Our automated monitoring team has been notified.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => reset()}
              style={{
                background: "#16a34a",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                padding: "12px 22px",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              Try Again
            </button>
            <Link
              href="/"
              style={{
                background: "transparent",
                color: "#86efac",
                border: "1px solid #22543d",
                borderRadius: 8,
                padding: "12px 22px",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

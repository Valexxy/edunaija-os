import Link from "next/link";
import { BackButton } from "@/components/navigation/back-button";

export interface RouteNotFoundViewProps {
  sectionTitle: string;
  message?: string;
  icon?: string;
  primaryUrl?: string;
  primaryText?: string;
  secondaryUrl?: string;
  secondaryText?: string;
}

export function RouteNotFoundView({
  sectionTitle,
  message = "The requested resource could not be found or may have moved.",
  icon = "🔍",
  primaryUrl = "/dashboard",
  primaryText = "Return to Dashboard",
  secondaryUrl = "/assessments",
  secondaryText = "Browse Available Topics"
}: RouteNotFoundViewProps) {
  return (
    <div
      style={{
        maxWidth: 580,
        margin: "40px auto",
        padding: "0 20px",
        textAlign: "center"
      }}
    >
      <div style={{ marginBottom: 16, textAlign: "left" }}>
        <BackButton fallbackUrl={primaryUrl} label="← Go Back" />
      </div>

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
            fontSize: "0.78rem",
            fontWeight: 800,
            padding: "4px 12px",
            borderRadius: 9999,
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#fbbf24"
          }}
        >
          404 — {sectionTitle}
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
          Resource Not Found
        </h2>

        <p
          style={{
            color: "var(--muted, #94a3b8)",
            lineHeight: 1.6,
            fontSize: "0.95rem",
            marginBottom: 24
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap"
          }}
        >
          <Link
            href={primaryUrl}
            className="btn btn-primary"
            style={{ padding: "10px 22px", textDecoration: "none" }}
          >
            {primaryText}
          </Link>
          <Link
            href={secondaryUrl}
            className="btn btn-secondary"
            style={{ padding: "10px 20px", textDecoration: "none" }}
          >
            {secondaryText}
          </Link>
        </div>
      </div>
    </div>
  );
}

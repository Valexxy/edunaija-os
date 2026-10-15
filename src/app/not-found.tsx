import Link from "next/link";
import { BackButton } from "@/components/navigation/back-button";

export default function NotFound() {
  return (
    <main style={{ maxWidth: 520, margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
      <div style={{ marginBottom: 20, textAlign: "left" }}>
        <BackButton fallbackUrl="/" label="← Back to Home" />
      </div>
      <div className="glass-card" style={{ padding: "40px 24px", borderRadius: 20 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🇳🇬 🔍</div>
        <span className="pill" style={{ marginBottom: 16 }}>404 — Page Not Found</span>
        <h1 style={{ fontSize: "1.8rem", margin: "12px 0 8px", letterSpacing: "-0.03em" }}>
          This lesson is off the syllabus!
        </h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.6, fontSize: "0.95rem", marginBottom: 28 }}>
          The page you requested may have moved or does not exist. Your academic progress, streak, and quiz scores remain 100% safe.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" className="btn btn-primary" style={{ padding: "10px 20px" }}>
            Return to Dashboard
          </Link>
          <Link href="/assessments" className="btn btn-secondary" style={{ padding: "10px 20px" }}>
            Explore CBT Tests
          </Link>
        </div>
      </div>
    </main>
  );
}

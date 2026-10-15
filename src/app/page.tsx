import Link from "next/link";

const modules = [
  {
    icon: "📚",
    title: "Curriculum-Aware Learning",
    badge: "NERDC / WAEC / JAMB",
    body: "Official syllabus topics across Primary, Junior Secondary, and Senior Secondary (Science, Arts, Commercial) with strict pedagogical provenance.",
    href: "/curriculum",
    cta: "Explore Syllabus"
  },
  {
    icon: "⏱️",
    title: "Server-Authoritative CBT Exams",
    badge: "Anti-Malpractice",
    body: "Sub-millisecond server grading with anti-cheat timers, instant KaTeX formula rendering, and verifiable cryptographic score receipts.",
    href: "/assessments",
    cta: "Take CBT Exams"
  },
  {
    icon: "🤖",
    title: "NDPA Child-Safe AI Tutor",
    badge: "Groq LLaMA + Gemini",
    body: "Socratic step-by-step guidance in English or Naija Pidgin with zero child PII leakage, automated redaction, and fast sub-300ms hints.",
    href: "/tutor",
    cta: "Chat with AI Tutor"
  },
  {
    icon: "🏆",
    title: "National Academic Challenges",
    badge: "Upstash Redis Engine",
    body: "Multi-tier tournament pyramid from 774 LGAs to 36 States and the National Grand Finale with sub-5ms real-time leaderboards and peer duels.",
    href: "/challenges",
    cta: "View Competitions"
  },
  {
    icon: "👥",
    title: "Group Study Circles",
    badge: "Synchronous Co-Solving",
    body: "Study together with classmates, share live whiteboard canvas, co-solve identical questions in real-time, and launch instant squad battles.",
    href: "/study-group",
    cta: "Join Study Circle"
  },
  {
    icon: "🛡️",
    title: "Parent & Guardian Transparency",
    badge: "NDPA 2023 Compliant",
    body: "Granular weekly scorecards delivered via Resend, PIN-protected class promotions, and complete audit trail of study mastery.",
    href: "/guardian",
    cta: "Guardian Oversight"
  }
];

export default function HomePage() {
  return (
    <main style={{ padding: "40px 0 80px" }}>
      {/* Hero Section */}
      <section className="hero" style={{ textAlign: "center", maxWidth: 900, margin: "0 auto 48px", padding: "32px 16px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span className="pill" style={{ fontSize: "0.82rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            🇳🇬 Nigeria-First Sovereign AI EdTech Infrastructure
          </span>
        </div>

        <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.15, margin: "0 0 20px", color: "var(--ink)" }}>
          Learn Better. Practise Smarter. <br />
          <span style={{ color: "var(--brand)" }}>Excel Together.</span>
        </h1>

        <p style={{ fontSize: "clamp(1.05rem, 2vw, 1.22rem)", color: "var(--muted)", maxWidth: 740, margin: "0 auto 32px", lineHeight: 1.65 }}>
          Built for Nigerian learners from Primary 4 through 100-Level university. Featuring official NERDC syllabi, 
          server-authoritative CBT assessments, real-time national tournaments, and child-safe Socratic AI tutoring.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
          <Link href="/dashboard" className="btn btn-primary" style={{ padding: "12px 28px", fontSize: "1rem", fontWeight: 700 }}>
            🚀 Launch Scholar Dashboard
          </Link>
          <Link href="/assessments" className="btn btn-secondary" style={{ padding: "12px 24px", fontSize: "1rem", fontWeight: 600 }}>
            📝 Take CBT Practice Exam
          </Link>
          <Link href="/challenges" className="btn btn-outline" style={{ padding: "12px 24px", fontSize: "1rem", fontWeight: 600 }}>
            ⚔️ Peer Arena &amp; Competitions
          </Link>
        </div>
      </section>

      {/* Trust & Architecture Metrics Strip */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          maxWidth: 1100,
          margin: "0 auto 48px",
          padding: "0 16px"
        }}
      >
        {[
          { label: "Administrative Pyramid", value: "774 LGAs & 36 States", icon: "🏛️" },
          { label: "Real-Time Ranking", value: "Sub-5ms Latency (Upstash Redis)", icon: "⚡" },
          { label: "Child Data Sovereignty", value: "100% NDPA 2023 Compliant", icon: "🛡️" },
          { label: "Bandwidth Optimized", value: "Offline PWA & 0-Data Cache", icon: "📶" }
        ].map((stat, idx) => (
          <div
            key={idx}
            className="glass-card"
            style={{
              padding: "16px 20px",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              gap: 12
            }}
          >
            <span style={{ fontSize: "1.8rem" }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 700 }}>
                {stat.label}
              </div>
              <strong style={{ fontSize: "0.95rem", color: "var(--ink)" }}>{stat.value}</strong>
            </div>
          </div>
        ))}
      </section>

      {/* Capabilities Grid */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 20,
          maxWidth: 1100,
          margin: "0 auto 56px",
          padding: "0 16px"
        }}
        aria-label="Platform capabilities"
      >
        {modules.map((module) => (
          <article
            className="glass-card"
            key={module.title}
            style={{
              padding: "24px 26px",
              borderRadius: 20,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: "2rem" }}>{module.icon}</span>
                <span className="badge badge-success" style={{ fontSize: "0.72rem" }}>
                  {module.badge}
                </span>
              </div>
              <h2 style={{ fontSize: "1.25rem", margin: "0 0 10px", color: "var(--ink)", fontWeight: 700 }}>
                {module.title}
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.55, margin: 0 }}>
                {module.body}
              </p>
            </div>
            <Link
              href={module.href}
              className="btn btn-outline btn-sm"
              style={{ marginTop: 20, alignSelf: "flex-start", fontWeight: 600 }}
            >
              {module.cta} →
            </Link>
          </article>
        ))}
      </section>

      {/* Footer */}
      <footer
        className="footer"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "24px 16px 0",
          borderTop: "1px solid var(--line)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div style={{ fontSize: "0.88rem", color: "var(--muted)" }}>
          © 2026 LearnNaija AI Learning Platform • Sovereign Nigerian EdTech Architecture
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: "0.88rem" }}>
          <Link href="/dashboard" style={{ color: "var(--ink)" }}>Dashboard</Link>
          <Link href="/assessments" style={{ color: "var(--ink)" }}>Exams</Link>
          <Link href="/tutor" style={{ color: "var(--ink)" }}>AI Tutor</Link>
          <Link href="/challenges" style={{ color: "var(--ink)" }}>Competitions</Link>
          <Link href="/study-group" style={{ color: "var(--ink)" }}>Study Circles</Link>
          <Link href="/guardian" style={{ color: "var(--ink)" }}>Guardian</Link>
        </div>
      </footer>
    </main>
  );
}

import { BackButton } from "@/components/navigation/back-button";
import Link from "next/link";
import { ShareableScorecard } from "@/components/progress/shareable-scorecard";

export default function PublicCardPreviewPage({
  searchParams
}: {
  searchParams: Promise<{
    name?: string;
    class?: string;
    subject?: string;
    topic?: string;
    score?: string;
    mastery?: string;
  }>;
}) {
  return Promise.resolve(searchParams).then((params) => {
    const studentName = params.name || "Chukwudi Okafor";
    const classLabel = params.class || "SSS 3 Science";
    const subject = params.subject || "General Mathematics";
    const topic = params.topic || "Quadratic Equations by Factorization";
    const scorePercentage = params.score ? Number(params.score) : 85;
    const demonstratedMastery = (params.mastery as "Starting" | "Developing" | "Proficient" | "Secure") || "Proficient";

    return (
      <main style={{ padding: "40px 16px 80px", maxWidth: 650, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <BackButton fallbackUrl="/progress" label="← Back to Progress" />
        </div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span className="pill">LearnNaija Public Learning Evidence</span>
          <h1 style={{ fontSize: "1.9rem", margin: "8px 0 4px", letterSpacing: "-.02em" }}>
            Verified Learning Milestone
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
            Verified under the Nigeria Data Protection Act (NDPA 2023) standard.
          </p>
        </div>

        <ShareableScorecard
          studentName={studentName}
          classLabel={classLabel}
          subject={subject}
          topic={topic}
          scorePercentage={scorePercentage}
          demonstratedMastery={demonstratedMastery}
        />

        <div className="card" style={{ padding: 24, textAlign: "center", marginTop: 24, background: "#FAFDFB" }}>
          <h3 style={{ fontSize: "1.15rem", margin: "0 0 8px" }}>Want to test your own topic mastery?</h3>
          <p style={{ color: "var(--muted)", fontSize: "0.92rem", marginBottom: 16 }}>
            Take a 100% free, curriculum-aligned 5-minute practice quiz. No credit card, no annoying ads.
          </p>
          <Link href="/assessments" className="btn btn-primary">
            Try a Free 5-Minute Practice Sprint →
          </Link>
        </div>
      </main>
    );
  });
}

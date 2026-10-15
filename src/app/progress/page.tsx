import { BackButton } from "@/components/navigation/back-button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getLearnerProfile } from "@/lib/auth/session";
import { getLearnerMastery } from "@/lib/assessment/engine";
import { getTopicsForLearner, getSubjectsForLearner } from "@/lib/curriculum/learner-curriculum";
import { ShareableScorecard } from "@/components/progress/shareable-scorecard";
import { MistakeVault } from "@/components/progress/mistake-vault";

interface TopicMasteryItem {
  subject: string;
  topic: string;
  state: "Not assessed" | "Starting" | "Developing" | "Proficient" | "Secure";
  accuracy: number;
  lastPractised: string;
  recommendedAction: string;
}

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/progress");
  }

  const isGuardian = user.role === "parent";
  const isTeacher = user.role === "teacher";

  const profile = await getLearnerProfile(user.id);
  const masteryData = getLearnerMastery(user.id);
  const activeTopics = getTopicsForLearner(profile);
  const subjects = getSubjectsForLearner(profile);
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const masteryItems: TopicMasteryItem[] = activeTopics.map((topic) => {
    const data = masteryData[topic.id];
    const subjectName = subjectMap.get(topic.subject_id) || "General Studies";

    if (data && data.attempts > 0) {
      const accuracy = Math.round((data.correct / data.attempts) * 100);
      let state: TopicMasteryItem["state"] = "Developing";
      let recommendedAction = isGuardian
        ? "Remind your ward to review core steps before their next timed sprint."
        : "Guided practice with AI Socratic hints before the next timed sprint.";

      if (data.score >= 85) {
        state = "Secure";
        recommendedAction = "Strong retention confirmed! Scheduled for spaced revision next week.";
      } else if (data.score >= 70) {
        state = "Proficient";
        recommendedAction = isGuardian
          ? "Ward is confident on fundamentals. Encourage them to explain it to you!"
          : "Increase independence with 3 fresh exam variations.";
      } else if (data.score < 50) {
        state = "Starting";
        recommendedAction = isGuardian
          ? "Topic needs reinforcement at home. Use Socratic Parent Explainer for tips."
          : "Review core foundational rules with AI Tutor.";
      }

      return {
        subject: subjectName,
        topic: topic.title,
        state,
        accuracy,
        lastPractised: "Recently",
        recommendedAction
      };
    }

    return {
      subject: subjectName,
      topic: topic.title,
      state: "Not assessed" as const,
      accuracy: 0,
      lastPractised: "Not started",
      recommendedAction: isGuardian
        ? "Ward has not taken a baseline diagnostic on this topic yet."
        : isTeacher
        ? "Diagnostic baseline recommended for this curriculum unit."
        : "Take a 5-question baseline diagnostic test."
    };
  });

  const bestMastery =
    masteryItems.find((m) => m.state === "Secure") ||
    masteryItems.find((m) => m.state === "Proficient") ||
    masteryItems.find((m) => m.state !== "Not assessed") ||
    masteryItems[0] || {
      subject: subjects[0]?.name || "Mathematics",
      topic: activeTopics[0]?.title || "Core Foundations",
      accuracy: 0,
      state: "Not assessed" as const
    };

  const hasDemonstratedMastery = Boolean(
    bestMastery && bestMastery.state !== "Not assessed" && bestMastery.accuracy > 0
  );

  const stateColors: Record<string, { bg: string; color: string; label: string }> = {
    Secure: { bg: "var(--success-light)", color: "var(--success)", label: "🟢 Secure" },
    Proficient: { bg: "var(--info-light)", color: "var(--info)", label: "🔵 Proficient" },
    Developing: { bg: "var(--warning-light)", color: "var(--warning)", label: "🟡 Developing" },
    Starting: { bg: "var(--danger-light)", color: "var(--danger)", label: "🟠 Starting" },
    "Not assessed": { bg: "var(--glass-surface-sunken)", color: "var(--muted)", label: "⚪ Not Assessed" }
  };

  return (
    <main style={{ padding: "40px 0 110px", maxWidth: 840 }}>
      <div style={{ marginBottom: 20 }}>
        <BackButton
          fallbackUrl={isGuardian ? "/guardian" : isTeacher ? "/teacher" : "/dashboard"}
          label={isGuardian ? "← Back to Parent Portal" : isTeacher ? "← Back to Teacher Cockpit" : "← Back to Dashboard"}
        />
      </div>

      <div style={{ marginBottom: 32 }}>
        <span className="glass-pill" style={{ color: "var(--brand)", borderColor: "var(--brand-border)" }}>
          {isGuardian ? "NDPA 2023 §31 Ward Mastery Audit" : isTeacher ? "TRCN Cohort Mastery Analytics" : "Pillar 4 & 5 — Adaptive Mastery"}
        </span>
        <h1 style={{ fontSize: "2.3rem", margin: "12px 0 8px", letterSpacing: "-.03em", color: "var(--ink)" }}>
          {isGuardian
            ? "Ward Academic Mastery & Diagnostic Progress"
            : isTeacher
            ? "Cohort Aggregate Mastery & Diagnostic Index"
            : "My Learning Mastery & Progress"}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.6 }}>
          {isGuardian
            ? "Inspect verified learning evidence for your linked wards. See where your child demonstrates mastery and what simple guidance you can give at home."
            : isTeacher
            ? "Real-time curriculum competency levels across your active cohorts. Identify topics where students need targeted remedial intervention."
            : "Learning evidence across curriculum topics. You compete primarily against your own previous performance—with healthy repeat practice and zero shame mechanics."}
        </p>
      </div>

      {/* Mastery Definitions Guide */}
      <div
        className="glass-card"
        style={{
          padding: 24,
          marginBottom: 28,
          background: "var(--glass-surface-raised)",
          borderColor: "var(--brand-border)"
        }}
      >
        <h3 style={{ fontSize: "1.05rem", margin: "0 0 12px", color: "var(--brand)" }}>
          📐 The 5-State Educational Mastery Standard
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          <div style={{ background: "var(--glass-surface)", padding: 10, borderRadius: 10, border: "1px solid var(--glass-border)" }}>
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--muted)" }}>Not Assessed</span>
            <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>Insufficient evidence &rarr; diagnostic</p>
          </div>
          <div style={{ background: "var(--glass-surface)", padding: 10, borderRadius: 10, border: "1px solid var(--glass-border)" }}>
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--danger)" }}>Starting</span>
            <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>Gaps detected &rarr; prerequisite focus</p>
          </div>
          <div style={{ background: "var(--glass-surface)", padding: 10, borderRadius: 10, border: "1px solid var(--glass-border)" }}>
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--warning)" }}>Developing</span>
            <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>Understanding &rarr; guided hints</p>
          </div>
          <div style={{ background: "var(--glass-surface)", padding: 10, borderRadius: 10, border: "1px solid var(--glass-border)" }}>
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--info)" }}>Proficient</span>
            <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>Repeated success on fresh items</p>
          </div>
          <div style={{ background: "var(--glass-surface)", padding: 10, borderRadius: 10, border: "1px solid var(--glass-border)" }}>
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--success)" }}>Secure</span>
            <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>Long-term retention verified</p>
          </div>
        </div>
      </div>

      {/* Topic Mastery Ledger */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 28, background: "var(--glass-surface-raised)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: "1.25rem", margin: 0, color: "var(--ink)" }}>
            {isGuardian ? "Ward Mastery Breakdown" : isTeacher ? "Cohort Pacing Breakdown" : "Topic Mastery Breakdown"}
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            Level: <strong>{profile?.class_label || "SSS 3"}</strong>
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {masteryItems.map((item) => {
            const badge = stateColors[item.state] || stateColors["Not assessed"];
            return (
              <div
                key={item.topic}
                style={{
                  border: "1px solid var(--glass-border)",
                  borderRadius: 14,
                  padding: "16px 20px",
                  background: "var(--glass-surface)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 12
                }}
              >
                <div style={{ maxWidth: 520 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                      {item.subject}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>• Last seen: {item.lastPractised}</span>
                  </div>
                  <h3 style={{ fontSize: "1.1rem", margin: "2px 0 6px", color: "var(--ink)" }}>
                    {item.topic}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ink-secondary)", lineHeight: 1.5 }}>
                    👉 <strong>Next Action:</strong> {item.recommendedAction}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 9999,
                      display: "inline-block",
                      marginBottom: 8
                    }}
                  >
                    {badge.label}
                  </span>
                  {item.accuracy > 0 && (
                    <div style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600 }}>
                      Accuracy: {item.accuracy}%
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    {isGuardian ? (
                      <Link
                        href={`/tutor?topic=${encodeURIComponent(item.topic)}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                      >
                        🍲 Explain at Home →
                      </Link>
                    ) : isTeacher ? (
                      <Link
                        href="/teacher"
                        className="btn btn-primary btn-sm"
                        style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                      >
                        🚀 Assign to Class →
                      </Link>
                    ) : (
                      <Link
                        href={`/tutor?topic=${encodeURIComponent(item.topic)}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                      >
                        Practise Topic →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shareable Milestone Card */}
      <div style={{ marginBottom: 36 }}>
        <h2 className="section-title">
          {isGuardian ? "📜 Verified Ward Academic Milestone Slip" : isTeacher ? "📜 Verified Cohort Pacing Certificate" : "🏆 Share Verified Academic Milestone"}
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: 16 }}>
          {isGuardian
            ? "Official verifiable evidence of your ward's topic mastery under the Nigeria Data Protection Act (NDPA 2023)."
            : "Celebrate demonstrated mastery with family, classmates, and teachers. Zero external bot linking required."}
        </p>
        {hasDemonstratedMastery ? (
          <ShareableScorecard
            studentName={isGuardian ? `${user?.display_name || "Scholar"} (Ward)` : (user?.display_name || "Scholar")}
            classLabel={profile?.class_label || "Scholar"}
            subject={bestMastery.subject}
            topic={bestMastery.topic}
            scorePercentage={bestMastery.accuracy}
            demonstratedMastery={bestMastery.state}
            accuracyText={`Verified on ${profile?.class_label || "Nigerian"} Curriculum Track`}
          />
        ) : (
          <div
            className="glass-card"
            style={{
              padding: "32px 24px",
              textAlign: "center",
              border: "1px dashed var(--line)",
              borderRadius: 16
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>🎯</div>
            <h3 style={{ margin: "0 0 6px", color: "var(--ink)", fontSize: "1.1rem" }}>
              Diagnostic Assessment Baseline Needed
            </h3>
            <p style={{ margin: "0 auto 16px", color: "var(--muted)", maxWidth: 520, fontSize: "0.9rem" }}>
              Complete your first curriculum CBT drill or sprint to establish your demonstrated mastery and unlock your verified, shareable achievement milestone slip.
            </p>
            <Link href="/assessments" className="btn btn-primary btn-sm">
              Start Diagnostic CBT Drill →
            </Link>
          </div>
        )}
      </div>

      {/* Persistent Question History & Mistake Vault (Students only) */}
      {!isGuardian && !isTeacher && (
        <div style={{ marginBottom: 36 }}>
          <MistakeVault />
        </div>
      )}

      {/* Return Navigation Links */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {isGuardian ? (
          <>
            <Link href="/guardian" className="btn btn-primary">
              ← Return to Parent Portal
            </Link>
            <Link href="/assessments" className="btn btn-secondary">
              📋 Audit Ward CBT Tests &amp; Scores
            </Link>
          </>
        ) : isTeacher ? (
          <>
            <Link href="/teacher" className="btn btn-primary">
              ← Return to Teacher Cockpit
            </Link>
            <Link href="/assessments" className="btn btn-secondary">
              📋 Official Examination Item Bank
            </Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className="btn btn-primary">
              ← Return to Daily Learning Loop
            </Link>
            <Link href="/assessments" className="btn btn-secondary">
              Browse Practice Sprints &amp; Exams
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

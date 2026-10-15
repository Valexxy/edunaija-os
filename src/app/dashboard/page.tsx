import { BackButton } from "@/components/navigation/back-button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getLearnerProfile, listGuardianRelationships } from "@/lib/auth/session";
import { getLearnerMastery } from "@/lib/assessment/engine";
import { getTopicsForLearner, buildLearnerSubjectCompetencies, getDynamicExamForecast } from "@/lib/curriculum/learner-curriculum";
import { getChallengesList } from "@/lib/challenges/engine";
import { getProvisionedAssessments, resolveQuestionIdsForAssessment, resolveAcademicTrack } from "@/lib/assessment/provisioning";
import { getDailyLearningRecommendation } from "@/lib/assessment/daily-loop";
import { WeatherGreetingBanner } from "@/components/dashboard/weather-greeting-banner";
import { QuickLaunchCBTSprint } from "@/components/dashboard/quick-launch-cbt-sprint";
import { SocraticAiQuickBar } from "@/components/dashboard/socratic-ai-quick-bar";
import { ExamCountdownGauge } from "@/components/dashboard/exam-countdown-gauge";
import { SovereignLeagueCard } from "@/components/dashboard/sovereign-league-card";
import { MistakeVaultAutopsy } from "@/components/dashboard/mistake-vault-autopsy";
import { MistakeVault } from "@/components/progress/mistake-vault";
import { LearningAnalyticsDashboard } from "@/components/analytics/learning-analytics-dashboard";
import { TopicMasteryIndex } from "@/components/dashboard/topic-mastery-index";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  // Role segregation: Guardians and Teachers have their own dedicated dashboards
  if (user.role === "parent") {
    redirect("/guardian");
  }
  if (user.role === "teacher") {
    redirect("/teacher");
  }

  // Enforce mandatory onboarding gate: If profile is incomplete, guide student to select parameters
  if (!user.onboarding_complete) {
    redirect("/onboarding");
  }

  const learnerProfile = await getLearnerProfile(user.id);
  const guardians = await listGuardianRelationships(user.id);
  const masteryData = getLearnerMastery(user.id);
  const challenges = getChallengesList();

  // Signature Daily Learning Loop recommendation based on observable learning evidence
  const dailyRec = getDailyLearningRecommendation(learnerProfile, masteryData);

  // Dynamically provision CBT assessments based on the student's selected class, goal, and state
  const provisionedAssessments = getProvisionedAssessments(learnerProfile);
  const diagnosticTest = provisionedAssessments.find((a) => a.category === "diagnostic") || provisionedAssessments[0];
  const sprints = provisionedAssessments.filter((a) => a.category === "sprint");
  const stateQualifier = provisionedAssessments.find((a) => a.category === "challenge");
  const resolvedTrack = resolveAcademicTrack(learnerProfile?.class_label, learnerProfile?.education_level);

  const trackLabel = resolvedTrack === "arts"
    ? "Arts & Humanities"
    : resolvedTrack === "commercial"
    ? "Commercial & Business"
    : resolvedTrack === "technical"
    ? "Technical & Vocational"
    : resolvedTrack === "general"
    ? "General Basic"
    : "Science & STEM";

  // Dynamic rolling academic cycle (forward-compatible for 2027 and beyond)
  const currentYear = new Date().getFullYear();
  const nextCycleYear = new Date().getMonth() >= 7 ? currentYear + 1 : currentYear;
  const rollingSeniorExam = `JAMB UTME / WAEC WASSCE (${nextCycleYear})`;

  const resolvedExamGoal = learnerProfile?.exam_goal && !learnerProfile.exam_goal.includes("2026")
    ? learnerProfile.exam_goal
    : learnerProfile?.education_level === "primary"
    ? "National Common Entrance Examination (NCEE)"
    : learnerProfile?.education_level === "junior_secondary"
    ? "Basic Education Certificate Examination (BECE)"
    : rollingSeniorExam;

  // Filtered topics & dynamic subject competencies strictly calibrated for this scholar
  const activeTopics = getTopicsForLearner(learnerProfile);
  const dynamicCompetencies = buildLearnerSubjectCompetencies(learnerProfile, masteryData);
  const dynamicForecast = getDynamicExamForecast(dynamicCompetencies, learnerProfile?.class_label, resolvedExamGoal);

  return (
    <main style={{ padding: "36px 0 110px" }}>
      <div style={{ marginBottom: 16 }}>
        <BackButton fallbackUrl="/" label="← Back to Home" />
      </div>

      {/* Real-Time Live Weather, Per-Second Ticking WAT Clock & Dynamic Nigerian Greetings */}
      <WeatherGreetingBanner
        initialState={learnerProfile?.state_name || "Anambra"}
        userName={user?.display_name || "Scholar"}
        classLabel={learnerProfile?.class_label || "SSS 3"}
        examGoal={resolvedExamGoal}
      />

      {(!user.is_demo && (learnerProfile?.study_minutes ?? 0) === 0) && (
        <section
          className="glass-card"
          style={{
            marginBottom: 20,
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            padding: "16px 20px",
            borderRadius: 16
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1.6rem" }}>🌱</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.96rem", color: "var(--brand)" }}>
                Welcome to LearnNaija OS, {user.display_name}!
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                Your curriculum is calibrated for <strong>{learnerProfile?.class_label || "SSS 3"}</strong>. Complete your first 15-minute diagnostic session below to spark your learning streak and unlock national leaderboards!
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ultra-Modern Glassmorphic Scholar Profile Banner */}
      <section
        className="glass-card"
        style={{
          marginBottom: 28,
          background: "var(--glass-surface-raised)",
          border: "1px solid var(--glass-border)",
          boxShadow: "var(--glass-highlight), var(--glass-shadow)",
          padding: "24px 28px",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Ambient Aura Background */}
        <div
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--brand-glow) 0%, transparent 70%)",
            pointerEvents: "none"
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            {/* Glowing Avatar Capsule */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--brand) 0%, #34D399 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                color: "#ffffff",
                boxShadow: "0 0 20px var(--brand-glow), inset 0 1px 2px rgba(255, 255, 255, 0.4)",
                flexShrink: 0
              }}
            >
              🎓
            </div>

            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                <span className="glass-pill" style={{ color: "var(--brand)", borderColor: "var(--brand-border)" }}>
                  Verified Scholar Profile
                </span>
                <span className="badge badge-success" style={{ textTransform: "none" }}>
                  Parameters Calibrated
                </span>
                <span className="badge badge-neutral" style={{ textTransform: "none" }}>
                  🏛️ {trackLabel}
                </span>
                <span className="badge badge-neutral" style={{ textTransform: "none", color: "#EA580C" }}>
                  🔥 {learnerProfile?.streak_days ?? (user.is_demo ? 7 : 0)}-Day Streak
                </span>
              </div>

              <h1 style={{ fontSize: "1.9rem", margin: "4px 0 8px", letterSpacing: "-.03em", color: "var(--ink)", fontWeight: 900 }}>
                Welcome back, {user?.display_name || "Scholar"}
              </h1>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: "0.9rem", color: "var(--muted)" }}>
                <span>📍 <strong>State:</strong> {learnerProfile?.state_name || "Anambra"}</span>
                <span>📚 <strong>Class:</strong> {learnerProfile?.class_label || "SSS 3"}</span>
                <span>🏛️ <strong>Track:</strong> {trackLabel}</span>
                <span>🎯 <strong>Target:</strong> {resolvedExamGoal}</span>
                <span>🗣️ <strong>Language:</strong> {learnerProfile?.preferred_language === "pcm" ? "Naija Pidgin" : "English"}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/promotion" className="btn btn-secondary btn-sm" title="Academic Placement & Promotion Protocol">
              🎓 Academic Promotion &amp; Advancement
            </Link>
            <Link href="/guardian" className="btn btn-outline btn-sm">
              👨‍👩‍👧 Guardian: {guardians.length > 0 ? "Linked" : "Link Parent"}
            </Link>
          </div>
        </div>
      </section>

      {/* Socratic AI Quick Inquiry Bar (Cmd+K / Ctrl+K) */}
      <SocraticAiQuickBar
        preferredLanguage={learnerProfile?.preferred_language || "en"}
        currentSubject={diagnosticTest?.title || "General Mathematics"}
        learnerLevel={learnerProfile?.education_level || "senior_secondary"}
      />

      {/* 1-Click CBT Sprint Quick-Launcher with JAMB Hotkeys */}
      <QuickLaunchCBTSprint
        examGoal={resolvedExamGoal}
        classLabel={learnerProfile?.class_label || "SSS 3 Science"}
        assessmentId={sprints[0]?.id || diagnosticTest?.id || "asm-sprint-sss-math-quad"}
        subjectTitle={sprints[0]?.title || diagnosticTest?.title || "General Mathematics & Trigonometry"}
      />

      {/* Target Exam Countdown & Cutoff Score Tracker */}
      <ExamCountdownGauge
        examGoal={resolvedExamGoal}
        classLabel={learnerProfile?.class_label || "SSS 3"}
        targetCutoff={learnerProfile?.education_level === "primary" ? 140 : learnerProfile?.education_level === "junior_secondary" ? 75 : 310}
        projectedScore={dynamicForecast.compositeScore}
        learnerCompetencies={dynamicCompetencies}
      />

      {/* World-Class Academic Learning Analytics Section */}
      <LearningAnalyticsDashboard
        userName={user?.display_name || "Scholar"}
        classLabel={learnerProfile?.class_label || "SSS 3"}
        examGoal={resolvedExamGoal}
        stateName={learnerProfile?.state_name || "Anambra"}
        streakDays={learnerProfile?.streak_days ?? (user.is_demo ? 7 : 0)}
        totalXp={learnerProfile?.total_xp ?? (user.is_demo ? 3420 : 0)}
        studyMinutes={learnerProfile?.study_minutes ?? (user.is_demo ? 475 : 0)}
        masteryData={masteryData}
        learnerCompetencies={dynamicCompetencies}
      />

      {/* Sovereign League Tier & Weekly Tournament Standings */}
      <SovereignLeagueCard
        currentXp={learnerProfile?.total_xp ?? (user.is_demo ? 3420 : 0)}
        streakDays={learnerProfile?.streak_days ?? (user.is_demo ? 7 : 0)}
        stateName={learnerProfile?.state_name || "Anambra"}
        userName={user?.display_name || "Scholar"}
        educationLevel={learnerProfile?.education_level}
        classLabel={learnerProfile?.class_label}
        academicTrack={learnerProfile?.academic_track || resolvedTrack}
      />

      {/* The Signature Daily Learning Loop Card */}
      <section
        className="glass-card"
        style={{
          marginBottom: 28,
          border: "1px solid var(--brand-border)",
          background: "var(--glass-surface-raised)",
          padding: "26px 30px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "var(--glass-highlight), var(--glass-shadow-lg)",
          borderRadius: 22
        }}
      >
        {/* Subtle Brand Ambient Glow */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--brand-glow) 0%, transparent 70%)",
            pointerEvents: "none"
          }}
        />

        {/* Top Meta Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="pill" style={{ margin: 0 }}>
              🎯 Today&apos;s Signature Action
            </span>
            <span
              style={{
                background: "rgba(16, 185, 129, 0.12)",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "3px 12px",
                borderRadius: 9999,
                fontSize: "0.82rem",
                fontWeight: 800
              }}
            >
              📚 {dailyRec.subject}
            </span>
            <span
              style={{
                background: "rgba(245, 158, 11, 0.12)",
                color: "#f59e0b",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                padding: "3px 10px",
                borderRadius: 9999,
                fontSize: "0.82rem",
                fontWeight: 700
              }}
            >
              ⚡ +150 XP on Completion
            </span>
          </div>

          <span className="badge badge-success" style={{ fontSize: "0.82rem", padding: "5px 12px" }}>
            ⏱️ {dailyRec.targetMinutes} Mins Daily Goal
          </span>
        </div>

        {/* Responsive Two-Column Display Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
            alignItems: "center"
          }}
        >
          {/* Left Column: Heading, Prerequisite Reason & Action Buttons */}
          <div>
            <h2 style={{ fontSize: "1.75rem", margin: "0 0 10px 0", letterSpacing: "-.02em", color: "var(--ink)", fontWeight: 900, lineHeight: 1.25 }}>
              {dailyRec.promptText}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.96rem", lineHeight: 1.55, margin: "0 0 20px 0" }}>
              💡 <strong>Why this topic?</strong> {dailyRec.prerequisiteReason}
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <Link
                href={`/assessments/${dailyRec.assessmentId || diagnosticTest?.id || "sprint-quadratics"}`}
                className="btn btn-primary"
                style={{ padding: "10px 20px", fontSize: "0.95rem" }}
              >
                Start {dailyRec.targetMinutes}-Minute Session Now →
              </Link>
              <Link
                href={`/tutor?topic=${encodeURIComponent(dailyRec.topic)}`}
                className="btn btn-outline"
                style={{ padding: "10px 18px", fontSize: "0.92rem" }}
              >
                🤖 Ask AI Tutor for Pre-Lesson Hints
              </Link>
            </div>
          </div>

          {/* Right Column: Key Competencies Card with Visual Checkmarks */}
          <div
            style={{
              background: "var(--glass-surface)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16,
              padding: "18px 20px",
              boxShadow: "var(--glass-highlight)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--brand)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Key Competencies You Will Build
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Curriculum Calibrated</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dailyRec.learningObjectives.map((obj, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 900,
                      flexShrink: 0,
                      marginTop: 2
                    }}
                  >
                    ✓
                  </span>
                  <span style={{ fontSize: "0.88rem", color: "var(--ink-secondary)", lineHeight: 1.45 }}>
                    {obj}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>🔥 Active Streak Booster</span>
              <Link href="/progress" style={{ fontSize: "0.82rem", color: "var(--brand)", fontWeight: 700, textDecoration: "none" }}>
                View Full Mastery Map →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamically Provisioned Exam Alert Banner */}
      {diagnosticTest && (
        <section
          className="glass-card"
          style={{
            marginBottom: 28,
            borderLeft: "4px solid var(--brand)",
            background: "var(--glass-surface)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <span className="badge badge-warning" style={{ marginBottom: 6 }}>🚀 Priority Benchmark</span>
              <h3 style={{ margin: "4px 0 6px", fontSize: "1.25rem", color: "var(--ink)" }}>{diagnosticTest.title}</h3>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.92rem" }}>
                {diagnosticTest.description}
              </p>
            </div>
            <Link href={`/assessments/${diagnosticTest.id}`} className="btn btn-primary">
              Launch Diagnostic Test →
            </Link>
          </div>
        </section>
      )}

      {/* Provisioned CBT Training Suite */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>⚡ Dynamically Provisioned CBT Suite</h2>
            <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
              Tailored specifically to your {learnerProfile?.class_label || "class"} curriculum and {learnerProfile?.exam_goal || "exam target"}
            </p>
          </div>
          <Link href="/assessments" className="btn btn-outline btn-sm">
            View All ({provisionedAssessments.length}) →
          </Link>
        </div>

        <div className="grid">
          {sprints.slice(0, 3).map((asm) => {
            const qCount = resolveQuestionIdsForAssessment(asm.id).length;
            const mins = asm.time_limit_seconds ? Math.floor(asm.time_limit_seconds / 60) : 5;

            return (
              <div className="glass-card" key={asm.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span className="badge badge-neutral">Class Sprint</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>⏱️ {mins} mins</span>
                  </div>
                  <h3 style={{ fontSize: "1.05rem", lineHeight: 1.4, color: "var(--ink)" }}>{asm.title}</h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--muted)" }}>{asm.description}</p>
                  <div style={{ display: "flex", gap: 10, fontSize: "0.82rem", color: "var(--muted)", margin: "12px 0" }}>
                    <span>📊 <strong>{qCount}</strong> Questions</span>
                    <span>🎯 {asm.class_target || "Targeted"}</span>
                  </div>
                </div>
                <Link href={`/assessments/${asm.id}`} className="btn btn-primary btn-sm" style={{ width: "100%" }}>
                  Start Sprint →
                </Link>
              </div>
            );
          })}

          {stateQualifier && (
            <div className="glass-card" style={{ border: "1px solid var(--accent-gold)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span className="badge badge-success">🏆 State Tournament</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>⏱️ 6 mins</span>
                </div>
                <h3 style={{ fontSize: "1.05rem", lineHeight: 1.4, color: "var(--ink)" }}>{stateQualifier.title}</h3>
                <p style={{ fontSize: "0.88rem", color: "var(--muted)" }}>{stateQualifier.description}</p>
                <div style={{ display: "flex", gap: 10, fontSize: "0.82rem", color: "var(--muted)", margin: "12px 0" }}>
                  <span>📍 <strong>{stateQualifier.state_target}</strong></span>
                  <span>🏅 Leaderboard Active</span>
                </div>
              </div>
              <Link href={`/assessments/${stateQualifier.id}`} className="btn btn-primary btn-sm" style={{ width: "100%" }}>
                Enter State Qualifier →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Core Platform Actions Grid */}
      <div className="grid">
        <div className="glass-card">
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>🤖</div>
          <h3 style={{ color: "var(--ink)" }}>AI Socratic Tutor</h3>
          <p>
            Curriculum explanations in {learnerProfile?.preferred_language === "pcm" ? "Naija Pidgin" : "Standard English"} with NDPA child privacy.
          </p>
          <Link href="/tutor" className="btn btn-primary btn-sm" style={{ width: "100%" }}>
            Ask AI Tutor →
          </Link>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>🏆</div>
          <h3 style={{ color: "var(--ink)" }}>National Challenges</h3>
          <p>Compete in weekly STEM sprints across 36 states with verified leaderboards.</p>
          <Link href="/challenges" className="btn btn-primary btn-sm" style={{ width: "100%" }}>
            View Competitions →
          </Link>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>📖</div>
          <h3 style={{ color: "var(--ink)" }}>Curriculum Explorer</h3>
          <p>Browse official NERDC topics, syllabus hierarchies, and item bank provenance.</p>
          <Link href="/curriculum" className="btn btn-secondary btn-sm" style={{ width: "100%" }}>
            Browse Syllabus →
          </Link>
        </div>
      </div>

      {/* Topic Mastery Tracker */}
      <TopicMasteryIndex
        topics={activeTopics}
        masteryData={masteryData}
        trackLabel={trackLabel}
      />

      {/* Diagnostic Mistake Vault Autopsy & Root-Cause Classifier */}
      <MistakeVaultAutopsy
        educationLevel={learnerProfile?.education_level}
        classLabel={learnerProfile?.class_label}
        academicTrack={learnerProfile?.academic_track || resolvedTrack}
      />

      {/* Persistent Question History & Mistake Vault */}
      <MistakeVault />

      {/* Peer Study Circles & Group Learning Banner */}
      <section
        className="glass-card"
        style={{
          marginTop: 24,
          background: "linear-gradient(135deg, rgba(4, 120, 87, 0.08) 0%, rgba(2, 132, 199, 0.08) 100%)",
          border: "1px solid var(--glass-border)",
          padding: "24px 28px",
          borderRadius: 20
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span className="badge badge-success" style={{ marginBottom: 6 }}>👥 Peer Group Learning</span>
            <h3 style={{ margin: "4px 0 6px", fontSize: "1.3rem", color: "var(--ink)" }}>
              Study Circles &amp; Co-Solving Rooms
            </h3>
            <p style={{ margin: 0, color: "var(--muted)", maxWidth: 640, fontSize: "0.93rem", lineHeight: 1.5 }}>
              Study curriculum topics together in real time. Work through the exact same questions with your study circle on a collaborative whiteboard, then launch a timed peer battle!
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/study-group" className="btn btn-primary">
              Enter Study Circles →
            </Link>
            <Link href="/challenges" className="btn btn-secondary">
              ⚔️ Peer Duels Arena
            </Link>
          </div>
        </div>
      </section>

      {/* Active Competitions Preview (Strictly Filtered by Education Tier) */}
      <section style={{ marginTop: 24 }}>
        <h2 className="section-title" style={{ margin: "0 0 16px" }}>🔥 Open National Challenges</h2>
        <div className="grid">
          {challenges
            .filter((chl) => {
              const isPri = learnerProfile?.education_level === "primary" || (learnerProfile?.class_label && learnerProfile.class_label.toLowerCase().includes("primary"));
              const isJun = learnerProfile?.education_level === "junior_secondary" || (learnerProfile?.class_label && learnerProfile.class_label.toLowerCase().includes("jss"));
              if (isPri) return chl.tier === "primary" || chl.tier === "all";
              if (isJun) return chl.tier === "junior" || chl.tier === "all";
              if (resolvedTrack === "arts") return chl.tier === "senior_arts" || chl.tier === "all";
              if (resolvedTrack === "commercial") return chl.tier === "senior_commercial" || chl.tier === "all";
              return chl.tier === "senior_science" || chl.tier === "all";
            })
            .slice(0, 3)
            .map((chl) => (
            <div className="glass-card" key={chl.id}>
              <span className="badge badge-success" style={{ marginBottom: 8 }}>Active</span>
              <h3 style={{ color: "var(--ink)" }}>{chl.title}</h3>
              <p>{chl.prize_description}</p>
              <Link href={`/challenges`} className="btn btn-outline btn-sm">
                Enter Challenge &amp; Leaderboard →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

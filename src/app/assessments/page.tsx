import { BackButton } from "@/components/navigation/back-button";
import Link from "next/link";
import { getCurrentUser, getLearnerProfile } from "@/lib/auth/session";
import { getProvisionedAssessments } from "@/lib/assessment/provisioning";
import { SEED_ASSESSMENTS } from "@/lib/assessment/engine";
import { AssessmentFilterView } from "@/components/assessment/assessment-filter-view";
import { GuardianAssessmentAudit } from "@/components/assessment/guardian-assessment-audit";
import { TeacherAssessmentDispatcher } from "@/components/assessment/teacher-assessment-dispatcher";

export default async function AssessmentsPage() {
  const user = await getCurrentUser();
  const learnerProfile = user ? await getLearnerProfile(user.id) : null;
  const provisioned = getProvisionedAssessments(learnerProfile);

  const diagnosticTests = provisioned.filter((a) => a.category === "diagnostic");
  const sprintTests = provisioned.filter((a) => a.category === "sprint");
  const challengeTests = provisioned.filter((a) => a.category === "challenge");

  const isGuardian = user?.role === "parent";
  const isTeacher = user?.role === "teacher";

  return (
    <main style={{ padding: "40px 0 60px" }}>
      <div style={{ marginBottom: 20 }}>
        <BackButton
          fallbackUrl={isGuardian ? "/guardian" : isTeacher ? "/teacher" : "/dashboard"}
          label={isGuardian ? "← Back to Parent Portal" : isTeacher ? "← Back to Teacher Cockpit" : "← Back to Dashboard"}
        />
      </div>

      {/* Role-Specific Header Banner */}
      {isGuardian ? (
        <div style={{ marginBottom: 28 }}>
          <span className="pill">NDPA 2023 Ward Supervisory Vault</span>
          <h1 style={{ fontSize: "2.2rem", margin: "12px 0 8px", letterSpacing: "-.03em" }}>
            Ward CBT Assessments &amp; Proctored Drill Audit
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: 740, fontSize: "1.02rem", lineHeight: 1.6 }}>
            Review your children&apos;s completed CBT examinations, question-by-question timing, accuracy breakdown, and assign new practice sessions directly to their student dashboard. Guardians have read-only audit rights under NDPA 2023.
          </p>
        </div>
      ) : isTeacher ? (
        <div style={{ marginBottom: 28 }}>
          <span className="pill">TRCN Accredited Curriculum Dispatcher</span>
          <h1 style={{ fontSize: "2.2rem", margin: "12px 0 8px", letterSpacing: "-.03em" }}>
            Official Assessment Item Bank &amp; Cohort Dispatcher
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: 740, fontSize: "1.02rem", lineHeight: 1.6 }}>
            Browse standard NERDC, WAEC, NECO, and JAMB question pools, preview official marking guides, and dispatch timed drills to your student cohorts with 1 click.
          </p>
        </div>
      ) : (
        <div style={{ marginBottom: 28 }}>
          <span className="pill">Server-Authoritative CBT Testing</span>
          <h1 style={{ fontSize: "2.2rem", margin: "12px 0 8px", letterSpacing: "-.03em" }}>
            Computer-Based Test (CBT) Assessments
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: 680, fontSize: "1.05rem", lineHeight: 1.6 }}>
            All tests are evaluated server-side against official NERDC, WAEC, and JAMB standards.
            Answer keys are strictly protected from client inspection, and results update your topic mastery automatically.
          </p>
        </div>
      )}

      {/* Active Scholar Parameter Alignment (Students Only) */}
      {!isGuardian && !isTeacher && learnerProfile && (
        <div className="card" style={{ marginBottom: 32, background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)", borderColor: "var(--brand-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span className="badge badge-success" style={{ marginBottom: 6 }}>🎯 Active Parameter Provisioning</span>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                Tests Provisioned for: {learnerProfile.class_label || "SSS 3"} • {learnerProfile.exam_goal || "JAMB UTME 2026"}
              </div>
              <div style={{ fontSize: "0.88rem", color: "var(--muted)", marginTop: 2 }}>
                📍 {learnerProfile.state_name || "Anambra"} State Curriculum Track • 🗣️ Explanations: {learnerProfile.preferred_language === "pcm" ? "Naija Pidgin" : "Standard English"}
              </div>
            </div>
            <Link href="/promotion" className="btn btn-secondary btn-sm">
              🎓 Academic Promotion &amp; Advancement
            </Link>
          </div>
        </div>
      )}

      {/* Role-Segregated Views */}
      {isGuardian ? (
        <GuardianAssessmentAudit />
      ) : isTeacher ? (
        <TeacherAssessmentDispatcher
          diagnosticTests={diagnosticTests}
          sprintTests={sprintTests}
          challengeTests={challengeTests}
        />
      ) : (
        <AssessmentFilterView
          diagnosticTests={diagnosticTests}
          sprintTests={sprintTests}
          challengeTests={challengeTests}
          seedAssessments={SEED_ASSESSMENTS}
          educationLevel={learnerProfile?.education_level}
        />
      )}
    </main>
  );
}

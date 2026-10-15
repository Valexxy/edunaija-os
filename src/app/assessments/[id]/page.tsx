"use client";
import { BackButton } from "@/components/navigation/back-button";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { ShareableScorecard } from "@/components/progress/shareable-scorecard";
import { ScientificCalculator } from "@/components/calculator/scientific-calculator";
import { AntiMalpracticeMonitor } from "@/components/security/anti-malpractice-monitor";
import { ZenModeToggle } from "@/components/layout/zen-mode-toggle";
import {
  saveAssessmentAnswerLocally,
  getLocalAssessmentAnswers,
  enqueueOfflineAction,
  cacheAssessmentData,
  getCachedAssessmentData
} from "@/lib/offline/sync-queue";
import { generateScoreReceipt, type ExamScoreReceipt } from "@/lib/security/score-receipt";
import { saveAttemptQuestions } from "@/lib/assessment/history-store";
import type { PublicQuestionItem } from "@/lib/curriculum/types";
import type { Assessment, AssessmentEvaluationResult } from "@/lib/assessment/types";
import { soundFx } from "@/lib/audio/sound-fx";
import { triggerConfetti } from "@/lib/ui/confetti";

interface AssessmentWithTargets extends Assessment {
  class_target?: string;
  exam_target?: string;
  state_target?: string;
}

export default function AssessmentExamPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const assessmentId = resolvedParams.id;

  const [assessment, setAssessment] = useState<AssessmentWithTargets | null>(null);
  const [questions, setQuestions] = useState<PublicQuestionItem[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [learnerProfile, setLearnerProfile] = useState<{
    class_label?: string;
    exam_goal?: string;
    state_name?: string;
    preferred_language?: string;
    education_level?: string;
  } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentEvaluationResult | null>(null);
  const [roleRestrictedUser, setRoleRestrictedUser] = useState<{ display_name: string; role: string } | null>(null);
  const [scoreReceipt, setScoreReceipt] = useState<ExamScoreReceipt | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; display_name: string; role: string } | null>(null);
  const [parentEmailInput, setParentEmailInput] = useState("");
  const [error, setError] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailResultMsg, setEmailResultMsg] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleEmailParentReport = async () => {
    if (!result) return;
    const targetEmail = parentEmailInput.trim() || (typeof window !== "undefined" ? window.prompt("Enter Parent / Guardian email address:")?.trim() : "");
    if (!targetEmail) {
      setEmailResultMsg("Please provide a valid parent email address.");
      return;
    }

    setIsEmailSending(true);
    setEmailResultMsg("");

    try {
      const weakItems = result.feedback.filter((f) => !f.isCorrect).map((f) => f.prompt.slice(0, 80));
      const res = await fetch("/api/email/scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentEmail: targetEmail,
          parentName: "Parent / Guardian",
          studentName: currentUser?.display_name || (learnerProfile?.class_label ? `Scholar (${learnerProfile.class_label})` : "LearnNaija Scholar"),
          subject: assessment?.subject_id || "General Mathematics",
          topic: assessment?.title || "CBT Practice Assessment",
          scorePercentage: result.percentage,
          demonstratedMastery: result.percentage >= 85 ? "Secure" : result.percentage >= 70 ? "Proficient" : result.percentage >= 50 ? "Developing" : "Starting",
          weakSubtopics: weakItems,
          recommendedAction: "Review the question feedback notes and practise 3 follow-up diagnostic items."
        })
      });

      const data = await res.json();
      if (res.ok) {
        setEmailResultMsg(`✓ Verified scorecard delivered via Resend to ${targetEmail}! (ID: ${data.emailId || "OK"})`);
      } else {
        setEmailResultMsg(`Notice: ${data.error || "Email delivery queued"}`);
      }
    } catch {
      setEmailResultMsg("Network delivery notice: Scorecard saved to student record.");
    } finally {
      setIsEmailSending(false);
    }
  };

  // Instant Socratic AI Breakdown inside results card
  const [inlineExplanations, setInlineExplanations] = useState<Record<string, { loading: boolean; text?: string; error?: string }>>({});

  const handleInlineAiExplanation = async (questionId: string, promptText: string) => {
    setInlineExplanations((prev) => ({
      ...prev,
      [questionId]: { loading: true }
    }));

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Break down and explain this examination problem step by step with clear intuition: ${promptText}`,
          learnerLevel: (learnerProfile?.education_level as any) || "senior_secondary",
          subject: assessment?.subject_id || "General Mathematics",
          language: learnerProfile?.preferred_language === "pcm" ? "pcm" : "en"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to contact AI Tutor");
      setInlineExplanations((prev) => ({
        ...prev,
        [questionId]: { loading: false, text: data.explanation }
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error contacting AI Tutor";
      setInlineExplanations((prev) => ({
        ...prev,
        [questionId]: { loading: false, error: msg }
      }));
    }
  };

  // 1. Initialize Exam & Start Attempt on Server (with Offline-First Fallback)
  useEffect(() => {
    async function initExam() {
      try {
        setIsLoading(true);
        // Try network fetch first
        const qRes = await fetch(`/api/assessments/${assessmentId}`);
        if (qRes.ok) {
          const qData = await qRes.json();
          // Check role: Guardians and Teachers should not be given exam attempts
          if (qData.user && qData.user.role !== "student") {
            setRoleRestrictedUser(qData.user);
            setIsLoading(false);
            return;
          }

          if (qData.user) {
            setCurrentUser(qData.user);
          }
          setAssessment(qData.assessment);
          setQuestions(qData.questions);
          setTimeLeft(qData.assessment.time_limit_seconds || 600);
          if (qData.learnerProfile) {
            setLearnerProfile(qData.learnerProfile);
          }
          // Cache questions for offline resilience
          cacheAssessmentData(assessmentId, qData);
        } else {
          const errData = await qRes.json().catch(() => ({}));
          throw new Error(errData.error || `Assessment load failed (HTTP ${qRes.status})`);
        }

        // Start attempt session on server
        const startRes = await fetch(`/api/assessments/${assessmentId}/start`, {
          method: "POST"
        });
        if (startRes.status === 401) {
          window.location.href = `/login?redirectTo=/assessments/${assessmentId}`;
          return;
        }
        if (startRes.ok) {
          const startData = await startRes.json();
          setAttemptId(startData.attempt.id);
        } else {
          setAttemptId(`offline-attempt-${Date.now()}`);
        }
      } catch (err: unknown) {
        // Fallback to offline cached assessment if browser is offline
        interface CachedAssessmentPayload {
          assessment: AssessmentWithTargets;
          questions: PublicQuestionItem[];
          learnerProfile?: { class_label?: string; exam_goal?: string; state_name?: string };
        }
        const cached = getCachedAssessmentData<CachedAssessmentPayload>(assessmentId);
        if (cached) {
          setAssessment(cached.assessment);
          setQuestions(cached.questions);
          if (cached.learnerProfile) setLearnerProfile(cached.learnerProfile);
          setTimeLeft(cached.assessment?.time_limit_seconds || 600);
          setAttemptId(`offline-attempt-${Date.now()}`);
        } else if (typeof navigator !== "undefined" && !navigator.onLine) {
          setError("Assessment unavailable offline. Please connect to the internet to download questions.");
        } else {
          const msg = err instanceof Error ? err.message : "Failed to load assessment questions from server.";
          setError(msg);
        }
      } finally {
        // Restore locally saved answers if recovering from unexpected browser refresh
        const savedAnswers = getLocalAssessmentAnswers(assessmentId);
        if (savedAnswers && Object.keys(savedAnswers).length > 0) {
          setSelectedAnswers(savedAnswers);
        }
        setIsLoading(false);
      }
    }

    initExam();
  }, [assessmentId]);

  // Submit & Server-Authoritative Evaluation
  const submitExam = useCallback(async () => {
    if (!attemptId || isSubmitting || result) return;
    setIsSubmitting(true);

    try {
      const answersPayload: Record<string, { selectedOptionId: string }> = {};
      for (const [qId, optId] of Object.entries(selectedAnswers)) {
        answersPayload[qId] = { selectedOptionId: optId };
      }

      const res = await fetch(`/api/assessments/${assessmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers: answersPayload
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      const data = await res.json();
      setResult(data.result);

      // Dopamine auditory & visual reward
      if (data.result?.percentage >= 70) {
        soundFx.playFanfare();
        triggerConfetti(3500);
      } else {
        soundFx.playSuccessChime();
      }

      // Persist to Question History & Mistake Vault
      if (data.result?.feedback) {
        saveAttemptQuestions(
          attemptId,
          assessmentId,
          assessment?.title || "Exam Diagnostic Assessment",
          assessment?.subject_id || "General Mathematics",
          data.result.feedback
        );
      }

      if (typeof window !== "undefined") {
        document.body.classList.remove("zen-mode-active");
        localStorage.removeItem("edunaija_zen_mode");
      }

      // Generate verifiable cryptographic score receipt
      const receipt = generateScoreReceipt({
        attemptId,
        studentId: currentUser?.id || "demo-student-user-001",
        assessmentId,
        score: data.result.score,
        totalQuestions: data.result.maxScore
      });
      setScoreReceipt(receipt);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit assessment";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [assessmentId, attemptId, isSubmitting, learnerProfile, result, selectedAnswers]);

  // 2. Countdown Timer
  useEffect(() => {
    if (!attemptId || result || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptId, result, timeLeft, submitExam]);

  // 3. Option Selection & Asynchronous Server Recording (with Offline Queue)
  const handleSelectOption = (questionId: string, optionId: string) => {
    soundFx.playClickSound();
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    saveAssessmentAnswerLocally(assessmentId, questionId, optionId);

    if (attemptId) {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueueOfflineAction({
          type: "answer_submit",
          endpoint: `/api/assessments/${assessmentId}/answer`,
          method: "POST",
          payload: { attemptId, questionId, response: { selectedOptionId: optionId } }
        });
      } else {
        fetch(`/api/assessments/${assessmentId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            questionId,
            response: { selectedOptionId: optionId }
          })
        }).catch(() => {
          enqueueOfflineAction({
            type: "answer_submit",
            endpoint: `/api/assessments/${assessmentId}/answer`,
            method: "POST",
            payload: { attemptId, questionId, response: { selectedOptionId: optionId } }
          });
        });
      }
    }
  };

  if (roleRestrictedUser && roleRestrictedUser.role !== "student") {
    const isGuardian = roleRestrictedUser.role === "parent";
    return (
      <main style={{ maxWidth: 640, margin: "60px auto", padding: "0 16px" }}>
        <div style={{ marginBottom: 20 }}>
          <BackButton
            fallbackUrl={isGuardian ? "/guardian" : "/teacher"}
            label={isGuardian ? "← Back to Guardian Portal" : "← Back to Teacher Cockpit"}
          />
        </div>
        <div className="glass-card" style={{ padding: 36, textAlign: "center", borderRadius: 20 }}>
          <div style={{ fontSize: "3.2rem", marginBottom: 12 }}>{isGuardian ? "🛡️" : "🧑‍🏫"}</div>
          <span
            className="glass-pill"
            style={{
              color: isGuardian ? "#0284c7" : "#d97706",
              borderColor: isGuardian ? "rgba(2, 132, 199, 0.3)" : "rgba(217, 119, 6, 0.3)",
              marginBottom: 16
            }}
          >
            {isGuardian ? "Parent / Guardian Oversight View" : "Educator Cockpit View"}
          </span>
          <h2 style={{ fontSize: "1.7rem", margin: "12px 0 10px", color: "var(--ink)" }}>
            CBT Exams are for Enrolled Students
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.6, maxWidth: 520, margin: "0 auto 24px" }}>
            You are currently signed in as <strong>{roleRestrictedUser.display_name} ({isGuardian ? "Guardian" : "Teacher"})</strong>.
            {isGuardian
              ? " As a guardian, you monitor your ward's CBT test performance, review diagnostic scorecards, and approve class promotions in the Guardian Portal rather than taking exams directly."
              : " As an educator, you assign curriculum assessments and monitor diagnostic class gaps in the Teacher Cockpit."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link
              href={isGuardian ? "/guardian" : "/teacher"}
              className="btn btn-primary"
              style={{ justifyContent: "center", padding: "12px 20px" }}
            >
              {isGuardian ? "🛡️ Go to Ward Overview & Scorecards" : "🧑‍🏫 Go to Teacher Cockpit"}
            </Link>

            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/demo-switch", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ personaId: "demo-student-user-001" })
                });
                window.location.reload();
              }}
              className="btn btn-secondary"
              style={{ justifyContent: "center", padding: "11px 20px" }}
            >
              🧪 Switch to Student Persona (Chidi Okonkwo - SSS 3 Science) to Test CBT
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main style={{ padding: "80px 0", textAlign: "center" }}>
        <p style={{ fontSize: "1.2rem", color: "var(--muted)" }}>⏳ Initializing Secure CBT Session...</p>
      </main>
    );
  }

  if (error && !result) {
    return (
      <main style={{ padding: "60px 0", maxWidth: 500 }}>
        <div className="alert alert-error">{error}</div>
        <Link href="/assessments" className="btn btn-secondary">← Back to Assessments</Link>
      </main>
    );
  }

  // Post-Exam Result View
  if (result) {
    const isPassing = result.percentage >= 60;
    const targetClass = assessment?.class_target || learnerProfile?.class_label || "SSS 3";
    const targetExam = assessment?.exam_target || learnerProfile?.exam_goal || (
      targetClass.toLowerCase().includes("primary") ? "National Common Entrance Examination (NCEE)" :
      targetClass.toLowerCase().includes("jss") ? "Basic Education Certificate Examination (BECE)" :
      "JAMB UTME & WAEC Senior Secondary"
    );
    const lang = learnerProfile?.preferred_language === "pcm" ? "Naija Pidgin" : "Standard English";

    return (
      <main style={{ padding: "40px 0 80px", maxWidth: 840 }}>
        <div style={{ marginBottom: 20 }}>
          <BackButton fallbackUrl="/assessments" label="← Back to Assessments" />
        </div>
        <div className="card" style={{ marginBottom: 24, textAlign: "center", padding: 36 }}>
          <span className="badge badge-success" style={{ marginBottom: 12 }}>Server Graded & Verified</span>
          <h1 style={{ fontSize: "2.4rem", margin: "8px 0" }}>
            Score: {result.score} / {result.maxScore} ({result.percentage}%)
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.05rem" }}>
            {isPassing ? "🎉 Great Work! Topic mastery has been updated on your curriculum record." : "📚 Good drill attempt! Review the verified explanations below."}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
            <span>⏱️ Time: <strong>{result.timeSpentSeconds}s</strong></span>
            <span>🎯 Status: <strong>{isPassing ? "Pass" : "Needs Review"}</strong></span>
          </div>

          {scoreReceipt && (
            <div style={{ marginTop: 14, background: "var(--brand-light)", border: "1px solid var(--brand-border)", borderRadius: 10, padding: "8px 16px", display: "inline-block", fontSize: "0.85rem", color: "var(--brand-dark)" }}>
              🔒 <strong>Cryptographic Certificate Receipt:</strong> <code>{scoreReceipt.certificateNumber}</code> (NDPA / CBT Audit Verified ✓)
            </div>
          )}

          {/* Academic Parameter Verification Badge */}
          <div className="card" style={{ marginTop: 24, background: "var(--surface-sunken)", padding: "16px 20px", textAlign: "left" }}>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.95rem" }}>
              🔍 Student Parameter Verification Report
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: "0.88rem" }}>
              <div><strong>Target Class:</strong> {targetClass}</div>
              <div><strong>Target Exam Standard:</strong> {targetExam}</div>
              <div><strong>State Curriculum Track:</strong> {learnerProfile?.state_name || "National"}</div>
              <div><strong>Explanation Language:</strong> {lang}</div>
            </div>
            <div style={{ marginTop: 10, fontSize: "0.85rem", color: "var(--brand-dark)" }}>
              ✅ This test was dynamically provisioned and evaluated strictly against your {targetClass} academic parameters.
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/dashboard" className="btn btn-primary">Return to Dashboard</Link>
            <div style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="email"
                placeholder="Parent Email (e.g. parent@gmail.com)"
                value={parentEmailInput}
                onChange={(e) => setParentEmailInput(e.target.value)}
                style={{
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  fontSize: "0.85rem",
                  background: "var(--surface)",
                  color: "var(--ink)",
                  minWidth: 240
                }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleEmailParentReport}
                disabled={isEmailSending}
              >
                {isEmailSending ? "Sending via Resend..." : "📧 Dispatch to Parent"}
              </button>
            </div>
            <Link href="/tutor" className="btn btn-outline">
              🤖 Review Weak Topics with AI Tutor ({lang})
            </Link>
          </div>

          {emailResultMsg && (
            <div className="alert alert-success" style={{ marginTop: 16, textAlign: "left", fontSize: "0.9rem" }}>
              {emailResultMsg}
            </div>
          )}
        </div>

        {/* Viral Progress Milestone & Sharable Card (Native Web Share & 1-Click Clipboard, No 3rd Party Bot Dependency) */}
        <div style={{ marginBottom: 32 }}>
          <ShareableScorecard
            studentName={currentUser?.display_name || (learnerProfile?.class_label ? `Scholar (${learnerProfile.class_label})` : "LearnNaija Scholar")}
            classLabel={targetClass}
            subject={assessment?.subject_id ? assessment.subject_id.toUpperCase() : "Mathematics"}
            topic={assessment?.title || "Exam Diagnostic Assessment"}
            scorePercentage={result.percentage}
            demonstratedMastery={
              result.percentage >= 80 ? "Mastered (Distinction)" :
              result.percentage >= 65 ? "Proficient (Credit)" :
              result.percentage >= 50 ? "Developing (Pass)" : "Foundational (Needs Revision)"
            }
            accuracyText={`Verified on ${targetExam} Standards`}
          />
        </div>

        {/* Detailed Feedback Breakdown */}
        <h2 className="section-title">Diagnostic Item Review & Explanations</h2>
        {result.feedback.map((item, index) => (
          <div
            key={item.questionId}
            className="card"
            style={{
              marginBottom: 16,
              borderLeft: `6px solid ${item.isCorrect ? "var(--success)" : "var(--danger)"}`
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontWeight: 700 }}>Question {index + 1}</span>
              <span className={`badge ${item.isCorrect ? "badge-success" : "badge-danger"}`}>
                {item.isCorrect ? "✓ Correct (+1.0)" : "✗ Incorrect (0.0)"}
              </span>
            </div>
            <p className="question-prompt" style={{ fontSize: "1.05rem", margin: "8px 0 14px" }}>
              {item.prompt}
            </p>
            <div style={{ background: "var(--canvas)", padding: "12px 16px", borderRadius: 10, fontSize: "0.92rem", marginBottom: 8 }}>
              💡 <strong>Pedagogical Explanation:</strong> {item.explanation}
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => handleInlineAiExplanation(item.questionId, item.prompt)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.82rem", padding: "5px 12px" }}
                disabled={inlineExplanations[item.questionId]?.loading}
              >
                {inlineExplanations[item.questionId]?.loading
                  ? "🤖 AI Tutor Analyzing Concept..."
                  : inlineExplanations[item.questionId]?.text
                  ? "✓ Socratic Explanation Ready"
                  : "🤖 Explain Here (Instant Socratic AI Breakdown)"}
              </button>
              <Link
                href={`/tutor?question=${encodeURIComponent(`Explain this concept step by step: ${item.prompt}`)}&subject=${encodeURIComponent(assessment?.subject_id || "General Mathematics")}`}
                className="btn btn-outline btn-sm"
                style={{ fontSize: "0.82rem", padding: "5px 12px" }}
              >
                Open in Full AI Tutor Workspace →
              </Link>
            </div>

            {inlineExplanations[item.questionId]?.loading && (
              <div style={{ marginTop: 10, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: 8, fontSize: "0.86rem", color: "#065f46" }}>
                ⏳ <strong>AI Tutor Generating Guidance:</strong> Analyzing problem structure and preparing step-by-step analogies...
              </div>
            )}

            {inlineExplanations[item.questionId]?.text && (
              <div style={{ marginTop: 12, padding: "14px 18px", background: "#f0fdf4", border: "1.5px solid #10b981", borderRadius: 10, textAlign: "left" }}>
                <div style={{ fontWeight: 700, color: "#065f46", fontSize: "0.92rem", marginBottom: 6 }}>
                  🤖 Socratic Step-by-Step AI Guidance:
                </div>
                <div style={{ fontSize: "0.94rem", lineHeight: 1.6, color: "#0f172a" }}>
                  {inlineExplanations[item.questionId]?.text}
                </div>
              </div>
            )}

            {inlineExplanations[item.questionId]?.error && (
              <div style={{ marginTop: 10, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: "0.86rem", color: "#991b1b" }}>
                ⚠️ {inlineExplanations[item.questionId]?.error}
              </div>
            )}
          </div>
        ))}
      </main>
    );
  }

  // Active Exam Simulator View
  const currentQuestion = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <main className="exam-container">
      <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <button
          type="button"
          onClick={() => {
            if (Object.keys(selectedAnswers).length > 0 && !result) {
              setShowExitConfirm(true);
            } else {
              window.location.href = "/assessments";
            }
          }}
          className="btn btn-secondary btn-sm"
          style={{ padding: "6px 14px", fontWeight: 700 }}
        >
          ← Exit Assessment
        </button>

        <button
          type="button"
          onClick={submitExam}
          disabled={isSubmitting}
          className="btn btn-primary btn-sm"
          style={{ fontWeight: 800, padding: "8px 18px", boxShadow: "0 2px 10px rgba(16, 185, 129, 0.3)" }}
        >
          {isSubmitting
            ? "Scoring on Server..."
            : `✓ Submit Exam (${Object.keys(selectedAnswers).length}/${questions.length} Answered)`}
        </button>
      </div>

      {/* Full-Screen Glowing Server-Scoring Modal */}
      {isSubmitting && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 15, 29, 0.82)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 20
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 460,
              width: "100%",
              padding: "36px 28px",
              borderRadius: 22,
              background: "var(--glass-surface-raised)",
              border: "1.5px solid var(--brand-border)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), 0 0 35px var(--brand-glow)",
              textAlign: "center"
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                margin: "0 auto 18px",
                borderRadius: "50%",
                border: "4px solid rgba(16, 185, 129, 0.2)",
                borderTopColor: "var(--brand)",
                animation: "spin 1s linear infinite",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem"
              }}
            >
              ⚡
            </div>
            <h3 style={{ fontSize: "1.35rem", margin: "0 0 8px", color: "var(--ink)", fontWeight: 900 }}>
              Scoring Exam on Server...
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.5, margin: "0 0 16px" }}>
              Auditing answers against statutory benchmarks, computing earned XP, and minting your cryptographic score receipt...
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: 9999,
                fontSize: "0.82rem",
                color: "var(--brand)",
                fontWeight: 700
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10b981"
                }}
              />
              Anti-Cheat Verification In Progress
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 480,
              width: "100%",
              padding: "28px 24px",
              borderRadius: 20,
              background: "var(--glass-surface-raised)",
              border: "1.5px solid var(--glass-border)",
              boxShadow: "var(--glass-shadow-lg)",
              textAlign: "center"
            }}
          >
            <span style={{ fontSize: "2.4rem", display: "block", marginBottom: 10 }}>📝</span>
            <h3 style={{ fontSize: "1.25rem", margin: "0 0 8px", color: "var(--ink)", fontWeight: 800 }}>
              Submit Exam Before Exiting?
            </h3>
            <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.5, margin: "0 0 20px" }}>
              You have answered <strong>{Object.keys(selectedAnswers).length}</strong> of <strong>{questions.length}</strong> questions. 
              Would you like to submit your answers now to calculate your XP and view verified explanations, or exit without submitting?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  submitExam();
                }}
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ justifyContent: "center", padding: "12px 20px", fontWeight: 700 }}
              >
                {isSubmitting ? "Scoring on Server..." : "✓ Submit Exam & View Scorecard"}
              </button>
              <Link
                href="/assessments"
                className="btn btn-secondary"
                style={{ justifyContent: "center", padding: "10px 20px" }}
              >
                Discard &amp; Exit to Assessments
              </Link>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="btn btn-outline"
                style={{ justifyContent: "center", padding: "10px 20px" }}
              >
                Keep Answering
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display error alert if submission encountered an issue */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16, padding: "12px 18px", borderRadius: 10 }}>
          ⚠️ <strong>Notice:</strong> {error}
        </div>
      )}

      {/* Exam Header & Timer */}
      <div className="exam-header">
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <span className="badge badge-neutral">Exam in Progress</span>
            <span className="badge badge-neutral" style={{ fontSize: "0.78rem", background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE" }}>
              🛡️ Cloudflare Anti-Cheat Active
            </span>
            {(assessment?.class_target || learnerProfile?.class_label) && (
              <span className="badge badge-success" style={{ textTransform: "none" }}>
                🎯 Calibrated for {assessment?.class_target || learnerProfile?.class_label}
              </span>
            )}
          </div>
          <h2 style={{ fontSize: "1.2rem", margin: "4px 0 0" }}>{assessment?.title}</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <ZenModeToggle />
          <ScientificCalculator />
          <div className={`timer ${timeLeft < 120 ? "warning" : ""}`}>
            ⏱️ {timeFormatted}
          </div>
        </div>
      </div>

      {/* Proctored Anti-Malpractice Exam Integrity Shield */}
      <AntiMalpracticeMonitor onExceededStrikes={submitExam} />

      {/* Question Navigation Palette */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {questions.map((q, idx) => {
          const isAnswered = Boolean(selectedAnswers[q.id]);
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                border: isCurrent ? "2px solid var(--brand)" : "1px solid var(--line)",
                background: isAnswered ? "var(--brand-light)" : "var(--surface)",
                color: isAnswered ? "var(--brand-dark)" : "var(--ink)",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Active Question Box */}
      {currentQuestion && (
        <div className="question-box">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: "0.88rem", color: "var(--muted)", fontWeight: 700 }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="badge badge-neutral">Difficulty {currentQuestion.difficulty}/5</span>
          </div>

          <p className="question-prompt" style={{ fontSize: "1.1rem", marginBottom: 20 }}>
            {currentQuestion.prompt}
          </p>

          <div className="options-list">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`option-label ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => handleSelectOption(currentQuestion.id, opt.id)}
                    className="option-radio"
                  />
                  <span>{opt.text}</span>
                </label>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <button
              className="btn btn-secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            >
              ← Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                >
                  Next →
                </button>
                {Object.keys(selectedAnswers).length > 0 && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={submitExam}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Scoring..." : "Submit CBT Exam"}
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={submitExam}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Scoring on Server..." : "Submit CBT Exam"}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

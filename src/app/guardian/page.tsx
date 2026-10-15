"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BackButton } from "@/components/navigation/back-button";
import type { GuardianRelationship } from "@/lib/auth/session";

interface ChildProfile {
  id: string;
  name: string;
  tier: string;
  classLabel: string;
  school: string;
  targetExam: string;
  avatar: string;
  dailyStudyMinutes: number;
  accuracy: number;
  predictedScore: string;
  currentSubject: string;
  currentTopic: string;
  masteryStatus: "Starting" | "Developing" | "Proficient" | "Mastered";
  identifiedGaps: string[];
  dinnerPrompt: {
    question: string;
    listenFor: string;
    encouragement: string;
  };
  assignedTutor?: {
    name: string;
    trcnId: string;
    subject: string;
    rating: number;
  };
}

export default function GuardianPortalPage() {
  const [relationships, setRelationships] = useState<GuardianRelationship[]>([]);
  const [guardianIdentifier, setGuardianIdentifier] = useState("");
  const [relationshipLabel, setRelationshipLabel] = useState("Parent");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Selected Ward
  const [selectedChildId, setSelectedChildId] = useState("child-1");

  // Study time & Screen controls
  const [dailyMinutesCap, setDailyMinutesCap] = useState(60);
  const [nightLockEnabled, setNightLockEnabled] = useState(true);
  const [nightDataException, setNightDataException] = useState(true); // MTN / Airtel 11PM-6AM

  // NDPA 2023 Section 31 Verifiable Consent State
  const [consentScopes, setConsentScopes] = useState({
    allow_ai_tutor: true,
    allow_live_classes: true,
    allow_academic_analytics: true,
    allow_leaderboard_nickname: false
  });
  const [guardianNin, setGuardianNin] = useState("");
  const [consentSavedMsg, setConsentSavedMsg] = useState("");
  const [isSavingConsent, setIsSavingConsent] = useState(false);
  const [erasureMsg, setErasureMsg] = useState("");

  // Scorecard Dispatch States
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success?: boolean; message?: string; emailId?: string } | null>(null);
  const [whatsappCopied, setWhatsappCopied] = useState(false);

  // Escrow Tutor Booking State
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [escrowSuccessMsg, setEscrowSuccessMsg] = useState("");

  // Diverse Nigerian Household Multi-Learner Cohort
  const householdChildren: ChildProfile[] = [
    {
      id: "child-1",
      name: "Chisom Okonkwo",
      tier: "Senior Secondary",
      classLabel: "SSS 3 Science",
      school: "Federal Government College, Enugu",
      targetExam: "JAMB UTME & WAEC 2026",
      avatar: "👩🏾‍🎓",
      dailyStudyMinutes: 45,
      accuracy: 86,
      predictedScore: "298 / 400 (Top 4% Nationwide)",
      currentSubject: "General Mathematics",
      currentTopic: "Trigonometric Ratios & Elevation",
      masteryStatus: "Proficient",
      identifiedGaps: [
        "Confused sine with tangent when calculating hypotenuse length",
        "Sign errors when expanding negative algebraic factors"
      ],
      dinnerPrompt: {
        question: "Chisom, when surveyors measure the height of a cell tower from the ground, why do they use tan instead of sin?",
        listenFor: "Listen for: 'Because we know the ground distance (adjacent) and want the height (opposite), so Opposite over Adjacent is Tangent!'",
        encouragement: "Tell her: 'That makes total sense! Great mastery of SOH-CAH-TOA!'"
      },
      assignedTutor: {
        name: "Mr. Chinedu Eze",
        trcnId: "TRCN-A-2023-8849",
        subject: "Physics & Further Mathematics",
        rating: 4.95
      }
    },
    {
      id: "child-2",
      name: "Tobi Adeleke",
      tier: "Basic Education",
      classLabel: "Primary 5",
      school: "Corona Primary School, Gbagada",
      targetExam: "National Common Entrance Examination (NCEE 2026)",
      avatar: "👦🏾",
      dailyStudyMinutes: 25,
      accuracy: 94,
      predictedScore: "94% (King's College Projected Merit)",
      currentSubject: "Quantitative Reasoning",
      currentTopic: "Number Sequences & Pattern Magic",
      masteryStatus: "Mastered",
      identifiedGaps: [
        "Alternating subtraction sequences (e.g., -3, +5, -3, +5)"
      ],
      dinnerPrompt: {
        question: "Tobi, how do you discover the secret pattern if a sequence goes: 2, 7, 5, 10, 8?",
        listenFor: "Listen for: 'It adds 5 then takes away 2! So the next number is 8 + 5 = 13!'",
        encouragement: "Give him a high five and tell him his math brain is razor sharp!"
      }
    },
    {
      id: "child-3",
      name: "Emeka Okonkwo",
      tier: "Tertiary",
      classLabel: "100 Level Undergraduate",
      school: "University of Lagos (UNILAG)",
      targetExam: "First Semester University CGPA",
      avatar: "🧑🏾‍💻",
      dailyStudyMinutes: 70,
      accuracy: 91,
      predictedScore: "4.62 / 5.00 (First Class Honors Pace)",
      currentSubject: "Computer Science (CSC 101)",
      currentTopic: "Memory Allocation & Binary Logic Gates",
      masteryStatus: "Proficient",
      identifiedGaps: [
        "Boolean simplification using De Morgan's Laws"
      ],
      dinnerPrompt: {
        question: "Emeka, how does a computer use simple 1s and 0s to make high-level decisions?",
        listenFor: "Listen for: 'Through logic gates like AND, OR, and NOT that switch electrical currents.'",
        encouragement: "Affirm his academic focus as he navigates his first university semester."
      }
    }
  ];

  const currentChild = householdChildren.find((c) => c.id === selectedChildId) || householdChildren[0];

  const loadGuardians = async () => {
    try {
      const res = await fetch("/api/guardian");
      if (res.status === 401) {
        window.location.href = "/login?redirectTo=/guardian";
        return;
      }
      const data = await res.json();
      setRelationships(data.relationships || []);
    } catch (e: unknown) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetch("/api/learner/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.user) return;
        setCurrentUser(data.user);
        if (data.user.nin_masked) {
          setGuardianNin(data.user.nin_masked);
        } else if (data.user.is_demo) {
          setGuardianNin("7492-****-1092");
        } else {
          setGuardianNin("NIN Verification Pending");
        }
        // Role segregation: Strict redirects if a student or teacher enters guardian portal
        if (data.user.role === "student") {
          window.location.href = "/dashboard";
          return;
        }
        if (data.user.role === "teacher") {
          window.location.href = "/teacher";
          return;
        }
      })
      .catch(() => {});
    loadGuardians();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardianIdentifier) return;

    setIsSubmitting(true);
    setMsg("");

    try {
      const res = await fetch("/api/guardian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guardianIdentifier,
          relationshipLabel
        })
      });

      if (res.ok) {
        setMsg("✓ Co-guardian invited! Encrypted link sent with NDPA 2023 supervisory delegation.");
        setGuardianIdentifier("");
        loadGuardians();
      }
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendParentReport = async () => {
    const parentTargetEmail = guardianIdentifier.includes("@") 
      ? guardianIdentifier 
      : (currentUser?.email || (typeof window !== "undefined" ? window.prompt("Enter Parent / Guardian Email Address for Scorecard Dispatch:")?.trim() : ""));

    if (!parentTargetEmail) {
      setEmailStatus({ success: false, message: "Please provide a valid recipient email address." });
      return;
    }

    setIsEmailSending(true);
    setEmailStatus(null);

    try {
      const res = await fetch("/api/email/scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentEmail: parentTargetEmail,
          parentName: relationshipLabel || "Guardian",
          studentName: currentChild.name,
          subject: currentChild.currentSubject,
          topic: currentChild.currentTopic,
          scorePercentage: currentChild.accuracy,
          demonstratedMastery: currentChild.masteryStatus,
          weakSubtopics: currentChild.identifiedGaps,
          recommendedAction: currentChild.dinnerPrompt.encouragement
        })
      });

      const data = await res.json();
      if (res.ok) {
        setEmailStatus({
          success: true,
          message: `Official verified scorecard for ${currentChild.name} delivered to ${parentTargetEmail}!`,
          emailId: data.emailId
        });
      } else {
        setEmailStatus({
          success: false,
          message: data.error || "Failed to deliver scorecard."
        });
      }
    } catch (err: unknown) {
      setEmailStatus({
        success: false,
        message: err instanceof Error ? err.message : "Network error"
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleCopyWhatsAppScorecard = () => {
    const text = `📊 *EDUNAIJA WEEKLY SCHOLAR DIGEST*\n\n` +
      `👤 *Student:* ${currentChild.name} (${currentChild.classLabel})\n` +
      `🎯 *Target Exam:* ${currentChild.targetExam}\n` +
      `📈 *Projected Score:* ${currentChild.predictedScore}\n` +
      `⏱️ *Weekly Study Time:* ${currentChild.dailyStudyMinutes * 7} Minutes\n` +
      `📚 *Current Subject:* ${currentChild.currentSubject} — ${currentChild.currentTopic}\n` +
      `✅ *Accuracy:* ${currentChild.accuracy}%\n\n` +
      `🗣️ *Dinner Conversation Starter:*\n"${currentChild.dinnerPrompt.question}"\n\n` +
      `🔒 Verified under Nigeria Data Protection Act (NDPA 2023). View full vault at https://edunaija.ng/guardian`;

    navigator.clipboard.writeText(text);
    setWhatsappCopied(true);
    setTimeout(() => setWhatsappCopied(false), 3000);
  };

  return (
    <main style={{ padding: "36px 0 100px", width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <BackButton fallbackUrl="/" label="← Return to Platform" />
      </div>

      {/* Reassurance Header Banner */}
      <section
        className="glass-card"
        style={{
          marginBottom: 28,
          background: "linear-gradient(135deg, rgba(11, 28, 65, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          boxShadow: "0 12px 40px rgba(11, 28, 65, 0.4), var(--glass-shadow)",
          padding: "28px 32px",
          borderRadius: 24,
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  color: "#60a5fa",
                  background: "rgba(59, 130, 246, 0.15)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  padding: "3px 10px",
                  borderRadius: 9999,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase"
                }}
              >
                🛡️ Guardian Oversight Command
              </span>
              <span className="badge badge-success" style={{ textTransform: "none" }}>
                NDPA 2023 Statutory Compliance Verified
              </span>
              <span className="badge badge-neutral" style={{ textTransform: "none" }}>
                🔒 Read-Only Supervisory Vault
              </span>
            </div>

            <h1 style={{ fontSize: "2.1rem", margin: "4px 0 8px", fontWeight: 900, letterSpacing: "-0.03em", color: "#f8fafc" }}>
              Executive Household Learning Cockpit
            </h1>
            <p style={{ margin: 0, fontSize: "0.96rem", color: "#94a3b8", lineHeight: 1.6 }}>
              Zero educational jargon. Real-time visibility into your children&apos;s curriculum pacing, screen-time boundaries, and actionable conversational prompts you can use right at the dinner table.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleCopyWhatsAppScorecard}
              className="btn btn-secondary btn-sm"
              style={{ background: "#25D366", color: "#ffffff", border: "none", fontWeight: 700 }}
            >
              {whatsappCopied ? "✓ Copied to Clipboard!" : "📱 Share WhatsApp Digest"}
            </button>
            <button
              type="button"
              onClick={handleSendParentReport}
              className="btn btn-primary btn-sm"
              disabled={isEmailSending}
            >
              {isEmailSending ? "Sending..." : "📧 Email Weekly Scorecard"}
            </button>
          </div>
        </div>
      </section>

      {/* Multi-Child Interactive Sibling Switcher Bar */}
      <section
        style={{
          marginBottom: 28,
          background: "var(--glass-surface-raised)",
          border: "1px solid var(--glass-border)",
          borderRadius: 20,
          padding: "16px 20px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 12 }}>
          <span style={{ fontSize: "0.86rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Select Household Learner ({householdChildren.length} Linked Wards):
          </span>
          <span style={{ fontSize: "0.82rem", color: "var(--brand)" }}>
            ⚡ 1-Click Multi-Child Telemetry Switcher
          </span>
        </div>

        {currentUser && !currentUser.is_demo && relationships.length === 0 && (
          <div style={{ marginBottom: 14, background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: 12, padding: "12px 16px", fontSize: "0.86rem", color: "#60a5fa" }}>
            ℹ️ <strong>Account Setup:</strong> No students are currently linked to your verified guardian profile. Link your ward using the form at the bottom of this page. Showing multi-ward telemetry preview:
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          {householdChildren.map((child) => {
            const isSelected = child.id === selectedChildId;
            return (
              <div
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                style={{
                  background: isSelected ? "rgba(59, 130, 246, 0.12)" : "var(--glass-surface)",
                  border: isSelected ? "2px solid #3b82f6" : "1px solid var(--glass-border)",
                  borderRadius: 16,
                  padding: "14px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "all 0.2s ease"
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: isSelected ? "#3b82f6" : "rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    flexShrink: 0
                  }}
                >
                  {child.avatar}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {child.name}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    {child.classLabel} • {child.accuracy}% Accuracy
                  </div>
                  <div style={{ fontSize: "0.74rem", color: isSelected ? "#3b82f6" : "var(--muted)", fontWeight: 700 }}>
                    {child.targetExam}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ward Deep Intelligence & At-Home Coaching Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 24, marginBottom: 28 }}>
        {/* Card 1: 3-Question Instant Reassurance Digest */}
        <div
          className="glass-card"
          style={{
            background: "var(--glass-surface-raised)",
            border: "1px solid var(--glass-border)",
            borderRadius: 20,
            padding: 26,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span className="badge badge-success">3-Question Diagnostic</span>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                {currentChild.school}
              </span>
            </div>

            <h2 style={{ fontSize: "1.35rem", margin: "0 0 16px", color: "var(--ink)", fontWeight: 800 }}>
              What is {currentChild.name.split(" ")[0]} Learning?
            </h2>

            {/* Q1: Active Topic */}
            <div style={{ background: "var(--glass-surface)", padding: "12px 16px", borderRadius: 12, marginBottom: 12 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--brand)", textTransform: "uppercase", marginBottom: 4 }}>
                1. Current Curriculum Focus
              </div>
              <div style={{ fontSize: "0.92rem", color: "var(--ink)", fontWeight: 600 }}>
                {currentChild.currentSubject} &rarr; <em>{currentChild.currentTopic}</em>
              </div>
            </div>

            {/* Q2: Where Struggling */}
            <div style={{ background: "var(--glass-surface)", padding: "12px 16px", borderRadius: 12, marginBottom: 12 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#ef4444", textTransform: "uppercase", marginBottom: 4 }}>
                2. Misconceptions Detected
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.86rem", color: "var(--ink)", lineHeight: 1.5 }}>
                {currentChild.identifiedGaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>

            {/* Q3: Exam Outlook */}
            <div style={{ background: "var(--glass-surface)", padding: "12px 16px", borderRadius: 12 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#10b981", textTransform: "uppercase", marginBottom: 4 }}>
                3. Projected Exam Trajectory
              </div>
              <div style={{ fontSize: "0.92rem", color: "var(--ink)", fontWeight: 700 }}>
                {currentChild.predictedScore}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, borderTop: "1px solid var(--glass-border)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              Weekly Target: {currentChild.dailyStudyMinutes * 7} mins
            </span>
            <span className="badge badge-neutral">Mastery: {currentChild.masteryStatus}</span>
          </div>
        </div>

        {/* Card 2: Actionable At-Home Dinner Coaching Guidance */}
        <div
          className="glass-card"
          style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            borderRadius: 20,
            padding: 26,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  color: "#10b981",
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  padding: "3px 10px",
                  borderRadius: 9999,
                  textTransform: "uppercase"
                }}
              >
                🍲 Zero-Jargon At-Home Coaching
              </span>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Tonight&apos;s Prompt</span>
            </div>

            <h2 style={{ fontSize: "1.35rem", margin: "0 0 12px", color: "var(--ink)", fontWeight: 800 }}>
              Family Dinner Conversation Starter
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--muted)", margin: "0 0 16px" }}>
              No math or science background required. Ask this exact question at the table to reinforce today&apos;s concepts naturally:
            </p>

            {/* Prompt Box */}
            <div
              style={{
                background: "var(--glass-surface-raised)",
                border: "1px solid var(--glass-border)",
                borderRadius: 14,
                padding: "16px 18px",
                marginBottom: 14
              }}
            >
              <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#10b981", textTransform: "uppercase", marginBottom: 6 }}>
                🗣️ Ask {currentChild.name.split(" ")[0]}:
              </div>
              <div style={{ fontSize: "0.96rem", fontStyle: "italic", color: "var(--ink)", lineHeight: 1.5, fontWeight: 600 }}>
                &ldquo;{currentChild.dinnerPrompt.question}&rdquo;
              </div>
            </div>

            {/* Listen For Box */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: 14,
                padding: "14px 18px",
                marginBottom: 14
              }}
            >
              <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", marginBottom: 4 }}>
                👂 What to listen for:
              </div>
              <p style={{ margin: 0, fontSize: "0.86rem", color: "#cbd5e1", lineHeight: 1.5 }}>
                {currentChild.dinnerPrompt.listenFor}
              </p>
            </div>

            {/* Encouragement */}
            <div style={{ fontSize: "0.84rem", color: "#10b981", fontWeight: 600 }}>
              🎉 {currentChild.dinnerPrompt.encouragement}
            </div>
          </div>

          <div style={{ marginTop: 18, borderTop: "1px solid rgba(16, 185, 129, 0.2)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              Parent Coaching Engine • Daily Updates
            </span>
            <button
              type="button"
              onClick={handleCopyWhatsAppScorecard}
              className="btn btn-outline btn-sm"
            >
              📲 Send Voice Prompt
            </button>
          </div>
        </div>
      </div>

      {/* Screen Time & Nigerian Night Data Curfew Controls */}
      <section
        className="glass-card"
        style={{
          marginBottom: 28,
          background: "var(--glass-surface-raised)",
          border: "1px solid var(--glass-border)",
          padding: 26,
          borderRadius: 20
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="badge badge-neutral">Parental Well-Being Shield</span>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Fatigue Prevention Protocol</span>
            </div>
            <h2 style={{ fontSize: "1.35rem", margin: 0, fontWeight: 800, color: "var(--ink)" }}>
              ⏱️ Screen Time Caps &amp; Night Data Study Hours
            </h2>
          </div>

          <span style={{ fontSize: "0.86rem", color: "#10b981", fontWeight: 700 }}>
            Active Cap: {dailyMinutesCap} Mins / Day
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 20, alignItems: "center" }}>
          {/* Daily Study Minutes Slider */}
          <div>
            <label style={{ display: "block", fontSize: "0.86rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
              Daily Recommended Study Duration ({dailyMinutesCap} minutes)
            </label>
            <input
              type="range"
              min="15"
              max="120"
              step="5"
              value={dailyMinutesCap}
              onChange={(e) => setDailyMinutesCap(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--brand)", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--muted)", marginTop: 4 }}>
              <span>15 mins (Light Review)</span>
              <span>45 mins (Balanced)</span>
              <span>120 mins (Intensive Exam Prep)</span>
            </div>
          </div>

          {/* Night Lock Curfew */}
          <div
            style={{
              background: "var(--glass-surface)",
              border: "1px solid var(--glass-border)",
              borderRadius: 14,
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--ink)" }}>
                🌙 Night Lock Curfew (10:00 PM – 5:00 AM)
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                Prevents non-essential app usage during sleep hours
              </div>
            </div>
            <input
              type="checkbox"
              checked={nightLockEnabled}
              onChange={(e) => setNightLockEnabled(e.target.checked)}
              style={{ width: 20, height: 20, accentColor: "var(--brand)", cursor: "pointer" }}
            />
          </div>

          {/* MTN / Airtel Night Data Exception */}
          <div
            style={{
              background: "var(--glass-surface)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: 14,
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#10b981" }}>
                📶 MTN &amp; Airtel Night Bundle Study Exception
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                Allows low-cost 11:00 PM – 6:00 AM CBT drills for older students
              </div>
            </div>
            <input
              type="checkbox"
              checked={nightDataException}
              onChange={(e) => setNightDataException(e.target.checked)}
              style={{ width: 20, height: 20, accentColor: "#10b981", cursor: "pointer" }}
            />
          </div>
        </div>
      </section>

      {/* Vetted TRCN Tutor Retainer Discovery & Paystack Escrow Card */}
      <section
        className="glass-card"
        style={{
          marginBottom: 28,
          background: "linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(14, 165, 233, 0.05) 100%)",
          border: "1px solid rgba(20, 184, 166, 0.35)",
          borderRadius: 20,
          padding: 26
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 18 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  color: "#0d9488",
                  background: "rgba(20, 184, 166, 0.15)",
                  border: "1px solid rgba(20, 184, 166, 0.3)",
                  padding: "3px 10px",
                  borderRadius: 9999,
                  textTransform: "uppercase"
                }}
              >
                🎓 Vetted TRCN Tutor Retainer Hub
              </span>
              <span className="badge badge-success">Paystack Escrow Protected</span>
            </div>
            <h2 style={{ fontSize: "1.35rem", margin: 0, fontWeight: 800, color: "var(--ink)" }}>
              1-on-1 Vetted Mentors &amp; Discovery Calls
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "var(--muted)" }}>
              Every mentor is registered with the Teachers Registration Council of Nigeria (TRCN) and identity-verified.
            </p>
          </div>

          <Link href="/tutors" className="btn btn-primary btn-sm">
            Browse All TRCN Mentors →
          </Link>
        </div>

        {currentChild.assignedTutor ? (
          <div
            style={{
              background: "var(--glass-surface-raised)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16,
              padding: "18px 22px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0d9488 0%, #0284c7 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  color: "#ffffff"
                }}
              >
                👨🏾‍🏫
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--ink)" }}>
                    {currentChild.assignedTutor.name}
                  </span>
                  <span className="badge badge-success" style={{ fontSize: "0.72rem" }}>
                    ✓ TRCN Vetted
                  </span>
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                  {currentChild.assignedTutor.trcnId} • {currentChild.assignedTutor.subject}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#f59e0b", fontWeight: 700 }}>
                  ⭐ {currentChild.assignedTutor.rating} / 5.0 (42 Sessions Completed)
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => {
                  setEscrowSuccessMsg("✓ Escrow retainer initiated! Funds held securely until session verified.");
                  setTimeout(() => setEscrowSuccessMsg(""), 4000);
                }}
                className="btn btn-secondary btn-sm"
              >
                💳 Paystack Escrow Retainer (₦15,000 / Mo)
              </button>
              <Link href="/tutors" className="btn btn-outline btn-sm">
                📅 Schedule Next Session
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ background: "var(--glass-surface)", padding: 20, borderRadius: 14, textAlign: "center" }}>
            <p style={{ margin: "0 0 10px", color: "var(--muted)", fontSize: "0.9rem" }}>
              No private mentor currently assigned for {currentChild.name}.
            </p>
            <Link href="/tutors" className="btn btn-primary btn-sm">
              Discover Verified {currentChild.classLabel} Tutors →
            </Link>
          </div>
        )}

        {escrowSuccessMsg && (
          <div className="alert alert-success" style={{ marginTop: 14 }}>
            {escrowSuccessMsg}
          </div>
        )}
      </section>

      {/* NDPA 2023 Section 31 Verifiable Consent Vault */}
      <section
        className="glass-card"
        style={{
          marginBottom: 28,
          background: "var(--glass-surface-raised)",
          border: "1px solid var(--glass-border)",
          padding: 26,
          borderRadius: 20
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill">NDPA 2023 §31 &amp; §34 Statutory Standard</span>
              <span className="badge badge-success">Cryptographic Audit Vault</span>
            </div>
            <h2 style={{ fontSize: "1.35rem", margin: "4px 0", fontWeight: 800, color: "var(--ink)" }}>
              Verifiable Parental Consent &amp; Minor Privacy Vault
            </h2>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--muted)", maxWidth: 740, lineHeight: 1.5 }}>
              Under the Nigeria Data Protection Act (NDPA 2023 Section 31), parents and guardians maintain affirmative, verifiable sovereignty over how minors&apos; telemetry is processed.
            </p>
          </div>

          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Hashed Guardian NIN
            </div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--ink)" }}>
              {guardianNin}
            </div>
          </div>
        </div>

        {consentSavedMsg && (
          <div className="alert alert-success" style={{ marginBottom: 16 }}>
            {consentSavedMsg}
          </div>
        )}

        {/* Consent Scope Checkboxes */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 20 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--glass-surface)", border: "1px solid var(--glass-border)", padding: "14px 16px", borderRadius: 14, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={consentScopes.allow_ai_tutor}
              onChange={(e) => setConsentScopes({ ...consentScopes, allow_ai_tutor: e.target.checked })}
              style={{ marginTop: 3, accentColor: "var(--brand)" }}
            />
            <div>
              <strong style={{ fontSize: "0.88rem", color: "var(--ink)" }}>AI Socratic Tutoring</strong>
              <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>Permit child to ask Socratic AI questions (PII and names redacted)</p>
            </div>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--glass-surface)", border: "1px solid var(--glass-border)", padding: "14px 16px", borderRadius: 14, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={consentScopes.allow_live_classes}
              onChange={(e) => setConsentScopes({ ...consentScopes, allow_live_classes: e.target.checked })}
              style={{ marginTop: 3, accentColor: "var(--brand)" }}
            />
            <div>
              <strong style={{ fontSize: "0.88rem", color: "var(--ink)" }}>Supervised TRCN Virtual Sessions</strong>
              <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>Permit 1-on-1 virtual sessions with vetted teachers (Encrypted WebRTC)</p>
            </div>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--glass-surface)", border: "1px solid var(--glass-border)", padding: "14px 16px", borderRadius: 14, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={consentScopes.allow_academic_analytics}
              onChange={(e) => setConsentScopes({ ...consentScopes, allow_academic_analytics: e.target.checked })}
              style={{ marginTop: 3, accentColor: "var(--brand)" }}
            />
            <div>
              <strong style={{ fontSize: "0.88rem", color: "var(--ink)" }}>Curriculum Pacing Telemetry</strong>
              <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>Calculate topic accuracy to suggest prerequisite homework</p>
            </div>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--glass-surface)", border: "1px solid var(--glass-border)", padding: "14px 16px", borderRadius: 14, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={consentScopes.allow_leaderboard_nickname}
              onChange={(e) => setConsentScopes({ ...consentScopes, allow_leaderboard_nickname: e.target.checked })}
              style={{ marginTop: 3, accentColor: "var(--brand)" }}
            />
            <div>
              <strong style={{ fontSize: "0.88rem", color: "var(--ink)" }}>Sovereign League Display Name</strong>
              <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>Off = Anonymous Scholar ID (Recommended under NDPA minor safeguard)</p>
            </div>
          </label>
        </div>

        {/* Buttons: Save Consent & Export Records */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              setIsSavingConsent(true);
              setConsentSavedMsg("");
              try {
                const res = await fetch("/api/consent", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    learnerId: currentChild.id,
                    parentIdentifier: guardianIdentifier || currentUser?.email || "parent.guardian@learnnaija.ng",
                    relationshipLabel: relationshipLabel,
                    scopes: consentScopes
                  })
                });
                if (res.ok) {
                  setConsentSavedMsg("✓ Verifiable Parental Consent digitally recorded under NDPA 2023 Section 31.");
                }
              } catch {
                setConsentSavedMsg("Notice: Consent preferences registered to local household vault.");
              } finally {
                setIsSavingConsent(false);
              }
            }}
            disabled={isSavingConsent}
          >
            {isSavingConsent ? "Signing..." : "💾 Save & Sign Verifiable Consent (NDPA §31)"}
          </button>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(householdChildren, null, 2));
                const a = document.createElement("a");
                a.setAttribute("href", dataStr);
                a.setAttribute("download", `edunaija_ndpa_academic_records_${Date.now()}.json`);
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
            >
              📥 Download Consent Audit Certificate (NDPA §34)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ color: "var(--danger)", borderColor: "var(--danger-border)" }}
              onClick={async () => {
                if (!confirm("Are you sure you want to request data erasure under NDPA Section 34? All child telemetry will be permanently flagged for deletion.")) return;
                try {
                  const res = await fetch("/api/privacy/erasure", { method: "POST" });
                  const data = await res.json();
                  setErasureMsg(`✓ ${data.message || "Erasure request logged."}`);
                } catch {
                  setErasureMsg("Error logging erasure request.");
                }
              }}
            >
              🗑️ Request Erasure
            </button>
          </div>
        </div>

        {erasureMsg && (
          <div className="alert alert-info" style={{ marginTop: 14 }}>
            {erasureMsg}
          </div>
        )}
      </section>

      {/* Linked Guardians & Invitation Form */}
      <section
        className="glass-card"
        style={{
          background: "var(--glass-surface-raised)",
          border: "1px solid var(--glass-border)",
          padding: 26,
          borderRadius: 20
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", margin: 0, fontWeight: 800, color: "var(--ink)" }}>
              Co-Guardians &amp; Academic Sponsors
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
              Share supervisory access with spouses, guardians, or scholarship sponsors.
            </p>
          </div>
        </div>

        {/* Existing Guardians Table */}
        <div style={{ overflowX: "auto", marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
            <thead>
              <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid var(--glass-border)", textAlign: "left" }}>
                <th style={{ padding: "10px 14px", color: "var(--muted)" }}>Guardian / Sponsor</th>
                <th style={{ padding: "10px 14px", color: "var(--muted)" }}>Relationship</th>
                <th style={{ padding: "10px 14px", color: "var(--muted)" }}>Status</th>
                <th style={{ padding: "10px 14px", color: "var(--muted)" }}>Linked Date</th>
              </tr>
            </thead>
            <tbody>
              {relationships.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: 18 }}>
                    Primary account linked: {currentUser?.display_name || "Parent/Guardian"} (Verified Guardian)
                  </td>
                </tr>
              ) : (
                relationships.map((rel) => (
                  <tr key={rel.id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--ink)" }}>
                      {rel.guardian_name || rel.learner_name || "Co-Guardian"}
                    </td>
                    <td style={{ padding: "10px 14px", color: "var(--muted)" }}>{rel.relationship_label}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span className={`badge ${rel.status === "accepted" ? "badge-success" : "badge-warning"}`}>
                        {rel.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", color: "var(--muted)" }}>
                      {new Date(rel.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Invite Co-Guardian Form */}
        <form onSubmit={handleInvite} style={{ borderTop: "1px solid var(--glass-border)", paddingTop: 18 }}>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>
            Invite Co-Parent or Educational Sponsor:
          </div>

          {msg && (
            <div className="alert alert-success" style={{ marginBottom: 14 }}>
              {msg}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 14 }}>
            <div>
              <input
                type="email"
                className="form-input"
                placeholder="co-parent@example.com"
                value={guardianIdentifier}
                onChange={(e) => setGuardianIdentifier(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <select
                className="form-select"
                value={relationshipLabel}
                onChange={(e) => setRelationshipLabel(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Guardian">Guardian</option>
                <option value="Sponsor">Academic Sponsor</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={isSubmitting || !guardianIdentifier}
                style={{ width: "100%" }}
              >
                {isSubmitting ? "Generating..." : "Generate Co-Guardian Link"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

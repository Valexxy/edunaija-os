"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface TeacherBadgeInfo {
  fullName: string;
  trcnNumber: string;
  trcnCategory: string;
  stateOfPractice: string;
  qualification: string;
  specialization: string;
  ninVerified: boolean;
  rating: number;
  scheduledTopic: string;
}

interface LiveClassGateProps {
  roomName: string;
  onAuthorized: (data: { teacherBadge: TeacherBadgeInfo; sessionToken: string }) => void;
  children: React.ReactNode;
}

export function LiveClassGate({ roomName, onAuthorized, children }: LiveClassGateProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [requiresConsent, setRequiresConsent] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [teacherBadge, setTeacherBadge] = useState<TeacherBadgeInfo | null>(null);
  const [micCheck, setMicCheck] = useState(true);
  const [camCheck, setCamCheck] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verifySession = async (withConsent: boolean = false) => {
    try {
      setIsChecking(true);
      setError(null);

      const res = await fetch("/api/classroom/session-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          userAge: 16, // Default secondary scholar age
          guardianConsentAcknowledged: withConsent
        })
      });

      if (!res.ok) {
        throw new Error("Unable to verify TRCN live classroom authorization");
      }

      const data = await res.json();
      setTeacherBadge(data.teacherBadge);

      if (data.authorized && data.sessionToken) {
        setAuthorized(true);
        setRequiresConsent(false);
        onAuthorized({
          teacherBadge: data.teacherBadge,
          sessionToken: data.sessionToken
        });
      } else if (data.requiresGuardianConsent) {
        setRequiresConsent(true);
        setAuthorized(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Classroom gate check failed");
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    verifySession(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName]);

  const handleGrantConsent = () => {
    setConsentGiven(true);
    verifySession(true);
  };

  if (isChecking) {
    return (
      <div style={{ maxWidth: 640, margin: "60px auto", textAlign: "center", padding: "0 20px" }}>
        <div className="glass-card" style={{ padding: "40px 24px", borderRadius: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🛡️ 🇳🇬</div>
          <span className="badge badge-success" style={{ marginBottom: 12 }}>
            Verifying TRCN Teacher Accreditation
          </span>
          <h2 style={{ fontSize: "1.45rem", margin: "10px 0" }}>
            Conducting Encrypted Preflight Handshake...
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.5 }}>
            Checking TRCN teaching license, NDPA 2023 safeguarding status, and audio-first WebRTC routing for room: <strong>{roomName}</strong>.
          </p>
        </div>
      </div>
    );
  }

  if (requiresConsent && !authorized) {
    return (
      <div style={{ maxWidth: 640, margin: "40px auto", padding: "0 20px" }}>
        <div className="glass-card" style={{ padding: "36px 28px", borderRadius: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 32 }}>🏛️</span>
            <div>
              <span className="badge badge-primary">NDPA 2023 • CRA 2003 Compliance</span>
              <h2 style={{ fontSize: "1.4rem", margin: "4px 0 0", letterSpacing: "-0.02em" }}>
                Parent / Guardian Safeguarding Gate
              </h2>
            </div>
          </div>

          <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: 20 }}>
            Under Nigerian Data Protection Act (NDPA 2023) and Child Rights Act 2003, minors entering 1-on-1 encrypted live classrooms require parental or school guardian acknowledgment.
          </p>

          {teacherBadge && (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                padding: "16px 20px",
                borderRadius: 14,
                marginBottom: 20
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#10b981" }}>
                  ✅ TRCN VETTED INSTRUCTOR
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontFamily: "monospace" }}>
                  {teacherBadge.trcnNumber}
                </span>
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--ink)" }}>
                {teacherBadge.fullName}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 2 }}>
                {teacherBadge.qualification} • {teacherBadge.stateOfPractice} State
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--brand)", marginTop: 6, fontWeight: 600 }}>
                📖 Topic: {teacherBadge.scheduledTopic}
              </div>
            </div>
          )}

          {/* Preflight Mic & Cam toggle */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <button
              type="button"
              className={`btn btn-sm ${micCheck ? "btn-secondary" : "btn-outline"}`}
              onClick={() => setMicCheck(!micCheck)}
              style={{ flex: 1 }}
            >
              {micCheck ? "🎙️ Microphone Ready" : "🔇 Mic Muted"}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${camCheck ? "btn-secondary" : "btn-outline"}`}
              onClick={() => setCamCheck(!camCheck)}
              style={{ flex: 1 }}
            >
              {camCheck ? "📹 Camera Ready" : "📷 Camera Off"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleGrantConsent}
              className="btn btn-primary"
              style={{ flex: 2, padding: "12px 20px", fontWeight: 700, cursor: "pointer" }}
            >
              🛡️ Acknowledge Consent &amp; Enter Classroom
            </button>
            <Link
              href="/dashboard"
              className="btn btn-outline"
              style={{ flex: 1, padding: "12px 18px", textAlign: "center", textDecoration: "none" }}
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
        <div className="glass-card" style={{ padding: "36px 24px", borderRadius: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <span className="badge badge-warning" style={{ marginBottom: 12 }}>Access Gate Warning</span>
          <h2 style={{ fontSize: "1.4rem", margin: "8px 0" }}>Classroom Verification Issue</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.92rem", marginBottom: 20 }}>{error}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => verifySession(true)} className="btn btn-primary">
              Retry Handshake
            </button>
            <Link href="/dashboard" className="btn btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // When authorized, render the actual live classroom session
  return <>{children}</>;
}

"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    display_name: string;
    role: string;
    email?: string;
  } | null;
  learnerProfile?: {
    education_level?: string;
    academic_track?: string;
    state_name?: string;
    class_label?: string;
    exam_goal?: string;
    preferred_language?: string;
    streak_days?: number;
    total_xp?: number;
  } | null;
  onOpenPersonaSwitcher?: () => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  learnerProfile,
  onOpenPersonaSwitcher
}: UserProfileModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("learnnaija_session_user");
        localStorage.removeItem("edunaija_user_state");
        document.cookie = "learnnaija_demo_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }

      if (isSupabaseConfigured()) {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
      }

      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // Graceful local cleanup
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("edunaija:user_changed"));
    }

    onClose();
    router.push("/login");
    router.refresh();
  };

  const displayName = user?.display_name || "Scholar";
  const role = user?.role || "student";
  const roleLabel =
    role === "student"
      ? "Student / Scholar"
      : role === "parent"
      ? "Parent / Guardian"
      : role === "teacher"
      ? "TRCN Certified Teacher"
      : "Scholar";

  const classLabel = learnerProfile?.class_label || (role === "student" ? "SSS 3 Science" : "General");
  const stateName = learnerProfile?.state_name || "Delta State";
  const examGoal = learnerProfile?.exam_goal || (role === "student" ? "JAMB UTME 2026" : "National Standards");
  const streakDays = learnerProfile?.streak_days ?? 7;
  const totalXp = learnerProfile?.total_xp ?? 3420;
  const preferredLang = learnerProfile?.preferred_language === "pcm" ? "Naija Pidgin" : "Standard English";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--surface)",
          border: "2px solid var(--brand)",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          color: "var(--ink)",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.4rem" }}>🇳🇬</span>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "var(--brand)" }}>
                Verified Learner Profile &amp; ID
              </h2>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                Federal Republic of Nigeria Sovereign EdTech Identity
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "var(--surface-sunken)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1rem",
              color: "var(--ink)"
            }}
          >
            ✕
          </button>
        </div>

        {/* Identity Badge Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #064E3B 0%, #047857 100%)",
            color: "#ffffff",
            borderRadius: 18,
            padding: 20,
            marginBottom: 20,
            boxShadow: "0 10px 25px -5px rgba(6, 78, 59, 0.4)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              pointerEvents: "none"
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#ffffff",
                color: "#064E3B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                fontWeight: 900,
                flexShrink: 0,
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
              }}
            >
              {role === "parent" ? "👨‍👩‍👧" : role === "teacher" ? "🧑‍🏫" : "🎓"}
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>{displayName}</div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255, 255, 255, 0.2)",
                  padding: "2px 8px",
                  borderRadius: 9999,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  marginTop: 4
                }}
              >
                ● {roleLabel}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 16,
              paddingTop: 14,
              borderTop: "1px solid rgba(255, 255, 255, 0.2)",
              fontSize: "0.82rem"
            }}
          >
            <div>
              <span style={{ opacity: 0.75, display: "block", fontSize: "0.72rem" }}>Academic Class / Tier</span>
              <strong>{classLabel}</strong>
            </div>
            <div>
              <span style={{ opacity: 0.75, display: "block", fontSize: "0.72rem" }}>Target Examination</span>
              <strong>{examGoal}</strong>
            </div>
            <div>
              <span style={{ opacity: 0.75, display: "block", fontSize: "0.72rem" }}>State of Study</span>
              <strong>{stateName}</strong>
            </div>
            <div>
              <span style={{ opacity: 0.75, display: "block", fontSize: "0.72rem" }}>Language Preference</span>
              <strong>{preferredLang}</strong>
            </div>
          </div>
        </div>

        {/* Learning Statistics Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 20
          }}
        >
          <div
            style={{
              background: "var(--surface-sunken)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: 14,
              textAlign: "center"
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>🔥</span>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--brand)", marginTop: 2 }}>
              {streakDays} Days
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Current Study Streak</span>
          </div>

          <div
            style={{
              background: "var(--surface-sunken)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: 14,
              textAlign: "center"
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>⚡</span>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--accent-gold)", marginTop: 2 }}>
              {totalXp.toLocaleString()} XP
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Total Knowledge Points</span>
          </div>
        </div>

        {/* Direct Action Hub */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {onOpenPersonaSwitcher && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPersonaSwitcher();
              }}
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "center", gap: 8 }}
            >
              🎭 Switch Demo Persona (Primary, JSS, SSS, Parent, Teacher)
            </button>
          )}

          <Link
            href="/promotion"
            onClick={onClose}
            className="btn btn-outline"
            style={{ width: "100%", justifyContent: "center", gap: 8 }}
          >
            🎓 Change Academic Class / Promotion Benchmark
          </Link>

          <Link
            href="/onboarding"
            onClick={onClose}
            className="btn btn-outline"
            style={{ width: "100%", justifyContent: "center", gap: 8 }}
          >
            ⚙️ Edit Profile Details (State, Goals &amp; Language)
          </Link>
        </div>

        {/* Clear, Prominent Logout Button */}
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          <button
            type="button"
            onClick={handleLogout}
            className="btn"
            style={{
              width: "100%",
              background: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #f87171",
              fontWeight: 800,
              fontSize: "0.95rem",
              padding: "12px",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer"
            }}
          >
            🚪 Log Out / Sign Out of LearnNaija
          </button>
          <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: "0.75rem", color: "var(--muted)" }}>
            Clears your session cookies and returns to the login screen safely.
          </p>
        </div>
      </div>
    </div>
  );
}

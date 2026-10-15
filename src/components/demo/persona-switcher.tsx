"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export interface DemoPersona {
  id: string;
  name: string;
  role: "student" | "parent" | "teacher";
  badge: string;
  detail: string;
  icon: string;
  targetUrl: string;
}

export const DEMO_PERSONAS_LIST: DemoPersona[] = [
  {
    id: "demo-primary-001",
    name: "Amina Bello",
    role: "student",
    badge: "Primary 5 Pupil",
    detail: "Kano State • National Common Entrance (NCEE) Prep",
    icon: "🎒",
    targetUrl: "/dashboard"
  },
  {
    id: "demo-jss-002",
    name: "Emeka Okafor",
    role: "student",
    badge: "JSS 3 Student",
    detail: "Anambra State • BECE / Junior WAEC Standard",
    icon: "📘",
    targetUrl: "/dashboard"
  },
  {
    id: "demo-student-user-001",
    name: "Chidi Okonkwo",
    role: "student",
    badge: "SSS 3 Science Scholar",
    detail: "Delta State • JAMB UTME 2026 & WAEC STEM",
    icon: "🔬",
    targetUrl: "/dashboard"
  },
  {
    id: "demo-sss-arts-004",
    name: "Folake Adeleke",
    role: "student",
    badge: "SSS 2 Arts Scholar",
    detail: "Lagos State • Literature, Government & WAEC Arts",
    icon: "🎭",
    targetUrl: "/dashboard"
  },
  {
    id: "demo-sss-commercial-005",
    name: "Babajide Sanwo",
    role: "student",
    badge: "SSS 3 Commercial Scholar",
    detail: "Ogun State • Financial Accounting & Commerce",
    icon: "💼",
    targetUrl: "/dashboard"
  },
  {
    id: "demo-parent-006",
    name: "Dr. Alabi Taiwo",
    role: "parent",
    badge: "Parent / Guardian",
    detail: "Delta State • Managing 2 Minor Wards & Consent",
    icon: "👨‍👩‍👧",
    targetUrl: "/guardian"
  },
  {
    id: "demo-teacher-007",
    name: "Mr. Chinedu Eze (TRCN)",
    role: "teacher",
    badge: "TRCN Certified Educator",
    detail: "Enugu State • Senior Mathematics & Physics Tutor",
    icon: "🧑‍🏫",
    targetUrl: "/teacher"
  }
];

export function PersonaSwitcherButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeId, setActiveId] = useState<string>("demo-student-user-001");

  const handleSwitch = async (persona: DemoPersona) => {
    setIsLoading(true);
    setActiveId(persona.id);
    try {
      sessionStorage.removeItem("learnnaija_session_user");
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: persona.id })
      });
      const data = await res.json();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("edunaija:user_changed", { detail: { persona } }));
      }
      if (res.ok && data.success) {
        setIsOpen(false);
        router.push(data.redirectUrl || persona.targetUrl);
        router.refresh();
      }
    } catch {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("edunaija:user_changed", { detail: { persona } }));
      }
      router.push(persona.targetUrl);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="glass-pill"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          padding: "4px 12px",
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "var(--brand)",
          background: "var(--glass-surface-raised)",
          border: "1px solid var(--glass-border)",
          borderRadius: 9999,
          boxShadow: "var(--glass-highlight)"
        }}
        title="1-Click Persona Switcher: Test Primary, JSS, SSS Science, Arts, Commercial, Parent & Teacher"
      >
        <span>🎭</span>
        <span>Demo Personas</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            padding: 16
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 580,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              borderRadius: 22,
              background: "var(--glass-surface-raised)",
              border: "1px solid var(--glass-border)",
              boxShadow: "0 20px 48px rgba(0, 0, 0, 0.4)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: "var(--ink)", fontSize: "1.25rem", fontWeight: 900 }}>
                  🎭 One-Click Persona Switcher
                </h3>
                <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                  Instantly test isolated journeys across all 7 academic &amp; stakeholder tiers
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "var(--muted)"
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {DEMO_PERSONAS_LIST.map((p) => {
                const isSelected = activeId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSwitch(p)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 16px",
                      borderRadius: 14,
                      textAlign: "left",
                      cursor: "pointer",
                      background: isSelected ? "var(--brand-surface, rgba(4, 120, 87, 0.12))" : "var(--glass-surface)",
                      border: `1.5px solid ${isSelected ? "var(--brand)" : "var(--glass-border)"}`,
                      transition: "all 0.15s ease",
                      width: "100%"
                    }}
                  >
                    <span style={{ fontSize: "1.8rem" }}>{p.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 2 }}>
                        <strong style={{ color: "var(--ink)", fontSize: "0.95rem" }}>{p.name}</strong>
                        <span className="badge badge-success" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
                          {p.badge}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                        {p.detail}
                      </span>
                    </div>
                    <span style={{ color: "var(--brand)", fontWeight: 700, fontSize: "0.85rem" }}>
                      Switch →
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 18, textAlign: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                🔒 Switching persona immediately recalibrates active session, curriculum topics, and role-based permissions.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PersonaSwitcherButton;

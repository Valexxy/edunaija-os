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

/**
 * Clean Homepage 1-Click Evaluation Bar
 * Allows immediate evaluation of Teacher, Parent, and Student without navigation friction.
 */
export function QuickDemoEvaluationBar() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingPersonaId, setLoadingPersonaId] = useState<string | null>(null);

  const switchPersona = async (personaId: string, targetUrl: string) => {
    setLoadingPersonaId(personaId);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("learnnaija_session_user");
      }
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId })
      });
      const data = await res.json();
      router.push(data.redirectUrl || targetUrl);
      router.refresh();
    } catch {
      router.push(targetUrl);
    } finally {
      setLoadingPersonaId(null);
    }
  };

  return (
    <>
      <div
        className="glass-card"
        style={{
          maxWidth: 820,
          margin: "0 auto 36px",
          padding: "12px 18px",
          borderRadius: 18,
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(2, 132, 199, 0.05) 100%)",
          border: "1.5px solid rgba(16, 185, 129, 0.35)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.35rem" }}>🧪</span>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
              <span>Instant Persona Evaluation Sandboxes</span>
              <span className="badge badge-success" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>1-CLICK</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
              Experience the platform as a Teacher, Parent, or Scholar with preloaded data
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {/* Prominent Teacher Demo Button */}
          <button
            type="button"
            disabled={Boolean(loadingPersonaId)}
            onClick={() => switchPersona("demo-teacher-007", "/teacher")}
            className="btn btn-primary btn-sm"
            style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              borderColor: "#059669",
              padding: "6px 14px",
              fontWeight: 800,
              fontSize: "0.82rem",
              boxShadow: "0 2px 8px rgba(5, 150, 105, 0.3)",
              touchAction: "manipulation"
            }}
          >
            {loadingPersonaId === "demo-teacher-007" ? "Loading..." : "🧑‍🏫 Teacher Cockpit Demo"}
          </button>

          {/* Parent Demo Button */}
          <button
            type="button"
            disabled={Boolean(loadingPersonaId)}
            onClick={() => switchPersona("demo-parent-006", "/guardian")}
            className="btn btn-secondary btn-sm"
            style={{
              fontSize: "0.82rem",
              padding: "6px 12px",
              fontWeight: 700,
              touchAction: "manipulation"
            }}
          >
            {loadingPersonaId === "demo-parent-006" ? "Loading..." : "👨‍👩‍👧 Parent Portal"}
          </button>

          {/* Student Demo Button */}
          <button
            type="button"
            disabled={Boolean(loadingPersonaId)}
            onClick={() => switchPersona("demo-student-user-001", "/dashboard")}
            className="btn btn-secondary btn-sm"
            style={{
              fontSize: "0.82rem",
              padding: "6px 12px",
              fontWeight: 700,
              touchAction: "manipulation"
            }}
          >
            {loadingPersonaId === "demo-student-user-001" ? "Loading..." : "🎓 SSS 3 Scholar"}
          </button>

          {/* All Personas Trigger */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              background: "transparent",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--muted)",
              cursor: "pointer",
              touchAction: "manipulation"
            }}
          >
            All 7 Tiers ▾
          </button>
        </div>
      </div>

      {isModalOpen && (
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
          onClick={() => setIsModalOpen(false)}
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
                  Select an academic or stakeholder role to evaluate immediately
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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
              {DEMO_PERSONAS_LIST.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={Boolean(loadingPersonaId)}
                  onClick={() => {
                    setIsModalOpen(false);
                    switchPersona(p.id, p.targetUrl);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 16px",
                    borderRadius: 14,
                    textAlign: "left",
                    cursor: "pointer",
                    background: p.role === "teacher" ? "rgba(16, 185, 129, 0.12)" : "var(--glass-surface)",
                    border: `1.5px solid ${p.role === "teacher" ? "var(--brand)" : "var(--glass-border)"}`,
                    transition: "all 0.15s ease",
                    width: "100%",
                    touchAction: "manipulation"
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
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Mobile Drawer Persona Switcher
 * Embedded inside the mobile navigation drawer so users on phones can switch roles anytime.
 */
export function MobileDrawerPersonaSwitcher({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const switchPersona = async (personaId: string, targetUrl: string) => {
    setLoadingId(personaId);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("learnnaija_session_user");
      }
      const res = await fetch("/api/auth/demo-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId })
      });
      const data = await res.json();
      if (onClose) onClose();
      router.push(data.redirectUrl || targetUrl);
      router.refresh();
    } catch {
      if (onClose) onClose();
      router.push(targetUrl);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--brand)", textTransform: "uppercase" }}>
          🧪 1-Click Demo Personas
        </span>
        <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>Instant Role Switch</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {/* Prominent Teacher Switcher */}
        <button
          type="button"
          disabled={Boolean(loadingId)}
          onClick={() => switchPersona("demo-teacher-007", "/teacher")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            borderRadius: 10,
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            cursor: "pointer",
            textAlign: "left",
            touchAction: "manipulation"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.2rem" }}>🧑‍🏫</span>
            <div>
              <div style={{ fontSize: "0.84rem", fontWeight: 800, color: "var(--ink)" }}>Mr. Chinedu Eze</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>TRCN Teacher • Pedagogy Cockpit</div>
            </div>
          </div>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--brand)" }}>
            {loadingId === "demo-teacher-007" ? "..." : "Enter →"}
          </span>
        </button>

        {/* Parent Switcher */}
        <button
          type="button"
          disabled={Boolean(loadingId)}
          onClick={() => switchPersona("demo-parent-006", "/guardian")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            borderRadius: 10,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            cursor: "pointer",
            textAlign: "left",
            touchAction: "manipulation"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.2rem" }}>👨‍👩‍👧</span>
            <div>
              <div style={{ fontSize: "0.84rem", fontWeight: 800, color: "var(--ink)" }}>Dr. Alabi Taiwo</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>Parent Portal • 2 Wards</div>
            </div>
          </div>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--muted)" }}>
            {loadingId === "demo-parent-006" ? "..." : "Enter →"}
          </span>
        </button>

        {/* Scholar Switcher */}
        <button
          type="button"
          disabled={Boolean(loadingId)}
          onClick={() => switchPersona("demo-student-user-001", "/dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            borderRadius: 10,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            cursor: "pointer",
            textAlign: "left",
            touchAction: "manipulation"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.2rem" }}>🔬</span>
            <div>
              <div style={{ fontSize: "0.84rem", fontWeight: 800, color: "var(--ink)" }}>Chidi Okonkwo</div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>SSS 3 Science Scholar • UTME/WAEC</div>
            </div>
          </div>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--muted)" }}>
            {loadingId === "demo-student-user-001" ? "..." : "Enter →"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default PersonaSwitcherButton;

"use client";
import { BackButton } from "@/components/navigation/back-button";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  useEffect(() => {
    // If the learner already has an active session or cookies, detect it
    if (typeof window !== "undefined") {
      const hasSbCookie = document.cookie.includes("sb-");
      const hasDemoUser = document.cookie.includes("learnnaija_demo_user_id");
      if (hasSbCookie || hasDemoUser) {
        setAlreadyLoggedIn(true);
      }
    }
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (isSupabaseConfigured()) {
      try {
        const supabase = createSupabaseBrowserClient();

        // 6-second timeout to avoid indefinite hanging on slow/blocked mobile networks
        const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: "NETWORK_TIMEOUT" } }), 6000)
        );

        const { data: authData, error } = await Promise.race([
          supabase.auth.signInWithPassword({ email, password }),
          timeoutPromise
        ]);

        if (error) {
          if (error.message === "NETWORK_TIMEOUT" || error.message.toLowerCase().includes("fetch")) {
            setErrorMessage(
              "⚠️ Network Connection Timeout: Could not connect to the cloud authentication service. Your current Wi-Fi or mobile network cannot reach Supabase. You can continue using our 1-Click test accounts below or check your network."
            );
          } else {
            setErrorMessage(error.message);
          }
          setIsLoading(false);
          return;
        }

        if (authData?.user) {
          // Clear any demo cookie so real registered account takes immediate precedence
          if (typeof document !== "undefined") {
            document.cookie = "learnnaija_demo_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            sessionStorage.removeItem("learnnaija_session_user");
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("role, onboarding_complete")
            .eq("id", authData.user.id)
            .single();

          const userRole = profile?.role || authData.user.user_metadata?.role || "student";
          if (userRole === "parent") {
            router.push("/guardian");
            router.refresh();
            return;
          }
          if (userRole === "teacher") {
            router.push("/teacher");
            router.refresh();
            return;
          }
          if (profile && !profile.onboarding_complete) {
            router.push("/onboarding");
            router.refresh();
            return;
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to authenticate";
        if (msg.toLowerCase().includes("fetch")) {
          setErrorMessage(
            "⚠️ Network Connection Timeout: Could not reach the database. Your internet provider is experiencing connection latency to Supabase. You can test in Offline Mode with our 1-Click test accounts below."
          );
        } else {
          setErrorMessage(msg);
        }
        setIsLoading(false);
        return;
      }
    }

    // Redirect to scholar dashboard
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main style={{ maxWidth: 440, padding: "50px 0" }}>
      <div style={{ marginBottom: 16 }}>
        <BackButton fallbackUrl="/" label="← Back to Home" />
      </div>
      <div className="card" style={{ padding: 32 }}>
        <span className="pill" style={{ marginBottom: 12 }}>Learner & Guardian Portal</span>
        <h2>Sign in to LearnNaija</h2>
        <p>Access your curriculum track, CBT tests, and AI Tutor.</p>

        {alreadyLoggedIn && (
          <div className="alert alert-info" style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <span>✅ <strong>Active Session Detected:</strong> You are already signed in!</span>
            <button
              type="button"
              onClick={() => {
                router.push("/dashboard");
                router.refresh();
              }}
              className="btn btn-primary btn-sm"
              style={{ alignSelf: "flex-start", padding: "6px 14px", fontSize: "0.85rem", fontWeight: 700 }}
            >
              Continue to Dashboard →
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="alert alert-error">
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePasswordLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="e.g. scholar@edunaija.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 8 }}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ margin: "24px 0", textAlign: "center", position: "relative" }}>
          <hr style={{ border: "none", borderTop: "1px solid var(--line)" }} />
          <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "var(--surface)", padding: "0 10px", fontSize: "0.8rem", color: "var(--muted)" }}>
            OR
          </span>
        </div>

        <div style={{ margin: "24px 0 16px", textAlign: "center", position: "relative" }}>
          <hr style={{ border: "none", borderTop: "1px solid var(--line)" }} />
          <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "var(--surface)", padding: "0 10px", fontSize: "0.78rem", color: "var(--brand)", fontWeight: 800, textTransform: "uppercase" }}>
            🧪 1-CLICK INSTANT DEMO ACCOUNTS
          </span>
        </div>

        <p style={{ fontSize: "0.82rem", color: "var(--muted)", textAlign: "center", margin: "0 0 14px" }}>
          Select an educator, guardian, or scholar journey to test immediately with real simulated cohort data:
        </p>

        {/* 🌟 FEATURED: TRCN Certified Teacher Demo */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(2, 132, 199, 0.08) 100%)",
            border: "1.5px solid rgba(16, 185, 129, 0.4)",
            borderRadius: 16,
            padding: "16px",
            marginBottom: 14,
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.15)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.8rem" }}>🧑‍🏫</span>
              <div>
                <strong style={{ fontSize: "0.95rem", color: "var(--ink)" }}>Mr. Chinedu Eze, M.Ed</strong>
                <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>
                  TRCN Licensed Educator • Federal Government College Enugu
                </div>
              </div>
            </div>
            <span className="badge badge-success" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
              TEACHER DEMO
            </span>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: "0 0 12px", lineHeight: 1.4 }}>
            Test teaching 42 students, detecting learning misconceptions on the Diagnostic Radar, dispatching WAEC/JAMB drills, and launching the proctored virtual classroom.
          </p>
          <button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              try {
                if (typeof window !== "undefined") {
                  sessionStorage.removeItem("learnnaija_session_user");
                }
                await fetch("/api/auth/demo-switch", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ personaId: "demo-teacher-007" })
                });
                router.push("/teacher");
                router.refresh();
              } catch {
                router.push("/teacher");
              } finally {
                setIsLoading(false);
              }
            }}
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              borderColor: "#059669",
              fontWeight: 800,
              fontSize: "0.88rem",
              padding: "10px",
              boxShadow: "0 4px 12px rgba(5, 150, 105, 0.35)",
              touchAction: "manipulation"
            }}
          >
            🚀 Launch Teacher Cockpit Demo
          </button>
        </div>

        {/* 👨‍👩‍👧 Parent / Guardian Demo */}
        <div style={{ marginBottom: 14 }}>
          <button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              setIsLoading(true);
              try {
                if (typeof window !== "undefined") {
                  sessionStorage.removeItem("learnnaija_session_user");
                }
                await fetch("/api/auth/demo-switch", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ personaId: "demo-parent-006" })
                });
                router.push("/guardian");
                router.refresh();
              } catch {
                router.push("/guardian");
              } finally {
                setIsLoading(false);
              }
            }}
            className="btn btn-secondary btn-sm"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              padding: "10px 14px",
              textAlign: "left",
              borderRadius: 12,
              touchAction: "manipulation"
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.2rem" }}>👨‍👩‍👧</span>
              <div>
                <strong style={{ fontSize: "0.88rem", color: "var(--ink)" }}>Dr. Alabi Taiwo</strong>
                <span style={{ fontSize: "0.74rem", color: "var(--muted)", display: "block" }}>
                  Parent Portal • Audit 2 Minor Wards
                </span>
              </div>
            </span>
            <span className="badge badge-neutral" style={{ fontSize: "0.7rem" }}>
              Parent Demo →
            </span>
          </button>
        </div>

        <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8, paddingLeft: 4 }}>
          Nigerian Scholar Demos (By Academic Tier):
        </div>

        <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
          {[
            { id: "demo-student-user-001", name: "Chidi Okonkwo", icon: "🔬", badge: "SSS 3 Science", target: "/dashboard" },
            { id: "demo-sss-arts-004", name: "Folake Adeleke", icon: "🎭", badge: "SSS 2 Arts", target: "/dashboard" },
            { id: "demo-sss-commercial-005", name: "Babajide Sanwo", icon: "💼", badge: "SSS 3 Commercial", target: "/dashboard" },
            { id: "demo-jss-002", name: "Emeka Okafor", icon: "📘", badge: "JSS 3 Student", target: "/dashboard" },
            { id: "demo-primary-001", name: "Amina Bello", icon: "🎒", badge: "Primary 5 Pupil", target: "/dashboard" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={async () => {
                setIsLoading(true);
                try {
                  if (typeof window !== "undefined") {
                    sessionStorage.removeItem("learnnaija_session_user");
                  }
                  await fetch("/api/auth/demo-switch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ personaId: p.id })
                  });
                  router.push(p.target);
                  router.refresh();
                } catch {
                  router.push(p.target);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="btn btn-secondary btn-sm"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "8px 12px", textAlign: "left", touchAction: "manipulation" }}
              disabled={isLoading}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{p.icon}</span>
                <strong>{p.name}</strong>
              </span>
              <span className="badge badge-success" style={{ fontSize: "0.72rem" }}>{p.badge}</span>
            </button>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: "0.9rem", marginTop: 20, marginBottom: 0 }}>
          Don&apos;t have an account? <Link href="/signup" style={{ color: "var(--brand)", fontWeight: 700 }}>Register as Student</Link>
        </p>
      </div>
    </main>
  );
}

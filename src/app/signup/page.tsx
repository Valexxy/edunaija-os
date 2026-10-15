"use client";
import { BackButton } from "@/components/navigation/back-button";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "parent" | "teacher">("student");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccessAwaitingConfirmation, setIsSuccessAwaitingConfirmation] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    if (isSupabaseConfigured()) {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
              role
            }
          }
        });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        // If email confirmation is enabled, Supabase returns a user but session is null
        if (data?.user && !data?.session) {
          setIsSuccessAwaitingConfirmation(true);
          setIsLoading(false);
          return;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create account.";
        setErrorMessage(msg);
        setIsLoading(false);
        return;
      }
    }

    // Direct user to their respective portal based on chosen role
    if (role === "parent") {
      router.push("/guardian");
    } else if (role === "teacher") {
      router.push("/teacher");
    } else {
      router.push("/onboarding");
    }
  };

  if (isSuccessAwaitingConfirmation) {
    return (
      <main style={{ maxWidth: 460, padding: "40px 0" }}>
        <div style={{ marginBottom: 16 }}>
          <BackButton fallbackUrl="/" label="← Back to Home" />
        </div>
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>📩</div>
          <span className="badge badge-success" style={{ marginBottom: 16 }}>Verification Email Sent</span>
          <h2>Check Your Inbox</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>
            We&apos;ve sent an account confirmation email to <strong>{email}</strong>.
            Please open the email and click the confirmation link to activate your scholar profile before signing in.
          </p>
          <div className="alert alert-info" style={{ textAlign: "left", fontSize: "0.85rem", marginBottom: 24 }}>
            💡 <strong>Didn&apos;t receive it?</strong> Check your Spam or Promotions folder. Once confirmed, you can sign in directly.
          </div>
          <Link href="/login" className="btn btn-primary" style={{ width: "100%" }}>
            Go to Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 440, padding: "40px 0" }}>
      <div style={{ marginBottom: 16 }}>
        <BackButton fallbackUrl="/" label="← Back to Home" />
      </div>
      <div className="card" style={{ padding: 32 }}>
        <span className="pill" style={{ marginBottom: 12 }}>New Scholar Registration</span>
        <h2>Join LearnNaija</h2>
        <p>Start learning with Nigeria-first curriculum standards and AI Tutoring.</p>

        {errorMessage && (
          <div className="alert alert-error">
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: 8, display: "block" }}>
              Select Account Type
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { key: "student", label: "Student", icon: "🎓", desc: "CBT & AI Tutor" },
                { key: "parent", label: "Guardian", icon: "🛡️", desc: "Child Reports" },
                { key: "teacher", label: "Teacher", icon: "🧑‍🏫", desc: "Class Cohorts" }
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRole(opt.key as "student" | "parent" | "teacher")}
                  style={{
                    padding: "10px 6px",
                    borderRadius: 12,
                    border: `2px solid ${role === opt.key ? "var(--brand)" : "var(--line)"}`,
                    background: role === opt.key ? "var(--brand-light)" : "var(--surface)",
                    color: role === opt.key ? "var(--brand)" : "var(--ink)",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ fontSize: "1.3rem", marginBottom: 2 }}>{opt.icon}</div>
                  <strong style={{ fontSize: "0.82rem", display: "block" }}>{opt.label}</strong>
                  <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="displayName">Full Name / Display Name</label>
            <input
              id="displayName"
              type="text"
              className="form-input"
              placeholder="e.g. Amina Bello"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="e.g. amina@example.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password (min. 8 characters)</label>
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

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="alert alert-info" style={{ fontSize: "0.82rem", padding: "10px 12px" }}>
            🛡️ Per NDPA child safety controls, new registrations default strictly to <strong>Student</strong> role. Educator roles require verified school affiliation.
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 8 }}
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Student Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.9rem", marginTop: 20, marginBottom: 0 }}>
          Already have an account? <Link href="/login" style={{ color: "var(--brand)", fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </main>
  );
}

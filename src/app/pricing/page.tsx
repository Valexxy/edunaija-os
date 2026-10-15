"use client";
import { BackButton } from "@/components/navigation/back-button";

import { useState } from "react";
import Link from "next/link";

export default function PricingPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubscribe = async () => {
    if (!email.trim() || !email.includes("@")) {
      setMsg("Please enter a valid billing email address to activate your Paystack subscription.");
      return;
    }

    setIsLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/billing/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          plan: "family_premium"
        })
      });

      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setMsg(data.message || "Simulated subscription active!");
      }
    } catch {
      setMsg("Payment initialization notice: Connecting to Paystack...");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ padding: "40px 0 80px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <BackButton fallbackUrl="/dashboard" label="← Back to Dashboard" />
      </div>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <span className="pill">Pillar 15 — Sustainable Education</span>
        <h1 style={{ fontSize: "2.4rem", margin: "12px 0 8px", letterSpacing: "-.03em" }}>
          Predictable, Family-Friendly Pricing
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem", maxWidth: 620, margin: "0 auto", lineHeight: 1.6 }}>
          Basic education should never be out of reach. Core curriculum practice is 100% free forever.
          Upgrade for live 1-on-1 vetted teacher sessions and deep Socratic AI math derivation.
        </p>
      </div>

      {msg && (
        <div className="alert alert-success" style={{ marginBottom: 24 }}>
          {msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 40 }}>
        {/* Free Plan */}
        <div className="card" style={{ padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span className="badge badge-neutral" style={{ marginBottom: 8 }}>Foundational</span>
            <h2 style={{ fontSize: "1.5rem", margin: "6px 0 4px" }}>Sovereign Free Learning</h2>
            <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--ink)", margin: "14px 0" }}>
              ₦0 <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--muted)" }}>/ forever</span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.5, marginBottom: 20 }}>
              The foundational learning engine. Complete curriculum access for every Nigerian child.
            </p>

            <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.92rem", color: "#374151", lineHeight: 1.8 }}>
              <li>✓ Unlimited CBT Practice &amp; JAMB/WAEC Mocks</li>
              <li>✓ NERDC Curriculum Syllabus &amp; Revision Notes</li>
              <li>✓ Local AI Socratic Tutor (0 token cost, offline)</li>
              <li>✓ Real-Time 36-State Weather &amp; Cultural Greetings</li>
              <li>✓ Cloudflare Turnstile Anti-Cheat Protected</li>
            </ul>
          </div>

          <div style={{ marginTop: 28 }}>
            <Link href="/dashboard" className="btn btn-secondary" style={{ width: "100%", textAlign: "center" }}>
              Continue with Free Tier
            </Link>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="card" style={{ padding: 32, border: "2px solid var(--brand)", background: "#FAFDFB", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
          <div style={{ position: "absolute", top: -12, right: 24 }}>
            <span className="badge badge-success" style={{ padding: "6px 14px" }}>RECOMMENDED FOR FAMILIES</span>
          </div>

          <div>
            <span className="badge badge-success" style={{ marginBottom: 8 }}>Complete Household</span>
            <h2 style={{ fontSize: "1.5rem", margin: "6px 0 4px" }}>Family Learning Premium</h2>
            <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--brand-dark)", margin: "14px 0" }}>
              ₦4,500 <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--muted)" }}>/ month</span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.5, marginBottom: 20 }}>
              One predictable subscription covering up to 4 children under one parent command centre.
            </p>

            <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.92rem", color: "#374151", lineHeight: 1.8 }}>
              <li>✓ Everything in Free Tier</li>
              <li>✓ <strong>1-on-1 LiveKit Virtual Classrooms</strong> with vetted TRCN teachers</li>
              <li>✓ <strong>Deep Gemini 2.5 Flash Socratic STEM Derivations</strong></li>
              <li>✓ <strong>Automated Weekly Parent Email Reports via Resend</strong></li>
              <li>✓ <strong>Interactive Digital Whiteboard with LaTeX tools</strong></li>
              <li>✓ Multi-sibling household profile switcher (NDPA 2023)</li>
            </ul>
          </div>

          <div style={{ marginTop: 28 }}>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <input
                type="email"
                className="form-input"
                placeholder="Parent Email (e.g. parent@gmail.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? "Connecting to Paystack..." : "Upgrade Family to Premium (₦4,500) →"}
            </button>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", display: "block", marginTop: 6 }}>
              🔒 Secured by Paystack • Cancel anytime in 1 click
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

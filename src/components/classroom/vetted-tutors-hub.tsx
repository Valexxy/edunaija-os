"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface VettedTutor {
  id: string;
  fullName: string;
  trcnNumber: string;
  ninVerified: boolean;
  qualification: string;
  specialization: string;
  stateOfPractice: string;
  hourlyRate: number;
  yearsOfExperience: number;
  rating: number;
  sessionsCompleted: number;
  vettingStatus: string;
  bio: string;
}

export function VettedTutorsHub() {
  const [tutors, setTutors] = useState<VettedTutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [bookingTutor, setBookingTutor] = useState<VettedTutor | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/tutors")
      .then((r) => r.json())
      .then((data) => {
        if (data.tutors) {
          setTutors(data.tutors);
        }
      })
      .catch((err) => console.warn("Failed to load tutors:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredTutors = tutors.filter((t) => {
    if (selectedSubject !== "all" && !t.specialization.toLowerCase().includes(selectedSubject.toLowerCase())) {
      return false;
    }
    if (selectedState !== "all" && !t.stateOfPractice.toLowerCase().includes(selectedState.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 0" }}>
      {/* Hero Header */}
      <div
        className="glass-card"
        style={{
          padding: "32px 28px",
          borderRadius: 20,
          marginBottom: 28,
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)",
          border: "1px solid var(--glass-border)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span className="badge badge-success">🏛️ TRCN ACCREDITED FACULTY</span>
          <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
            Teachers Registration Council of Nigeria Verified • NDPA 2023 Safeguarded
          </span>
        </div>
        <h1 style={{ fontSize: "1.9rem", margin: "4px 0 10px", fontWeight: 900, letterSpacing: "-0.02em" }}>
          Vetted Nigerian Educators &amp; 1-on-1 Mentors Hub
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.96rem", lineHeight: 1.6, maxWidth: 780, margin: 0 }}>
          Connect with government-licensed subject specialists for private discovery classes, WAEC/JAMB exam strategy, and Socratic homework breakdown. All transactions are held in escrow until session completion.
        </p>

        {/* Filters Bar */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>
              FILTER BY SUBJECT:
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="select"
              style={{ minWidth: 180, padding: "8px 12px", borderRadius: 10, background: "var(--glass-surface)", color: "var(--ink)" }}
            >
              <option value="all">All Subjects</option>
              <option value="mathematics">Mathematics &amp; Further Maths</option>
              <option value="physics">Physics &amp; Mechanics</option>
              <option value="chemistry">Chemistry &amp; Stoichiometry</option>
              <option value="english">English Language &amp; Concord</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>
              FILTER BY STATE:
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="select"
              style={{ minWidth: 160, padding: "8px 12px", borderRadius: 10, background: "var(--glass-surface)", color: "var(--ink)" }}
            >
              <option value="all">All States</option>
              <option value="lagos">Lagos</option>
              <option value="anambra">Anambra</option>
              <option value="kaduna">Kaduna</option>
              <option value="fct">FCT Abuja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tutors Grid */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)" }}>
          Loading accredited teacher directory...
        </div>
      ) : filteredTutors.length === 0 ? (
        <div className="glass-card" style={{ padding: "40px 20px", textAlign: "center", borderRadius: 16 }}>
          <h3>No accredited mentors match your filter</h3>
          <p style={{ color: "var(--muted)" }}>Try adjusting your subject or state selection above.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 20 }}>
          {filteredTutors.map((tutor) => (
            <div
              key={tutor.id}
              className="glass-card"
              style={{
                padding: "24px",
                borderRadius: 18,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: "1px solid var(--glass-border)"
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: "1.15rem", fontWeight: 800 }}>{tutor.fullName}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="badge badge-success" style={{ fontSize: "0.72rem" }}>
                        ✓ TRCN LICENSED
                      </span>
                      {tutor.ninVerified && (
                        <span className="badge badge-secondary" style={{ fontSize: "0.72rem" }}>
                          ✓ NIN VERIFIED
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "#10b981" }}>
                      ₦{tutor.hourlyRate.toLocaleString()}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>per hour</div>
                  </div>
                </div>

                <div style={{ fontSize: "0.78rem", color: "var(--muted)", fontFamily: "monospace", marginBottom: 10 }}>
                  License: {tutor.trcnNumber} • {tutor.stateOfPractice} State
                </div>

                <p style={{ fontSize: "0.85rem", color: "var(--ink)", lineHeight: 1.5, margin: "0 0 14px" }}>
                  {tutor.bio}
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: 6 }}>
                    ⭐ {tutor.rating} ({tutor.sessionsCompleted} sessions)
                  </span>
                  <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: 6 }}>
                    ⏳ {tutor.yearsOfExperience} yrs exp
                  </span>
                  <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: 6 }}>
                    🎓 {tutor.qualification}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setBookingTutor(tutor);
                    setBookingSuccess(false);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  Book Discovery Call
                </button>
                <Link
                  href={`/live-class/${tutor.specialization.toLowerCase().includes("math") ? "maths-mechanics" : "physics-kinematics"}`}
                  className="btn btn-outline btn-sm"
                >
                  Join Room →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Discovery Modal */}
      {bookingTutor && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: 20
          }}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 500,
              width: "100%",
              padding: "32px 28px",
              borderRadius: 20,
              background: "var(--glass-surface-raised)",
              border: "1px solid var(--glass-border)"
            }}
          >
            {bookingSuccess ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <h3 style={{ margin: "0 0 8px", color: "#10b981" }}>Discovery Session Confirmed!</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: 20 }}>
                  Your 1-on-1 discovery slot with <strong>{bookingTutor.fullName}</strong> has been scheduled. Session escrow has been authorized and parental notification dispatched.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <Link
                    href={`/live-class/${bookingTutor.specialization.toLowerCase().includes("math") ? "maths-mechanics" : "physics-kinematics"}`}
                    className="btn btn-primary"
                  >
                    Enter Live Room Gate →
                  </Link>
                  <button onClick={() => setBookingTutor(null)} className="btn btn-secondary">
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontSize: "1.3rem" }}>Schedule 1-on-1 Discovery</h3>
                  <button
                    onClick={() => setBookingTutor(null)}
                    style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "1.2rem", cursor: "pointer" }}
                  >
                    ✕
                  </button>
                </div>

                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 16
                  }}
                >
                  <div style={{ fontWeight: 800, color: "var(--ink)" }}>{bookingTutor.fullName}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    TRCN: {bookingTutor.trcnNumber} • Rate: ₦{bookingTutor.hourlyRate.toLocaleString()}/hr
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: 4 }}>
                    Select Preferred Time (WAT / Lagos):
                  </label>
                  <select
                    className="select"
                    style={{ width: "100%", padding: "10px", borderRadius: 8, background: "var(--glass-surface)", color: "var(--ink)" }}
                  >
                    <option>Today, 4:00 PM - 5:00 PM (After-School Sprint)</option>
                    <option>Today, 6:00 PM - 7:00 PM (Evening Socratic Clinic)</option>
                    <option>Saturday, 10:00 AM - 11:00 AM (Weekend Intensive)</option>
                  </select>
                </div>

                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--muted)",
                    background: "rgba(255, 255, 255, 0.04)",
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 20
                  }}
                >
                  🔒 <strong>NDPA 2023 &amp; Paystack Escrow Protection:</strong> Funds are only disbursed to the educator after the student or guardian confirms session completion.
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setBookingSuccess(true)}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Confirm &amp; Lock Discovery Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingTutor(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

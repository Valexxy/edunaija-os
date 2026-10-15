"use client";
import { BackButton } from "@/components/navigation/back-button";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AcademicTrack } from "@/lib/curriculum/types";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const TRACK_CONFIG = {
  science: {
    label: "Science & STEM",
    icon: "🔬",
    classes: ["SSS 3 Science", "SSS 2 Science", "SSS 1 Science"],
    subjects: ["General Mathematics", "English Language", "Physics", "Chemistry", "Biology", "Further Maths"],
    description: "For aspiring doctors, engineers, programmers, and STEM researchers."
  },
  arts: {
    label: "Arts & Humanities",
    icon: "📚",
    classes: ["SSS 3 Arts", "SSS 2 Arts", "SSS 1 Arts"],
    subjects: ["English Language", "Literature-in-English", "Government", "CRS / IRS", "General Mathematics", "History"],
    description: "For future lawyers, diplomats, writers, journalists, and policy makers."
  },
  commercial: {
    label: "Commercial & Business",
    icon: "💼",
    classes: ["SSS 3 Commercial", "SSS 2 Commercial", "SSS 1 Commercial"],
    subjects: ["Financial Accounting", "Commerce", "Economics", "General Mathematics", "English Language", "Marketing"],
    description: "For chartered accountants, bankers, business executives, and economists."
  },
  technical: {
    label: "Technical & Vocational",
    icon: "⚙️",
    classes: ["SSS 3 Technical", "SSS 2 Technical", "SSS 1 Technical"],
    subjects: ["Technical Drawing", "Applied Science", "General Mathematics", "English Language", "Data Processing"],
    description: "For technical designers, builders, and applied technology innovators."
  }
};

const DEFAULT_EXAM_GOAL_BY_LEVEL: Record<string, string> = {
  senior_secondary: "JAMB UTME 2026",
  junior_secondary: "BECE 2026",
  primary: "National Common Entrance Examination (NCEE)",
  exam_prep: "JAMB UTME 2026"
};

export default function OnboardingPage() {
  const router = useRouter();
  const [educationLevel, setEducationLevel] = useState("senior_secondary");
  const [selectedTrack, setSelectedTrack] = useState<AcademicTrack>("science");
  const [stateName, setStateName] = useState("Anambra");
  const [classLabel, setClassLabel] = useState("SSS 3 Science");
  const [examGoal, setExamGoal] = useState("JAMB UTME 2026");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [isLoading, setIsLoading] = useState(false);
  const [isPreloading, setIsPreloading] = useState(true);
  const [error, setError] = useState("");

  // Pre-load existing profile parameters if already saved
  useEffect(() => {
    fetch("/api/learner/profile")
      .then((res) => {
        if (!res.ok) {
          router.push("/login?redirectTo=/onboarding");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.learnerProfile) {
          const lp = data.learnerProfile;
          let level = lp.education_level || "senior_secondary";
          let track: AcademicTrack = (lp.academic_track as AcademicTrack) || "science";
          const cl = lp.class_label || "SSS 3 Science";

          if (cl) {
            const lower = cl.toLowerCase();
            if (
              lower.includes("primary") ||
              lower.includes("pri") ||
              lower.includes("basic 1") ||
              lower.includes("basic 2") ||
              lower.includes("basic 3") ||
              lower.includes("basic 4") ||
              lower.includes("basic 5") ||
              lower.includes("basic 6")
            ) {
              level = "primary";
              track = "general";
            } else if (
              lower.includes("jss") ||
              lower.includes("basic 7") ||
              lower.includes("basic 8") ||
              lower.includes("basic 9") ||
              lower.includes("junior")
            ) {
              level = "junior_secondary";
              track = "general";
            } else if (lower.includes("art")) {
              track = "arts";
            } else if (lower.includes("comm") || lower.includes("business")) {
              track = "commercial";
            } else if (lower.includes("tech")) {
              track = "technical";
            } else if (lower.includes("science")) {
              track = "science";
            }
          }

          setEducationLevel(level);
          setSelectedTrack(track);
          setClassLabel(cl);
          if (lp.state_name) setStateName(lp.state_name);
          if (lp.exam_goal) setExamGoal(lp.exam_goal);
          if (lp.preferred_language) setPreferredLanguage(lp.preferred_language);
        }
      })
      .catch(() => {})
      .finally(() => setIsPreloading(false));
  }, []);

  const handleLevelChange = (newLevel: string) => {
    setEducationLevel(newLevel);
    if (newLevel === "junior_secondary") {
      setClassLabel("JSS 3");
      setSelectedTrack("general");
    } else if (newLevel === "primary") {
      setClassLabel("Primary 6");
      setSelectedTrack("general");
    } else {
      setClassLabel(TRACK_CONFIG[selectedTrack === "general" ? "science" : selectedTrack].classes[0]);
      if (selectedTrack === "general") setSelectedTrack("science");
    }
    if (DEFAULT_EXAM_GOAL_BY_LEVEL[newLevel]) {
      setExamGoal(DEFAULT_EXAM_GOAL_BY_LEVEL[newLevel]);
    }
  };

  const handleTrackSelect = (trackKey: "science" | "arts" | "commercial" | "technical") => {
    setSelectedTrack(trackKey);
    const newClasses = TRACK_CONFIG[trackKey].classes;
    setClassLabel(newClasses[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/learner/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          education_level: educationLevel,
          state_name: stateName,
          class_label: classLabel,
          exam_goal: examGoal,
          preferred_language: preferredLanguage
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }

      // Update local storage state
      localStorage.setItem("edunaija_user_state", stateName);

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      setIsLoading(false);
    }
  };

  const isSeniorOrPrep = educationLevel === "senior_secondary" || educationLevel === "exam_prep";

  return (
    <main style={{ maxWidth: 660, padding: "40px 0" }}>
      <div style={{ marginBottom: 16 }}>
        <BackButton fallbackUrl="/dashboard" label="← Back to Dashboard" />
      </div>
      <div className="card" style={{ padding: 36, boxShadow: "0 10px 30px rgba(0,0,0,0.06)" }}>
        <span className="pill" style={{ marginBottom: 12 }}>Academic Track Personalization & CBT Provisioning</span>
        <h2 style={{ fontSize: "1.85rem", letterSpacing: "-0.02em", margin: "4px 0 8px" }}>
          Calibrate Your Academic Department
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 20px" }}>
          Whether you are in <strong>Science</strong>, <strong>Arts & Humanities</strong>, or <strong>Commercial</strong>,
          our engine provisions diagnostic exams, sprints, and AI tutor explanations specifically aligned with your track.
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 1. Education Level */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="educationLevel">Education Level</label>
            <select
              id="educationLevel"
              className="form-select"
              value={educationLevel}
              onChange={(e) => handleLevelChange(e.target.value)}
              disabled={isPreloading}
            >
              <option value="senior_secondary">Senior Secondary (SSS 1–3 / WAEC / NECO Standards)</option>
              <option value="exam_prep">Post-Secondary & UTME Prep (JAMB / Direct Entry Track)</option>
              <option value="junior_secondary">Junior Secondary (JSS 1–3 / BECE Junior WAEC)</option>
              <option value="primary">Primary Education (Primary 4–6 / Unity Schools Common Entrance)</option>
            </select>
          </div>

          {/* 2. Interactive Academic Department / Track Selector (For Senior Secondary) */}
          {isSeniorOrPrep && (
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Academic Track / Department</span>
                <span style={{ fontSize: "0.8rem", color: "var(--brand-dark)", fontWeight: 600 }}>Zero Hardcoding • Pure Choice</span>
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 6 }}>
                {(["science", "arts", "commercial", "technical"] as const).map((trackKey) => {
                  const cfg = TRACK_CONFIG[trackKey];
                  const isSelected = selectedTrack === trackKey;
                  return (
                    <button
                      key={trackKey}
                      type="button"
                      onClick={() => handleTrackSelect(trackKey)}
                      style={{
                        padding: "12px 14px",
                        textAlign: "left",
                        borderRadius: 10,
                        border: isSelected ? "2px solid #059669" : "1px solid #e5e7eb",
                        background: isSelected ? "#ecfdf5" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: "0.95rem", color: isSelected ? "#065f46" : "#111827" }}>
                        <span>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </div>
                      <div style={{ fontSize: "0.76rem", color: isSelected ? "#047857" : "#6b7280", marginTop: 4, lineHeight: 1.3 }}>
                        {cfg.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Live Subject Preview Pill Bar */}
              <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--glass-surface)", borderRadius: 10, border: "1px solid var(--glass-border)" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--brand)", marginBottom: 6, textTransform: "uppercase" }}>
                  Curriculum Subjects Auto-Provisioned for {TRACK_CONFIG[selectedTrack === "general" ? "science" : selectedTrack].label}:
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {TRACK_CONFIG[selectedTrack === "general" ? "science" : selectedTrack].subjects.map((s) => (
                    <span key={s} style={{ background: "var(--glass-surface-raised)", border: "1px solid var(--glass-border)", padding: "2px 8px", borderRadius: 12, fontSize: "0.76rem", color: "var(--ink)" }}>
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Class and State */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="classLabel">Your Class Standing</label>
              <select
                id="classLabel"
                className="form-select"
                value={classLabel}
                onChange={(e) => setClassLabel(e.target.value)}
                disabled={isPreloading}
              >
                {isSeniorOrPrep ? (
                  TRACK_CONFIG[selectedTrack === "general" ? "science" : selectedTrack].classes.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))
                ) : educationLevel === "junior_secondary" ? (
                  ["JSS 3", "JSS 2", "JSS 1"].map((c) => <option key={c} value={c}>{c}</option>)
                ) : (
                  ["Primary 6", "Primary 5", "Primary 4"].map((c) => <option key={c} value={c}>{c}</option>)
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="stateName">State of Study (Nigerian Geopolitical Zone)</label>
              <select
                id="stateName"
                className="form-select"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                disabled={isPreloading}
              >
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state} State</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Target Examination */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="examGoal">Primary Exam Milestone</label>
            <select
              id="examGoal"
              className="form-select"
              value={examGoal}
              onChange={(e) => setExamGoal(e.target.value)}
              disabled={isPreloading}
            >
              {educationLevel === "junior_secondary" ? (
                <>
                  <option value="BECE 2026">BECE (Junior WAEC National Standard)</option>
                  <option value="NECO BECE 2026">NECO Basic Education Certificate Examination</option>
                  <option value="Junior Secondary NERDC Curriculum">General JSS Curriculum Mastery</option>
                </>
              ) : educationLevel === "primary" ? (
                <>
                  <option value="National Common Entrance Examination (NCEE)">National Common Entrance Examination (NCEE Unity Schools)</option>
                  <option value="State Common Entrance Examination">State Primary Common Entrance</option>
                  <option value="Primary NERDC Curriculum">Foundational Primary Curriculum Mastery</option>
                </>
              ) : (
                <>
                  <option value="JAMB UTME 2026">JAMB UTME 2026 (Unified Tertiary Prep - Target 320+)</option>
                  <option value="WAEC WASSCE 2026">WAEC WASSCE 2026 (Senior School Certificate)</option>
                  <option value="NECO SSCE 2026">NECO SSCE 2026 (National Senior Certificate)</option>
                  <option value="General Curriculum Mastery">NERDC Senior Secondary Mastery</option>
                </>
              )}
            </select>
          </div>

          {/* 5. Language Preference */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">AI Tutor Explanation Dialect</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 12 }}>
              <label className={`option-label ${preferredLanguage === "en" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="language"
                  value="en"
                  checked={preferredLanguage === "en"}
                  onChange={() => setPreferredLanguage("en")}
                  className="option-radio"
                />
                <div>
                  <strong>Standard English</strong>
                  <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Formal curriculum pedagogical tone</div>
                </div>
              </label>

              <label className={`option-label ${preferredLanguage === "pcm" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="language"
                  value="pcm"
                  checked={preferredLanguage === "pcm"}
                  onChange={() => setPreferredLanguage("pcm")}
                  className="option-radio"
                />
                <div>
                  <strong>Naija Pidgin</strong>
                  <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Warm, relatable street breakdown</div>
                </div>
              </label>
            </div>
          </div>

          {/* Dynamic Provisioning Summary Badge */}
          <div className="card" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)", borderColor: "var(--brand-border)", padding: "16px 18px", marginBottom: 24 }}>
            <div style={{ fontSize: "0.8rem", color: "#065f46", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
              🎯 Calibrated Learning Profile Summary:
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#064e3b" }}>
              {classLabel} ({isSeniorOrPrep ? TRACK_CONFIG[selectedTrack === "general" ? "science" : selectedTrack].label : "General Basic"}) • {examGoal}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: 4 }}>
              📍 <strong>Jurisdiction:</strong> {stateName} State • 🗣️ <strong>Language:</strong> {preferredLanguage === "pcm" ? "Naija Pidgin" : "English"}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "14px 20px", fontSize: "1rem", fontWeight: 700 }}
            disabled={isLoading || isPreloading}
          >
            {isLoading ? "Provisioning Department Track..." : "Save Parameters & Provision Tests →"}
          </button>
        </form>
      </div>
    </main>
  );
}

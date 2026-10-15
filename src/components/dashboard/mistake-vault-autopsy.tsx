"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getMissedQuestions } from "@/lib/assessment/history-store";

interface MisconceptionItem {
  id: string;
  subject: string;
  topic: string;
  questionSnippet: string;
  etiology: "conceptual" | "calculation" | "reading_trap" | "time_pressure";
  etiologyLabel: string;
  etiologyColor: string;
  studentAnswer: string;
  correctAnswer: string;
  socraticDiagnosis: string;
}

interface MistakeVaultAutopsyProps {
  educationLevel?: string;
  classLabel?: string;
  academicTrack?: string;
}

const PRIMARY_MISCONCEPTIONS: MisconceptionItem[] = [
  {
    id: "mv-pri-1",
    subject: "Mathematics",
    topic: "Fractions & Common Denominators",
    questionSnippet: "Evaluate 3/4 + 1/2. Express as a proper mixed fraction.",
    etiology: "calculation",
    etiologyLabel: "Fraction / LCM Slip",
    etiologyColor: "#f59e0b",
    studentAnswer: "4/6",
    correctAnswer: "1 1/4 (or 5/4)",
    socraticDiagnosis: "You added the top numbers (3+1) and bottom numbers (4+2) directly! To add fractions, you must first find the common denominator (LCM of 4 and 2 is 4). 3/4 + 2/4 = 5/4 = 1 1/4."
  },
  {
    id: "mv-pri-2",
    subject: "Basic Science & Technology",
    topic: "States of Matter & Water Cycle",
    questionSnippet: "When water in an open pot is heated and boils until empty, where has the water gone?",
    etiology: "conceptual",
    etiologyLabel: "Conceptual Misconception",
    etiologyColor: "#ef4444",
    studentAnswer: "The water was destroyed and vanished",
    correctAnswer: "The water turned into invisible water vapor (gas)",
    socraticDiagnosis: "Matter cannot be destroyed! The liquid water absorbed heat energy and evaporated into the air as gas (water vapor), which later condenses to form rain in the water cycle."
  },
  {
    id: "mv-pri-3",
    subject: "English Language",
    topic: "Punctuation & Capitalization Rules",
    questionSnippet: "Which sentence is correctly punctuated?",
    etiology: "reading_trap",
    etiologyLabel: "Common Entrance Trap",
    etiologyColor: "#8b5cf6",
    studentAnswer: "on monday, i visited kano with amina.",
    correctAnswer: "On Monday, I visited Kano with Amina.",
    socraticDiagnosis: "Proper nouns and days of the week always start with capital letters! 'Monday', 'Kano', 'Amina', and the pronoun 'I' must always be capitalized."
  },
  {
    id: "mv-pri-4",
    subject: "Social Studies & Civic",
    topic: "Community Leadership & Roles",
    questionSnippet: "Who heads the local government administration in Nigeria?",
    etiology: "time_pressure",
    etiologyLabel: "Role Confusion",
    etiologyColor: "#06b6d4",
    studentAnswer: "Traditional Village Chief",
    correctAnswer: "Elected Local Government Chairman",
    socraticDiagnosis: "Traditional chiefs hold cultural and advisory authority, but executive constitutional administration of the LGA is led by the elected Local Government Chairman."
  }
];

const JUNIOR_MISCONCEPTIONS: MisconceptionItem[] = [
  {
    id: "mv-jss-1",
    subject: "Basic Science",
    topic: "Energy Forms & Transformations",
    questionSnippet: "A stone is thrown vertically into the air. What form of energy is maximum at the very highest point?",
    etiology: "conceptual",
    etiologyLabel: "Conceptual Misconception",
    etiologyColor: "#ef4444",
    studentAnswer: "Kinetic Energy",
    correctAnswer: "Gravitational Potential Energy",
    socraticDiagnosis: "At the highest peak, the stone momentarily stops moving (velocity = 0), so its kinetic energy is zero! All the kinetic energy has been converted into Gravitational Potential Energy due to its height."
  },
  {
    id: "mv-jss-2",
    subject: "Mathematics",
    topic: "Algebraic Expansion & Negative Signs",
    questionSnippet: "Expand and simplify: -3(2x - 4)",
    etiology: "calculation",
    etiologyLabel: "Sign Error (- × - = +)",
    etiologyColor: "#f59e0b",
    studentAnswer: "-6x - 12",
    correctAnswer: "-6x + 12",
    socraticDiagnosis: "Negative times negative equals positive! -3 × 2x = -6x, and -3 × -4 = +12. Watch the second term carefully."
  },
  {
    id: "mv-jss-3",
    subject: "English Studies",
    topic: "Subject-Verb Agreement (Concord)",
    questionSnippet: "The set of mathematical instruments _____ on the desk.",
    etiology: "reading_trap",
    etiologyLabel: "BECE Concord Trap",
    etiologyColor: "#8b5cf6",
    studentAnswer: "are",
    correctAnswer: "is",
    socraticDiagnosis: "Don't get distracted by the plural noun 'instruments'! The true subject of the sentence is the collective noun 'set' (singular), so the verb must be 'is'."
  },
  {
    id: "mv-jss-4",
    subject: "Basic Technology",
    topic: "Workshop Measurement Tools",
    questionSnippet: "Which hand tool is used specifically to test right angles (90 degrees) on timber?",
    etiology: "time_pressure",
    etiologyLabel: "Tool Identification Slip",
    etiologyColor: "#06b6d4",
    studentAnswer: "Marking Gauge",
    correctAnswer: "Try Square",
    socraticDiagnosis: "A marking gauge is used to scribe lines parallel to an edge. To test or mark an exact 90-degree right angle, the correct tool is the Try Square."
  }
];

const SSS_ARTS_MISCONCEPTIONS: MisconceptionItem[] = [
  {
    id: "mv-arts-1",
    subject: "Literature in English",
    topic: "Dramatic Irony & Literary Devices",
    questionSnippet: "In dramatic literature, dramatic irony occurs when:",
    etiology: "reading_trap",
    etiologyLabel: "WAEC Literature Trap",
    etiologyColor: "#8b5cf6",
    studentAnswer: "A character says the opposite of what they mean",
    correctAnswer: "The audience understands facts that the character on stage does not know",
    socraticDiagnosis: "Saying the opposite of what you mean is verbal irony (or sarcasm). Dramatic irony specifically occurs when the audience possesses critical knowledge that a character remains unaware of."
  },
  {
    id: "mv-arts-2",
    subject: "Government",
    topic: "Separation of Powers & Checks",
    questionSnippet: "The principle of separation of powers in the Nigerian 1999 Constitution means:",
    etiology: "conceptual",
    etiologyLabel: "Constitutional Misconception",
    etiologyColor: "#ef4444",
    studentAnswer: "Branches operate in absolute isolation with zero interaction",
    correctAnswer: "Government organs perform distinct functions but check and balance one another",
    socraticDiagnosis: "Total isolation is impossible in governance. The legislature, executive, and judiciary are distinct, but the constitution intentionally provides checks and balances (like judicial review and veto power)."
  },
  {
    id: "mv-arts-3",
    subject: "Use of English",
    topic: "Antonyms & Context Clues",
    questionSnippet: "The minister's statement was NOT entirely uncorroborated. In context, this means:",
    etiology: "reading_trap",
    etiologyLabel: "Double Negation Trap",
    etiologyColor: "#8b5cf6",
    studentAnswer: "The statement was completely false and unsupported",
    correctAnswer: "The statement had at least partial supporting evidence",
    socraticDiagnosis: "Double negation! 'Not uncorroborated' means corroborated (supported). Watch out for negative prefixes paired with negative words in WAEC/JAMB."
  },
  {
    id: "mv-arts-4",
    subject: "Christian/Islamic Studies",
    topic: "Historical Hermeneutics & Treaties",
    questionSnippet: "The primary historical significance of the Treaty of Hudaybiyyah / Sinai Covenant was:",
    etiology: "time_pressure",
    etiologyLabel: "Historical Context Slip",
    etiologyColor: "#06b6d4",
    studentAnswer: "An unconditional surrender",
    correctAnswer: "A binding mutual covenant granting peace and recognition",
    socraticDiagnosis: "Covenants and historical treaties establish structured rights and peace, rather than unilateral military conquests."
  }
];

const SSS_COMMERCIAL_MISCONCEPTIONS: MisconceptionItem[] = [
  {
    id: "mv-comm-1",
    subject: "Financial Accounting",
    topic: "Double Entry Rules & Balances",
    questionSnippet: "When goods previously sold on credit are returned by a customer, what is the journal entry?",
    etiology: "conceptual",
    etiologyLabel: "Debit/Credit Rule Slip",
    etiologyColor: "#ef4444",
    studentAnswer: "Debit Trade Debtors, Credit Returns Inwards",
    correctAnswer: "Debit Returns Inwards, Credit Trade Debtors",
    socraticDiagnosis: "Returns inwards reduces revenue (an expense/reduction to sales, so it is debited), and the debtor now owes less (asset reduced, so it is credited)."
  },
  {
    id: "mv-comm-2",
    subject: "Commerce",
    topic: "Commercial Banking vs Central Bank",
    questionSnippet: "Which of the following functions is performed exclusively by the Central Bank of Nigeria (CBN)?",
    etiology: "reading_trap",
    etiologyLabel: "Institutional Confusion",
    etiologyColor: "#8b5cf6",
    studentAnswer: "Accepting demand deposits from retail individuals",
    correctAnswer: "Acting as lender of last resort and issuing statutory currency",
    socraticDiagnosis: "The Central Bank does not open checking accounts for ordinary citizens! Retail individuals bank with Commercial Banks (First Bank, GTCO, Zenith, etc.)."
  },
  {
    id: "mv-comm-3",
    subject: "Economics",
    topic: "Price Elasticity of Demand",
    questionSnippet: "If price rises by 10% and quantity demanded falls by 25%, the price elasticity of demand is:",
    etiology: "calculation",
    etiologyLabel: "Formula Inversion Slip",
    etiologyColor: "#f59e0b",
    studentAnswer: "0.4 (Inelastic)",
    correctAnswer: "2.5 (Elastic)",
    socraticDiagnosis: "You divided % change in price by % change in quantity! The elasticity formula is (% Change in Quantity Demanded) / (% Change in Price) = 25% / 10% = 2.5."
  },
  {
    id: "mv-comm-4",
    subject: "Marketing / Commerce",
    topic: "Trade Documents & Credit Notes",
    questionSnippet: "A credit note is dispatched to a customer by a seller when:",
    etiology: "time_pressure",
    etiologyLabel: "Trade Document Slip",
    etiologyColor: "#06b6d4",
    studentAnswer: "The customer has been undercharged on the invoice",
    correctAnswer: "The customer has been overcharged or has returned goods",
    socraticDiagnosis: "If undercharged, a DEBIT note is issued to demand more money. A CREDIT note is sent to reduce the customer's liability when they were overcharged or returned damaged items."
  }
];

const SSS_SCIENCE_MISCONCEPTIONS: MisconceptionItem[] = [
  {
    id: "mv-sci-1",
    subject: "Physics",
    topic: "Electric Field & Coulomb's Law",
    questionSnippet: "Two point charges +q and -q are separated by distance r. What is the electric field at midpoint?",
    etiology: "conceptual",
    etiologyLabel: "Vector Field Misconception",
    etiologyColor: "#ef4444",
    studentAnswer: "Zero (fields cancel out)",
    correctAnswer: "2kq / (r/2)² pointing toward negative charge",
    socraticDiagnosis: "You treated the electric field as a scalar rather than a vector. Since the charges have opposite signs, both field vectors point in the SAME direction at midpoint and reinforce each other rather than canceling."
  },
  {
    id: "mv-sci-2",
    subject: "Mathematics",
    topic: "Quadratic Equations & Roots",
    questionSnippet: "If roots of 2x² - 5x + c = 0 are real and equal, find the value of c.",
    etiology: "calculation",
    etiologyLabel: "Arithmetic / Sign Slip",
    etiologyColor: "#f59e0b",
    studentAnswer: "25/4",
    correctAnswer: "25/8",
    socraticDiagnosis: "Discriminant formula b² - 4ac = 0 was applied correctly, but in calculating 4(2)(c) = 8c, you divided by 4 instead of 8. b² = 25 -> 8c = 25 -> c = 25/8."
  },
  {
    id: "mv-sci-3",
    subject: "Use of English",
    topic: "Antonyms & Context Clues",
    questionSnippet: "The judge noted that the witness's testimony was NOT entirely uncorroborated. In context, this means...",
    etiology: "reading_trap",
    etiologyLabel: "JAMB Reading Trap",
    etiologyColor: "#8b5cf6",
    studentAnswer: "The testimony had zero evidence",
    correctAnswer: "The testimony had at least partial supporting evidence",
    socraticDiagnosis: "Double negation trap! 'NOT entirely uncorroborated' means there was some supporting evidence. Watch out for negative prefixes paired with negative qualifiers."
  },
  {
    id: "mv-sci-4",
    subject: "Chemistry",
    topic: "Gas Laws & Stoichiometry",
    questionSnippet: "Calculate volume occupied by 0.5 moles of N₂ gas at standard temperature and pressure (s.t.p).",
    etiology: "time_pressure",
    etiologyLabel: "Time Pressure Guess",
    etiologyColor: "#06b6d4",
    studentAnswer: "44.8 dm³",
    correctAnswer: "11.2 dm³",
    socraticDiagnosis: "Under time pressure (answered in 4.2s), you multiplied 22.4 by 2 instead of multiplying by 0.5 moles. 0.5 × 22.4 = 11.2 dm³."
  }
];

export function MistakeVaultAutopsy({ educationLevel, classLabel, academicTrack }: MistakeVaultAutopsyProps = {}) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [hasRealMistakes, setHasRealMistakes] = useState(false);
  const [realMistakes, setRealMistakes] = useState<MisconceptionItem[]>([]);

  const level = (educationLevel || "").toLowerCase();
  const cl = (classLabel || "").toLowerCase();
  const track = (academicTrack || "").toLowerCase();

  const isPrimary = level === "primary" || cl.includes("primary") || cl.includes("pri");
  const isJSS = level === "junior_secondary" || cl.includes("jss") || cl.includes("basic");
  const isArts = track === "arts" || cl.includes("art");
  const isCommercial = track === "commercial" || cl.includes("comm");

  const benchmarkMisconceptions: MisconceptionItem[] = isPrimary
    ? PRIMARY_MISCONCEPTIONS
    : isJSS
    ? JUNIOR_MISCONCEPTIONS
    : isArts
    ? SSS_ARTS_MISCONCEPTIONS
    : isCommercial
    ? SSS_COMMERCIAL_MISCONCEPTIONS
    : SSS_SCIENCE_MISCONCEPTIONS;

  useEffect(() => {
    try {
      const missed = getMissedQuestions();
      if (missed && missed.length > 0) {
        setHasRealMistakes(true);
        const mapped: MisconceptionItem[] = missed.slice(0, 8).map((q, idx) => ({
          id: `real-mv-${q.id || idx}`,
          subject: q.subject || "CBT Practice",
          topic: q.assessmentTitle || "Curriculum Unit",
          questionSnippet: q.prompt,
          etiology: "conceptual" as const,
          etiologyLabel: "Diagnostic Misconception",
          etiologyColor: "#ef4444",
          studentAnswer: q.userAnswer || "Incorrect Answer Choice",
          correctAnswer: q.correctAnswer || "See Marking Guide",
          socraticDiagnosis: q.explanation || "Review the step-by-step resolution to reinforce the underlying principle."
        }));
        setRealMistakes(mapped);
      }
    } catch {}
  }, []);

  const misconceptions = hasRealMistakes && realMistakes.length > 0 ? realMistakes : benchmarkMisconceptions;

  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const filteredItems = activeFilter === "all"
    ? misconceptions
    : misconceptions.filter((m) => m.etiology === activeFilter);

  const selectedMisconception = misconceptions.find((m) => m.id === selectedItem) || filteredItems[0] || misconceptions[0];

  return (
    <div
      className="glass-card"
      style={{
        marginTop: 28,
        marginBottom: 28,
        background: "var(--glass-surface-raised)",
        border: "1px solid rgba(239, 68, 68, 0.25)",
        boxShadow: "0 8px 32px rgba(239, 68, 68, 0.05), var(--glass-shadow)",
        padding: "24px 28px",
        borderRadius: 20,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                color: "#ef4444",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "3px 10px",
                borderRadius: 9999,
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}
            >
              {hasRealMistakes ? `🩺 Real-Time Error Autopsy (${realMistakes.length} Logged)` : "🔍 Curriculum Traps & Benchmark Autopsy (Diagnostic Preview)"}
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              {hasRealMistakes ? "Socratic Error Root-Cause Classifier" : "Identified NERDC Examiner Traps • Complete CBT Sprints to populate your personal vault"}
            </span>
          </div>
          <h2 style={{ fontSize: "1.45rem", margin: 0, fontWeight: 900, letterSpacing: "-0.02em", color: "var(--ink)" }}>
            {hasRealMistakes ? "Mistake Vault: Diagnostic Autopsy" : "Mistake Vault: Curriculum Trap Analysis"}
          </h2>
        </div>

        {/* 1-Click Redemption Drill Launch Button */}
        <Link
          href="/assessments/asm-sprint-sss-math-quad"
          className="btn btn-primary btn-sm"
          style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)", border: "none", boxShadow: "0 4px 16px rgba(239, 68, 68, 0.4)" }}
        >
          ⚡ Launch 5-Min Redemption Drill ({misconceptions.length})
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          style={{
            background: activeFilter === "all" ? "var(--brand)" : "var(--glass-surface)",
            color: activeFilter === "all" ? "#ffffff" : "var(--muted)",
            border: "1px solid var(--glass-border)",
            padding: "6px 14px",
            borderRadius: 9999,
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          All Misconceptions ({misconceptions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("conceptual")}
          style={{
            background: activeFilter === "conceptual" ? "#ef4444" : "var(--glass-surface)",
            color: activeFilter === "conceptual" ? "#ffffff" : "var(--muted)",
            border: "1px solid var(--glass-border)",
            padding: "6px 14px",
            borderRadius: 9999,
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          🧠 Conceptual Gaps
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("calculation")}
          style={{
            background: activeFilter === "calculation" ? "#f59e0b" : "var(--glass-surface)",
            color: activeFilter === "calculation" ? "#ffffff" : "var(--muted)",
            border: "1px solid var(--glass-border)",
            padding: "6px 14px",
            borderRadius: 9999,
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          🔢 Calculation Slips
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("reading_trap")}
          style={{
            background: activeFilter === "reading_trap" ? "#8b5cf6" : "var(--glass-surface)",
            color: activeFilter === "reading_trap" ? "#ffffff" : "var(--muted)",
            border: "1px solid var(--glass-border)",
            padding: "6px 14px",
            borderRadius: 9999,
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          🎯 JAMB Reading Traps
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("time_pressure")}
          style={{
            background: activeFilter === "time_pressure" ? "#06b6d4" : "var(--glass-surface)",
            color: activeFilter === "time_pressure" ? "#ffffff" : "var(--muted)",
            border: "1px solid var(--glass-border)",
            padding: "6px 14px",
            borderRadius: 9999,
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          ⏱️ Speed / Rush Guesses
        </button>
      </div>

      {/* Two Column Layout: List & Deep Autopsy Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 18 }}>
        {/* Left Column: Misconception List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item.id)}
              style={{
                background: selectedItem === item.id ? "rgba(255, 255, 255, 0.05)" : "var(--glass-surface)",
                border: selectedItem === item.id ? `1px solid ${item.etiologyColor}` : "1px solid var(--glass-border)",
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--ink)" }}>
                  {item.subject} • {item.topic}
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: item.etiologyColor,
                    background: `${item.etiologyColor}18`,
                    padding: "2px 8px",
                    borderRadius: 9999
                  }}
                >
                  {item.etiologyLabel}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.questionSnippet}
              </p>
            </div>
          ))}
        </div>

        {/* Right Column: Deep Autopsy Breakdown */}
        {selectedMisconception && (
          <div
            style={{
              background: "var(--glass-surface)",
              border: `1px solid ${selectedMisconception.etiologyColor}40`,
              borderRadius: 16,
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: 14
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  color: selectedMisconception.etiologyColor,
                  background: `${selectedMisconception.etiologyColor}18`,
                  padding: "3px 10px",
                  borderRadius: 9999,
                  textTransform: "uppercase"
                }}
              >
                {selectedMisconception.etiologyLabel}
              </span>
              <h3 style={{ fontSize: "1.05rem", margin: "10px 0 4px", color: "var(--ink)", lineHeight: 1.4 }}>
                {selectedMisconception.questionSnippet}
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: "0.72rem", color: "#ef4444", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>
                  ❌ {hasRealMistakes ? "Your Answer" : "Common Trap Choice"}
                </div>
                <div style={{ fontSize: "0.86rem", color: "var(--ink)", fontWeight: 600 }}>
                  {selectedMisconception.studentAnswer}
                </div>
              </div>

              <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>
                  ✓ Official Key
                </div>
                <div style={{ fontSize: "0.86rem", color: "var(--ink)", fontWeight: 600 }}>
                  {selectedMisconception.correctAnswer}
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.5)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: 12, padding: "14px" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--brand)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                💡 Socratic Root-Cause Autopsy:
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}>
                {selectedMisconception.socraticDiagnosis}
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: "auto", flexWrap: "wrap" }}>
              <Link
                href={`/tutor?topic=${encodeURIComponent(selectedMisconception.topic)}`}
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
              >
                🤖 Socratic AI Walkthrough
              </Link>
              <Link
                href="/assessments/sprint-quadratics"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
              >
                🔄 Retry Variant
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

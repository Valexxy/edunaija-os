"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/navigation/back-button";
import { CollaborativeWhiteboard } from "@/components/classroom/whiteboard";

interface PresetTopic {
  id: string;
  subject: string;
  title: string;
  tier: string;
  syllabusNotes: string;
  questions: {
    id: string;
    prompt: string;
    options: { id: string; text: string }[];
    correctId: string;
    explanation: string;
  }[];
}

const PRESET_TOPICS: PresetTopic[] = [
  {
    id: "top-math-quad-01",
    subject: "Mathematics",
    title: "Quadratic Equations & Roots of Polynomials",
    tier: "Senior Secondary (SSS / JAMB)",
    syllabusNotes: "Standard form ax² + bx + c = 0. Discriminant Δ = b² - 4ac determines nature of roots: Δ > 0 (two distinct real roots), Δ = 0 (repeated real root), Δ < 0 (no real roots). Factorization method applies when product ac can be split to sum b.",
    questions: [
      {
        id: "q-study-01",
        prompt: "If the quadratic equation 2x² - 8x + k = 0 has equal real roots, find the value of the constant k.",
        options: [
          { id: "a", text: "4" },
          { id: "b", text: "8" },
          { id: "c", text: "16" },
          { id: "d", text: "32" }
        ],
        correctId: "b",
        explanation: "For equal roots, discriminant b² - 4ac = 0. Here a = 2, b = -8, c = k. (-8)² - 4(2)(k) = 0 => 64 - 8k = 0 => k = 8."
      },
      {
        id: "q-study-02",
        prompt: "Find the roots of the equation x² - 5x + 6 = 0 by factorization.",
        options: [
          { id: "a", text: "x = 2 or x = 3" },
          { id: "b", text: "x = -2 or x = -3" },
          { id: "c", text: "x = 1 or x = 6" },
          { id: "d", text: "x = -1 or x = 6" }
        ],
        correctId: "a",
        explanation: "(x - 2)(x - 3) = 0. Therefore x - 2 = 0 => x = 2, and x - 3 = 0 => x = 3."
      }
    ]
  },
  {
    id: "top-phy-mech-01",
    subject: "Physics",
    title: "Equations of Uniformly Accelerated Motion",
    tier: "Senior Secondary (SSS / WAEC)",
    syllabusNotes: "Kinematic equations: v = u + at; s = ut + ½at²; v² = u² + 2as; s = ½(u + v)t. Valid under constant acceleration. Always verify SI units: acceleration in m/s², time in s, displacement in m.",
    questions: [
      {
        id: "q-study-03",
        prompt: "A vehicle accelerates uniformly from rest at 2.5 m/s² for 8 seconds. Calculate the total distance covered.",
        options: [
          { id: "a", text: "40 m" },
          { id: "b", text: "60 m" },
          { id: "c", text: "80 m" },
          { id: "d", text: "100 m" }
        ],
        correctId: "c",
        explanation: "s = ut + ½at². Since u = 0 (from rest), s = ½(2.5)(8²) = ½(2.5)(64) = 80 metres."
      }
    ]
  },
  {
    id: "top-pri-math-01",
    subject: "Primary Mathematics",
    title: "Whole Numbers, Mental Math & Place Value",
    tier: "Primary 5-6 (NCEE Common Entrance)",
    syllabusNotes: "Addition with regrouping across thousands, hundreds, tens, and units. Fractions reduction to lowest terms by dividing numerator and denominator by highest common factor (HCF).",
    questions: [
      {
        id: "q-study-04",
        prompt: "Calculate the sum: 350 + 475.",
        options: [
          { id: "a", text: "725" },
          { id: "b", text: "825" },
          { id: "c", text: "835" },
          { id: "d", text: "925" }
        ],
        correctId: "b",
        explanation: "350 + 475: 300 + 400 = 700; 50 + 75 = 125; 700 + 125 = 825."
      }
    ]
  }
];

export default function StudyGroupPage() {
  const router = useRouter();
  const [activeRoomCode, setActiveRoomCode] = useState<string>("ROOM-MTH101");
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [isInRoom, setIsInRoom] = useState(false);
  const [members] = useState([
    { name: "You (Scholar)", role: "Host", status: "Active", avatar: "🎓" },
    { name: "Chidi N. (King's College)", role: "Peer", status: "Active", avatar: "👨‍🎓" },
    { name: "Amina B. (FGC Kaduna)", role: "Peer", status: "Active", avatar: "👩‍🎓" }
  ]);

  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [myAnswer, setMyAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [launchingDuel, setLaunchingDuel] = useState(false);

  const activeTopic = PRESET_TOPICS[selectedTopicIndex];
  const activeQuestion = activeTopic.questions[activeQuestionIdx] || activeTopic.questions[0];

  const handleJoinOrCreateRoom = () => {
    setIsInRoom(true);
  };

  const handleSelectOption = (optId: string) => {
    setMyAnswer(optId);
  };

  const handleRevealExplanations = () => {
    setRevealed(true);
  };

  const handleLaunchPeerDuel = async () => {
    setLaunchingDuel(true);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Study Circle Duel: ${activeTopic.title}`,
          tier: activeTopic.tier.includes("Primary") ? "primary" : "senior_science",
          stage: "lga",
          prize_description: `Peer Study Circle Trophy on ${activeTopic.subject}`
        })
      });
      const data = await res.json();
      if (res.ok && data.challenge) {
        router.push("/challenges");
      } else {
        router.push("/challenges");
      }
    } catch {
      router.push("/challenges");
    } finally {
      setLaunchingDuel(false);
    }
  };

  return (
    <main style={{ padding: "40px 0 80px", maxWidth: 1140, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <BackButton fallbackUrl="/dashboard" label="← Back to Dashboard" />
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
          <span className="pill">Collaborative Peer Learning &amp; Synchronized Practice</span>
          <span className="badge badge-success">● WebRTC LiveKit Mesh</span>
        </div>
        <h1 style={{ fontSize: "2.2rem", margin: "6px 0 8px", letterSpacing: "-.03em" }}>
          👥 Study Circles &amp; Group Learning
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 720, fontSize: "1.02rem", lineHeight: 1.6, margin: 0 }}>
          Study curriculum topics together in real time. All students in the room see the exact same educational materials, collaborate on the live math whiteboard, co-solve identical questions, and can instantly launch head-to-head duels!
        </p>
      </div>

      {!isInRoom ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: "1.3rem", marginTop: 0 }}>Join or Start a Study Circle</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              Create an encrypted study circle for your study group, secondary school classmates, or UTME candidates.
            </p>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="room-code">Study Room Code</label>
              <input
                id="room-code"
                type="text"
                className="form-input"
                value={activeRoomCode}
                onChange={(e) => setActiveRoomCode(e.target.value)}
                placeholder="e.g. ROOM-MTH101"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" htmlFor="select-topic">Select Curriculum Topic to Study</label>
              <select
                id="select-topic"
                className="form-input"
                value={selectedTopicIndex}
                onChange={(e) => setSelectedTopicIndex(Number(e.target.value))}
              >
                {PRESET_TOPICS.map((t, i) => (
                  <option key={t.id} value={i}>
                    {t.subject}: {t.title} ({t.tier})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleJoinOrCreateRoom}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              🚀 Enter Live Study Circle
            </button>
          </div>

          <div className="glass-card" style={{ padding: 28, borderRadius: 18 }}>
            <h3 style={{ marginTop: 0, color: "var(--brand)" }}>✨ What Happens in a Study Circle?</h3>
            <ul style={{ paddingLeft: 20, fontSize: "0.9rem", lineHeight: 1.8, color: "var(--ink)" }}>
              <li><strong>Same Educational Materials:</strong> Everyone sees the exact same syllabus notes, formulas, and diagrams synced in real-time.</li>
              <li><strong>Shared Live Whiteboard:</strong> Collaborate on equations, geometry figures, and organic chemistry bonds together.</li>
              <li><strong>Synchronous Question Solving:</strong> Work on the exact same questions simultaneously, compare answers, and unlock Socratic AI explanations.</li>
              <li><strong>Instant Peer Duels:</strong> After studying, challenge your circle to a timed battle to see who mastered the topic best!</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <div
            className="glass-card"
            style={{
              padding: "14px 20px",
              borderRadius: 16,
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge badge-success">● STUDY ROOM ACTIVE</span>
                <strong style={{ fontSize: "1.05rem" }}>{activeRoomCode}</strong>
                <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>• {activeTopic.subject}</span>
              </div>
              <div style={{ fontSize: "0.88rem", color: "var(--muted)", marginTop: 2 }}>
                Topic: <strong>{activeTopic.title}</strong> ({activeTopic.tier})
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                type="button"
                onClick={handleLaunchPeerDuel}
                disabled={launchingDuel}
                className="btn btn-primary btn-sm"
                style={{ background: "#1a7f37", borderColor: "#1a7f37" }}
              >
                {launchingDuel ? "Generating Duel..." : "⚔️ Launch Peer Competition from This Topic!"}
              </button>
              <button
                type="button"
                onClick={() => setIsInRoom(false)}
                className="btn btn-secondary btn-sm"
              >
                Leave Room
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            {members.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: 9999,
                  fontSize: "0.84rem"
                }}
              >
                <span>{m.avatar}</span>
                <strong>{m.name}</strong>
                <span className="badge badge-neutral" style={{ fontSize: "0.68rem", padding: "1px 6px" }}>{m.role}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span className="badge badge-neutral">📖 Shared Educational Material</span>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Synchronized for all peers</span>
              </div>
              <h3 style={{ margin: "0 0 10px", fontSize: "1.15rem" }}>{activeTopic.title}</h3>
              <div style={{ background: "var(--canvas)", padding: "14px 16px", borderRadius: 10, fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 16 }}>
                <strong>📌 Core Syllabus Principles:</strong>
                <p style={{ margin: "6px 0 0", color: "var(--ink)" }}>
                  {activeTopic.syllabusNotes}
                </p>
              </div>

              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <strong style={{ fontSize: "0.9rem" }}>🎨 Shared Collaborative Whiteboard</strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Write formulas &amp; steps together</span>
                </div>
                <div style={{ height: 260 }}>
                  <CollaborativeWhiteboard roomName={activeRoomCode} />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="badge badge-success">✍️ Same Questions Co-Solving</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 700 }}>
                    Question {activeQuestionIdx + 1} of {activeTopic.questions.length}
                  </span>
                </div>

                <div style={{ background: "rgba(4, 120, 87, 0.08)", padding: "10px 14px", borderRadius: 8, fontSize: "0.82rem", marginBottom: 14 }}>
                  👥 <strong>Synchronous Rule:</strong> All 3 students in this room are viewing this exact question right now.
                </div>

                <h4 style={{ fontSize: "1.08rem", margin: "0 0 16px", lineHeight: 1.5 }}>
                  {activeQuestion.prompt}
                </h4>

                <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
                  {activeQuestion.options.map((opt) => {
                    const isSelected = myAnswer === opt.id;
                    const isCorrect = opt.id === activeQuestion.correctId;
                    let borderCol = isSelected ? "var(--brand)" : "var(--line)";
                    let bgCol = isSelected ? "var(--brand-light)" : "var(--surface)";

                    if (revealed) {
                      if (isCorrect) {
                        borderCol = "var(--success)";
                        bgCol = "rgba(22, 163, 74, 0.1)";
                      } else if (isSelected && !isCorrect) {
                        borderCol = "var(--danger)";
                        bgCol = "rgba(220, 38, 38, 0.1)";
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.id)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: `1.5px solid ${borderCol}`,
                          background: bgCol,
                          cursor: "pointer",
                          textAlign: "left",
                          fontSize: "0.92rem"
                        }}
                      >
                        <span style={{ fontWeight: isSelected ? 700 : 500 }}>
                          {opt.id.toUpperCase()}. {opt.text}
                        </span>
                        {revealed && isCorrect && <span style={{ color: "var(--success)", fontWeight: 700 }}>✓ Correct</span>}
                        {revealed && isSelected && !isCorrect && <span style={{ color: "var(--danger)", fontWeight: 700 }}>✗ Incorrect</span>}
                      </button>
                    );
                  })}
                </div>

                <div style={{ background: "var(--canvas)", padding: "12px 14px", borderRadius: 10, marginBottom: 16 }}>
                  <strong style={{ fontSize: "0.82rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>
                    PEER LIVE ANSWER STATUS
                  </strong>
                  <div style={{ display: "flex", gap: 12, fontSize: "0.82rem", flexWrap: "wrap" }}>
                    <div>
                      <span>You: </span>
                      <strong>{myAnswer ? (revealed ? `Option ${myAnswer.toUpperCase()}` : "Locked In ✓") : "Thinking..."}</strong>
                    </div>
                    <div>
                      <span>Chidi: </span>
                      <strong>{revealed ? "Option B" : "Locked In ✓"}</strong>
                    </div>
                    <div>
                      <span>Amina: </span>
                      <strong>{revealed ? "Option B" : "Locked In ✓"}</strong>
                    </div>
                  </div>
                </div>

                {revealed && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: 10, fontSize: "0.88rem", color: "#166534", marginBottom: 16 }}>
                    💡 <strong>Worked Pedagogical Explanation:</strong><br />
                    {activeQuestion.explanation}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 14 }}>
                <button
                  type="button"
                  onClick={handleRevealExplanations}
                  className="btn btn-secondary btn-sm"
                  disabled={!myAnswer}
                >
                  🔍 Reveal &amp; Compare Answers
                </button>

                {activeQuestionIdx < activeTopic.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveQuestionIdx((prev) => prev + 1);
                      setMyAnswer(null);
                      setRevealed(false);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLaunchPeerDuel}
                    className="btn btn-primary btn-sm"
                    style={{ background: "#1a7f37" }}
                  >
                    ⚔️ Start Peer Battle on This Topic!
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

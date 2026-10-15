"use client";

import { BackButton } from "@/components/navigation/back-button";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Subject, CurriculumTopic } from "@/lib/curriculum/types";

export default function CurriculumPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [topics, setTopics] = useState<Array<CurriculumTopic & { questionCount: number }>>([]);
  const [activeCategory, setActiveCategory] = useState<"all" | "science" | "arts" | "commercial" | "junior" | "primary">("all");
  const [userRole, setUserRole] = useState<"student" | "parent" | "teacher">("student");

  useEffect(() => {
    fetch("/api/learner/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user?.role) {
          setUserRole(data.user.role);
        }
      })
      .catch(() => {});

    async function loadData() {
      try {
        const res = await fetch("/api/curriculum");
        const data = await res.json();
        setSubjects(data.subjects || []);
        if (data.subjects?.length > 0) {
          const firstSubj = data.subjects[0].id;
          setSelectedSubjectId(firstSubj);
          fetchTopics(firstSubj);
        }
      } catch (e: unknown) {
        console.error("Failed to load curriculum:", e);
      }
    }
    loadData();
  }, []);

  const fetchTopics = async (subjId: string) => {
    try {
      const res = await fetch(`/api/curriculum?subject_id=${subjId}`);
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (e: unknown) {
      console.error("Failed to fetch topics:", e);
    }
  };

  const handleSelectSubject = (subjId: string) => {
    setSelectedSubjectId(subjId);
    fetchTopics(subjId);
  };

  const filteredSubjects = subjects.filter((s) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "science") return s.track === "science" || s.slug.includes("math") || s.slug.includes("eng");
    if (activeCategory === "arts") return s.track === "arts" || s.slug.includes("eng") || s.slug.includes("math");
    if (activeCategory === "commercial") return s.track === "commercial" || s.slug.includes("math") || s.slug.includes("eng");
    if (activeCategory === "junior") return s.education_levels.includes("junior_secondary");
    if (activeCategory === "primary") return s.education_levels.includes("primary");
    return true;
  });

  const isGuardian = userRole === "parent";
  const isTeacher = userRole === "teacher";

  return (
    <main style={{ padding: "40px 0 80px" }}>
      <div style={{ marginBottom: 20 }}>
        <BackButton
          fallbackUrl={isGuardian ? "/guardian" : isTeacher ? "/teacher" : "/dashboard"}
          label={isGuardian ? "← Back to Parent Portal" : isTeacher ? "← Back to Teacher Cockpit" : "← Back to Dashboard"}
        />
      </div>

      <div style={{ marginBottom: 32 }}>
        <span className="pill">NERDC National Syllabus Standards</span>
        <h1 style={{ fontSize: "2.3rem", margin: "12px 0 8px", letterSpacing: "-.03em" }}>
          Curriculum &amp; Syllabus Explorer
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 680, fontSize: "1.05rem", lineHeight: 1.6 }}>
          {isGuardian
            ? "Inspect official curriculum topics taught to your children across Science, Arts, and Commercial tracks. Use Socratic Parent Explainer to support their studies without jargon."
            : isTeacher
            ? "Official NERDC, WAEC, and JAMB syllabus structures. Review learning objectives and dispatch curriculum-aligned CBT drills directly to your student cohorts."
            : "Explore structured curriculum topics across Science, Arts, and Commercial pathways, mapped to official NERDC, JAMB UTME, and WAEC WASSCE examination standards."}
        </p>
      </div>

      {/* Pathway Category Filter Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { key: "all", label: "🌐 All Subjects" },
          { key: "science", label: "🔬 Science & STEM" },
          { key: "arts", label: "📚 Arts & Humanities" },
          { key: "commercial", label: "💼 Commercial & Business" },
          { key: "junior", label: "🎒 Junior Secondary (BECE)" },
          { key: "primary", label: "🌱 Primary (Common Entrance)" }
        ].map((tab) => {
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveCategory(tab.key as any);
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                border: isActive ? "2px solid #059669" : "1px solid #e2e8f0",
                background: isActive ? "#ecfdf5" : "#ffffff",
                color: isActive ? "#065f46" : "#475569"
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Subject Filter Pills */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
        {filteredSubjects.map((s) => {
          const isSelected = s.id === selectedSubjectId;
          return (
            <button
              key={s.id}
              onClick={() => handleSelectSubject(s.id)}
              className={isSelected ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      {/* Topics Display Table */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: "1.3rem", margin: 0 }}>
            {subjects.find((s) => s.id === selectedSubjectId)?.name || "Subject Topics"}
          </h2>
          <span className="badge badge-success">Official Verified Syllabus</span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Topic Title</th>
                <th>Curriculum Description</th>
                <th>Verified Items</th>
                <th>{isGuardian ? "Parent Guidance" : isTeacher ? "Cohort Deployment" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {topics.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: 20 }}>
                    Select a subject from the pills above to view official syllabus topics.
                  </td>
                </tr>
              ) : (
                topics.map((t) => (
                  <tr key={t.id}>
                    <td><code>{t.code}</code></td>
                    <td><strong>{t.title}</strong></td>
                    <td style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{t.description}</td>
                    <td>
                      <span className="badge badge-neutral">{t.questionCount} Questions</span>
                    </td>
                    <td>
                      {isGuardian ? (
                        <Link
                          href={`/tutor?subject=${encodeURIComponent(subjects.find((s) => s.id === selectedSubjectId)?.name || "General Mathematics")}&topic=${encodeURIComponent(t.title)}`}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "0.78rem" }}
                        >
                          🍲 Explain at Home →
                        </Link>
                      ) : isTeacher ? (
                        <Link
                          href="/teacher"
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: "0.78rem" }}
                        >
                          🚀 Assign to Cohort →
                        </Link>
                      ) : (
                        <Link href="/assessments" className="btn btn-outline btn-sm">
                          Practise Topic →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

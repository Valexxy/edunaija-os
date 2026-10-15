import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { LearningAnalyticsDashboard } from "@/components/analytics/learning-analytics-dashboard";
import { MobileBottomDock } from "@/components/navigation/mobile-dock";

describe("Academic Learning Analytics Dashboard & Mobile Glass Suite", () => {
  it("renders the comprehensive analytics dashboard with mastery gauge and exam predictions", () => {
    const html = renderToString(
      React.createElement(LearningAnalyticsDashboard, {
        userName: "Ukah Valentine",
        classLabel: "SSS 3 Science",
        examGoal: "JAMB UTME 2026",
        stateName: "Anambra",
        studyMinutes: 475,
        streakDays: 7,
        totalXp: 3420,
        learnerCompetencies: [
          { name: "General Mathematics", code: "MTH", masteryPercent: 82, accuracyPercent: 86, questionsAttempted: 148, status: "Proficient" as const, strongTopic: "Algebra", weakTopic: "Trigonometry" },
          { name: "English Language", code: "ENG", masteryPercent: 78, accuracyPercent: 81, questionsAttempted: 132, status: "Proficient" as const, strongTopic: "Lexis", weakTopic: "Oral English" },
          { name: "Physics", code: "PHY", masteryPercent: 76, accuracyPercent: 79, questionsAttempted: 115, status: "Proficient" as const, strongTopic: "Kinematics", weakTopic: "Electromagnetism" },
          { name: "Chemistry", code: "CHM", masteryPercent: 74, accuracyPercent: 75, questionsAttempted: 98, status: "Developing" as const, strongTopic: "Periodic Table", weakTopic: "Organic Chemistry" },
          { name: "Biology", code: "BIO", masteryPercent: 88, accuracyPercent: 91, questionsAttempted: 120, status: "Secure" as const, strongTopic: "Cell Biology", weakTopic: "Ecology" }
        ]
      })
    );

    const cleanHtml = html.replace(/<!-- -->/g, "");

    // Verify key sections and titles
    expect(cleanHtml).toContain("Academic Analytics &amp; Mastery Engine");
    expect(cleanHtml).toContain("Ukah Valentine");
    expect(cleanHtml).toContain("JAMB UTME 2026");
    expect(cleanHtml).toContain("Anambra");

    // Verify mastery metrics
    expect(cleanHtml).toContain("Curriculum Mastery");
    expect(cleanHtml).toContain("78%");
    expect(cleanHtml).toContain("Secure");
    expect(cleanHtml).toContain("Proficient");

    // Verify predicted UTME benchmark and WAEC grade
    expect(cleanHtml).toContain("Projected UTME Score");
    expect(cleanHtml).toMatch(/\d{3}[\s\S]*?\/ 400/);
    expect(cleanHtml).toContain("Distinctions");

    // Verify weekly velocity & flame streak
    expect(cleanHtml).toContain("Weekly Study Velocity");
    expect(cleanHtml).toContain("Retention Streak");
    expect(cleanHtml).toContain("7 Days");
    expect(cleanHtml).toContain("Scholar");
    expect(cleanHtml).toContain("3,420");

    // Verify subjects
    expect(html).toContain("General Mathematics");
    expect(html).toContain("English Language");
    expect(html).toContain("Physics");
    expect(html).toContain("Chemistry");
    expect(html).toContain("Biology");
  });

  it("strictly provides 100% dynamic track-aware subjects and predictions for Commercial scholars", () => {
    const commercialCompetencies = [
      { name: "Financial Accounting", code: "ACC", masteryPercent: 84, accuracyPercent: 88, questionsAttempted: 130, status: "Secure" as const, strongTopic: "Double-Entry Bookkeeping", weakTopic: "Suspense Accounts" },
      { name: "Commerce", code: "CMM", masteryPercent: 80, accuracyPercent: 82, questionsAttempted: 110, status: "Proficient" as const, strongTopic: "Home Trade Channels", weakTopic: "Foreign Trade Customs" },
      { name: "Economics", code: "ECN", masteryPercent: 78, accuracyPercent: 80, questionsAttempted: 125, status: "Proficient" as const, strongTopic: "Theory of Demand", weakTopic: "National Income GDP" },
      { name: "General Mathematics", code: "MTH", masteryPercent: 82, accuracyPercent: 86, questionsAttempted: 140, status: "Proficient" as const, strongTopic: "Algebra", weakTopic: "Trigonometry" },
      { name: "English Language", code: "ENG", masteryPercent: 80, accuracyPercent: 82, questionsAttempted: 130, status: "Proficient" as const, strongTopic: "Lexis", weakTopic: "Oral English" }
    ];

    const html = renderToString(
      React.createElement(LearningAnalyticsDashboard, {
        userName: "Babajide Sanwo",
        classLabel: "SSS 3 Commercial",
        examGoal: "JAMB UTME 2026 (Commercial)",
        stateName: "Ogun",
        learnerCompetencies: commercialCompetencies
      })
    );

    const cleanHtml = html.replace(/<!-- -->/g, "");

    // Must display Commercial subjects
    expect(cleanHtml).toContain("Financial Accounting");
    expect(cleanHtml).toContain("Commerce");
    expect(cleanHtml).toContain("Economics");
    expect(cleanHtml).toContain("Babajide Sanwo");
    expect(cleanHtml).toContain("SSS 3 Commercial");

    // Must have zero Science leaks in subject predictions
    expect(cleanHtml).not.toContain("Physics: <strong>76 / 100</strong>");
    expect(cleanHtml).not.toContain("Chemistry: <strong>82 / 100</strong>");
  });

  it("renders mobile bottom glass dock with key academic navigation tabs", () => {
    const html = renderToString(React.createElement(MobileBottomDock));

    expect(html).toContain("mobile-bottom-dock");
    expect(html).toContain("Hub");
    expect(html).toContain("CBT Tests");
    expect(html).toContain("AI Tutor");
    expect(html).toContain("Analytics");
    expect(html).toContain("Challenges");
  });

  it("ensures zero hardcoded white background overrides that wash out dark mode text", () => {
    const html = renderToString(
      React.createElement(LearningAnalyticsDashboard, {
        userName: "Scholar",
        classLabel: "SSS 3",
        examGoal: "JAMB UTME 2026",
        stateName: "Anambra"
      })
    );

    // Ensure all cards use CSS variables or rgba glass surfaces, never solid #ffffff
    expect(html).not.toContain('background:#ffffff');
    expect(html).not.toContain('background: #ffffff');
    expect(html).not.toContain('background-color:#ffffff');
    expect(html).not.toContain('background-color: #ffffff');
  });

  it("wires dynamic streak, XP, and mastery data from learner profile props", () => {
    const html = renderToString(
      React.createElement(LearningAnalyticsDashboard, {
        userName: "Ukah Valentine",
        classLabel: "SSS 3 Science",
        examGoal: "JAMB UTME 2026",
        stateName: "Delta",
        streakDays: 14,
        totalXp: 5400,
        studyMinutes: 620,
        masteryData: {
          "top-math-quad-01": { attempts: 20, correct: 18, score: 90 },
          "top-phy-mech-01": { attempts: 15, correct: 14, score: 93.3 }
        }
      })
    );

    const cleanHtml = html.replace(/<!-- -->/g, "");
    expect(cleanHtml).toContain("14 Days");
    expect(cleanHtml).toContain("5,400");
    expect(cleanHtml).toContain("10.3"); // 620 / 60
    expect(cleanHtml).toContain("Delta");
  });
});

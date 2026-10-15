import { describe, expect, it } from "vitest";
import {
  getProvisionedAssessments,
  resolveAssessmentById,
  resolveQuestionIdsForAssessment
} from "@/lib/assessment/provisioning";
import { SEED_QUESTIONS } from "@/lib/curriculum/seed-data";

describe("Dynamic Assessment Provisioning & Item Bank Engine", () => {
  it("provisions SSS 3 / JAMB UTME 2026 tracks for Senior Secondary scholars", () => {
    const profile = {
      education_level: "senior_secondary",
      class_label: "SSS 3 Science",
      exam_goal: "JAMB UTME 2026",
      state_name: "Anambra",
      preferred_language: "en"
    };

    const provisioned = getProvisionedAssessments(profile);
    expect(provisioned.length).toBeGreaterThanOrEqual(5);

    // 1. Diagnostic Benchmark
    const diagnostic = provisioned.find((a) => a.category === "diagnostic");
    expect(diagnostic).toBeDefined();
    expect(diagnostic?.title).toContain("JAMB UTME 2026");
    expect(diagnostic?.class_target).toBe("SSS 3 Science");
    expect(diagnostic?.time_limit_seconds).toBe(600);

    // 2. Sprints
    const sprints = provisioned.filter((a) => a.category === "sprint");
    expect(sprints.length).toBeGreaterThanOrEqual(4);
    expect(sprints.some((s) => s.title.includes("Quadratic"))).toBe(true);
    expect(sprints.some((s) => s.title.includes("Trigonometry"))).toBe(true);

    // 3. State Qualifier
    const qualifier = provisioned.find((a) => a.category === "challenge");
    expect(qualifier).toBeDefined();
    expect(qualifier?.title).toContain("Anambra State STEM League Qualifier");
    expect(qualifier?.state_target).toBe("Anambra");
  });

  it("provisions Arts & Humanities tracks (Literature, Government, CRS) for SSS Arts scholars", () => {
    const profile = {
      education_level: "senior_secondary",
      class_label: "SSS 3 Arts",
      exam_goal: "JAMB UTME 2026",
      state_name: "Enugu"
    };

    const provisioned = getProvisionedAssessments(profile);
    const diagnostic = provisioned.find((a) => a.category === "diagnostic");
    expect(diagnostic).toBeDefined();
    expect(diagnostic?.title).toContain("Arts & Humanities Benchmark");

    const sprints = provisioned.filter((a) => a.category === "sprint");
    expect(sprints.some((s) => s.title.includes("Literature"))).toBe(true);
    expect(sprints.some((s) => s.title.includes("Government"))).toBe(true);
    expect(sprints.some((s) => s.title.includes("CRS"))).toBe(true);
  });

  it("provisions Commercial & Business tracks (Accounting, Commerce, Economics) for SSS Commercial scholars", () => {
    const profile = {
      education_level: "senior_secondary",
      class_label: "SSS 2 Commercial",
      exam_goal: "WAEC WASSCE 2026",
      state_name: "Lagos"
    };

    const provisioned = getProvisionedAssessments(profile);
    const diagnostic = provisioned.find((a) => a.category === "diagnostic");
    expect(diagnostic).toBeDefined();
    expect(diagnostic?.title).toContain("Commercial & Business Benchmark");

    const sprints = provisioned.filter((a) => a.category === "sprint");
    expect(sprints.some((s) => s.title.includes("Accounting"))).toBe(true);
    expect(sprints.some((s) => s.title.includes("Commerce"))).toBe(true);
    expect(sprints.some((s) => s.title.includes("Economics"))).toBe(true);
  });

  it("provisions BECE 2026 tracks for Junior Secondary scholars", () => {
    const profile = {
      education_level: "junior_secondary",
      class_label: "JSS 3",
      exam_goal: "BECE 2026",
      state_name: "Lagos",
      preferred_language: "pcm"
    };

    const provisioned = getProvisionedAssessments(profile);
    const diagnostic = provisioned.find((a) => a.category === "diagnostic");
    expect(diagnostic).toBeDefined();
    expect(diagnostic?.title).toContain("BECE 2026");
    expect(diagnostic?.class_target).toBe("JSS 3");

    const sprints = provisioned.filter((a) => a.category === "sprint");
    expect(sprints.some((s) => s.title.includes("Linear Equations"))).toBe(true);
    expect(sprints.some((s) => s.title.includes("English Studies"))).toBe(true);
  });

  it("provisions Common Entrance NCEE tracks for Primary scholars", () => {
    const profile = {
      education_level: "primary",
      class_label: "Primary 6",
      exam_goal: "National Common Entrance Examination (NCEE)",
      state_name: "Kano"
    };

    const provisioned = getProvisionedAssessments(profile);
    const diagnostic = provisioned.find((a) => a.category === "diagnostic");
    expect(diagnostic).toBeDefined();
    expect(diagnostic?.title).toContain("Quantitative & Verbal");
    expect(diagnostic?.class_target).toBe("Primary 6");
  });

  it("ensures every provisioned assessment maps to valid existing questions", () => {
    const allKnownQuestionIds = new Set(SEED_QUESTIONS.map((q) => q.id));

    const sssProvisioned = getProvisionedAssessments({ education_level: "senior_secondary", class_label: "SSS 3" });
    const jssProvisioned = getProvisionedAssessments({ education_level: "junior_secondary", class_label: "JSS 3" });
    const priProvisioned = getProvisionedAssessments({ education_level: "primary", class_label: "Primary 6" });

    const all = [...sssProvisioned, ...jssProvisioned, ...priProvisioned];

    for (const asm of all) {
      const qIds = resolveQuestionIdsForAssessment(asm.id);
      expect(qIds.length).toBeGreaterThan(0);
      for (const qId of qIds) {
        expect(allKnownQuestionIds.has(qId)).toBe(true);
      }

      const resolved = resolveAssessmentById(asm.id, {
        education_level: asm.education_level,
        class_label: asm.class_target
      });
      expect(resolved).toBeDefined();
      expect(resolved?.id).toBe(asm.id);
    }
  });

  it("resolves primary assessments like asm-sprint-pri-math universally across all user tiers", () => {
    // 1. Without any profile passed
    const resolvedNoProfile = resolveAssessmentById("asm-sprint-pri-math");
    expect(resolvedNoProfile).toBeDefined();
    expect(resolvedNoProfile?.id).toBe("asm-sprint-pri-math");
    expect(resolvedNoProfile?.education_level).toBe("primary");

    // 2. When an SSS student accesses a Primary assessment link
    const sssProfile = {
      education_level: "senior_secondary",
      class_label: "SSS 3 Science",
      exam_goal: "JAMB UTME 2026"
    };
    const resolvedFromSSS = resolveAssessmentById("asm-sprint-pri-math", sssProfile);
    expect(resolvedFromSSS).toBeDefined();
    expect(resolvedFromSSS?.id).toBe("asm-sprint-pri-math");

    // Verify question IDs resolve correctly
    const qIds = resolveQuestionIdsForAssessment("asm-sprint-pri-math");
    expect(qIds.length).toBeGreaterThanOrEqual(2);
    expect(qIds).toContain("qst-pri-math-01");
  });

  it("strictly shields Primary 4 pupils from Senior Secondary (SSS) Physics mechanics questions", () => {
    // Case 1: Primary pupil accessing WAEC SSS assessment route
    const primaryProfile = {
      education_level: "primary",
      class_label: "Primary 4",
      exam_goal: "Primary NERDC Curriculum"
    };

    const resolvedAssessment = resolveAssessmentById("asm-diagnostic-waec-sss", primaryProfile);
    expect(resolvedAssessment).toBeDefined();
    expect(resolvedAssessment?.education_level).toBe("primary");

    const questions = resolveQuestionIdsForAssessment("asm-diagnostic-waec-sss", primaryProfile);
    expect(questions).toEqual([
      "qst-pri-math-01",
      "qst-pri-math-02",
      "qst-pri-eng-01",
      "qst-pri-eng-02",
      "qst-pri-sci-01",
      "qst-pri-sci-02"
    ]);
    // SSS Physics Mechanics (50kg stairs climbing power calculation) must NEVER be included
    expect(questions).not.toContain("qst-phy-02");
    expect(questions).not.toContain("qst-chem-02");

    // Case 2: Desynchronized profile where education_level was senior_secondary but class_label is Primary 4
    const desyncedProfile = {
      education_level: "senior_secondary",
      class_label: "Primary 4",
      exam_goal: "Primary NERDC Curriculum"
    };
    const guardedQuestions = resolveQuestionIdsForAssessment("asm-diagnostic-waec-sss", desyncedProfile);
    expect(guardedQuestions).toEqual([
      "qst-pri-math-01",
      "qst-pri-math-02",
      "qst-pri-eng-01",
      "qst-pri-eng-02",
      "qst-pri-sci-01",
      "qst-pri-sci-02"
    ]);
    expect(guardedQuestions).not.toContain("qst-phy-02");
  });
});


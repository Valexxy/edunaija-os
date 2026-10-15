import { describe, it, expect } from "vitest";
import {
  recommendSubjectForTopic,
  getStatutorySubjectsForTier
} from "@/lib/curriculum/subject-recommender";

describe("Statutory Class-to-Subject Matrix & Intelligent Topic Recommender", () => {
  describe("1. Intelligent Topic Classifier & Anti-Mismatch Engine", () => {
    it("accurately classifies 'Theory of Demand, Supply & Market Equilibrium' to Economics, never General Mathematics", () => {
      const rec = recommendSubjectForTopic("Theory of Demand, Supply & Market Equilibrium");
      expect(rec.subjectName).toBe("Economics");
      expect(rec.subjectId).toBe("sub-econ-17");
      expect(rec.tier).toBe("senior_secondary");
      expect(rec.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("accurately classifies 'Double-Entry Bookkeeping & Ledger Accounts' to Financial Accounting", () => {
      const rec = recommendSubjectForTopic("Double-Entry Bookkeeping & Ledger Accounts");
      expect(rec.subjectName).toBe("Financial Accounting");
      expect(rec.subjectId).toBe("sub-acc-16");
    });

    it("accurately classifies 'Quadratic Equations & Parabolic Functions' to General Mathematics", () => {
      const rec = recommendSubjectForTopic("Quadratic Equations & Parabolic Functions");
      expect(rec.subjectName).toBe("General Mathematics");
      expect(rec.subjectId).toBe("sub-math-01");
    });

    it("accurately classifies 'Photosynthesis & Plant Nutrition' to Biology", () => {
      const rec = recommendSubjectForTopic("Photosynthesis & Plant Nutrition");
      expect(rec.subjectName).toBe("Biology");
      expect(rec.subjectId).toBe("sub-bio-05");
    });

    it("accurately classifies 'Separation of Powers, Rule of Law & Constitution' to Government", () => {
      const rec = recommendSubjectForTopic("Separation of Powers, Rule of Law & Constitution");
      expect(rec.subjectName).toBe("Government");
      expect(rec.subjectId).toBe("sub-gov-13");
    });

    it("accurately identifies Commercial trade and warehousing queries to Commerce", () => {
      const rec = recommendSubjectForTopic("Aids to trade, retail and warehousing");
      expect(rec.subjectName).toBe("Commerce");
      expect(rec.subjectId).toBe("sub-comm-15");
    });
  });

  describe("2. Statutory Tier & Track Subject Isolation", () => {
    it("returns strictly Primary School subjects for primary tier", () => {
      const subjects = getStatutorySubjectsForTier("primary");
      expect(subjects.length).toBeGreaterThan(0);
      expect(subjects.every((s) => s.tier === "primary")).toBe(true);
      expect(subjects.some((s) => s.name.includes("Primary"))).toBe(true);
      expect(subjects.some((s) => s.name === "Financial Accounting")).toBe(false);
      expect(subjects.some((s) => s.name === "Physics")).toBe(false);
    });

    it("returns strictly Junior Secondary (JSS / BECE) subjects for junior_secondary tier", () => {
      const subjects = getStatutorySubjectsForTier("junior_secondary");
      expect(subjects.length).toBeGreaterThan(0);
      expect(subjects.every((s) => s.tier === "junior_secondary")).toBe(true);
      expect(subjects.some((s) => s.name.includes("(JSS)"))).toBe(true);
      expect(subjects.some((s) => s.name === "Economics")).toBe(false);
    });

    it("returns complete Senior Secondary Commercial track subjects", () => {
      const subjects = getStatutorySubjectsForTier("senior_secondary", "commercial");
      const names = subjects.map((s) => s.name);
      expect(names).toContain("Economics");
      expect(names).toContain("Commerce");
      expect(names).toContain("Financial Accounting");
      expect(names).toContain("General Mathematics");
      expect(names).toContain("English Language");
      expect(names).not.toContain("Physics");
    });

    it("returns complete Senior Secondary Science track subjects", () => {
      const subjects = getStatutorySubjectsForTier("senior_secondary", "science");
      const names = subjects.map((s) => s.name);
      expect(names).toContain("Physics");
      expect(names).toContain("Chemistry");
      expect(names).toContain("Biology");
      expect(names).toContain("General Mathematics");
      expect(names).toContain("English Language");
      expect(names).not.toContain("Financial Accounting");
    });
  });
});

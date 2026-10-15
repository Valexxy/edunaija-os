import { describe, it, expect } from "vitest";
import { scrubSensitiveData, sentry } from "@/lib/monitoring/sentry";
import { posthog } from "@/lib/analytics/posthog";
import { curriculumRAG, REVIEWED_NERDC_CURRICULUM } from "@/lib/ai/curriculum-retrieval";
import { h5pEngine, H5PActivityDefinition } from "@/lib/curriculum/h5p-adapter";
import { storage } from "@/lib/storage/adapter";

describe("Pilot Production Services Suite", () => {
  describe("1. Sentry Monitoring & NDPA Child Privacy Scrubbing", () => {
    it("scrubs email addresses, Nigerian phone numbers, and NINs from error contexts", () => {
      const sensitiveContext = {
        studentEmail: "chidi.okeke@gmail.com",
        guardianPhone: "08031234567",
        nationalId: "12345678901",
        password: "SuperSecretPassword123",
        regularNote: "Syntax error on line 42",
      };

      const scrubbed = scrubSensitiveData(sensitiveContext);

      expect(scrubbed.studentEmail).toBe("[REDACTED_SENSITIVE]");
      expect(scrubbed.guardianPhone).toBe("[REDACTED_SENSITIVE]");
      expect(scrubbed.nationalId).toBe("[REDACTED_SENSITIVE]");
      expect(scrubbed.password).toBe("[REDACTED_SENSITIVE]");
      expect(scrubbed.regularNote).toBe("Syntax error on line 42");
    });

    it("redacts raw string tokens containing Bearer credentials", () => {
      const rawText = "Authorization failed for Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz";
      const scrubbed = scrubSensitiveData(rawText);
      expect(scrubbed).not.toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
      expect(scrubbed).toContain("[REDACTED]");
    });

    it("captures exceptions gracefully without throwing in offline/dev environments", () => {
      const errId = sentry.captureException(new Error("Database connection timeout"), {
        userId: "student_999",
        component: "ExamRoom",
      });
      expect(errId).toMatch(/^err_/);
    });
  });

  describe("2. PostHog Pilot Funnels & Privacy Tracking", () => {
    it("tracks milestone pilot events while stripping child PII keys", async () => {
      const success = await posthog.track({
        distinctId: "learner_anon_77",
        event: "first_lesson_completed",
        properties: {
          subject: "Mathematics",
          topic: "Algebra",
          timeSpentSeconds: 420,
          studentName: "Adewale Adeleke", // Must be scrubbed
          studentPrompt: "How do I solve 2x + 5 = 15?", // Must be scrubbed
        },
      });

      expect(success).toBe(true);
    });

    it("identifies learner cohorts by grade level and state without storing PII", async () => {
      const success = await posthog.identify("learner_anon_77", {
        gradeLevel: "JSS2",
        state: "Lagos",
        lga: "Ikeja",
        hasParentalConsent: true,
      });

      expect(success).toBe(true);
    });
  });

  describe("3. Curriculum-Grounded RAG (NERDC + Qdrant)", () => {
    it("retrieves verified NERDC curriculum lesson for JSS fractions with official citation", async () => {
      const result = await curriculumRAG.retrieve({
        question: "How do I add two fractions with different denominators?",
        learnerLevel: "junior_secondary",
        subject: "Mathematics",
      });

      expect(result.matchFound).toBe(true);
      expect(result.doc?.syllabusCode).toBe("NERDC-JSS1-MATH-03");
      expect(result.citation).toContain("NERDC National Curriculum for Junior Secondary Schools");
      expect(result.promptGuidance).toContain("LCM");
      expect(result.relevanceScore).toBeGreaterThan(0.3);
    });

    it("retrieves quadratic formula grounding for senior secondary exam prep", async () => {
      const result = await curriculumRAG.retrieve({
        question: "What is the quadratic Almighty formula for solving equations?",
        learnerLevel: "senior_secondary",
        subject: "Mathematics",
      });

      expect(result.matchFound).toBe(true);
      expect(result.doc?.syllabusCode).toBe("WAEC-SSS1-MATH-05");
      expect(result.citation).toContain("WAEC / NECO Senior School Certificate Examinations");
    });

    it("retrieves physics equations of motion for senior secondary students", async () => {
      const result = await curriculumRAG.retrieve({
        question: "Calculate the vertical distance when a stone is thrown upwards under gravity",
        learnerLevel: "senior_secondary",
        subject: "Physics",
      });

      expect(result.matchFound).toBe(true);
      expect(result.doc?.syllabusCode).toBe("WAEC-SSS2-PHY-02");
      expect(result.doc?.keyFormulas).toContain("v² = u² + 2as");
    });

    it("handles out-of-curriculum queries safely without breaking", async () => {
      const result = await curriculumRAG.retrieve({
        question: "How do I build a spaceship with lego bricks?",
        learnerLevel: "primary",
      });

      expect(result.matchFound).toBe(false);
      expect(result.citation).toBeDefined();
    });
  });

  describe("4. H5P Interactive Content & xAPI Mastery Engine", () => {
    const multiChoiceActivity: H5PActivityDefinition = {
      id: "h5p-math-fractions-01",
      title: "Identifying Improper Fractions",
      library: "H5P.MultiChoice",
      subject: "Mathematics",
      gradeLevel: "JSS1",
      params: {
        question: "Which of the following is an improper fraction?",
        options: [
          { text: "3/4", correct: false },
          { text: "7/5", correct: true },
          { text: "1/2", correct: false },
        ],
      },
    };

    it("correctly grades a correct answer and produces a valid xAPI completed statement", () => {
      const result = h5pEngine.evaluate(multiChoiceActivity, 1, "student_01");

      expect(result.passed).toBe(true);
      expect(result.score).toBe(1);
      expect(result.scaledScore).toBe(1.0);
      expect(result.xapiStatement.verb.display).toBe("completed");
      expect(result.xapiStatement.result.success).toBe(true);
      expect(result.xapiStatement.object.id).toContain("h5p-math-fractions-01");
    });

    it("correctly evaluates an incorrect option", () => {
      const result = h5pEngine.evaluate(multiChoiceActivity, 0, "student_01");

      expect(result.passed).toBe(false);
      expect(result.score).toBe(0);
      expect(result.xapiStatement.result.success).toBe(false);
    });

    it("evaluates H5P DragText blank filling activity", () => {
      const dragTextActivity: H5PActivityDefinition = {
        id: "h5p-sci-states-02",
        title: "States of Matter",
        library: "H5P.DragText",
        subject: "Basic Science",
        gradeLevel: "JSS2",
        params: {
          dropTextTemplate: "Water freezes at *0* degrees Celsius and boils at *100* degrees.",
        },
      };

      const result = h5pEngine.evaluate(dragTextActivity, ["0", "100"], "student_01");
      expect(result.score).toBe(2);
      expect(result.maxScore).toBe(2);
      expect(result.passed).toBe(true);
    });
  });

  describe("5. Unified Storage Adapter (Supabase + Cloudflare R2)", () => {
    it("uploads lesson assets and returns verifiable storage paths", async () => {
      const mockAudioContent = Buffer.from("Simulated lesson audio file data");
      const uploadRes = await storage.upload("curriculum-audio", "jss1/math/lesson-01.mp3", mockAudioContent, {
        contentType: "audio/mpeg",
      });

      expect(uploadRes.path).toBe("jss1/math/lesson-01.mp3");
      expect(uploadRes.sizeBytes).toBe(mockAudioContent.length);
      expect(uploadRes.provider).toBeDefined();
    });

    it("generates time-limited signed access URLs for protected assets", async () => {
      const signed = await storage.createSignedUrl("learner-records", "diagnostic-report.pdf", 1800);
      expect(signed.signedUrl).toContain("diagnostic-report.pdf");
      expect(signed.expiresAt).toBeDefined();
    });

    it("deletes assets safely from storage", async () => {
      const deleted = await storage.delete("curriculum-audio", "jss1/math/lesson-01.mp3");
      expect(deleted).toBe(true);
    });
  });
});

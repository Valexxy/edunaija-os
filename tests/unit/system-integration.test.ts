import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { reportCriticalSystemError, withEnterpriseErrorHandler } from "@/lib/monitoring/enterprise-error-handler";
import { getDispatchedEmailLog, clearDispatchedEmailLog } from "@/lib/email/enterprise-mailer";
import { getLearnerProfile } from "@/lib/auth/session";

describe("High-Level System Integration & Zero-Hardcoding Architecture Suite", () => {
  beforeEach(() => {
    clearDispatchedEmailLog();
  });

  describe("1. Enterprise Critical Error Alerting Engine", () => {
    it("automatically dispatches emergency email alerts to admin with sanitized stack trace upon critical error", async () => {
      const simulatedError = new Error("Database connection pool exhausted: Connection timeout after 5000ms");
      simulatedError.stack = "Error: Database connection pool exhausted\n    at Pool.connect (src/lib/supabase/pool.ts:42:15)\n    User email: test_admin@example.com, BVN: 22334455667";

      const incidentId = await reportCriticalSystemError(simulatedError, {
        componentOrRoute: "POST /api/assessments/sync",
        severity: "CRITICAL",
        userRole: "student",
        userId: "usr-student-99"
      });

      expect(incidentId).toMatch(/^INC-[A-Z0-9]+-[A-Z0-9]+$/);

      const logs = getDispatchedEmailLog();
      expect(logs.length).toBeGreaterThanOrEqual(1);

      const alertLog = logs.find((l) => l.category === "system_critical_error");
      expect(alertLog).toBeDefined();
      expect(alertLog?.subject).toContain("[SYSTEM CRITICAL]");
      expect(alertLog?.subject).toContain(incidentId);
      expect(alertLog?.to).toContain("alerts@learnnaija.ng");

      // Verify NDPA/PII scrubbing on stack trace
      expect(alertLog?.snippet).not.toContain("22334455667");
    });

    it("enterprise error handler wrapper catches unhandled errors and returns structured JSON with incidentId", async () => {
      const crashingHandler = async () => {
        throw new Error("Simulated catastrophic crash in assessment calculation");
      };

      const wrapped = withEnterpriseErrorHandler(crashingHandler, "GET /api/test/crash");
      const dummyReq = new Request("http://localhost:3000/api/test/crash");

      const response = await wrapped(dummyReq, undefined);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toContain("The administrative monitoring team has been notified");
      expect(data.incidentId).toMatch(/^INC-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(data.route).toBe("GET /api/test/crash");

      const logs = getDispatchedEmailLog();
      const alertLog = logs.find((l) => l.category === "system_critical_error");
      expect(alertLog).toBeDefined();
      expect(alertLog?.subject).toContain(data.incidentId);
      expect(alertLog?.subject).toContain("Simulated catastrophic crash");
    });
  });

  describe("2. Zero Hardcoding & PII Audit Across Production Code", () => {
    function walkDir(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
          if (!["node_modules", ".next", ".git"].includes(file)) {
            results = results.concat(walkDir(fullPath));
          }
        } else if (/\.(tsx|ts)$/.test(file)) {
          results.push(fullPath);
        }
      }
      return results;
    }

    it("strictly verifies zero instances of hardcoded personal email azunnaukah@gmail.com across src/", () => {
      const srcFiles = walkDir(path.resolve(__dirname, "../../src"));
      const violations: string[] = [];

      for (const file of srcFiles) {
        const content = fs.readFileSync(file, "utf8");
        if (content.includes("azunnaukah@gmail.com")) {
          violations.push(file);
        }
      }

      expect(violations).toEqual([]);
    });

    it("verifies mobile navigation bar defaults fallback name to generic Scholar, never hardcoded person", () => {
      const headerPath = path.resolve(__dirname, "../../src/components/layout/site-header.tsx");
      const content = fs.readFileSync(headerPath, "utf8");

      expect(content).not.toContain('displayName || "Ukah Valentine"');
      expect(content).toContain('displayName || "Scholar"');
    });
  });

  describe("3. Universal Role Isolation & Zero Silent Bypasses", () => {
    it("verifies real new user profiles default to 0 metrics instead of simulated mock streaks", async () => {
      // In offline/mock mode for an unseeded real user ID
      const newUserId = `usr-brand-new-${Date.now()}`;
      const profile = await getLearnerProfile(newUserId);

      // Should be null or have 0 metrics, never fake 7 days / 3420 XP
      if (profile) {
        expect(profile.streak_days).toBeLessThanOrEqual(1);
        expect(profile.total_xp).toBeLessThanOrEqual(50);
      } else {
        expect(profile).toBeNull();
      }
    });

    it("guarantees demo persona accounts retain their rich showcase parameters for testing", async () => {
      const commercialProfile = await getLearnerProfile("demo-sss-commercial-005");
      expect(commercialProfile).not.toBeNull();
      expect(commercialProfile?.class_label).toBe("SSS 3 Commercial");
      expect(commercialProfile?.academic_track).toBe("commercial");
      expect(commercialProfile?.total_xp).toBe(2980);
    });
  });
});

import { describe, expect, it, beforeEach } from "vitest";
import { ProcessStateMachine } from "@/lib/lifecycle/process-state-machine";
import {
  AiSentinelWatchdog,
  ImmutableAuditLedger
} from "@/lib/monitoring/ai-sentinel";

describe("24/7 AI Sentinel & Universal Process Lifecycle Suite (1,000,000 Activities)", () => {
  beforeEach(() => {
    ProcessStateMachine.reset();
    AiSentinelWatchdog.reset();
    ImmutableAuditLedger.reset();
  });

  describe("1. Universal Process Lifecycle State Machine (FSM)", () => {
    it("successfully traverses complete CBT assessment attempt lifecycle", () => {
      const idempotencyKey = "exam_attempt_user_001_cbt_math";
      const proc = ProcessStateMachine.startProcess({
        processType: "ASSESSMENT_ATTEMPT",
        entityId: "asmt_waec_general_math_01",
        userId: "user_scholastic_99",
        idempotencyKey,
        initialState: "INITIATED",
        triggeredBy: "student_browser"
      });

      expect(proc.currentState).toBe("INITIATED");
      expect(proc.history.length).toBe(1);
      expect(proc.history[0].checksum).toBeDefined();

      // INITIATED -> IN_PROGRESS
      ProcessStateMachine.transition({
        instanceId: proc.id,
        toState: "IN_PROGRESS",
        triggeredBy: "questions_hydrated"
      });
      expect(proc.currentState).toBe("IN_PROGRESS");

      // IN_PROGRESS -> SUBMITTING
      ProcessStateMachine.transition({
        instanceId: proc.id,
        toState: "SUBMITTING",
        triggeredBy: "user_submit_click"
      });
      expect(proc.currentState).toBe("SUBMITTING");

      // SUBMITTING -> EVALUATING
      ProcessStateMachine.transition({
        instanceId: proc.id,
        toState: "EVALUATING",
        triggeredBy: "server_authoritative_grader"
      });
      expect(proc.currentState).toBe("EVALUATING");

      // EVALUATING -> COMPLETED
      ProcessStateMachine.transition({
        instanceId: proc.id,
        toState: "COMPLETED",
        triggeredBy: "scorecard_generated"
      });
      expect(proc.currentState).toBe("COMPLETED");

      // COMPLETED -> ARCHIVED
      ProcessStateMachine.transition({
        instanceId: proc.id,
        toState: "ARCHIVED",
        triggeredBy: "cold_storage_worker"
      });
      expect(proc.currentState).toBe("ARCHIVED");
      expect(proc.history.length).toBe(6);
    });

    it("rejects illegal state transitions and preserves process integrity", () => {
      const proc = ProcessStateMachine.startProcess({
        processType: "ASSESSMENT_ATTEMPT",
        entityId: "asmt_jamb_physics_02",
        idempotencyKey: "attempt_illegal_test_01",
        initialState: "INITIATED"
      });

      // Attempting to jump directly from INITIATED to COMPLETED without taking the exam
      expect(() => {
        ProcessStateMachine.transition({
          instanceId: proc.id,
          toState: "COMPLETED"
        });
      }).toThrow(/Illegal transition in ASSESSMENT_ATTEMPT/);

      // Current state must remain unchanged at INITIATED
      expect(proc.currentState).toBe("INITIATED");
    });

    it("enforces idempotency and prevents duplicate concurrent execution", () => {
      const key = "idemp_same_submission_click_twice";

      const firstCall = ProcessStateMachine.startProcess({
        processType: "ASSESSMENT_ATTEMPT",
        entityId: "asmt_neco_chem_01",
        idempotencyKey: key,
        initialState: "INITIATED"
      });

      const secondCall = ProcessStateMachine.startProcess({
        processType: "ASSESSMENT_ATTEMPT",
        entityId: "asmt_neco_chem_01",
        idempotencyKey: key,
        initialState: "INITIATED"
      });

      // Must return identical instance without creating a second one
      expect(firstCall.id).toBe(secondCall.id);
      expect(ProcessStateMachine.getMetrics().totalActive).toBe(1);
    });

    it("enforces Vetted TRCN Tutor Live Class lifecycle with parental consent and escrow", () => {
      const proc = ProcessStateMachine.startProcess({
        processType: "TUTOR_SESSION",
        entityId: "session_tutor_mr_okeke_01",
        userId: "scholar_minor_14",
        idempotencyKey: "tutor_booking_12345",
        initialState: "DISCOVERY"
      });

      ProcessStateMachine.transition({ instanceId: proc.id, toState: "PROPOSAL_CREATED" });
      ProcessStateMachine.transition({ instanceId: proc.id, toState: "PARENT_CONSENTED", metadata: { ndpaVerified: true } });
      ProcessStateMachine.transition({ instanceId: proc.id, toState: "ESCROW_LOCKED", metadata: { amountKobo: 500000 } });
      ProcessStateMachine.transition({ instanceId: proc.id, toState: "ROOM_PROVISIONED" });
      ProcessStateMachine.transition({ instanceId: proc.id, toState: "CLASS_IN_SESSION" });
      ProcessStateMachine.transition({ instanceId: proc.id, toState: "CONCLUDED" });
      ProcessStateMachine.transition({ instanceId: proc.id, toState: "SCORECARD_DISPATCHED" });
      ProcessStateMachine.transition({ instanceId: proc.id, toState: "ESCROW_RELEASED" });

      expect(proc.currentState).toBe("ESCROW_RELEASED");
    });
  });

  describe("2. AI Sentinel Watchdog & Anomaly Detection", () => {
    it("flags sub-human solving speeds (< 2s on high-difficulty questions) as malpractice anomalies", () => {
      const result = AiSentinelWatchdog.auditCbtAnsweringPace({
        questionId: "q-phy-wave-motion-hard",
        difficulty: 3,
        timeSpentSeconds: 0.8, // Impossible for a human to read and calculate in 800ms
        userId: "suspicious_user_404",
        attemptId: "att_live_exam_909"
      });

      expect(result.isAnomalous).toBe(true);
      expect(result.integrityConfidenceScore).toBeLessThan(50);
      expect(result.reason).toContain("threshold");
    });

    it("certifies realistic human answering velocity with high integrity score", () => {
      const result = AiSentinelWatchdog.auditCbtAnsweringPace({
        questionId: "q-math-calculus-01",
        difficulty: 3,
        timeSpentSeconds: 24.5,
        userId: "honest_scholar_001",
        attemptId: "att_live_exam_910"
      });

      expect(result.isAnomalous).toBe(false);
      expect(result.integrityConfidenceScore).toBe(98);
    });

    it("autonomously trips circuit breaker and fails over provider on latency or error spikes", () => {
      expect(AiSentinelWatchdog.getActiveProvider()).toBe("GEMINI");

      // Record 3 consecutive failures on Gemini
      AiSentinelWatchdog.recordProviderMetric("GEMINI", 1600, false);
      AiSentinelWatchdog.recordProviderMetric("GEMINI", 1750, false);
      AiSentinelWatchdog.recordProviderMetric("GEMINI", 2100, false);

      // Autonomous Sentinel must have flipped to GROQ
      expect(AiSentinelWatchdog.getActiveProvider()).toBe("GROQ");

      // If GROQ subsequently fails, fail over to LOCAL_DETERMINISTIC
      AiSentinelWatchdog.recordProviderMetric("GROQ", 2500, false);
      AiSentinelWatchdog.recordProviderMetric("GROQ", 2600, false);
      AiSentinelWatchdog.recordProviderMetric("GROQ", 3000, false);

      expect(AiSentinelWatchdog.getActiveProvider()).toBe("LOCAL_DETERMINISTIC");
    });

    it("executes the 60-second autonomous diagnostic pulse and returns health score", () => {
      const pulse = AiSentinelWatchdog.runAutonomousPulse();

      expect(pulse.auditId).toBeDefined();
      expect(pulse.healthScore).toBeGreaterThanOrEqual(80);
      expect(pulse.overallStatus).toBe("HEALTHY");
      expect(pulse.infraMetrics.estimatedThroughputCap).toContain("1,000,000");
      expect(pulse.ledgerChainValid).toBe(true);
    });
  });

  describe("3. Immutable SHA-256 Chained Audit Ledger", () => {
    it("maintains cryptographic chain continuity across multiple consecutive events", () => {
      ImmutableAuditLedger.appendRecord({
        eventType: "USER_SIGNIN",
        actorId: "usr_01",
        entityId: "session_01",
        payload: { ip: "102.89.23.11", lga: "Ikeja" }
      });

      ImmutableAuditLedger.appendRecord({
        eventType: "CBT_EXAM_START",
        actorId: "usr_01",
        entityId: "asmt_waec_01",
        payload: { tier: "SSS 3", subject: "Economics" }
      });

      ImmutableAuditLedger.appendRecord({
        eventType: "XP_MILESTONE_AWARDED",
        actorId: "usr_01",
        entityId: "prog_01",
        payload: { xpEarned: 250, streakDays: 7 }
      });

      expect(ImmutableAuditLedger.getRecordCount()).toBe(3);
      const integrity = ImmutableAuditLedger.verifyChainIntegrity();
      expect(integrity.valid).toBe(true);
    });

    it("detects tampering when an immutable ledger record hash is corrupted", () => {
      ImmutableAuditLedger.appendRecord({
        eventType: "BALANCE_DEPOSIT",
        entityId: "wallet_01",
        payload: { amountKobo: 100000 }
      });

      ImmutableAuditLedger.appendRecord({
        eventType: "BALANCE_TRANSFER",
        entityId: "wallet_01",
        payload: { amountKobo: 50000 }
      });

      // Corrupt record 1 directly in memory
      const records = (ImmutableAuditLedger as any).records;
      records[0].payload.amountKobo = 99999999; // Malicious tamper

      const integrity = ImmutableAuditLedger.verifyChainIntegrity();
      expect(integrity.valid).toBe(false);
      expect(integrity.brokenAtSequence).toBe(1);
    });

    it("automatically scrubs child PII (phone numbers, emails) before ledger immutability commitment", () => {
      const record = ImmutableAuditLedger.appendRecord({
        eventType: "STUDENT_REGISTRATION",
        entityId: "learner_007",
        payload: {
          email: "chidinma.adebayo@gmail.com",
          phone: "08031234567",
          fullName: "Chidinma Adebayo",
          state: "Enugu"
        }
      });

      expect(record.payload.phone).toBe("[REDACTED_SENSITIVE]");
      expect(record.payload.email).toBe("[REDACTED_SENSITIVE]");
      expect(record.payload.fullName).toBe("[REDACTED_SENSITIVE]");
      expect(record.payload.state).toBe("Enugu");
    });
  });
});

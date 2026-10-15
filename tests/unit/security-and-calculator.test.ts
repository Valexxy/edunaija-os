import { describe, expect, it } from "vitest";
import { AntiMalpracticeEngine, IntegrityAuditEvent } from "@/lib/security/anti-malpractice";
import { BulkProcessingAdapter } from "@/lib/workers/bulk-processor";

describe("Anti-Malpractice CBT Security & Integrity Engine", () => {
  it("evaluates clean attempts as 100% integrity score", () => {
    const report = AntiMalpracticeEngine.evaluateIntegrity([]);
    expect(report.integrityScore).toBe(100);
    expect(report.status).toBe("CLEAN");
    expect(report.tabSwitches).toBe(0);
    expect(report.copyAttempts).toBe(0);
  });

  it("penalizes tab switches and flags suspicious attempts", () => {
    const events: IntegrityAuditEvent[] = [
      { timestamp: new Date().toISOString(), type: "TAB_SWITCH", details: "Switched to outside tab" }
    ];
    const report = AntiMalpracticeEngine.evaluateIntegrity(events);
    expect(report.tabSwitches).toBe(1);
    expect(report.integrityScore).toBe(85);
    expect(report.status).toBe("FLAGGED_SUSPICIOUS");
  });

  it("disqualifies candidate after 3 tab switch infractions", () => {
    const events: IntegrityAuditEvent[] = [
      { timestamp: new Date().toISOString(), type: "TAB_SWITCH", details: "Tab switch 1" },
      { timestamp: new Date().toISOString(), type: "TAB_SWITCH", details: "Tab switch 2" },
      { timestamp: new Date().toISOString(), type: "TAB_SWITCH", details: "Tab switch 3" }
    ];
    const report = AntiMalpracticeEngine.evaluateIntegrity(events);
    expect(report.tabSwitches).toBe(3);
    expect(report.integrityScore).toBeLessThanOrEqual(55);
    expect(report.status).toBe("DISQUALIFIED");
  });

  it("tracks copy and context-menu infractions", () => {
    const events: IntegrityAuditEvent[] = [
      { timestamp: new Date().toISOString(), type: "COPY_ATTEMPT", details: "Attempted to copy prompt" },
      { timestamp: new Date().toISOString(), type: "WINDOW_BLUR", details: "Lost focus to outside window" }
    ];
    const report = AntiMalpracticeEngine.evaluateIntegrity(events);
    expect(report.copyAttempts).toBe(1);
    expect(report.windowBlurs).toBe(1);
    expect(report.integrityScore).toBe(80);
  });
});

describe("Free-Tier Bulk Processing Adapter", () => {
  it("gracefully falls back when API keys are unconfigured", async () => {
    const resendResult = await BulkProcessingAdapter.sendBulkEmails([]);
    expect(resendResult.service).toBe("resend_batch");
    expect(resendResult.totalBatched).toBe(0);

    const qstashResult = await BulkProcessingAdapter.enqueueBackgroundJob("https://example.com/api", { test: 1 });
    expect(qstashResult.service).toBe("upstash_qstash");
    expect(qstashResult.success).toBe(true);
  });
});

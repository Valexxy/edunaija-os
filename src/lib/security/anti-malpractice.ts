"use strict";

export interface IntegrityAuditEvent {
  timestamp: string;
  type: "TAB_SWITCH" | "WINDOW_BLUR" | "COPY_ATTEMPT" | "PASTE_ATTEMPT" | "CONTEXT_MENU" | "FULLSCREEN_EXIT";
  details: string;
}

export interface ExamIntegrityReport {
  tabSwitches: number;
  copyAttempts: number;
  windowBlurs: number;
  fullscreenExits: number;
  integrityScore: number;
  status: "CLEAN" | "FLAGGED_SUSPICIOUS" | "DISQUALIFIED";
  auditLog: IntegrityAuditEvent[];
}

export class AntiMalpracticeEngine {
  static evaluateIntegrity(events: IntegrityAuditEvent[]): ExamIntegrityReport {
    let tabSwitches = 0;
    let copyAttempts = 0;
    let windowBlurs = 0;
    let fullscreenExits = 0;

    for (const ev of events) {
      if (ev.type === "TAB_SWITCH") tabSwitches += 1;
      if (ev.type === "COPY_ATTEMPT") copyAttempts += 1;
      if (ev.type === "WINDOW_BLUR") windowBlurs += 1;
      if (ev.type === "FULLSCREEN_EXIT") fullscreenExits += 1;
    }

    const penalty = (tabSwitches * 15) + (copyAttempts * 10) + (windowBlurs * 10) + (fullscreenExits * 15);
    const integrityScore = Math.max(0, 100 - penalty);

    let status: "CLEAN" | "FLAGGED_SUSPICIOUS" | "DISQUALIFIED" = "CLEAN";
    if (tabSwitches >= 3 || integrityScore < 50) {
      status = "DISQUALIFIED";
    } else if (tabSwitches >= 1 || copyAttempts >= 1 || windowBlurs >= 2) {
      status = "FLAGGED_SUSPICIOUS";
    }

    return {
      tabSwitches,
      copyAttempts,
      windowBlurs,
      fullscreenExits,
      integrityScore,
      status,
      auditLog: events
    };
  }
}

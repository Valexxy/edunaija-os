import { describe, it, expect, beforeEach } from "vitest";
import {
  dispatchParentScorecard,
  dispatchCbtCertificate,
  dispatchGuardianConsent,
  dispatchMalpracticeAlert,
  dispatchTeacherOnboardingUpdate,
  getDispatchedEmailLog,
  clearDispatchedEmailLog
} from "@/lib/email/enterprise-mailer";
import { POST as dispatchPostRoute } from "@/app/api/email/dispatch/route";

describe("Enterprise Email Infrastructure Suite", () => {
  beforeEach(() => {
    clearDispatchedEmailLog();
  });

  it("dispatches parent scorecard answering all 3 core parental questions", async () => {
    const res = await dispatchParentScorecard({
      parentEmail: "guardian@example.com",
      parentName: "Mrs. Nkechi Okafor",
      studentName: "Chukwudi Okafor",
      classLabel: "SSS 3 Science",
      overallMastery: "Proficient",
      topicsPracticed: [
        { topicName: "Quadratic Equations", subject: "General Mathematics", scorePercentage: 85, masteryLevel: "Secure" },
        { topicName: "Grammatical Concord", subject: "English Language", scorePercentage: 70, masteryLevel: "Proficient" }
      ],
      learningMisconceptions: ["Confused rule of proximity with either/or subjects"],
      actionableGuardianTips: ["Ask Chukwudi to explain the rule of proximity using two examples from his notebook"]
    });

    expect(res.success).toBe(true);
    expect(res.emailId).toBeDefined();
    
    const logs = getDispatchedEmailLog();
    expect(logs.length).toBe(1);
    expect(logs[0].category).toBe("parent_scorecard");
    expect(logs[0].to).toBe("guardian@example.com");
    expect(logs[0].subject).toContain("Chukwudi Okafor's Learning Digest");
  });

  it("dispatches tamper-proof CBT score certificate with cryptographic verification", async () => {
    const res = await dispatchCbtCertificate({
      recipientEmail: "candidate@example.com",
      candidateName: "Ukah Valentine",
      assessmentTitle: "National Senior Mathematics Sprint",
      certificateNumber: "CERT-NG-2026-ANAMBRA-9021",
      verificationHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      scorePercentage: 92,
      totalQuestions: 25,
      correctAnswers: 23,
      timeSpentSeconds: 1140,
      stateName: "Anambra"
    });

    expect(res.success).toBe(true);
    const logs = getDispatchedEmailLog();
    expect(logs.length).toBe(1);
    expect(logs[0].category).toBe("cbt_certificate");
    expect(logs[0].subject).toContain("CERT-NG-2026-ANAMBRA-9021");
  });

  it("dispatches NDPA 2023 Section 31 Guardian Consent receipt", async () => {
    const res = await dispatchGuardianConsent({
      guardianEmail: "parent@example.com",
      guardianName: "Barrister Emeka Eze",
      childPseudonym: "SCHOLAR-SE-4421",
      consentReference: "CONSENT-NDPA-2026-081",
      consentScope: [
        "Pseudonymized diagnostic progress tracking",
        "Curriculum competency gap analysis",
        "Zero commercial ad tracking guarantee"
      ]
    });

    expect(res.success).toBe(true);
    const logs = getDispatchedEmailLog();
    expect(logs[0].category).toBe("guardian_consent");
    expect(logs[0].subject).toContain("CONSENT-NDPA-2026-081");
  });

  it("dispatches real-time Anti-Malpractice security incident alert with proctor telemetry", async () => {
    const res = await dispatchMalpracticeAlert({
      supervisorEmail: "proctor@edunaija.ng",
      candidateName: "Test Student",
      examTitle: "JAMB UTME Simulation Mock 1",
      incidentType: "tab_switch",
      severity: "high",
      infractionCount: 2,
      proctorNotes: "Candidate switched to secondary browser tab twice within 45 seconds."
    });

    expect(res.success).toBe(true);
    const logs = getDispatchedEmailLog();
    expect(logs[0].category).toBe("malpractice_alert");
    expect(logs[0].subject).toContain("HIGH");
  });

  it("dispatches TRCN teacher onboarding update with accredited subjects", async () => {
    const res = await dispatchTeacherOnboardingUpdate({
      teacherEmail: "educator@example.com",
      teacherName: "Mr. Babatunde Adeleke",
      trcnNumber: "TRCN-LA-2024-88412",
      verificationStatus: "verified",
      subjectsApproved: ["General Mathematics", "Further Mathematics", "Physics"],
      nextStepAction: "Schedule your live 15-minute video pedagogical orientation."
    });

    expect(res.success).toBe(true);
    const logs = getDispatchedEmailLog();
    expect(logs[0].category).toBe("teacher_onboarding");
    expect(logs[0].subject).toContain("TRCN Verified & Approved");
  });

  it("processes POST /api/email/dispatch endpoint with discriminated union validation", async () => {
    const req = new Request("http://localhost:3000/api/email/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "cbt_certificate",
        recipientEmail: "student@test.com",
        candidateName: "Amara Okonkwo",
        assessmentTitle: "Physics Mechanics Qualifying Exam",
        certificateNumber: "CERT-NG-2026-ENUGU-1029",
        verificationHash: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
        scorePercentage: 88,
        totalQuestions: 20,
        correctAnswers: 17,
        timeSpentSeconds: 900,
        stateName: "Enugu"
      })
    });

    const res = await dispatchPostRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.emailId).toBeDefined();
  });

  it("rejects POST /api/email/dispatch when mandatory fields are missing", async () => {
    const req = new Request("http://localhost:3000/api/email/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "parent_scorecard",
        parentEmail: "invalid-email" // Missing studentName, topics, etc.
      })
    });

    const res = await dispatchPostRoute(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Invalid payload for email dispatch");
  });
});

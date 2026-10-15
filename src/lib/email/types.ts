// Enterprise-Grade Typed Email Payloads for LearnNaija OS
// Aligned with NDPA 2023, NERDC standards, and JAMB/WAEC CBT verification

export interface EmailSendResult {
  success: boolean;
  emailId?: string;
  error?: string;
  mode: "live_resend" | "simulated_offline";
  timestamp: string;
}

export interface ParentScorecardDigestPayload {
  parentEmail: string;
  parentName?: string;
  studentName: string;
  classLabel: string;
  periodLabel?: string;
  overallMastery: "Starting" | "Developing" | "Proficient" | "Secure";
  topicsPracticed: Array<{
    topicName: string;
    subject: string;
    scorePercentage: number;
    masteryLevel: string;
  }>;
  learningMisconceptions: string[];
  actionableGuardianTips: string[];
  directPortalUrl?: string;
}

export interface CbtScoreReceiptPayload {
  recipientEmail: string;
  candidateName: string;
  assessmentTitle: string;
  certificateNumber: string;
  verificationHash: string;
  scorePercentage: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpentSeconds: number;
  stateName: string;
  issuedAt?: string;
  verificationUrl?: string;
}

export interface GuardianConsentPayload {
  guardianEmail: string;
  guardianName: string;
  childPseudonym: string;
  consentReference: string;
  consentScope: string[];
  effectiveDate?: string;
  revocationUrl?: string;
}

export interface AntiMalpracticeSecurityAlertPayload {
  supervisorEmail: string;
  candidateName: string;
  examTitle: string;
  incidentType: "tab_switch" | "keyboard_breach" | "secondary_display" | "copy_paste_attempt" | "unauthorized_device";
  severity: "low" | "medium" | "high" | "disqualified";
  timestamp?: string;
  infractionCount: number;
  proctorNotes: string;
  auditLogUrl?: string;
}

export interface TeacherOnboardingStatusPayload {
  teacherEmail: string;
  teacherName: string;
  trcnNumber: string;
  verificationStatus: "verified" | "pending_review" | "clarification_needed";
  subjectsApproved: string[];
  nextStepAction: string;
  portalLoginUrl?: string;
}

export interface CriticalSystemErrorAlertPayload {
  recipientEmail?: string;
  incidentId: string;
  severity: "CRITICAL" | "FATAL" | "HIGH";
  errorMessage: string;
  componentOrRoute: string;
  stackTrace?: string;
  userRole?: string;
  userId?: string;
  timestamp?: string;
  extraContext?: Record<string, unknown>;
  healthCheckUrl?: string;
}


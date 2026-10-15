import crypto from "crypto";

export interface ExamScoreReceipt {
  certificateNumber: string;
  attemptId: string;
  studentId: string;
  assessmentId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  signature: string;
  isValid: boolean;
}

const SIGNING_SECRET = process.env.EXAM_RECEIPT_SECRET || "learnnaija_tamperproof_receipt_salt_2026";

/**
 * Generates a tamper-evident cryptographic HMAC receipt for completed CBT exams
 */
export function generateScoreReceipt(params: {
  attemptId: string;
  studentId: string;
  assessmentId: string;
  score: number;
  totalQuestions: number;
  completedAt?: string;
}): ExamScoreReceipt {
  const completedAt = params.completedAt || new Date().toISOString();
  const percentage = Math.round((params.score / Math.max(1, params.totalQuestions)) * 100);

  const payload = `${params.studentId}|${params.assessmentId}|${params.score}|${params.totalQuestions}|${completedAt}`;
  const signature = crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");

  const shortHash = signature.slice(0, 8).toUpperCase();
  const certificateNumber = `CERT-NG-${shortHash}-${Date.now().toString().slice(-4)}`;

  return {
    certificateNumber,
    attemptId: params.attemptId,
    studentId: params.studentId,
    assessmentId: params.assessmentId,
    score: params.score,
    totalQuestions: params.totalQuestions,
    percentage,
    completedAt,
    signature,
    isValid: true
  };
}

/**
 * Verifies the mathematical authenticity of an exam score receipt
 */
export function verifyScoreReceipt(receipt: {
  studentId: string;
  assessmentId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  signature: string;
}): boolean {
  const payload = `${receipt.studentId}|${receipt.assessmentId}|${receipt.score}|${receipt.totalQuestions}|${receipt.completedAt}`;
  const expected = crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(receipt.signature, "hex"), Buffer.from(expected, "hex"));
}

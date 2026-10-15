import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  AssessmentError,
  CurriculumError,
  NetworkOfflineError,
  RateLimitError,
  isAppError,
  toAppError
} from "@/lib/errors";

describe("Domain Error Modules and Hierarchy Suite", () => {
  it("instantiates AppError with correct defaults and serializes to JSON", () => {
    const err = new AppError("Test generic failure", {
      code: "TEST_CODE",
      statusCode: 500,
      incidentId: "inc-12345"
    });

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("TEST_CODE");
    expect(err.statusCode).toBe(500);
    expect(err.incidentId).toBe("inc-12345");

    const json = err.toJSON();
    expect(json.code).toBe("TEST_CODE");
    expect(json.incidentId).toBe("inc-12345");
    expect(json.userFacingMessage).toBeTruthy();
  });

  it("handles NotFoundError with 404 status and clear message", () => {
    const err = new NotFoundError("JAMB Mock Paper", "mock-2026-phy");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("RESOURCE_NOT_FOUND");
    expect(err.message).toContain("mock-2026-phy");
  });

  it("handles ValidationError with 400 status and issue details", () => {
    const issues = [{ field: "email", error: "Invalid Nigerian phone or email" }];
    const err = new ValidationError("Form validation failed", issues);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_FAILED");
    expect(err.context?.validationIssues).toEqual(issues);
  });

  it("handles AuthenticationError and AuthorizationError with 401 and 403", () => {
    const authErr = new AuthenticationError();
    expect(authErr.statusCode).toBe(401);
    expect(authErr.code).toBe("UNAUTHENTICATED");

    const forbidErr = new AuthorizationError("teacher", "student");
    expect(forbidErr.statusCode).toBe(403);
    expect(forbidErr.code).toBe("FORBIDDEN_ROLE_MISMATCH");
    expect(forbidErr.message).toContain("teacher");
  });

  it("handles AssessmentError and preserves diagnostic metadata", () => {
    const err = new AssessmentError("Calculation timeout during submission", "asm-jamb-full-mock");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("ASSESSMENT_EXECUTION_ERROR");
    expect(err.context?.assessmentId).toBe("asm-jamb-full-mock");
    expect(err.userFacingMessage).toContain("preserved");
  });

  it("handles CurriculumError for unmapped NERDC topics", () => {
    const err = new CurriculumError("subject-quantum", "topic-entanglement");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("CURRICULUM_LOOKUP_FAILED");
    expect(err.context?.subjectKey).toBe("subject-quantum");
  });

  it("handles NetworkOfflineError with 503 status for offline queueing", () => {
    const err = new NetworkOfflineError("Submit Quiz");
    expect(err.statusCode).toBe(503);
    expect(err.code).toBe("OFFLINE_SYNC_QUEUED");
    expect(err.severity).toBe("INFO");
    expect(err.userFacingMessage).toContain("IndexedDB");
  });

  it("handles RateLimitError with 429 and retry period", () => {
    const err = new RateLimitError("AI Tutor Tokens", 45);
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(err.context?.retryAfterSeconds).toBe(45);
    expect(err.userFacingMessage).toContain("Slow down");
  });

  it("correctly identifies AppError instances via isAppError", () => {
    expect(isAppError(new AppError("fail"))).toBe(true);
    expect(isAppError(new NotFoundError("Item"))).toBe(true);
    expect(isAppError(new Error("regular JS error"))).toBe(false);
    expect(isAppError("string error")).toBe(false);
    expect(isAppError(null)).toBe(false);
  });

  it("normalizes unknown errors into AppError via toAppError", () => {
    const fromStr = toAppError("Database disconnected");
    expect(fromStr).toBeInstanceOf(AppError);
    expect(fromStr.message).toBe("Database disconnected");

    const standardErr = new Error("Standard runtime issue");
    const fromStd = toAppError(standardErr);
    expect(fromStd).toBeInstanceOf(AppError);
    expect(fromStd.message).toBe("Standard runtime issue");

    const existingApp = new RateLimitError("Requests", 30);
    const fromApp = toAppError(existingApp);
    expect(fromApp).toBe(existingApp);
  });
});

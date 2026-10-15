/**
 * LearnNaija OS - Sovereign Enterprise Domain Error Module
 * 
 * Provides strongly-typed application error classes with HTTP status codes,
 * incident tracking identifiers, and localized error messaging.
 */

export type ErrorSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface ErrorDetails {
  code: string;
  statusCode: number;
  severity: ErrorSeverity;
  userFacingMessage: string;
  context?: Record<string, unknown>;
  incidentId?: string;
}

/**
 * Base Application Error class
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly severity: ErrorSeverity;
  public readonly userFacingMessage: string;
  public readonly context?: Record<string, unknown>;
  public incidentId?: string;

  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      severity?: ErrorSeverity;
      userFacingMessage?: string;
      context?: Record<string, unknown>;
      incidentId?: string;
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code || "INTERNAL_ERROR";
    this.statusCode = options.statusCode || 500;
    this.severity = options.severity || "CRITICAL";
    this.userFacingMessage =
      options.userFacingMessage ||
      "An unexpected system hiccup occurred. Your learning progress is safe.";
    this.context = options.context;
    this.incidentId = options.incidentId;

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON(): ErrorDetails & { name: string; message: string } {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      severity: this.severity,
      userFacingMessage: this.userFacingMessage,
      context: this.context,
      incidentId: this.incidentId
    };
  }
}

/**
 * Resource Not Found Error (HTTP 404)
 */
export class NotFoundError extends AppError {
  constructor(resourceName: string, identifier?: string | number, context?: Record<string, unknown>) {
    const idMsg = identifier ? ` with ID '${identifier}'` : "";
    super(`${resourceName}${idMsg} was not found on the syllabus or portal.`, {
      code: "RESOURCE_NOT_FOUND",
      statusCode: 404,
      severity: "WARNING",
      userFacingMessage: `The requested ${resourceName.toLowerCase()} could not be found. It may have moved or expired.`,
      context
    });
  }
}

/**
 * Request Validation Error (HTTP 400)
 */
export class ValidationError extends AppError {
  constructor(message: string, validationIssues?: unknown, context?: Record<string, unknown>) {
    super(message, {
      code: "VALIDATION_FAILED",
      statusCode: 400,
      severity: "WARNING",
      userFacingMessage: "Please verify your input and ensure all required fields are correctly completed.",
      context: { ...context, validationIssues }
    });
  }
}

/**
 * Authentication Required Error (HTTP 401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required to access this learning resource.", context?: Record<string, unknown>) {
    super(message, {
      code: "UNAUTHENTICATED",
      statusCode: 401,
      severity: "WARNING",
      userFacingMessage: "Please sign in or select a demo scholar persona to access this section.",
      context
    });
  }
}

/**
 * Authorization / Access Forbidden Error (HTTP 403)
 */
export class AuthorizationError extends AppError {
  constructor(requiredRole: string, actualRole?: string, context?: Record<string, unknown>) {
    super(`Access forbidden. Required role: '${requiredRole}', current role: '${actualRole || "anonymous"}'.`, {
      code: "FORBIDDEN_ROLE_MISMATCH",
      statusCode: 403,
      severity: "WARNING",
      userFacingMessage: `This area is reserved for ${requiredRole} accounts. Please switch to the appropriate profile to view.`,
      context
    });
  }
}

/**
 * Assessment / CBT Execution Error
 */
export class AssessmentError extends AppError {
  constructor(message: string, assessmentId?: string, context?: Record<string, unknown>) {
    super(message, {
      code: "ASSESSMENT_EXECUTION_ERROR",
      statusCode: 500,
      severity: "CRITICAL",
      userFacingMessage: "Exam session encountered a calculation anomaly. All recorded answers have been preserved in offline storage.",
      context: { ...context, assessmentId }
    });
  }
}

/**
 * NERDC Curriculum Resolution Error
 */
export class CurriculumError extends AppError {
  constructor(subjectKey: string, topicKey?: string, context?: Record<string, unknown>) {
    super(`Curriculum resolution failed for subject '${subjectKey}' and topic '${topicKey || "ALL"}'.`, {
      code: "CURRICULUM_LOOKUP_FAILED",
      statusCode: 404,
      severity: "WARNING",
      userFacingMessage: "The selected curriculum topic is undergoing statutory alignment. Please select another subject module.",
      context: { ...context, subjectKey, topicKey }
    });
  }
}

/**
 * Network / Offline Sync Error
 */
export class NetworkOfflineError extends AppError {
  constructor(operation: string, context?: Record<string, unknown>) {
    super(`Network connection unavailable during '${operation}'. Queued for offline sync.`, {
      code: "OFFLINE_SYNC_QUEUED",
      statusCode: 503,
      severity: "INFO",
      userFacingMessage: "You are currently offline. Your actions have been queued safely in IndexedDB and will sync once connectivity resumes.",
      context
    });
  }
}

/**
 * Rate Limit / Security Challenge Error (HTTP 429)
 */
export class RateLimitError extends AppError {
  constructor(limitName: string = "Requests", retryAfterSeconds: number = 60, context?: Record<string, unknown>) {
    super(`Rate limit exceeded for ${limitName}. Retry after ${retryAfterSeconds}s.`, {
      code: "RATE_LIMIT_EXCEEDED",
      statusCode: 429,
      severity: "WARNING",
      userFacingMessage: `Slow down small! Too many requests. Please wait ${retryAfterSeconds} seconds before trying again.`,
      context: { ...context, retryAfterSeconds }
    });
  }
}

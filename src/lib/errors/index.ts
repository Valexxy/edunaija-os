/**
 * LearnNaija OS - Error Modules Entry Point
 */
export * from "./app-error";

import { AppError } from "./app-error";

/**
 * Type guard to check if an error is an instance of AppError
 */
export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

/**
 * Normalizes any caught unknown value into a structured AppError
 */
export function toAppError(err: unknown, defaultMessage: string = "An unhandled error occurred"): AppError {
  if (err instanceof AppError) {
    return err;
  }
  if (err instanceof Error) {
    return new AppError(err.message, {
      userFacingMessage: err.message,
      context: { originalStack: err.stack }
    });
  }
  if (typeof err === "string") {
    return new AppError(err, { userFacingMessage: err });
  }
  return new AppError(defaultMessage, {
    context: { rawError: String(err) }
  });
}

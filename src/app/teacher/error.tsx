"use client";

import { RouteErrorBoundary } from "@/components/error/route-error-boundary";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorBoundary
      error={error}
      reset={reset}
      sectionTitle="Teacher & Classroom Hub"
      subtitle="Classroom roster sync paused. Homework submissions and student grades are securely archived."
      icon="👩‍🏫"
      badge="Educator Portal Guard"
      actionText="Refresh Classroom"
      fallbackUrl="/dashboard"
      fallbackText="Return to Dashboard"
    />
  );
}

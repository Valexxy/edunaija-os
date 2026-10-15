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
      sectionTitle="Examination Session"
      subtitle="Exam environment paused. Don't panic: all your selected answers and remaining exam timer are safely cached in IndexedDB."
      icon="🎯"
      badge="Exam Integrity Guard"
      actionText="Resume Examination"
      fallbackUrl="/assessments"
      fallbackText="Return to Assessments Hub"
    />
  );
}

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
      sectionTitle="CBT Assessments Hub"
      subtitle="Assessment roster loading was interrupted. Your offline tests and answers remain safe."
      icon="📝"
      badge="Assessment Guard"
      actionText="Reload Assessments"
      fallbackUrl="/dashboard"
      fallbackText="Back to Dashboard"
    />
  );
}

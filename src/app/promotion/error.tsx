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
      sectionTitle="Academic Promotion"
      subtitle="Academic advancement evaluator paused. Your promotion criteria scores are securely retained."
      icon="🎓"
      badge="Promotion Gate"
      actionText="Recalculate Eligibility"
      fallbackUrl="/dashboard"
      fallbackText="Return to Dashboard"
    />
  );
}

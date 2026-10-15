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
      sectionTitle="Learner Onboarding"
      subtitle="Profile setup paused. Your chosen class, state, and academic goals are cached."
      icon="🚀"
      badge="Onboarding Guard"
      actionText="Retry Setup"
      fallbackUrl="/"
      fallbackText="Return to Home"
    />
  );
}

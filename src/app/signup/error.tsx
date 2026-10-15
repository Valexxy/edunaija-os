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
      sectionTitle="Registration Portal"
      subtitle="Registration step interrupted. Quick-start demo personas are ready for instant access."
      icon="✨"
      badge="Enrollment Guard"
      actionText="Try Again"
      fallbackUrl="/"
      fallbackText="Return to Home"
    />
  );
}

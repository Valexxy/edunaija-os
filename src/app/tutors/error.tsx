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
      sectionTitle="Vetted TRCN Mentors Hub"
      subtitle="Educator directory loading was interrupted. Verified teacher profiles and licenses are safe."
      icon="🏛️"
      badge="TRCN Directory Guard"
      actionText="Reload Faculty"
      fallbackUrl="/dashboard"
      fallbackText="Back to Dashboard"
    />
  );
}

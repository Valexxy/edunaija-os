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
      sectionTitle="Mastery & Mistake Vault"
      subtitle="Progress analytics sync paused. All error autopsy notes and competence ratings are safely stored."
      icon="📈"
      badge="Analytics Guard"
      actionText="Reload Progress"
      fallbackUrl="/dashboard"
      fallbackText="Return to Dashboard"
    />
  );
}

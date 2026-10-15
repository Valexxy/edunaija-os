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
      sectionTitle="Scorecard Generator"
      subtitle="Scorecard rendering interrupted. Your verified results and cryptographic badge are intact."
      icon="🏷️"
      badge="Scorecard Guard"
      actionText="Regenerate Card"
      fallbackUrl="/progress"
      fallbackText="Back to Progress"
    />
  );
}

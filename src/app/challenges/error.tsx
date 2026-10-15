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
      sectionTitle="Inter-School League Challenges"
      subtitle="Tournament bracket stream paused. Your school points and leaderboard rank are safely stored."
      icon="🏆"
      badge="Tournament Guard"
      actionText="Retry League Connection"
      fallbackUrl="/dashboard"
      fallbackText="Return to Dashboard"
    />
  );
}

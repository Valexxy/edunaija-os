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
      sectionTitle="Peer Study Group"
      subtitle="Collaborative study session paused. Your group contributions and peer notes are saved."
      icon="👥"
      badge="Study Circle Guard"
      actionText="Reconnect Group"
      fallbackUrl="/dashboard"
      fallbackText="Return to Dashboard"
    />
  );
}

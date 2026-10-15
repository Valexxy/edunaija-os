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
      sectionTitle="Learner Dashboard"
      subtitle="Dashboard analytics stream paused. Your streaks, XP, and subject mastery remain preserved."
      icon="📊"
      badge="Dashboard Recovery"
      actionText="Reload Dashboard"
      fallbackUrl="/assessments"
      fallbackText="Practice CBT While We Reconnect"
    />
  );
}

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
      sectionTitle="Guardian Cockpit"
      subtitle="Parental oversight synchronization paused. Student progress records and escrow balances are safe."
      icon="👨‍👩‍👧‍👦"
      badge="Parental Guard"
      actionText="Retry Sync"
      fallbackUrl="/dashboard"
      fallbackText="Return to Dashboard"
    />
  );
}

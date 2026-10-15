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
      sectionTitle="Billing & Subscriptions"
      subtitle="Billing gateway connection paused. Any ongoing Paystack or flutterwave transactions are verified server-side."
      icon="💳"
      badge="Billing Guard"
      actionText="Retry Billing Sync"
      fallbackUrl="/dashboard"
      fallbackText="Return to Dashboard"
    />
  );
}

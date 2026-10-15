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
      sectionTitle="Authentication Portal"
      subtitle="Authentication verification paused. Demo accounts and biometric login remain available."
      icon="🔐"
      badge="Auth Guard"
      actionText="Try Signing In Again"
      fallbackUrl="/"
      fallbackText="Return to Home"
    />
  );
}

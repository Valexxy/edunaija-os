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
      sectionTitle="Socratic AI Tutor"
      subtitle="AI pedagogical engine connection interrupted. Your chat history and explanations are saved."
      icon="🤖"
      badge="AI Concierge Guard"
      actionText="Reconnect Socratic Tutor"
      fallbackUrl="/dashboard"
      fallbackText="Return to Dashboard"
    />
  );
}

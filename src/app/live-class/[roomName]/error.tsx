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
      sectionTitle="Live Encrypted Classroom"
      subtitle="Classroom WebRTC video connection paused. Your attendance and shared notes have been logged."
      icon="🎥"
      badge="WebRTC Room Guard"
      actionText="Reconnect to Classroom"
      fallbackUrl="/dashboard"
      fallbackText="Exit to Dashboard"
    />
  );
}

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
      sectionTitle="NERDC Curriculum Explorer"
      subtitle="Curriculum topic indexing paused. Syllabus standards and learning milestones are intact."
      icon="📚"
      badge="Curriculum Sync"
      actionText="Reload Curriculum"
      fallbackUrl="/dashboard"
      fallbackText="Return to Dashboard"
    />
  );
}

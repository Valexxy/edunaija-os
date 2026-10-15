import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="CBT Assessments Hub"
      message="The assessment you searched for does not exist or has expired."
      icon="📝"
      primaryUrl="/assessments"
      primaryText="Browse All Assessments"
      secondaryUrl="/dashboard"
      secondaryText="Return to Dashboard"
    />
  );
}

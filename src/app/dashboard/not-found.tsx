import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Learner Dashboard"
      message="The requested learner view does not exist."
      icon="📊"
      primaryUrl="/dashboard"
      primaryText="Return to Dashboard"
      secondaryUrl="/curriculum"
      secondaryText="Explore Curriculum"
    />
  );
}

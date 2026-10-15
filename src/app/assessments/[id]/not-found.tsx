import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Examination Session"
      message="This specific test paper or mock examination ID is not found in the national repository."
      icon="🎯"
      primaryUrl="/assessments"
      primaryText="Choose Another Test"
      secondaryUrl="/dashboard"
      secondaryText="Return to Dashboard"
    />
  );
}

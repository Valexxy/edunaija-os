import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Scorecard Generator"
      message="The requested scorecard or certificate could not be found."
      icon="🏷️"
      primaryUrl="/progress"
      primaryText="View Your Scorecards"
      secondaryUrl="/dashboard"
      secondaryText="Dashboard"
    />
  );
}

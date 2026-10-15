import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Inter-School League Challenges"
      message="The requested league challenge does not exist or has ended."
      icon="🏆"
      primaryUrl="/challenges"
      primaryText="View Active Leagues"
      secondaryUrl="/dashboard"
      secondaryText="Return to Dashboard"
    />
  );
}

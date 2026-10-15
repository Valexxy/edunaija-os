import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Peer Study Group"
      message="The requested study group or discussion circle does not exist."
      icon="👥"
      primaryUrl="/study-group"
      primaryText="Browse Study Groups"
      secondaryUrl="/dashboard"
      secondaryText="Return to Dashboard"
    />
  );
}

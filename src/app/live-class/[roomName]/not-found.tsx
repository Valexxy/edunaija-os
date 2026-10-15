import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Live Encrypted Classroom"
      message="This virtual classroom session has concluded or the room link is invalid."
      icon="🎥"
      primaryUrl="/dashboard"
      primaryText="Back to Dashboard"
      secondaryUrl="/curriculum"
      secondaryText="Study Course Material"
    />
  );
}

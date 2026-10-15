import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Socratic AI Tutor"
      message="The requested tutoring session or subject mentor was not found."
      icon="🤖"
      primaryUrl="/tutor"
      primaryText="New Tutoring Session"
      secondaryUrl="/dashboard"
      secondaryText="Return to Dashboard"
    />
  );
}

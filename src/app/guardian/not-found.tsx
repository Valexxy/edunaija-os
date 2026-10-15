import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Guardian Cockpit"
      message="The requested ward or guardian record was not found."
      icon="👨‍👩‍👧‍👦"
      primaryUrl="/guardian"
      primaryText="Guardian Home"
      secondaryUrl="/dashboard"
      secondaryText="Learner Dashboard"
    />
  );
}

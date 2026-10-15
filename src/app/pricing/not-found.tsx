import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Billing & Subscriptions"
      message="The selected subscription tier or invoice could not be found."
      icon="💳"
      primaryUrl="/pricing"
      primaryText="View Available Plans"
      secondaryUrl="/dashboard"
      secondaryText="Return to Dashboard"
    />
  );
}

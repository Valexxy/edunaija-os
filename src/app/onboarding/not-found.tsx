import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Learner Onboarding"
      message="This onboarding step is not recognized."
      icon="🚀"
      primaryUrl="/onboarding"
      primaryText="Restart Onboarding"
      secondaryUrl="/"
      secondaryText="Return to Home"
    />
  );
}

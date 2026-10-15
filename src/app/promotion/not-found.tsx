import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Academic Promotion"
      message="The requested academic promotion pathway does not exist."
      icon="🎓"
      primaryUrl="/dashboard"
      primaryText="Back to Dashboard"
      secondaryUrl="/progress"
      secondaryText="Check Mastery Index"
    />
  );
}

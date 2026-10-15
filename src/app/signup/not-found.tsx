import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Registration Portal"
      message="The requested registration route was not found."
      icon="✨"
      primaryUrl="/signup"
      primaryText="Go to Registration"
      secondaryUrl="/"
      secondaryText="Home"
    />
  );
}

import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Authentication Portal"
      message="The requested sign-in action was not found."
      icon="🔐"
      primaryUrl="/login"
      primaryText="Go to Login"
      secondaryUrl="/"
      secondaryText="Home"
    />
  );
}

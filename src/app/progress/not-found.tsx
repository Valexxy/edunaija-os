import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Mastery & Mistake Vault"
      message="The requested progress report or mistake audit record was not found."
      icon="📈"
      primaryUrl="/progress"
      primaryText="View Mistake Vault"
      secondaryUrl="/dashboard"
      secondaryText="Return to Dashboard"
    />
  );
}

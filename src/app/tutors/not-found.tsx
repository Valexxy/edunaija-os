import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Vetted Mentors"
      message="The requested teacher profile or booking schedule was not found."
      icon="🔍"
      primaryUrl="/tutors"
      primaryText="Browse All Mentors"
      secondaryUrl="/dashboard"
      secondaryText="Return to Dashboard"
    />
  );
}

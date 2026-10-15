import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="NERDC Curriculum Explorer"
      message="The requested curriculum subject or topic is not found on the national syllabus."
      icon="📚"
      primaryUrl="/curriculum"
      primaryText="Browse All Subjects"
      secondaryUrl="/dashboard"
      secondaryText="Return to Dashboard"
    />
  );
}

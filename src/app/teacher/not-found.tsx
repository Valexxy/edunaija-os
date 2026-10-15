import { RouteNotFoundView } from "@/components/error/route-not-found-view";

export default function NotFound() {
  return (
    <RouteNotFoundView
      sectionTitle="Teacher & Classroom Hub"
      message="The requested classroom or class roster does not exist."
      icon="👩‍🏫"
      primaryUrl="/teacher"
      primaryText="Classroom Hub"
      secondaryUrl="/dashboard"
      secondaryText="Return to Dashboard"
    />
  );
}

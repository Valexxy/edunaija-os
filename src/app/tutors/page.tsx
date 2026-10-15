import { VettedTutorsHub } from "@/components/classroom/vetted-tutors-hub";
import { BackButton } from "@/components/navigation/back-button";

export const metadata = {
  title: "Vetted TRCN Mentors & Live Tutoring Hub | LearnNaija OS",
  description: "Browse TRCN-accredited Nigerian educators for private 1-on-1 discovery calls, WAEC/JAMB exam prep, and Socratic homework breakdown under NDPA 2023 safeguarding."
};

export default function TutorsPage() {
  return (
    <main style={{ padding: "20px 20px 60px", maxWidth: 1140, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <BackButton fallbackUrl="/dashboard" label="← Back to Dashboard" />
      </div>
      <VettedTutorsHub />
    </main>
  );
}

import { NextResponse } from "next/server";
import { SEED_ASSESSMENTS } from "@/lib/assessment/engine";
import { getProvisionedAssessments, ProvisionedAssessment } from "@/lib/assessment/provisioning";
import { getCurrentUser, getLearnerProfile } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subject_id");
  const educationLevel = searchParams.get("education_level");

  const user = await getCurrentUser();
  const learnerProfile = user ? await getLearnerProfile(user.id) : null;
  const provisioned = getProvisionedAssessments(learnerProfile);

  const allMap = new Map<string, ProvisionedAssessment>();
  // Provisioned first (highlighted for scholar's class)
  for (const a of provisioned) allMap.set(a.id, a);
  // Add seed assessments
  for (const a of SEED_ASSESSMENTS) {
    if (!allMap.has(a.id)) {
      allMap.set(a.id, { ...a, is_provisioned: false });
    }
  }

  let assessments = Array.from(allMap.values()).filter((a) => a.status === "published");

  if (subjectId) {
    assessments = assessments.filter((a) => !a.subject_id || a.subject_id === subjectId);
  }
  if (educationLevel) {
    assessments = assessments.filter((a) => a.education_level === educationLevel);
  }

  return NextResponse.json({
    learner: learnerProfile,
    assessments
  });
}

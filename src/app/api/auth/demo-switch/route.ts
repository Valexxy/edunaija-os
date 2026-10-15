import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const DEMO_PERSONAS: Record<string, { role: string; redirect: string; name: string }> = {
  "demo-primary-001": { role: "student", redirect: "/dashboard", name: "Amina Bello (Primary 5)" },
  "demo-jss-002": { role: "student", redirect: "/dashboard", name: "Emeka Okafor (JSS 3)" },
  "demo-student-user-001": { role: "student", redirect: "/dashboard", name: "Chidi Okonkwo (SSS 3 Science)" },
  "demo-sss-arts-004": { role: "student", redirect: "/dashboard", name: "Folake Adeleke (SSS 2 Arts)" },
  "demo-sss-commercial-005": { role: "student", redirect: "/dashboard", name: "Babajide Sanwo (SSS 3 Commercial)" },
  "demo-parent-006": { role: "parent", redirect: "/guardian", name: "Dr. Alabi Taiwo (Guardian)" },
  "demo-teacher-007": { role: "teacher", redirect: "/teacher", name: "Mr. Chinedu Eze (TRCN Educator)" }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { personaId } = body;

    const persona = DEMO_PERSONAS[personaId] || DEMO_PERSONAS["demo-student-user-001"];

    const cookieStore = await cookies();
    cookieStore.set("learnnaija_demo_user_id", personaId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      httpOnly: false
    });

    return NextResponse.json({
      success: true,
      personaId,
      name: persona.name,
      role: persona.role,
      redirectUrl: persona.redirect
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error switching persona";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

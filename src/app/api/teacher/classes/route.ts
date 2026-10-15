import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { withEnterpriseErrorHandler } from "@/lib/monitoring/enterprise-error-handler";

export const runtime = "nodejs";

const createClassSchema = z.object({
  className: z.string().min(3).max(80),
  subject: z.string().min(2),
  gradeLevel: z.string().min(2),
  academicTerm: z.string().default("First Term 2026/2027")
});

const fallbackTeacherClasses = [
  {
    id: "cls-01",
    className: "SS 2 Gold — Mathematics",
    classCode: "LAG-SS2-MATH-88",
    subject: "General Mathematics",
    gradeLevel: "SSS 2",
    studentCount: 38,
    activeAssignment: "Quadratic Equations Diagnostic Practice",
    diagnosticGapSummary: "64% of students had sign expansion errors in (-b ± √(b²-4ac))",
    createdAt: new Date().toISOString()
  },
  {
    id: "cls-02",
    className: "SS 3 Science — Physics Drill",
    classCode: "ANM-SS3-PHY-12",
    subject: "Physics",
    gradeLevel: "SSS 3",
    studentCount: 42,
    activeAssignment: "Kinematics & Newton's Second Law Drill",
    diagnosticGapSummary: "28% of students confused displacement with distance",
    createdAt: new Date().toISOString()
  },
  {
    id: "cls-03",
    className: "JSS 3 Beacon — English Grammar",
    classCode: "KAD-JSS3-ENG-05",
    subject: "English Language",
    gradeLevel: "JSS 3",
    studentCount: 34,
    activeAssignment: "BECE Past Question Analysis: Concord & Tenses",
    diagnosticGapSummary: "45% of students struggled with subject-verb agreement on collective nouns",
    createdAt: new Date().toISOString()
  }
];

export const GET = withEnterpriseErrorHandler(async () => {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to access teacher cohorts" },
      { status: 401 }
    );
  }

  if (user.role !== "teacher" && user.role !== "school_admin" && user.role !== "platform_admin") {
    return NextResponse.json(
      { error: "Forbidden: Cohort and classroom management are reserved for educator accounts." },
      { status: 403 }
    );
  }

  // Demo user: return rich simulation cohorts
  if (user.is_demo) {
    return NextResponse.json({
      success: true,
      classes: fallbackTeacherClasses,
      teacherBadge: {
        name: user.display_name,
        trcnLicense: "TRCN/LA/CAT-B/2021/0081",
        qualification: "B.Ed, M.Ed Mathematics Education",
        specialization: "Senior Secondary STEM / Further Maths",
        verified: true
      }
    });
  }

  // Real user: query their own classrooms and tutor vetting record
  let classes: any[] = [];
  let teacherBadge = {
    name: user.display_name,
    trcnLicense: "TRCN-PENDING",
    qualification: "Educator / Mentor",
    specialization: "Curriculum Pedagogy",
    verified: false
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      
      const { data: tutor } = await supabase
        .from("vetted_tutors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (tutor) {
        teacherBadge = {
          name: tutor.full_name || user.display_name,
          trcnLicense: tutor.trcn_number,
          qualification: tutor.qualification,
          specialization: tutor.specialization,
          verified: tutor.vetting_status === "verified"
        };
      }

      const { data: dbClasses } = await supabase
        .from("teacher_classrooms")
        .select("*")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (dbClasses && dbClasses.length > 0) {
        classes = dbClasses.map((c) => ({
          id: c.id,
          className: c.class_name,
          classCode: c.class_code,
          subject: c.subject,
          gradeLevel: c.grade_level,
          studentCount: c.student_count || 0,
          activeAssignment: c.active_assignment || "Curriculum Diagnostic Drill",
          diagnosticGapSummary: c.diagnostic_gap_summary || "Class diagnostic sync active.",
          createdAt: c.created_at
        }));
      }
    } catch (err) {
      console.warn("[TeacherClassesAPI] Database query error:", err);
    }
  }

  return NextResponse.json({
    success: true,
    classes,
    teacherBadge
  });
}, "GET /api/teacher/classes");

export const POST = withEnterpriseErrorHandler(async (req: Request) => {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to create a classroom cohort" },
      { status: 401 }
    );
  }

  if (user.role !== "teacher" && user.role !== "school_admin" && user.role !== "platform_admin") {
    return NextResponse.json(
      { error: "Forbidden: Only educators can create cohorts" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = createClassSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid class data", details: parsed.error.issues }, { status: 400 });
  }

  const classCode = `NG-${parsed.data.gradeLevel.replace(/\s+/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newClass = {
    id: `cls-${Date.now().toString(36)}`,
    className: parsed.data.className,
    classCode,
    subject: parsed.data.subject,
    gradeLevel: parsed.data.gradeLevel,
    studentCount: 0,
    activeAssignment: "Baseline Diagnostic Assessment",
    diagnosticGapSummary: "Class newly created. Awaiting first diagnostic assessment submission.",
    createdAt: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("teacher_classrooms").insert({
        teacher_id: user.id,
        class_name: parsed.data.className,
        class_code: classCode,
        subject: parsed.data.subject,
        grade_level: parsed.data.gradeLevel,
        academic_term: parsed.data.academicTerm,
        student_count: 0,
        active_assignment: "Baseline Diagnostic Assessment",
        diagnostic_gap_summary: "Class newly created. Awaiting first diagnostic assessment submission."
      });
    } catch (dbErr) {
      console.warn("Could not insert class into Supabase:", dbErr);
    }
  }

  if (user.is_demo) {
    fallbackTeacherClasses.unshift(newClass);
  }

  return NextResponse.json({
    success: true,
    class: newClass,
    message: "Class created! Share code with your students to enroll."
  });
}, "POST /api/teacher/classes");

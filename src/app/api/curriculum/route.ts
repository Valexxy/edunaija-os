import { NextResponse } from "next/server";
import { getAvailableSubjects, getTopicsBySubject } from "@/lib/curriculum/ingest";
import { SEED_QUESTIONS } from "@/lib/curriculum/seed-data";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subject_id");

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();

      if (subjectId) {
        // Find subject by ID or slug in Supabase
        const { data: dbSub } = await supabase
          .from("subjects")
          .select("id, slug")
          .or(`id.eq.${subjectId},slug.eq.${subjectId}`)
          .single();

        const resolvedSubjectId = dbSub?.id || subjectId;

        const { data: dbTopics } = await supabase
          .from("curriculum_topics")
          .select("id, code, title, description, education_level, sort_order, status, subject_id")
          .eq("subject_id", resolvedSubjectId)
          .eq("status", "published")
          .order("sort_order", { ascending: true });

        if (dbTopics && dbTopics.length > 0) {
          // Count questions per topic in Supabase
          const { data: dbQuestions } = await supabase
            .from("questions")
            .select("topic_id")
            .eq("status", "published");

          const qCountMap = new Map<string, number>();
          for (const q of dbQuestions || []) {
            qCountMap.set(q.topic_id, (qCountMap.get(q.topic_id) || 0) + 1);
          }

          const enrichedTopics = dbTopics.map((t) => ({
            ...t,
            questionCount: qCountMap.get(t.id) || 2
          }));

          return NextResponse.json({ subjectId, topics: enrichedTopics, source: "supabase" });
        }
      } else {
        const { data: dbSubjects } = await supabase
          .from("subjects")
          .select("id, slug, name, description, education_levels");

        if (dbSubjects && dbSubjects.length > 0) {
          const { count: totalQuestions } = await supabase
            .from("questions")
            .select("*", { count: "exact", head: true });

          return NextResponse.json({
            subjects: dbSubjects,
            totalQuestions: totalQuestions || SEED_QUESTIONS.length,
            source: "supabase"
          });
        }
      }
    } catch {
      // Graceful fallback to local seed data
    }
  }

  // Local in-memory repository fallback
  const subjects = getAvailableSubjects();

  if (subjectId) {
    const topics = getTopicsBySubject(subjectId);
    const enrichedTopics = topics.map((t) => {
      const qCount = SEED_QUESTIONS.filter((q) => q.topic_id === t.id && q.status === "published").length;
      return {
        ...t,
        questionCount: qCount
      };
    });
    return NextResponse.json({ subjectId, topics: enrichedTopics, source: "memory_cache" });
  }

  return NextResponse.json({
    subjects,
    totalQuestions: SEED_QUESTIONS.length,
    source: "memory_cache"
  });
}

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env";
import type { EducationLevel, AcademicTrack } from "@/lib/curriculum/types";
import { resolveAcademicTrack } from "@/lib/assessment/provisioning";
import { evaluateStreakTransition } from "@/lib/progression/progression-engine";

export interface UserProfile {
  id: string;
  display_name: string;
  role: "student" | "parent" | "teacher" | "school_admin" | "platform_admin";
  locale: string;
  avatar_path?: string;
  onboarding_complete: boolean;
  created_at: string;
  is_demo?: boolean;
}

export interface LearnerProfile {
  user_id: string;
  education_level: EducationLevel;
  academic_track?: AcademicTrack;
  state_name?: string;
  class_label?: string;
  exam_goal?: string; // e.g. "JAMB UTME 2026", "WAEC WASSCE"
  preferred_language: string; // "en" or "pcm"
  streak_days?: number;
  total_xp?: number;
  study_minutes?: number;
  last_active_date?: string;
  created_at: string;
}

export interface GuardianRelationship {
  id: string;
  guardian_user_id: string;
  guardian_name?: string;
  learner_user_id: string;
  learner_name?: string;
  relationship_label: string; // "Parent", "Guardian", "Sponsor"
  status: "pending" | "accepted" | "revoked";
  consent_recorded_at?: string;
  created_at: string;
}

// In-memory mock stores for offline or pre-configured database environments
const mockProfiles = new Map<string, UserProfile>([
  [
    "demo-student-user-001",
    {
      id: "demo-student-user-001",
      display_name: "Chidi Okonkwo",
      role: "student",
      locale: "en-NG",
      onboarding_complete: true,
      created_at: new Date().toISOString()
    }
  ],
  [
    "demo-primary-001",
    {
      id: "demo-primary-001",
      display_name: "Amina Bello",
      role: "student",
      locale: "en-NG",
      onboarding_complete: true,
      created_at: new Date().toISOString()
    }
  ],
  [
    "demo-jss-002",
    {
      id: "demo-jss-002",
      display_name: "Emeka Okafor",
      role: "student",
      locale: "en-NG",
      onboarding_complete: true,
      created_at: new Date().toISOString()
    }
  ],
  [
    "demo-sss-arts-004",
    {
      id: "demo-sss-arts-004",
      display_name: "Folake Adeleke",
      role: "student",
      locale: "en-NG",
      onboarding_complete: true,
      created_at: new Date().toISOString()
    }
  ],
  [
    "demo-sss-commercial-005",
    {
      id: "demo-sss-commercial-005",
      display_name: "Babajide Sanwo",
      role: "student",
      locale: "en-NG",
      onboarding_complete: true,
      created_at: new Date().toISOString()
    }
  ],
  [
    "demo-parent-006",
    {
      id: "demo-parent-006",
      display_name: "Dr. Alabi Taiwo",
      role: "parent",
      locale: "en-NG",
      onboarding_complete: true,
      created_at: new Date().toISOString()
    }
  ],
  [
    "demo-teacher-007",
    {
      id: "demo-teacher-007",
      display_name: "Mr. Chinedu Eze (TRCN)",
      role: "teacher",
      locale: "en-NG",
      onboarding_complete: true,
      created_at: new Date().toISOString()
    }
  ]
]);

const mockLearnerProfiles = new Map<string, LearnerProfile>([
  [
    "demo-student-user-001",
    {
      user_id: "demo-student-user-001",
      education_level: "senior_secondary",
      academic_track: "science",
      state_name: "Delta",
      class_label: "SSS 3 Science",
      exam_goal: "JAMB UTME / WAEC WASSCE",
      preferred_language: "en",
      streak_days: 7,
      total_xp: 3420,
      study_minutes: 475,
      last_active_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString()
    }
  ],
  [
    "demo-primary-001",
    {
      user_id: "demo-primary-001",
      education_level: "primary",
      academic_track: "general",
      state_name: "Kano",
      class_label: "Primary 5",
      exam_goal: "National Common Entrance Examination (NCEE)",
      preferred_language: "en",
      streak_days: 5,
      total_xp: 1250,
      study_minutes: 180,
      last_active_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString()
    }
  ],
  [
    "demo-jss-002",
    {
      user_id: "demo-jss-002",
      education_level: "junior_secondary",
      academic_track: "general",
      state_name: "Anambra",
      class_label: "JSS 3",
      exam_goal: "Basic Education Certificate Examination (BECE)",
      preferred_language: "en",
      streak_days: 9,
      total_xp: 2840,
      study_minutes: 340,
      last_active_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString()
    }
  ],
  [
    "demo-sss-arts-004",
    {
      user_id: "demo-sss-arts-004",
      education_level: "senior_secondary",
      academic_track: "arts",
      state_name: "Lagos",
      class_label: "SSS 2 Arts",
      exam_goal: "WAEC WASSCE (Arts Track)",
      preferred_language: "en",
      streak_days: 12,
      total_xp: 4150,
      study_minutes: 520,
      last_active_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString()
    }
  ],
  [
    "demo-sss-commercial-005",
    {
      user_id: "demo-sss-commercial-005",
      education_level: "senior_secondary",
      academic_track: "commercial",
      state_name: "Ogun",
      class_label: "SSS 3 Commercial",
      exam_goal: "JAMB UTME (Commercial Track)",
      preferred_language: "en",
      streak_days: 6,
      total_xp: 2980,
      study_minutes: 390,
      last_active_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString()
    }
  ]
]);

const mockGuardianRelations = new Map<string, GuardianRelationship>([
  [
    "rel-001",
    {
      id: "rel-001",
      guardian_user_id: "usr-parent-01",
      guardian_name: "Mrs. Nkechi Okafor",
      learner_user_id: "demo-student-user-001",
      learner_name: "Chidi Okonkwo",
      relationship_label: "Mother",
      status: "accepted",
      consent_recorded_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ],
  [
    "rel-002",
    {
      id: "rel-002",
      guardian_user_id: "demo-parent-006",
      guardian_name: "Dr. Alabi Taiwo",
      learner_user_id: "demo-student-user-001",
      learner_name: "Chisom Okonkwo",
      relationship_label: "Guardian",
      status: "accepted",
      consent_recorded_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ],
  [
    "rel-003",
    {
      id: "rel-003",
      guardian_user_id: "demo-parent-006",
      guardian_name: "Dr. Alabi Taiwo",
      learner_user_id: "demo-primary-001",
      learner_name: "Tobi Adeleke",
      relationship_label: "Father",
      status: "accepted",
      consent_recorded_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ]
]);

export async function getCurrentUser(): Promise<UserProfile | null> {
  let hasSupabaseCookie = false;
  let demoId: string | undefined = undefined;

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const all = cookieStore.getAll();
    hasSupabaseCookie = all.some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
    demoId = cookieStore.get("learnnaija_demo_user_id")?.value;
  } catch {}

  // 1. Real registered user check: Only contact Supabase if auth cookies are actually present
  if (isSupabaseConfigured() && hasSupabaseCookie) {
    try {
      const supabase = await createSupabaseServerClient();
      const authPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase auth timeout")), 800)
      );

      const { data: { user } } = await Promise.race([authPromise, timeoutPromise]);
      if (user) {
        const profilePromise = supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        const profileTimeout = new Promise<{ data: null; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error("profile timeout")), 800)
        );
        const { data: profile } = await Promise.race([profilePromise, profileTimeout]).catch(() => ({ data: null }));

        if (profile) return { ...(profile as UserProfile), is_demo: false };

        // Role deduction from user metadata
        const rawRole = user.user_metadata?.role;
        const safeRole: UserProfile["role"] =
          rawRole === "parent" ? "parent" : rawRole === "teacher" ? "teacher" : "student";

        return {
          id: user.id,
          display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "Scholar",
          role: safeRole,
          locale: "en-NG",
          onboarding_complete: Boolean(user.user_metadata?.onboarding_complete),
          created_at: user.created_at,
          is_demo: false
        };
      }
    } catch {
      // Supabase network error or timeout: Extract user from local JWT cookie so the scholar is NEVER locked out
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const all = cookieStore.getAll();
        const authCookies = all.filter((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
        authCookies.sort((a, b) => a.name.localeCompare(b.name));
        const combined = authCookies.map((c) => c.value).join("");
        const jsonStr = combined.startsWith("base64-") ? Buffer.from(combined.slice(7), "base64").toString("utf-8") : combined;
        const data = JSON.parse(jsonStr);
        const token = Array.isArray(data) ? data[0] : (data.access_token || data);
        if (token && typeof token === "string") {
          const parts = token.split(".");
          if (parts.length >= 2) {
            const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
            if (payload && payload.sub) {
              const email = payload.email || "";
              const displayName = payload.user_metadata?.display_name || payload.user_metadata?.full_name || (email ? email.split("@")[0] : "Scholar");
              return {
                id: payload.sub,
                display_name: displayName,
                role: payload.user_metadata?.role || "student",
                locale: "en-NG",
                onboarding_complete: true,
                created_at: new Date().toISOString(),
                is_demo: false
              };
            }
          }
        }
      } catch {}
    }
  }

  // 2. Demo Persona check: Only inspect demo cookie if there is NO authenticated registered user
  if (demoId && mockProfiles.has(demoId)) {
    const p = mockProfiles.get(demoId);
    return p ? { ...p, is_demo: true } : null;
  }

  // 3. Fallback in development offline mode if Supabase is unconfigured
  if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
    const p = mockProfiles.get("demo-student-user-001");
    return p ? { ...p, is_demo: true } : null;
  }
  return null;
}

export async function getLearnerProfile(userId: string): Promise<LearnerProfile | null> {
  // 1. Fast path: Demo profiles never need remote database lookups (0ms latency)
  if (userId.startsWith("demo-") || mockLearnerProfiles.has(userId)) {
    const mock = mockLearnerProfiles.get(userId);
    if (mock && !mock.academic_track) {
      mock.academic_track = resolveAcademicTrack(mock.class_label, mock.education_level);
    }
    return mock || null;
  }

  // 2. Real user profile from Supabase with 2s timeout guard
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const dbPromise = supabase
        .from("learner_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase profile timeout")), 800)
      );

      const { data } = await Promise.race([dbPromise, timeoutPromise]);

      if (data) {
        const lp = data as LearnerProfile;
        if (!lp.academic_track) {
          lp.academic_track = resolveAcademicTrack(lp.class_label, lp.education_level);
        }
        if (lp.streak_days === undefined || lp.streak_days === null) lp.streak_days = 0;
        if (lp.total_xp === undefined || lp.total_xp === null) lp.total_xp = 0;
        if (lp.study_minutes === undefined || lp.study_minutes === null) lp.study_minutes = 0;
        if (!lp.last_active_date) lp.last_active_date = new Date().toISOString().split("T")[0];
        return lp;
      }
    } catch {
      // Offline fallback
    }
  }

  const mock = mockLearnerProfiles.get(userId);
  if (mock) {
    if (!mock.academic_track) {
      mock.academic_track = resolveAcademicTrack(mock.class_label, mock.education_level);
    }
    return mock;
  }

  // 3. Resilient scholar profile fallback when offline/network timeout
  return {
    user_id: userId,
    education_level: "senior_secondary",
    academic_track: "science",
    state_name: "Delta",
    class_label: "SSS 3 Science",
    exam_goal: "JAMB UTME 2026",
    preferred_language: "en",
    streak_days: 0,
    total_xp: 0,
    study_minutes: 0,
    last_active_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString()
  };
}

export async function updateLearnerProfile(
  userId: string,
  data: Partial<LearnerProfile> & { display_name?: string }
): Promise<LearnerProfile> {
  // Universal statutory level & track resolution for BOTH real and demo users:
  let resolvedEducationLevel = data.education_level;
  let resolvedTrack = data.academic_track;

  if (data.class_label) {
    const cl = data.class_label.toLowerCase();
    if (
      cl.includes("primary") ||
      cl.includes("pri") ||
      cl.includes("basic 1") ||
      cl.includes("basic 2") ||
      cl.includes("basic 3") ||
      cl.includes("basic 4") ||
      cl.includes("basic 5") ||
      cl.includes("basic 6")
    ) {
      resolvedEducationLevel = "primary";
      resolvedTrack = "general";
    } else if (
      cl.includes("jss") ||
      cl.includes("basic 7") ||
      cl.includes("basic 8") ||
      cl.includes("basic 9") ||
      cl.includes("junior")
    ) {
      resolvedEducationLevel = "junior_secondary";
      resolvedTrack = "general";
    } else {
      if (!resolvedEducationLevel || resolvedEducationLevel === "primary" || resolvedEducationLevel === "junior_secondary") {
        resolvedEducationLevel = "senior_secondary";
      }
      resolvedTrack = data.academic_track || resolveAcademicTrack(data.class_label, resolvedEducationLevel);
    }
  } else if (!resolvedEducationLevel) {
    resolvedEducationLevel = "senior_secondary";
    resolvedTrack = resolveAcademicTrack(undefined, resolvedEducationLevel);
  }

  if (!resolvedTrack) {
    resolvedTrack = resolveAcademicTrack(data.class_label, resolvedEducationLevel);
  }

  // 1. Fast path: Demo personas never perform remote Supabase writes (0ms latency)
  if (userId.startsWith("demo-") || mockProfiles.has(userId)) {
    const existing = mockLearnerProfiles.get(userId) || {
      user_id: userId,
      education_level: resolvedEducationLevel,
      academic_track: resolvedTrack,
      preferred_language: "en",
      streak_days: 0,
      total_xp: 0,
      study_minutes: 0,
      last_active_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString()
    };

    const updatedMock: LearnerProfile = {
      ...existing,
      ...data,
      education_level: resolvedEducationLevel,
      academic_track: resolvedTrack,
      class_label: data.class_label ?? existing.class_label,
      exam_goal: data.exam_goal ?? existing.exam_goal,
      state_name: data.state_name ?? existing.state_name,
      preferred_language: data.preferred_language ?? existing.preferred_language
    };

    mockLearnerProfiles.set(userId, updatedMock);

    const profile = mockProfiles.get(userId);
    if (profile) {
      if (data.display_name) profile.display_name = data.display_name;
      profile.onboarding_complete = true;
    }

    return updatedMock;
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      
      const profileUpdates: Record<string, unknown> = { onboarding_complete: true };
      if (data.display_name) {
        profileUpdates.display_name = data.display_name;
      }
      await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", userId);

      const upsertPayload: Record<string, unknown> = {
        user_id: userId,
        education_level: resolvedEducationLevel,
        academic_track: resolvedTrack,
        state_name: data.state_name,
        class_label: data.class_label,
        exam_goal: data.exam_goal,
        preferred_language: data.preferred_language || "en"
      };

      // Ensure real registered new users start cleanly at 0 if not previously established
      const { data: existingDb } = await supabase
        .from("learner_profiles")
        .select("streak_days, total_xp, study_minutes, last_active_date")
        .eq("user_id", userId)
        .maybeSingle();

      upsertPayload.streak_days = data.streak_days !== undefined ? data.streak_days : (existingDb?.streak_days ?? 0);
      upsertPayload.total_xp = data.total_xp !== undefined ? data.total_xp : (existingDb?.total_xp ?? 0);
      upsertPayload.study_minutes = data.study_minutes !== undefined ? data.study_minutes : (existingDb?.study_minutes ?? 0);
      upsertPayload.last_active_date = data.last_active_date || existingDb?.last_active_date || new Date().toISOString().split("T")[0];

      const { data: updated, error } = await supabase
        .from("learner_profiles")
        .upsert(upsertPayload)
        .select()
        .single();

      if (!error && updated) {
        const profile = updated as LearnerProfile;
        profile.academic_track = resolvedTrack;
        return profile;
      }
    } catch {
      // Fallback to local in-memory store
    }
  }

  // Update in mock store
  const existing = mockLearnerProfiles.get(userId) || {
    user_id: userId,
    education_level: resolvedEducationLevel,
    academic_track: resolvedTrack,
    preferred_language: "en",
    streak_days: 0,
    total_xp: 0,
    study_minutes: 0,
    last_active_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString()
  };

  const updatedMock: LearnerProfile = {
    ...existing,
    ...data,
    education_level: resolvedEducationLevel,
    academic_track: resolvedTrack,
    class_label: data.class_label ?? existing.class_label,
    exam_goal: data.exam_goal ?? existing.exam_goal,
    state_name: data.state_name ?? existing.state_name,
    preferred_language: data.preferred_language ?? existing.preferred_language
  };

  mockLearnerProfiles.set(userId, updatedMock);

  const profile = mockProfiles.get(userId);
  if (profile) {
    if (data.display_name) profile.display_name = data.display_name;
    profile.onboarding_complete = true;
  }

  return updatedMock;
}

export async function recordLearnerActivity(
  userId: string,
  addedMinutes: number = 15,
  addedXp: number = 50
): Promise<LearnerProfile | null> {
  const current = await getLearnerProfile(userId);
  if (!current) return null;

  // Evaluate dynamic calendar streak transition via dedicated engine (Africa/Lagos WAT)
  const streakResult = evaluateStreakTransition({
    currentStreak: current.streak_days || 0,
    lastActiveDateStr: current.last_active_date
  });

  const updatedMinutes = (current.study_minutes || 0) + addedMinutes;
  const updatedXp = (current.total_xp || 0) + addedXp;

  return updateLearnerProfile(userId, {
    streak_days: streakResult.newStreak,
    study_minutes: updatedMinutes,
    total_xp: updatedXp,
    last_active_date: streakResult.todayLagosStr
  });
}

export async function listGuardianRelationships(userId: string): Promise<GuardianRelationship[]> {
  // 1. Fast path: Demo personas use in-memory mock relations directly (0ms latency)
  if (userId.startsWith("demo-") || mockProfiles.has(userId)) {
    return Array.from(mockGuardianRelations.values()).filter(
      (r) => r.guardian_user_id === userId || r.learner_user_id === userId
    );
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const dbPromise = supabase
        .from("guardian_relationships")
        .select("*")
        .or(`guardian_user_id.eq.${userId},learner_user_id.eq.${userId}`);
      const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error("guardian timeout")), 800)
      );
      const { data } = await Promise.race([dbPromise, timeoutPromise]);

      if (data) return data as GuardianRelationship[];
    } catch {
      // Offline fallback
    }
  }

  return Array.from(mockGuardianRelations.values()).filter(
    (r) => r.guardian_user_id === userId || r.learner_user_id === userId
  );
}

export async function inviteGuardian(
  learnerUserId: string,
  guardianEmailOrPhone: string,
  relationshipLabel: string
): Promise<GuardianRelationship> {
  const relId = `rel-${Date.now()}`;
  const invite: GuardianRelationship = {
    id: relId,
    guardian_user_id: `invited-${guardianEmailOrPhone}`,
    guardian_name: guardianEmailOrPhone,
    learner_user_id: learnerUserId,
    relationship_label: relationshipLabel,
    status: "pending",
    created_at: new Date().toISOString()
  };

  mockGuardianRelations.set(relId, invite);
  return invite;
}

export async function updateGuardianRelationshipStatus(
  relationshipId: string,
  status: "accepted" | "revoked"
): Promise<GuardianRelationship> {
  const existing = mockGuardianRelations.get(relationshipId);
  if (!existing) throw new Error("Relationship not found");

  existing.status = status;
  if (status === "accepted") {
    existing.consent_recorded_at = new Date().toISOString();
  }

  mockGuardianRelations.set(relationshipId, existing);
  return existing;
}

export interface GuardianLinkToken {
  token: string;
  learner_user_id: string;
  relationship_label: string;
  guardian_identifier: string;
  expires_at: string;
  is_claimed: boolean;
  created_at: string;
}

const mockGuardianTokens = new Map<string, GuardianLinkToken>();

export async function generateGuardianLinkToken(
  learnerUserId: string,
  guardianIdentifier: string,
  relationshipLabel: string = "Guardian"
): Promise<{ token: string; expiresAt: string; shareUrl: string }> {
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const token = `LNR-${randomSuffix}`;
  const expiresAt = new Date(Date.now() + 72 * 3600 * 1000).toISOString();

  const entry: GuardianLinkToken = {
    token,
    learner_user_id: learnerUserId,
    relationship_label: relationshipLabel,
    guardian_identifier: guardianIdentifier,
    expires_at: expiresAt,
    is_claimed: false,
    created_at: new Date().toISOString()
  };

  mockGuardianTokens.set(token, entry);

  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdminClient();
      if (admin) {
        await admin.from("guardian_link_tokens").insert({
          token,
          learner_user_id: learnerUserId,
          relationship_label: relationshipLabel,
          guardian_identifier: guardianIdentifier,
          expires_at: expiresAt
        });
      }
    } catch (e) {
      console.warn("Could not persist guardian token to Supabase:", e);
    }
  }

  return {
    token,
    expiresAt,
    shareUrl: `/guardian?token=${token}`
  };
}

export async function claimGuardianLinkToken(
  guardianUserId: string,
  guardianName: string,
  token: string
): Promise<{ success: boolean; relationship?: GuardianRelationship; error?: string }> {
  const cleanToken = token.trim().toUpperCase();
  let record = mockGuardianTokens.get(cleanToken);

  if (!record && isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdminClient();
      if (admin) {
        const { data } = await admin
          .from("guardian_link_tokens")
          .select("*")
          .eq("token", cleanToken)
          .single();
        if (data) {
          record = data as GuardianLinkToken;
        }
      }
    } catch {}
  }

  if (!record) {
    return { success: false, error: "Invalid or nonexistent guardian invitation code." };
  }

  if (record.is_claimed) {
    return { success: false, error: "This guardian invitation link has already been claimed." };
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return { success: false, error: "This invitation link has expired (72-hour validity window exceeded)." };
  }

  record.is_claimed = true;
  mockGuardianTokens.set(cleanToken, record);

  const relId = `rel-${Date.now()}`;
  const relationship: GuardianRelationship = {
    id: relId,
    guardian_user_id: guardianUserId,
    guardian_name: guardianName,
    learner_user_id: record.learner_user_id,
    relationship_label: record.relationship_label || "Guardian",
    status: "accepted",
    consent_recorded_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  mockGuardianRelations.set(relId, relationship);

  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdminClient();
      if (admin) {
        await admin.from("guardian_relationships").upsert({
          guardian_user_id: guardianUserId,
          learner_user_id: record.learner_user_id,
          guardian_name: guardianName,
          relationship_label: record.relationship_label,
          status: "accepted",
          consent_recorded_at: new Date().toISOString()
        });
        await admin.from("guardian_link_tokens").update({ is_claimed: true, claimed_by_guardian_id: guardianUserId }).eq("token", cleanToken);
      }
    } catch {}
  }

  return { success: true, relationship };
}


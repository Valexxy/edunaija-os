/**
 * LearnNaija OS - AI Concierge Persistent Memory Engine ("Sister Amaka / Brother Femi")
 * 
 * Provides long-term persistent memory for AI pedagogical interactions with zero token waste:
 * 1. Tracks student identity, state, academic tier, target exam/university cut-off, and weak topics.
 * 2. Compresses knowledge graph into an ultra-compact prompt context tag (<= 60 tokens).
 * 3. Enforces NDPA 2023 user data sovereignty with instant memory inspection and erasure.
 */

export type ConciergePersona = "sister_amaka" | "brother_femi";

export interface ConciergeMemoryGraph {
  scholarName: string;
  state: string;
  lga: string;
  academicTier: "primary" | "junior_secondary" | "senior_secondary" | "exam_prep";
  classLabel: string;
  targetExam: string;
  targetGoal: string; // e.g. "UNILAG Medicine & Surgery (Cutoff: 310)"
  weakTopics: string[];
  preferredPersona: ConciergePersona;
  analogyStyle: "daily_life_nigerian" | "exam_formula_rigorous";
  lastActiveIso: string;
}

export const DEFAULT_CONCIERGE_MEMORY: ConciergeMemoryGraph = {
  scholarName: "Chukwudi Okafor",
  state: "Lagos",
  lga: "Lagos Island",
  academicTier: "senior_secondary",
  classLabel: "SSS 3 Science",
  targetExam: "JAMB UTME 2027",
  targetGoal: "UNILAG Medicine & Surgery (Target: 310+)",
  weakTopics: ["Chemistry: Redox Equations", "Physics: Projectile Motion"],
  preferredPersona: "sister_amaka",
  analogyStyle: "daily_life_nigerian",
  lastActiveIso: new Date().toISOString()
};

const STORAGE_KEY = "edunaija_concierge_memory_v1";

/**
 * Loads the persistent memory graph from localStorage / client storage.
 */
export function loadConciergeMemory(): ConciergeMemoryGraph {
  if (typeof window === "undefined") {
    return DEFAULT_CONCIERGE_MEMORY;
  }

  try {
    const base = { ...DEFAULT_CONCIERGE_MEMORY };
    // Dynamically synchronize scholarName with the authenticated / active user session
    const sessionStr = sessionStorage.getItem("learnnaija_session_user");
    if (sessionStr) {
      try {
        const u = JSON.parse(sessionStr);
        if (u.display_name) {
          base.scholarName = u.display_name;
        }
      } catch {}
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    const resolvedName = base.scholarName !== "Scholar" ? base.scholarName : (parsed.scholarName && parsed.scholarName !== "Chukwudi Okafor" ? parsed.scholarName : "Scholar");
    return { ...base, ...parsed, scholarName: resolvedName };
  } catch {
    return DEFAULT_CONCIERGE_MEMORY;
  }
}

/**
 * Saves the updated memory graph into client storage.
 */
export function saveConciergeMemory(memory: Partial<ConciergeMemoryGraph>): ConciergeMemoryGraph {
  if (typeof window === "undefined") {
    return DEFAULT_CONCIERGE_MEMORY;
  }

  try {
    const current = loadConciergeMemory();
    const updated: ConciergeMemoryGraph = {
      ...current,
      ...memory,
      lastActiveIso: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_CONCIERGE_MEMORY;
  }
}

/**
 * Erases memory completely in compliance with NDPA 2023 Right to Erasure.
 */
export function wipeConciergeMemory(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Zero-Token-Waste Context Compression:
 * Compresses the full student memory graph into an ultra-compact tag of <= 60 tokens.
 */
export function compressMemoryForPrompt(memory: ConciergeMemoryGraph): string {
  const weakSummary = memory.weakTopics.slice(0, 2).map((t) => t.split(":")[1]?.trim() || t).join(", ");
  const personaLabel = memory.preferredPersona === "sister_amaka" ? "Sister Amaka (Warm/Analogies)" : "Brother Femi (Rigorous/PastQ)";
  
  return `[Learner: ${memory.scholarName} (${memory.classLabel}, ${memory.state}) | Goal: ${memory.targetGoal} | Weak: ${weakSummary || "None"} | Persona: ${personaLabel}]`;
}

/**
 * Generates the persona guidance block for the system prompt.
 */
export function getPersonaPromptInstruction(persona: ConciergePersona): string {
  if (persona === "brother_femi") {
    return `Persona: Brother Femi. You are an authoritative, rigorous Nigerian exam master. You focus on WAEC/JAMB marking schemes, time-saving shortcuts, precise mathematical notation, and disciplined academic grit. Speak with respectful firmness and high scholastic standards.`;
  }

  // Default: Sister Amaka
  return `Persona: Sister Amaka. You are an empathetic, encouraging Nigerian big sister and master educator. You use vivid everyday Nigerian analogies (cooking jollof rice, market commerce, Lagos traffic dynamics, solar inverters) to make complex concepts crystal clear. Encourage the scholar enthusiastically.`;
}

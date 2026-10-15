/**
 * LearnNaija OS - Dynamic Progression & Gamification Engine
 * 
 * Evaluates learner streaks, XP points, accuracy multipliers, and milestone
 * progression dynamically with zero hardcoded values.
 * All calendar calculations strictly adhere to Africa/Lagos (WAT / UTC+1) time.
 */

export interface StreakEvaluationInput {
  currentStreak: number;
  lastActiveDateStr?: string | null;
  targetDate?: Date;
  hasStreakFreeze?: boolean;
}

export interface StreakEvaluationResult {
  newStreak: number;
  streakMaintained: boolean;
  streakIncremented: boolean;
  streakReset: boolean;
  freezeConsumed: boolean;
  daysDiff: number;
  todayLagosStr: string;
  milestoneReached: string | null;
}

export interface XpCalculationInput {
  isCorrect: boolean;
  difficulty?: "easy" | "medium" | "hard";
  currentStreakDays?: number;
  timeSpentSeconds?: number;
  expectedPaceSeconds?: number;
  topicMasteryLevel?: number; // 0 - 100%
}

export interface XpCalculationResult {
  baseXp: number;
  difficultyMultiplier: number;
  streakMultiplier: number;
  paceBonusXp: number;
  masteryBonusXp: number;
  totalXpAwarded: number;
  breakdown: string;
}

/**
 * Get current date string in Africa/Lagos timezone (YYYY-MM-DD).
 */
export function getLagosDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(date); // outputs YYYY-MM-DD
}

/**
 * Calculates day difference between two YYYY-MM-DD dates in calendar days.
 */
export function getCalendarDaysDifference(earlierDateStr: string, laterDateStr: string): number {
  const [y1, m1, d1] = earlierDateStr.split("-").map(Number);
  const [y2, m2, d2] = laterDateStr.split("-").map(Number);
  
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utc2 - utc1) / msPerDay);
}

/**
 * Dynamic Streak Evaluation Engine
 * Pure mathematical calendar evaluation.
 */
export function evaluateStreakTransition({
  currentStreak,
  lastActiveDateStr,
  targetDate = new Date(),
  hasStreakFreeze = false
}: StreakEvaluationInput): StreakEvaluationResult {
  const todayLagos = getLagosDateString(targetDate);

  if (!lastActiveDateStr) {
    // Brand new user or first activity recorded
    return {
      newStreak: 1,
      streakMaintained: false,
      streakIncremented: true,
      streakReset: false,
      freezeConsumed: false,
      daysDiff: 0,
      todayLagosStr: todayLagos,
      milestoneReached: getStreakMilestone(1)
    };
  }

  const daysDiff = getCalendarDaysDifference(lastActiveDateStr, todayLagos);

  if (daysDiff <= 0) {
    // Already studied today! Streak is maintained without double-incrementing.
    return {
      newStreak: Math.max(1, currentStreak),
      streakMaintained: true,
      streakIncremented: false,
      streakReset: false,
      freezeConsumed: false,
      daysDiff,
      todayLagosStr: todayLagos,
      milestoneReached: null
    };
  }

  if (daysDiff === 1) {
    // Perfect consecutive calendar day in Nigeria!
    const updatedStreak = currentStreak + 1;
    return {
      newStreak: updatedStreak,
      streakMaintained: false,
      streakIncremented: true,
      streakReset: false,
      freezeConsumed: false,
      daysDiff,
      todayLagosStr: todayLagos,
      milestoneReached: getStreakMilestone(updatedStreak)
    };
  }

  // Learner missed 1 or more calendar days (daysDiff > 1)
  if (hasStreakFreeze) {
    // Safeguarded by Streak Freeze Shield!
    return {
      newStreak: Math.max(1, currentStreak),
      streakMaintained: true,
      streakIncremented: false,
      streakReset: false,
      freezeConsumed: true,
      daysDiff,
      todayLagosStr: todayLagos,
      milestoneReached: null
    };
  }

  // Unprotected break: streak resets to 1 (representing today's restart activity)
  return {
    newStreak: 1,
    streakMaintained: false,
    streakIncremented: false,
    streakReset: true,
    freezeConsumed: false,
    daysDiff,
    todayLagosStr: todayLagos,
    milestoneReached: getStreakMilestone(1)
  };
}

/**
 * Returns celebratory milestone moniker if reached.
 */
export function getStreakMilestone(streakDays: number): string | null {
  if (streakDays === 3) return "3-Day Study Ignition 🔥";
  if (streakDays === 7) return "7-Day Consistent Scholar 🏆";
  if (streakDays === 14) return "14-Day WAEC/JAMB Champion ⚡";
  if (streakDays === 30) return "30-Day Sovereign Master 👑";
  if (streakDays === 60) return "60-Day Unstoppable Prodigy 💎";
  if (streakDays === 100) return "100-Day Centurion Legend 🌟";
  return null;
}

/**
 * Dynamic XP Calculation Engine
 * Replaces static points with pedagogical accuracy, pace, and streak weighting.
 */
export function calculateDynamicXp({
  isCorrect,
  difficulty = "medium",
  currentStreakDays = 0,
  timeSpentSeconds = 45,
  expectedPaceSeconds = 60,
  topicMasteryLevel = 0
}: XpCalculationInput): XpCalculationResult {
  if (!isCorrect) {
    // Consolation learning resilience point
    return {
      baseXp: 5,
      difficultyMultiplier: 1.0,
      streakMultiplier: 1.0,
      paceBonusXp: 0,
      masteryBonusXp: 0,
      totalXpAwarded: 5,
      breakdown: "5 XP (Effort & Misconception Logged)"
    };
  }

  // 1. Base XP by Difficulty
  const difficultyMap: Record<string, { base: number; mult: number }> = {
    easy: { base: 15, mult: 1.0 },
    medium: { base: 25, mult: 1.25 },
    hard: { base: 40, mult: 1.5 }
  };
  const diffConfig = difficultyMap[difficulty] || difficultyMap.medium;

  // 2. Streak Multiplier: +5% per streak day, capped at 2.0x (100% bonus at 20 days)
  const streakMultiplier = Number(Math.min(2.0, 1.0 + Math.max(0, currentStreakDays) * 0.05).toFixed(2));

  // 3. Pace Efficiency: Answering within optimal window without careless guessing (<5s is guessing)
  let paceBonusXp = 0;
  if (timeSpentSeconds >= 8 && timeSpentSeconds <= expectedPaceSeconds) {
    paceBonusXp = Math.round(diffConfig.base * 0.2); // 20% pace bonus
  }

  // 4. Mastery Escalation: Bonus for pushing a low-mastery topic or maintaining high mastery
  let masteryBonusXp = 0;
  if (topicMasteryLevel >= 85) {
    masteryBonusXp = 10; // Mastery retention reward
  } else if (topicMasteryLevel < 50) {
    masteryBonusXp = 15; // Growth breakthrough reward
  }

  const rawXp = (diffConfig.base * diffConfig.mult * streakMultiplier) + paceBonusXp + masteryBonusXp;
  const totalXpAwarded = Math.round(rawXp);

  return {
    baseXp: diffConfig.base,
    difficultyMultiplier: diffConfig.mult,
    streakMultiplier,
    paceBonusXp,
    masteryBonusXp,
    totalXpAwarded,
    breakdown: `${diffConfig.base} base × ${diffConfig.mult} (${difficulty}) × ${streakMultiplier} (${currentStreakDays}d streak) + ${paceBonusXp} pace + ${masteryBonusXp} mastery = ${totalXpAwarded} XP`
  };
}

/**
 * Calculates dynamic assessment completion reward.
 */
export function calculateAssessmentCompletionXp(
  scorePercentage: number,
  totalQuestions: number,
  timeSpentSeconds: number
): { totalXp: number; accuracyBonus: number; completionBonus: number } {
  const completionBonus = totalQuestions * 10;
  const accuracyBonus = Math.round((scorePercentage / 100) * (totalQuestions * 20));
  const timeFactor = timeSpentSeconds > 120 ? 25 : 10;

  return {
    completionBonus,
    accuracyBonus,
    totalXp: completionBonus + accuracyBonus + timeFactor
  };
}

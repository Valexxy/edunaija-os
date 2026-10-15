/**
 * Historical Question & Mistake Store for LearnNaija OS
 * Persists answered questions, explanations, user selections, and verified mastery
 * so students can revisit weak items and receive Socratic AI guidance at any time.
 */

export interface HistoricalQuestion {
  id: string;
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  questionId: string;
  prompt: string;
  isCorrect: boolean;
  explanation: string;
  subject: string;
  timestamp: string;
  mastered?: boolean;
  masteredAt?: string;
  userAnswer?: string;
  correctAnswer?: string;
  aiExplanation?: string;
  options?: Array<{ id: string; text: string }>;
}

const STORAGE_KEY = 'edunaija_question_history_v1';

// Starter questions for demonstration and instant practice
export const STARTER_HISTORICAL_QUESTIONS: HistoricalQuestion[] = [
  {
    id: "seed-init-01",
    attemptId: "att-seed-01",
    assessmentId: "cbt-waec-math-2026",
    assessmentTitle: "WAEC General Mathematics Practice Drill",
    questionId: "qst-math-01",
    prompt: "Solve the quadratic equation: 2x² - 5x + 2 = 0 using factorization.",
    isCorrect: false,
    explanation: "Factorize 2x² - 4x - x + 2 = 0 => 2x(x - 2) - 1(x - 2) = 0 => (2x - 1)(x - 2) = 0. Therefore, x = 1/2 or x = 2.",
    subject: "General Mathematics",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    mastered: false,
    userAnswer: "x = -1/2 or x = -2",
    correctAnswer: "x = 1/2 or x = 2"
  },
  {
    id: "seed-init-02",
    attemptId: "att-seed-01",
    assessmentId: "cbt-waec-math-2026",
    assessmentTitle: "WAEC General Mathematics Practice Drill",
    questionId: "qst-math-02",
    prompt: "If log₁₀(2) = 0.3010 and log₁₀(3) = 0.4771, calculate log₁₀(18) without tables.",
    isCorrect: true,
    explanation: "log₁₀(18) = log₁₀(2 × 3²) = log₁₀(2) + 2·log₁₀(3) = 0.3010 + 2(0.4771) = 0.3010 + 0.9542 = 1.2552.",
    subject: "General Mathematics",
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    mastered: false,
    userAnswer: "1.2552",
    correctAnswer: "1.2552"
  },
  {
    id: "seed-init-03",
    attemptId: "att-seed-02",
    assessmentId: "cbt-jamb-phy-2026",
    assessmentTitle: "JAMB UTME Physics Mock Challenge",
    questionId: "qst-phy-01",
    prompt: "A body of mass 4kg is moving with velocity 10m/s. Calculate its kinetic energy.",
    isCorrect: false,
    explanation: "Kinetic Energy KE = 1/2 m v² = 0.5 × 4 × (10)² = 2 × 100 = 200 Joules.",
    subject: "Physics",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    mastered: false,
    userAnswer: "40 Joules",
    correctAnswer: "200 Joules"
  }
];

export function saveAttemptQuestions(
  attemptId: string,
  assessmentId: string,
  assessmentTitle: string,
  subject: string,
  feedbackItems: Array<{
    questionId: string;
    prompt: string;
    isCorrect: boolean;
    explanation: string;
    userAnswer?: string;
    correctAnswer?: string;
    selectedOptionId?: string;
    correctOptionId?: string;
  }>
): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getHistoricalQuestions();
    const now = new Date().toISOString();

    const newEntries: HistoricalQuestion[] = feedbackItems.map((item, idx) => ({
      id: `${attemptId}-${item.questionId}-${idx}`,
      attemptId,
      assessmentId,
      assessmentTitle,
      questionId: item.questionId,
      prompt: item.prompt,
      isCorrect: Boolean(item.isCorrect),
      explanation: item.explanation || "Review curriculum topic standard.",
      subject: subject || 'General Mathematics',
      timestamp: now,
      mastered: false,
      userAnswer: item.userAnswer || item.selectedOptionId || "Unanswered",
      correctAnswer: item.correctAnswer || item.correctOptionId || "Option verified"
    }));

    // Prepend new questions, deduplicating against any existing with the same ID
    const newIds = new Set(newEntries.map((e) => e.id));
    const filteredExisting = existing.filter((e) => !newIds.has(e.id));
    const merged = [...newEntries, ...filteredExisting].slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('edunaija:history_updated'));
  } catch (err) {
    console.warn('Could not save question history to local storage', err);
  }
}

export function getHistoricalQuestions(): HistoricalQuestion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Deduplicate by ID to guarantee unique items
    const seen = new Set<string>();
    const unique: HistoricalQuestion[] = [];
    for (const item of parsed) {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    return unique;
  } catch {
    return [];
  }
}

/**
 * Returns unresolved questions that were missed and need revision
 */
export function getMissedQuestions(): HistoricalQuestion[] {
  return getHistoricalQuestions().filter((q) => !q.isCorrect && !q.mastered);
}

/**
 * Returns questions previously answered incorrectly that have now been mastered
 */
export function getMasteredQuestions(): HistoricalQuestion[] {
  return getHistoricalQuestions().filter((q) => !q.isCorrect && q.mastered === true);
}

/**
 * Marks a question as mastered (or unmastered)
 */
export function markQuestionAsMastered(id: string, mastered: boolean = true): void {
  if (typeof window === 'undefined') return;
  try {
    const questions = getHistoricalQuestions();
    const index = questions.findIndex((q) => q.id === id);
    if (index !== -1) {
      questions[index] = {
        ...questions[index],
        mastered,
        masteredAt: mastered ? new Date().toISOString() : undefined
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
      window.dispatchEvent(new CustomEvent('edunaija:history_updated'));
    }
  } catch (err) {
    console.warn('Could not mark question as mastered', err);
  }
}

/**
 * Caches an AI explanation for an answered question
 */
export function saveQuestionAiExplanation(id: string, explanation: string): void {
  if (typeof window === 'undefined') return;
  try {
    const questions = getHistoricalQuestions();
    const index = questions.findIndex((q) => q.id === id);
    if (index !== -1) {
      questions[index] = {
        ...questions[index],
        aiExplanation: explanation
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
      window.dispatchEvent(new CustomEvent('edunaija:history_updated'));
    }
  } catch (err) {
    console.warn('Could not save AI explanation to question history', err);
  }
}

/**
 * Seeds practice sample questions for immediate demonstration
 */
export function seedStarterPracticeQuestions(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STARTER_HISTORICAL_QUESTIONS));
    window.dispatchEvent(new CustomEvent('edunaija:history_updated'));
  } catch (err) {
    console.warn('Could not seed starter questions', err);
  }
}

export function clearQuestionHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('edunaija:history_updated'));
}

/**
 * H5P-Compatible Interactive Learning Content Engine
 * Enables standardized, reusable interactive learning exercises (quizzes, drag-text, flashcards)
 * and generates standard xAPI statements for mastery tracking without heavy server bloat.
 */

export type H5PLibraryType =
  | "H5P.MultiChoice"
  | "H5P.DragText"
  | "H5P.Dialogcards"
  | "H5P.TrueFalse";

export interface H5PActivityDefinition {
  id: string;
  title: string;
  library: H5PLibraryType;
  subject: string;
  gradeLevel: string;
  params: {
    question?: string;
    description?: string;
    options?: Array<{ text: string; correct: boolean; tip?: string }>;
    cards?: Array<{ front: string; back: string; tip?: string }>;
    dropTextTemplate?: string; // e.g. "Water freezes at *0* degrees and boils at *100* degrees."
  };
}

export interface H5PEvaluationResult {
  score: number;
  maxScore: number;
  passed: boolean;
  scaledScore: number; // 0.0 to 1.0
  feedback: string;
  xapiStatement: {
    actor: { id: string };
    verb: { id: string; display: string };
    object: { id: string; title: string };
    result: { score: { raw: number; max: number; scaled: number }; success: boolean };
    timestamp: string;
  };
}

export class H5PActivityEngine {
  /**
   * Evaluates student submissions against H5P definitions
   */
  public evaluate(
    activity: H5PActivityDefinition,
    userAnswer: unknown,
    userId: string = "anonymous-learner"
  ): H5PEvaluationResult {
    switch (activity.library) {
      case "H5P.MultiChoice":
        return this.evaluateMultiChoice(activity, userAnswer, userId);
      case "H5P.TrueFalse":
        return this.evaluateTrueFalse(activity, userAnswer, userId);
      case "H5P.DragText":
        return this.evaluateDragText(activity, userAnswer, userId);
      case "H5P.Dialogcards":
        return this.evaluateDialogCards(activity, userAnswer, userId);
      default:
        throw new Error(`Unsupported H5P library format: ${activity.library}`);
    }
  }

  private evaluateMultiChoice(
    activity: H5PActivityDefinition,
    userAnswer: unknown,
    userId: string
  ): H5PEvaluationResult {
    const options = activity.params.options || [];
    const correctIndex = options.findIndex((o) => o.correct);
    const selectedIndex = typeof userAnswer === "number" ? userAnswer : Number(userAnswer);

    const isCorrect = selectedIndex === correctIndex;
    const score = isCorrect ? 1 : 0;
    const maxScore = 1;

    return this.buildResult(
      activity,
      userId,
      score,
      maxScore,
      isCorrect ? "Correct! Well done." : "Not quite. Review the explanation and try again."
    );
  }

  private evaluateTrueFalse(
    activity: H5PActivityDefinition,
    userAnswer: unknown,
    userId: string
  ): H5PEvaluationResult {
    const options = activity.params.options || [];
    const correctVal = options[0]?.correct ?? true;
    const userVal = Boolean(userAnswer);

    const isCorrect = userVal === correctVal;
    return this.buildResult(
      activity,
      userId,
      isCorrect ? 1 : 0,
      1,
      isCorrect ? "Correct answer!" : "Incorrect."
    );
  }

  private evaluateDragText(
    activity: H5PActivityDefinition,
    userAnswer: unknown,
    userId: string
  ): H5PEvaluationResult {
    // Expected answers are surrounded by asterisks *word*
    const template = activity.params.dropTextTemplate || "";
    const matches = [...template.matchAll(/\*([^\*]+)\*/g)].map((m) => m[1].trim().toLowerCase());
    const submittedWords = Array.isArray(userAnswer)
      ? userAnswer.map((w) => String(w).trim().toLowerCase())
      : [];

    let correctCount = 0;
    const totalBlanks = matches.length;

    matches.forEach((expected, idx) => {
      if (submittedWords[idx] === expected) {
        correctCount++;
      }
    });

    return this.buildResult(
      activity,
      userId,
      correctCount,
      totalBlanks,
      `You got ${correctCount} of ${totalBlanks} blanks correct.`
    );
  }

  private evaluateDialogCards(
    activity: H5PActivityDefinition,
    userAnswer: unknown,
    userId: string
  ): H5PEvaluationResult {
    // Flashcard deck: user confirms cards remembered
    const cards = activity.params.cards || [];
    const masteredCount = typeof userAnswer === "number" ? userAnswer : cards.length;
    return this.buildResult(
      activity,
      userId,
      masteredCount,
      cards.length,
      `Mastered ${masteredCount} of ${cards.length} flashcards.`
    );
  }

  private buildResult(
    activity: H5PActivityDefinition,
    userId: string,
    rawScore: number,
    maxScore: number,
    feedback: string
  ): H5PEvaluationResult {
    const scaled = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) / 100 : 1;
    const passed = scaled >= 0.7;

    return {
      score: rawScore,
      maxScore,
      passed,
      scaledScore: scaled,
      feedback,
      xapiStatement: {
        actor: { id: userId },
        verb: {
          id: "http://adlnet.gov/expapi/verbs/completed",
          display: "completed",
        },
        object: {
          id: `learnnaija://h5p/${activity.id}`,
          title: activity.title,
        },
        result: {
          score: { raw: rawScore, max: maxScore, scaled },
          success: passed,
        },
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export const h5pEngine = new H5PActivityEngine();

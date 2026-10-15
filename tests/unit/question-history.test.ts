import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import {
  saveAttemptQuestions,
  getHistoricalQuestions,
  getMissedQuestions,
  getMasteredQuestions,
  markQuestionAsMastered,
  clearQuestionHistory
} from '@/lib/assessment/history-store';

describe('Question History & Mistake Vault Store', () => {
  const store: Record<string, string> = {};

  beforeAll(() => {
    const mockLocalStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => { store[key] = String(val); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    };

    (globalThis as any).window = {
      dispatchEvent: () => true
    };
    (globalThis as any).localStorage = mockLocalStorage;
    (globalThis as any).CustomEvent = class { constructor(public type: string) {} };
  });

  afterAll(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).localStorage;
    delete (globalThis as any).CustomEvent;
  });

  beforeEach(() => {
    Object.keys(store).forEach(k => delete store[k]);
  });

  it('saves attempt questions and retrieves them in chronological order', () => {
    const feedback = [
      {
        questionId: 'q-math-01',
        prompt: 'Solve for x: 2x + 4 = 10',
        isCorrect: true,
        explanation: 'Subtract 4 and divide by 2: x = 3.'
      },
      {
        questionId: 'q-math-02',
        prompt: 'What is the discriminant of x^2 - 4x + 4 = 0?',
        isCorrect: false,
        explanation: 'b^2 - 4ac = 16 - 16 = 0.'
      }
    ];

    saveAttemptQuestions('att-101', 'asm-alg-sprint', 'Algebra Sprint', 'Mathematics', feedback);

    const all = getHistoricalQuestions();
    expect(all).toHaveLength(2);
    expect(all[0].prompt).toBe('Solve for x: 2x + 4 = 10');
    expect(all[1].prompt).toBe('What is the discriminant of x^2 - 4x + 4 = 0?');
    expect(all[0].subject).toBe('Mathematics');
  });

  it('filters missed questions for targeted Socratic revision', () => {
    const feedback = [
      {
        questionId: 'q-phy-01',
        prompt: 'State Newton’s Second Law',
        isCorrect: true,
        explanation: 'F = ma'
      },
      {
        questionId: 'q-phy-02',
        prompt: 'Calculate momentum of 2kg mass at 3m/s',
        isCorrect: false,
        explanation: 'p = mv = 2 * 3 = 6 kg m/s'
      }
    ];

    saveAttemptQuestions('att-102', 'asm-phy-sprint', 'Physics Sprint', 'Physics', feedback);

    const missed = getMissedQuestions();
    expect(missed).toHaveLength(1);
    expect(missed[0].questionId).toBe('q-phy-02');
    expect(missed[0].isCorrect).toBe(false);
  });

  it('clears history completely when requested', () => {
    saveAttemptQuestions('att-103', 'asm-test', 'Test', 'English', [
      {
        questionId: 'q-eng-01',
        prompt: 'Identify the noun phrase',
        isCorrect: false,
        explanation: 'A tall boy is the subject noun phrase.'
      }
    ]);

    expect(getHistoricalQuestions()).toHaveLength(1);
    clearQuestionHistory();
    expect(getHistoricalQuestions()).toHaveLength(0);
    expect(getMissedQuestions()).toHaveLength(0);
  });

  it('guarantees unique IDs and prevents duplicates when saving repeatedly', () => {
    const feedback = [
      {
        questionId: 'qst-math-01',
        prompt: 'Solve for x: 3x = 9',
        isCorrect: false,
        explanation: 'x = 3'
      }
    ];

    // Call saveAttemptQuestions twice with the exact same attemptId
    saveAttemptQuestions('att-same-id', 'asm-test', 'Test', 'Math', feedback);
    saveAttemptQuestions('att-same-id', 'asm-test', 'Test', 'Math', feedback);

    const questions = getHistoricalQuestions();
    expect(questions).toHaveLength(1);
    expect(questions[0].id).toBe('att-same-id-qst-math-01-0');
  });

  it('correctly pipes questions between Mistake Bank, Mastered items, and All Answered', () => {
    saveAttemptQuestions('att-pipe-test', 'asm-eval', 'Science Sprint', 'Basic Science', [
      {
        questionId: 'q-sci-01',
        prompt: 'What organ pumps blood?',
        isCorrect: false,
        explanation: 'The heart pumps blood through the circulatory system.'
      },
      {
        questionId: 'q-sci-02',
        prompt: 'What is the chemical formula for water?',
        isCorrect: true,
        explanation: 'Water is H2O.'
      }
    ]);

    // Initial state: 1 missed, 0 mastered, 2 all
    expect(getMissedQuestions()).toHaveLength(1);
    expect(getMasteredQuestions()).toHaveLength(0);
    expect(getHistoricalQuestions()).toHaveLength(2);

    const missedQId = getMissedQuestions()[0].id;

    // Student reviews the missed question with AI Tutor and marks as Mastered
    markQuestionAsMastered(missedQId, true);

    // After mastery: 0 missed (needs revision), 1 mastered, 2 all
    expect(getMissedQuestions()).toHaveLength(0);
    expect(getMasteredQuestions()).toHaveLength(1);
    expect(getMasteredQuestions()[0].id).toBe(missedQId);
    expect(getMasteredQuestions()[0].mastered).toBe(true);
    expect(getMasteredQuestions()[0].masteredAt).toBeTruthy();
    expect(getHistoricalQuestions()).toHaveLength(2);
  });
});


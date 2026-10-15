import type { PublicQuestionItem } from "@/lib/curriculum/types";

/**
 * Procedural Question Generator for LearnNaija OS
 * Randomizes coefficients and generates mathematically valid STEM items
 * so repeated CBT drills never present identical static memorized questions.
 */

export function generateProceduralQuadraticQuestion(): PublicQuestionItem {
  // Generate random integer roots p, q between 1 and 8
  const p = Math.floor(Math.random() * 7) + 2;
  let q = Math.floor(Math.random() * 7) + 2;
  if (p === q) q += 1;

  // (x - p)(x - q) = x^2 - (p + q)x + (p*q) = 0
  const b = p + q;
  const c = p * q;

  const correctRoots = `x = ${p} or x = ${q}`;
  const distractor1 = `x = ${-p} or x = ${-q}`;
  const distractor2 = `x = ${p} or x = ${-q}`;
  const distractor3 = `x = ${p + 1} or x = ${q - 1}`;

  const options = [
    { id: "A", text: correctRoots },
    { id: "B", text: distractor1 },
    { id: "C", text: distractor2 },
    { id: "D", text: distractor3 }
  ];

  // Deterministic shuffle
  const shuffled = options.sort(() => Math.random() - 0.5);

  const randSuffix = Math.random().toString(36).substring(2, 8);
  return {
    id: `proc-math-quad-${Date.now()}-${p}-${q}-${randSuffix}`,
    topic_id: "sec-math-algebra-quadratics",
    question_type: "single_choice",
    prompt: `Solve the quadratic equation: x² - ${b}x + ${c} = 0.`,
    options: shuffled,
    difficulty: 3,
    status: "published",
    provenance: "ai_generated"
  };
}

export function generateProceduralOhmsLawQuestion(): PublicQuestionItem {
  // V = I * R
  const i = Math.floor(Math.random() * 6) + 2; // Current 2 - 7 A
  const r = Math.floor(Math.random() * 15) + 5; // Resistance 5 - 20 ohms
  const v = i * r;

  const options = [
    { id: "A", text: `${v} V` },
    { id: "B", text: `${v + 10} V` },
    { id: "C", text: `${Math.round(r / i)} V` },
    { id: "D", text: `${v - 6} V` }
  ].sort(() => Math.random() - 0.5);

  const randSuffix = Math.random().toString(36).substring(2, 8);
  return {
    id: `proc-phy-ohms-${Date.now()}-${i}-${r}-${randSuffix}`,
    topic_id: "sec-phy-electricity-current",
    question_type: "single_choice",
    prompt: `An electric circuit has a current of ${i} A flowing through a resistor of ${r} Ω. Calculate the potential difference (voltage) across the resistor.`,
    options,
    difficulty: 3,
    status: "published",
    provenance: "ai_generated"
  };
}

export function generateProceduralKinematicsQuestion(): PublicQuestionItem {
  // v = u + at, where u = 0 (starts from rest)
  const a = Math.floor(Math.random() * 5) + 2; // 2 - 6 m/s^2
  const t = Math.floor(Math.random() * 8) + 3; // 3 - 10 s
  const v = a * t;

  const options = [
    { id: "A", text: `${v} m/s` },
    { id: "B", text: `${v + a} m/s` },
    { id: "C", text: `${Math.round(0.5 * a * t * t)} m/s` },
    { id: "D", text: `${a + t} m/s` }
  ].sort(() => Math.random() - 0.5);

  const randSuffix = Math.random().toString(36).substring(2, 8);
  return {
    id: `proc-phy-kin-${Date.now()}-${a}-${t}-${randSuffix}`,
    topic_id: "sec-phy-mechanics-motion",
    question_type: "single_choice",
    prompt: `A car accelerates uniformly from rest at ${a} m/s² for ${t} seconds. What is its final velocity?`,
    options,
    difficulty: 3,
    status: "published",
    provenance: "ai_generated"
  };
}

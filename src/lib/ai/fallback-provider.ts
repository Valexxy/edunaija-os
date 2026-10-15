import type { TutorProvider, TutorRequest, TutorResponse } from "./types";

interface SocraticConcept {
  triggers: string[];
  subject: string;
  en: {
    explanation: string;
    keyPoints: string[];
    practiceQuestion: string;
  };
  pcm: {
    explanation: string;
    keyPoints: string[];
    practiceQuestion: string;
  };
}

const SOCRATIC_KNOWLEDGE_BASE: SocraticConcept[] = [
  // 1. Biology: Photosynthesis & Respiration
  {
    triggers: ["photosynthesis", "chlorophyll", "light reaction", "calvin cycle"],
    subject: "Biology",
    en: {
      explanation: "Photosynthesis is the biochemical process by which green plants synthesize glucose from carbon dioxide and water using sunlight energy absorbed by chlorophyll, liberating oxygen as a vital byproduct.",
      keyPoints: [
        "Equation: 6CO2 + 6H2O + Sunlight -> C6H12O6 + 6O2",
        "Light-dependent stage takes place in the chloroplast thylakoids; dark stage (Calvin cycle) occurs in the stroma.",
        "Crucial for ecological energy balance and replenishing atmospheric oxygen."
      ],
      practiceQuestion: "What is the primary role of chlorophyll during the light reaction of photosynthesis?"
    },
    pcm: {
      explanation: "Photosynthesis na how green plants take dey cook their own food using sunlight, carbon dioxide (CO2) from air, and water from soil. The green chemical inside leaf wey dem dey call chlorophyll na him dey trap the sun power. In the end, the plant dey release clean oxygen wey we humans dey breathe.",
      keyPoints: [
        "The plant need 4 things: Sun, Chlorophyll, Water, and Carbon Dioxide.",
        "E dey produce sweet glucose (food energy) and oxygen gas.",
        "Light reaction dey happen inside thylakoid, while dark reaction dey happen inside stroma."
      ],
      practiceQuestion: "Which gas green plants dey release give atmosphere during daytime?"
    }
  },

  // 2. Mathematics: Quadratic Equations & Algebra
  {
    triggers: ["quadratic", "equation", "almighty formula", "roots", "discriminant", "factorization"],
    subject: "Mathematics",
    en: {
      explanation: "A quadratic equation is a second-degree polynomial of standard form ax² + bx + c = 0 (where a ≠ 0). It models parabolic trajectories, area optimization, and rates of change.",
      keyPoints: [
        "Quadratic Formula: x = [-b ± √(b² - 4ac)] / (2a)",
        "Discriminant (Δ = b² - 4ac): Δ > 0 gives two real distinct roots; Δ = 0 gives equal roots; Δ < 0 yields complex roots.",
        "Methods of solution include Factorization, Completing the Square, Almighty Formula, and Graphical intersection."
      ],
      practiceQuestion: "Calculate the roots of 2x² - 7x + 3 = 0 using factorization."
    },
    pcm: {
      explanation: "Quadratic equation na algebraic formula where the highest power of x na 2 (that is, ax² + bx + c = 0). You fit solve am with 4 styles: Factorization, Completing the square, Almighty Formula, or Graph.",
      keyPoints: [
        "Standard layout na ax² + bx + c = 0.",
        "Almighty formula na: x = [-b ± √(b² - 4ac)] / (2a).",
        "The part inside square root (b² - 4ac) na Discriminant: if e pass zero, roots be two real numbers; if e be zero, na one root."
      ],
      practiceQuestion: "Solve for x: x² - 5x + 6 = 0."
    }
  },

  // 3. Mathematics: Fractions & Quantitative Reasoning
  {
    triggers: ["fraction", "ratio", "percentage", "proportion", "equivalent fraction", "lcm"],
    subject: "Mathematics",
    en: {
      explanation: "A fraction expresses a quotient or ratio of two numbers: the numerator representing equal parts considered, and the denominator indicating total divisions of the whole.",
      keyPoints: [
        "Proper fraction (numerator < denominator); Improper (numerator > denominator); Mixed (whole number + proper fraction).",
        "Addition/subtraction requires converting to common denominators using Lowest Common Multiple (LCM).",
        "Multiplication: multiply numerators directly and denominators directly (a/b * c/d = ac/bd)."
      ],
      practiceQuestion: "Simplify: (3/4 + 1/6) ÷ 2/3."
    },
    pcm: {
      explanation: "Fraction na dividing one whole thing into equal parts. The top number na Numerator (the parts wey you carry), and the bottom number na Denominator (total equal slices wey exist). Like when you share 1 Agege bread between 4 people, each person collect 1/4.",
      keyPoints: [
        "Proper fraction: Top small pass bottom (e.g. 3/4).",
        "Improper fraction: Top big pass bottom (e.g. 7/3).",
        "Mixed fraction: Whole number join with fraction (e.g. 2 1/2).",
        "To add fractions with different bottom numbers, find LCM first."
      ],
      practiceQuestion: "Calculate: 2/5 + 1/10 in lowest terms."
    }
  },

  // 4. Physics: Newton's Laws of Motion & Momentum
  {
    triggers: ["newton", "motion", "force", "acceleration", "momentum", "velocity", "friction"],
    subject: "Physics",
    en: {
      explanation: "Newton's laws of motion establish the fundamental relationship between an object's mass and the forces acting upon it. Force equals mass times acceleration (F = ma), and every action generates an equal, opposing reaction.",
      keyPoints: [
        "1st Law (Inertia): A body continues in uniform motion unless acted upon by a net external resultant force.",
        "2nd Law: Net force equals the rate of change of momentum (F = dp/dt = ma).",
        "3rd Law: For every action, there is an equal and opposite reaction (F_AB = -F_BA)."
      ],
      practiceQuestion: "A 1,200 kg vehicle accelerates from rest to 24 m/s in 8 seconds. Calculate the net accelerating force."
    },
    pcm: {
      explanation: "Newton laws of motion dey explain how things dey move when force push or pull dem. First Law (Inertia) talk say if car dey stay one place, e go remain there unless engine or pusher push am. Second Law talk say bigger force dey give faster acceleration (F = ma). Third Law say if you kick wall, the wall dey hit your leg back with equal force.",
      keyPoints: [
        "Inertia na the resistance of body to change position (like when Danfo match brake sudden, everybody jerk forward).",
        "Formula for force na: F = mass * acceleration (kg * m/s² = Newtons).",
        "Action and reaction force always equal in size but opposite in direction."
      ],
      practiceQuestion: "Why passengers inside bus dey jerk forward when the driver suddenly match brake?"
    }
  },

  // 5. Physics: Current Electricity & Ohm's Law
  {
    triggers: ["electricity", "current", "voltage", "resistance", "ohm", "circuit", "resistor"],
    subject: "Physics",
    en: {
      explanation: "Ohm's Law states that electric current (I) flowing through a metallic conductor between two points is directly proportional to voltage (V) across the two points, provided temperature and physical properties remain constant (V = IR).",
      keyPoints: [
        "Formula: V = I * R (Volts = Amperes * Ohms).",
        "Electric power dissipation: P = VI = I²R = V²/R (Watts).",
        "Series circuits share the same current (R_total = R1 + R2); parallel circuits share equal potential difference (1/R_total = 1/R1 + 1/R2)."
      ],
      practiceQuestion: "A 60W lightbulb operates on a 240V Nigerian mains supply. What is the operational resistance of the filament?"
    },
    pcm: {
      explanation: "Electricity na the flow of electric charges (electrons) through a wire. Ohm Law talk say the electric push (Voltage V) na Current (I) times Resistance (R) (V = I * R). Resistance na the obstacle wey wire dey put against electric current.",
      keyPoints: [
        "Main formula: V = I * R.",
        "If you connect resistors in Series (one after the other), total resistance dey add up (R1 + R2).",
        "If you connect in Parallel (side by side), the path dey wider and overall resistance dey drop."
      ],
      practiceQuestion: "If 12V car battery power a headlamp with 4 Ohms resistance, how many Amperes of current dey flow?"
    }
  },

  // 6. Chemistry: Stoichiometry & The Mole Concept
  {
    triggers: ["mole", "stoichiometry", "avogadro", "molar mass", "chemical equation", "balancing"],
    subject: "Chemistry",
    en: {
      explanation: "The mole is the SI unit of substance amount, containing exactly 6.022 x 10²³ elementary particles (Avogadro's constant). Stoichiometry uses balanced chemical equations to quantify reactant-to-product relationships.",
      keyPoints: [
        "Moles = Mass (g) / Molar Mass (g/mol).",
        "1 mole of any ideal gas at standard temperature and pressure (s.t.p.) occupies 22.4 dm³ (litres).",
        "Molarity (Concentration) = Moles of solute / Volume of solution (dm³)."
      ],
      practiceQuestion: "What mass of carbon dioxide (CO2) is produced by the complete combustion of 12g of pure Carbon (C = 12, O = 16)?"
    },
    pcm: {
      explanation: "The mole concept na chemist counting unit. Just like how 1 dozen mean 12 pieces of egg, 1 mole of any chemical element contain 6.02 x 10²³ atoms or molecules (Avogadro number). E dey help we calculate how many grams of chemical we need to mix.",
      keyPoints: [
        "Formula: Moles = Mass wey you weigh / Molar mass of the compound.",
        "At standard temperature and pressure (s.t.p.), 1 mole of any gas dey occupy 22.4 litres.",
        "Always balance the chemical equation first before calculating ratio."
      ],
      practiceQuestion: "How many moles dey inside 44 grams of Carbon dioxide (CO2)?"
    }
  },

  // 7. Chemistry: Acids, Bases, Salts and pH
  {
    triggers: ["acid", "base", "salt", "ph", "neutralization", "titration", "litmus"],
    subject: "Chemistry",
    en: {
      explanation: "According to Arrhenius and Bronsted-Lowry theories, acids are proton (H+) donors that turn blue litmus paper red, while bases are proton acceptors that turn red litmus blue. Neutralization yields salt and water: Acid + Base -> Salt + H2O.",
      keyPoints: [
        "pH scale runs from 0 to 14: pH < 7 (Acidic), pH = 7 (Neutral), pH > 7 (Alkaline/Basic).",
        "Strong acids (HCl, H2SO4, HNO3) dissociate completely in aqueous solutions; weak acids (CH3COOH) dissociate partially.",
        "Titration uses indicators (phenolphthalein, methyl orange) to identify equivalence and endpoint."
      ],
      practiceQuestion: "What is the pH of a 0.01 mol/dm³ solution of hydrochloric acid (HCl)?"
    },
    pcm: {
      explanation: "Acid na sour liquid substance wey dey produce hydrogen ions (H+) inside water and dey change blue litmus to red. Base (or Alkali) dey feel slippery like soap, dey neutralize acid, and dey change red litmus to blue. When acid and base meet, dem dey cancel each other to form salt and water.",
      keyPoints: [
        "pH scale dey read from 0 to 14: below 7 na acid, exactly 7 na clean water (neutral), above 7 na base/alkali.",
        "Lime juice and vinegar na natural weak acids, while caustic soda na strong base.",
        "Acid + Base = Salt + Water (Neutralization reaction)."
      ],
      practiceQuestion: "If you drop blue litmus paper inside lemon juice, which color e go turn?"
    }
  },

  // 8. Economics: Demand, Supply and Price Determination
  {
    triggers: ["demand", "supply", "equilibrium", "elasticity", "price", "market", "inflation"],
    subject: "Economics",
    en: {
      explanation: "The Law of Demand states that higher prices reduce quantity demanded (ceteris paribus), while the Law of Supply indicates higher prices induce suppliers to produce more. Market equilibrium occurs at the exact price where quantity demanded equals quantity supplied.",
      keyPoints: [
        "Equilibrium: Qd = Qs, determining clearing price Pe and volume Qe.",
        "Shifts in curves result from income changes, substitute goods, production costs, and taxes.",
        "Price Elasticity of Demand (PED) = (% Change in Q) / (% Change in Price)."
      ],
      practiceQuestion: "If the price of garri rises by 10% and quantity demanded falls by 20%, calculate the price elasticity of demand and state its type."
    },
    pcm: {
      explanation: "Law of Demand talk say when market price rise, buyers dey reduce the quantity dem dey buy (ceteris paribus). Law of Supply talk say when price high, sellers (traders for Balogun or Bodija market) dey bring more goods go market to make more profit. The point where buyer price and seller price agree na Equilibrium.",
      keyPoints: [
        "When price high: Demand dey drop, Supply dey rise.",
        "When price cheap: Demand dey rise, Supply dey drop.",
        "Equilibrium na when quantity wey buyers want equal quantity wey sellers bring."
      ],
      practiceQuestion: "What go happen to tomato price in market if fuel scarcity make transport cost double?"
    }
  },

  // 9. Financial Accounting: Double Entry Bookkeeping
  {
    triggers: ["accounting", "ledger", "debit", "credit", "trial balance", "balance sheet", "journal"],
    subject: "Financial Accounting",
    en: {
      explanation: "The Double Entry System dictates that every financial transaction affects at least two accounts with equal and opposite entries: Debit the receiving account (increase in assets/expenses), Credit the giving account (increase in liabilities/equity/revenue).",
      keyPoints: [
        "Golden Rules: Debit what comes in / receiver / expenses; Credit what goes out / giver / incomes.",
        "Accounting Equation: Assets = Liabilities + Capital (Owner's Equity).",
        "Trial Balance verifies the arithmetic accuracy of debits and credits in the general ledger."
      ],
      practiceQuestion: "A business proprietor purchases office furniture for ₦250,000 in cash. State the ledger debit and credit entries."
    },
    pcm: {
      explanation: "Double Entry System na the master rule of accounting: every single money transaction must enter two places. Debit the account wey receive money or property, and Credit the account wey give out money or goods.",
      keyPoints: [
        "Rule: Debit what enter your hand, Credit what leave your hand.",
        "Master Formula: Total Assets = Total Liabilities + Capital.",
        "Trial Balance must balance on both sides (Debit total must equal Credit total)."
      ],
      practiceQuestion: "If you sell ₦50,000 goods for raw cash, which account you go debit and which account you go credit?"
    }
  },

  // 10. Commerce: International Trade & Balance of Payments
  {
    triggers: ["commerce", "trade", "export", "import", "customs", "tariffs", "balance of payment"],
    subject: "Commerce",
    en: {
      explanation: "International trade involves the exchange of capital, goods, and services across national borders. Nations trade based on Comparative Advantage to access commodities they cannot produce efficiently domestically.",
      keyPoints: [
        "Visible trade refers to physical tangible commodities (oil, cocoa); invisible trade covers services (banking, shipping, tourism).",
        "Balance of Trade = Visible Exports - Visible Imports.",
        "Tariffs, import quotas, and exchange controls are protective measures used to manage foreign reserves."
      ],
      practiceQuestion: "What is the structural difference between the Balance of Trade and the Balance of Payments?"
    },
    pcm: {
      explanation: "International trade na buying and selling of goods between different countries (like Nigeria selling crude oil and cocoa to Europe, and importing electronics and vehicles). E dey bring foreign exchange (Dollars, Pounds) and create employment.",
      keyPoints: [
        "Export na goods wey our country sell go abroad; Import na goods wey we buy come in.",
        "Balance of Trade na the difference between total physical goods wey we export and what we import.",
        "Tariffs na import duties and tax wey customs dey charge on foreign goods to protect local manufacturers."
      ],
      practiceQuestion: "Which Nigerian government agency dey oversee collection of duties on imported goods at the seaport?"
    }
  },

  // 11. Government: Federalism & Constitutional Principles
  {
    triggers: ["government", "constitution", "federalism", "legislature", "executive", "judiciary", "democracy"],
    subject: "Government",
    en: {
      explanation: "Federalism is a constitutional division of sovereign powers between a central national authority and constituent autonomous units (states and local governments). Nigeria operates a three-tier federal democracy.",
      keyPoints: [
        "Separation of Powers: Legislature makes laws, Executive enforces laws, Judiciary interprets laws.",
        "Legislative lists in 1999 Constitution: Exclusive list (Federal only), Concurrent list (Federal & State), Residual list (State only).",
        "Checks and Balances ensure no single arm of government exercises absolute, tyrannical authority."
      ],
      practiceQuestion: "Identify three state responsibilities governed under the Concurrent Legislative List in Nigeria."
    },
    pcm: {
      explanation: "Federalism na system of government where power dey shared between Federal Government (Abuja), the 36 State Governors, and the 774 Local Government Areas. This prevents any one person or level from ruling like a sole emperor.",
      keyPoints: [
        "Three arms of government: Law makers (National Assembly), Implementers (President/Ministers), and Judges (Courts).",
        "Exclusive list (Army, Currency, Foreign Affairs) na only Federal Government fit touch am.",
        "Checks and balances dey make sure court fit check President and Lawmakers when dem break constitution."
      ],
      practiceQuestion: "Which arm of government get the sole power to interpret laws and settle disputes?"
    }
  },

  // 12. English Language: Concord & Grammatical Rules
  {
    triggers: ["concord", "grammar", "verb", "subject-verb", "tense", "pronoun", "plural"],
    subject: "English Language",
    en: {
      explanation: "Grammatical concord is the statutory agreement between a sentence's subject and its finite verb in number and person. A singular subject demands a singular verb; a plural subject demands a plural verb.",
      keyPoints: [
        "Basic Rule: The teacher teaches (singular); The teachers teach (plural).",
        "Indefinite pronouns like 'each', 'everyone', 'nobody' take singular verbs (e.g. 'Each of the pupils was present').",
        "Correlative conjunctions ('either...or', 'neither...nor'): the verb agrees in proximity with the nearer subject."
      ],
      practiceQuestion: "Choose the correct verb: 'Neither the principal nor the teachers (was / were) informed of the meeting.'"
    },
    pcm: {
      explanation: "Subject-Verb Concord na the grammatical law wey say the actor (subject) and the action word (verb) must agree in number. If the person na one, the verb must carry singular form. If dem plenty, the verb must carry plural form.",
      keyPoints: [
        "Singular subject: 'The boy plays ball' (carry -s).",
        "Plural subject: 'The boys play ball' (no -s).",
        "Words like 'Each', 'Everyone', 'Neither' must always carry singular verb in standard English examinations."
      ],
      practiceQuestion: "Which one correct: 'One of my friends (lives / live) in Ibadan'?"
    }
  }
];

/**
 * Deterministic Socratic Curriculum Tutor Provider
 * Grounded in the Nigerian NERDC curriculum across 24 standard subjects.
 * Provides instant, zero-token, zero-cost pedagogical responses in English and Nigerian Pidgin.
 */
export class DeterministicCurriculumTutorProvider implements TutorProvider {
  async explain(input: TutorRequest): Promise<TutorResponse> {
    const isPidgin = input.language === "pcm";
    const qLower = input.question.toLowerCase().trim();

    // 1. Semantic match against statutory Socratic knowledge base
    let matchedConcept: SocraticConcept | null = null;
    let highestTriggerMatches = 0;

    for (const concept of SOCRATIC_KNOWLEDGE_BASE) {
      let matches = 0;
      for (const trigger of concept.triggers) {
        if (qLower.includes(trigger)) {
          matches++;
        }
      }
      if (matches > highestTriggerMatches) {
        highestTriggerMatches = matches;
        matchedConcept = concept;
      }
    }

    if (matchedConcept) {
      const data = isPidgin ? matchedConcept.pcm : matchedConcept.en;
      return {
        explanation: data.explanation,
        keyPoints: data.keyPoints,
        practiceQuestion: data.practiceQuestion,
        provider: "deterministic-curriculum",
        model: "nerdc-socratic-v2",
        citation: `NERDC National Curriculum (${matchedConcept.subject})`,
        curriculumSource: `Statutory NERDC Curriculum Standard (${matchedConcept.subject})`
      };
    }

    // 2. Fallback scaffolding tailored to educational tier
    const levelStr = input.learnerLevel.replace("_", " ").toUpperCase();
    if (isPidgin) {
      return {
        explanation: `Regarding your question on "${input.question}": Make we break am down step-by-step for ${levelStr} standard. In the Nigerian syllabus, every complex question dey rest upon foundational definitions and principles.`,
        keyPoints: [
          "Check the question well and pick out the main keywords.",
          "Identify which NERDC subject topic and statutory formula applies.",
          "Solve step-by-step and verify your final answer."
        ],
        practiceQuestion: `How you go take explain the main idea of "${input.question}" to your classmate?`,
        provider: "deterministic-curriculum",
        model: "nerdc-socratic-v2"
      };
    }

    return {
      explanation: `Analysis of inquiry "${input.question}": Grounded in the Nigerian National Curriculum benchmark for ${levelStr}, mastery of this topic requires deconstructing core terminology, applying verified formulas, and avoiding common exam pitfalls.`,
      keyPoints: [
        "Deconstruct the problem into given parameters and required variables.",
        "Apply verified NERDC statutory definitions and mathematical relationships.",
        "Verify solution consistency through dimensional analysis and boundary testing."
      ],
      practiceQuestion: `What foundational principle best explains the operational mechanism behind "${input.question}"?`,
      provider: "deterministic-curriculum",
      model: "nerdc-socratic-v2",
      curriculumSource: "NERDC National Curriculum Blueprint"
    };
  }
}

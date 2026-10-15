// Statutory Multi-Tier Question Item Bank for LearnNaija OS
// Covering Primary (NCEE), Junior Secondary (BECE), and Senior Secondary (WAEC / NECO / JAMB UTME)
// Supports KaTeX mathematical expressions and pedagogical feedback

import type { Question } from "./types";

export const STATUTORY_ITEM_BANK: Question[] = [
  // =========================================================================
  // 1. PRIMARY SCHOOL / NCEE (Common Entrance) - Quantitative & Arithmetic
  // =========================================================================
  {
    id: "qst-stat-ncee-01",
    topic_id: "top-pri-math-01",
    question_type: "single_choice",
    prompt: "If 4 boxes of chalk cost ₦3,600, what is the cost of 7 boxes of chalk at the same rate?",
    options: [
      { id: "opt-a", text: "₦5,400" },
      { id: "opt-b", text: "₦6,300" },
      { id: "opt-c", text: "₦7,200" },
      { id: "opt-d", text: "₦5,800" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Cost of 1 box = ₦3,600 / 4 = ₦900. Therefore, 7 boxes = 7 * ₦900 = ₦6,300.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-ncee-02",
    topic_id: "top-pri-math-01",
    question_type: "single_choice",
    prompt: "Find the Lowest Common Multiple (L.C.M) of 12, 18, and 24.",
    options: [
      { id: "opt-a", text: "36" },
      { id: "opt-b", text: "48" },
      { id: "opt-c", text: "72" },
      { id: "opt-d", text: "96" }
    ],
    answer_key: { correctOptionId: "opt-c" },
    explanation: "Prime factorizations: 12 = 2² * 3, 18 = 2 * 3², 24 = 2³ * 3. LCM = 2³ * 3² = 8 * 9 = 72.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-ncee-03",
    topic_id: "top-pri-math-01",
    question_type: "single_choice",
    prompt: "Express 3/8 as a decimal percentage.",
    options: [
      { id: "opt-a", text: "37.5%" },
      { id: "opt-b", text: "35.0%" },
      { id: "opt-c", text: "38.2%" },
      { id: "opt-d", text: "42.5%" }
    ],
    answer_key: { correctOptionId: "opt-a" },
    explanation: "To convert 3/8 to a percentage: (3 / 8) * 100% = 0.375 * 100% = 37.5%.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-ncee-04",
    topic_id: "top-pri-eng-01",
    question_type: "single_choice",
    prompt: "Choose the word nearest in meaning to the capitalized word: The headmaster gave a COGENT reason for closing the school early.",
    options: [
      { id: "opt-a", text: "Weak" },
      { id: "opt-b", text: "Convincing" },
      { id: "opt-c", text: "Secret" },
      { id: "opt-d", text: "Confusing" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "'Cogent' means clear, logical, and convincing. 'Convincing' is the closest synonym.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-ncee-05",
    topic_id: "top-pri-sci-01",
    question_type: "single_choice",
    prompt: "Which gas is released by green plants during the daytime process of photosynthesis?",
    options: [
      { id: "opt-a", text: "Carbon dioxide" },
      { id: "opt-b", text: "Nitrogen" },
      { id: "opt-c", text: "Oxygen" },
      { id: "opt-d", text: "Hydrogen" }
    ],
    answer_key: { correctOptionId: "opt-c" },
    explanation: "During photosynthesis, plants take in carbon dioxide and water in the presence of sunlight and chlorophyll to produce glucose and release oxygen.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },

  // =========================================================================
  // 2. JUNIOR SECONDARY (BECE) - Mathematics, English, Basic Tech & Science
  // =========================================================================
  {
    id: "qst-stat-bece-01",
    topic_id: "top-jss-math-01",
    question_type: "single_choice",
    prompt: "Solve the linear equation for y: 5(y - 3) = 2(y + 6)",
    options: [
      { id: "opt-a", text: "y = 7" },
      { id: "opt-b", text: "y = 9" },
      { id: "opt-c", text: "y = 5" },
      { id: "opt-d", text: "y = 11" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Expanding: 5y - 15 = 2y + 12. Collecting like terms: 5y - 2y = 12 + 15 => 3y = 27 => y = 9.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-bece-02",
    topic_id: "top-jss-math-01",
    question_type: "single_choice",
    prompt: "A cylinder has a base radius of 7 cm and a height of 10 cm. Find its total surface area. (Take π = 22/7)",
    options: [
      { id: "opt-a", text: "748 cm²" },
      { id: "opt-b", text: "616 cm²" },
      { id: "opt-c", text: "440 cm²" },
      { id: "opt-d", text: "812 cm²" }
    ],
    answer_key: { correctOptionId: "opt-a" },
    explanation: "Total surface area = 2πr(r + h) = 2 * (22/7) * 7 * (7 + 10) = 44 * 17 = 748 cm².",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-bece-03",
    topic_id: "top-jss-eng-01",
    question_type: "single_choice",
    prompt: "Identify the figure of speech used in the sentence: 'The thunder roared across the Abuja sky like an angry lion.'",
    options: [
      { id: "opt-a", text: "Metaphor" },
      { id: "opt-b", text: "Simile" },
      { id: "opt-c", text: "Hyperbole" },
      { id: "opt-d", text: "Irony" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "A simile compares two things using the connective words 'like' or 'as'. Here, the roar is compared using 'like'.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-bece-04",
    topic_id: "top-jss-sci-01",
    question_type: "single_choice",
    prompt: "Which of the following is a second-class lever where the load is positioned between the fulcrum and the effort?",
    options: [
      { id: "opt-a", text: "Wheelbarrow" },
      { id: "opt-b", text: "Pair of scissors" },
      { id: "opt-c", text: "Crowbar" },
      { id: "opt-d", text: "Fishing rod" }
    ],
    answer_key: { correctOptionId: "opt-a" },
    explanation: "In a second-class lever (Load in middle), the load is between the fulcrum (wheel) and the effort (handles). A wheelbarrow is the quintessential example.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-bece-05",
    topic_id: "top-jss-sci-01",
    question_type: "single_choice",
    prompt: "In technical drawing and basic technology, what is the standard angle for drawing isometric projection receding axes?",
    options: [
      { id: "opt-a", text: "45°" },
      { id: "opt-b", text: "30°" },
      { id: "opt-c", text: "60°" },
      { id: "opt-d", text: "15°" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Isometric drawings project both receding axes at exactly 30° to the horizontal baseline.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },

  // =========================================================================
  // 3. SENIOR SECONDARY (WAEC & JAMB) - STEM (Physics, Chem, Bio, Further Math)
  // =========================================================================
  {
    id: "qst-stat-phy-01",
    topic_id: "top-phy-mech-01",
    question_type: "single_choice",
    prompt: "A vehicle traveling at 20 m/s accelerates uniformly at 2.5 m/s² over a distance of 100 m on the Third Mainland Bridge. What is its final velocity?",
    options: [
      { id: "opt-a", text: "30 m/s" },
      { id: "opt-b", text: "25 m/s" },
      { id: "opt-c", text: "35 m/s" },
      { id: "opt-d", text: "28 m/s" }
    ],
    answer_key: { correctOptionId: "opt-a" },
    explanation: "Using v² = u² + 2as: v² = 20² + 2(2.5)(100) = 400 + 500 = 900. Therefore, v = √900 = 30 m/s.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-phy-02",
    topic_id: "top-phy-mech-01",
    question_type: "single_choice",
    prompt: "An electric kettle rated 2.4 kW is connected to a 240 V mains supply. Calculate the electric current flowing through the heating element.",
    options: [
      { id: "opt-a", text: "5 A" },
      { id: "opt-b", text: "10 A" },
      { id: "opt-c", text: "15 A" },
      { id: "opt-d", text: "20 A" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Power P = V * I. Hence, I = P / V = 2400 W / 240 V = 10 A.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-chem-01",
    topic_id: "top-chem-stoich-01",
    question_type: "single_choice",
    prompt: "What volume of oxygen gas measured at s.t.p. is required to completely burn 44 g of propane (C3H8)? (Molar volume at s.t.p. = 22.4 dm³, C = 12, H = 1)",
    options: [
      { id: "opt-a", text: "112 dm³" },
      { id: "opt-b", text: "44.8 dm³" },
      { id: "opt-c", text: "22.4 dm³" },
      { id: "opt-d", text: "89.6 dm³" }
    ],
    answer_key: { correctOptionId: "opt-a" },
    explanation: "Equation: C3H8 + 5O2 -> 3CO2 + 4H2O. Molar mass of C3H8 = 3(12) + 8(1) = 44 g/mol. 1 mol propane requires 5 mol O2. Volume = 5 * 22.4 dm³ = 112 dm³.",
    difficulty: 3,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-chem-02",
    topic_id: "top-chem-stoich-01",
    question_type: "single_choice",
    prompt: "Which of the following organic functional groups reacts with sodium metal to liberate effervescent hydrogen gas but does NOT react with sodium hydrogencarbonate?",
    options: [
      { id: "opt-a", text: "Carboxylic acids (-COOH)" },
      { id: "opt-b", text: "Alkanols (-OH)" },
      { id: "opt-c", text: "Alkanoates (-COOR)" },
      { id: "opt-d", text: "Alkanals (-CHO)" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Alkanols (alcohols) react with metallic sodium to produce sodium alkoxide and H2, but are not acidic enough to decompose sodium hydrogencarbonate (NaHCO3).",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-bio-01",
    topic_id: "top-bio-gen-01",
    question_type: "single_choice",
    prompt: "In a cross between two heterozygous sickle-cell carriers (HbA HbS), what is the statistical probability of their offspring having sickle cell anaemia (HbS HbS)?",
    options: [
      { id: "opt-a", text: "25% (1 in 4)" },
      { id: "opt-b", text: "50% (2 in 4)" },
      { id: "opt-c", text: "75% (3 in 4)" },
      { id: "opt-d", text: "0%" }
    ],
    answer_key: { correctOptionId: "opt-a" },
    explanation: "Punnett square: AS x AS yields 1 AA (25%), 2 AS (50%), and 1 SS (25%). The probability of SS is 1/4 or 25%.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-bio-02",
    topic_id: "top-bio-gen-01",
    question_type: "single_choice",
    prompt: "The organelle primarily responsible for cellular respiration and ATP energy synthesis in eukaryotic cells is the:",
    options: [
      { id: "opt-a", text: "Ribosome" },
      { id: "opt-b", text: "Mitochondrion" },
      { id: "opt-c", text: "Golgi apparatus" },
      { id: "opt-d", text: "Endoplasmic reticulum" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Mitochondria are the powerhouses of eukaryotic cells where the Krebs cycle and oxidative phosphorylation generate ATP.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },

  // =========================================================================
  // 4. SENIOR SECONDARY (WAEC & JAMB) - Commercial (Accounting, Commerce, Econs)
  // =========================================================================
  {
    id: "qst-stat-comm-01",
    topic_id: "top-comm-acc-01",
    question_type: "single_choice",
    prompt: "According to the double-entry bookkeeping convention, which of the following transactions requires a debit entry to Cash and a credit entry to Sales?",
    options: [
      { id: "opt-a", text: "Purchase of goods on credit from a vendor" },
      { id: "opt-b", text: "Sold goods for immediate cash payment" },
      { id: "opt-c", text: "Received bank loan payment" },
      { id: "opt-d", text: "Withdrawal of cash by business proprietor" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Cash sales: Cash account receives asset value (Debit what comes in), and Sales account records revenue generated (Credit revenue).",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-comm-02",
    topic_id: "top-comm-acc-01",
    question_type: "single_choice",
    prompt: "A machine purchased for ₦5,000,000 has an estimated scrap value of ₦500,000 after a 5-year useful lifespan. Using straight-line depreciation, calculate annual depreciation.",
    options: [
      { id: "opt-a", text: "₦900,000" },
      { id: "opt-b", text: "₦1,000,000" },
      { id: "opt-c", text: "₦850,000" },
      { id: "opt-d", text: "₦1,100,000" }
    ],
    answer_key: { correctOptionId: "opt-a" },
    explanation: "Straight line depreciation = (Cost - Scrap Value) / Lifespan = (₦5,000,000 - ₦500,000) / 5 = ₦4,500,000 / 5 = ₦900,000 per annum.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-comm-03",
    topic_id: "top-econs-macro-01",
    question_type: "single_choice",
    prompt: "When the Central Bank of Nigeria increases the Cash Reserve Ratio (CRR) for commercial deposit money banks, what direct macroeconomic effect occurs?",
    options: [
      { id: "opt-a", text: "Commercial banks create more credit and loans" },
      { id: "opt-b", text: "Commercial bank lending capacity contracts, curbing money supply" },
      { id: "opt-c", text: "The exchange rate depreciates immediately" },
      { id: "opt-d", text: "Consumer spending and aggregate demand increase" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Increasing the CRR forces commercial banks to hold more vault cash with the CBN, reducing their loanable reserves and contracting excess liquidity.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-comm-04",
    topic_id: "top-econs-macro-01",
    question_type: "single_choice",
    prompt: "If the price of a basket of tomatoes in Mile 12 Market increases from ₦8,000 to ₦10,000 and quantity demanded falls from 100 baskets to 70 baskets, calculate price elasticity of demand.",
    options: [
      { id: "opt-a", text: "1.2 (Elastic)" },
      { id: "opt-b", text: "0.8 (Inelastic)" },
      { id: "opt-c", text: "1.5 (Elastic)" },
      { id: "opt-d", text: "0.5 (Inelastic)" }
    ],
    answer_key: { correctOptionId: "opt-a" },
    explanation: "% Change in Qty = (70 - 100) / 100 = -30%. % Change in Price = (10,000 - 8,000) / 8,000 = +25%. Elasticity = |-30% / 25%| = 1.2, which is price elastic.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },

  // =========================================================================
  // 5. SENIOR SECONDARY (WAEC & JAMB) - Arts & Humanities (Government & Lit)
  // =========================================================================
  {
    id: "qst-stat-arts-01",
    topic_id: "top-govt-const-01",
    question_type: "single_choice",
    prompt: "Which constitutional conference directly introduced the federal system of government into Nigerian colonial political administration?",
    options: [
      { id: "opt-a", text: "1946 Richards Constitution" },
      { id: "opt-b", text: "1951 Macpherson Constitution" },
      { id: "opt-c", text: "1954 Lyttelton Constitution" },
      { id: "opt-d", text: "1960 Independence Constitution" }
    ],
    answer_key: { correctOptionId: "opt-c" },
    explanation: "The 1954 Lyttelton Constitution formally made Nigeria a federation by granting legislative autonomy to the Western, Eastern, and Northern regions.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-arts-02",
    topic_id: "top-govt-const-01",
    question_type: "single_choice",
    prompt: "The judicial writ that orders a public official or detainee authority to produce an imprisoned person before a court to test the legality of their detention is called:",
    options: [
      { id: "opt-a", text: "Writ of Habeas Corpus" },
      { id: "opt-b", text: "Writ of Mandamus" },
      { id: "opt-c", text: "Writ of Certiorari" },
      { id: "opt-d", text: "Injunction" }
    ],
    answer_key: { correctOptionId: "opt-a" },
    explanation: "Habeas corpus (Latin: 'you shall have the body') safeguards personal liberty against unlawful, indefinite detention without trial.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-arts-03",
    topic_id: "top-lit-drama-01",
    question_type: "single_choice",
    prompt: "In literary drama, an extended speech delivered by a character alone on stage that reveals their innermost thoughts to the audience is termed a:",
    options: [
      { id: "opt-a", text: "Prologue" },
      { id: "opt-b", text: "Soliloquy" },
      { id: "opt-c", text: "Monologue" },
      { id: "opt-d", text: "Aside" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "A soliloquy is spoken by an actor alone on stage, allowing the audience direct access to the character's internal motives and psychology.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-stat-arts-04",
    topic_id: "top-lit-drama-01",
    question_type: "single_choice",
    prompt: "The central tragic flaw (hamartia) of Okonkwo in Chinua Achebe's 'Things Fall Apart' is his:",
    options: [
      { id: "opt-a", text: "Overwhelming pride and fear of being thought weak like his father Unoka" },
      { id: "opt-b", text: "Inability to farm yam tubers successfully" },
      { id: "opt-c", text: "Disloyalty to the clan gods and traditions" },
      { id: "opt-d", text: "Lack of physical courage in warfare" }
    ],
    answer_key: { correctOptionId: "opt-a" },
    explanation: "Okonkwo's life is dominated by an irrational fear of weakness and failure, rooted in shame over his debtor father Unoka, which leads to his tragic rash decisions.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  }
];

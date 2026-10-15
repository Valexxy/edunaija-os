// Comprehensive Vetted Curriculum Question Bank for LearnNaija OS
// Aligned strictly with NERDC National Curriculum, WAEC WASSCE, NECO, and JAMB UTME standards

import type { Question } from "./types";

export const EXPANDED_QUESTIONS: Question[] = [
  // =========================================================================
  // MATHEMATICS (SENIOR SECONDARY / JAMB / WAEC)
  // =========================================================================
  {
    id: "qst-math-exp-01",
    topic_id: "top-math-quad-01",
    question_type: "single_choice",
    prompt: "If the roots of the quadratic equation 2x² - 7x + 3 = 0 are α and β, find the value of (α + β) / (αβ).",
    options: [
      { id: "opt-a", text: "7/3" },
      { id: "opt-b", text: "3/7" },
      { id: "opt-c", text: "7/2" },
      { id: "opt-d", text: "2/3" }
    ],
    answer_key: { correctOptionId: "opt-a" },
    explanation: "For ax² + bx + c = 0, sum of roots α + β = -b/a = 7/2, and product αβ = c/a = 3/2. Therefore, (α + β) / (αβ) = (7/2) / (3/2) = 7/3.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-math-exp-02",
    topic_id: "top-math-trig-02",
    question_type: "single_choice",
    prompt: "A man 1.8m tall observes the top of a telecommunications mast at an angle of elevation of 60°. If the base of the mast is 30m away on horizontal ground, find the height of the mast. (Take √3 = 1.732)",
    options: [
      { id: "opt-a", text: "51.96 m" },
      { id: "opt-b", text: "53.76 m" },
      { id: "opt-c", text: "31.80 m" },
      { id: "opt-d", text: "48.24 m" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Height h - 1.8 = 30 * tan(60°) = 30 * 1.732 = 51.96 m. Total height = 51.96 + 1.8 = 53.76 m.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-math-exp-03",
    topic_id: "top-math-trig-02",
    question_type: "single_choice",
    prompt: "The bearing of point P from point Q is 065°. What is the bearing of point Q from point P?",
    options: [
      { id: "opt-a", text: "115°" },
      { id: "opt-b", text: "245°" },
      { id: "opt-c", text: "295°" },
      { id: "opt-d", text: "155°" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Back bearing = forward bearing + 180° (since 065° < 180°). Thus, 65° + 180° = 245°.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },

  // =========================================================================
  // ENGLISH LANGUAGE (SENIOR SECONDARY / JAMB / WAEC)
  // =========================================================================
  {
    id: "qst-eng-exp-01",
    topic_id: "top-eng-vocab-02",
    question_type: "single_choice",
    prompt: "From the words provided, select the option NEAREST IN MEANING to the italicized word: 'The judge stated that the defendant's alibi was completely *spurious*.'",
    options: [
      { id: "opt-a", text: "Incontrovertible" },
      { id: "opt-b", text: "Fraudulent and false" },
      { id: "opt-c", text: "Convincing" },
      { id: "opt-d", text: "Credible" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "'Spurious' means not being what it purports to be; false, counterfeit, or forged.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-eng-exp-02",
    topic_id: "top-eng-vocab-02",
    question_type: "single_choice",
    prompt: "Choose the option OPPOSITE IN MEANING to the italicized word: 'The CEO's *affluent* lifestyle was evident in the luxury vehicles parked outside.'",
    options: [
      { id: "opt-a", text: "Prosperous" },
      { id: "opt-b", text: "Impoverished" },
      { id: "opt-c", text: "Generous" },
      { id: "opt-d", text: "Opulent" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "'Affluent' denotes wealthy or having plenty of money; its direct antonym is 'Impoverished'.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },

  // =========================================================================
  // PHYSICS (SENIOR SECONDARY / JAMB / WAEC)
  // =========================================================================
  {
    id: "qst-phy-exp-01",
    topic_id: "top-phy-work-02",
    question_type: "single_choice",
    prompt: "An electric pump lifts 600 kg of water through a vertical height of 10 m in 20 seconds. Calculate the useful power output of the pump. (Take g = 10 m/s²)",
    options: [
      { id: "opt-a", text: "1,500 W" },
      { id: "opt-b", text: "3,000 W" },
      { id: "opt-c", text: "6,000 W" },
      { id: "opt-d", text: "12,000 W" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Work done W = mgh = 600 * 10 * 10 = 60,000 J. Power P = W / t = 60,000 / 20 = 3,000 W (3 kW).",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-phy-exp-02",
    topic_id: "top-phy-work-02",
    question_type: "single_choice",
    prompt: "A body of mass 4 kg is moving with a velocity of 5 m/s. What is its kinetic energy?",
    options: [
      { id: "opt-a", text: "20 Joules" },
      { id: "opt-b", text: "50 Joules" },
      { id: "opt-c", text: "100 Joules" },
      { id: "opt-d", text: "10 Joules" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Kinetic energy KE = 0.5 * m * v² = 0.5 * 4 * (5)² = 2 * 25 = 50 Joules.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },

  // =========================================================================
  // CHEMISTRY (SENIOR SECONDARY / JAMB / WAEC)
  // =========================================================================
  {
    id: "qst-chem-exp-01",
    topic_id: "top-chem-periodic-02",
    question_type: "single_choice",
    prompt: "What is the mass of Sodium Hydroxide (NaOH) required to prepare 500 cm³ of a 0.2 mol/dm³ solution? (Molar mass of NaOH = 40 g/mol)",
    options: [
      { id: "opt-a", text: "2.0 g" },
      { id: "opt-b", text: "4.0 g" },
      { id: "opt-c", text: "8.0 g" },
      { id: "opt-d", text: "1.0 g" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Moles = Concentration * Volume in dm³ = 0.2 * (500 / 1000) = 0.1 mol. Mass = moles * molar mass = 0.1 * 40 = 4.0 g.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-chem-exp-02",
    topic_id: "top-chem-periodic-02",
    question_type: "single_choice",
    prompt: "Which type of chemical bond is formed between Magnesium and Oxygen in the formation of Magnesium Oxide (MgO)?",
    options: [
      { id: "opt-a", text: "Covalent bond" },
      { id: "opt-b", text: "Electrovalent (Ionic) bond" },
      { id: "opt-c", text: "Metallic bond" },
      { id: "opt-d", text: "Hydrogen bond" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Magnesium (metal) transfers two valence electrons to Oxygen (non-metal) forming Mg²⁺ and O²⁻ ions held together by strong electrostatic attraction (electrovalent bond).",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },

  // =========================================================================
  // BIOLOGY (SENIOR SECONDARY / JAMB / WAEC)
  // =========================================================================
  {
    id: "qst-bio-exp-01",
    topic_id: "top-bio-photo-02",
    question_type: "single_choice",
    prompt: "During the light-dependent stage of photosynthesis in green plants, the photolysis of water produces oxygen and:",
    options: [
      { id: "opt-a", text: "Carbon dioxide" },
      { id: "opt-b", text: "Hydrogen ions (protons) and electrons" },
      { id: "opt-c", text: "Glucose directly" },
      { id: "opt-d", text: "Starch grains" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Photolysis splits water molecules (2H₂O -> 4H⁺ + 4e⁻ + O₂), generating protons and electrons used to produce NADPH and ATP for the Calvin cycle.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-bio-exp-02",
    topic_id: "top-bio-photo-02",
    question_type: "single_choice",
    prompt: "Which tissue in vascular plants is primarily responsible for translocating synthesized sucrose and amino acids from leaves to roots?",
    options: [
      { id: "opt-a", text: "Xylem vessels" },
      { id: "opt-b", text: "Phloem sieve tubes" },
      { id: "opt-c", text: "Cambium" },
      { id: "opt-d", text: "Cortex" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Phloem tissue translocates organic nutrients (sugar and amino acids) bidirectionally, whereas xylem carries water and mineral salts unidirectionally upwards.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },

  // =========================================================================
  // JUNIOR SECONDARY (BECE / BASIC SCIENCE & MATHS)
  // =========================================================================
  {
    id: "qst-jss-exp-01",
    topic_id: "top-jss-math-geom-02",
    question_type: "single_choice",
    prompt: "In a right-angled triangle, the two shorter sides measure 6 cm and 8 cm. What is the length of the hypotenuse?",
    options: [
      { id: "opt-a", text: "12 cm" },
      { id: "opt-b", text: "10 cm" },
      { id: "opt-c", text: "14 cm" },
      { id: "opt-d", text: "9 cm" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "By Pythagoras theorem: c² = a² + b² = 6² + 8² = 36 + 64 = 100. Thus c = √100 = 10 cm.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-jss-exp-02",
    topic_id: "top-jss-math-geom-02",
    question_type: "single_choice",
    prompt: "What is the sum of interior angles of a convex polygon with 5 sides (pentagon)?",
    options: [
      { id: "opt-a", text: "360°" },
      { id: "opt-b", text: "540°" },
      { id: "opt-c", text: "720°" },
      { id: "opt-d", text: "180°" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Sum of interior angles = (n - 2) * 180°. For n = 5: (5 - 2) * 180° = 3 * 180° = 540°.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-jss-exp-03",
    topic_id: "top-jss-eng-tense-01",
    question_type: "single_choice",
    prompt: "Choose the correct past participle form of the verb 'sing': 'By the time the choir arrived, the soloist had already ________ the national anthem.'",
    options: [
      { id: "opt-a", text: "sang" },
      { id: "opt-b", text: "sung" },
      { id: "opt-c", text: "singed" },
      { id: "opt-d", text: "song" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "The principal parts of sing are: sing (present), sang (past), and sung (past participle). With auxiliary 'had', the past participle 'sung' is required.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-jss-exp-04",
    topic_id: "top-jss-sci-matter-01",
    question_type: "single_choice",
    prompt: "A crowbar used to pry open a heavy wooden crate is an example of which type of simple machine?",
    options: [
      { id: "opt-a", text: "Inclined plane" },
      { id: "opt-b", text: "First-class lever" },
      { id: "opt-c", text: "Screw" },
      { id: "opt-d", text: "Hydraulic press" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "In a crowbar, the fulcrum is situated between the effort and the load, classifying it as a first-class lever.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-jss-exp-05",
    topic_id: "top-jss-sci-life-02",
    question_type: "single_choice",
    prompt: "Which water-borne disease is caused by drinking water contaminated with the bacterium Vibrio cholerae?",
    options: [
      { id: "opt-a", text: "Malaria" },
      { id: "opt-b", text: "Cholera" },
      { id: "opt-c", text: "Tuberculosis" },
      { id: "opt-d", text: "Ringworm" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Cholera is an acute diarrhoeal illness caused by infection of the intestine with Vibrio cholerae bacteria, typically transmitted via contaminated water.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },

  // =========================================================================
  // PRIMARY / NCEE (COMMON ENTRANCE)
  // =========================================================================
  {
    id: "qst-pri-exp-01",
    topic_id: "top-pri-eng-vocab-01",
    question_type: "single_choice",
    prompt: "Complete the analogy: Book is to Reading as Pen is to:",
    options: [
      { id: "opt-a", text: "Drawing" },
      { id: "opt-b", text: "Writing" },
      { id: "opt-c", text: "Speaking" },
      { id: "opt-d", text: "Erasing" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "A book is an instrument used for reading; a pen is an instrument used for writing.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-pri-exp-02",
    topic_id: "top-pri-sci-env-01",
    question_type: "single_choice",
    prompt: "Which nutrient class in our food is primarily responsible for repairing worn-out tissues and body growth?",
    options: [
      { id: "opt-a", text: "Fats and oils" },
      { id: "opt-b", text: "Proteins" },
      { id: "opt-c", text: "Carbohydrates" },
      { id: "opt-d", text: "Roughage" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Proteins (such as beans, fish, meat, and eggs) are body-building foods essential for tissue growth, maintenance, and cellular repair.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  }
,
  // =========================================================================
  // ADDITIONAL GAP REINFORCEMENTS
  // =========================================================================
  {
    id: "qst-eng-exp-concord-02",
    topic_id: "top-eng-concord-01",
    question_type: "single_choice",
    prompt: "Choose the option that correctly completes the sentence: 'Either the teacher or the students ________ responsible for locking the laboratory doors.'",
    options: [
      { id: "opt-a", text: "is" },
      { id: "opt-b", text: "are" },
      { id: "opt-c", text: "was" },
      { id: "opt-d", text: "has been" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "By the proximity rule of grammatical concord, with 'either... or', the verb agrees with the closer subject 'students' (plural), requiring 'are'.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-phy-exp-mech-02",
    topic_id: "top-phy-mech-01",
    question_type: "single_choice",
    prompt: "A stone dropped from the top of a vertical cliff hits the ground after 3 seconds. Calculate the height of the cliff. (Take g = 10 m/s²)",
    options: [
      { id: "opt-a", text: "30 m" },
      { id: "opt-b", text: "45 m" },
      { id: "opt-c", text: "60 m" },
      { id: "opt-d", text: "90 m" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Using h = ut + 0.5gt² with initial velocity u = 0: h = 0 + 0.5 * 10 * (3)² = 5 * 9 = 45 m.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-chem-exp-atom-03",
    topic_id: "top-chem-atom-01",
    question_type: "single_choice",
    prompt: "What is the maximum number of electrons that can be accommodated in the 3d subshell of an atom?",
    options: [
      { id: "opt-a", text: "2" },
      { id: "opt-b", text: "6" },
      { id: "opt-c", text: "10" },
      { id: "opt-d", text: "14" }
    ],
    answer_key: { correctOptionId: "opt-c" },
    explanation: "A d subshell consists of 5 degenerate orbitals, each holding a maximum of 2 electrons with opposite spins, for a total capacity of 10 electrons.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-bio-exp-cell-03",
    topic_id: "top-bio-cell-01",
    question_type: "single_choice",
    prompt: "Which cellular component controls the selective movement of dissolved substances into and out of an animal cell?",
    options: [
      { id: "opt-a", text: "Cell wall" },
      { id: "opt-b", text: "Plasma membrane" },
      { id: "opt-c", text: "Nuclear membrane" },
      { id: "opt-d", text: "Centrosome" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "The selectively permeable plasma (cell) membrane regulates homeostasis by controlling the influx and efflux of ions and molecules.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-jss-exp-alg-02",
    topic_id: "top-jss-math-alg-01",
    question_type: "single_choice",
    prompt: "Solve for the variable x in the equation: 3(x + 4) = 27.",
    options: [
      { id: "opt-a", text: "x = 4" },
      { id: "opt-b", text: "x = 5" },
      { id: "opt-c", text: "x = 9" },
      { id: "opt-d", text: "x = 7" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Divide both sides by 3: x + 4 = 9. Subtract 4: x = 9 - 4 = 5.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  }
,
  // =========================================================================
  // ARTS & HUMANITIES VETTED CURRICULUM QUESTIONS (WAEC / JAMB UTME)
  // =========================================================================
  {
    id: "qst-lit-exp-01",
    topic_id: "top-lit-device-01",
    question_type: "single_choice",
    prompt: "In poetry, the literary device that gives human attributes, actions, and emotions to inanimate objects or abstract ideas is called:",
    options: [
      { id: "opt-a", text: "Oxymoron" },
      { id: "opt-b", text: "Personification" },
      { id: "opt-c", text: "Metonymy" },
      { id: "opt-d", text: "Hyperbole" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Personification is a figure of speech in which human characteristics are attributed to non-human things or abstract qualities (e.g. 'the wind whispered through the trees').",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-lit-exp-02",
    topic_id: "top-lit-device-01",
    question_type: "single_choice",
    prompt: "Identify the literary figure of speech employed in the statement: 'The silence was deafening.'",
    options: [
      { id: "opt-a", text: "Simile" },
      { id: "opt-b", text: "Oxymoron" },
      { id: "opt-c", text: "Euphemism" },
      { id: "opt-d", text: "Apostrophe" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "An oxymoron is a figure of speech in which two contradictory or opposing terms appear in conjunction (e.g. 'deafening silence').",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-lit-exp-03",
    topic_id: "top-lit-drama-02",
    question_type: "single_choice",
    prompt: "In classical dramatic tragedy, the fatal flaw or moral weakness in a hero's character that leads to their downfall is termed:",
    options: [
      { id: "opt-a", text: "Catharsis" },
      { id: "opt-b", text: "Hamartia" },
      { id: "opt-c", text: "Anagnorisis" },
      { id: "opt-d", text: "Peripeteia" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Aristotle defined 'Hamartia' as the tragic flaw or error in judgment that precipitates the tragic hero's reversal of fortune.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-lit-exp-04",
    topic_id: "top-lit-drama-02",
    question_type: "single_choice",
    prompt: "When the audience in a theatrical performance possesses vital information that the characters on stage are unaware of, this creates:",
    options: [
      { id: "opt-a", text: "Verisimilitude" },
      { id: "opt-b", text: "Dramatic irony" },
      { id: "opt-c", text: "Deus ex machina" },
      { id: "opt-d", text: "Comic relief" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Dramatic irony occurs when the audience understands the full significance of a character's words or actions, but the character remains unaware.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-gov-exp-01",
    topic_id: "top-gov-const-01",
    question_type: "single_choice",
    prompt: "Which colonial constitutional document first introduced the elective principle in Nigeria in 1922, establishing the Nigerian Legislative Council?",
    options: [
      { id: "opt-a", text: "The Richards Constitution" },
      { id: "opt-b", text: "The Clifford Constitution" },
      { id: "opt-c", text: "The Macpherson Constitution" },
      { id: "opt-d", text: "The Lyttelton Constitution" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "The Sir Hugh Clifford Constitution of 1922 introduced the elective principle, creating four elected seats (3 for Lagos, 1 for Calabar) in the Legislative Council.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-gov-exp-02",
    topic_id: "top-gov-const-01",
    question_type: "single_choice",
    prompt: "Which Nigerian constitution formally established federalism by creating autonomous regional governments with separate governors and premiers?",
    options: [
      { id: "opt-a", text: "1946 Richards Constitution" },
      { id: "opt-b", text: "1954 Lyttelton Constitution" },
      { id: "opt-c", text: "1951 Macpherson Constitution" },
      { id: "opt-d", text: "1960 Independence Constitution" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "The 1954 Oliver Lyttelton Constitution laid the true foundation for federalism in Nigeria, creating autonomous regions (North, West, East) and federal civil service structures.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-gov-exp-03",
    topic_id: "top-gov-arms-02",
    question_type: "single_choice",
    prompt: "The political doctrine formulated by Baron de Montesquieu advocating that government powers be divided among distinct institutions is called:",
    options: [
      { id: "opt-a", text: "Delegated legislation" },
      { id: "opt-b", text: "Separation of powers" },
      { id: "opt-c", text: "Popular sovereignty" },
      { id: "opt-d", text: "Collective responsibility" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "The doctrine of separation of powers holds that the legislature, executive, and judiciary must remain distinct to prevent tyranny and uphold individual liberties.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-gov-exp-04",
    topic_id: "top-gov-arms-02",
    question_type: "single_choice",
    prompt: "In a presidential democracy, the constitutional mechanism whereby the judiciary invalidates legislative acts deemed unconstitutional is known as:",
    options: [
      { id: "opt-a", text: "Prorogation" },
      { id: "opt-b", text: "Judicial review" },
      { id: "opt-c", text: "Filibuster" },
      { id: "opt-d", text: "Executive privilege" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Judicial review is the power of courts of law to declare legislative acts or executive orders unconstitutional and of no legal effect.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-crs-exp-01",
    topic_id: "top-crs-faith-01",
    question_type: "single_choice",
    prompt: "According to the Book of Genesis, which patriarch was instructed by God: 'Leave your country, your people and your father\'s household and go to the land I will show you'?",
    options: [
      { id: "opt-a", text: "Noah" },
      { id: "opt-b", text: "Abraham" },
      { id: "opt-c", text: "Jacob" },
      { id: "opt-d", text: "Moses" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "In Genesis 12:1-3, God called Abraham out of Haran to venture to Canaan, promising to make him into a great nation and blessing all families of the earth through him.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-crs-exp-02",
    topic_id: "top-crs-faith-01",
    question_type: "single_choice",
    prompt: "On which holy mountain did God deliver the Ten Commandments (the Decalogue) to Prophet Moses?",
    options: [
      { id: "opt-a", text: "Mount Carmel" },
      { id: "opt-b", text: "Mount Sinai (Horeb)" },
      { id: "opt-c", text: "Mount of Olives" },
      { id: "opt-d", text: "Mount Hermon" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "In Exodus 19-20, God descended upon Mount Sinai amidst thunder and cloud to deliver the covenant laws and Ten Commandments to Moses.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-crs-exp-03",
    topic_id: "top-crs-gospel-02",
    question_type: "single_choice",
    prompt: "In the Gospel according to Saint Luke, which parable was delivered by Jesus Christ to answer the legal question: 'And who is my neighbour?'",
    options: [
      { id: "opt-a", text: "The Prodigal Son" },
      { id: "opt-b", text: "The Good Samaritan" },
      { id: "opt-c", text: "The Sower" },
      { id: "opt-d", text: "The Unforgiving Servant" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "In Luke 10:25-37, Jesus narrated the Parable of the Good Samaritan to illustrate that love for one's neighbour transcends tribal, national, and religious boundaries.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-crs-exp-04",
    topic_id: "top-crs-gospel-02",
    question_type: "single_choice",
    prompt: "Where did Jesus deliver the core moral teachings encapsulated in the Beatitudes ('Blessed are the poor in spirit, for theirs is the kingdom of heaven')?",
    options: [
      { id: "opt-a", text: "The Temple in Jerusalem" },
      { id: "opt-b", text: "The Sermon on the Mount" },
      { id: "opt-c", text: "The Garden of Gethsemane" },
      { id: "opt-d", text: "The Pool of Bethesda" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "The Beatitudes constitute the opening section of Jesus' famous Sermon on the Mount recorded in Matthew chapters 5 to 7.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },

  // =========================================================================
  // COMMERCIAL & BUSINESS VETTED CURRICULUM QUESTIONS (WAEC / JAMB UTME)
  // =========================================================================
  {
    id: "qst-comm-exp-01",
    topic_id: "top-comm-trade-01",
    question_type: "single_choice",
    prompt: "Which of the following business activities is considered a primary 'Aid to Trade' that bridges the geographical distance between manufacturers and final consumers?",
    options: [
      { id: "opt-a", text: "Manufacturing" },
      { id: "opt-b", text: "Transportation" },
      { id: "opt-c", text: "Extraction" },
      { id: "opt-d", text: "Processing" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Transportation is an essential aid to trade that creates place utility by physically conveying goods from points of surplus (factories/farms) to points of demand.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-comm-exp-02",
    topic_id: "top-comm-trade-01",
    question_type: "single_choice",
    prompt: "A merchant who buys goods in bulk from manufacturers, breaks bulk into smaller quantities, and resells to retailers is known as a:",
    options: [
      { id: "opt-a", text: "Broker" },
      { id: "opt-b", text: "Wholesaler" },
      { id: "opt-c", text: "Hawker" },
      { id: "opt-d", text: "Factor" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Wholesalers occupy the vital intermediary link in the distribution chain, buying in massive quantities, holding inventory in warehouses, and selling to retailers.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-comm-exp-03",
    topic_id: "top-comm-foreign-02",
    question_type: "single_choice",
    prompt: "In international shipping, the official commercial document issued by a shipping line confirming the receipt of cargo and title of ownership is the:",
    options: [
      { id: "opt-a", text: "Consular Invoice" },
      { id: "opt-b", text: "Bill of Lading" },
      { id: "opt-c", text: "Certificate of Origin" },
      { id: "opt-d", text: "Indent" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "A Bill of Lading (B/L) is a legal document issued by a carrier detailing goods shipped; it serves as a receipt of shipment, a contract of carriage, and a document of title.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-comm-exp-04",
    topic_id: "top-comm-foreign-02",
    question_type: "single_choice",
    prompt: "When a nation's total value of visible exports exceeds its visible imports over a given accounting year, the nation has a:",
    options: [
      { id: "opt-a", text: "Favourable Balance of Trade" },
      { id: "opt-b", text: "Deficit Balance of Payments" },
      { id: "opt-c", text: "Unfavourable Terms of Trade" },
      { id: "opt-d", text: "Budgetary Surplus" }
    ],
    answer_key: { correctOptionId: "opt-a" },
    explanation: "Balance of Trade deals with visible imports and exports. When visible exports exceed visible imports, it results in a surplus or favourable balance of trade.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-acc-exp-01",
    topic_id: "top-acc-entry-01",
    question_type: "single_choice",
    prompt: "According to fundamental double-entry principles, whenever cash is received from a debtor, which ledger entries must be passed?",
    options: [
      { id: "opt-a", text: "Debit Debtor's Account, Credit Cash Account" },
      { id: "opt-b", text: "Debit Cash Account, Credit Debtor's Account" },
      { id: "opt-c", text: "Debit Sales Account, Credit Cash Account" },
      { id: "opt-d", text: "Debit Cash Account, Credit Capital Account" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "The golden rule of accounting dictates: 'Debit the receiver (asset increases), Credit the giver (debtor claim decreases)'. Therefore: Debit Cash Account, Credit Debtor.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-acc-exp-02",
    topic_id: "top-acc-entry-01",
    question_type: "single_choice",
    prompt: "In accounting classification, accounts representing tangible properties and assets owned by a business (such as motor vehicles, machinery, and furniture) are called:",
    options: [
      { id: "opt-a", text: "Nominal Accounts" },
      { id: "opt-b", text: "Real Accounts" },
      { id: "opt-c", text: "Personal Accounts" },
      { id: "opt-d", text: "Liability Accounts" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Real accounts are ledger accounts relating to tangible and intangible assets and property of the firm, such as buildings, machinery, and cash.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-acc-exp-03",
    topic_id: "top-acc-balance-02",
    question_type: "single_choice",
    prompt: "Which of the following accounting errors will NOT affect the agreement of debit and credit totals in a Trial Balance?",
    options: [
      { id: "opt-a", text: "Arithmetic addition error in the Cash Book" },
      { id: "opt-b", text: "Error of Principle (e.g. charging motor repairs to Motor Vehicle asset account)" },
      { id: "opt-c", text: "Posting an amount only to the debit side without a credit entry" },
      { id: "opt-d", text: "Entering ₦5,000 on the debit side and ₦50,000 on the credit side" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "An Error of Principle occurs when an entry violates accounting principles (e.g. capital vs revenue expenditure), but equal debits and credits were still recorded, so the trial balance still balances.",
    difficulty: 3,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-acc-exp-04",
    topic_id: "top-acc-balance-02",
    question_type: "single_choice",
    prompt: "A temporary holding ledger account opened to record the difference between trial balance debit and credit totals pending investigation of errors is the:",
    options: [
      { id: "opt-a", text: "Control Account" },
      { id: "opt-b", text: "Suspense Account" },
      { id: "opt-c", text: "Nominal Account" },
      { id: "opt-d", text: "Drawing Account" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "When a trial balance fails to agree and books must be provisionally closed, the discrepancy is placed into a Suspense Account until individual posting errors are discovered.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-econ-exp-01",
    topic_id: "top-econ-demand-01",
    question_type: "single_choice",
    prompt: "If a 10% increase in the price of a commodity leads to a 25% decrease in the quantity demanded, the price elasticity of demand (PED) is:",
    options: [
      { id: "opt-a", text: "0.4 (Inelastic)" },
      { id: "opt-b", text: "2.5 (Elastic)" },
      { id: "opt-c", text: "1.0 (Unitary)" },
      { id: "opt-d", text: "0.0 (Perfect)" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Price Elasticity of Demand (PED) = (% change in quantity demanded) / (% change in price) = 25% / 10% = 2.5. Since PED > 1, demand is price elastic.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-econ-exp-02",
    topic_id: "top-econ-demand-01",
    question_type: "single_choice",
    prompt: "The fundamental Law of Demand establishes that, ceteris paribus (all other factors remaining constant):",
    options: [
      { id: "opt-a", text: "As consumer income increases, demand always falls" },
      { id: "opt-b", text: "As the price of a good rises, quantity demanded falls" },
      { id: "opt-c", text: "As supply increases, price will inevitably rise" },
      { id: "opt-d", text: "Price and quantity demanded move in direct parallel" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "The Law of Demand states that there is an inverse relationship between price and quantity demanded: as price increases, quantity demanded decreases, and vice versa.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-econ-exp-03",
    topic_id: "top-econ-macro-02",
    question_type: "single_choice",
    prompt: "Gross National Product (GNP) differs from Gross Domestic Product (GDP) because GNP includes:",
    options: [
      { id: "opt-a", text: "Capital consumption allowances" },
      { id: "opt-b", text: "Net factor income from abroad (NFIA)" },
      { id: "opt-c", text: "Indirect business taxes" },
      { id: "opt-d", text: "Transfer payments" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "GNP = GDP + Net Factor Income from Abroad (NFIA). It measures the total market value of goods and services produced by permanent residents and citizens of a country anywhere in the world.",
    difficulty: 2,
    status: "published",
    provenance: "official"
  },
  {
    id: "qst-econ-exp-04",
    topic_id: "top-econ-macro-02",
    question_type: "single_choice",
    prompt: "A sustained and persistent increase in the general price level of goods and services over an extended period of time is known in macroeconomics as:",
    options: [
      { id: "opt-a", text: "Recession" },
      { id: "opt-b", text: "Inflation" },
      { id: "opt-c", text: "Stagflation" },
      { id: "opt-d", text: "Depreciation" }
    ],
    answer_key: { correctOptionId: "opt-b" },
    explanation: "Inflation is defined as the continuous and persistent increase in the general price level of goods and services, resulting in the erosion of purchasing power.",
    difficulty: 1,
    status: "published",
    provenance: "official"
  }
];
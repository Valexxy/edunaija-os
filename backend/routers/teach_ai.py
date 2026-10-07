"""
EduNaija OS — Protégé Effect AI Teachable Peer Router
World-First Feature: Student TEACHES AI Junior "Temi" — CHI 2026 Research
Retention rate: 90% vs 10% passive reading (Learning Pyramid)
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid
import time
from backend.database.sqlite_store import get_connection, save_protege_session, get_protege_session

router = APIRouter(prefix="/teach-ai", tags=["Protégé Effect"])

# ─── Curriculum Topics ────────────────────────────────────────────────────────
TOPICS = [
    # ─── 100L University CCMAS Courses ──────────────────────────────────────────
    {
        "id": "t-cos-101", "subject": "COS 101 (Intro to Computing)", "class_tier": "100L",
        "concept": "Von Neumann Architecture & Fetch-Execute Cycle",
        "description": "CPU registers, ALU, control unit, bus structures, and memory hierarchy",
        "temi_confusion_level": 4,
        "color": "purple",
        "icon": "💻",
        "curriculum_ref": "NUC CCMAS 2026 — COS 101 Unit 2"
    },
    {
        "id": "t-mth-101", "subject": "MTH 101 (Elementary Calculus)", "class_tier": "100L",
        "concept": "Limits, Continuity & Derivative from First Principles",
        "description": "Delta-epsilon definition, rate of change, tangents, and differentiability",
        "temi_confusion_level": 5,
        "color": "cyan",
        "icon": "📐",
        "curriculum_ref": "NUC CCMAS 2026 — MTH 101 Unit 3"
    },
    {
        "id": "t-gst-112", "subject": "GST 112 (Culture & Nigerian Peoples)", "class_tier": "100L",
        "concept": "The 1914 Amalgamation & Republican Constitutionalism",
        "description": "Lord Lugard, Northern and Southern protectorates, 1963 Republican transition",
        "temi_confusion_level": 3,
        "color": "teal",
        "icon": "🇳🇬",
        "curriculum_ref": "NUC CCMAS 2026 — GST 112 Unit 1"
    },
    {
        "id": "t-gst-113", "subject": "GST 113 (Philosophy & Logic)", "class_tier": "100L",
        "concept": "Formal Syllogisms, Truth Tables & Logical Fallacies",
        "description": "Premises, modus ponens, strawman and ad hominem fallacies in reasoning",
        "temi_confusion_level": 4,
        "color": "indigo",
        "icon": "🧠",
        "curriculum_ref": "NUC CCMAS 2026 — GST 113 Unit 2"
    },
    {
        "id": "t-phy-101", "subject": "PHY 101 (General Physics: Mechanics)", "class_tier": "100L",
        "concept": "Rotational Dynamics & Conservation of Angular Momentum",
        "description": "Torque, moment of inertia, spinning bodies, and planetary orbital speed",
        "temi_confusion_level": 5,
        "color": "sky",
        "icon": "🪐",
        "curriculum_ref": "NUC CCMAS 2026 — PHY 101 Unit 4"
    },

    # ─── JSS Junior Secondary (BECE) ──────────────────────────────────────────
    {
        "id": "t-jss-sci-01", "subject": "Basic Science", "class_tier": "JSS",
        "concept": "Simple Machines, Levers & Mechanical Advantage",
        "description": "First, second, and third class levers, effort, load, and efficiency",
        "temi_confusion_level": 3,
        "color": "blue",
        "icon": "⚙️",
        "curriculum_ref": "NERDC JSS2 Basic Science — Work & Energy"
    },
    {
        "id": "t-jss-mth-01", "subject": "General Mathematics", "class_tier": "JSS",
        "concept": "Linear Equations & Word Problems",
        "description": "Solving single-variable unknowns and translating word problems into algebra",
        "temi_confusion_level": 3,
        "color": "emerald",
        "icon": "📊",
        "curriculum_ref": "NERDC JSS2 Mathematics — Algebraic Processes"
    },
    {
        "id": "t-jss-bus-01", "subject": "Business Studies", "class_tier": "JSS",
        "concept": "Double-Entry Bookkeeping Principles",
        "description": "Debit the receiver, credit the giver — the fundamental accounting equation",
        "temi_confusion_level": 4,
        "color": "amber",
        "icon": "💼",
        "curriculum_ref": "NERDC JSS3 Business Studies — Bookkeeping"
    },

    # ─── Primary Basic Studies ────────────────────────────────────────────────
    {
        "id": "t-pri-mth-01", "subject": "Primary Mathematics", "class_tier": "PRIMARY",
        "concept": "Fractions & Decimals in Everyday Naija Life",
        "description": "Sharing loaves of bread, halves, quarters, and shopping decimal change",
        "temi_confusion_level": 2,
        "color": "pink",
        "icon": "🍰",
        "curriculum_ref": "NERDC Primary 5 Mathematics — Fractions"
    },
    {
        "id": "t-pri-val-01", "subject": "National Values", "class_tier": "PRIMARY",
        "concept": "The Coat of Arms & National Symbols",
        "description": "The eagle, two white horses, the black shield, and the Y-shape confluence",
        "temi_confusion_level": 1,
        "color": "emerald",
        "icon": "🛡️",
        "curriculum_ref": "NERDC Primary 5 Civic Education — National Identity"
    },
    {
        "id": "t-pri-sci-01", "subject": "Basic Science", "class_tier": "PRIMARY",
        "concept": "The Solar System & 8 Orbiting Planets",
        "description": "Mercury to Neptune, the Sun, day and night, and Earth revolution",
        "temi_confusion_level": 2,
        "color": "amber",
        "icon": "☀️",
        "curriculum_ref": "NERDC Primary 5 Science — The Earth and Sky"
    },
    {
        "id": "t-phys-01", "subject": "Physics", "class_tier": "UTME",
        "concept": "Osmosis & Diffusion",
        "description": "Movement of particles across semi-permeable membranes",
        "temi_confusion_level": 3,
        "color": "indigo",
        "icon": "⚗️",
        "curriculum_ref": "JAMB Syllabus — Cell Biology 2.1"
    },
    {
        "id": "t-phys-02", "subject": "Physics", "class_tier": "UTME",
        "concept": "Newton's Laws of Motion",
        "description": "Force, mass, acceleration and reaction pairs",
        "temi_confusion_level": 4,
        "color": "sky",
        "icon": "🚀",
        "curriculum_ref": "JAMB Syllabus — Mechanics 3.2"
    },
    {
        "id": "t-chem-01", "subject": "Chemistry", "class_tier": "UTME",
        "concept": "Mole Concept & Avogadro",
        "description": "Quantitative relationships in chemical reactions",
        "temi_confusion_level": 5,
        "color": "violet",
        "icon": "🧪",
        "curriculum_ref": "JAMB Syllabus — Stoichiometry 4.1"
    },
    {
        "id": "t-chem-02", "subject": "Chemistry", "class_tier": "UTME",
        "concept": "Electrochemistry & Electrolysis",
        "description": "Redox reactions, cells, electroplating",
        "temi_confusion_level": 4,
        "color": "amber",
        "icon": "⚡",
        "curriculum_ref": "JAMB Syllabus — Electrochemistry 7.3"
    },
    {
        "id": "t-bio-01", "subject": "Biology", "class_tier": "UTME",
        "concept": "Photosynthesis",
        "description": "Light and dark reactions, chlorophyll, ATP synthesis",
        "temi_confusion_level": 3,
        "color": "emerald",
        "icon": "🌿",
        "curriculum_ref": "JAMB Syllabus — Plant Physiology 5.1"
    },
    {
        "id": "t-bio-02", "subject": "Biology", "class_tier": "UTME",
        "concept": "DNA Replication & Protein Synthesis",
        "description": "Transcription, translation, codons, ribosomes",
        "temi_confusion_level": 5,
        "color": "rose",
        "icon": "🧬",
        "curriculum_ref": "JAMB Syllabus — Genetics 6.2"
    },
    {
        "id": "t-math-01", "subject": "Mathematics", "class_tier": "UTME",
        "concept": "Differentiation & Integration",
        "description": "Rates of change, area under curves, calculus fundamentals",
        "temi_confusion_level": 5,
        "color": "cyan",
        "icon": "📐",
        "curriculum_ref": "JAMB Syllabus — Calculus 8.1"
    },
    {
        "id": "t-math-02", "subject": "Mathematics", "class_tier": "UTME",
        "concept": "Permutations & Combinations",
        "description": "Counting principles, probability, factorials",
        "temi_confusion_level": 4,
        "color": "fuchsia",
        "icon": "🎲",
        "curriculum_ref": "JAMB Syllabus — Statistics 9.3"
    },
    {
        "id": "t-econ-01", "subject": "Economics", "class_tier": "UTME",
        "concept": "Supply & Demand Elasticity",
        "description": "Price elasticity, income elasticity, cross elasticity",
        "temi_confusion_level": 3,
        "color": "orange",
        "icon": "📈",
        "curriculum_ref": "JAMB Syllabus — Microeconomics 2.2"
    },
    {
        "id": "t-eng-01", "subject": "English", "class_tier": "UTME",
        "concept": "Comprehension & Summary",
        "description": "Inferential reading, main idea, tone, paraphrase skills",
        "temi_confusion_level": 2,
        "color": "teal",
        "icon": "📚",
        "curriculum_ref": "JAMB Syllabus — English Language 1.1"
    },
    {
        "id": "t-phys-03", "subject": "Physics", "class_tier": "WAEC",
        "concept": "Electromagnetic Induction",
        "description": "Faraday's law, Lenz's law, induced EMF",
        "temi_confusion_level": 5,
        "color": "yellow",
        "icon": "🔌",
        "curriculum_ref": "WAEC Syllabus — Electricity 10.2"
    },
    {
        "id": "t-sci-01", "subject": "Basic Science", "class_tier": "JSCE",
        "concept": "States of Matter",
        "description": "Solid, liquid, gas — particle theory and phase changes",
        "temi_confusion_level": 2,
        "color": "blue",
        "icon": "💧",
        "curriculum_ref": "NERDC JSS2 Basic Science 3.1"
    },
    {
        "id": "t-sci-02", "subject": "Basic Science", "class_tier": "PRIMARY",
        "concept": "The Human Body",
        "description": "Organs, systems, bones, muscles for primary school",
        "temi_confusion_level": 1,
        "color": "pink",
        "icon": "🫀",
        "curriculum_ref": "NERDC Primary 5 Science 1.1"
    },
    {
        "id": "t-gov-01", "subject": "Government", "class_tier": "UTME",
        "concept": "Nigerian Constitutional History",
        "description": "1960, 1963, 1979, 1999 constitutions and their differences",
        "temi_confusion_level": 4,
        "color": "green",
        "icon": "🏛️",
        "curriculum_ref": "JAMB Syllabus — Government 3.1"
    },
    {
        "id": "t-geo-01", "subject": "Geography", "class_tier": "WAEC",
        "concept": "Population & Migration",
        "description": "Push/pull factors, urbanization, demographic transition",
        "temi_confusion_level": 3,
        "color": "lime",
        "icon": "🌍",
        "curriculum_ref": "WAEC Syllabus — Human Geography 4.2"
    },
]

# ─── Temi's Confusion Bank ────────────────────────────────────────────────────
TEMI_QUESTIONS = {
    "why": [
        "But WHY does that happen exactly? I don't understand the reason behind it.",
        "That makes sense but... WHY does it work that way and not the other way?",
        "Wait — WHY does this only happen under those conditions?",
        "Hmm, but WHY would nature choose to do it like this?",
        "I understand WHAT it is, but WHY does it occur?",
    ],
    "example": [
        "Can you give me a real-life example from Nigeria that I can relate to?",
        "Could you show me an example of this from everyday life?",
        "That's confusing — can you use a simple example to show me?",
        "What would be a concrete Nigerian example of this concept?",
        "Can you walk me through an example step by step?",
    ],
    "analogy": [
        "This is too abstract for me. Can you compare it to something I already know?",
        "Is there an analogy — like comparing it to something familiar?",
        "Could you explain it like I'm using something from my daily life?",
        "What does this remind you of? Like, what common thing works the same way?",
        "I need a mental picture. What is this similar to?",
    ],
    "consequence": [
        "Okay but what HAPPENS if this condition changes? What's the effect?",
        "What would go wrong if the process didn't work this way?",
        "If this concept didn't exist, what would be different?",
        "What are the consequences if someone gets this wrong in an exam?",
        "So what real-world problem does this solve?",
    ],
    "definition": [
        "Wait — can you define the key terms again more simply?",
        "I got confused on the definition. What exactly does that word mean?",
        "Let me re-confirm — what is the exact scientific definition?",
        "That word is confusing me. Can you break down its meaning?",
        "What's the JAMB-exact definition I should memorize?",
    ],
}

MISCONCEPTION_TIPS = {
    "t-phys-01": "Common mistake: Students confuse osmosis (water only) with diffusion (any substance). Osmosis requires a semi-permeable membrane — diffusion doesn't.",
    "t-phys-02": "Common mistake: Newton's 3rd law pairs must be on DIFFERENT objects. The normal force and gravity on the same object are NOT a Newton's 3rd pair.",
    "t-chem-01": "Common mistake: 1 mole = 6.022×10²³ particles is not just for atoms — it works for molecules, ions, electrons. Many students only apply it to atoms.",
    "t-chem-02": "Common mistake: At the cathode, cations are reduced (gain electrons). At the anode, anions are oxidized (lose electrons). Students often reverse these.",
    "t-bio-01": "Common mistake: Photosynthesis does NOT release CO₂ — it absorbs it. Respiration releases CO₂. Both happen simultaneously in plants.",
    "t-bio-02": "Common mistake: DNA is transcribed to mRNA, then translated at ribosomes. Many students skip the tRNA step which carries amino acids.",
    "t-math-01": "Common mistake: The integral of x^n = x^(n+1)/(n+1) + C. Students often forget the +C (constant of integration), losing marks.",
    "t-math-02": "Common mistake: nPr ≠ nCr. Permutation counts ORDER, combination ignores order. A common error is mixing these in probability questions.",
    "t-econ-01": "Common mistake: Price elastic means |PED| > 1 (luxury goods). Price inelastic means |PED| < 1 (necessities). Students mix up the inequality.",
    "t-eng-01": "Common mistake: The question asks for 'implied' meaning — students write what the passage explicitly says instead of what is logically inferred.",
    "t-phys-03": "Common mistake: Lenz's law direction. The induced current opposes the CHANGE in flux, not the flux itself. This is frequently confused.",
    "t-sci-01": "Common mistake: Gas particles are NOT absent — they just have very weak intermolecular forces and move rapidly and randomly.",
    "t-sci-02": "Common mistake: The heart pumps blood, it is NOT where blood is made. Blood is made in the bone marrow.",
    "t-gov-01": "Common mistake: The 1979 constitution introduced the presidential system. Before that, Nigeria used the parliamentary system.",
    "t-geo-01": "Common mistake: Urban migration is driven by both push factors (rural problems) AND pull factors (urban opportunities). Exam questions test both.",
}

# ─── In-Memory Session Store ───────────────────────────────────────────────────
sessions: dict = {}

# ─── Models ───────────────────────────────────────────────────────────────────
class StartSessionRequest(BaseModel):
    student_id: str
    topic_id: str
    student_explanation: str

class ContinueSessionRequest(BaseModel):
    student_response: str

# ─── Routes ───────────────────────────────────────────────────────────────────
@router.get("/topics")
async def get_topics(class_tier: Optional[str] = None, subject: Optional[str] = None):
    filtered = TOPICS
    if class_tier:
        filtered = [t for t in filtered if t["class_tier"] == class_tier.upper()]
    if subject:
        filtered = [t for t in filtered if t["subject"].lower() == subject.lower()]
    return {"topics": filtered, "total": len(filtered)}


@router.post("/session")
async def start_session(req: StartSessionRequest):
    topic = next((t for t in TOPICS if t["id"] == req.topic_id), None)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # Evaluate explanation quality (heuristic scoring)
    explanation_words = len(req.student_explanation.split())
    explanation_chars = len(req.student_explanation)

    # Score based on length, keyword presence, and structure
    concept_words = topic["concept"].lower().split()
    keywords_found = sum(1 for w in concept_words if w in req.student_explanation.lower())
    keyword_ratio = keywords_found / max(len(concept_words), 1)

    base_score = min(70, explanation_words * 2)  # up to 70 for word count
    keyword_bonus = int(keyword_ratio * 20)       # up to 20 for keywords
    mastery_score = min(95, base_score + keyword_bonus)

    if explanation_words < 10:
        mastery_score = max(10, mastery_score - 30)

    # Choose confusion type based on mastery score
    import random
    confusion_types = list(TEMI_QUESTIONS.keys())
    if mastery_score < 30:
        confusion_type = "definition"
    elif mastery_score < 50:
        confusion_type = "why"
    elif mastery_score < 70:
        confusion_type = "example"
    elif mastery_score < 85:
        confusion_type = "analogy"
    else:
        confusion_type = "consequence"

    follow_up = random.choice(TEMI_QUESTIONS[confusion_type])

    # XP calculation
    xp_earned = int(mastery_score * 0.8) + (5 if explanation_words > 50 else 0)

    # AI response as Temi (confused junior student)
    ai_response_templates = {
        "definition": f"Hmm okay... I think I get it a little bit. You said '{topic['concept']}' but I'm still not 100% clear on what that actually means in simple terms.",
        "why": f"Oh wow, that's interesting about {topic['concept']}! I can repeat what you said but I don't actually understand WHY it happens.",
        "example": f"Okay I sort of follow you on {topic['concept']}... but everything you said is very abstract for me. Can you make it more concrete?",
        "analogy": f"That explanation of {topic['concept']} is cool but I can't picture it in my head. I need something to compare it to.",
        "consequence": f"Thanks! I think I understand {topic['concept']} now. But I'm wondering — so what? Why does this matter in real life?",
    }

    ai_response = ai_response_templates.get(confusion_type, f"Interesting! But I still have questions about {topic['concept']}.")

    session_id = str(uuid.uuid4())[:8]
    misconception_tip = MISCONCEPTION_TIPS.get(req.topic_id, "Keep teaching — explaining it out loud reveals gaps in understanding!")
    misconception_detected = keyword_ratio < 0.5 and explanation_words > 10

    session = {
        "session_id": session_id,
        "student_id": req.student_id,
        "topic": topic,
        "exchanges": [
            {
                "turn": 1,
                "student_explanation": req.student_explanation,
                "mastery_score": mastery_score,
                "ai_response": ai_response,
                "follow_up_question": follow_up,
                "confusion_type": confusion_type,
            }
        ],
        "total_mastery": mastery_score,
        "xp_total": xp_earned,
        "created_at": time.time(),
    }
    sessions[session_id] = session
    try:
        save_protege_session(session)
    except Exception:
        pass

    return {
        "session_id": session_id,
        "topic": topic,
        "ai_response": ai_response,
        "confusion_type": confusion_type,
        "mastery_score": mastery_score,
        "xp_earned": xp_earned,
        "follow_up_question": follow_up,
        "misconception_detected": misconception_detected,
        "misconception_tip": misconception_tip,
        "turn": 1,
    }


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    session = sessions.get(session_id) or get_protege_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/session/{session_id}/continue")
async def continue_session(session_id: str, req: ContinueSessionRequest):
    session = sessions.get(session_id) or get_protege_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    import random
    turn = len(session["exchanges"]) + 1
    if turn > 6:
        return {
            "session_complete": True,
            "total_mastery": session["total_mastery"],
            "xp_total": session["xp_total"],
            "exchanges": len(session["exchanges"]),
            "message": "🎓 Teaching session complete! Temi now understands this topic thanks to you.",
        }

    words = len(req.student_response.split())
    topic = session["topic"]
    concept_words = topic["concept"].lower().split()
    keywords = sum(1 for w in concept_words if w in req.student_response.lower())
    mastery_score = min(99, session["exchanges"][-1]["mastery_score"] + min(15, words) + keywords * 3)

    # Progress Temi to deeper understanding
    confusion_progression = ["definition", "why", "example", "analogy", "consequence", "synthesis"]
    confusion_type = confusion_progression[min(turn - 1, 5)]

    if confusion_type == "synthesis" or turn >= 5:
        ai_responses = [
            f"Oh! NOW I get {topic['concept']}! So basically it means... {req.student_response[:80]}... Is that right?",
            f"Wow, you're such a good teacher! I think I can now explain {topic['concept']} to someone else.",
            f"Thanks! So {topic['concept']} is really about {req.student_response[:60]}... right?",
        ]
        follow_up = "I think I understand now! Can you give me one final summary — what are the 3 key things to remember for the exam?"
    else:
        follow_up = random.choice(TEMI_QUESTIONS.get(confusion_type, TEMI_QUESTIONS["why"]))
        ai_responses = [
            f"Okay that helps! But I still have one more question about {topic['concept']}...",
            f"Getting clearer! Your explanation is really good. But I'm confused about one more thing...",
            f"Thanks for that! Almost got it. Just one more thing is confusing me...",
        ]

    ai_response = random.choice(ai_responses)
    xp_earned = min(30, words + keywords * 5)

    exchange = {
        "turn": turn,
        "student_explanation": req.student_response,
        "mastery_score": mastery_score,
        "ai_response": ai_response,
        "follow_up_question": follow_up,
        "confusion_type": confusion_type,
    }
    session["exchanges"].append(exchange)
    session["total_mastery"] = mastery_score
    session["xp_total"] += xp_earned
    session["is_completed"] = turn >= 5
    try:
        save_protege_session(session)
    except Exception:
        pass

    return {
        "session_id": session_id,
        "turn": turn,
        "ai_response": ai_response,
        "follow_up_question": follow_up,
        "confusion_type": confusion_type,
        "mastery_score": mastery_score,
        "xp_earned": xp_earned,
        "session_complete": turn >= 5,
        "total_mastery": session["total_mastery"],
        "xp_total": session["xp_total"],
    }


@router.get("/leaderboard")
async def teaching_leaderboard():
    """Top teachers — those who have highest average mastery scores when teaching Temi"""
    return {
        "leaderboard": [
            {"rank": 1, "name": "Oluwaseun Adeyemi", "school": "FGGC Sagamu", "avg_mastery": 94, "sessions": 23, "badge": "Master Teacher"},
            {"rank": 2, "name": "Chisom Okonkwo", "school": "Queens College Lagos", "avg_mastery": 91, "sessions": 17, "badge": "Mentor"},
            {"rank": 3, "name": "Emeka Chukwu", "school": "FGGC Onitsha", "avg_mastery": 89, "sessions": 31, "badge": "Educator"},
            {"rank": 4, "name": "Aisha Mohammed", "school": "GGSS Kano", "avg_mastery": 87, "sessions": 14, "badge": "Scholar"},
            {"rank": 5, "name": "Tobi Adeleke", "school": "Loyola Jesuit Abuja", "avg_mastery": 85, "sessions": 8, "badge": "Rising Star"},
        ],
        "protege_fact": "Students who teach concepts retain 90% after 2 weeks vs 10% for passive reading (Learning Pyramid, NTL Institute)"
    }

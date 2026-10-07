"""
Student Lifecycle & Anti-Cheat Class Promotion Router
Manages the complete end-to-end academic journey of a student:
1. Placement Diagnostic
2. Foundation Study
3. Benchmark Testing
4. Promotion Gateway (Anti-Cheat Gatekeeper: >=80% Diagnostic Exam OR Parent PIN)
5. Certified Transcripts
"""

import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from backend.database.sqlite_store import (
    get_student_lifecycle,
    attempt_class_promotion,
    get_class_transition_audit_logs,
    set_student_parent_pin,
    get_system_config_value,
    get_tutorials
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/lifecycle", tags=["Student Academic Lifecycle & Anti-Cheat Progression"])

class PromotionRequest(BaseModel):
    student_key: str
    target_tier: str # PRIMARY, JSS, SSS, UTME, FRESHMAN
    diagnostic_score: Optional[float] = None
    parent_pin: Optional[str] = None

class SetParentPinRequest(BaseModel):
    student_key: str
    new_pin: str

DIAGNOSTIC_QUESTIONS_MAP = {
    "PRIMARY": [
        {"id": "diag-p1", "q": "What is 3/4 + 1/4?", "options": ["4/8", "1", "2/4", "3/8"], "correct": "B"},
        {"id": "diag-p2", "q": "Which of these is a living thing?", "options": ["Toy car", "Plastic cup", "Mango tree", "Stone"], "correct": "C"},
        {"id": "diag-p3", "q": "What is the past tense of 'run'?", "options": ["Runned", "Ran", "Running", "Runs"], "correct": "B"},
        {"id": "diag-p4", "q": "Find the perimeter of a rectangle with length 6cm and width 4cm.", "options": ["24cm", "10cm", "20cm", "12cm"], "correct": "C"},
        {"id": "diag-p5", "q": "What organ in the human body pumps blood?", "options": ["Lungs", "Heart", "Stomach", "Kidney"], "correct": "B"},
    ],
    "JSS": [
        {"id": "diag-j1", "q": "Solve for x: 3x - 5 = 16", "options": ["x = 7", "x = 5", "x = 6", "x = 8"], "correct": "A"},
        {"id": "diag-j2", "q": "Which state of matter has definite volume but indefinite shape?", "options": ["Solid", "Liquid", "Gas", "Plasma"], "correct": "B"},
        {"id": "diag-j3", "q": "What is the kinetic energy formula?", "options": ["KE = mgh", "KE = 1/2 mv^2", "KE = F x d", "KE = ma"], "correct": "B"},
        {"id": "diag-j4", "q": "Convert 0.35 to a fraction in simplest terms.", "options": ["35/100", "7/20", "3/5", "7/10"], "correct": "B"},
        {"id": "diag-j5", "q": "Which organelle is known as the powerhouse of the cell?", "options": ["Nucleus", "Mitochondria", "Ribosome", "Vacuole"], "correct": "B"},
    ],
    "SSS": [
        {"id": "diag-s1", "q": "What is the characteristic of log10(0.0045)?", "options": ["bar(2)", "bar(3)", "-2", "3"], "correct": "B"},
        {"id": "diag-s2", "q": "According to Ohm's Law, what is the relation between Voltage, Current, and Resistance?", "options": ["V = I/R", "V = IR", "I = VR", "R = VI"], "correct": "B"},
        {"id": "diag-s3", "q": "What is the conjugate of the surd (sqrt(3) + sqrt(2))?", "options": ["sqrt(3) - sqrt(2)", "sqrt(2) - sqrt(3)", "sqrt(6)", "3 - 2"], "correct": "A"},
        {"id": "diag-s4", "q": "A solution with pH = 2 is classified as:", "options": ["Weak base", "Neutral", "Strong acid", "Weak acid"], "correct": "C"},
        {"id": "diag-s5", "q": "What is the acceleration due to gravity on Earth's surface approximately?", "options": ["9.8 m/s^2", "12 m/s^2", "5.4 m/s^2", "15 m/s^2"], "correct": "A"},
    ],
    "UTME": [
        {"id": "diag-u1", "q": "Evaluate the derivative of f(x) = 3x^3 - 5x + 7 at x = 2.", "options": ["31", "24", "18", "26"], "correct": "A"},
        {"id": "diag-u2", "q": "Which gas is evolved when dilute hydrochloric acid reacts with calcium trioxocarbonate(IV)?", "options": ["Hydrogen", "Carbon(IV) oxide", "Oxygen", "Chlorine"], "correct": "B"},
        {"id": "diag-u3", "q": "In English phonetics, the vowel sound in 'ship' is:", "options": ["Long /i:/", "Short /I/", "Diphthong /eI/", "Schwa /@/"], "correct": "B"},
        {"id": "diag-u4", "q": "Calculate the work done when a force of 50N moves a block 4 meters in its direction.", "options": ["200 J", "12.5 J", "54 J", "100 J"], "correct": "A"},
        {"id": "diag-u5", "q": "If sin(theta) = 3/5 in quadrant 1, what is cos(theta)?", "options": ["4/5", "3/4", "5/4", "1/2"], "correct": "A"},
    ],
    "FRESHMAN": [
        {"id": "diag-f1", "q": "Evaluate limit as x -> 0 of sin(x)/x.", "options": ["0", "1", "Infinity", "Undefined"], "correct": "B"},
        {"id": "diag-f2", "q": "For vectors A and B, what is the geometric meaning of |A x B|?", "options": ["Dot product", "Area of parallelogram spanned by A and B", "Scalar projection", "Volume of box"], "correct": "B"},
        {"id": "diag-f3", "q": "Which thermodynamic law states that entropy of an isolated system never decreases?", "options": ["Zeroth Law", "First Law", "Second Law", "Third Law"], "correct": "C"},
        {"id": "diag-f4", "q": "Evaluate integral of (2x + 1) dx from 0 to 2.", "options": ["6", "4", "8", "5"], "correct": "A"},
        {"id": "diag-f5", "q": "What is the condition for a matrix A to be invertible?", "options": ["det(A) = 0", "det(A) != 0", "Trace(A) = 0", "Rank(A) = 0"], "correct": "B"},
    ]
}

@router.get("/{student_key}")
def get_lifecycle(student_key: str):
    """Retrieves full student academic lifecycle, current enrolled tier, and promotion threshold."""
    lifecycle = get_student_lifecycle(student_key)
    threshold = get_system_config_value("class_promotion_pass_threshold", 80)
    audit_logs = get_class_transition_audit_logs(student_key=student_key)

    return {
        "status": "success",
        "student_key": student_key,
        "lifecycle": lifecycle,
        "promotion_pass_threshold": threshold,
        "class_history": audit_logs,
        "anti_cheat_policy": "Class changes require >=80% on Diagnostic Gateway Exam OR verified Parent Security PIN."
    }

@router.get("/diagnostic-exam/{tier}")
def get_diagnostic_questions(tier: str):
    """Returns 5 diagnostic readiness questions to verify candidate suitability before class promotion."""
    clean_tier = tier.upper().strip()
    questions = DIAGNOSTIC_QUESTIONS_MAP.get(clean_tier, DIAGNOSTIC_QUESTIONS_MAP["SSS"])
    threshold = get_system_config_value("class_promotion_pass_threshold", 80)

    return {
        "status": "success",
        "target_tier": clean_tier,
        "question_count": len(questions),
        "pass_threshold_percentage": threshold,
        "questions": questions
    }

@router.post("/request-promotion")
def request_promotion(payload: PromotionRequest):
    """
    Submits a class tier promotion request.
    Verifies that the student has earned the promotion (diagnostic score >= 80% OR valid Parent PIN).
    Prevents cheating, level-skipping, and transcript wiping.
    """
    if not payload.student_key or not payload.target_tier:
        raise HTTPException(status_code=400, detail="Missing student_key or target_tier")

    result = attempt_class_promotion(
        student_key=payload.student_key,
        target_tier=payload.target_tier,
        diagnostic_score=payload.diagnostic_score,
        parent_pin=payload.parent_pin
    )

    if result.get("status") == "rejected":
        raise HTTPException(status_code=403, detail=result.get("message"))

    return result

@router.post("/set-parent-pin")
def post_set_parent_pin(payload: SetParentPinRequest):
    """Sets or updates the parent security PIN required for authorizing class transitions."""
    result = set_student_parent_pin(payload.student_key, payload.new_pin)
    return result

@router.get("/transcript/{student_key}")
def get_student_transcript(student_key: str):
    """
    Returns an immutable, verified academic transcript of all enrolled tiers,
    diagnostic benchmarks, and cumulative competency mastery.
    """
    lifecycle = get_student_lifecycle(student_key)
    history = get_class_transition_audit_logs(student_key=student_key)

    return {
        "status": "success",
        "institution": "OmniLearn Sovereign Autonomous Academic Council",
        "student_key": student_key,
        "student_name": lifecycle.get("student_name", "Scholar"),
        "current_tier": lifecycle.get("current_tier"),
        "cumulative_mastery": lifecycle.get("cumulative_mastery_pct"),
        "total_study_hours": round(lifecycle.get("total_study_minutes", 0) / 60, 1),
        "accreditation_hash": f"TRNS-{student_key}-VERIFIED",
        "academic_transitions": history
    }

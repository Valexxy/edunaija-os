"""
Quiz & Past Questions API Router
Serves 110+ past questions with full explainers & Gemini AI Socratic Brother explanations.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.config import settings
from backend.database.sqlite_store import (
    get_questions_from_db, 
    explain_with_gemini,
    record_quiz_answer,
    get_student_live_stats,
    get_cohort_at_risk_topics,
    get_nigerian_states,
    get_nigerian_state_details,
    get_nigerian_institutions,
    get_nigerian_secondary_schools,
    generate_student_test_pack,
    get_cohort_curriculum_catalog
)

router = APIRouter(prefix="/quiz", tags=["Quiz & 100+ Past Questions"])

class ExplainRequest(BaseModel):
    question_text: str
    selected_option: str
    correct_option: str
    subject: str = "General"
    mode: str = "pidgin" # 'pidgin' | 'standard'

class GenerateDrillRequest(BaseModel):
    user_key: str = "guest_student"
    subject: Optional[str] = None
    exam_mode: str = "cbt_mock"  # 'diagnostic' | 'micro_drill' | 'speed_sprint' | 'subject_drill' | 'full_jamb' | 'cbt_mock' | 'showdown'
    count: int = 20

class SubmitAnswerRequest(BaseModel):
    user_key: str
    question_id: int
    selected_option: str
    time_spent_secs: int = 15

@router.get("/all-class-tiers")
def get_all_class_tiers():
    """Returns all supported Nigerian educational cohorts from Primary 1 to 100-Level University."""
    return {
        "status": "success",
        "tiers": [
            {"id": "PRIMARY", "title": "Universal Basic Education (Primary 1-6)", "subjects": ["Mathematics", "English Studies", "Basic Science", "National Values", "Indigenous Languages"]},
            {"id": "JSS", "title": "Junior Secondary School (JSS 1-3 / BECE)", "subjects": ["Mathematics", "English", "Basic Science & Tech", "Business Studies", "Civic Education"]},
            {"id": "SSS", "title": "Senior Secondary School (SS 1-3 / WAEC / NECO / JAMB)", "tracks": ["SCIENCE", "ARTS", "COMMERCIAL"]},
            {"id": "100L", "title": "Undergraduate Freshman (100-Level NUC CCMAS)", "faculties": ["FACULTY_COMPUTING", "FACULTY_ENGINEERING", "FACULTY_MEDICINE", "FACULTY_LAW", "FACULTY_MANAGEMENT"]}
        ]
    }

@router.get("/curriculum-courses")
def get_curriculum_courses(
    tier: Optional[str] = Query("SSS", description="Class Tier: PRIMARY, JSS, SSS, 100L"),
    faculty: Optional[str] = Query(None, description="Faculty for 100L: FACULTY_COMPUTING, FACULTY_ENGINEERING, FACULTY_MEDICINE, FACULTY_LAW, FACULTY_MANAGEMENT"),
    track: Optional[str] = Query("SCIENCE", description="Track for SSS: SCIENCE, COMMERCIAL, ARTS")
):
    """Returns authentic Nigerian curriculum courses/subjects strictly mapped to student cohort as of October 5, 2026."""
    courses = get_cohort_curriculum_catalog(tier=tier, faculty=faculty, track=track)
    return {
        "tier": tier,
        "faculty": faculty,
        "track": track,
        "total_courses": len(courses),
        "courses": courses
    }

@router.get("/questions")
def get_questions(
    subject: Optional[str] = Query(None, description="Filter by subject/course name: Mathematics, Physics, COS 101, GET 101, GST 112, etc."),
    academic_track: Optional[str] = Query(None, description="Filter by academic track: SCIENCE, ARTS, COMMERCIAL, TERTIARY_CCMAS, PRIMARY_BASIC"),
    class_tier: Optional[str] = Query(None, description="Filter by class tier: PRIMARY, JSS, SSS, 100L"),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """Retrieve real JAMB/WAEC/NUC CCMAS past questions with step-by-step solutions and marking schemes"""
    questions = get_questions_from_db(
        subject=subject, 
        limit=limit, 
        offset=offset, 
        academic_track=academic_track,
        class_tier=class_tier
    )
    return {
        "count": len(questions),
        "subject": subject or "All Subjects",
        "academic_track": academic_track or "All Tracks",
        "class_tier": class_tier or "All Tiers",
        "questions": questions
    }

@router.post("/submit-answer")
def submit_answer(payload: SubmitAnswerRequest):
    """
    Real-Time Answer Pipeline:
    Persists attempt into SQLite, updates topic mastery %, adjusts streak & hearts,
    calculates predicted JAMB score (out of 400), and emits live telemetry.
    """
    res = record_quiz_answer(
        user_key=payload.user_key,
        question_id=payload.question_id,
        selected_option=payload.selected_option,
        time_spent_secs=payload.time_spent_secs
    )
    return res

@router.get("/live-stats/{user_key}")
def fetch_live_stats(user_key: str):
    """Returns real-time student mastery, hearts, XP, streak, and at-risk topics"""
    return get_student_live_stats(user_key)

@router.get("/cohort-at-risk")
def fetch_cohort_at_risk():
    """Returns topics across cohorts with <60% mastery for teacher intervention"""
    return {
        "status": "success",
        "at_risk": get_cohort_at_risk_topics()
    }

@router.post("/explain")
async def explain_failed_question(payload: ExplainRequest):
    """
    Generate instant pedagogical explainer via Socratic Mentor using pedagogical guidance prompt.
    Explains in Nigerian Pidgin or Standard English why chosen option is wrong.
    """
    result = await explain_with_gemini(
        question_text=payload.question_text,
        selected_option=payload.selected_option,
        correct_option=payload.correct_option,
        subject=payload.subject,
        gemini_key=settings.GEMINI_API_KEY,
        mode=payload.mode
    )
    return result

@router.get("/directory/states")
def fetch_nigerian_states():
    """Returns all 36 Nigerian states + FCT Abuja with geopolitical zones, mottos, and capitals"""
    return {
        "status": "success",
        "states": get_nigerian_states()
    }

@router.get("/directory/state/{state_name}")
def fetch_nigerian_state_details(state_name: str):
    """Returns comprehensive cultural, historical, and educational heritage for a specific Nigerian State"""
    details = get_nigerian_state_details(state_name)
    if not details:
        raise HTTPException(status_code=404, detail=f"State '{state_name}' not found")
    return {
        "status": "success",
        "state": details
    }

@router.get("/directory/institutions")
def fetch_nigerian_institutions(
    state: Optional[str] = Query(None, description="Filter by state (e.g. Lagos, Oyo, Rivers)"),
    institution_type: Optional[str] = Query(None, description="Filter by type (Federal University, State University, Polytechnic)")
):
    """Returns directory of Nigerian universities, polytechnics, and colleges"""
    return {
        "status": "success",
        "institutions": get_nigerian_institutions(state=state, inst_type=institution_type)
    }

@router.get("/directory/schools")
def fetch_nigerian_secondary_schools(
    state: Optional[str] = Query(None, description="Filter by state (e.g. Lagos, Abuja, Rivers, Edo)")
):
    """Returns directory of premier secondary schools and unity colleges across Nigeria"""
    return {
        "status": "success",
        "schools": get_nigerian_secondary_schools(state=state)
    }

@router.post("/generate-drill")
def generate_personalized_drill(payload: GenerateDrillRequest):
    """
    Dynamically generates personalized, anti-collusion exam packs:
    - diagnostic: 10 calibration questions across Bloom's tiers (8 mins)
    - micro_drill: 5 targeted questions on student's weak topics (3 mins)
    - speed_sprint: 15 questions rapid-fire (10 mins)
    - subject_drill: 40 questions official subject exam (40 mins)
    - full_jamb: 40 questions per subject (120 mins)
    - showdown: Uniform standardized seed for national competition (45 mins)
    Zero answer leakage: solution formulas and derivations are kept hidden during active testing.
    """
    pack = generate_student_test_pack(
        user_key=payload.user_key,
        subject=payload.subject,
        exam_mode=payload.exam_mode,
        count=payload.count
    )
    return pack
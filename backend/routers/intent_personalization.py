"""
AI Visitor Intent Detection & Individualized Student Mastery Router
Understands every visitor's intent and tailors personalized pedagogical pathways.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from backend.database.sqlite_store import (
    get_or_create_personalization_profile,
    update_personalization_profile,
    resolve_cognitive_gap
)

router = APIRouter(prefix="/api/intent-personalization", tags=["AI Visitor Intent & Student Mastery"])

class IntentDetectionRequest(BaseModel):
    query: Optional[str] = None
    chip_id: Optional[str] = None
    referrer: Optional[str] = None

class ModalityUpdateRequest(BaseModel):
    user_key: str
    learning_modality: Optional[str] = None # 'visual_spatial', 'socratic_dialectic', 'step_by_step_deductive', 'auditory_phonics'
    learning_velocity: Optional[str] = None # 'measured_deep', 'fast_sprinter', 'remedial_scaffolding'
    target_grade_band: Optional[str] = None

class DiagnosticCalibrationRequest(BaseModel):
    user_key: str
    subject: str
    diagnostic_score: float # 0 - 100
    identified_gap_topic: Optional[str] = None
    prerequisite_gap: Optional[str] = None

# Pre-defined smart intent definitions
PRESET_INTENTS: Dict[str, Dict[str, Any]] = {
    "jamb_300": {
        "persona": "student",
        "academic_tier": "UTME",
        "intent_title": "JAMB UTME 300+ Distinction Mission",
        "matched_need": "Master official 2026 syllabus, 'The Lekki Headmaster' novel, and timed 400pt CBT mocks.",
        "recommended_route": "/student",
        "hero_headline": "Welcome, JAMB 2026 Aspirant: Unlock Your 320+ Score Trajectory",
        "roadmap_steps": [
            {"step": 1, "title": "Diagnostic Baseline Test", "desc": "Pinpoint your current score band across your 4 UTME subject combinations."},
            {"step": 2, "title": "Bionic Literature Drill", "desc": "Read 'The Lekki Headmaster' with saccadic fixation anchors to finish 3x faster."},
            {"step": 3, "title": "Ghost Pacing CBT Sprint", "desc": "Race against the national top 1% benchmark to eliminate exam hall time freeze."}
        ]
    },
    "primary_reading": {
        "persona": "parent",
        "academic_tier": "PRIMARY",
        "intent_title": "Primary Foundation & Phonics Acceleration",
        "matched_need": "Safe, zero-distraction interactive learning, oral English phonics, and mental math for your child.",
        "recommended_route": "/playground",
        "hero_headline": "Empower Your Child with Nigeria's Safest Sovereign Learning Wonder Lab",
        "roadmap_steps": [
            {"step": 1, "title": "Acoustic Phonics Calibration", "desc": "Microphone FFT formant analysis to teach crisp British & Nigerian English vowels."},
            {"step": 2, "title": "Wonder Lab Quests", "desc": "Visual math puzzles using Agege bread & marketplace fractions."},
            {"step": 3, "title": "Friday WhatsApp Radar", "desc": "Receive weekly verified academic report cards straight to your WhatsApp."}
        ]
    },
    "waec_sciences": {
        "persona": "student",
        "academic_tier": "SSS",
        "intent_title": "WAEC / NECO Senior Science Mastery (A1 Goal)",
        "matched_need": "Step-by-step marking schemes, AI theory grading for Physics/Chemistry, and syllabus coverage.",
        "recommended_route": "/student",
        "hero_headline": "Senior Secondary Scholar: Transform Your WAEC Grades to Straight A1s",
        "roadmap_steps": [
            {"step": 1, "title": "Theory Grader Autopsy", "desc": "Submit handwritten or typed working to receive official Method (M) & Accuracy (A) breakdown."},
            {"step": 2, "title": "Prerequisite Repair", "desc": "Bridge algebra & unit conversion bottlenecks holding back your Physics score."},
            {"step": 3, "title": "Sunday National Showdown", "desc": "Test your stamina against the brightest senior scholars across 36 states."}
        ]
    },
    "university_5_0": {
        "persona": "student",
        "academic_tier": "FRESHMAN",
        "intent_title": "100L Campus Foundation & First Class 5.0 CGPA",
        "matched_need": "University GST 111/112 guides, credit unit modeling, and 5.0 First Class honours trajectory.",
        "recommended_route": "/student",
        "hero_headline": "Undergraduate Scholar: Build Your 5.0 CGPA from Day 1",
        "roadmap_steps": [
            {"step": 1, "title": "GST 111 & 112 Exam Vault", "desc": "Bionic summaries of Use of English and Nigerian Peoples & Culture."},
            {"step": 2, "title": "5.0 CGPA Simulator", "desc": "Calculate exact unit requirements to safeguard First Class standing."},
            {"step": 3, "title": "Course-to-Career Navigator", "desc": "Connect your degree discipline directly to high-paying Nigerian graduate employers."}
        ]
    },
    "teacher_schemes": {
        "persona": "tutor",
        "academic_tier": "SSS",
        "intent_title": "Teacher Pedagogical Copilot & NERDC Schemes",
        "matched_need": "Automate lesson plans, generate standardized mock papers, and diagnose cohort misconceptions.",
        "recommended_route": "/curriculum",
        "hero_headline": "Educators & School Heads: Save 15 Hours Weekly with AI Lesson Schemes",
        "roadmap_steps": [
            {"step": 1, "title": "NERDC Scheme Builder", "desc": "Instant week-by-week lesson schemes for term 1, 2, and 3."},
            {"step": 2, "title": "Question Autopsy Lab", "desc": "Analyze item discrimination to see which exam distractor tricked your students."},
            {"step": 3, "title": "Print-Ready Exam Papers", "desc": "Generate PDF question papers and official marking guides in seconds."}
        ]
    },
    "school_cbt": {
        "persona": "school",
        "academic_tier": "UTME",
        "intent_title": "School Enterprise CBT & Bulk Scratch Cards",
        "matched_need": "Offline zero-data exam center infrastructure, student scratch card vouchers, and parent admissions.",
        "recommended_route": "/school-admin",
        "hero_headline": "Modernize Your School: Enterprise CBT Engine with ₦0 Internet Requirement",
        "roadmap_steps": [
            {"step": 1, "title": "Bulk 16-Digit Scratch Cards", "desc": "Generate encrypted access codes for your student cohort."},
            {"step": 2, "title": "Local Campus CBT Network", "desc": "Run full hall examinations with zero internet dependency via LAN sync."},
            {"step": 3, "title": "Institution Showcase", "desc": "Feature your school on Nigeria's verified national directory for prospective parents."}
        ]
    }
}

@router.post("/detect")
async def detect_visitor_intent(req: IntentDetectionRequest) -> Dict[str, Any]:
    """
    Intelligently classifies visitor intent from smart chips or natural language queries.
    Returns tailored persona, academic tier, personalized hero, and step roadmap.
    """
    # 1. Direct chip selection
    if req.chip_id and req.chip_id in PRESET_INTENTS:
        result = PRESET_INTENTS[req.chip_id].copy()
        result["source"] = "chip"
        return result

    # 2. Natural language heuristic matching
    query_text = (req.query or "").lower().strip()
    
    # Primary / Child intent
    if any(k in query_text for k in ["primary", "child", "kid", "ncee", "common entrance", "basic 1", "basic 2", "basic 3", "basic 4", "basic 5", "basic 6", "phonics", "reading"]):
        res = PRESET_INTENTS["primary_reading"].copy()
        res["source"] = "ai_nlp"
        return res

    # 100L / University intent
    if any(k in query_text for k in ["university", "100l", "100 level", "freshman", "campus", "cgpa", "first class", "gst", "undergraduate"]):
        res = PRESET_INTENTS["university_5_0"].copy()
        res["source"] = "ai_nlp"
        return res

    # Teacher / Lesson scheme intent
    if any(k in query_text for k in ["teacher", "lesson plan", "scheme of work", "tutor", "marking scheme", "curriculum", "rubric"]):
        res = PRESET_INTENTS["teacher_schemes"].copy()
        res["source"] = "ai_nlp"
        return res

    # School owner / CBT intent
    if any(k in query_text for k in ["school", "cbt center", "scratch card", "voucher", "offline cbt", "proprietor", "principal"]):
        res = PRESET_INTENTS["school_cbt"].copy()
        res["source"] = "ai_nlp"
        return res

    # WAEC / SSS intent
    if any(k in query_text for k in ["waec", "neco", "ss3", "ss2", "ss1", "senior secondary", "theory", "science track"]):
        res = PRESET_INTENTS["waec_sciences"].copy()
        res["source"] = "ai_nlp"
        return res

    # Default to UTME / JAMB Candidate (highest volume Nigerian use-case)
    res = PRESET_INTENTS["jamb_300"].copy()
    res["source"] = "default_recommended"
    return res


@router.get("/mastery-trajectory/{user_key}")
async def get_mastery_trajectory(user_key: str) -> Dict[str, Any]:
    """
    Returns an individualized cognitive trajectory ensuring each student
    is guided uniquely toward Grade A distinction based on their learning modality.
    """
    profile = get_or_create_personalization_profile(user_key)
    
    # Compute tailored pedagogical interventions based on their modality
    modality = profile.get("learning_modality", "socratic_dialectic")
    interventions = {
        "socratic_dialectic": {
            "name": "Dialectic Protégé Learning",
            "tagline": "You learn best by actively explaining concepts to AI student Temi.",
            "primary_action": "Open Protégé Lab",
            "action_url": "/teach-ai",
            "icon": "💬"
        },
        "visual_spatial": {
            "name": "Visual Concept Modeling",
            "tagline": "You master abstract relationships faster through dynamic interactive graphs.",
            "primary_action": "Open Synapse Sandbox",
            "action_url": "/playground",
            "icon": "🎨"
        },
        "step_by_step_deductive": {
            "name": "Deductive Proof & Step-Marking",
            "tagline": "You excel by breaking proofs into Method (M) and Accuracy (A) derivations.",
            "primary_action": "Open Theory Grader",
            "action_url": "/theory",
            "icon": "📐"
        },
        "auditory_phonics": {
            "name": "Neural Voice & Audio Resonance",
            "tagline": "You retain 40% more when listening to authentic Nigerian voice narration.",
            "primary_action": "Open Oral Studio",
            "action_url": "/oral-english",
            "icon": "🎙️"
        }
    }.get(modality, {
        "name": "Adaptive Multi-Modal Learning",
        "tagline": "Customized blend of interactive drills and visual diagrams.",
        "primary_action": "Continue Learning",
        "action_url": "/student",
        "icon": "⚡"
    })
    
    # Calculate score delta
    current = profile.get("current_score", 61.2)
    target = profile.get("target_score", 92.5)
    points_to_grade_a = max(0.0, round(target - current, 1))

    return {
        "profile": profile,
        "points_to_grade_a": points_to_grade_a,
        "recommended_intervention": interventions,
        "cognitive_gaps_count": len(profile.get("cognitive_gaps", [])),
        "status": "success"
    }


@router.post("/update-modality")
async def update_student_modality(req: ModalityUpdateRequest) -> Dict[str, Any]:
    """Updates the student's preferred learning modality, pace velocity, or grade goal."""
    updates = {}
    if req.learning_modality:
        updates["learning_modality"] = req.learning_modality
    if req.learning_velocity:
        updates["learning_velocity"] = req.learning_velocity
    if req.target_grade_band:
        updates["target_grade_band"] = req.target_grade_band
        
    updated = update_personalization_profile(req.user_key, updates)
    return {
        "status": "success",
        "message": f"Updated learning modality to {req.learning_modality or updated.get('learning_modality')}",
        "profile": updated
    }


@router.post("/calibrate-diagnostic")
async def calibrate_diagnostic(req: DiagnosticCalibrationRequest) -> Dict[str, Any]:
    """Records a new diagnostic score and recalibrates the student's cognitive gaps."""
    profile = get_or_create_personalization_profile(req.user_key)
    
    old_current = profile.get("current_score", 55.0)
    new_current = round((old_current * 0.4) + (req.diagnostic_score * 0.6), 1)
    
    # Determine grade band
    band = "A" if new_current >= 80 else "B" if new_current >= 65 else "C" if new_current >= 50 else "D"
    
    gaps = profile.get("cognitive_gaps", [])
    if req.identified_gap_topic:
        found = False
        for g in gaps:
            if g.get("topic") == req.identified_gap_topic:
                g["accuracy"] = int(req.diagnostic_score)
                found = True
                break
        if not found:
            gaps.append({
                "subject": req.subject,
                "topic": req.identified_gap_topic,
                "prerequisite": req.prerequisite_gap or "Foundational Principles",
                "severity": "HIGH" if req.diagnostic_score < 50 else "MEDIUM",
                "accuracy": int(req.diagnostic_score),
                "remedy": f"Targeted micro-calibration drill on {req.identified_gap_topic}"
            })
            
    updated = update_personalization_profile(req.user_key, {
        "current_score": new_current,
        "current_grade_band": band,
        "cognitive_gaps": gaps
    })
    
    return {
        "status": "success",
        "message": f"Recalibrated trajectory. Current score: {new_current}% (Grade {band})",
        "profile": updated
    }


class ResolveGapRequest(BaseModel):
    user_key: str
    topic: str
    score_achieved: float = 100.0

class PhaseUpdateRequest(BaseModel):
    user_key: str
    active_phase: int

@router.post("/resolve-gap")
async def resolve_gap_endpoint(req: ResolveGapRequest) -> Dict[str, Any]:
    """Remediates a cognitive gap in the database, boosts student accuracy, and awards XP/Hearts."""
    return resolve_cognitive_gap(
        user_key=req.user_key,
        topic=req.topic,
        score_achieved=req.score_achieved
    )

@router.post("/update-phase")
async def update_phase_endpoint(req: PhaseUpdateRequest) -> Dict[str, Any]:
    """Updates the active milestone phase for the student in SQLite."""
    if req.active_phase not in [1, 2, 3, 4]:
        raise HTTPException(status_code=400, detail="Phase must be between 1 and 4")
    updated = update_personalization_profile(req.user_key, {"active_phase": req.active_phase})
    return {
        "status": "success",
        "message": f"Active milestone phase shifted to Phase 0{req.active_phase}",
        "profile": updated
    }

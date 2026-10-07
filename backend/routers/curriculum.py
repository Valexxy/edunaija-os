from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from backend.database.sqlite_store import get_tutorials

router = APIRouter(prefix="/curriculum", tags=["Curriculum Progression & Multi-Tier Tutorials"])

CLASS_TIERS = [
    {
        "tier_id": "PRIMARY",
        "label": "Primary 4–6 (Discovery)",
        "target_audience": "Ages 7–10 • National Common Entrance",
        "tutor_persona": "Auntie Bola (Warm, Patient & Story-Based)",
        "core_subjects": ["Mathematics", "Basic Science", "English Grammar", "Verbal Reasoning"],
        "recommended_hub": "/playground",
        "description": "Visual cartoon manipulatives, bedtime science stories, and foundational math without timers."
    },
    {
        "tier_id": "JSS",
        "label": "JSS 1–3 (Junior Secondary)",
        "target_audience": "Ages 10–13 • Basic Education Certificate (BECE)",
        "tutor_persona": "Brother Tobi (Peer Explainer)",
        "core_subjects": ["Basic Science", "Basic Technology", "Mathematics", "English", "Civic Education"],
        "recommended_hub": "/playground",
        "description": "Interactive physics labs, chemical particle models, and Chidi's error detective games."
    },
    {
        "tier_id": "SSS",
        "label": "SSS 1–2 (Senior Foundation)",
        "target_audience": "Ages 14–17 • Senior Secondary School (SSCE)",
        "tutor_persona": "Uncle Emeka (Pedagogical Coach)",
        "core_subjects": ["Physics", "Chemistry", "Biology", "Mathematics", "English"],
        "recommended_hub": "/admissions",
        "description": "Interactive Faded Formula Workbench, Socratic reasoning, and core STEM mastery."
    },
    {
        "tier_id": "UTME",
        "label": "SSS 3 & UTME (High-Stakes JAMB)",
        "target_audience": "Ages 16–19 • JAMB UTME & WAEC Candidates",
        "tutor_persona": "The Feynman Chameleon & Socratic Broda",
        "core_subjects": ["Use of English", "Mathematics", "Physics", "Chemistry", "Biology", "Economics"],
        "recommended_hub": "/quiz",
        "description": "Broken-mouse 8-key keyboard training, 45-min CBT pacing, and university composite quota calculators."
    },
    {
        "tier_id": "FRESHMAN",
        "label": "100L Freshman (Undergraduate)",
        "target_audience": "Ages 18–22 • University 100-Level Transition",
        "tutor_persona": "Prof. Balogun (Academic Mentor)",
        "core_subjects": ["MTH 101 (Calculus)", "PHY 101 (Mechanics)", "CHM 101 (Inorganic)", "GST 101 (Communication)"],
        "recommended_hub": "/curriculum",
        "description": "University vector proofs, limits, thermodynamics, and academic dissertation reasoning."
    }
]

@router.get("/tiers")
def get_class_tiers():
    """Returns the 5 developmental class tiers of the educational powerhouse."""
    return {
        "status": "success",
        "tiers": CLASS_TIERS
    }

@router.get("/tutorials")
def list_curriculum_tutorials(
    tier: Optional[str] = Query(None, description="Filter by class tier: PRIMARY, JSS, SSS, UTME, FRESHMAN"),
    subject: Optional[str] = Query(None, description="Filter by subject")
):
    """Retrieves structured curriculum lessons with Nigerian street analogies and common misconception traps."""
    tutorials = get_tutorials(class_tier=tier, subject=subject)
    return {
        "status": "success",
        "count": len(tutorials),
        "class_tier": tier or "ALL TIERS",
        "tutorials": tutorials
    }

@router.get("/adaptive-feed")
def get_adaptive_class_feed(tier: str = Query("UTME", description="Student's current class tier")):
    """Returns class-tailored micro-lessons and learning recommendations for the dashboard."""
    tuts = get_tutorials(class_tier=tier)
    matched_tier = next((t for t in CLASS_TIERS if t["tier_id"] == tier.upper()), CLASS_TIERS[3])

    return {
        "status": "success",
        "tier_info": matched_tier,
        "recommended_lessons": tuts[:3],
        "active_badge": f"{matched_tier['label']} Scholar",
        "daily_focus": f"Master 1 concept in {matched_tier['core_subjects'][0]} today to maintain your learning streak!"
    }

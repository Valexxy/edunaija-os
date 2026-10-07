"""
JAMB University Admission Composite Aggregate Calculator
EduNaija OS — backend/routers/admissions.py

All university data, formulas, and quota rules are hardcoded.
No external DB or service imports — only FastAPI / Pydantic.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

router = APIRouter(tags=["Admissions"])

# ---------------------------------------------------------------------------
# Static data
# ---------------------------------------------------------------------------

NIGERIAN_STATES: List[str] = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
    "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
    "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa",
    "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
    "Lagos", "Nassarawa", "Niger", "Ogun", "Ondo", "Osun",
    "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
]

# Educationally Less Developed States (ELDS) — Statutory 23 States
ELDS_STATES: List[str] = [
    "Adamawa", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Ebonyi",
    "Gombe", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
    "Kwara", "Nasarawa", "Nassarawa", "Niger", "Plateau", "Rivers", "Sokoto", "Taraba",
    "Yobe", "Zamfara", "FCT",
]

# Grade -> points lookup
GRADE_POINTS: Dict[str, int] = {
    "A1": 6, "B2": 5, "B3": 4, "C4": 3, "C5": 2, "C6": 1,
    "D7": 0, "E8": 0, "F9": 0,
}

# ---------------------------------------------------------------------------
# University data
# ---------------------------------------------------------------------------

UNIVERSITY_DATA: Dict[str, Dict[str, Any]] = {
    "UNILAG": {
        "name": "University of Lagos",
        "host_state": "Lagos",
        "catchment_states": ["Lagos", "Ogun", "Osun", "Oyo", "Ondo", "Ekiti"],
        "quota": {"merit_pct": 45, "catchment_pct": 35, "elds_pct": 20},
        "merit_cutoff": 70.0,
        "catchment_cutoff": 65.0,
        "elds_cutoff": 55.0,
        "weights": {"jamb": 0.50, "olevel": 0.30, "post_utme": 0.20},
        "formula_label": "50% JAMB + 30% O Level + 20% Post-UTME",
        "courses": {
            "Medicine and Surgery": {
                "cutoffs": [{"year": 2024, "cutoff": 270}, {"year": 2023, "cutoff": 265}],
                "alternatives": ["Pharmacy", "Biochemistry"],
            },
            "Law": {
                "cutoffs": [{"year": 2024, "cutoff": 240}, {"year": 2023, "cutoff": 235}],
                "alternatives": ["Political Science", "Sociology"],
            },
            "Engineering": {
                "cutoffs": [{"year": 2024, "cutoff": 220}, {"year": 2023, "cutoff": 215}],
                "alternatives": ["Physics", "Mathematics"],
            },
            "Computer Science": {
                "cutoffs": [{"year": 2024, "cutoff": 220}, {"year": 2023, "cutoff": 210}],
                "alternatives": ["Information Technology", "Mathematics"],
            },
            "Pharmacy": {
                "cutoffs": [{"year": 2024, "cutoff": 250}, {"year": 2023, "cutoff": 248}],
                "alternatives": ["Biochemistry", "Chemistry"],
            },
            "Biochemistry": {
                "cutoffs": [{"year": 2024, "cutoff": 200}, {"year": 2023, "cutoff": 195}],
                "alternatives": ["Chemistry", "Biology"],
            },
            "Accounting": {
                "cutoffs": [{"year": 2024, "cutoff": 200}, {"year": 2023, "cutoff": 195}],
                "alternatives": ["Finance", "Economics"],
            },
            "Economics": {
                "cutoffs": [{"year": 2024, "cutoff": 200}, {"year": 2023, "cutoff": 195}],
                "alternatives": ["Accounting", "Statistics"],
            },
        },
    },
    "UI": {
        "name": "University of Ibadan",
        "host_state": "Oyo",
        "catchment_states": ["Oyo", "Ogun", "Ondo", "Ekiti", "Osun", "Lagos"],
        "quota": {"merit_pct": 45, "catchment_pct": 35, "elds_pct": 20},
        "merit_cutoff": 68.0,
        "catchment_cutoff": 62.0,
        "elds_cutoff": 52.0,
        "weights": {"jamb": 0.40, "olevel": 0.20, "post_utme": 0.40},
        "formula_label": "40% JAMB + 40% Post-UTME + 20% O Level",
        "courses": {
            "Medicine and Surgery": {
                "cutoffs": [{"year": 2024, "cutoff": 260}, {"year": 2023, "cutoff": 255}],
                "alternatives": ["Pharmacy", "Dentistry"],
            },
            "Law": {
                "cutoffs": [{"year": 2024, "cutoff": 235}, {"year": 2023, "cutoff": 230}],
                "alternatives": ["Political Science", "Public Administration"],
            },
            "Engineering": {
                "cutoffs": [{"year": 2024, "cutoff": 210}, {"year": 2023, "cutoff": 205}],
                "alternatives": ["Physics", "Mathematics"],
            },
            "Computer Science": {
                "cutoffs": [{"year": 2024, "cutoff": 215}, {"year": 2023, "cutoff": 210}],
                "alternatives": ["Mathematics", "Statistics"],
            },
            "Pharmacy": {
                "cutoffs": [{"year": 2024, "cutoff": 245}, {"year": 2023, "cutoff": 240}],
                "alternatives": ["Biochemistry", "Pharmacology"],
            },
        },
    },
    "OAU": {
        "name": "Obafemi Awolowo University",
        "host_state": "Osun",
        "catchment_states": ["Osun", "Oyo", "Ondo", "Ekiti", "Kwara"],
        "quota": {"merit_pct": 45, "catchment_pct": 35, "elds_pct": 20},
        "merit_cutoff": 67.0,
        "catchment_cutoff": 62.0,
        "elds_cutoff": 52.0,
        "weights": {"jamb": 0.50, "olevel": 0.20, "post_utme": 0.30},
        "formula_label": "50% JAMB + 30% Post-UTME + 20% O Level",
        "courses": {
            "Medicine and Surgery": {
                "cutoffs": [{"year": 2024, "cutoff": 258}, {"year": 2023, "cutoff": 252}],
                "alternatives": ["Pharmacy", "Medical Laboratory Science"],
            },
            "Law": {
                "cutoffs": [{"year": 2024, "cutoff": 235}, {"year": 2023, "cutoff": 228}],
                "alternatives": ["Political Science", "History"],
            },
            "Engineering": {
                "cutoffs": [{"year": 2024, "cutoff": 215}, {"year": 2023, "cutoff": 208}],
                "alternatives": ["Physics", "Mathematics"],
            },
            "Computer Science": {
                "cutoffs": [{"year": 2024, "cutoff": 210}, {"year": 2023, "cutoff": 205}],
                "alternatives": ["Mathematics", "Statistics"],
            },
            "Pharmacy": {
                "cutoffs": [{"year": 2024, "cutoff": 248}, {"year": 2023, "cutoff": 242}],
                "alternatives": ["Biochemistry", "Chemistry"],
            },
        },
    },
    "ABU": {
        "name": "Ahmadu Bello University",
        "host_state": "Kaduna",
        "catchment_states": [
            "Kaduna", "Kano", "Katsina", "Sokoto", "Zamfara",
            "Niger", "Kebbi", "Jigawa",
        ],
        "quota": {"merit_pct": 45, "catchment_pct": 35, "elds_pct": 20},
        "merit_cutoff": 65.0,
        "catchment_cutoff": 60.0,
        "elds_cutoff": 50.0,
        "weights": {"jamb": 0.60, "olevel": 0.20, "post_utme": 0.20},
        "formula_label": "60% JAMB + 20% O Level + 20% Post-UTME",
        "courses": {
            "Medicine and Surgery": {
                "cutoffs": [{"year": 2024, "cutoff": 250}, {"year": 2023, "cutoff": 245}],
                "alternatives": ["Pharmacy", "Veterinary Medicine"],
            },
            "Law": {
                "cutoffs": [{"year": 2024, "cutoff": 230}, {"year": 2023, "cutoff": 225}],
                "alternatives": ["Political Science", "Islamic Studies"],
            },
            "Engineering": {
                "cutoffs": [{"year": 2024, "cutoff": 200}, {"year": 2023, "cutoff": 195}],
                "alternatives": ["Physics", "Mathematics"],
            },
            "Computer Science": {
                "cutoffs": [{"year": 2024, "cutoff": 200}, {"year": 2023, "cutoff": 195}],
                "alternatives": ["Mathematics", "Statistics"],
            },
            "Agriculture": {
                "cutoffs": [{"year": 2024, "cutoff": 180}, {"year": 2023, "cutoff": 175}],
                "alternatives": ["Animal Science", "Forestry"],
            },
        },
    },
    "UNN": {
        "name": "University of Nigeria, Nsukka",
        "host_state": "Enugu",
        "catchment_states": ["Enugu", "Anambra", "Imo", "Abia", "Ebonyi"],
        "quota": {"merit_pct": 45, "catchment_pct": 35, "elds_pct": 20},
        "merit_cutoff": 66.0,
        "catchment_cutoff": 61.0,
        "elds_cutoff": 51.0,
        "weights": {"jamb": 0.50, "olevel": 0.30, "post_utme": 0.20},
        "formula_label": "50% JAMB + 30% O Level + 20% Post-UTME",
        "courses": {
            "Medicine and Surgery": {
                "cutoffs": [{"year": 2024, "cutoff": 255}, {"year": 2023, "cutoff": 250}],
                "alternatives": ["Pharmacy", "Medical Laboratory Science"],
            },
            "Law": {
                "cutoffs": [{"year": 2024, "cutoff": 232}, {"year": 2023, "cutoff": 228}],
                "alternatives": ["Political Science", "Criminology"],
            },
            "Engineering": {
                "cutoffs": [{"year": 2024, "cutoff": 208}, {"year": 2023, "cutoff": 202}],
                "alternatives": ["Physics", "Mathematics"],
            },
            "Computer Science": {
                "cutoffs": [{"year": 2024, "cutoff": 210}, {"year": 2023, "cutoff": 205}],
                "alternatives": ["Mathematics", "Statistics"],
            },
            "Mass Communication": {
                "cutoffs": [{"year": 2024, "cutoff": 195}, {"year": 2023, "cutoff": 190}],
                "alternatives": ["English", "Linguistics"],
            },
        },
    },
    "UNIBEN": {
        "name": "University of Benin",
        "host_state": "Edo",
        "catchment_states": ["Edo", "Delta"],
        "quota": {"merit_pct": 45, "catchment_pct": 35, "elds_pct": 20},
        "merit_cutoff": 65.0,
        "catchment_cutoff": 60.0,
        "elds_cutoff": 50.0,
        "weights": {"jamb": 0.50, "olevel": 0.30, "post_utme": 0.20},
        "formula_label": "50% JAMB + 30% O Level + 20% Post-UTME",
        "courses": {
            "Medicine and Surgery": {
                "cutoffs": [{"year": 2024, "cutoff": 252}, {"year": 2023, "cutoff": 248}],
                "alternatives": ["Pharmacy", "Dentistry"],
            },
            "Law": {
                "cutoffs": [{"year": 2024, "cutoff": 228}, {"year": 2023, "cutoff": 222}],
                "alternatives": ["Political Science", "Sociology"],
            },
            "Engineering": {
                "cutoffs": [{"year": 2024, "cutoff": 205}, {"year": 2023, "cutoff": 200}],
                "alternatives": ["Physics", "Mathematics"],
            },
            "Computer Science": {
                "cutoffs": [{"year": 2024, "cutoff": 205}, {"year": 2023, "cutoff": 200}],
                "alternatives": ["Mathematics", "Statistics"],
            },
            "Pharmacy": {
                "cutoffs": [{"year": 2024, "cutoff": 240}, {"year": 2023, "cutoff": 235}],
                "alternatives": ["Biochemistry", "Chemistry"],
            },
        },
    },
    "UNIPORT": {
        "name": "University of Port Harcourt",
        "host_state": "Rivers",
        "catchment_states": ["Rivers", "Bayelsa", "Cross River", "Akwa Ibom"],
        "quota": {"merit_pct": 45, "catchment_pct": 35, "elds_pct": 20},
        "merit_cutoff": 65.0,
        "catchment_cutoff": 60.0,
        "elds_cutoff": 50.0,
        "weights": {"jamb": 0.50, "olevel": 0.30, "post_utme": 0.20},
        "formula_label": "50% JAMB + 30% O Level + 20% Post-UTME",
        "courses": {
            "Medicine and Surgery": {
                "cutoffs": [{"year": 2024, "cutoff": 248}, {"year": 2023, "cutoff": 242}],
                "alternatives": ["Pharmacy", "Medical Laboratory Science"],
            },
            "Law": {
                "cutoffs": [{"year": 2024, "cutoff": 225}, {"year": 2023, "cutoff": 218}],
                "alternatives": ["Political Science", "Sociology"],
            },
            "Engineering": {
                "cutoffs": [{"year": 2024, "cutoff": 200}, {"year": 2023, "cutoff": 195}],
                "alternatives": ["Physics", "Mathematics"],
            },
            "Computer Science": {
                "cutoffs": [{"year": 2024, "cutoff": 200}, {"year": 2023, "cutoff": 195}],
                "alternatives": ["Mathematics", "Statistics"],
            },
            "Petroleum Engineering": {
                "cutoffs": [{"year": 2024, "cutoff": 215}, {"year": 2023, "cutoff": 210}],
                "alternatives": ["Chemical Engineering", "Geology"],
            },
        },
    },
}

# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------


class OLevelGrades(BaseModel):
    english: Optional[str] = None
    mathematics: Optional[str] = None
    biology: Optional[str] = None
    chemistry: Optional[str] = None
    physics: Optional[str] = None
    economics: Optional[str] = None
    government: Optional[str] = None
    literature: Optional[str] = None
    geography: Optional[str] = None
    agricultural_science: Optional[str] = None
    further_mathematics: Optional[str] = None
    technical_drawing: Optional[str] = None
    civic_education: Optional[str] = None
    commerce: Optional[str] = None
    account: Optional[str] = None

    @field_validator("*", mode="before")
    @classmethod
    def normalise_grade(cls, v: Any) -> Any:
        if isinstance(v, str):
            return v.upper().strip()
        return v


class CalculateRequest(BaseModel):
    jamb_score: int = Field(..., ge=0, le=400)
    university: str
    course: str
    state_of_origin: str
    o_level_grades: OLevelGrades
    post_utme_score: Optional[float] = Field(None, ge=0, le=100)


# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------


def _grade_points(grade: Optional[str]) -> int:
    if grade is None:
        return 0
    return GRADE_POINTS.get(grade.upper().strip(), 0)


def _compute_olevel_component(grades: OLevelGrades, olevel_weight: float) -> float:
    raw_grades = {
        k: _grade_points(v)
        for k, v in grades.model_dump().items()
        if v is not None
    }
    if not raw_grades:
        return 0.0
    sorted_pts = sorted(raw_grades.values(), reverse=True)
    best_five = sorted_pts[:5]
    avg = sum(best_five) / 5
    # Normalise avg over max(6) to 0-100, then apply weight
    normalised = (avg / 6) * 100
    return round(normalised * olevel_weight, 4)


def _compute_jamb_component(score: int, jamb_weight: float) -> float:
    return round((score / 400) * 100 * jamb_weight, 4)


def _compute_post_utme_component(post_utme_score: float, post_utme_weight: float) -> float:
    return round(post_utme_score * post_utme_weight, 4)


def _determine_quota(state: str, uni_data: Dict[str, Any], composite_score: float) -> Dict[str, Any]:
    host_state: str = uni_data["host_state"]
    catchment: List[str] = uni_data["catchment_states"]
    quota_pcts: Dict[str, int] = uni_data["quota"]
    merit_cutoff: float = uni_data["merit_cutoff"]
    catchment_cutoff: float = uni_data["catchment_cutoff"]
    elds_cutoff: float = uni_data["elds_cutoff"]

    is_host = state == host_state
    is_catchment = state in catchment
    is_elds = state in ELDS_STATES

    if is_host:
        quota_label = f"Merit ({state} State - Host State)"
        effective_cutoff = min(merit_cutoff, catchment_cutoff)
    elif is_catchment:
        quota_label = f"Catchment ({state})"
        effective_cutoff = catchment_cutoff
    elif is_elds:
        quota_label = f"ELDS ({state})"
        effective_cutoff = elds_cutoff
    else:
        quota_label = "Merit"
        effective_cutoff = merit_cutoff

    margin = composite_score - effective_cutoff
    if margin >= 10:
        probability = "Very High (>90%)"
    elif margin >= 5:
        probability = "High (78%)"
    elif margin >= 0:
        probability = "Moderate (55%)"
    elif margin >= -5:
        probability = "Low (30%)"
    else:
        probability = "Very Low (<15%)"

    return {
        "merit_cutoff": merit_cutoff,
        "merit_slots_percent": quota_pcts["merit_pct"],
        "catchment_cutoff": catchment_cutoff,
        "catchment_slots_percent": quota_pcts["catchment_pct"],
        "elds_cutoff": elds_cutoff,
        "elds_slots_percent": quota_pcts["elds_pct"],
        "candidate_quota_type": quota_label,
        "admission_probability": probability,
    }


def _generate_recommendation(composite_score: float, effective_cutoff: float, quota_label: str) -> str:
    margin = composite_score - effective_cutoff
    if margin >= 10:
        return (
            f"Your composite score of {composite_score:.1f} is well above the cutoff "
            f"({effective_cutoff}) under {quota_label} quota. Very high probability of admission."
        )
    elif margin >= 0:
        return (
            f"Your composite score is above the {quota_label} cutoff. "
            "High probability of admission."
        )
    elif margin >= -5:
        return (
            f"Your score is slightly below the {quota_label} cutoff ({effective_cutoff}). "
            "Consider Post-UTME preparation or exploring alternative courses."
        )
    else:
        return (
            f"Your composite score ({composite_score:.1f}) is below the {quota_label} "
            f"cutoff ({effective_cutoff}). Consider alternative universities or courses."
        )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/admissions/universities", summary="List supported universities")
async def list_universities() -> List[Dict[str, Any]]:
    return [
        {
            "code": code,
            "name": data["name"],
            "host_state": data["host_state"],
            "catchment_states": data["catchment_states"],
            "formula": data["formula_label"],
            "courses_offered": list(data["courses"].keys()),
        }
        for code, data in UNIVERSITY_DATA.items()
    ]


@router.get("/admissions/states", summary="List all 36 Nigerian states + FCT")
async def list_states() -> Dict[str, Any]:
    return {
        "count": len(NIGERIAN_STATES),
        "states": NIGERIAN_STATES,
        "elds_states": ELDS_STATES,
    }


@router.get("/admissions/courses/{university}", summary="Courses with historical cutoffs")
async def list_courses(university: str) -> Dict[str, Any]:
    uni_key = university.upper().strip()
    if uni_key not in UNIVERSITY_DATA:
        raise HTTPException(
            status_code=404,
            detail=f"University '{university}' not found. Supported: {list(UNIVERSITY_DATA)}",
        )
    uni = UNIVERSITY_DATA[uni_key]
    courses_out = [
        {
            "course": course,
            "cutoff_history": info["cutoffs"],
            "alternative_courses": info.get("alternatives", []),
        }
        for course, info in uni["courses"].items()
    ]
    return {
        "university": uni_key,
        "name": uni["name"],
        "formula": uni["formula_label"],
        "courses": courses_out,
    }


@router.post("/admissions/calculate", summary="Calculate JAMB composite aggregate score")
async def calculate_aggregate(payload: CalculateRequest) -> Dict[str, Any]:
    uni_key = payload.university.upper().strip()
    if uni_key not in UNIVERSITY_DATA:
        raise HTTPException(
            status_code=404,
            detail=f"University '{payload.university}' not supported. "
                   f"Supported: {list(UNIVERSITY_DATA)}",
        )

    uni = UNIVERSITY_DATA[uni_key]
    weights = uni["weights"]

    post_utme_score = payload.post_utme_score if payload.post_utme_score is not None else 75.0

    jamb_component = _compute_jamb_component(payload.jamb_score, weights["jamb"])
    olevel_component = _compute_olevel_component(payload.o_level_grades, weights["olevel"])
    post_utme_component = _compute_post_utme_component(post_utme_score, weights["post_utme"])

    composite_score = round(jamb_component + olevel_component + post_utme_component, 1)

    state = payload.state_of_origin.strip()
    quota_analysis = _determine_quota(state, uni, composite_score)
    quota_label = quota_analysis["candidate_quota_type"]

    if "Host" in quota_label or state == uni["host_state"]:
        effective_cutoff = min(uni["merit_cutoff"], uni["catchment_cutoff"])
    elif "Catchment" in quota_label:
        effective_cutoff = uni["catchment_cutoff"]
    elif "ELDS" in quota_label:
        effective_cutoff = uni["elds_cutoff"]
    else:
        effective_cutoff = uni["merit_cutoff"]

    course_key = payload.course.strip()
    course_data = uni["courses"].get(course_key, {})
    cutoff_history = course_data.get("cutoffs", [])
    alternatives = course_data.get("alternatives", [])

    recommendation = _generate_recommendation(composite_score, effective_cutoff, quota_label)

    is_elds = state in ELDS_STATES
    is_catchment = state in uni.get("catchment_states", []) or state == uni.get("host_state")
    elds_advantage = round(uni.get("merit_cutoff", 70.0) - uni.get("elds_cutoff", 55.0), 1)

    prob_num = 95 if composite_score >= effective_cutoff + 5 else (
        82 if composite_score >= effective_cutoff else (
            55 if composite_score >= effective_cutoff - 3 else 25
        )
    )

    verdict = (
        f"LIKELY ADMITTED via {quota_label} Quota ✅" if composite_score >= effective_cutoff
        else f"Competitive — Post-UTME Focus Required ⚠️"
    )

    return {
        "status": "success",
        "university": uni_key,
        "course": course_key,
        "composite_score": composite_score,
        "quota_band": quota_label,
        "applicable_cutoff": effective_cutoff,
        "national_merit_cutoff": uni.get("merit_cutoff", 70.0),
        "catchment_cutoff": uni.get("catchment_cutoff", 65.0),
        "elds_cutoff": uni.get("elds_cutoff", 55.0),
        "admission_verdict": verdict,
        "admission_probability_pct": prob_num,
        "is_elds_state": is_elds,
        "is_catchment_state": is_catchment,
        "elds_advantage_points": elds_advantage if is_elds else 0.0,
        "formula_breakdown": {
            "jamb_component": round(jamb_component, 1),
            "o_level_component": round(olevel_component, 1),
            "post_utme_estimate": round(post_utme_component, 1),
            "formula_used": uni["formula_label"],
        },
        "quota_analysis": quota_analysis,
        "course_cutoff_history": cutoff_history,
        "recommendation": recommendation,
        "alternative_courses": alternatives,
    }

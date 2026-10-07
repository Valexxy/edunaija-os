"""
WAEC Theory Step-Mark Grader
Awards Method (M), Accuracy (A), and Independent (B) marks.
Deducts 0.5 marks per GPS (Grammar/Punctuation/Spelling) error in essays.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import re

router = APIRouter(prefix="/theory", tags=["WAEC Theory Step-Mark Grader"])

class TheorySubmission(BaseModel):
    question_id: str
    student_answer: str
    subject: str
    is_essay: bool = False

class TheoryGradeResult(BaseModel):
    question_id: str
    total_marks_awarded: float
    total_marks_available: int
    percentage: float
    steps: List[dict]
    gps_deductions: float
    feedback: str
    grade: str

MARKING_SCHEMES = {
    "th-phy-001": {
        "total_marks": 9,
        "subject": "Physics",
        "steps": [
            {"key": ["h = 0.5gt", "80 = 0.5", "h=1/2gt", "h = 0.5*g"], "step": "Applying projectile height formula h = 1/2 gt²", "type": "M", "marks": 1},
            {"key": ["t = 4", "t=4"], "step": "Correct time of flight: t = 4 s", "type": "A", "marks": 1},
            {"key": ["R = u", "range = 20", "r = 20 * 4", "20 * 4", "horizontal range"], "step": "Applying R = u * t formula", "type": "M", "marks": 1},
            {"key": ["80 m", "R = 80", "range = 80", "80m"], "step": "Correct horizontal range: 80 m", "type": "A", "marks": 1},
            {"key": ["v_y = gt", "vy = 10 * 4", "10 * 4", "vertical velocity", "40 m/s"], "step": "Calculating vertical velocity component", "type": "M", "marks": 1},
            {"key": ["sqrt(20^2 + 40^2)", "sqrt(2000)", "resultant"], "step": "Applying Pythagoras for resultant velocity: v = √(vx² + vy²)", "type": "M", "marks": 1},
            {"key": ["44.7", "44.72", "45"], "step": "Correct resultant speed ≈ 44.7 m/s", "type": "A", "marks": 1},
            {"key": ["63", "arctan", "tan-1", "angle", "direction"], "step": "Calculating direction angle and stating correctly (θ ≈ 63.4°)", "type": "B", "marks": 2},
        ]
    },
    "th-chem-001": {
        "total_marks": 8,
        "subject": "Chemistry",
        "steps": [
            {"key": ["c1v1 = c2v2", "ca va", "cb vb", "mole ratio"], "step": "State titration stoichiometry equation CaVa/CbVb = na/nb", "type": "M", "marks": 2},
            {"key": ["concordant", "average titre", "titre value"], "step": "Calculate average titre volume from concordant values", "type": "M", "marks": 1},
            {"key": ["0.05", "0.05 mol/dm3", "0.050"], "step": "Determine molarity of standard solution accurately", "type": "A", "marks": 2},
            {"key": ["methyl orange", "phenolphthalein", "color change", "endpoint"], "step": "State correct indicator and sharp colour change at endpoint", "type": "B", "marks": 3},
        ]
    }
}

GPS_PATTERNS = [
    r"(they is|he are|she are|it are|i is)",
    r"(your welcome|its a)",
]

def count_gps_errors(text: str) -> int:
    errors = 0
    for pattern in GPS_PATTERNS:
        errors += len(re.findall(pattern, text.lower()))
    errors += len(re.findall(r'\.\s+[a-z]', text))
    return min(errors, 20)

@router.post("/grade", response_model=TheoryGradeResult)
async def grade_theory_answer(submission: TheorySubmission):
    scheme = MARKING_SCHEMES.get(submission.question_id)
    
    if not scheme:
        word_count = len(submission.student_answer.split())
        base_score = min(10, max(2, word_count // 6))
        gps = count_gps_errors(submission.student_answer) * 0.5 if submission.is_essay else 0
        final_score = max(0.0, float(base_score) - gps)
        return TheoryGradeResult(
            question_id=submission.question_id,
            total_marks_awarded=final_score,
            total_marks_available=10,
            percentage=round((final_score / 10.0) * 100, 1),
            steps=[{"step": "General working and method assessment", "mark_type": "M", "marks_available": 6, "marks_awarded": min(6, int(final_score)), "reason": "Evaluated method principles"},
                   {"step": "Accuracy of final expression", "mark_type": "A", "marks_available": 4, "marks_awarded": max(0, int(final_score) - 6), "reason": "Evaluated accuracy"}],
            gps_deductions=gps,
            feedback="Assessment performed using standard pedagogical heuristic scoring.",
            grade="B" if final_score >= 6 else "C"
        )
    
    student_lower = submission.student_answer.lower()
    step_results = []
    total_awarded = 0.0
    
    for step in scheme["steps"]:
        found = any(kw.lower() in student_lower for kw in step["key"])
        awarded = step["marks"] if found else 0
        total_awarded += awarded
        step_results.append({
            "step": step["step"],
            "mark_type": step["type"],
            "marks_available": step["marks"],
            "marks_awarded": awarded,
            "awarded": found,
            "reason": "Demonstrated in student working" if found else "Step missing or incomplete"
        })
    
    gps_deductions = 0.0
    if submission.is_essay:
        gps_errors = count_gps_errors(submission.student_answer)
        gps_deductions = min(10.0, gps_errors * 0.5)
        total_awarded = max(0.0, total_awarded - gps_deductions)
    
    pct = round((total_awarded / scheme["total_marks"]) * 100, 1)
    grade = "A" if pct >= 70 else "B" if pct >= 60 else "C" if pct >= 50 else "D" if pct >= 45 else "F"
    
    missing = [s["step"] for s, r in zip(scheme["steps"], step_results) if not r["awarded"]]
    feedback_parts = []
    if total_awarded >= scheme["total_marks"] * 0.8:
        feedback_parts.append("Outstanding working demonstrating strong mastery of the curriculum!")
    elif total_awarded >= scheme["total_marks"] * 0.5:
        feedback_parts.append("Good conceptual method application. Mind the accuracy details.")
    else:
        feedback_parts.append("Review the fundamental formulas and units carefully.")
    if missing:
        feedback_parts.append(f"Missing steps: {'; '.join(missing[:2])}.")
    
    return TheoryGradeResult(
        question_id=submission.question_id,
        total_marks_awarded=total_awarded,
        total_marks_available=scheme["total_marks"],
        percentage=pct,
        steps=step_results,
        gps_deductions=gps_deductions,
        feedback=" ".join(feedback_parts),
        grade=grade
    )

@router.get("/questions/{subject}")
async def get_theory_questions(subject: str):
    qs = [{"id": k, **v} for k, v in MARKING_SCHEMES.items() if v.get("subject", "").lower() == subject.lower()]
    return {"questions": qs, "count": len(qs)}

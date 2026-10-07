from pydantic import BaseModel
from typing import List

class GradeResult(BaseModel):
    is_correct: bool
    correct_answer: str
    explanation: str

def grade_answer(question_id: str, user_answer: str) -> GradeResult:
    # Fetch correct answer from DB
    correct_answer = "B" # mock
    is_correct = (user_answer.strip().upper() == correct_answer)
    explanation = "Detailed explanation from LLM/DB..."
    return GradeResult(is_correct=is_correct, correct_answer=correct_answer, explanation=explanation)

def generate_mnemonics(topic: str) -> str:
    # Use LLM to generate Nigerian-contextualized memory tricks
    mnemonics = {
        "planet_order": "My Very Educated Mother Just Served Us Nine Portions (wait, Pluto is gone!)",
        "reactivity_series": "Popular Scientists Can Make A Zoo In The Low Humid Countries More Satisfactorily (K, Na, Ca, Mg, Al, Zn, Fe, Sn, Pb, H, Cu, Hg, Ag, Au)"
    }
    return mnemonics.get(topic.lower(), "Practice makes perfect! No mnemonic available yet.")

def get_related_topics(topic_id: str) -> List[str]:
    # Hardcoded or DB-driven relationship mapping
    relations = {
        "kinematics": ["dynamics", "work_energy_power"],
        "organic_chemistry": ["hydrocarbons", "functional_groups"]
    }
    return relations.get(topic_id.lower(), [])

def calculate_mastery(user_id: str, topic_id: str) -> float:
    # Query past 10 questions for this topic by this user
    # return accuracy as float 0-1
    return 0.75 # mock

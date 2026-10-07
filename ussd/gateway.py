"""
EduNaija OS USSD Gateway
*347*99# → Free exam prep for feature phones

Flow:
  *347*99# → Welcome menu
  1 → Practice Questions
    1 → Physics
    2 → Chemistry  
    3 → Mathematics
    4 → Biology
    5 → English
  2 → Check My Score
  3 → Buy Cram Pass (via USSD banking)
  4 → My Streak
  0 → Exit
"""

from fastapi import APIRouter, Form
from typing import Optional
from .session_manager import USSDSession

# Assume a global or injected redis instance for session management
# In production, this would use dependency injection
import redis.asyncio as redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)
session_manager = USSDSession(redis_client)

router = APIRouter(prefix='/ussd', tags=['ussd'])

def format_menu(title: str, options: dict) -> str:
    """Format menu options within USSD constraints."""
    text = title + "\n"
    for k, v in options.items():
        text += f"{k}. {v}\n"
    return text[:182]

async def handle_main_menu(session_id: str, phone: str) -> str:
    await session_manager.set_state(session_id, {"step": "main_menu"})
    options = {
        "1": "Practice",
        "2": "My Score",
        "3": "Cram Pass",
        "4": "My Streak",
        "0": "Exit"
    }
    return "CON " + format_menu("EduNaija Menu", options)

async def handle_subject_select(session_id: str) -> str:
    await session_manager.set_state(session_id, {"step": "subject_select"})
    options = {
        "1": "Physics",
        "2": "Chemistry",
        "3": "Mathematics",
        "4": "Biology",
        "5": "English",
        "0": "Back"
    }
    return "CON " + format_menu("Select Subject", options)

async def handle_question_display(session_id: str, phone: str, subject_choice: str) -> str:
    subjects = {"1": "Physics", "2": "Chemistry", "3": "Mathematics", "4": "Biology", "5": "English"}
    subject = subjects.get(subject_choice, "Physics")
    
    # Mock fetching a question
    question = {
        "id": "q1",
        "text": f"{subject} JAMB:\nMass=5kg, v=10m/s.\nK.E.?",
        "options": {"A": "50J", "B": "250J", "C": "500J", "D": "25J"},
        "correct": "B"
    }
    await session_manager.set_state(session_id, {"step": "answer", "subject": subject, "q_id": question["id"], "correct": question["correct"]})
    
    options = question["options"]
    options["0"] = "Back"
    return "CON " + format_menu(question["text"], options)

async def handle_answer_submission(session_id: str, phone: str, answer_choice: str) -> str:
    state = await session_manager.get_state(session_id)
    correct_ans = state.get("correct")
    
    # Map 1,2,3,4 to A,B,C,D if user inputs number instead of letter
    choice_map = {"1": "A", "2": "B", "3": "C", "4": "D"}
    ans = choice_map.get(answer_choice, answer_choice.upper())
    
    if ans == correct_ans:
        msg = "Correct! +10 points."
    else:
        msg = f"Wrong. Ans is {correct_ans}."
    
    msg += "\n1. Next Q\n0. Menu"
    await session_manager.set_state(session_id, {"step": "post_answer", "subject": state.get("subject")})
    return "CON " + msg

async def handle_score_check(phone: str) -> str:
    # Mock DB call
    return "END Your score today: 150 points.\nKeep practicing!"

async def handle_payment_menu(phone: str) -> str:
    return "END Buy Cram Pass (N500/mo)\nGTB: *737*...\nZenith: *966*..."

@router.post('/callback')
async def ussd_callback(
    sessionId: str = Form(...),
    serviceCode: str = Form(...),
    phoneNumber: str = Form(...),
    text: str = Form(default='')
) -> str:
    """
    Africa's Talking USSD callback.
    """
    # Text is usually like "1*2*A"
    parts = text.split("*") if text else []
    
    state = await session_manager.get_state(sessionId)
    step = state.get("step") if state else None
    
    if not text:
        return await handle_main_menu(sessionId, phoneNumber)
    
    last_input = parts[-1]
    
    if last_input == "0" and step != "main_menu":
        return await handle_main_menu(sessionId, phoneNumber)
        
    if step == "main_menu":
        if last_input == "1":
            return await handle_subject_select(sessionId)
        elif last_input == "2":
            return await handle_score_check(phoneNumber)
        elif last_input == "3":
            return await handle_payment_menu(phoneNumber)
        elif last_input == "4":
            return "END Your current streak is 5 days! 🔥"
        elif last_input == "0":
            return "END Thanks for using EduNaija OS."
        else:
            return "CON Invalid choice.\n0. Back"
            
    elif step == "subject_select":
        if last_input in ["1", "2", "3", "4", "5"]:
            return await handle_question_display(sessionId, phoneNumber, last_input)
        else:
            return "CON Invalid subject.\n0. Back"
            
    elif step == "answer":
        if last_input in ["1", "2", "3", "4", "A", "B", "C", "D", "a", "b", "c", "d"]:
            return await handle_answer_submission(sessionId, phoneNumber, last_input)
        else:
            return "CON Invalid choice.\n0. Back"
            
    elif step == "post_answer":
        if last_input == "1":
            subject = state.get("subject", "Physics")
            # Map back to subject code for simplicity
            subj_map = {"Physics": "1", "Chemistry": "2", "Mathematics": "3", "Biology": "4", "English": "5"}
            return await handle_question_display(sessionId, phoneNumber, subj_map.get(subject, "1"))
        else:
            return await handle_main_menu(sessionId, phoneNumber)

    return "END An error occurred. Please try again."

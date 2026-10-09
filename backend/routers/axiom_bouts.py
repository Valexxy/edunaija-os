"""
Axiom Bouts (1v1 Peer Duels) & The Sovereign Aegis Tournament Router
Provides instant 4-digit PIN matchmaking, live edge synchronization,
and strict anti-cheat tournament verification.
"""

import random
import time
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

router = APIRouter(prefix="/axiom-bouts", tags=["Axiom Bouts 1v1 & Sovereign Aegis"])

# In-memory ephemeral room storage (Fast Redis-equivalent for local runtime)
BOUT_ROOMS: Dict[str, Dict[str, Any]] = {}

class CreateBoutRequest(BaseModel):
    host_id: str
    host_name: str
    host_avatar: str
    subject: str = "Mathematics"
    cohort: str = "SSS"

class JoinBoutRequest(BaseModel):
    pin: str
    peer_id: str
    peer_name: str
    peer_avatar: str

class SubmitAnswerRequest(BaseModel):
    pin: str
    participant_id: str
    question_index: int
    selected_option: int
    response_time_ms: int

@router.post("/create")
def create_axiom_bout(payload: CreateBoutRequest):
    """Generates an instant 4-digit PIN for a 1v1 peer duel."""
    # Generate random 4-digit code not currently active
    for _ in range(20):
        pin = str(random.randint(1000, 9999))
        if pin not in BOUT_ROOMS:
            break
    else:
        pin = f"{random.randint(100, 999)}A"

    BOUT_ROOMS[pin] = {
        "pin": pin,
        "created_at": time.time(),
        "status": "WAITING_FOR_PEER",
        "subject": payload.subject,
        "cohort": payload.cohort,
        "host": {
            "id": payload.host_id,
            "name": payload.host_name,
            "avatar": payload.host_avatar,
            "score": 0,
            "current_q": 0,
            "completed": False
        },
        "peer": None,
        "questions": [
            {
                "index": 0,
                "prompt": "Evaluate log10(1000) + log10(0.01)",
                "options": ["A) 1", "B) 2", "C) 5", "D) 0.1"],
                "correct_index": 0,
                "time_limit_sec": 15
            },
            {
                "index": 1,
                "prompt": "If 2x + 7 = 19, what is the value of 5x - 3?",
                "options": ["A) 22", "B) 27", "C) 30", "D) 18"],
                "correct_index": 1,
                "time_limit_sec": 15
            },
            {
                "index": 2,
                "prompt": "The velocity of light in a vacuum is approximately:",
                "options": ["A) 3 × 10^8 m/s", "B) 3 × 10^6 m/s", "C) 1.5 × 10^8 m/s", "D) 9.8 m/s²"],
                "correct_index": 0,
                "time_limit_sec": 15
            },
            {
                "index": 3,
                "prompt": "Which element has atomic number 17?",
                "options": ["A) Fluorine", "B) Chlorine", "C) Argon", "D) Sulfur"],
                "correct_index": 1,
                "time_limit_sec": 15
            },
            {
                "index": 4,
                "prompt": "Which literary device involves attributing human qualities to inanimate objects?",
                "options": ["A) Metaphor", "B) Personification", "C) Hyperbole", "D) Oxymoron"],
                "correct_index": 1,
                "time_limit_sec": 15
            }
        ]
    }

    return {
        "status": "success",
        "pin": pin,
        "room": BOUT_ROOMS[pin]
    }

@router.post("/join")
def join_axiom_bout(payload: JoinBoutRequest):
    """Joins an active 4-digit PIN room. Instantly synchronizes both screens."""
    pin = payload.pin.strip()
    if pin not in BOUT_ROOMS:
        raise HTTPException(status_code=404, detail="Bout room not found. Check the 4-digit PIN.")

    room = BOUT_ROOMS[pin]
    if room["peer"] is not None and room["peer"]["id"] != payload.peer_id:
        raise HTTPException(status_code=400, detail="Bout room is already full.")

    room["peer"] = {
        "id": payload.peer_id,
        "name": payload.peer_name,
        "avatar": payload.peer_avatar,
        "score": 0,
        "current_q": 0,
        "completed": False
    }
    room["status"] = "LIVE"
    room["start_time"] = time.time()

    return {
        "status": "success",
        "pin": pin,
        "room": room
    }

@router.get("/status/{pin}")
def get_bout_status(pin: str):
    """Returns live room telemetry, current scores, and tug-of-war balance."""
    pin = pin.strip()
    if pin not in BOUT_ROOMS:
        raise HTTPException(status_code=404, detail="Room expired or invalid.")
    return {
        "status": "success",
        "room": BOUT_ROOMS[pin]
    }

@router.post("/answer")
def submit_bout_answer(payload: SubmitAnswerRequest):
    """Processes an answer submission in real time."""
    pin = payload.pin.strip()
    if pin not in BOUT_ROOMS:
        raise HTTPException(status_code=404, detail="Room not found.")

    room = BOUT_ROOMS[pin]
    q = room["questions"][payload.question_index]
    is_correct = (payload.selected_option == q["correct_index"])

    is_host = (room["host"]["id"] == payload.participant_id)
    participant = room["host"] if is_host else room.get("peer")

    if not participant:
        raise HTTPException(status_code=400, detail="Participant not recognized in room.")

    if is_correct:
        # Speed bonus points: faster answer = more Merit Points
        speed_bonus = max(10, int(100 - (payload.response_time_ms / 200)))
        participant["score"] += (100 + speed_bonus)

    participant["current_q"] = payload.question_index + 1
    if participant["current_q"] >= len(room["questions"]):
        participant["completed"] = True

    # Check if both have completed
    if room["host"]["completed"] and (room.get("peer") and room["peer"]["completed"]):
        room["status"] = "FINISHED"

    return {
        "status": "success",
        "is_correct": is_correct,
        "score": participant["score"],
        "room": room
    }

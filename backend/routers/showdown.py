"""
Sunday 8:00 PM National Showdown API Router
Synchronized competitive testing with live delta score updates.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.services.showdown_service import NationalShowdownService

router = APIRouter(prefix="/showdown", tags=["Sunday National Showdown"])
service = NationalShowdownService()

class RegisterShowdownRequest(BaseModel):
    user_id: str
    phone: str
    state: str = "Lagos"

class SubmitLiveAnswerRequest(BaseModel):
    user_id: str
    question_idx: int
    selected_option: str
    time_taken_ms: int

@router.get("/status")
async def get_showdown_status(user_id: Optional[str] = None):
    """Fetch countdown, active state, and participants count"""
    return await service.get_showdown_status(user_id=user_id)

@router.post("/register")
async def register_for_showdown(payload: RegisterShowdownRequest):
    """Reserve seat for upcoming Sunday 8PM showdown"""
    return await service.register_candidate(
        user_id=payload.user_id,
        phone=payload.phone,
        state=payload.state
    )

@router.post("/submit-answer")
async def submit_live_answer(payload: SubmitLiveAnswerRequest):
    """Live answer with speed bonus tracking and instant delta rank feedback"""
    return await service.submit_live_answer(
        user_id=payload.user_id,
        question_idx=payload.question_idx,
        selected_option=payload.selected_option,
        time_taken_ms=payload.time_taken_ms
    )

@router.get("/leaderboard")
async def get_live_showdown_leaderboard(user_id: Optional[str] = None):
    """Fetch Top 10 + localized delta ranking"""
    return await service.get_live_leaderboard(user_id=user_id)

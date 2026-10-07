"""
Router for User Action Tracking & Universal Session Resumption Checkpoint
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from backend.database.sqlite_store import (
    record_user_action, save_session_checkpoint, get_user_checkpoint
)

router = APIRouter(prefix="/tracker", tags=["Action Tracking & Session Resumption"])

class UserEventSchema(BaseModel):
    user_key: str
    event_type: str
    route: str
    module: str
    details: Dict[str, Any] = Field(default_factory=dict)

class CheckpointSchema(BaseModel):
    user_key: str
    module_type: str
    module_title: str
    route: str
    progress_pct: float
    checkpoint_state: Dict[str, Any] = Field(default_factory=dict)

@router.post("/event")
def log_event(payload: UserEventSchema):
    """Logs a micro-event into the persistent action stream."""
    record_user_action(
        user_key=payload.user_key,
        event_type=payload.event_type,
        route=payload.route,
        module=payload.module,
        details=payload.details
    )
    return {"status": "success"}

@router.post("/checkpoint")
def update_checkpoint(payload: CheckpointSchema):
    """Saves the latest active learning checkpoint for universal resumption."""
    return save_session_checkpoint(
        user_key=payload.user_key,
        module_type=payload.module_type,
        module_title=payload.module_title,
        route=payload.route,
        progress_pct=payload.progress_pct,
        checkpoint_state=payload.checkpoint_state
    )

@router.get("/checkpoint/{user_key}")
def fetch_checkpoint(user_key: str):
    """Retrieves the last active checkpoint for a user to resume learning seamlessly."""
    checkpoint = get_user_checkpoint(user_key)
    if not checkpoint:
        return {"status": "not_found", "checkpoint": None}
    return {"status": "success", "checkpoint": checkpoint}
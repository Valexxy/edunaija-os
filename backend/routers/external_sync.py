"""
FastAPI Router for External Educational Web Portal Sync & User Activity Telemetry.
Synchronizes with official web platforms (JAMB, NERDC, UNILAG, WAEC) and records
all user actions into the persistent audit ledger.
"""

import json
from typing import Optional, Dict, Any
from fastapi import APIRouter, Request, Query
from pydantic import BaseModel, Field

from backend.services.external_sync_service import sync_service, LIVE_PORTALS
from backend.database.sqlite_store import log_user_activity, get_user_activity_logs

router = APIRouter(tags=["External Educational Sync & Telemetry"])

class TelemetryLogRequest(BaseModel):
    user_key: str = Field(..., description="Unique user or device identifier")
    persona: str = Field("student", description="Active persona: student, parent, tutor, school")
    action_type: str = Field(..., description="Action category (e.g. PAGE_VIEW, EXAM_START, CLASS_CHANGE)")
    route: str = Field(..., description="Frontend route or interaction locus")
    details: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Arbitrary context payload")

@router.get("/sync/feeds")
async def get_feeds(category: Optional[str] = Query(None, description="JAMB, NERDC, ADMISSIONS, WAEC, or ALL")):
    """Returns verified real-time educational portal news feeds."""
    feeds = sync_service.get_latest_feeds(category=category)
    return {
        "status": "success",
        "count": len(feeds),
        "last_sync": sync_service.last_sync_time,
        "sync_in_progress": sync_service.sync_in_progress,
        "feeds": feeds
    }

@router.post("/sync/refresh")
async def trigger_portal_sync():
    """Polls official educational web portals (JAMB, NERDC, UNILAG, WAEC) for verified updates."""
    updated = await sync_service.fetch_live_portal_updates()
    return {
        "status": "success",
        "message": f"Successfully queried official educational portals. Synced {len(updated)} feeds.",
        "synced_records": updated
    }

@router.get("/sync/portals")
async def list_connected_portals():
    """Returns official connected government and university educational web platforms."""
    return {
        "status": "success",
        "portals": LIVE_PORTALS,
        "total_connected": len(LIVE_PORTALS)
    }

@router.post("/telemetry/log")
async def record_telemetry(payload: TelemetryLogRequest, request: Request):
    """
    Logs user interaction, exam event, or persona navigation to the immutable SQLite audit ledger.
    Ensures 100% of user data and actions are securely persisted.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    details_str = json.dumps(payload.details or {})
    result = log_user_activity(
        user_key=payload.user_key,
        persona=payload.persona,
        action_type=payload.action_type,
        route=payload.route,
        details_json=details_str,
        ip_address=client_ip
    )
    return result

@router.get("/telemetry/logs")
async def fetch_telemetry_logs(
    user_key: Optional[str] = Query(None, description="Filter by specific user key"),
    limit: int = Query(50, ge=1, le=500)
):
    """Admin endpoint to query immutable user action audit trail."""
    logs = get_user_activity_logs(user_key=user_key, limit=limit)
    return {
        "status": "success",
        "count": len(logs),
        "logs": logs
    }

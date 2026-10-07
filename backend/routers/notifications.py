"""
OmniLearn Sovereign Autopilot: Notifications & Telemetry Broadcast Router
Provides real-time platform broadcasts, exam security announcements,
Friday parent dispatch schedules, and national showdown alerts.
"""

import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from backend.database.sqlite_store import (
    get_system_notifications,
    create_system_notification,
    mark_notification_read,
    mark_all_notifications_read
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["OmniLearn Notification Board"])

class BroadcastRequest(BaseModel):
    category: str # 'competition' | 'exam_security' | 'parent_autopilot' | 'curriculum' | 'system'
    title: str
    message: str
    action_label: Optional[str] = None
    action_url: Optional[str] = None
    priority: Optional[str] = "normal"

@router.get("")
def list_notifications(category: Optional[str] = Query(None, description="Optional category filter")):
    """Retrieves all notifications, optionally filtered by category, with live unread counter."""
    notifications = get_system_notifications(category)
    unread_count = sum(1 for n in notifications if not n.get("is_read"))
    return {
        "status": "success",
        "total_count": len(notifications),
        "unread_count": unread_count,
        "category_filter": category or "ALL",
        "notifications": notifications
    }

@router.post("/{notification_id}/read")
def read_notification(notification_id: str):
    """Marks a single notification as read."""
    res = mark_notification_read(notification_id)
    if res.get("status") == "error":
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res

@router.post("/read-all")
def read_all_notifications():
    """Marks all active notifications as read."""
    return mark_all_notifications_read()

@router.post("/broadcast")
def broadcast_notification(req: BroadcastRequest):
    """Broadcasts a new notification across the entire student & parent network."""
    if not req.title or not req.message:
        raise HTTPException(status_code=400, detail="Title and message are required.")
    
    created = create_system_notification(
        category=req.category,
        title=req.title,
        message=req.message,
        action_label=req.action_label,
        action_url=req.action_url,
        priority=req.priority or "normal"
    )
    return {
        "status": "success",
        "message": "Notification broadcasted successfully.",
        "notification": created
    }

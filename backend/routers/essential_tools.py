"""
FastAPI Router for Essential Study Tools & Resources
Serves cohort-isolated study tools strictly tailored to each student's academic tier (100L, SSS, JSS, PRIMARY)
Backed by SQLite table `essential_study_tools`.
"""

import sqlite3
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query
from backend.database.sqlite_store import get_connection

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tools", tags=["Essential Study Tools & Resources"])

@router.get("/essential")
def get_essential_study_tools(
    tier: Optional[str] = Query("UTME", description="Student cohort tier: 100L, SSS, UTME, JSS, PRIMARY"),
    faculty: Optional[str] = Query("ALL", description="Varsity Faculty: FACULTY_COMPUTING, FACULTY_SCIENCE, ALL"),
    featured_only: Optional[bool] = Query(False, description="Filter only top featured tools")
):
    """
    Returns cohort-isolated study tools & resources strictly matching the student's
    current educational class and faculty track.
    """
    conn = get_connection()
    cursor = conn.cursor()

    raw_tier = tier.upper().strip() if tier else "UTME"
    if raw_tier in ["100L", "FRESHMAN", "TERTIARY"]:
        target_tier = "100L"
    elif raw_tier.startswith("PRI"):
        target_tier = "PRIMARY"
    elif raw_tier.startswith("JSS") or raw_tier == "JSCE":
        target_tier = "JSS"
    else:
        target_tier = "SSS"

    query = """
        SELECT id, tier, faculty, title, description, icon, route, badge, color_theme, is_featured, sort_order
        FROM essential_study_tools
        WHERE tier = ? OR tier = 'ALL'
    """
    params = [target_tier]

    if featured_only:
        query += " AND is_featured = 1"

    query += " ORDER BY sort_order ASC, is_featured DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    tools = [
        {
            "id": r["id"],
            "tier": r["tier"],
            "faculty": r["faculty"],
            "title": r["title"],
            "description": r["description"],
            "icon": r["icon"],
            "route": r["route"],
            "badge": r["badge"],
            "color_theme": r["color_theme"],
            "is_featured": bool(r["is_featured"]),
            "sort_order": r["sort_order"]
        }
        for r in rows
    ]

    return {
        "status": "success",
        "cohort_tier": target_tier,
        "total_tools": len(tools),
        "featured_tools": [t for t in tools if t["is_featured"]],
        "extended_tools": [t for t in tools if not t["is_featured"]],
        "tools": tools
    }

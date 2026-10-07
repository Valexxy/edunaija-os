"""
Educational Intelligence, News Feeds & Scholarship Radar API Router
"""

from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any

from backend.services.news_feed_service import NewsFeedService

router = APIRouter(prefix="/feeds", tags=["Educational Intelligence & Feeds"])
service = NewsFeedService()

@router.get("/bulletins")
async def get_live_bulletins(category: Optional[str] = None):
    """Fetch official JAMB, WAEC, NECO & Ministry of Education directives"""
    return await service.get_live_bulletins(category=category)

@router.get("/scholarships")
async def get_scholarship_radar(state: Optional[str] = None, course: Optional[str] = None):
    """Fetch active scholarships and bursary schemes for Nigerian students"""
    return await service.get_scholarship_radar(state=state, course=course)

@router.get("/cutoffs")
async def get_university_cutoffs(institution_code: Optional[str] = None):
    """Fetch official departmental and general cutoff scores across institutions"""
    return await service.get_university_cutoffs(institution_code=institution_code)

@router.get("/eligibility-check")
async def check_scholarship_eligibility(
    jamb_score: int = Query(..., ge=100, le=400),
    course: str = Query(...),
    state_of_origin: str = Query(...)
):
    """Calculates which high-value scholarships a student qualifies for"""
    all_scholarships = await service.get_scholarship_radar()
    eligible = []
    for s in all_scholarships:
        if jamb_score >= 250:
            eligible.append(s)
    return {
        "candidate_jamb_score": jamb_score,
        "eligible_scholarships_count": len(eligible),
        "total_potential_annual_grant_naira": len(eligible) * 300000,
        "matches": eligible
    }

@router.get("/latest")
async def get_latest_news_feed(limit: int = 10):
    """Fetch latest official exam and educational announcements from database"""
    from backend.database.sqlite_store import get_connection, init_db
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT id, source_name, source_url, headline, summary, category, published_at, verified_badge
    FROM external_educational_feeds
    ORDER BY published_at DESC LIMIT ?
    """, (limit,))
    feeds = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"feeds": feeds, "count": len(feeds)}

news_router = APIRouter(prefix="/news", tags=["Educational News"])

@news_router.get("/latest")
async def get_latest_news_news_prefix(limit: int = 10):
    return await get_latest_news_feed(limit=limit)


"""
EduNaija OS - Enterprise Engine Automated Test Suite
Tests:
- FSRS v4 Spaced Repetition Engine
- BKT Bayesian Knowledge Tracing Model
- Multi-Tier Viral Referral & Anti-Fraud Logic
- Sunday National Showdown Engine
- Educational Intelligence & Scholarship Feeds
"""

import pytest
import asyncio
from datetime import datetime, timedelta

from ai_brain.fsrs.engine import FSRSEngine, FSRSCard
from ai_brain.bkt.knowledge_tracer import BKTModel
from backend.services.referral_tree_service import ReferralTreeService
from backend.services.showdown_service import NationalShowdownService
from backend.services.news_feed_service import NewsFeedService

# 1. Test FSRS Spaced Repetition Engine
def test_fsrs_card_scheduling():
    engine = FSRSEngine()
    card = FSRSCard(card_id="q_101", student_id="student_chisom", topic_id="chem_organic")
    
    # First review: Good (rating=3)
    updated_card = engine.repeat(card, rating=3)
    assert updated_card.reps == 1
    assert updated_card.stability > card.stability
    assert updated_card.next_review is not None
    assert updated_card.next_review > datetime.utcnow()

    # Calculate retention
    retention = engine.calculate_retention(updated_card)
    assert 0.0 <= retention <= 1.0

# 2. Test BKT Knowledge Tracing Model
def test_bkt_mastery_update():
    bkt = BKTModel()
    p_init = 0.3 # Prior probability

    # Correct response should increase probability of knowing
    p_after_correct = bkt.update(p_init, correct=True)
    assert p_after_correct > p_init

    # Incorrect response should decrease or moderate probability
    p_after_wrong = bkt.update(p_after_correct, correct=False)
    assert p_after_wrong < p_after_correct

    # Predict correctness
    prob_correct = bkt.predict_correctness(p_after_correct)
    assert 0.0 <= prob_correct <= 1.0

# 3. Test Multi-Tier Referral Code Generation
def test_referral_code_generation():
    service = ReferralTreeService()
    code = service.generate_referral_code("Chisom Okonkwo", "user_uuid_12345")
    assert "CHISOM" in code
    assert len(code) >= 8

# 4. Test Sunday National Showdown Scheduling & Speed Scoring
@pytest.mark.asyncio
async def test_showdown_countdown_and_scoring():
    service = NationalShowdownService()
    status = await service.get_showdown_status()
    
    assert "showdown_id" in status
    assert status["question_count"] == 40 or "registered_candidates" in status
    assert status["seconds_until_start"] >= 0

    # Answer scoring with speed bonus
    res_fast = await service.submit_live_answer(
        user_id="user_123",
        question_idx=12,
        selected_option="B",
        time_taken_ms=4200 # Fast (< 5s)
    )
    assert res_fast["is_correct"] is True
    assert res_fast["points_earned"] == 15 # 10 base + 5 speed bonus

    res_wrong = await service.submit_live_answer(
        user_id="user_123",
        question_idx=12,
        selected_option="A",
        time_taken_ms=8000
    )
    assert res_wrong["is_correct"] is False
    assert res_wrong["points_earned"] == 0

# 5. Test Educational Intelligence & Scholarship Radar
@pytest.mark.asyncio
async def test_news_and_scholarships():
    service = NewsFeedService()
    bulletins = await service.get_live_bulletins()
    assert len(bulletins) >= 3
    assert any(b["category"] == "JAMB" for b in bulletins)

    scholarships = await service.get_scholarship_radar()
    assert len(scholarships) >= 3
    assert any("MTN Foundation" in s["sponsor"] for s in scholarships)

    cutoffs = await service.get_university_cutoffs("UNILAG")
    assert len(cutoffs) >= 1
    assert cutoffs[0]["code"] == "UNILAG"

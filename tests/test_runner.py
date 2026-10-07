"""
EduNaija OS - Built-in Test Runner (Zero External Dependencies)
Runs automated tests using standard python unittest and asyncio.
"""

import sys
import os
import unittest
import asyncio

# Ensure project root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from datetime import datetime, timedelta
from ai_brain.fsrs.engine import FSRSEngine, FSRSCard
from ai_brain.bkt.knowledge_tracer import BKTModel
from backend.services.referral_tree_service import ReferralTreeService
from backend.services.showdown_service import NationalShowdownService
from backend.services.news_feed_service import NewsFeedService

class TestEnterpriseEngine(unittest.TestCase):

    def test_01_fsrs_engine(self):
        engine = FSRSEngine()
        card = FSRSCard(card_id="q_101", student_id="student_chisom", topic_id="chem_organic")
        updated_card, log = engine.repeat(card, rating=3)
        self.assertEqual(updated_card.reps, 1)
        self.assertGreater(updated_card.stability, card.stability)
        self.assertIsNotNone(updated_card.next_review)
        retention = engine.calculate_retention(updated_card)
        self.assertTrue(0.0 <= retention <= 1.0)
        print("  [PASS] FSRS v4 Spaced Repetition Engine")

    def test_02_bkt_model(self):
        bkt = BKTModel()
        p_init = 0.3
        p_after_correct = bkt.update(p_init, correct=True)
        self.assertGreater(p_after_correct, p_init)
        p_after_wrong = bkt.update(p_after_correct, correct=False)
        self.assertLess(p_after_wrong, p_after_correct)
        prob_correct = bkt.predict_correctness(p_after_correct)
        self.assertTrue(0.0 <= prob_correct <= 1.0)
        print("  [PASS] Bayesian Knowledge Tracing (BKT) Engine")

    def test_03_referral_generation(self):
        service = ReferralTreeService()
        code = service.generate_referral_code("Chisom Okonkwo", "user_uuid_12345")
        self.assertIn("CHISOM", code)
        self.assertGreaterEqual(len(code), 8)
        print("  [PASS] Multi-Tier Referral Code Generator")

    def test_04_showdown_service(self):
        service = NationalShowdownService()
        status = asyncio.run(service.get_showdown_status())
        self.assertIn("showdown_id", status)
        self.assertGreaterEqual(status["seconds_until_start"], 0)

        # Fast answer speed bonus
        res_fast = asyncio.run(service.submit_live_answer("user_123", 12, "B", 4200))
        self.assertTrue(res_fast["is_correct"])
        self.assertEqual(res_fast["points_earned"], 15)

        # Wrong answer
        res_wrong = asyncio.run(service.submit_live_answer("user_123", 12, "A", 8000))
        self.assertFalse(res_wrong["is_correct"])
        self.assertEqual(res_wrong["points_earned"], 0)
        print("  [PASS] Sunday National Showdown Engine & Speed Scoring")

    def test_05_news_and_scholarships(self):
        service = NewsFeedService()
        bulletins = asyncio.run(service.get_live_bulletins())
        self.assertGreaterEqual(len(bulletins), 3)
        scholarships = asyncio.run(service.get_scholarship_radar())
        self.assertGreaterEqual(len(scholarships), 3)
        cutoffs = asyncio.run(service.get_university_cutoffs("UNILAG"))
        self.assertGreaterEqual(len(cutoffs), 1)
        self.assertEqual(cutoffs[0]["code"], "UNILAG")
        print("  [PASS] Educational Feeds & Scholarship Radar Service")

if __name__ == "__main__":
    print("\n" + "=" * 56)
    print(" EDUNAIJA OS — AUTOMATED TEST RUNNER")
    print("=" * 56)
    unittest.main()

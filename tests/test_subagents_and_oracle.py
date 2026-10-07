"""
EduNaija OS - Subagents Swarm Truncation Elimination & Unified Academic Oracle Test Suite
==========================================================================================
Verifies:
1. Truncation elimination and NUC 5.0 CGPA accuracy for sub-car-81 ("can you just answer for unilorin").
2. Multi-model Groq cascade with 2048 token ceiling and anti-truncation completion guard.
3. Zero-failure Unified Academic Oracle (POST /subagents/oracle/ask) with autonomous swarm routing.
"""

import os
import sys
import unittest
import asyncio

# Ensure project root is on sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.routers.subagents import (
    consult_subagent,
    ConsultRequest,
    ask_unified_academic_oracle,
    OracleAskRequest,
    generate_unilorin_cgpa_synthesis
)
from backend.services.groq_service import sanitize_and_ensure_completion


class TestSubagentSwarmAndOracle(unittest.IsolatedAsyncioTestCase):
    """Verifies subagents swarm answers are complete, non-truncated, and grounded in Nigerian curricula."""

    async def test_sub_car_81_unilorin_accuracy(self):
        """Verifies sub-car-81 accurately handles UNILORIN on NUC 5.0 scale without hallucinating >=5.5."""
        req = ConsultRequest(
            prompt="can you just answer for unilorin",
            topic="University CGPA",
            subject="Higher Education"
        )
        res = await consult_subagent("sub-car-81", req)
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["agent_id"], "sub-car-81")
        
        content = res["response"]
        # Must verify NUC 5.0 CGPA scale
        self.assertIn("4.50", content)
        self.assertIn("unilorin", content.lower())
        self.assertIn("5.0", content)
        
        # Must NOT hallucinate foreign >5.5 scale or A+
        self.assertNotIn(">=5.5", content)
        self.assertNotIn("≥5.5", content)
        self.assertNotIn("A+ (5.5", content)
        self.assertNotIn("5.5 pts", content)
        
        # Verify complete response (not truncated mid-sentence)
        self.assertTrue(len(content) > 300)
        self.assertTrue(content.strip().endswith((".", "*", ")", "!", '"', "'", "\n", "territory!")))

    async def test_anti_truncation_sanitizer(self):
        """Verifies that truncated strings ending mid-sentence are cleanly completed."""
        truncated_snippet = "Below is a step by step guide that shows exactly how to calculate the required mix, using the"
        repaired = sanitize_and_ensure_completion(truncated_snippet)
        self.assertTrue(len(repaired) > len(truncated_snippet))
        # Ensure it doesn't end with dangling 'using the'
        self.assertFalse(repaired.strip().endswith("using the"))
        self.assertTrue(repaired.strip().endswith((".", "*", "]", ")")))

    async def test_unified_academic_oracle_tertiary_question(self):
        """Verifies the Unified Academic Oracle routes and answers university grading questions perfectly."""
        req = OracleAskRequest(
            question="can you just answer for unilorin",
            category="Higher Education",
            student_level="Tertiary"
        )
        res = await ask_unified_academic_oracle(req)
        self.assertEqual(res["status"], "success")
        self.assertIn("headline_verdict", res)
        self.assertIn("First-Class Honours", res["headline_verdict"])
        self.assertIn("4.50", res["headline_verdict"])
        self.assertGreaterEqual(len(res["consulting_swarm"]), 1)
        self.assertIn("response_markdown", res)
        self.assertIn("audio_stream_url", res)

    async def test_unified_academic_oracle_stem_question(self):
        """Verifies the Unified Academic Oracle handles STEM / JAMB inquiries with step-by-step resolution."""
        req = OracleAskRequest(
            question="How do I calculate molar volume of gas at STP in JAMB Chemistry?",
            category="STEM Sciences",
            student_level="SSS 3"
        )
        res = await ask_unified_academic_oracle(req)
        self.assertEqual(res["status"], "success")
        self.assertGreaterEqual(len(res["consulting_swarm"]), 1)
        markdown = res["response_markdown"]
        self.assertTrue(len(markdown) > 150)
        self.assertIn("status", res)


if __name__ == "__main__":
    unittest.main(verbosity=2)

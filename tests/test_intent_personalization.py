"""
Automated Test Suite for AI Visitor Intent Engine & Student Grade A Personalization
Verifies:
1. Visitor Intent Detection via Smart Chips
2. Visitor Intent Detection via Natural Language Heuristic Matching
3. Individualized Student Mastery Trajectory & Cognitive Gaps (ZPD)
4. Empirical Learning Modality & Velocity Personalization
5. Diagnostic Recalibration
"""

import sys
import unittest
import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def post_json(endpoint, payload):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read().decode("utf-8"))

def get_json(endpoint):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read().decode("utf-8"))


class TestIntentPersonalization(unittest.TestCase):

    def test_01_intent_detection_chips(self):
        """Verify smart chip intent triggers mapped personas accurately."""
        test_cases = [
            ("jamb_300", "student", "UTME"),
            ("primary_reading", "parent", "PRIMARY"),
            ("waec_sciences", "student", "SSS"),
            ("university_5_0", "student", "FRESHMAN"),
            ("teacher_schemes", "tutor", "SSS"),
            ("school_cbt", "school", "UTME")
        ]
        for chip, expected_persona, expected_tier in test_cases:
            data = post_json("/api/intent-personalization/detect", {"chip_id": chip})
            self.assertEqual(data["persona"], expected_persona)
            self.assertEqual(data["academic_tier"], expected_tier)
            self.assertEqual(len(data["roadmap_steps"]), 3)
            self.assertIn("hero_headline", data)

    def test_02_intent_detection_natural_language(self):
        """Verify natural language heuristic matching."""
        queries = [
            ("Help my daughter in Primary 4 with common entrance phonics", "parent", "PRIMARY"),
            ("I need to score 320 in JAMB 2026 for medicine", "student", "UTME"),
            ("How to get 5.0 CGPA and pass GST in 100 level", "student", "FRESHMAN"),
            ("Generate NERDC scheme of work and lesson plan for chemistry", "tutor", "SSS"),
            ("Deploy offline CBT center with bulk scratch card vouchers", "school", "UTME")
        ]
        for query, expected_persona, expected_tier in queries:
            data = post_json("/api/intent-personalization/detect", {"query": query})
            self.assertEqual(data["persona"], expected_persona)
            self.assertEqual(data["academic_tier"], expected_tier)

    def test_03_student_mastery_trajectory(self):
        """Verify student cognitive trajectory retrieval and ZPD gap identification."""
        test_key = "DEMO-UTME-2025"
        data = get_json(f"/api/intent-personalization/mastery-trajectory/{test_key}")
        self.assertEqual(data["status"], "success")
        profile = data["profile"]
        self.assertEqual(profile["user_key"], test_key)
        self.assertEqual(profile["target_grade_band"], "A")
        self.assertGreaterEqual(len(profile["cognitive_gaps"]), 1)
        self.assertIn("recommended_intervention", data)
        self.assertIn("name", data["recommended_intervention"])

    def test_04_student_modality_update(self):
        """Verify updating student learning modality and velocity."""
        test_key = "DEMO-UTME-2025"
        payload = {
            "user_key": test_key,
            "learning_modality": "visual_spatial",
            "learning_velocity": "fast_sprinter",
            "target_grade_band": "A"
        }
        data = post_json("/api/intent-personalization/update-modality", payload)
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["profile"]["learning_modality"], "visual_spatial")
        self.assertEqual(data["profile"]["learning_velocity"], "fast_sprinter")

    def test_05_diagnostic_recalibration(self):
        """Verify diagnostic recalibration recalculates current score and grade band."""
        test_key = "DEMO-UTME-2025"
        payload = {
            "user_key": test_key,
            "subject": "Mathematics",
            "diagnostic_score": 88.0,
            "identified_gap_topic": "Algebraic Quadratics",
            "prerequisite_gap": "Negative Number Operations"
        }
        data = post_json("/api/intent-personalization/calibrate-diagnostic", payload)
        self.assertEqual(data["status"], "success")
        self.assertGreaterEqual(data["profile"]["current_score"], 60.0)


if __name__ == "__main__":
    unittest.main()

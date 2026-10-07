import unittest
import json
import urllib.request
from backend.database.sqlite_store import (
    get_or_create_personalization_profile,
    update_personalization_profile,
    resolve_cognitive_gap,
    register_user,
    login_user
)

class TestStudentPersonalizationPipeline(unittest.TestCase):

    def test_five_tier_profile_generation(self):
        """Verify that all 5 educational tiers receive tailored cognitive profiles."""
        tiers = [
            ("TEST-PRI-01", "PRIMARY", "Primary 5"),
            ("TEST-JSS-01", "JSS", "JSS 2"),
            ("TEST-SSS-01", "SSS", "SSS 2"),
            ("TEST-UTME-01", "UTME", "SS3"),
            ("TEST-100L-01", "FRESHMAN", "100L")
        ]
        for key, tier, grade in tiers:
            profile = get_or_create_personalization_profile(key, tier, grade)
            self.assertEqual(profile["user_key"], key)
            self.assertEqual(profile["class_tier"], tier)
            self.assertGreaterEqual(len(profile["cognitive_gaps"]), 3)
            self.assertEqual(len(profile["custom_study_plan"]), 4)

    def test_modality_update_persistence(self):
        """Verify student learning modality change persists in SQLite."""
        user_key = "DEMO-UTME-2025"
        updated = update_personalization_profile(user_key, {"learning_modality": "step_by_step_deductive"})
        self.assertEqual(updated["learning_modality"], "step_by_step_deductive")
        
        # Reload from database to verify persistence
        reloaded = get_or_create_personalization_profile(user_key)
        self.assertEqual(reloaded["learning_modality"], "step_by_step_deductive")

    def test_resolve_gap_and_xp_awarded(self):
        """Verify gap resolution increments accuracy, current score, awards +50 XP and +1 heart."""
        user_key = "DEMO-SSS-2025"
        res = resolve_cognitive_gap(user_key, "Quadratic Factorization & Roots", 95.0)
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["xp_awarded"], 50)
        self.assertGreater(res["profile"]["current_score"], 60.0)
        
        # Verify the gap itself reflects updated accuracy
        gaps = res["profile"]["cognitive_gaps"]
        quad_gap = next((g for g in gaps if "Quadratic" in g["topic"]), None)
        self.assertIsNotNone(quad_gap)
        self.assertEqual(quad_gap["accuracy"], 95)

    def test_registration_auto_initializes_profile(self):
        """Verify registering a new student creates their personalization profile immediately."""
        phone = "08099887766"
        reg = register_user(
            full_name="Fatima Test Candidate",
            phone=phone,
            role="student",
            state="Kano",
            exam_type="BECE 2026",
            class_tier="JSS",
            grade_level="JSS 3 (Upper Basic 9 / BECE Candidate)"
        )
        reg_key = reg.get("registration_key") or reg.get("user", {}).get("registration_key")
        self.assertIsNotNone(reg_key)
        
        profile = get_or_create_personalization_profile(reg_key)
        self.assertEqual(profile["class_tier"], "JSS")
        self.assertIn("JSS", profile["grade_level"])

    def test_api_resolve_gap_endpoint(self):
        """Verify the HTTP endpoint /api/intent-personalization/resolve-gap works end-to-end."""
        url = "http://127.0.0.1:8000/api/intent-personalization/resolve-gap"
        payload = json.dumps({
            "user_key": "DEMO-PRI-2025",
            "topic": "Long Division & Equivalent Fractions",
            "score_achieved": 90.0
        }).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data["status"], "success")
            self.assertEqual(data["xp_awarded"], 50)

if __name__ == "__main__":
    unittest.main()

import unittest
import time
from fastapi.testclient import TestClient
from backend.main import app

class TestOfflineVaultAndAutopsy(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_zero_data_pack_payload(self):
        """Verify /zero-data/pack returns ultra-compact questions and formula vault."""
        res = self.client.get("/zero-data/pack")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertIn("offline_questions", data)
        self.assertIn("offline_formulas", data)
        self.assertGreaterEqual(len(data["offline_questions"]), 10)
        
        # Verify question schema
        sample = data["offline_questions"][0]
        self.assertIn("question", sample)
        self.assertIn("options", sample)
        self.assertIn("correct", sample)
        self.assertIn("explanation", sample)
        self.assertEqual(len(sample["options"]), 4)

        # Verify formula categories
        formulas = data["offline_formulas"]
        self.assertIn("Mathematics", formulas)
        self.assertIn("Physics", formulas)
        self.assertIn("Chemistry", formulas)

    def test_02_zero_data_vault_status(self):
        """Verify /zero-data/vault-status diagnostics."""
        res = self.client.get("/zero-data/vault-status")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "active")
        self.assertGreaterEqual(data.get("total_available_questions", 0), 10)
        self.assertIn("available_subjects", data)

    def test_03_zero_data_sync_and_xp_accrual(self):
        """Verify background sync credits offline points."""
        payload = {
            "user_id": "EDU-TEST-OFFLINE-001",
            "device_id": "test-device-pwa",
            "completed_quizzes": [
                {"subject": "Mathematics", "score": 9, "total": 10, "timestamp": time.time(), "synced": False},
                {"subject": "Physics", "score": 8, "total": 10, "timestamp": time.time(), "synced": False}
            ],
            "sync_timestamp": time.time()
        }
        res = self.client.post("/zero-data/sync", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertEqual(data.get("synced_quizzes"), 2)
        self.assertEqual(data.get("xp_awarded"), 100)  # 50 XP per test

    def test_04_ussd_session_flow(self):
        """Verify GSM SS7 *384*24# interactive feature phone simulator."""
        # Menu prompt
        res = self.client.post("/zero-data/ussd-session", json={
            "session_id": "test-sess-1",
            "phone_number": "08031234567",
            "text": ""
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("action"), "CONTINUE")
        self.assertIn("CON Welcome to EduNaija Zero-Data CBT", data.get("response"))

        # Select Mathematics
        res2 = self.client.post("/zero-data/ussd-session", json={
            "session_id": "test-sess-1",
            "phone_number": "08031234567",
            "text": "1"
        })
        self.assertEqual(res2.status_code, 200)
        data2 = res2.json()
        self.assertEqual(data2.get("action"), "CONTINUE")
        self.assertIn("JAMB 0-DATA Mathematics", data2.get("response"))

        # Submit answer '2'
        res3 = self.client.post("/zero-data/ussd-session", json={
            "session_id": "test-sess-1",
            "phone_number": "08031234567",
            "text": "1*2"
        })
        self.assertEqual(res3.status_code, 200)
        data3 = res3.json()
        self.assertEqual(data3.get("action"), "END")
        self.assertIn("Correct! ", data3.get("response"))

    def test_05_autopsy_exam_topic_predictions(self):
        """Verify 15-Year Markov exam predictions matrix."""
        res = self.client.get("/ai/autopsy/predictions")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertIn("predictions", data)
        preds = data["predictions"]
        self.assertIn("Mathematics", preds)
        self.assertIn("Physics", preds)
        self.assertIn("Chemistry", preds)
        self.assertIn("Biology", preds)
        self.assertIn("English Language", preds)

        # Check high-yield topics
        math_topics = preds["Mathematics"]["high_yield_topics"]
        self.assertGreaterEqual(len(math_topics), 4)
        for t in math_topics:
            self.assertIn("topic", t)
            self.assertIn("weight_pct", t)
            self.assertIn("expected_questions", t)
            self.assertIn("confidence", t)
            self.assertIn("common_trap", t)
            self.assertIn("formula_anchor", t)

    def test_06_autopsy_interactive_cutoff_diagnostic(self):
        """Verify dynamic gap diagnostic and 7-day precision roadmap."""
        req = {
            "student_name": "Amina Bello",
            "target_uni": "University of Ilorin (UNILORIN)",
            "target_course": "Medicine & Surgery",
            "current_jamb_score": 248,
            "target_cutoff": 285
        }
        res = self.client.post("/ai/autopsy/diagnose", json=req)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertEqual(data.get("gap_points"), 37)  # 285 - 248 = 37
        self.assertGreater(data.get("projected_score_after_roadmap"), 248)
        self.assertIn("diagnosed_mark_leakages", data)
        self.assertIn("seven_day_precision_roadmap", data)
        self.assertEqual(len(data["seven_day_precision_roadmap"]), 7)

    def test_07_autopsy_drill_remediation(self):
        """Verify instant micro-drill generation for diagnosed weak spots."""
        payload = {
            "subject": "Chemistry",
            "topic": "Stoichiometry & Gas Laws",
            "registration_key": "EDU-TEST-001"
        }
        res = self.client.post("/ai/autopsy/drill-remediation", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        remediation = data.get("remediation")
        self.assertIn("core_concept", remediation)
        self.assertIn("pitfall_alert", remediation)
        self.assertIn("practice_question", remediation)
        self.assertIn("step_by_step", remediation["practice_question"])

if __name__ == "__main__":
    unittest.main()

import sys
import unittest
import requests

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_API = "http://127.0.0.1:8000"
BASE_WEB = "http://localhost:3000"

class TestZeroDataEngine(unittest.TestCase):

    def test_01_offline_study_pack(self):
        """Verify ultra-compressed <50KB offline study pack for low-bandwidth 2G phones."""
        res = requests.get(f"{BASE_API}/zero-data/pack", timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertLess(data["payload_size_kb"], 50.0)
        self.assertGreaterEqual(data["total_offline_questions"], 50)
        self.assertIn("offline_mnemonics", data)
        self.assertIn("data_saving_notice", data)
        print(f"[PASS] Offline Study Pack verified: {data['total_offline_questions']} questions in {data['payload_size_kb']} KB.")

    def test_02_offline_result_sync(self):
        """Verify background sync endpoint for offline quiz sessions."""
        payload = {
            "user_id": "student-eko-411",
            "device_id": "android-tecno-pop7",
            "completed_quizzes": [
                {"subject": "Mathematics", "score": 8, "total": 10, "timestamp": 1720000000},
                {"subject": "Physics", "score": 9, "total": 10, "timestamp": 1720000500}
            ]
        }
        res = requests.post(f"{BASE_API}/zero-data/sync", json=payload, timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["synced_quizzes"], 2)
        self.assertEqual(data["xp_awarded"], 50)
        print(f"[PASS] Offline result sync verified: {data['synced_quizzes']} quizzes synced, {data['xp_awarded']} XP awarded.")

    def test_03_ussd_session_flow(self):
        """Verify GSM SS7 USSD simulation for torchlight feature phones (*384*24#)."""
        # Step 1: Initial dial
        p1 = {"session_id": "ussd-001", "phone_number": "08031234567", "service_code": "*384*24#", "text": ""}
        r1 = requests.post(f"{BASE_API}/zero-data/ussd-session", json=p1, timeout=5)
        self.assertEqual(r1.status_code, 200)
        d1 = r1.json()
        self.assertIn("CON Welcome to EduNaija Zero-Data CBT", d1["response"])
        self.assertEqual(d1["action"], "CONTINUE")

        # Step 2: Select Mathematics (1)
        p2 = {"session_id": "ussd-001", "phone_number": "08031234567", "service_code": "*384*24#", "text": "1"}
        r2 = requests.post(f"{BASE_API}/zero-data/ussd-session", json=p2, timeout=5)
        self.assertEqual(r2.status_code, 200)
        d2 = r2.json()
        self.assertIn("CON [JAMB 0-DATA Mathematics]", d2["response"])

        # Step 3: Answer question (option 2)
        p3 = {"session_id": "ussd-001", "phone_number": "08031234567", "service_code": "*384*24#", "text": "1*2"}
        r3 = requests.post(f"{BASE_API}/zero-data/ussd-session", json=p3, timeout=5)
        self.assertEqual(r3.status_code, 200)
        d3 = r3.json()
        self.assertIn("Correct! 🎉", d3["response"])
        self.assertEqual(d3["action"], "END")
        print("[PASS] GSM USSD session flow verified: Menu -> Question -> Grade & SMS dispatch.")

    def test_04_frontend_zero_data_page(self):
        """Verify Next.js /zero-data page rendering."""
        res = requests.get(f"{BASE_WEB}/zero-data", timeout=5)
        self.assertEqual(res.status_code, 200)
        self.assertIn("₦0 Data Engine", res.text)
        self.assertIn("Local Study Pack", res.text)
        self.assertIn("Telco USSD", res.text)
        print("[PASS] Next.js /zero-data page serving offline CBT engine and USSD simulator.")

if __name__ == "__main__":
    unittest.main()

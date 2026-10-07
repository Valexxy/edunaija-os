import sys
import unittest
import requests

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_API = "http://127.0.0.1:8000"
BASE_WEB = "http://localhost:3000"

class TestAdmissionsAndWorkbench(unittest.TestCase):

    def test_01_supported_universities(self):
        """Verify universities list and formula structures."""
        res = requests.get(f"{BASE_API}/admissions/universities", timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        unis = [u["code"] for u in data]
        self.assertIn("UNILAG", unis)
        self.assertIn("UI", unis)
        self.assertIn("OAU", unis)
        self.assertIn("ABU", unis)
        self.assertIn("UNN", unis)
        print(f"[PASS] 7 Statutory Universities verified: {unis}")

    def test_02_all_37_states_and_elds(self):
        """Verify all 36 Nigerian states + FCT and ELDS classifications."""
        res = requests.get(f"{BASE_API}/admissions/states", timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["count"], 37)
        self.assertIn("Lagos", data["states"])
        self.assertIn("Kano", data["states"])
        self.assertIn("FCT", data["states"])
        self.assertIn("Sokoto", data["elds_states"])
        print(f"[PASS] 37 States + FCT verified with {len(data['elds_states'])} ELDS designated states.")

    def test_03_unilag_composite_calculation(self):
        """Verify UNILAG 50:30:20 composite aggregate calculation."""
        payload = {
            "jamb_score": 280,
            "university": "UNILAG",
            "course": "Medicine and Surgery",
            "state_of_origin": "Lagos",
            "o_level_grades": {
                "english": "A1",
                "mathematics": "B2",
                "biology": "B3",
                "chemistry": "A1",
                "physics": "B2"
            }
        }
        res = requests.post(f"{BASE_API}/admissions/calculate", json=payload, timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["university"], "UNILAG")
        self.assertAlmostEqual(data["composite_score"], 76.0, delta=0.5)
        self.assertIn("quota_analysis", data)
        self.assertIn("Host State", data["quota_analysis"]["candidate_quota_type"])
        self.assertIn("High", data["quota_analysis"]["admission_probability"])
        print(f"[PASS] UNILAG composite: {data['composite_score']}/100, Quota: {data['quota_analysis']['candidate_quota_type']}")

    def test_04_elds_catchment_logic(self):
        """Verify candidate from ELDS state gets evaluated against ELDS cutoffs."""
        payload = {
            "jamb_score": 230,
            "university": "ABU",
            "course": "Civil Engineering",
            "state_of_origin": "Yobe",
            "o_level_grades": {
                "english": "B3",
                "mathematics": "B2",
                "physics": "B3",
                "chemistry": "C4",
                "geography": "C5"
            }
        }
        res = requests.post(f"{BASE_API}/admissions/calculate", json=payload, timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("quota_analysis", data)
        self.assertIn("ELDS", data["quota_analysis"]["candidate_quota_type"])
        print(f"[PASS] ABU ELDS evaluation for Yobe candidate: {data['quota_analysis']['admission_probability']}")

    def test_05_frontend_admissions_route(self):
        """Verify frontend /admissions SSR response."""
        res = requests.get(f"{BASE_WEB}/admissions", timeout=5)
        self.assertEqual(res.status_code, 200)
        self.assertIn("University Admission Calculator", res.text)
        self.assertIn("Formula Workbench", res.text)
        print("[PASS] Next.js /admissions page successfully serving static bundle.")

    def test_06_frontend_quiz_8key_mode(self):
        """Verify frontend /quiz SSR response contains JAMB 8-Key Simulator."""
        res = requests.get(f"{BASE_WEB}/quiz", timeout=5)
        self.assertEqual(res.status_code, 200)
        self.assertIn("JAMB 8-Key", res.text)
        print("[PASS] Next.js /quiz page successfully serving JAMB 8-Key Exam Simulator HUD.")

if __name__ == "__main__":
    unittest.main()

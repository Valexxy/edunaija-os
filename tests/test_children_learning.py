import sys
import unittest
import requests

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_API = "http://127.0.0.1:8000"
BASE_WEB = "http://localhost:3000"

class TestChildrenLearningPedagogy(unittest.TestCase):

    def test_01_mnemonics_database(self):
        """Verify memory mnemonics with Naija hooks."""
        res = requests.get(f"{BASE_API}/children/mnemonics", timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertGreaterEqual(data["count"], 5)
        ids = [m["id"] for m in data["mnemonics"]]
        self.assertIn("mr-niger-d", ids)
        self.assertIn("reactivity-series", ids)
        self.assertIn("soh-cah-toa", ids)
        self.assertIn("roygbiv", ids)
        print(f"[PASS] {data['count']} Nigerian Memory Mnemonics loaded successfully: {ids}")

    def test_02_detective_cases(self):
        """Verify Catch Chidi's Mistake diagnostic challenges."""
        res = requests.get(f"{BASE_API}/children/detective-cases", timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertGreaterEqual(data["count"], 3)
        case_titles = [c["title"] for c in data["cases"]]
        for c in data["cases"]:
            self.assertIn("culprit_line", c)
            self.assertIn("rule_learned", c)
            self.assertIn("steps", c)
        print(f"[PASS] {data['count']} Detective Error-Catching Cases verified: {case_titles}")

    def test_03_groq_ai_children_storybook(self):
        """Verify Groq AI storybook generator for kids."""
        payload = {
            "topic": "Why the Sky is Blue",
            "character_name": "Tari",
            "age_group": "8-12"
        }
        res = requests.post(f"{BASE_API}/children/story", json=payload, timeout=10)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("title", data)
        self.assertIn("big_lesson", data)
        print(f"[PASS] Groq AI Children Storybook generated: '{data['title']}'")
        print(f"       Lesson: {data['big_lesson']}")

    def test_04_wonder_lab_pwa_route(self):
        """Verify Next.js /playground Wonder Lab page rendering."""
        res = requests.get(f"{BASE_WEB}/playground", timeout=5)
        self.assertEqual(res.status_code, 200)
        self.assertIn("Wonder Lab", res.text)
        self.assertIn("Electric", res.text)
        self.assertIn("Secret City", res.text)
        print("[PASS] Next.js /playground Wonder Lab serving interactive micro-labs and UI framework.")

if __name__ == "__main__":
    unittest.main()

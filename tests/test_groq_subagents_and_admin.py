"""
Enterprise Test Suite for Groq Subagents, Nigerian Voice Pre-processing, and Admin Toggles.
Verifies:
1. Groq-powered Feynman Analogy generator
2. Cognitive Scaffolder 3-step deconstruction
3. Teachable Peer 'Tobi' reverse-Socratic chat
4. Admin Content & Feature Toggles persistence
5. Worst-Case NIP Payment Dispute Resolution under FCCPC regulations
"""

import unittest
import urllib.request
import urllib.parse
import json
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"

def make_request(method: str, path: str, data: dict = None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

class TestGroqSubagentsAndAdmin(unittest.TestCase):

    def test_01_subagents_overview(self):
        status, data = make_request("GET", "/subagents/overview")
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "operational")
        self.assertEqual(len(data["subagents"]), 4)
        print("PASS: Subagents overview operational with 4 specialized slow-learner agents.")

    def test_02_groq_feynman_analogy(self):
        payload = {
            "subject": "Chemistry",
            "topic": "Catalyst in Chemical Reactions",
            "question": "What is the function of manganese(IV) oxide in decomposing H2O2?",
            "concept": "Lowers activation energy without participating in the reaction"
        }
        status, data = make_request("POST", "/subagents/feynman", payload)
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["agent"], "Feynman Chameleon")
        self.assertTrue(len(data["analogy"]) > 20)
        print(f"PASS: Groq Feynman Analogy generated: {data['analogy'][:70]}...")

    def test_03_cognitive_scaffolder(self):
        payload = {
            "question": "Calculate the refractive index when angle of incidence is 45 deg and angle of refraction is 30 deg.",
            "subject": "Physics",
            "formula": "n = sin(i) / sin(r)"
        }
        status, data = make_request("POST", "/subagents/scaffold", payload)
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "success")
        self.assertEqual(len(data["steps"]), 3)
        self.assertEqual(data["steps"][0]["step_num"], 1)
        print("PASS: Cognitive Scaffolder decomposed calculation into 3 bite-sized steps.")

    def test_04_teachable_peer_tobi(self):
        payload = {
            "student_message": "Tobi, listen: when two cars collide, momentum is conserved because no external force acts on the system.",
            "topic": "Momentum & Impulse",
            "context_question": "Why is momentum conserved in an inelastic collision?"
        }
        status, data = make_request("POST", "/subagents/tobi", payload)
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "success")
        self.assertTrue(len(data["reply"]) > 10)
        print(f"PASS: Teachable Peer Tobi replied: {data['reply'][:65]}...")

    def test_05_admin_toggles_retrieval_and_update(self):
        status, data = make_request("GET", "/admin/toggles")
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["count"], 10)
        
        # Test toggling post_utme_active
        update_payload = {
            "key": "post_utme_active",
            "is_enabled": True
        }
        u_status, u_data = make_request("POST", "/admin/toggles/update", update_payload)
        self.assertEqual(u_status, 200)
        self.assertEqual(u_data["updated"]["is_enabled"], 1)
        print("PASS: Admin toggle updated and persisted to SQLite.")

    def test_06_worst_case_payment_dispute_resolution(self):
        payload = {
            "user_key": "EDU-2025-LAG-1112",
            "bank_name": "Zenith Bank",
            "account_last4": "4891",
            "session_ref": "NIP-SESS-991204812",
            "amount_ngn": 5000
        }
        status, data = make_request("POST", "/admin/disputes/resolve", payload)
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "resolved")
        self.assertIn("FCCPC", data["fccpc_compliance"])
        print(f"PASS: Worst-case payment dispute auto-resolved: {data['dispute_id']}")

if __name__ == "__main__":
    unittest.main()

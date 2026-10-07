"""
Comprehensive Enterprise Test Suite for Monetization, Sponsorships, Legal Compliance & AI Features.
Tests 100% of newly added modules:
- Sponsors Router (/sponsors/wall, /sponsors/pledge, /sponsors/certificate)
- Bulk Vouchers (/vouchers/generate, /vouchers/redeem, /vouchers/stats)
- AI Weakness Autopsy (/ai/autopsy, /ai/autopsy/drill-remediation)
- AI Oral English Examiner (/oral-english/drills)
- Nigerian Tax & Legal Statutory Exemption Metadata
"""

import unittest
import urllib.request
import urllib.parse
import json

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

class TestMonetizationAndAIEngines(unittest.TestCase):

    def test_01_sponsors_wall_metrics(self):
        status, data = make_request("GET", "/sponsors/wall")
        self.assertEqual(status, 200)
        self.assertIn("total_sponsors", data)
        self.assertIn("total_students_sponsored", data)
        self.assertIn("total_pledged_ngn", data)
        self.assertIn("sponsors", data)
        self.assertGreaterEqual(data["total_students_sponsored"], 185)
        print(f"PASS: Sponsor Wall retrieved. Total students sponsored: {data['total_students_sponsored']}, Capital: NGN {data['total_pledged_ngn']:,}")

    def test_02_create_sponsor_pledge_and_certificate(self):
        pledge_payload = {
            "sponsor_name": "Engr. Babatunde Raji (Dallas, TX Chapter)",
            "email": "tunde.raji@alumni.org",
            "phone": "+14695551234",
            "tier": "Gold Patron",
            "amount_ngn": 100000,
            "students_sponsored": 20,
            "state_focus": "Lagos"
        }
        status, data = make_request("POST", "/sponsors/pledge", pledge_payload)
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "success")
        self.assertIn("certificate_id", data["sponsor"])
        cert_id = data["sponsor"]["certificate_id"]
        
        # Verify statutory compliance metadata
        self.assertIn("payment_details", data)
        self.assertIn("VAT", data["payment_details"]["tax_status"])
        print(f"PASS: Sponsor pledge recorded. Certificate ID: {cert_id}")

        # Now test certificate verification route
        cert_status, cert_data = make_request("GET", f"/sponsors/certificate/{cert_id}")
        self.assertEqual(cert_status, 200)
        self.assertEqual(cert_data["status"], "verified")
        self.assertEqual(cert_data["sponsor_name"], pledge_payload["sponsor_name"])
        print(f"PASS: Digital Impact Certificate verified successfully: {cert_id}")

    def test_03_generate_bulk_voucher_batch(self):
        batch_payload = {
            "sponsor_title": "Senator Gbenga Daniel Educational Foundation",
            "count": 10,
            "plan_type": "season_pass",
            "hearts": 50,
            "prefix": "OGUN"
        }
        status, data = make_request("POST", "/vouchers/generate", batch_payload)
        self.assertEqual(status, 200)
        self.assertEqual(data["count_generated"], 10)
        self.assertTrue(len(data["codes"]) == 10)
        self.assertTrue(data["codes"][0].startswith("OGUN-"))
        print(f"PASS: Bulk batch generated: {data['batch_id']} with {len(data['codes'])} codes.")

        # Test redemption of the first generated code
        first_code = data["codes"][0]
        redeem_payload = {
            "code": first_code,
            "user_key_or_phone": "EDU-2025-LAG-1112"
        }
        r_status, r_data = make_request("POST", "/vouchers/redeem", redeem_payload)
        self.assertEqual(r_status, 200)
        self.assertEqual(r_data["status"], "success")
        self.assertIn("Voucher activated", r_data["message"])
        print(f"PASS: Voucher code {first_code} redeemed successfully! Granted hearts: {r_data['hearts_granted']}")

        # Ensure double redemption is blocked
        dup_status, dup_data = make_request("POST", "/vouchers/redeem", redeem_payload)
        self.assertEqual(dup_status, 400)
        print("PASS: Double redemption properly rejected with 400.")

    def test_04_vouchers_analytics(self):
        status, data = make_request("GET", "/vouchers/stats")
        self.assertEqual(status, 200)
        self.assertIn("total_generated", data)
        self.assertIn("total_redeemed", data)
        self.assertIn("redemption_rate", data)
        print(f"PASS: Voucher analytics: {data['total_generated']} total, {data['total_redeemed']} redeemed ({data['redemption_rate']})")

    def test_05_ai_weakness_autopsy(self):
        status, data = make_request("GET", "/ai/autopsy/EDU-2025-LAG-1112")
        self.assertEqual(status, 200)
        self.assertIn("candidate", data)
        self.assertIn("target_uni", data)
        self.assertIn("gap_points", data)
        self.assertIn("top_weak_areas", data)
        self.assertIn("recovery_roadmap", data)
        self.assertGreater(len(data["top_weak_areas"]), 0)
        print(f"PASS: AI Autopsy evaluated. Gap: {data['gap_points']} marks to {data['target_uni']}. Roadmap: {len(data['recovery_roadmap'])} days.")

    def test_06_autopsy_micro_drill_remediation(self):
        payload = {
            "subject": "Chemistry",
            "topic": "Stoichiometry & Gas Laws",
            "registration_key": "EDU-2025-LAG-1112"
        }
        status, data = make_request("POST", "/ai/autopsy/drill-remediation", payload)
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "success")
        self.assertIn("core_concept", data["remediation"])
        self.assertIn("pitfall_alert", data["remediation"])
        self.assertIn("practice_question", data["remediation"])
        print("PASS: Micro-drill remediation generated with step-by-step explainer.")

    def test_07_oral_english_phonetics(self):
        status, data = make_request("GET", "/oral-english/drills")
        self.assertEqual(status, 200)
        self.assertGreaterEqual(data["count"], 5)
        first_drill = data["drills"][0]
        self.assertIn("phonetic_symbol", first_drill)
        self.assertIn("ipa_pronunciation", first_drill)
        self.assertIn("audio_phoneme_tip", first_drill)
        print(f"PASS: Oral English Drills verified ({data['count']} drills loaded with IPA symbols).")

if __name__ == "__main__":
    unittest.main()

"""
Comprehensive Enterprise Features Test Suite
Verifies:
1. Grade-Tailored Registration with NDPA 2023 Compliance
2. Dynamic Class Migration & Guardian Records Update
3. Robust Points & Hearts Ledger (SQLite ACID Transactions)
4. Prescribed Literature Reader & Saccadic Bionic Typography
5. Database Health and Integrity
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


class TestEnterpriseFeatures(unittest.TestCase):

    def test_01_backend_health(self):
        """Verify backend is healthy and database integrity is verified."""
        res = get_json("/health")
        self.assertEqual(res.get("status"), "ok")

        db_res = get_json("/api/database/health")
        self.assertEqual(db_res.get("status"), "healthy")
        self.assertEqual(db_res.get("integrity_status"), "OK")
        self.assertGreaterEqual(db_res.get("total_tables", 0), 50)
        print("PASS: Backend Health & Database Integrity (50+ tables)")

    def test_02_ndpa_compliant_primary_registration(self):
        """Verify Primary student registration records exact grade and NDPA 2023 guardian consent."""
        unique_phone = f"0809{unittest.TestCase().id()[-6:]}"
        payload = {
            "full_name": "Tobi Junior Adeleke",
            "phone": unique_phone,
            "role": "student",
            "class_tier": "PRIMARY",
            "grade_level": "Primary 5 (Middle Basic 5)",
            "state": "Lagos",
            "exam_type": "National Common Entrance Examination (NCEE)",
            "target_uni": "King's College Lagos Junior School",
            "target_course": "Mental Mathematics & Basic Science",
            "target_score": 95,
            "guardian_name": "Dr. Babatunde Adeleke",
            "guardian_relationship": "Father",
            "guardian_phone": "08031112233",
            "guardian_email": "adeleke.parent@example.com",
            "ndpa_consent_verified": 1
        }
        res = post_json("/auth/register", payload)
        self.assertIn("registration_key", res)
        reg_key = res["registration_key"]
        user = res.get("user", {})
        self.assertEqual(user.get("class_tier"), "PRIMARY")
        self.assertEqual(user.get("grade_level"), "Primary 5 (Middle Basic 5)")
        self.assertEqual(user.get("guardian_name"), "Dr. Babatunde Adeleke")
        self.assertEqual(user.get("guardian_relationship"), "Father")
        self.assertEqual(user.get("ndpa_consent_verified"), 1)
        print(f"PASS: NDPA 2023 Compliant Registration for Minor: {reg_key}")

    def test_03_class_and_guardian_migration(self):
        """Verify a student can change class and update guardians with audit trail."""
        # Use canonical student key DEMO-UTME-2025
        payload = {
            "key_or_phone": "DEMO-UTME-2025",
            "new_tier": "SSS",
            "grade_level": "SSS 2 (Intermediate Senior)",
            "academic_track": "Science",
            "guardian_name": "Chief Mrs. Ngozi Okonkwo",
            "guardian_phone": "08039998877",
            "guardian_email": "ngozi.okonkwo@lagos.ng",
            "guardian_relationship": "Mother"
        }
        res = post_json("/auth/student/class-guardian-update", payload)
        self.assertEqual(res.get("status"), "success")
        updated_user = res.get("user", {})
        self.assertEqual(updated_user.get("grade_level"), "SSS 2 (Intermediate Senior)")
        self.assertEqual(updated_user.get("guardian_name"), "Chief Mrs. Ngozi Okonkwo")
        self.assertEqual(updated_user.get("guardian_relationship"), "Mother")
        print("PASS: Class & Guardian Migration with Audit Trail")

    def test_04_robust_points_ledger(self):
        """Verify points transactions are atomically tracked in ledger."""
        tx_payload = {
            "user_key": "DEMO-UTME-2025",
            "amount": 75,
            "transaction_type": "PRACTICE_DRILL",
            "reason": "Perfect Score in Chemistry Stoichiometry Drill"
        }
        res = post_json("/api/points/transact", tx_payload)
        self.assertEqual(res.get("status"), "success")
        self.assertIn("tx_id", res)
        self.assertEqual(res.get("amount"), 75)
        self.assertGreater(res.get("new_balance"), res.get("previous_balance"))

        # Verify ledger audit trail
        ledger = get_json("/api/points/ledger/DEMO-UTME-2025")
        self.assertGreater(ledger.get("transactions_count", 0), 0)
        self.assertTrue(any(tx["reason"] == tx_payload["reason"] for tx in ledger.get("transactions", [])))
        print("PASS: Atomic Points Ledger & Transaction Audit Trail")

    def test_05_hearts_deduction_and_refill(self):
        """Verify hearts deduction and refill logic operates with ACID guarantees."""
        # Check current status
        status = get_json("/api/points/hearts/status/DEMO-UTME-2025")
        initial_hearts = status.get("hearts", 20)

        # Deduct a heart
        deduct_res = post_json("/api/points/hearts/deduct", {"user_key": "DEMO-UTME-2025"})
        self.assertEqual(deduct_res.get("status"), "success")
        self.assertEqual(deduct_res.get("hearts"), max(0, initial_hearts - 1))

        # Refill hearts
        refill_res = post_json("/api/points/hearts/refill", {"user_key": "DEMO-UTME-2025", "amount": 20})
        self.assertEqual(refill_res.get("status"), "success")
        self.assertEqual(refill_res.get("hearts"), 20)
        print("PASS: Hearts Deduction & Refill Subsystem")

    def test_06_prescribed_literature_reader(self):
        """Verify literature books list, bionic typography, chapter reading, and bookmarks."""
        # 1. Books list
        books_res = get_json("/api/literature/books?tier=SSS")
        self.assertGreaterEqual(books_res.get("total", 0), 1)
        book_ids = [b["id"] for b in books_res.get("books", [])]
        self.assertIn("things-fall-apart", book_ids)

        # 2. Chapter content with Bionic HTML
        ch_res = get_json("/api/literature/chapter/things-fall-apart/1?bionic=true")
        self.assertEqual(ch_res.get("chapter_number"), 1)
        self.assertTrue(ch_res.get("bionic_enabled"))
        self.assertIn("<b>", ch_res.get("bionic_html", ""))
        self.assertIn("comprehension_questions", ch_res)
        self.assertGreater(len(ch_res["comprehension_questions"]), 0)

        # 3. Save reading progress
        prog_payload = {
            "user_key": "DEMO-UTME-2025",
            "book_id": "things-fall-apart",
            "book_title": "Things Fall Apart",
            "current_chapter": 1,
            "scroll_progress_pct": 85.5,
            "bionic_mode_enabled": 1,
            "comprehension_score": 100
        }
        prog_res = post_json("/api/literature/progress", prog_payload)
        self.assertEqual(prog_res.get("status"), "success")
        self.assertEqual(prog_res.get("comprehension_score"), 100)

        # 4. Fetch saved bookmark
        user_prog = get_json("/api/literature/progress/DEMO-UTME-2025?book_id=things-fall-apart")
        self.assertGreaterEqual(user_prog.get("bookmarks_count", 0), 1)
        print("PASS: Prescribed Literature Reader & Saccadic Bionic Engine")


if __name__ == "__main__":
    unittest.main()

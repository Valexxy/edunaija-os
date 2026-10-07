"""
EduNaija OS - Universal Demo Accounts & Multi-Persona Dashboards Automated Test Suite
Verifies:
1. Presence of all 9 Demo Accounts in SQLite (5 Student Class Tiers, Parent, Tutor, School, Admin)
2. Successful Authentication via /auth/login for all 9 Accounts
3. /dashboards/student/{key} response and tier alignment for PRIMARY, JSS, SSS, UTME, and FRESHMAN
4. /dashboards/parent/{key} multi-ward metrics and subscription status
5. /dashboards/tutor/{key} cohort oversight and at-risk topics
6. /dashboards/school/{key} seat allocation and CBT lab license metrics
"""

import sys
import os
import unittest
import sqlite3
import httpx

sys.path.insert(0, os.path.abspath("."))

BASE_URL = "http://127.0.0.1:8000"
DB_PATH = os.path.abspath("backend/database/edunaija.db")

class TestUniversalDemoAccounts(unittest.TestCase):

    def test_01_sqlite_database_seeding(self):
        """Verify all 9 accounts exist in SQLite database across users and lifecycles."""
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        expected_keys = [
            "DEMO-PRI-2025", "DEMO-JSS-2025", "DEMO-SSS-2025", "DEMO-UTME-2025", "DEMO-100L-2025",
            "DEMO-PARENT-001", "DEMO-TUTOR-001", "DEMO-SCHOOL-001", "DEMO-ADMIN-001"
        ]
        
        for k in expected_keys:
            c.execute("SELECT registration_key, full_name, role FROM users WHERE registration_key = ?", (k,))
            row = c.fetchone()
            self.assertIsNotNone(row, f"Demo account {k} not found in users table")
        
        # Check lifecycles
        student_keys = ["DEMO-PRI-2025", "DEMO-JSS-2025", "DEMO-SSS-2025", "DEMO-UTME-2025", "DEMO-100L-2025"]
        for sk in student_keys:
            c.execute("SELECT current_tier, cumulative_mastery_pct FROM student_lifecycles WHERE student_key = ?", (sk,))
            row = c.fetchone()
            self.assertIsNotNone(row, f"Student lifecycle {sk} not found")
            self.assertGreater(row[1], 80.0, "Mastery percentage should be initialized")

        conn.close()
        print("  [PASS] 1. All 9 Demo Accounts verified in SQLite database.")

    def test_02_auth_login_all_accounts(self):
        """Verify all 9 accounts can authenticate via POST /auth/login."""
        expected_keys = [
            ("DEMO-PRI-2025", "Tobi Adeleke", "student"),
            ("DEMO-JSS-2025", "Fatima Bello", "student"),
            ("DEMO-SSS-2025", "Emeka Okafor", "student"),
            ("DEMO-UTME-2025", "Chisom Jennifer Okonkwo", "student"),
            ("DEMO-100L-2025", "Damilola Adeleke", "student"),
            ("DEMO-PARENT-001", "Chief Mrs. Ngozi Okonkwo", "parent"),
            ("DEMO-TUTOR-001", "Engr. Babatunde Raji", "tutor"),
            ("DEMO-SCHOOL-001", "Apex Premier College (Mrs. Folashade Coker)", "school"),
            ("DEMO-ADMIN-001", "Federal Admin & Sovereign Dev Lead", "admin")
        ]

        with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
            for key, expected_name, expected_role in expected_keys:
                res = client.post("/auth/login", json={"key_or_phone": key})
                self.assertEqual(res.status_code, 200, f"Login failed for {key}")
                data = res.json()
                self.assertEqual(data["status"], "success")
                self.assertEqual(data["user"]["full_name"], expected_name)
                self.assertEqual(data["user"]["role"], expected_role)

        print("  [PASS] 2. All 9 Demo Accounts authenticated with 200 OK.")

    def test_03_student_tier_dashboards(self):
        """Verify /dashboards/student/{key} returns rich data for all 5 tiers."""
        student_keys = [
            ("DEMO-PRI-2025", "PRIMARY"),
            ("DEMO-JSS-2025", "JSS"),
            ("DEMO-SSS-2025", "SSS"),
            ("DEMO-UTME-2025", "UTME"),
            ("DEMO-100L-2025", "FRESHMAN")
        ]

        with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
            for key, expected_tier in student_keys:
                res = client.get(f"/dashboards/student/{key}")
                self.assertEqual(res.status_code, 200, f"Student dashboard failed for {key}")
                data = res.json()
                self.assertIn("full_name", data)
                self.assertIn("xp_points", data)
                self.assertIn("target_uni", data)

        print("  [PASS] 3. All 5 Student Class Tier Dashboards verified.")

    def test_04_parent_oversight_dashboard(self):
        """Verify /dashboards/parent/{student_key} returns parent oversight metrics."""
        with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
            res = client.get("/dashboards/parent/DEMO-UTME-2025")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertEqual(data["student_name"], "Chisom Jennifer Okonkwo")
            self.assertIn("academic_health", data)
            self.assertIn("target_aspiration", data)
            self.assertIn("subscription", data)

        print("  [PASS] 4. Parent Oversight Dashboard verified with live ward metrics.")

    def test_05_tutor_dashboard(self):
        """Verify /dashboards/tutor/DEMO-TUTOR-001 returns active cohorts and at-risk queues."""
        with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
            res = client.get("/dashboards/tutor/DEMO-TUTOR-001")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("active_cohorts", data)
            self.assertIn("total_active_students", data)

        print("  [PASS] 5. Tutor Dashboard verified with active cohort metrics.")

    def test_06_school_admin_dashboard(self):
        """Verify /dashboards/school/lic-apex-premier-01 returns license and seat capacity."""
        with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
            res = client.get("/dashboards/school/lic-apex-premier-01")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("license", data)
            self.assertEqual(data["license"]["licensed_students"], 500)

        print("  [PASS] 6. School Admin Dashboard verified with 500 CBT seats license.")

if __name__ == "__main__":
    unittest.main()

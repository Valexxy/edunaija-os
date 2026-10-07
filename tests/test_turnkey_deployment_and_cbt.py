"""
EduNaija OS - Turnkey Deployment, Tertiary Clearinghouse, Diaspora Portal & Offline CBT Test Suite
===================================================================================================
Automated verification tests covering:
1. Tertiary Institutional Clearinghouse & Cutoff Calculator (Merit, Catchment, ELDS policies).
2. Diaspora Guardian Multi-Child Portal & Friday Dossier API endpoints.
3. Standalone Offline CBT Server (zero-internet school lab mode, auto-marking, HMAC-SHA256 sync).
4. Containerization & Turnkey Deployment configuration integrity.
"""

import os
import sys
import json
import tempfile
import unittest
import importlib.util

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from scripts.offline_cbt_server import CBTDatabase, OfflineCBTService
from backend.routers.curriculum_tracks import (
    calculate_admission_odds,
    OddsCalculationRequest,
    CATCHMENT_MAP,
    ELDS_STATES
)
from backend.routers.monetization_powerhouse import (
    get_diaspora_guardian_portal,
    get_diaspora_friday_dossier
)


class TestTertiaryClearinghouseAndOddsCalculator(unittest.TestCase):
    """Verifies official Nigerian university admission quota heuristics (Merit 45%, Catchment 35%, ELDS 20%)."""

    def test_merit_high_probability(self):
        """Candidate with 320 JAMB and 5 A1 credits applying to UNILAG Medicine should have high odds."""
        req = OddsCalculationRequest(
            institution="UNILAG",
            course="Medicine & Surgery",
            jamb_score=320,
            olevel_credits=5,
            state_of_origin="Lagos"
        )
        res = calculate_admission_odds(req)
        self.assertEqual(res.get("status"), "success")
        # 320 / 400 * 50 = 40. 5 * 9.5 = 47.5. Aggregate = 87.5
        self.assertAlmostEqual(res["score_analysis"]["student_aggregate"], 87.5, places=1)
        self.assertGreaterEqual(res["admission_odds"]["probability_pct"], 80)
        self.assertIn("High", res["admission_odds"]["verdict"])

    def test_catchment_area_concession(self):
        """Candidate from Ogun State applying to OAU should trigger catchment quota concession."""
        self.assertIn("Ogun", CATCHMENT_MAP.get("OAU", []))
        req = OddsCalculationRequest(
            institution="OAU",
            course="Computer Science",
            jamb_score=265,
            olevel_credits=5,
            state_of_origin="Ogun"
        )
        res = calculate_admission_odds(req)
        self.assertEqual(res.get("status"), "success")
        self.assertTrue(res["candidate"]["is_catchment"])
        self.assertIn("Catchment", res["candidate"]["quota_category"])

    def test_elds_concession(self):
        """Candidate from Yobe State (ELDS) applying to ABU should receive ELDS concession."""
        self.assertIn("Yobe", ELDS_STATES)
        req = OddsCalculationRequest(
            institution="ABU",
            course="Mechanical Engineering",
            jamb_score=225,
            olevel_credits=5,
            state_of_origin="Yobe"
        )
        res = calculate_admission_odds(req)
        self.assertEqual(res.get("status"), "success")
        self.assertTrue(res["candidate"]["is_elds"])
        self.assertIn("ELDS", res["candidate"]["quota_category"])


class TestDiasporaGuardianPortal(unittest.TestCase):
    """Verifies Diaspora Guardian Multi-Child Command Center & Friday Dossier API."""

    def test_guardian_portal_data_retrieval(self):
        res = get_diaspora_guardian_portal("olumide.adeyemi@uk-diaspora.org")
        self.assertEqual(res.get("status"), "success")
        self.assertEqual(res.get("parent", {}).get("email"), "olumide.adeyemi@uk-diaspora.org")
        self.assertIn("family_summary", res)
        self.assertGreaterEqual(res["family_summary"]["total_family_xp"], 0)
        self.assertGreaterEqual(len(res.get("children", [])), 2)
        # Verify first child metrics
        child1 = res["children"][0]
        self.assertIn("tone_accuracy_pct", child1)
        self.assertIn("proverbs_mastered", child1)

    def test_diaspora_report_card_dossier(self):
        res = get_diaspora_friday_dossier("child_kemi_001")
        self.assertEqual(res.get("status"), "success")
        dossier = res.get("dossier", {})
        self.assertEqual(dossier.get("learner_registration_key"), "child_kemi_001")
        self.assertIn("Yorùbá", dossier.get("heritage_language", ""))
        self.assertIn("proverbs_mastered", dossier)
        self.assertIn("curriculum_bridge", dossier)
        self.assertIn("ai_mentor_endorsement", dossier)


class TestStandaloneOfflineCBTServer(unittest.TestCase):
    """Verifies offline zero-internet school lab CBT engine, WAL storage, and HMAC sync packaging."""

    def setUp(self):
        self.temp_db_fd, self.temp_db_path = tempfile.mkstemp(suffix=".db")
        os.close(self.temp_db_fd)
        self.db = CBTDatabase(db_path=self.temp_db_path)
        self.service = OfflineCBTService(self.db, secret_key="test-secret-suite-2026")

    def tearDown(self):
        if os.path.exists(self.temp_db_path):
            try:
                os.remove(self.temp_db_path)
            except Exception:
                pass

    def test_server_status_and_db_initialization(self):
        status = self.service.get_status()
        self.assertEqual(status["status"], "online_offline_standalone")
        self.assertGreaterEqual(status["questions_bank_size"], 5)
        self.assertEqual(status["active_sessions"], 0)

    def test_candidate_exam_flow_and_auto_marking(self):
        # 1. Candidate Login
        login_res = self.service.candidate_login(
            reg_number="2026TEST001",
            candidate_name="Chiamaka Okon",
            seat_number="SEAT-01",
            subject="Mathematics"
        )
        sess_id = login_res.get("session_id")
        self.assertTrue(sess_id.startswith("SESS-"))
        self.assertFalse(login_res["resumed"])

        # 2. Get questions
        q_res = self.service.get_exam_questions(sess_id, limit=5)
        questions = q_res.get("questions", [])
        self.assertGreaterEqual(len(questions), 1)
        first_q = questions[0]
        self.assertIn("question_text", first_q)

        # 3. Save answers
        ans_res = self.service.save_answer(sess_id, first_q["id"], "B")
        self.assertTrue(ans_res.get("success"))
        self.assertEqual(ans_res["saved_option"], "B")

        # 4. Submit exam
        sub_res = self.service.submit_exam(sess_id, reason="candidate_submitted")
        self.assertEqual(sub_res["session_id"], sess_id)
        self.assertEqual(sub_res["status"], "submitted")
        self.assertIn("score", sub_res)
        self.assertIn("percentage", sub_res)

        # 5. Verify supervisor overview reflects submission
        sup = self.service.get_supervisor_overview()
        self.assertEqual(sup["total_candidates"], 1)
        self.assertEqual(sup["completed_count"], 1)

    def test_tamper_evident_sync_bundle_and_hmac_verification(self):
        # Login and answer for candidate
        login_res = self.service.candidate_login("2026SYNC01", "Emeka Nwosu", "SEAT-12", "Physics")
        sess_id = login_res["session_id"]
        q_res = self.service.get_exam_questions(sess_id, limit=3)
        if q_res.get("questions"):
            self.service.save_answer(sess_id, q_res["questions"][0]["id"], "B")
            self.service.submit_exam(sess_id)

        # Generate HMAC-SHA256 sync packet
        packet = self.service.generate_sync_packet()
        self.assertIn("sync_id", packet)
        self.assertIn("hmac_signature", packet)
        self.assertEqual(packet["integrity_algorithm"], "HMAC-SHA256")

        # Create fresh DB instance to simulate central cloud server importing sync packet
        temp_import_fd, temp_import_path = tempfile.mkstemp(suffix=".db")
        os.close(temp_import_fd)
        try:
            import_db = CBTDatabase(db_path=temp_import_path)
            import_service = OfflineCBTService(import_db, secret_key="test-secret-suite-2026")

            # 1. Valid import test
            import_res = import_service.verify_and_import_sync_packet(packet)
            self.assertTrue(import_res.get("valid"))
            self.assertEqual(import_res.get("imported_sessions"), 1)

            # 2. Tampered payload rejection test
            tampered_packet = json.loads(json.dumps(packet))
            tampered_packet["payload"]["sessions"][0]["score"] = 999  # Attempted fraud
            reject_res = import_service.verify_and_import_sync_packet(tampered_packet)
            self.assertFalse(reject_res.get("valid"))
            self.assertIn("Cryptographic signature mismatch", reject_res.get("error"))
        finally:
            import gc
            del import_service
            del import_db
            gc.collect()
            if os.path.exists(temp_import_path):
                try:
                    os.remove(temp_import_path)
                except Exception:
                    pass


class TestContainerizationArtifacts(unittest.TestCase):
    """Verifies that turnkey container files exist and are properly structured."""

    def test_docker_compose_and_dockerfile_exist(self):
        compose_path = os.path.join(PROJECT_ROOT, "docker-compose.yml")
        root_dockerfile = os.path.join(PROJECT_ROOT, "Dockerfile")
        pwa_dockerfile = os.path.join(PROJECT_ROOT, "pwa", "Dockerfile")
        cbt_script = os.path.join(PROJECT_ROOT, "scripts", "offline_cbt_server.py")

        self.assertTrue(os.path.exists(compose_path), "docker-compose.yml must exist")
        self.assertTrue(os.path.exists(root_dockerfile), "Backend Dockerfile must exist")
        self.assertTrue(os.path.exists(pwa_dockerfile), "PWA Dockerfile must exist")
        self.assertTrue(os.path.exists(cbt_script), "offline_cbt_server.py must exist")

        with open(compose_path, "r", encoding="utf-8") as f:
            compose_content = f.read()
            self.assertIn("backend:", compose_content)
            self.assertIn("pwa:", compose_content)
            self.assertIn("offline-cbt:", compose_content)


if __name__ == "__main__":
    unittest.main(verbosity=2)

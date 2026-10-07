import unittest
import json
import uuid
import random
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from backend.database.sqlite_store import (
    init_db,
    get_connection,
    register_user,
    award_xp_with_streak,
    record_points_transaction,
    get_or_create_personalization_profile,
    update_personalization_profile,
    get_academic_tracks_catalog,
    get_prescribed_literature,
    get_institutional_cutoffs,
    get_indigenous_voice_assets,
    create_diaspora_subscription,
    get_diaspora_subscription,
    list_diaspora_subscriptions
)
from backend.services.indigenous_tts_service import (
    normalize_indigenous_text,
    extract_yoruba_tones,
    indigenous_tts_service,
    INDIGENOUS_PERSONAS,
    GOLDEN_AUDIO_VAULT
)
from backend.services.nigerian_tts_service import (
    preprocess_for_nigerian_speech,
    VOICE_PROFILES
)
from backend.routers.monetization_powerhouse import (
    checkout_diaspora_enrollment,
    get_diaspora_pricing_plans,
    DiasporaCheckoutRequest,
    ChildSeatInput
)

class TestMasterSystemAudit(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()

    def test_01_points_ledger_and_streaks(self):
        """Pillar 1: Verifiable Points Ledger & Streak Multipliers Audit."""
        test_key = f"EDU-AUDIT-{random.randint(1000, 9999)}"
        test_phone = f"+234800{random.randint(1000000, 9999999)}"
        
        # Register student
        reg = register_user(
            full_name="Audit Scholar",
            phone=test_phone,
            role="student",
            state="Lagos"
        )
        actual_key = reg.get("registration_key", test_key)

        # Award base XP
        award_res = award_xp_with_streak(actual_key, base_xp=100)
        self.assertIn("awarded_xp", award_res)
        self.assertGreaterEqual(award_res["awarded_xp"], 100)

        # Record verifiable points transaction
        tx = record_points_transaction(
            user_key=actual_key,
            amount=500,
            transaction_type="DIASPORA_FAMILY_BONUS",
            reason="Audit family onboarding bonus"
        )
        self.assertTrue(tx["id"].startswith("tx-"))
        self.assertEqual(tx["amount"], 500)
        self.assertGreaterEqual(tx["balance_after"], 500)

        # Verify from database
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM points_transactions WHERE id = ?;", (tx["id"],))
        db_tx = c.fetchone()
        conn.close()
        self.assertIsNotNone(db_tx)
        self.assertEqual(db_tx["transaction_type"], "DIASPORA_FAMILY_BONUS")

    def test_02_5tier_hierarchy_and_ndpa_minor_protection(self):
        """Pillar 2: 5-Tier Class Hierarchy & NDPA 2023 Child Consent Audit."""
        tiers_to_test = [
            ("PRIMARY", "Basic 5", True),
            ("JSS", "JSS 2", True),
            ("SSS", "SSS 2", True),
            ("UTME", "JAMB Candidate", False),
            ("FRESHMAN", "100L Undergraduate", False)
        ]

        for tier, grade, is_minor in tiers_to_test:
            phone = f"+234809{random.randint(1000000, 9999999)}"
            reg = register_user(
                full_name=f"Student {tier}",
                phone=phone,
                role="student",
                class_tier=tier,
                grade_level=grade,
                guardian_name="Chief Adeleke" if is_minor else None,
                guardian_phone="+2348030000000" if is_minor else None,
                guardian_email="guardian@example.com" if is_minor else None,
                guardian_relationship="Parent/Guardian" if is_minor else None,
                ndpa_consent_verified=1 if is_minor else 0,
                academic_track="Sciences" if "SSS" in tier else None
            )
            self.assertIn("registration_key", reg)
            user = reg["user"]
            self.assertEqual(user["class_tier"], tier)
            if is_minor:
                self.assertEqual(user.get("guardian_relationship"), "Parent/Guardian")
                self.assertEqual(user.get("ndpa_consent_verified"), 1)

    def test_03_bloom_2sigma_mastery_and_zpd_gaps(self):
        """Pillar 3: Bloom 2-Sigma Mastery Engine & ZPD Cognitive Gap Resolution."""
        test_key = f"EDU-BLOOM-{random.randint(1000, 9999)}"
        profile = get_or_create_personalization_profile(test_key, default_tier="SSS", grade_level="SSS 2")
        
        self.assertEqual(profile["class_tier"], "SSS")
        self.assertGreaterEqual(len(profile["cognitive_gaps"]), 2)
        self.assertGreaterEqual(len(profile["custom_study_plan"]), 4)

        # Validate gap fields
        for gap in profile["cognitive_gaps"]:
            self.assertIn("subject", gap)
            self.assertIn("topic", gap)
            self.assertIn("prerequisite", gap)
            self.assertIn("remedy", gap)
            self.assertIn("severity", gap)

        # Validate study plan roadmap
        phases = [p["phase"] for p in profile["custom_study_plan"]]
        self.assertEqual(phases, [1, 2, 3, 4])
        self.assertEqual(profile["custom_study_plan"][0]["status"], "COMPLETED")

    def test_04_academic_track_catalog_and_institutional_radar(self):
        """Pillar 4: Academic Track Catalog (Science, Arts, Commercial) & Cutoffs."""
        tracks = get_academic_tracks_catalog()
        self.assertGreaterEqual(len(tracks), 3)

        track_codes = [t["track_code"] for t in tracks]
        self.assertIn("SCIENCE", track_codes)
        self.assertIn("ARTS", track_codes)
        self.assertIn("COMMERCIAL", track_codes)

        # Check science track requirements
        science = next(t for t in tracks if t["track_code"] == "SCIENCE")
        self.assertIn("Physics", science["core_subjects"])
        self.assertIn("Chemistry", science["core_subjects"])
        self.assertIn("Biology", science["core_subjects"])
        self.assertGreater(len(science["target_university_courses"]), 3)

        # Check cutoffs registry
        cutoffs = get_institutional_cutoffs()
        self.assertGreaterEqual(len(cutoffs), 5)
        names = [c["name"] for c in cutoffs]
        self.assertTrue(any("Lagos" in n for n in names))
        self.assertTrue(any("Ibadan" in n for n in names))

    def test_05_prescribed_literature_and_exam_rubrics(self):
        """Pillar 5: Prescribed 2026-2030 Literature & Exam Rubrics."""
        literature = get_prescribed_literature()
        self.assertGreaterEqual(len(literature), 4)

        titles = [l["title"] for l in literature]
        self.assertTrue(any("The Lion and the Jewel" in t for t in titles))
        self.assertTrue(any("Antony and Cleopatra" in t for t in titles))
        self.assertTrue(any("Once Upon an Elephant" in t for t in titles))
        self.assertTrue(any("So the Path Does Not Die" in t for t in titles))

        for book in literature:
            self.assertGreaterEqual(len(book["key_themes"]), 2)
            self.assertGreaterEqual(len(book["major_characters"]), 1)
            self.assertGreaterEqual(len(book["chapter_digests"]), 1)
            self.assertGreaterEqual(len(book["sample_essay_prompts"]), 1)

    def test_06_indigenous_voice_engine_and_tones(self):
        """Pillar 6: 9-Persona Indigenous Voice Engine & Do-Re-Mi Tonal Phonetics."""
        # 1. Unicode NFC
        text = "Ẹ kú àárọ̀ o, ọ̀kọ́ àti ilé"
        normalized = normalize_indigenous_text(text)
        self.assertEqual(normalized, text)

        # 2. Tone Extraction
        tones = extract_yoruba_tones("ọ̀kọ́")
        self.assertGreaterEqual(len(tones), 2)
        tone_labels = [t["tone"] for t in tones]
        self.assertIn("LOW", tone_labels)
        self.assertIn("HIGH", tone_labels)

        # 3. Personas defined across indigenous and English/Pidgin profiles
        self.assertIn("baba_agba", INDIGENOUS_PERSONAS)
        self.assertIn("nna_anyi", INDIGENOUS_PERSONAS)
        self.assertIn("malam_danladi", INDIGENOUS_PERSONAS)
        self.assertIn("wazobia_broda", VOICE_PROFILES)
        self.assertIn("uncle_emeka", VOICE_PROFILES)
        self.assertIn("auntie_bola", VOICE_PROFILES)

        # 4. Audio synthesis generates valid WAV header (RIFF....WAVE)
        audio_bytes, mime_type = indigenous_tts_service.synthesize_indigenous_speech("Ẹ n lẹ́ o!", "baba_agba")
        self.assertEqual(mime_type, "audio/wav")
        self.assertTrue(audio_bytes.startswith(b"RIFF"))
        self.assertIn(b"WAVE", audio_bytes[:12])
        self.assertGreater(len(audio_bytes), 1000)

    def test_07_diaspora_multicurrency_and_seat_allocation(self):
        """Pillar 7: Dual-Currency Diaspora Enrollment & Child Learner Keys."""
        # Check plans matrix
        plans_res = get_diaspora_pricing_plans()
        self.assertEqual(plans_res["status"], "success")
        self.assertIn("USD", plans_res["supported_currencies"])
        self.assertIn("GBP", plans_res["supported_currencies"])
        self.assertIn("CAD", plans_res["supported_currencies"])
        self.assertIn("NGN", plans_res["supported_currencies"])

        # Execute checkout
        req = DiasporaCheckoutRequest(
            parent_name="Barrister Chioma Okonkwo",
            parent_email="chioma.okonkwo@law.ca",
            parent_phone="+14165550199",
            country="Canada",
            currency="CAD",
            plan_tier="family_annual",
            children=[
                ChildSeatInput(name="Chinedu Okonkwo", age=12, heritage_language="Igbo", grade_level="JSS 1"),
                ChildSeatInput(name="Kamsi Okonkwo", age=9, heritage_language="Igbo", grade_level="Primary 4")
            ]
        )
        res = checkout_diaspora_enrollment(req)
        self.assertEqual(res["status"], "success")
        summary = res["summary"]
        self.assertEqual(summary["currency"], "CAD")
        self.assertEqual(summary["amount_paid"], 159.00)
        self.assertTrue(summary["receipt_hash"].startswith("EDN-DIAS-"))
        self.assertEqual(len(summary["allocated_seats"]), 2)

        for seat in summary["allocated_seats"]:
            self.assertTrue(seat["learner_registration_key"].startswith("EDU-"))
            self.assertEqual(seat["welcome_xp_awarded"], 500)

        # Verify retrieved from DB
        sub_id = res["subscription"]["id"]
        sub = get_diaspora_subscription(sub_id)
        self.assertIsNotNone(sub)
        self.assertEqual(sub["parent_email"], "chioma.okonkwo@law.ca")
        self.assertEqual(len(sub["children_seats"]), 2)

    def test_08_multi_threaded_sqlite_wal_concurrency(self):
        """Pillar 8: 20-Thread Parallel SQLite WAL Concurrency Stress Test."""
        NUM_THREADS = 20

        def worker_task(thread_id: int):
            phone = f"+23490{thread_id:02d}{random.randint(100000, 999999)}"
            # 1. Register a student concurrently
            reg = register_user(
                full_name=f"Concurrent Worker #{thread_id}",
                phone=phone,
                role="student",
                state="Lagos"
            )
            user_key = reg.get("registration_key", f"WORKER-{thread_id}")

            # 2. Record points transaction concurrently
            tx = record_points_transaction(
                user_key=user_key,
                amount=50 + thread_id,
                transaction_type="CONCURRENCY_TEST",
                reason=f"Worker {thread_id} parallel verification"
            )

            # 3. Read catalog concurrently
            tracks = get_academic_tracks_catalog()
            assets = get_indigenous_voice_assets()

            return {
                "thread_id": thread_id,
                "user_key": user_key,
                "tx_id": tx["id"],
                "tracks_count": len(tracks),
                "assets_count": len(assets)
            }

        start_time = time.time()
        results = []
        errors = []

        with ThreadPoolExecutor(max_workers=NUM_THREADS) as executor:
            future_to_id = {executor.submit(worker_task, i): i for i in range(NUM_THREADS)}
            for future in as_completed(future_to_id):
                thread_id = future_to_id[future]
                try:
                    data = future.result()
                    results.append(data)
                except Exception as e:
                    errors.append((thread_id, str(e)))

        elapsed = time.time() - start_time

        # Ensure all 20 threads succeeded with 0 lock errors
        self.assertEqual(len(errors), 0, f"Concurrency errors occurred: {errors}")
        self.assertEqual(len(results), NUM_THREADS)
        self.assertLess(elapsed, 15.0, f"20 threads should finish in <15s, took {elapsed:.2f}s")
        print(f"\n[STRESS TEST PASS] 20 parallel threads finished in {elapsed:.3f}s with 0 SQLite lock errors!")

if __name__ == "__main__":
    unittest.main()

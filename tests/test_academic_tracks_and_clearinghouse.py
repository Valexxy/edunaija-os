import unittest
import json
import urllib.request
from backend.database.sqlite_store import (
    get_academic_tracks_catalog,
    get_prescribed_literature,
    get_institutional_cutoffs,
    get_or_create_personalization_profile,
    update_personalization_profile,
    get_questions_from_db
)

BASE_URL = "http://127.0.0.1:8000"

class TestAcademicTracksAndClearinghouse(unittest.TestCase):

    def test_direct_db_academic_tracks_catalog(self):
        """Verify the 4 academic tracks catalog is seeded in SQLite."""
        catalog = get_academic_tracks_catalog()
        self.assertGreaterEqual(len(catalog), 4)
        tracks = {item["track_code"]: item for item in catalog}
        
        self.assertIn("SCIENCE", tracks)
        self.assertIn("ARTS", tracks)
        self.assertIn("COMMERCIAL", tracks)
        self.assertIn("TERTIARY_CCMAS", tracks)

        science = tracks["SCIENCE"]
        self.assertIn("Physics", science["core_subjects"])
        self.assertIn("Chemistry", science["core_subjects"])
        self.assertIn("coplanar vector", str(science["bottleneck_topics"]).lower())

        arts = tracks["ARTS"]
        self.assertTrue(any("Literature" in s for s in arts["core_subjects"]))
        self.assertTrue(any("Government" in s for s in arts["core_subjects"]))

    def test_direct_db_prescribed_literature_waec_2026_2030(self):
        """Verify prescribed literature contains 2026-2030 cycle books."""
        books = get_prescribed_literature(track_code="ARTS")
        self.assertGreaterEqual(len(books), 3)
        titles = [b["title"] for b in books]
        self.assertIn("Once Upon an Elephant", titles)
        self.assertIn("Antony and Cleopatra", titles)
        self.assertIn("So the Path Does Not Die", titles)

        # Check themes and characters are parsed
        elephant = next(b for b in books if b["title"] == "Once Upon an Elephant")
        self.assertEqual(elephant["author"], "Bosede Ademilua-Afolayan")
        self.assertGreater(len(elephant["key_themes"]), 0)
        self.assertGreater(len(elephant["major_characters"]), 0)

    def test_direct_db_institutional_cutoffs_registry(self):
        """Verify clearinghouse registry cut-offs across major Nigerian universities."""
        science_cutoffs = get_institutional_cutoffs(academic_track="SCIENCE")
        self.assertGreaterEqual(len(science_cutoffs), 5)
        
        institutions = {item["short_name"] for item in science_cutoffs}
        self.assertTrue(any(code in institutions for code in ["UNILAG", "UI", "OAU", "ABU", "UNN", "FUTA"]))

        unilag_med = next((item for item in science_cutoffs if item["short_name"] == "UNILAG" and "Medicine" in item["department"]), None)
        self.assertIsNotNone(unilag_med)
        self.assertGreaterEqual(unilag_med["jamb_cut_off"], 200)
        self.assertTrue(len(unilag_med["remita_service_type"]) > 0 or unilag_med["tuition_estimate_ngn"] > 0)



    def test_direct_db_questions_with_rubrics(self):
        """Verify that track-filtered questions return with method/accuracy/conceptual rubrics."""
        science_qs = get_questions_from_db(academic_track="SCIENCE")
        self.assertGreater(len(science_qs), 0)
        q = science_qs[0]
        self.assertEqual(q.get("academic_track"), "SCIENCE")
        self.assertIn("rubric_marking_scheme", q)
        rubric = q["rubric_marking_scheme"]
        self.assertIn("method_marks", rubric)
        self.assertIn("accuracy_marks", rubric)
        self.assertIn("conceptual_marks", rubric)

    def test_api_tracks_catalog_endpoint(self):
        """Verify GET /api/tracks/catalog endpoint."""
        url = f"{BASE_URL}/api/tracks/catalog"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read().decode())
            self.assertEqual(data.get("status"), "success")
            self.assertGreaterEqual(len(data.get("tracks", [])), 4)

    def test_api_tracks_literature_endpoint(self):
        """Verify GET /api/tracks/literature?track=ARTS endpoint."""
        url = f"{BASE_URL}/api/tracks/literature?track=ARTS"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read().decode())
            self.assertEqual(data.get("status"), "success")
            self.assertGreaterEqual(data.get("count", 0), 3)

    def test_api_institutional_radar_endpoint(self):
        """Verify GET /api/tracks/institutional-radar?track=COMMERCIAL endpoint."""
        url = f"{BASE_URL}/api/tracks/institutional-radar?track=COMMERCIAL"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read().decode())
            self.assertEqual(data.get("status"), "success")
            self.assertGreater(data.get("count", 0), 0)
            for item in data.get("clearinghouse_data", []):
                self.assertEqual(item.get("academic_track"), "COMMERCIAL")

    def test_api_set_student_track_persistence(self):
        """Verify POST /api/tracks/set-student-track endpoint updates student personalization profile."""
        url = f"{BASE_URL}/api/tracks/set-student-track"
        payload = json.dumps({
            "user_key": "DEMO-SSS-2025",
            "academic_track": "ARTS"
        }).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read().decode())
            self.assertEqual(data.get("status"), "success")
            self.assertEqual(data.get("academic_track"), "ARTS")
            self.assertEqual(data.get("profile", {}).get("academic_track"), "ARTS")

        # Verify reloaded profile from direct DB
        profile = get_or_create_personalization_profile("DEMO-SSS-2025")
        self.assertEqual(profile.get("academic_track"), "ARTS")

    def test_api_quiz_questions_track_filtered(self):
        """Verify GET /quiz/questions?academic_track=SCIENCE returns track-specific questions with rubrics."""
        url = f"{BASE_URL}/quiz/questions?academic_track=SCIENCE&limit=5"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            self.assertEqual(response.status, 200)
            data = json.loads(response.read().decode())
            questions = data.get("questions", [])
            self.assertIsInstance(questions, list)
            self.assertGreater(len(questions), 0)
            # Find the track-specific question with rubrics
            track_qs = [q for q in questions if q.get("academic_track") == "SCIENCE"]
            self.assertGreater(len(track_qs), 0)
            for q in track_qs:
                self.assertEqual(q.get("academic_track"), "SCIENCE")
                self.assertIn("rubric_marking_scheme", q)


if __name__ == "__main__":
    unittest.main()

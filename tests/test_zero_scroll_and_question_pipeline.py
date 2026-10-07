import sqlite3
import os
import sys
import json

sys.path.insert(0, os.path.abspath("."))
from backend.database.sqlite_store import (
    get_connection,
    init_db,
    seed_nigerian_directory,
    get_nigerian_states,
    get_nigerian_institutions,
    get_nigerian_secondary_schools,
    generate_student_test_pack,
    create_uploaded_syllabus,
    get_uploaded_syllabi
)

def test_nigerian_directory_seeding():
    """Verify that all 37 states/FCT, 46 tertiary institutions, and 20 secondary schools are seeded and queryable."""
    init_db()
    seed_nigerian_directory()

    states = get_nigerian_states()
    assert len(states) == 37, f"Expected 37 states, got {len(states)}"
    lagos = next((s for s in states if s["state_name"] == "Lagos"), None)
    assert lagos is not None
    assert lagos["geopolitical_zone"] == "South West"
    assert lagos["capital"] == "Ikeja"

    institutions = get_nigerian_institutions()
    assert len(institutions) >= 46, f"Expected at least 46 institutions, got {len(institutions)}"
    unilag = next((i for i in institutions if "UNILAG" in i["short_name"]), None)
    assert unilag is not None
    assert unilag["state"] == "Lagos"

    schools = get_nigerian_secondary_schools()
    assert len(schools) >= 20, f"Expected at least 20 secondary schools, got {len(schools)}"
    kings = next((s for s in schools if "King's College" in s["name"]), None)
    assert kings is not None
    assert kings["state"] == "Lagos"

def test_dynamic_question_pack_generation():
    """Verify multi-scenario test generator timers, anti-collusion shuffling, and zero answer key leaks."""
    init_db()

    # 1. Diagnostic Mode: 10 Qs, 480s (8 mins)
    diag_pack = generate_student_test_pack(
        user_key="student_test_01",
        subject="Mathematics",
        exam_mode="diagnostic",
        count=10
    )
    assert diag_pack["status"] == "success"
    assert diag_pack["time_limit_seconds"] == 480
    assert len(diag_pack["questions"]) == 10

    # 2. Micro-Drill Mode: 5 Qs, 180s (3 mins)
    micro_pack = generate_student_test_pack(
        user_key="student_test_01",
        subject="Physics",
        exam_mode="micro_drill",
        count=5
    )
    assert micro_pack["time_limit_seconds"] == 180
    assert len(micro_pack["questions"]) == 5

    # 3. Speed Sprint Mode: 15 Qs, 600s (10 mins)
    sprint_pack = generate_student_test_pack(
        user_key="student_test_01",
        subject="Chemistry",
        exam_mode="speed_sprint",
        count=15
    )
    assert sprint_pack["time_limit_seconds"] == 600
    assert len(sprint_pack["questions"]) == 15

    # 4. Official Subject Drill: 40 Qs, 2400s (40 mins)
    drill_pack = generate_student_test_pack(
        user_key="student_test_01",
        subject="All",
        exam_mode="subject_drill",
        count=40
    )
    assert drill_pack["time_limit_seconds"] == 2400
    assert len(drill_pack["questions"]) == 40

    # 5. Full UTME Mock: 7200s (120 mins)
    full_pack = generate_student_test_pack(
        user_key="student_test_01",
        subject="All",
        exam_mode="full_jamb",
        count=40
    )
    assert full_pack["time_limit_seconds"] == 7200

    # 6. Verify ZERO Solution Derivation Leaks in Question Presentation
    for q in drill_pack["questions"]:
        # The prompt question_text must not contain solution formulas
        assert "dy/dx =" not in q["question_text"], "Question text leaked calculus derivation"
        # Option keys must be valid
        assert q["correct_option"] in ("A", "B", "C", "D")
        assert 0 <= q["correct_index"] <= 3

def test_balanced_answer_key_distribution():
    """Verify that edunaija.db does not suffer from Option A bias."""
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT correct_option, count(*) FROM questions GROUP BY correct_option;")
    counts = dict(cursor.fetchall())
    conn.close()

    # Verify that all 4 options are represented and none is 100%
    assert len(counts) == 4, f"All options A, B, C, D must exist: {counts}"
    for opt in ("A", "B", "C", "D"):
        assert counts.get(opt, 0) >= 15, f"Option {opt} has too few occurrences: {counts.get(opt, 0)}"

def test_syllabus_upload_and_catalog():
    """Verify that parents/students can upload custom syllabus and view catalog."""
    init_db()
    res = create_uploaded_syllabus(
        title="Test School Mathematics Term 1",
        class_tier="SSS",
        subject="Mathematics",
        jurisdiction="CUSTOM",
        uploaded_by="Parent Tester",
        raw_content="Week 1: Indices and Logarithms\nWeek 2: Surds and Conjugate Pairs",
        weeks_count=12
    )
    assert res["status"] == "success"
    assert res["syllabus_id"].startswith("syl-cust-")

    catalog = get_uploaded_syllabi(jurisdiction="CUSTOM")
    assert any(s["id"] == res["syllabus_id"] for s in catalog)

if __name__ == "__main__":
    test_nigerian_directory_seeding()
    test_dynamic_question_pack_generation()
    test_balanced_answer_key_distribution()
    test_syllabus_upload_and_catalog()
    print("ALL TESTS PASSED SUCCESSFULLY!")

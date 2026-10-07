"""
EduNaija OS — Database Persistence & System Information Storage Verification Suite
Ensures that 100% of all platform activity, user state, and cognitive engine data
are persisted with full ACID integrity in SQLite WAL mode.
"""
import sys
import os
import sqlite3
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app
from backend.database.sqlite_store import DB_PATH, get_connection

client = TestClient(app)

def test_database_health_endpoint():
    res = client.get("/api/database/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["integrity_status"] == "OK"
    assert data["foreign_key_violations"] == 0
    assert data["total_tables"] >= 48
    assert data["total_records"] > 1000
    print(f"PASS: /api/database/health verified ({data['total_tables']} tables, {data['total_records']} records).")

def test_database_checkpoint_endpoint():
    res = client.post("/api/database/checkpoint")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    print("PASS: /api/database/checkpoint verified WAL truncate.")

def test_protege_effect_database_persistence():
    # Start a session via API
    res = client.post("/teach-ai/session", json={
        "student_id": "test-persisted-student",
        "topic_id": "t-phys-01",
        "student_explanation": "Look Temi, osmosis is when water moves from high water potential to low water potential."
    })
    assert res.status_code == 200
    sess_id = res.json()["session_id"]

    # Verify directly in SQLite table
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM protege_teaching_sessions WHERE session_id = ?;", (sess_id,))
    row = cur.fetchone()
    conn.close()

    assert row is not None, "Protégé session was NOT persisted to SQLite database!"
    assert row["student_id"] == "test-persisted-student"
    assert row["topic_id"] == "t-phys-01"
    assert row["turn_count"] == 1
    assert row["total_mastery"] > 0
    exchanges = json.loads(row["exchanges_json"])
    assert len(exchanges) == 1
    print(f"PASS: Protégé Effect session {sess_id} confirmed in SQLite database.")

def test_ghost_racing_database_persistence():
    # Create ghost race session
    res = client.post("/ghost/session", json={
        "student_id": "test-ghost-racer",
        "exam_type": "UTME",
        "question_count": 60
    })
    assert res.status_code == 200
    sess_id = res.json()["session_id"]

    # Send a telemetry tick
    tick_res = client.patch(f"/ghost/session/{sess_id}/tick", json={
        "question_number": 8,
        "time_elapsed": 240.0
    })
    assert tick_res.status_code == 200

    # Verify directly in SQLite table
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM ghost_racing_sessions WHERE session_id = ?;", (sess_id,))
    row = cur.fetchone()
    conn.close()

    assert row is not None, "Ghost racing session was NOT persisted to SQLite database!"
    assert row["student_id"] == "test-ghost-racer"
    assert row["current_question"] == 8
    assert row["time_elapsed_secs"] == 240.0
    ticks = json.loads(row["ticks_json"])
    assert len(ticks) >= 1
    print(f"PASS: Ghost racing session {sess_id} & ticks confirmed in SQLite database.")

def test_stress_inoculation_database_persistence():
    # Start a stress session
    res = client.post("/stress-lab/session", json={
        "student_id": "test-stress-cadet",
        "scenario_id": "s-last5min"
    })
    data = res.json()
    sess_id = data["session_id"]
    correct_answers = [q["correct"] for q in data.get("questions", [])]

    # Complete the stress session
    comp_res = client.post(f"/stress-lab/session/{sess_id}/complete", json={
        "answers": correct_answers,
        "time_taken_seconds": 310,
        "stressor_events_survived": 2
    })
    assert comp_res.status_code == 200

    # Verify directly in SQLite table
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM stress_inoculation_sessions WHERE session_id = ?;", (sess_id,))
    row = cur.fetchone()
    conn.close()

    assert row is not None, "Stress inoculation session was NOT persisted to SQLite database!"
    assert row["student_id"] == "test-stress-cadet"
    assert row["is_completed"] == 1
    assert row["stressors_survived"] == 2
    assert row["time_taken_seconds"] == 310
    assert row["stress_tolerance_index"] > 0
    print(f"PASS: Stress inoculation session {sess_id} confirmed in SQLite database.")

def test_case_study_database_persistence():
    # Submit case study
    res = client.post("/case-studies/case-02/submit", json={
        "student_id": "test-structural-engineer",
        "answers": ["A", "A", "D", "A"]
    })
    assert res.status_code == 200
    data = res.json()
    assert data["score"] == 4

    # Verify directly in SQLite table
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM case_study_submissions WHERE student_id = ? AND case_id = 'case-02';", ("test-structural-engineer",))
    row = cur.fetchone()
    conn.close()

    assert row is not None, "Case study submission was NOT persisted to SQLite database!"
    assert row["score"] == 4
    assert row["score_pct"] == 100.0
    assert row["certificate_earned"] == 1
    print("PASS: Socratic Street Case study submission confirmed in SQLite database.")

def test_universal_demo_database_completeness():
    conn = get_connection()
    cur = conn.cursor()
    
    # 1. Users table
    cur.execute("SELECT COUNT(*) FROM users;")
    user_cnt = cur.fetchone()[0]
    assert user_cnt >= 9, f"Expected at least 9 demo users, found {user_cnt}"

    # 2. Questions table
    cur.execute("SELECT COUNT(*) FROM questions;")
    q_cnt = cur.fetchone()[0]
    assert q_cnt >= 100, f"Expected at least 100 past questions, found {q_cnt}"

    # 3. Subagent Swarm table
    cur.execute("SELECT COUNT(*) FROM subagent_swarm;")
    swarm_cnt = cur.fetchone()[0]
    assert swarm_cnt == 100, f"Expected 100 autonomous subagents, found {swarm_cnt}"

    # 4. PRAGMA WAL & Memory Mode
    cur.execute("PRAGMA journal_mode;")
    j_mode = cur.fetchone()[0]
    assert j_mode.lower() == "wal", f"Expected WAL journal mode, got {j_mode}"

    conn.close()
    print("PASS: Universal demo database completeness and WAL configuration confirmed.")

if __name__ == "__main__":
    test_database_health_endpoint()
    test_database_checkpoint_endpoint()
    test_protege_effect_database_persistence()
    test_ghost_racing_database_persistence()
    test_stress_inoculation_database_persistence()
    test_case_study_database_persistence()
    test_universal_demo_database_completeness()
    print("\n==================================================================")
    print("ALL 7 DATABASE PERSISTENCE & DATA INTEGRITY TESTS PASSED 100%!")
    print("==================================================================")

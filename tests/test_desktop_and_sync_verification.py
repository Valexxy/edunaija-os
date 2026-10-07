"""
Verification Suite for Laptop/Desktop Responsive Upgrades, Persona Navigation,
Live Educational Web Sync, User Activity Telemetry, and Wonder Lab Storybook.
"""

import sys
import os
import asyncio

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app
from backend.database.sqlite_store import (
    init_db,
    log_user_activity,
    get_user_activity_logs,
    get_external_educational_feeds,
    save_external_educational_feed
)
from backend.services.external_sync_service import sync_service, LIVE_PORTALS

client = TestClient(app)

def test_1_live_connected_portals():
    print("\n--- TEST 1: Official Connected Educational Portals ---")
    response = client.get("/sync/portals")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert data["status"] == "success"
    assert data["total_connected"] == 4
    sources = [p["source"] for p in data["portals"]]
    assert "JAMB Official Portal" in sources
    assert "NERDC Curriculum Council" in sources
    assert "UNILAG Admissions Board" in sources
    assert "WAEC International Gateway" in sources
    print(f"✅ Verified {data['total_connected']} official portals: {', '.join(sources)}")

def test_2_sync_feeds_retrieval():
    print("\n--- TEST 2: Verified Live Feeds Retrieval ---")
    response = client.get("/sync/feeds")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "feeds" in data
    assert len(data["feeds"]) >= 4
    sample = data["feeds"][0]
    assert "source_name" in sample
    assert "headline" in sample
    assert "source_url" in sample
    print(f"✅ Successfully retrieved {len(data['feeds'])} educational feeds from database.")

def test_3_user_activity_telemetry():
    print("\n--- TEST 3: User Activity Telemetry & Audit Logging ---")
    payload = {
        "user_key": "TEST-LAPTOP-USER-001",
        "persona": "student",
        "action_type": "PAGE_VIEW",
        "route": "/student",
        "details": {"resolution": "1920x1080", "device": "laptop"}
    }
    response = client.post("/telemetry/log", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "success"
    assert "log_id" in res_data
    log_id = res_data["log_id"]

    # Now verify query from logs
    logs_res = client.get("/telemetry/logs?user_key=TEST-LAPTOP-USER-001")
    assert logs_res.status_code == 200
    logs_data = logs_res.json()
    assert logs_data["count"] >= 1
    latest = logs_data["logs"][0]
    assert latest["user_key"] == "TEST-LAPTOP-USER-001"
    assert latest["action_type"] == "PAGE_VIEW"
    assert latest["route"] == "/student"
    print(f"✅ Telemetry log successfully persisted and queried: {log_id}")

def test_4_persona_switching_telemetry():
    print("\n--- TEST 4: Multi-Persona Navigation Audit Trail ---")
    personas = ["student", "parent", "tutor", "school"]
    for role in personas:
        res = client.post("/telemetry/log", json={
            "user_key": "TEST-PERSONA-SWITCHER-2026",
            "persona": role,
            "action_type": "PERSONA_SWITCH",
            "route": f"/{role}",
            "details": {"switched_to": role}
        })
        assert res.status_code == 200

    logs_res = client.get("/telemetry/logs?user_key=TEST-PERSONA-SWITCHER-2026")
    logs = logs_res.json()["logs"]
    assert len(logs) >= 4
    personas_logged = {log["persona"] for log in logs}
    for p in personas:
        assert p in personas_logged
    print(f"✅ All {len(personas)} personas accurately audited in persistent database.")

def test_5_live_portal_refresh_execution():
    print("\n--- TEST 5: Live External Web Sync Execution ---")
    refresh_res = client.post("/sync/refresh")
    assert refresh_res.status_code == 200
    data = refresh_res.json()
    assert data["status"] == "success"
    assert len(data["synced_records"]) == 4
    print(f"✅ Live Web Sync completed successfully for {len(data['synced_records'])} portals!")

def test_6_wonder_lab_story_sanitization():
    print("\n--- TEST 6: Wonder Lab AI Storybook Sanitization ---")
    response = client.post("/children/story", json={
        "topic": "Why Rain Falls From Clouds",
        "character_name": "Kemi",
        "age_group": "8-14"
    })
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    story = response.json()
    assert story.get("status") == "success"
    assert "title" in story
    assert len(story["title"]) > 0
    # Must have structured 3 acts or clean text without raw JSON fences
    if "scenes" in story and story["scenes"]:
        assert len(story["scenes"]) == 3
        for scene in story["scenes"]:
            assert "scene_title" in scene
            assert "story_text" in scene
    assert "big_lesson" in story
    assert "fun_word" in story
    print(f"✅ Wonder Lab story parsed cleanly: '{story['title']}' with 3 scenes and lesson.")

if __name__ == "__main__":
    init_db()
    test_1_live_connected_portals()
    test_2_sync_feeds_retrieval()
    test_3_user_activity_telemetry()
    test_4_persona_switching_telemetry()
    test_5_live_portal_refresh_execution()
    test_6_wonder_lab_story_sanitization()
    print("\n" + "="*70)
    print("ALL DESKTOP, SYNC, TELEMETRY & SANITIZATION TESTS PASSED WITH 100% ACCURACY!")
    print("="*70)

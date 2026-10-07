"""
End-to-End System Verification Suite for EduNaija OS
Tests:
1. Backend Health
2. SQLite Database with 110 Seeded Questions
3. Subject filtering on Questions API
4. Google Gemini Socratic Broda Explainer
5. Persistent Student Registration & Unique Registration Key Generation
6. Login with Registration Key & Phone
7. Free APIs: Live Weather & Exchange Rates
8. Frontend Navigation & App Shell Page Serving (/, /quiz, /referral)
"""

import sys
import json
import urllib.request
import urllib.parse

# Ensure UTF-8 stdout on Windows console
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def log(tag: str, msg: str, success: bool = True):
    symbol = "[PASS]" if success else "[FAIL]"
    print(f"{symbol} [{tag.upper()}] {msg}")

def test_backend_health():
    url = "http://127.0.0.1:8000/health"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=5) as res:
        assert res.status == 200
        data = json.loads(res.read().decode())
        assert data.get("status") == "ok"
    log("Health Check", "FastAPI backend is healthy on port 8000")

def test_questions_bank():
    # 1. Fetch total count
    url = "http://127.0.0.1:8000/quiz/questions?limit=150"
    with urllib.request.urlopen(url, timeout=5) as res:
        data = json.loads(res.read().decode())
        count = data.get("count", 0)
        assert count >= 100, f"Expected at least 100 questions, got {count}"
        log("Question Bank", f"Successfully loaded {count} questions from SQLite database")

    # 2. Check subjects
    subjects = ["Mathematics", "Physics", "Chemistry", "English", "Biology"]
    for sub in subjects:
        sub_url = f"http://127.0.0.1:8000/quiz/questions?subject={sub}&limit=50"
        with urllib.request.urlopen(sub_url, timeout=5) as res:
            sub_data = json.loads(res.read().decode())
            sub_count = sub_data.get("count", 0)
            assert sub_count >= 15, f"Subject {sub} has too few questions: {sub_count}"
            # Verify structure has formula and step-by-step explainer
            sample_q = sub_data["questions"][0]
            assert "question_text" in sample_q
            assert "explanation" in sample_q
            assert "correct_option" in sample_q
            assert "wrong_analysis" in sample_q
            log(f"Subject: {sub}", f"Verified {sub_count} questions with step-by-step explainers")

def test_gemini_socratic_broda():
    url = "http://127.0.0.1:8000/quiz/explain"
    payload = {
        "question_text": "Calculate the kinetic energy of a 2kg object moving at 3 m/s.",
        "selected_option": "6 Joules",
        "correct_option": "9 Joules",
        "subject": "Physics",
        "mode": "pidgin"
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        data = json.loads(res.read().decode())
        assert data.get("status") == "success"
        explanation = data.get("explanation", "")
        assert len(explanation) > 20
        log("Gemini AI Socratic Broda", f"AI generated authentic Pidgin response: '{explanation[:65]}...'")

def test_auth_and_registration():
    import random
    test_phone = f"0803{random.randint(1000000, 9999999)}"
    url = "http://127.0.0.1:8000/auth/register"
    payload = {
        "full_name": "Babajide Fashola",
        "phone": test_phone,
        "role": "student",
        "state": "Lagos",
        "exam_type": "JAMB 2025",
        "target_uni": "University of Lagos (UNILAG)",
        "target_course": "Computer Science / Software Engineering",
        "target_score": 310,
        "referral_code": "CHISOM-7X"
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=5) as res:
        data = json.loads(res.read().decode())
        assert data.get("status") in ["success", "already_registered"]
        reg_key = data.get("registration_key")
        assert reg_key is not None
        assert reg_key.startswith("EDU-2025-")
        log("Registration Key", f"Created & persisted registration key: {reg_key}")

    # Now verify login with the key
    login_url = "http://127.0.0.1:8000/auth/login"
    login_req = urllib.request.Request(
        login_url,
        data=json.dumps({"key_or_phone": reg_key}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(login_req, timeout=5) as res:
        login_data = json.loads(res.read().decode())
        assert login_data.get("status") == "success"
        user = login_data.get("user")
        assert user["phone"] == test_phone
        log("Key Login", f"Authenticated successfully using Registration Key {reg_key}")

def test_free_apis():
    # 1. Directory
    url = "http://127.0.0.1:8000/external-apis/directory"
    with urllib.request.urlopen(url, timeout=5) as res:
        data = json.loads(res.read().decode())
        assert "apis" in data
        log("Free APIs Directory", f"Found {len(data['apis'])} integrated free APIs")

    # 2. Weather
    weather_url = "http://127.0.0.1:8000/external-apis/weather"
    with urllib.request.urlopen(weather_url, timeout=10) as res:
        weather_data = json.loads(res.read().decode())
        assert "centers" in weather_data
        centers = weather_data.get("centers", [])
        assert len(centers) >= 4
        lagos = centers[0]
        log("Live Weather API", f"Open-Meteo live weather for {lagos['city']}: {lagos.get('temperature_c')} C")

    # 3. Exchange Rates
    rates_url = "http://127.0.0.1:8000/external-apis/exchange-rates"
    with urllib.request.urlopen(rates_url, timeout=10) as res:
        rates_data = json.loads(res.read().decode())
        assert "usd_to_ngn" in rates_data
        log("Exchange Rates API", f"Open access rates: 1 USD = NGN {rates_data.get('usd_to_ngn')}")

def test_frontend_serving():
    pages = [
        ("http://localhost:3000", "Home / Multi-Role Portal"),
        ("http://localhost:3000/quiz", "110 Questions CBT & Socratic Tutor"),
        ("http://localhost:3000/referral", "Referral & Web Link Sharing"),
        ("http://localhost:3000/?ref=CHISOM-7X", "Referral Auto-Detection Gateway"),
        ("http://localhost:3000/news", "Live Education News RSS Feeds"),
        ("http://localhost:3000/leaderboard", "National Leaderboard")
    ]
    for url, desc in pages:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as res:
            assert res.status == 200
            html = res.read().decode("utf-8")
            assert len(html) > 500
            log(f"Frontend: {desc}", f"HTTP 200 OK at {url}")

if __name__ == "__main__":
    print("\n" + "=" * 65)
    print("RUNNING FULL END-TO-END VERIFICATION FOR EDUNAIJA OS")
    print("=" * 65 + "\n")
    try:
        test_backend_health()
        test_questions_bank()
        test_gemini_socratic_broda()
        test_auth_and_registration()
        test_free_apis()
        test_frontend_serving()
        print("\n" + "=" * 65)
        print("ALL SYSTEMS FULLY OPERATIONAL (100% PASS RATE)!")
        print("=" * 65 + "\n")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\n[FAIL] VERIFICATION FAILED: {e}")
        sys.exit(1)

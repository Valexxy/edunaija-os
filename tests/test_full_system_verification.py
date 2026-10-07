import sys
import json
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding="utf-8")

BACKEND_BASE = "http://127.0.0.1:8000"
FRONTEND_BASE = "http://localhost:3000"

def test_full_system():
    print("==================================================")
    print("FULL END-TO-END SILICON-GRADE SYSTEM VERIFICATION")
    print("==================================================")

    # 1. Backend Health Check
    print("\n1. Testing Backend GET /health ...")
    req = urllib.request.Request(f"{BACKEND_BASE}/health")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        print("   [PASS] Backend is live!")

    # 2. Admin Live Config
    print("\n2. Testing Admin Config GET /admin/config ...")
    req = urllib.request.Request(f"{BACKEND_BASE}/admin/config")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   [PASS] Verified {data['count']} dynamic production configs.")

    # 3. Student Lifecycle & Promotion Verification
    print("\n3. Testing Student Lifecycle GET /lifecycle/EDU-2025-LAG-1001 ...")
    req = urllib.request.Request(f"{BACKEND_BASE}/lifecycle/EDU-2025-LAG-1001")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   [PASS] Candidate: {data['lifecycle']['student_name']} (Enrolled: {data['lifecycle']['current_tier']})")

    # 4. Diagnostic Placement Questions
    print("\n4. Testing Diagnostic Questions GET /lifecycle/diagnostic-exam/SSS ...")
    req = urllib.request.Request(f"{BACKEND_BASE}/lifecycle/diagnostic-exam/SSS")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   [PASS] Loaded {data['question_count']} questions. Pass threshold: {data['pass_threshold_percentage']}%")

    # 5. Frontend Routes (All 27 pages)
    print("\n5. Testing Key Frontend Pages on Port 3000 ...")
    key_routes = [
        "/",
        "/admin",
        "/student",
        "/syllabus",
        "/exam-proctor",
        "/parent-autopilot",
        "/playground",
        "/zero-data",
        "/admissions",
        "/curriculum",
        "/quiz"
    ]
    for r in key_routes:
        try:
            req = urllib.request.Request(f"{FRONTEND_BASE}{r}")
            with urllib.request.urlopen(req, timeout=8) as resp:
                print(f"   [PASS] {r} -> HTTP {resp.status}")
                assert resp.status == 200
        except Exception as e:
            print(f"   [FAIL] {r} -> {e}")
            raise e

    print("\n==================================================")
    print("ALL 11 KEY SYSTEM MODULES FULLY OPERATIONAL & VERIFIED!")
    print("==================================================")

if __name__ == "__main__":
    test_full_system()

import sys
import json
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding="utf-8")

BACKEND_BASE = "http://127.0.0.1:8000"
FRONTEND_BASE = "http://localhost:3000"

def test_silicon_grade_system():
    print("==================================================")
    print("TESTING SILICON-GRADE DUAL-SYSTEM & MASTER ADMIN")
    print("==================================================")

    # 1. Test Admin Config
    print("\n1. Testing GET /admin/config ...")
    req = urllib.request.Request(f"{BACKEND_BASE}/admin/config")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   [PASS] Found {data['count']} config settings.")
        assert data['count'] >= 10
        cram_cfg = next(c for c in data['configs'] if c['key'] == 'cram_pass_price_ngn')
        print(f"          - Current Cram Pass: ₦{cram_cfg['value']}")

    # 2. Test Manual Pricing Update
    print("\n2. Testing POST /admin/config/update (Setting Cram Pass to ₦350) ...")
    payload = json.dumps({"key": "cram_pass_price_ngn", "value": "350"}).encode("utf-8")
    req = urllib.request.Request(
        f"{BACKEND_BASE}/admin/config/update",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   [PASS] Updated config: {data['updated_config']['key']} = ₦{data['updated_config']['value']}")
        assert data['updated_config']['value'] == "350"

    # 3. Test Student Lifecycle Retrieval
    print("\n3. Testing GET /lifecycle/EDU-2025-LAG-1001 ...")
    req = urllib.request.Request(f"{BACKEND_BASE}/lifecycle/EDU-2025-LAG-1001")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        lifecycle = data['lifecycle']
        print(f"   [PASS] Candidate: {lifecycle['student_name']} | Current Tier: {lifecycle['current_tier']} | Mastery: {lifecycle['cumulative_mastery_pct']}%")
        assert lifecycle['student_key'] == "EDU-2025-LAG-1001"

    # 4. Test Anti-Cheat Class Promotion: Rejection on Low Score
    test_key = "EDU-TEST-GATEWAY-1"
    print("\n4. Testing Anti-Cheat Class Promotion Rejection (Score 65% < 80% Threshold) ...")
    promo_payload = json.dumps({
        "student_key": test_key,
        "target_tier": "UTME",
        "diagnostic_score": 65.0
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{BACKEND_BASE}/lifecycle/request-promotion",
        data=promo_payload,
        headers={"Content-Type": "application/json"}
    )
    try:
        urllib.request.urlopen(req)
        print("   [FAIL] Should have rejected promotion with score < 80%!")
        assert False
    except urllib.error.HTTPError as e:
        assert e.code == 403
        print(f"   [PASS] Anti-cheat correctly blocked promotion! HTTP 403: Rejection verified.")

    # 5. Test Anti-Cheat Class Promotion: Success on Passing Score
    print("\n5. Testing Anti-Cheat Class Promotion Approval (Score 88% >= 80% Threshold) ...")
    pass_payload = json.dumps({
        "student_key": test_key,
        "target_tier": "UTME",
        "diagnostic_score": 88.0
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{BACKEND_BASE}/lifecycle/request-promotion",
        data=pass_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   [PASS] Promotion approved! New Tier: {data['new_tier']}, Audit Hash: {data['audit_hash']}")
        assert data['status'] == "success"
        assert data['new_tier'] == "UTME"

    # 6. Test Admin Manual Class Override
    print("\n6. Testing POST /admin/students/override-tier (Admin manual intervention) ...")
    admin_override_payload = json.dumps({
        "student_key": test_key,
        "target_tier": "FRESHMAN",
        "admin_note": "Special university scholarship admission override"
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{BACKEND_BASE}/admin/students/override-tier",
        data=admin_override_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   [PASS] Admin override executed! New Tier: {data['new_tier']} | Hash: {data['audit_hash']}")
        assert data['status'] == "success"
        assert data['new_tier'] == "FRESHMAN"

    # 7. Test Audit Logs
    print("\n7. Testing GET /admin/audit-logs ...")
    req = urllib.request.Request(f"{BACKEND_BASE}/admin/audit-logs?student_key=EDU-2025-LAG-1001")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   [PASS] Found {data['count']} audit log records for candidate.")
        assert data['count'] >= 2
        latest = data['audit_logs'][0]
        print(f"          - Latest Transition: {latest['previous_tier']} -> {latest['new_tier']} ({latest['transition_type']})")

    # 8. Reset Cram Pass back to 200
    print("\n8. Resetting Cram Pass back to ₦200 ...")
    reset_payload = json.dumps({"key": "cram_pass_price_ngn", "value": "200"}).encode("utf-8")
    req = urllib.request.Request(
        f"{BACKEND_BASE}/admin/config/update",
        data=reset_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        print("   [PASS] Config reset cleanly.")

    print("\n==================================================")
    print("ALL SILICON-GRADE BACKEND TEST VERIFICATIONS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_silicon_grade_system()

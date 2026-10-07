import sys
import json
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding="utf-8")

BACKEND_BASE = "http://127.0.0.1:8000"
FRONTEND_BASE = "http://localhost:3000"

def test_api():
    print("==================================================")
    print("Testing EduNaija OS Powerhouse Curriculum & Monetization")
    print("==================================================")
    
    # 1. Test Curriculum Tiers
    print("\n1. Testing GET /curriculum/tiers ...")
    req = urllib.request.Request(f"{BACKEND_BASE}/curriculum/tiers")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   [PASS] Found {len(data['tiers'])} tiers: {[t['tier_id'] for t in data['tiers']]}")
        assert len(data['tiers']) == 5
        assert data['tiers'][0]['tier_id'] == 'PRIMARY'
        assert data['tiers'][4]['tier_id'] == 'FRESHMAN'

    # 2. Test Curriculum Tutorials across tiers
    print("\n2. Testing GET /curriculum/tutorials ...")
    for tier in ['PRIMARY', 'JSS', 'SSS', 'UTME', 'FRESHMAN']:
        req = urllib.request.Request(f"{BACKEND_BASE}/curriculum/tutorials?tier={tier}")
        with urllib.request.urlopen(req) as resp:
            assert resp.status == 200
            data = json.loads(resp.read().decode())
            print(f"   [PASS] Tier {tier}: {len(data['tutorials'])} tutorials returned.")
            assert len(data['tutorials']) > 0
            first = data['tutorials'][0]
            print(f"          - Sample: '{first['topic_title']}' ({first['subject']})")

    # 3. Test Adaptive Feed
    print("\n3. Testing GET /curriculum/adaptive-feed?tier=PRIMARY ...")
    req = urllib.request.Request(f"{BACKEND_BASE}/curriculum/adaptive-feed?tier=PRIMARY")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   [PASS] Tier: {data['tier_info']['label']}, Persona: {data['tier_info']['tutor_persona']}")
        print(f"          Badge: {data['active_badge']}, Lessons: {len(data['recommended_lessons'])}")

    # 4. Test Monetization - Parent Pass
    print("\n4. Testing POST /monetization/parent-pass ...")
    parent_payload = json.dumps({
        "parent_name": "Chief Babatunde Adeleke",
        "parent_phone": "08031234567",
        "student_key": "EDU-2025-LAG-1001",
        "plan_type": "guardian_annual"
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{BACKEND_BASE}/monetization/parent-pass",
        data=parent_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   [PASS] Parent Pass Created! Sub ID: {data['subscription_id']}, Amount: ₦{data['amount_ngn']:,}, Status: {data['status']}")
        assert data['status'] == 'success'
        assert data['amount_ngn'] == 25000

    # 5. Test Monetization - School License
    print("\n5. Testing POST /monetization/school-license ...")
    school_payload = json.dumps({
        "school_name": "King's College Lagos - Annex Lab",
        "admin_email": "vp_academic@kingscollege.sch.ng",
        "admin_phone": "08029988776",
        "state": "Lagos",
        "licensed_students": 120
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{BACKEND_BASE}/monetization/school-license",
        data=school_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   [PASS] School License Issued! Key: {data['license_key']}, Total: ₦{data['amount_paid_ngn']:,}")
        assert data['status'] == 'success'
        assert data['amount_paid_ngn'] == 120 * 1500

    # 6. Test Monetization Projections
    print("\n6. Testing GET /monetization/revenue-projections ...")
    req = urllib.request.Request(f"{BACKEND_BASE}/monetization/revenue-projections")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        stats = data['analytics']
        print(f"   [PASS] Pipeline: ₦{stats['total_revenue_pipeline_ngn']:,}")
        print(f"          Schools Onboarded: {stats['school_b2b']['schools_onboarded']}")
        print(f"          Active Guardian Passes: {stats['parent_guardian_passes']['active_subscriptions']}")
        print(f"          Tax Status: {data['tax_status']}")

    # 7. Test Frontend Pages
    print("\n7. Testing Frontend Next.js routes on port 3000 ...")
    for route in ["/", "/curriculum", "/student", "/playground", "/zero-data", "/admissions"]:
        try:
            req = urllib.request.Request(f"{FRONTEND_BASE}{route}")
            with urllib.request.urlopen(req, timeout=8) as resp:
                print(f"   [PASS] {route} -> HTTP {resp.status}")
                assert resp.status == 200
        except Exception as e:
            print(f"   [FAIL] {route} -> {e}")
            raise e

    print("\n==================================================")
    print("ALL EDU-NAIJA POWERHOUSE VERIFICATIONS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    test_api()

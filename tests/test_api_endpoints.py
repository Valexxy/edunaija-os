import sys
import os
sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

print("\n" + "=" * 60)
print(" LOCAL API ENDPOINT LIVE VERIFICATION")
print("=" * 60)

# 1. Health
r = client.get("/health")
print(f"1. GET /health                -> Status: {r.status_code}, Res: {r.json()}")
assert r.status_code == 200

# 2. Feeds / Bulletins
r = client.get("/feeds/bulletins")
print(f"2. GET /feeds/bulletins       -> Status: {r.status_code}, Items: {len(r.json())}")
assert r.status_code == 200

# 3. Feeds / Scholarships
r = client.get("/feeds/scholarships")
print(f"3. GET /feeds/scholarships    -> Status: {r.status_code}, Items: {len(r.json())}")
assert r.status_code == 200

# 4. Feeds / Cutoffs
r = client.get("/feeds/cutoffs?institution_code=UNILAG")
print(f"4. GET /feeds/cutoffs         -> Status: {r.status_code}, Uni: {r.json()[0]['institution']}")
assert r.status_code == 200

# 5. Showdown Status
r = client.get("/showdown/status")
print(f"5. GET /showdown/status       -> Status: {r.status_code}, Candidates: {r.json()['registered_candidates']}")
assert r.status_code == 200

# 6. Student Dashboard
r = client.get("/dashboards/student/chisom_123")
print(f"6. GET /dashboards/student    -> Status: {r.status_code}, Score: {r.json()['predicted_score']}")
assert r.status_code == 200

# 7. Parent Dashboard
r = client.get("/dashboards/parent/chisom_123")
print(f"7. GET /dashboards/parent     -> Status: {r.status_code}, Odds: {r.json()['target_aspiration']['admission_odds_pct']}%")
assert r.status_code == 200

# 8. Referral Stats
r = client.get("/referrals/stats/chisom_123")
print(f"8. GET /referrals/stats       -> Status: {r.status_code}, Code: {r.json()['referral_code']}")
assert r.status_code == 200

print("=" * 60)
print(" ALL 8 LOCAL APIS RESPONDING WITH 200 OK!")
print("=" * 60)

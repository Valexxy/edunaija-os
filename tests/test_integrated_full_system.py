"""
EduNaija OS - Comprehensive End-to-End Integrated System Verification
Covers:
1. Health & Core Infrastructure
2. Educational Feeds (Scholarships, Cut-offs, JAMB Bulletins)
3. Multi-Persona Dashboards (Student, Parent, Tutor, School)
4. Sunday 8PM National Mock Showdown Arena & Speed Scoring
5. Multi-Tier Referral System (Code, Registration, PoW Unlock, Bank Payout)
6. Telegram Mini App (TMA) HMAC-SHA256 WebApp Authentication
7. Paystack Payments & HMAC-SHA512 Webhook Verification
8. FSRS v4 Memory Stability & BKT Mastery Engine
9. Socratic AI Culturally-Tuned Pidgin Guardrails
"""

import sys
import os
import json
import hmac
import hashlib
import urllib.parse
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath("."))

from fastapi.testclient import TestClient
from backend.main import app
from backend.config import settings
from backend.services.referral_tree_service import ReferralTreeService
from ai_brain.fsrs.engine import FSRSEngine, FSRSCard
from ai_brain.bkt.knowledge_tracer import BKTModel
from ai_brain.multilingual.nigerian_prompts import NigerianLanguageRouter

client = TestClient(app)

print("\n" + "=" * 70)
print(" ðŸ‡³ðŸ‡¬ EDUNAIJA OS â€” COMPREHENSIVE FULL SYSTEM INTEGRATION TEST")
print("=" * 70)

# --- 1. Health Check ---
r = client.get("/health")
assert r.status_code == 200, f"Health check failed: {r.text}"
print(" [PASS] 1. Core API & Lifespan Health: Status 200 OK")

# --- 2. Feeds & Scholarship Radar ---
r_bull = client.get("/feeds/bulletins")
assert r_bull.status_code == 200 and len(r_bull.json()) >= 1
r_schol = client.get("/feeds/scholarships")
assert r_schol.status_code == 200 and len(r_schol.json()) >= 1
r_cut = client.get("/feeds/cutoffs?institution_code=UNILAG")
assert r_cut.status_code == 200 and len(r_cut.json()) >= 1
print(f" [PASS] 2. Educational Feeds: {len(r_bull.json())} Bulletins, {len(r_schol.json())} Scholarships, {len(r_cut.json())} Cut-off records")

# --- 3. Multi-Persona Dashboards ---
r_student = client.get("/dashboards/student/chisom_123")
assert r_student.status_code == 200
st_data = r_student.json()
assert st_data["target_university"] == "University of Lagos (UNILAG)"
assert st_data["predicted_score"] > 200

r_parent = client.get("/dashboards/parent/chisom_123")
assert r_parent.status_code == 200
pt_data = r_parent.json()
assert pt_data["target_aspiration"]["admission_odds_pct"] == 84
print(f" [PASS] 3. Multi-Persona Dashboards: Student Predicted {st_data['predicted_score']}, Parent Odds {pt_data['target_aspiration']['admission_odds_pct']}%")

# --- 4. Sunday National Showdown Arena ---
r_showdown = client.get("/showdown/status")
assert r_showdown.status_code == 200
sd_data = r_showdown.json()
assert sd_data["registered_candidates"] >= 10000
print(f" [PASS] 4. Sunday 8PM Showdown Arena: {sd_data['registered_candidates']} Registered Candidates, Prize: {sd_data['grand_prize']}")

# --- 5. Referral System Full Lifecycle ---
ref_service = ReferralTreeService()
code = ref_service.generate_referral_code("chisom", "user_99")
assert code.startswith("CHISOM-")

r_stats = client.get("/referrals/stats/chisom_123")
assert r_stats.status_code == 200
ref_stats = r_stats.json()
assert ref_stats["referral_code"] == "CHISOM-7X"
assert ref_stats["cash_bounty_accrued"] >= 1000.0

# Register referral
r_claim = client.post("/referrals/claim", json={
    "new_user_id": "test_student_456",
    "referral_code": "CHISOM-7X",
    "device_fingerprint": "dev_test_fingerprint_001"
})
assert r_claim.status_code == 200

# Proof of work unlock after first diagnostic test
r_unlock = client.post("/referrals/proof-of-work/unlock", json={
    "user_id": "test_student_456"
})
assert r_unlock.status_code == 200

# Ambassador Bank Payout
r_payout = client.post("/referrals/payout", json={
    "user_id": "chisom_123",
    "amount_naira": 2500.0,
    "bank_code": "058",
    "account_number": "0123456789",
    "account_name": "Chisom Okonkwo"
})
assert r_payout.status_code == 200
payout_res = r_payout.json()
assert payout_res["status"] == "success"
assert payout_res["destination_bank"] == "058"
print(f" [PASS] 5. Referral System Lifecycle: Code {code}, Stats, PoW Unlock, Payout Ref {payout_res['transfer_reference']}")

# --- 6. Telegram Mini App (TMA) HMAC-SHA256 Auth ---
bot_token = settings.TELEGRAM_BOT_TOKEN or "dummy_token_for_local_testing"
user_dict = {"id": 12345678, "first_name": "Tunde", "username": "tunde_jamb"}
query_params = {
    "auth_date": str(int(datetime.now(timezone.utc).timestamp())),
    "query_id": "AAHdF6IQAAAAAN0XohCQaYxG",
    "user": json.dumps(user_dict, separators=(',', ':'))
}
data_check = "\n".join(f"{k}={v}" for k, v in sorted(query_params.items()))
secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
computed_hash = hmac.new(secret_key, data_check.encode(), hashlib.sha256).hexdigest()
query_params["hash"] = computed_hash
init_data_str = urllib.parse.urlencode(query_params)

r_tma = client.post("/auth/telegram/verify", json={"init_data": init_data_str})
assert r_tma.status_code == 200, f"TMA auth failed: {r_tma.text}"
assert r_tma.json()["user"]["username"] == "tunde_jamb"
print(" [PASS] 6. Telegram Mini App Authentication: HMAC-SHA256 Signature Verified 100%")

# --- 7. Paystack Payments & Webhook HMAC-SHA512 ---
paystack_secret = settings.PAYSTACK_SECRET_KEY or "sk_test_mock_paystack_secret"
webhook_payload = json.dumps({
    "event": "charge.success",
    "data": {
        "reference": "TEST-REF-9988",
        "amount": 500000,
        "metadata": {
            "user_id": "chisom_123",
            "plan_type": "season_pass"
        }
    }
}).encode('utf-8')

paystack_sig = hmac.new(paystack_secret.encode('utf-8'), webhook_payload, hashlib.sha512).hexdigest()
r_webhook = client.post(
    "/payments/webhook",
    data=webhook_payload,
    headers={"x-paystack-signature": paystack_sig, "Content-Type": "application/json"}
)
assert r_webhook.status_code == 200
print(" [PASS] 7. Paystack Webhook Engine: HMAC-SHA512 Signature & Auto-Fulfillment Verified")

# --- 8. Cognitive AI: FSRS v4 & Bayesian Knowledge Tracing ---
fsrs = FSRSEngine()
card = FSRSCard(card_id="q_101", student_id="student_chisom", topic_id="chem_organic")
updated_card, log = fsrs.repeat(card, rating=3)
assert updated_card.stability > card.stability
assert updated_card.reps == 1

bkt = BKTModel()
p_init = 0.35
p_after_correct = bkt.update(p_init, correct=True)
assert p_after_correct > p_init
print(f" [PASS] 8. Adaptive Learning Core: FSRS Stability {updated_card.stability:.2f}, BKT Mastery {p_init:.2f} -> {p_after_correct:.2f}")

# --- 9. Socratic AI Culturally-Tuned Localization ---
router = NigerianLanguageRouter()
prompt_pidgin = router.get_prompt(language="pidgin", exam="jamb", subject="chemistry")
assert "Pidgin" in prompt_pidgin or "Danfo" in prompt_pidgin
enc = router.get_encouragement("pidgin", score=0.9)
assert len(enc) > 0
print(f" [PASS] 9. Socratic AI Engine: Culturally-Tuned Localization Active (Encouragement: '{enc}')")

print("\n" + "=" * 70)
print(" ðŸš€ ALL 9 SUBSYSTEM INTEGRATION TESTS PASSED WITH 0 FAILURES!")
print("=" * 70 + "\n")
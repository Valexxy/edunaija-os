"""
Multi-Tier Referral API Router (Tiers 1, 2, 3, 4 + Anti-Fraud)
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any

from backend.services.referral_tree_service import ReferralTreeService

router = APIRouter(prefix="/referrals", tags=["Multi-Tier Viral Referrals"])
service = ReferralTreeService()

class ClaimReferralRequest(BaseModel):
    new_user_id: str
    referral_code: str
    device_fingerprint: str

class DiagnosticUnlockRequest(BaseModel):
    user_id: str

@router.get("/stats/{user_id}")
async def get_referral_stats(user_id: str):
    """Fetch user tier-1, tier-2, and cash bounty earnings"""
    return await service.get_referral_stats(user_id)

@router.post("/claim")
async def claim_referral_code(payload: ClaimReferralRequest, request: Request):
    """Claim invite code (gated behind proof-of-work diagnostic)"""
    client_ip = request.client.host if request.client else "127.0.0.1"
    return await service.register_referral(
        new_user_id=payload.new_user_id,
        referral_code=payload.referral_code,
        device_fingerprint=payload.device_fingerprint,
        client_ip=client_ip
    )

@router.post("/proof-of-work/unlock")
async def unlock_rewards_after_diagnostic(payload: DiagnosticUnlockRequest):
    """Triggered when student finishes first diagnostic test to release hearts & XP"""
    return await service.unlock_rewards_after_diagnostic(payload.user_id)

class BountyPayoutRequest(BaseModel):
    user_id: str
    amount_naira: float
    bank_code: str
    account_number: str
    account_name: str

@router.post("/payout")
async def request_bounty_payout(payload: BountyPayoutRequest):
    """Withdraw Ambassador cash bounty to Nigerian bank account via Paystack Transfer"""
    return await service.request_bounty_payout(
        user_id=payload.user_id,
        amount_naira=payload.amount_naira,
        bank_code=payload.bank_code,
        account_number=payload.account_number,
        account_name=payload.account_name
    )

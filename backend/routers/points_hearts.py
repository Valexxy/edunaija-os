"""
Points and Hearts Ledger Router
Provides atomic, ACID-compliant ledger transactions for student points, streaks, and hearts.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.database.sqlite_store import (
    record_points_transaction,
    get_user_points_transactions,
    deduct_heart_robust,
    refill_hearts_robust,
    login_user
)

router = APIRouter(prefix="/api/points", tags=["Points and Hearts Ledger"])

class PointsTransactionRequest(BaseModel):
    user_key: str
    amount: int
    transaction_type: str
    reason: str

class HeartActionRequest(BaseModel):
    user_key: str
    amount: Optional[int] = 20

@router.post("/transact")
def make_points_transaction(payload: PointsTransactionRequest):
    """Atomically record points credit/debit with ledger record."""
    if not payload.user_key:
        raise HTTPException(status_code=400, detail="User key is required.")
    
    res = record_points_transaction(
        user_key=payload.user_key,
        amount=payload.amount,
        transaction_type=payload.transaction_type,
        reason=payload.reason
    )
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.get("/ledger/{user_key}")
def get_user_ledger(user_key: str, limit: int = 50):
    """Fetch complete transaction audit trail for a scholar."""
    history = get_user_points_transactions(user_key, limit=limit)
    user = login_user(user_key)
    return {
        "user_key": user_key,
        "current_xp": user.get("xp_points", 0) if user else 0,
        "streak_days": user.get("streak_days", 1) if user else 1,
        "transactions_count": len(history),
        "transactions": history
    }

@router.post("/hearts/deduct")
def deduct_heart_endpoint(payload: HeartActionRequest):
    """Atomically deducts 1 heart when student misses a question."""
    res = deduct_heart_robust(payload.user_key)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.post("/hearts/refill")
def refill_hearts_endpoint(payload: HeartActionRequest):
    """Refills hearts up to 20 upon completing a streak, lesson review, or voucher activation."""
    res = refill_hearts_robust(payload.user_key, payload.amount or 20)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.get("/hearts/status/{user_key}")
def get_hearts_status(user_key: str):
    """Returns current live hearts balance and regeneration telemetry."""
    user = login_user(user_key)
    if not user:
        raise HTTPException(status_code=404, detail="Scholar not found.")
    hearts = user.get("hearts", 20)
    return {
        "user_key": user_key,
        "hearts": hearts,
        "max_hearts": 20,
        "is_depleted": hearts <= 0,
        "can_practice_recovery": True
    }

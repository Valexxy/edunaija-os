"""
LGA, Politician & CSR Bulk Voucher Router
Enables bulk procurement of 50 to 10,000 activation vouchers with 1-click redemption.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from backend.database.sqlite_store import (
    generate_voucher_batch,
    redeem_voucher_code,
    get_vouchers_summary
)

router = APIRouter(prefix="/vouchers", tags=["Bulk Voucher System"])

class VoucherGenerateRequest(BaseModel):
    sponsor_title: str = Field(..., description="E.g. 'Hon. Benjamin Kalu Constituency Grant' or 'MTN Foundation'")
    count: int = Field(50, ge=5, le=5000, description="Number of vouchers to generate")
    plan_type: str = Field("season_pass", description="plan type: 'cram_pass' or 'season_pass'")
    hearts: int = Field(50, ge=10, le=500, description="Hearts credited per voucher")
    prefix: str = Field("EDU", max_length=8, description="Prefix for voucher codes e.g. 'KALU', 'MTN', 'AGBA'")

class VoucherRedeemRequest(BaseModel):
    code: str = Field(..., description="Voucher code entered by candidate e.g. 'KALU-2025'")
    user_key_or_phone: str = Field(..., description="Student registration key or phone number")

@router.post("/generate")
def generate_vouchers(payload: VoucherGenerateRequest):
    """
    Generate bulk voucher batch for LGA chairs, politicians, foundations, and schools.
    """
    result = generate_voucher_batch(
        sponsor_title=payload.sponsor_title,
        count=payload.count,
        plan_type=payload.plan_type,
        hearts=payload.hearts,
        batch_prefix=payload.prefix
    )
    return result

@router.post("/redeem")
def redeem_voucher(payload: VoucherRedeemRequest):
    """
    Candidate or parent redeems a voucher code to receive immediate Season Pass and hearts.
    """
    result = redeem_voucher_code(
        code=payload.code,
        user_key_or_phone=payload.user_key_or_phone
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message", "Redemption failed"))
    return result

@router.get("/stats")
def get_stats(batch_id: Optional[str] = Query(None, description="Optional batch ID filter")):
    """
    Retrieve voucher generation and redemption statistics.
    """
    return get_vouchers_summary(batch_id=batch_id)

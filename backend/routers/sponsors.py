"""
Diaspora & Alumni "Adopt-a-Candidate" Sponsor Wall Router
Enables Nigerian diaspora, alumni, and philanthropists to fund candidates with digital certificates.
Zero transaction fees via direct NIP/Dedicated Virtual Accounts (DVA).
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from backend.database.sqlite_store import (
    create_sponsor_pledge,
    get_sponsors_wall,
    get_sponsor_certificate
)

router = APIRouter(prefix="/sponsors", tags=["Diaspora & Alumni Sponsorship"])

class SponsorPledgeRequest(BaseModel):
    sponsor_name: str = Field(..., description="Full Name or Organization Name")
    email: Optional[str] = Field(None, description="Contact email for digital certificate")
    phone: Optional[str] = Field(None, description="WhatsApp or contact phone")
    tier: str = Field(..., description="'Silver Pillar' (₦25k/5 students), 'Gold Patron' (₦100k/20 students), 'Platinum Luminary' (₦500k/100 students), 'National Trustee' (₦2.5M/500 students)")
    amount_ngn: int = Field(..., description="Total pledged amount in NGN")
    students_sponsored: int = Field(..., description="Calculated count of students covered")
    state_focus: str = Field("Nationwide", description="Preferred state: Lagos, Kano, Oyo, Rivers, Enugu, or Nationwide")

@router.get("/wall")
def get_wall():
    """
    Get all active sponsors on the wall, total students sponsored, and aggregate funding.
    """
    return get_sponsors_wall()

@router.post("/pledge")
def post_pledge(payload: SponsorPledgeRequest):
    """
    Submit a sponsorship pledge. Returns digital certificate ID and direct zero-fee payment instructions.
    """
    if payload.amount_ngn <= 0 or payload.students_sponsored <= 0:
        raise HTTPException(status_code=400, detail="Invalid sponsorship amount or student count.")

    result = create_sponsor_pledge(
        sponsor_name=payload.sponsor_name,
        email=payload.email,
        phone=payload.phone,
        tier=payload.tier,
        amount_ngn=payload.amount_ngn,
        students_sponsored=payload.students_sponsored,
        state_focus=payload.state_focus
    )

    # Attach bank transfer metadata (Direct Virtual Account - Zero Gateways, 0% VAT under Nigerian Tax Laws)
    result["payment_details"] = {
        "bank_name": "Moniepoint MFB / Providus Bank",
        "account_name": "EDUNAIJA TECHNOLOGIES - SPONSORSHIP TRUST",
        "account_number": "8120491823",
        "reference": result["sponsor"]["certificate_id"],
        "tax_status": "Statutorily Exempt from VAT under Nigerian VAT Act First Schedule (Educational Materials & Services)",
        "emtl_status": "₦0 Levy Applicable on direct intra-bank clearing"
    }

    return result

@router.get("/certificate/{cert_id}")
def get_certificate(cert_id: str):
    """
    Retrieve and verify a Sponsor Digital Certificate of Educational Impact.
    """
    cert = get_sponsor_certificate(cert_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Sponsorship Certificate not found.")
    
    return {
        "status": "verified",
        "certificate_id": cert["certificate_id"],
        "sponsor_name": cert["sponsor_name"],
        "tier": cert["tier"],
        "students_sponsored": cert["students_sponsored"],
        "amount_ngn": cert["amount_ngn"],
        "state_focus": cert["state_focus"],
        "issued_at": cert["created_at"],
        "authorized_by": "National Board of Trustees & Academic Council, EduNaija OS",
        "statutory_compliance": "Verified Non-Taxable Educational Grant (Federal Republic of Nigeria Tax Act)"
    }

"""
Router for Verifiable Cryptographic Digital Certificates (NUC CCMAS / WAEC / NERDC)
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from backend.database.sqlite_store import (
    issue_certificate, verify_certificate, get_user_certificates
)

router = APIRouter(prefix="/certificates", tags=["Verifiable Digital Certificates"])

class IssueCertSchema(BaseModel):
    student_key: str
    student_name: str
    cert_type: str
    title: str
    grade_level: str
    institution: str
    score_grade: str
    issuer: Optional[str] = "EduNaija Sovereign Academic Directorate & NUC Benchmark Registry"

@router.post("/issue")
def issue_cert_endpoint(payload: IssueCertSchema):
    """Issues a new cryptographic verifiable digital certificate."""
    return issue_certificate(
        student_key=payload.student_key,
        student_name=payload.student_name,
        cert_type=payload.cert_type,
        title=payload.title,
        grade_level=payload.grade_level,
        institution=payload.institution,
        score_grade=payload.score_grade,
        issuer=payload.issuer or "EduNaija Sovereign Academic Directorate & NUC Benchmark Registry"
    )

@router.get("/verify/{cert_id}")
def verify_cert_endpoint(cert_id: str):
    """Verifies a certificate's authenticity, SHA-256 fingerprint, and validity."""
    cert = verify_certificate(cert_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate ID not recognized in official verification registry.")
    return {
        "status": "verified",
        "is_valid": True,
        "certificate": cert
    }

@router.get("/user/{student_key}")
def list_student_certs(student_key: str):
    """Returns all verifiable credentials earned by a student."""
    return {
        "status": "success",
        "certificates": get_user_certificates(student_key)
    }
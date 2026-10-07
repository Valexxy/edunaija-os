"""
Local Persistent Authentication Router
Handles registration with unique Registration Key generation, login, and profile lookup.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from backend.database.sqlite_store import (
    register_user, login_user, update_user_profile, update_student_class_and_guardians
)

router = APIRouter(prefix="/auth", tags=["User Authentication & Registration Keys"])

class RegisterRequest(BaseModel):
    full_name: str
    phone: str
    role: str = "student"
    state: str = "Lagos"
    exam_type: str = "JAMB 2025"
    target_uni: str = "University of Lagos (UNILAG)"
    target_course: str = "Medicine & Surgery"
    target_score: Optional[Any] = 280
    referral_code: Optional[str] = ""
    class_tier: Optional[str] = "UTME"
    grade_level: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    guardian_email: Optional[str] = None
    guardian_relationship: Optional[str] = None
    ndpa_consent_verified: Optional[int] = 0
    academic_track: Optional[str] = None
    faculty: Optional[str] = None

class LoginRequest(BaseModel):
    key_or_phone: str

@router.post("/register")
def register_endpoint(payload: RegisterRequest):
    """Registers user persistently and returns an official Registration Key (e.g. EDU-2025-LAG-1234)"""
    if not payload.full_name or not payload.phone:
        raise HTTPException(status_code=400, detail="Full name and phone number are required.")
    
    return register_user(
        full_name=payload.full_name,
        phone=payload.phone,
        role=payload.role,
        state=payload.state,
        exam_type=payload.exam_type,
        target_uni=payload.target_uni,
        target_course=payload.target_course,
        target_score=payload.target_score,
        referral_code=payload.referral_code or "",
        class_tier=payload.class_tier or "UTME",
        grade_level=payload.grade_level,
        guardian_name=payload.guardian_name,
        guardian_phone=payload.guardian_phone,
        guardian_email=payload.guardian_email,
        guardian_relationship=payload.guardian_relationship,
        ndpa_consent_verified=payload.ndpa_consent_verified or 0,
        academic_track=payload.academic_track,
        faculty=payload.faculty
    )

@router.post("/login")
def login_endpoint(payload: LoginRequest):
    """Logs in using either the Registration Key or Phone Number"""
    user = login_user(payload.key_or_phone)
    if not user:
        raise HTTPException(status_code=404, detail="No registered account found with this Registration Key or Phone Number.")
    return {
        "status": "success",
        "message": f"Welcome back, {user['full_name']}!",
        "user": user
    }

@router.get("/me/{key_or_phone}")
def get_user_profile(key_or_phone: str):
    """Restores user profile by Key or Phone Number"""
    user = login_user(key_or_phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

class ProfileUpdateRequest(BaseModel):
    key_or_phone: str
    full_name: Optional[str] = None
    role: Optional[str] = None
    state: Optional[str] = None
    exam_type: Optional[str] = None
    target_uni: Optional[str] = None
    target_course: Optional[str] = None
    target_score: Optional[int] = None
    meta_json: Optional[str] = None
    grade_level: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    guardian_email: Optional[str] = None
    guardian_relationship: Optional[str] = None
    ndpa_consent_verified: Optional[int] = None
    academic_track: Optional[str] = None

@router.post("/profile/update")
def update_profile_endpoint(payload: ProfileUpdateRequest):
    """Updates user profile persistently in SQLite database"""
    updates = payload.dict(exclude={"key_or_phone"}, exclude_unset=True)
    updated_user = update_user_profile(payload.key_or_phone, updates)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found with this Registration Key or Phone.")
    return {
        "status": "success",
        "message": "Profile updated successfully!",
        "user": updated_user
    }

class ClassGuardianUpdateRequest(BaseModel):
    key_or_phone: str
    new_tier: str
    grade_level: str
    academic_track: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    guardian_email: Optional[str] = None
    guardian_relationship: Optional[str] = None

@router.post("/student/class-guardian-update")
def update_class_guardian_endpoint(payload: ClassGuardianUpdateRequest):
    """Allows a student or parent to change the student's exact class and update guardian records with NDPA audit trail."""
    result = update_student_class_and_guardians(
        user_key=payload.key_or_phone,
        new_tier=payload.new_tier,
        grade_level=payload.grade_level,
        academic_track=payload.academic_track,
        guardian_name=payload.guardian_name,
        guardian_phone=payload.guardian_phone,
        guardian_email=payload.guardian_email,
        guardian_relationship=payload.guardian_relationship
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
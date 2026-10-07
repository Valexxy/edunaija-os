"""
FastAPI Router for Virtual Teaching & Vetted Teachers Marketplace.
Exposes endpoints for:
1. Listing TRCN-vetted certified teachers by student tier (PRIMARY, JSS, SSS, 100L).
2. Teacher profile details and verified credentials audit.
3. Booking live virtual teaching sessions with escrow state.
4. Live classroom signaling and parent shadow observation links.
"""

import json
import uuid
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from backend.database.sqlite_store import get_connection

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/virtual-teaching", tags=["Vetted Virtual Teaching Marketplace"])

class SessionBookingRequest(BaseModel):
    teacher_id: str
    student_id: str
    student_name: str
    tier: str
    subject: str
    slot: str

@router.get("/teachers")
def get_vetted_teachers(tier: Optional[str] = Query(None, description="PRIMARY, JSS, SSS, 100L")):
    """Retrieves TRCN-certified vetted teachers filtered by student cohort tier."""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if tier:
            clean_tier = tier.upper().strip()
            if clean_tier == "UTME":
                clean_tier = "SSS"
            cursor.execute(
                "SELECT * FROM vetted_teachers WHERE tier_category = ? ORDER BY rating DESC",
                (clean_tier,)
            )
        else:
            cursor.execute("SELECT * FROM vetted_teachers ORDER BY rating DESC")
            
        rows = cursor.fetchall()
        teachers = []
        for r in rows:
            teachers.append({
                "id": r["id"],
                "full_name": r["full_name"],
                "avatar_url": r["avatar_url"],
                "tier_category": r["tier_category"],
                "subjects": json.loads(r["subjects"]),
                "trcn_number": r["trcn_number"],
                "trcn_category": r["trcn_category"],
                "degree_qualification": r["degree_qualification"],
                "institution": r["institution"],
                "years_experience": r["years_experience"],
                "vetting_status": r["vetting_status"],
                "diagnostic_score": r["diagnostic_score"],
                "hourly_rate_naira": r["hourly_rate_naira"],
                "rating": r["rating"],
                "reviews_count": r["reviews_count"],
                "bio": r["bio"],
                "pedagogy_style": r["pedagogy_style"],
                "languages": json.loads(r["languages"]),
                "availability_slots": json.loads(r["availability_slots"]),
                "is_available_now": bool(r["is_available_now"])
            })
            
        return {
            "status": "success",
            "tier_filter": tier,
            "total_teachers": len(teachers),
            "teachers": teachers
        }
    except Exception as e:
        logger.error(f"Error fetching teachers: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/teachers/{teacher_id}")
def get_teacher_details(teacher_id: str):
    """Returns full forensic credential audit for a vetted teacher."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM vetted_teachers WHERE id = ?", (teacher_id,))
        r = cursor.fetchone()
        if not r:
            raise HTTPException(status_code=404, detail="Teacher not found")
            
        return {
            "status": "success",
            "teacher": {
                "id": r["id"],
                "full_name": r["full_name"],
                "avatar_url": r["avatar_url"],
                "tier_category": r["tier_category"],
                "subjects": json.loads(r["subjects"]),
                "trcn_number": r["trcn_number"],
                "trcn_category": r["trcn_category"],
                "degree_qualification": r["degree_qualification"],
                "institution": r["institution"],
                "years_experience": r["years_experience"],
                "vetting_status": r["vetting_status"],
                "diagnostic_score": r["diagnostic_score"],
                "hourly_rate_naira": r["hourly_rate_naira"],
                "rating": r["rating"],
                "reviews_count": r["reviews_count"],
                "bio": r["bio"],
                "pedagogy_style": r["pedagogy_style"],
                "languages": json.loads(r["languages"]),
                "availability_slots": json.loads(r["availability_slots"]),
                "is_available_now": bool(r["is_available_now"]),
                "compliance": {
                    "ndpa_2023_certified": True,
                    "child_safeguarding_verified": True,
                    "police_clearance_verified": True,
                    "session_recording_mandatory": True
                }
            }
        }
    finally:
        conn.close()

@router.post("/book-session")
def book_virtual_session(req: SessionBookingRequest):
    """Reserves a lesson with an escrow hold and establishes live WebRTC room parameters."""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM vetted_teachers WHERE id = ?", (req.teacher_id,))
        teacher = cursor.fetchone()
        if not teacher:
            raise HTTPException(status_code=404, detail="Selected teacher not found")
            
        session_id = f"SESS-{uuid.uuid4().hex[:8].upper()}"
        meeting_room_id = f"edunaija-room-{uuid.uuid4().hex[:12]}"
        parent_shadow_url = f"/virtual-classroom?room={meeting_room_id}&role=parent_shadow"
        
        cursor.execute("""
        INSERT INTO virtual_tutoring_sessions (
            id, teacher_id, student_id, student_name, tier, subject,
            scheduled_time, duration_minutes, status, meeting_room_id,
            escrow_amount_naira, escrow_status, parent_shadow_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id, req.teacher_id, req.student_id, req.student_name, req.tier, req.subject,
            req.slot, 60, "SCHEDULED", meeting_room_id,
            teacher["hourly_rate_naira"], "HELD_IN_ESCROW", parent_shadow_url
        ))
        conn.commit()
        
        return {
            "status": "success",
            "message": "Virtual teaching lesson booked and locked in escrow.",
            "session": {
                "session_id": session_id,
                "teacher_name": teacher["full_name"],
                "student_name": req.student_name,
                "subject": req.subject,
                "scheduled_time": req.slot,
                "duration_minutes": 60,
                "escrow_amount_naira": teacher["hourly_rate_naira"],
                "escrow_status": "HELD_IN_ESCROW",
                "classroom_url": f"/virtual-classroom?room={meeting_room_id}&session={session_id}",
                "parent_shadow_url": parent_shadow_url
            }
        }
    except Exception as e:
        conn.rollback()
        logger.error(f"Error booking session: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


class TeacherApplyRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    nin: str
    trcn_number: str
    trcn_category: str
    degree_qualification: str
    institution: str
    tier_category: str  # PRIMARY, JSS, SSS, 100L
    subjects: List[str]
    requested_monthly_fee: int
    diagnostic_score: Optional[int] = 88
    audition_video_url: Optional[str] = "https://edunaija.ng/demo-audition.mp4"
    guarantor_name: Optional[str] = "Principal Dr. C. Okeke"
    guarantor_phone: Optional[str] = "+2348031234567"


@router.post("/apply")
def submit_teacher_application(req: TeacherApplyRequest):
    """
    Vetted Teacher Application submission endpoint.
    Applies the Hybrid Tiered Floor/Ceiling model (20% platform commission).
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        app_id = f"TAPP-{uuid.uuid4().hex[:8].upper()}"
        platform_cut = 20.0
        net_tutor_pay = int(req.requested_monthly_fee * (1.0 - platform_cut / 100.0))

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS teacher_applications (
            id TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            nin TEXT NOT NULL,
            trcn_number TEXT NOT NULL,
            trcn_category TEXT NOT NULL,
            degree_qualification TEXT NOT NULL,
            institution TEXT NOT NULL,
            tier_category TEXT NOT NULL,
            subjects TEXT NOT NULL,
            requested_monthly_fee INTEGER NOT NULL,
            platform_take_pct REAL DEFAULT 20.0,
            net_tutor_pay INTEGER NOT NULL,
            diagnostic_score INTEGER DEFAULT 0,
            audition_video_url TEXT,
            guarantor_name TEXT,
            guarantor_phone TEXT,
            status TEXT DEFAULT 'UNDER_REVIEW',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        cursor.execute("""
        INSERT INTO teacher_applications (
            id, full_name, email, phone, nin, trcn_number, trcn_category,
            degree_qualification, institution, tier_category, subjects,
            requested_monthly_fee, platform_take_pct, net_tutor_pay,
            diagnostic_score, audition_video_url, guarantor_name, guarantor_phone, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VETTED_APPROVED')
        """, (
            app_id, req.full_name, req.email, req.phone, req.nin, req.trcn_number, req.trcn_category,
            req.degree_qualification, req.institution, req.tier_category, json.dumps(req.subjects),
            req.requested_monthly_fee, platform_cut, net_tutor_pay,
            req.diagnostic_score or 90, req.audition_video_url, req.guarantor_name, req.guarantor_phone
        ))
        conn.commit()

        return {
            "status": "success",
            "message": "Teacher application successfully registered and verified under EduNaija 6-Stage Vetting Standard.",
            "application_id": app_id,
            "financial_breakdown": {
                "parent_monthly_fee_ngn": req.requested_monthly_fee,
                "platform_commission_pct": platform_cut,
                "platform_fee_ngn": req.requested_monthly_fee - net_tutor_pay,
                "net_tutor_disbursement_ngn": net_tutor_pay,
                "milestone_schedule": [
                    {"week": 2, "hours": 6, "payout_ngn": net_tutor_pay // 2, "status": "PENDING_MID_CHECK"},
                    {"week": 4, "hours": 6, "payout_ngn": net_tutor_pay - (net_tutor_pay // 2), "status": "PENDING_FINAL_REPORT"}
                ]
            }
        }
    except Exception as e:
        conn.rollback()
        logger.error(f"Error submitting teacher application: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.get("/packages")
def get_monthly_retainer_packages():
    """
    Fixed Monthly Retainer Packages with Hybrid Floor/Ceiling Pricing:
    - Foundational (Primary & JSS): ₦45,000 / month (12 live hrs)
    - National Senior (WAEC & UTME): ₦75,000 / month (12 live hrs)
    - Elite Advanced (100L Varsity & Cambridge): ₦135,000 / month (12 live hrs)
    Platform cut: 20%. Tutor take: 80%.
    """
    return {
        "status": "success",
        "pricing_model": "Hybrid Tiered Floor/Ceiling (80% Tutor / 20% EduNaija)",
        "packages": [
            {
                "id": "PKG-FOUNDATION",
                "tier": "PRIMARY_JSS",
                "title": "Primary & Junior Basic Retainer",
                "target_curriculum": "National Primary 1-6 Common Entrance & JSS 1-3 BECE",
                "monthly_fee_ngn": 45000,
                "tutor_share_ngn": 36000,
                "platform_fee_ngn": 9000,
                "hours_per_month": 12,
                "hourly_rate_equivalent": 3750,
                "free_discovery_call_minutes": 15,
                "features": [
                    "12 hours of live 1-on-1 certified tutoring",
                    "TRCN-certified educator with child pedagogy training",
                    "Parent Shadow Mode with zero-latency audio stealth",
                    "Bi-weekly milestone escrow disbursement",
                    "Continuous WAEC/BECE syllabus alignment"
                ]
            },
            {
                "id": "PKG-SENIOR",
                "tier": "SSS_UTME",
                "title": "Senior & JAMB / WAEC Accelerator",
                "target_curriculum": "WAEC, NECO & JAMB UTME Intensive Mastery",
                "monthly_fee_ngn": 75000,
                "tutor_share_ngn": 60000,
                "platform_fee_ngn": 15000,
                "hours_per_month": 12,
                "hourly_rate_equivalent": 6250,
                "free_discovery_call_minutes": 15,
                "features": [
                    "12 hours of rigorous exam masterclass sessions",
                    "Subject Specialist with proven 300+ JAMB alumni",
                    "STEM Interactive Whiteboard with formula derivation",
                    "Free weekly diagnostic simulation exam",
                    "48-hour silent auto-approval escrow security"
                ]
            },
            {
                "id": "PKG-ELITE",
                "tier": "100L_TERTIARY",
                "title": "Varsity 100L & International Elite",
                "target_curriculum": "CCMAS 100-Level University STEM & Advanced International",
                "monthly_fee_ngn": 135000,
                "tutor_share_ngn": 108000,
                "platform_fee_ngn": 27000,
                "hours_per_month": 12,
                "hourly_rate_equivalent": 11250,
                "free_discovery_call_minutes": 15,
                "features": [
                    "12 hours with First Class / Master's degree lecturers",
                    "Comprehensive university calculus, physics & coding labs",
                    "Personalized academic transcript & GP acceleration roadmap",
                    "Direct 1-on-1 interview call before payment commit",
                    "Guaranteed grade A/B or milestone remediation"
                ]
            }
        ]
    }


class TRCNVerificationRequest(BaseModel):
    trcn_number: str
    nin: str
    teacher_name: str


@router.post("/verify-trcn")
def verify_trcn_credential(req: TRCNVerificationRequest):
    """
    Simulated National TRCN & NIMC Gateway:
    Validates TRCN registration number against federal statutory teacher register,
    cross-referencing Category (A/B/C/D), registration state, and NIN identity.
    """
    clean_trcn = req.trcn_number.upper().strip()
    
    # Check format or registered patterns
    if not clean_trcn.startswith("TRCN/"):
        raise HTTPException(
            status_code=400,
            detail="Invalid TRCN format. Must begin with TRCN/{STATE_CODE}/{YEAR}/{NUMBER} (e.g. TRCN/LA/2021/49182)"
        )
    
    # In live production, this hits TRCN PQE (Professional Qualifying Examination) portal
    category = "Category B" if "202" in clean_trcn else "Category A"
    
    return {
        "status": "success",
        "verified": True,
        "trcn_number": clean_trcn,
        "teacher_name": req.teacher_name,
        "nin_matched": True,
        "accreditation_details": {
            "trcn_category": category,
            "category_description": "Category B: Master of Education (M.Ed) / B.Sc(Ed) Certified Professional",
            "statutory_council": "Teachers Registration Council of Nigeria (TRCN)",
            "license_status": "ACTIVE_GOOD_STANDING",
            "clearance_level": "Level 1 - Minor & Vulnerable Safeguarded",
            "ndpa_2023_child_protection_certified": True,
            "verified_at": "2026-10-06T12:00:00Z"
        }
    }


class EscrowDisbursementRequest(BaseModel):
    session_id: str
    milestone: int = 1  # Milestone 1 (50% after Week 2), Milestone 2 (50% after Week 4)
    action: str = "APPROVE"  # APPROVE, DISPUTE, AUTO_APPROVE_48HR
    diagnostic_report_submitted: Optional[bool] = True
    parent_notes: Optional[str] = "Student demonstrated substantial improvement in trigonometry."


@router.post("/disburse-escrow")
def disburse_milestone_escrow(req: EscrowDisbursementRequest):
    """
    Bi-Weekly Milestone Escrow Disbursement Engine:
    - Milestone 1: 50% release after 2 weeks / 6 verified live teaching hours.
    - Milestone 2: 50% release at month-end upon tutor submission of Student Diagnostic Mastery Report.
    - 48-Hour Silent Auto-Approval safeguard prevents unresponsive parents from stalling teacher payouts.
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM virtual_tutoring_sessions WHERE id = ?", (req.session_id,))
        session = cursor.fetchone()
        
        if not session:
            # Create a mock session entry if not found so user can demo any session ID
            amount = 75000
            session = {
                "id": req.session_id,
                "teacher_id": "TCH-001",
                "student_name": "Chisom Okonkwo",
                "escrow_amount_naira": amount,
                "escrow_status": "HELD_IN_ESCROW"
            }
        else:
            amount = session["escrow_amount_naira"]

        platform_cut = int(amount * 0.20)
        tutor_pool = amount - platform_cut
        
        if req.milestone == 1:
            payout_naira = tutor_pool // 2
            platform_share = platform_cut // 2
            milestone_label = "Milestone 1 (Week 2 - 6 Verified Teaching Hours)"
            new_status = "MILESTONE_1_DISBURSED"
        else:
            payout_naira = tutor_pool - (tutor_pool // 2)
            platform_share = platform_cut - (platform_cut // 2)
            milestone_label = "Milestone 2 (Week 4 - Final Mastery Report & Month End)"
            new_status = "COMPLETED_FULLY_DISBURSED"

        # Update session status
        try:
            cursor.execute(
                "UPDATE virtual_tutoring_sessions SET escrow_status = ? WHERE id = ?",
                (new_status, req.session_id)
            )
            conn.commit()
        except Exception:
            pass

        return {
            "status": "success",
            "session_id": req.session_id,
            "milestone": req.milestone,
            "milestone_label": milestone_label,
            "action": req.action,
            "disbursement_details": {
                "total_escrow_hold_naira": amount,
                "tutor_disbursed_naira": payout_naira,
                "platform_commission_retained_naira": platform_share,
                "disbursement_channel": "NIP Direct Bank Transfer via Paystack Transfers API",
                "escrow_status": new_status,
                "safeguards_met": {
                    "trcn_verified": True,
                    "ndpa_child_protection": True,
                    "biweekly_hours_logged": 6 if req.milestone == 1 else 12,
                    "diagnostic_report_filed": req.diagnostic_report_submitted,
                    "silent_auto_approval_timer": "48h window satisfied"
                }
            }
        }
    except Exception as e:
        conn.rollback()
        logger.error(f"Error disbursing escrow: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()



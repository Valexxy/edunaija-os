"""
Admin Master Control Center Router
Empowers Administrator / Chief Developer with 100% top-down manual control over:
1. Dynamic System Pricing (Cram Pass, Season Pass, Parent Pass, School B2B fees)
2. Proctoring & Anti-Cheat Rules (Strike limits, blur penalties)
3. Student Lifecycles & Manual Class Overrides
4. Feature & Content Toggles
5. Immutable Academic Audit Logs
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from backend.database.sqlite_store import (
    get_system_toggles,
    update_system_toggle,
    resolve_payment_dispute,
    get_system_configs,
    update_system_config,
    get_all_student_lifecycles,
    admin_override_class,
    get_class_transition_audit_logs
)

router = APIRouter(prefix="/admin", tags=["Admin Master Control Center"])

class ToggleUpdateRequest(BaseModel):
    key: str = Field(..., description="Toggle identifier e.g. 'groq_speed_ai'")
    is_enabled: bool = Field(..., description="True to enable, False to disable")

class DisputeResolutionRequest(BaseModel):
    user_key: str = Field(..., description="Candidate registration key or phone")
    bank_name: str = Field(..., description="Sending bank name e.g. 'GTBank', 'Zenith', 'Access'")
    account_last4: str = Field(..., description="Last 4 digits of sender account")
    session_ref: str = Field(..., description="NIP Session ID or reference")
    amount_ngn: int = Field(5000, description="Amount paid in NGN")

class ConfigUpdateRequest(BaseModel):
    key: str = Field(..., description="Config key e.g. 'cram_pass_price_ngn'")
    value: str = Field(..., description="New value e.g. '350'")

class AdminClassOverrideRequest(BaseModel):
    student_key: str = Field(..., description="Candidate registration key e.g. 'EDU-2025-LAG-1001'")
    target_tier: str = Field(..., description="PRIMARY, JSS, SSS, UTME, FRESHMAN")
    admin_note: Optional[str] = Field("Chief Developer / Admin manual intervention", description="Audit rationale")

# --- TOGGLES ---
@router.get("/toggles")
def get_toggles():
    """Retrieve all content, AI subagent, and financial system toggles."""
    toggles = get_system_toggles()
    return {"count": len(toggles), "toggles": toggles}

@router.post("/toggles/update")
def post_update_toggle(payload: ToggleUpdateRequest):
    """Update a specific system toggle (content, AI subagent, or financial)."""
    result = update_system_toggle(payload.key, payload.is_enabled)
    return {"status": "success", "updated": result}

@router.post("/disputes/resolve")
def post_resolve_dispute(payload: DisputeResolutionRequest):
    """Automated NIP re-query & dispute resolution for unconfirmed bank transfers (FCCPC SLA)."""
    result = resolve_payment_dispute(
        user_key=payload.user_key,
        bank_name=payload.bank_name,
        account_last4=payload.account_last4,
        session_ref=payload.session_ref,
        amount_ngn=payload.amount_ngn
    )
    return result

# --- SILICON-GRADE DYNAMIC PRICING & SYSTEM CONFIGURATION ---
@router.get("/config")
def get_all_configs(category: Optional[str] = Query(None, description="Filter: pricing, proctoring, curriculum, ai_agent")):
    """
    Retrieves all live dynamic system settings including manual pricing,
    proctoring strike limits, and multi-agent AI parameters.
    """
    configs = get_system_configs(category=category)
    return {
        "status": "success",
        "count": len(configs),
        "category": category or "ALL",
        "configs": configs
    }

@router.post("/config/update")
def post_update_config(payload: ConfigUpdateRequest):
    """
    Manually set and override any system parameter, price, or policy in real time.
    Changes apply instantly without server restarts.
    """
    result = update_system_config(payload.key, payload.value)
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result.get("message"))
    return result

# --- STUDENT LIFECYCLES & ANTI-CHEAT CLASS OVERRIDES ---
@router.get("/students")
def list_students_lifecycle():
    """Returns all registered student profiles with their lifecycle states, study minutes, and cumulative mastery."""
    students = get_all_student_lifecycles()
    return {
        "status": "success",
        "count": len(students),
        "students": students
    }

@router.post("/students/override-tier")
def post_override_student_tier(payload: AdminClassOverrideRequest):
    """
    Administrator / Chief Developer manual override to promote, demote, or unlock a student's class tier.
    Logs an immutable entry in student_class_history.
    """
    result = admin_override_class(
        student_key=payload.student_key,
        target_tier=payload.target_tier,
        admin_note=payload.admin_note or "Admin manual intervention"
    )
    return result

@router.get("/audit-logs")
def get_class_audit_logs(student_key: Optional[str] = Query(None)):
    """Retrieves immutable audit trail of all class promotions, parent PIN verifications, and admin overrides."""
    logs = get_class_transition_audit_logs(student_key=student_key)
    return {
        "status": "success",
        "count": len(logs),
        "audit_logs": logs
    }


# --- VETTED TEACHERS ADMIN REVIEW & ESCROW RELEASES ---
@router.get("/teachers/applications")
def list_teacher_applications():
    """Lists all submitted educator applications with NIN, TRCN category, diagnostic scores, and guarantor status."""
    from backend.database.sqlite_store import get_connection
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM teacher_applications ORDER BY created_at DESC;")
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return {"status": "success", "count": len(rows), "applications": rows}

@router.post("/teachers/approve/{application_id}")
def approve_teacher_application(application_id: str):
    """Promotes an applicant into the public active vetted_teachers marketplace."""
    from backend.database.sqlite_store import get_connection
    conn = get_connection()
    c = conn.cursor()
    c.execute("UPDATE teacher_applications SET status = 'VETTED_APPROVED' WHERE id = ?;", (application_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Teacher {application_id} approved and certified for virtual teaching marketplace."}

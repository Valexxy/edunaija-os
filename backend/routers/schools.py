"""
School Directory, Sponsorship & In-App Advertising Marketplace Router
Enables premier Nigerian secondary schools and universities to promote admission openings,
showcase virtual prospectuses, and receive direct admissions enquiries in-platform.
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from backend.database.sqlite_store import get_connection, init_db

router = APIRouter(prefix="/schools", tags=["School Directory & Advertising Marketplace"])

class AdmissionEnquiryRequest(BaseModel):
    school_id: str
    student_name: str
    parent_name: str
    parent_phone: str
    parent_email: Optional[str] = None
    target_class: str = "SSS 1"
    academic_session: str = "2026/2027"
    notes: Optional[str] = None

class SchoolListingSponsorshipRequest(BaseModel):
    school_name: str
    state: str
    category: str = "Secondary"
    contact_person: str
    contact_phone: str
    contact_email: str
    requested_tier: str = "Gold Spotlight (₦150,000/term)"

DEFAULT_SCHOOLS = [
    {
        "id": "sch-001",
        "name": "King's College Lagos",
        "type": "Federal Unity College",
        "category": "Secondary",
        "state": "Lagos",
        "zone": "South West",
        "motto": "Spero Lucem (I Hope for Light)",
        "badge": "Gold Verified Partner",
        "tuition_band": "₦80,000 - ₦150,000 / term (Subsidized Federal)",
        "admission_status": "2026/2027 National Common Entrance & JSS1 Transfers Open",
        "curriculum": "NERDC National Curriculum + WASSCE / NECO",
        "highlights_json": '["Over 115 Years of Academic Excellence", "State-of-the-Art Science Laboratories", "Premier Boarding Facilities in Lagos Island & Victoria Island", "Consistently Top 1% in National WASSCE Results"]',
        "logo_url": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop",
        "phone": "+234 802 345 6789",
        "email": "admissions@kingscollegelagos.sch.ng",
        "is_featured": 1
    },
    {
        "id": "sch-002",
        "name": "Queen's College Yaba",
        "type": "Federal Unity College",
        "category": "Secondary",
        "state": "Lagos",
        "zone": "South West",
        "motto": "Pass On The Torch",
        "badge": "Gold Verified Partner",
        "tuition_band": "₦80,000 - ₦150,000 / term (Subsidized Federal)",
        "admission_status": "2026/2027 Entrance Examination Forms Available",
        "curriculum": "NERDC STEM Focus + Cambridge Checkpoint",
        "highlights_json": '["Flagship Girls Unity College in West Africa", "National Robotics & Olympiad Champions 2024", "Modern ICT Suites with High-Speed Zero-Rated Fibre", "Expansive Yaba Boarding Campus"]',
        "logo_url": "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=150&auto=format&fit=crop",
        "phone": "+234 803 456 7890",
        "email": "enquiries@queenscollegeyaba.sch.ng",
        "is_featured": 1
    },
    {
        "id": "sch-003",
        "name": "Corona Secondary School, Agbara",
        "type": "Premier Private College",
        "category": "Secondary",
        "state": "Ogun",
        "zone": "South West",
        "motto": "Nurturing Tomorrow's Leaders",
        "badge": "Diamond Spotlight",
        "tuition_band": "₦1,200,000 - ₦2,500,000 / term (Full Boarding)",
        "admission_status": "Scholarship Entrance Examination Dates Announced",
        "curriculum": "Dual British-Nigerian Curriculum (WASSCE + IGCSE)",
        "highlights_json": '["100% University Placement Rate in Top Global & Nigerian Universities", "Olympic-Standard Sports Complex & Swimming Arena", "NEASC & CIS International Accreditation", "Eco-Friendly 50-Acre Boarding Estate in Agbara"]',
        "logo_url": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop",
        "phone": "+234 805 678 1234",
        "email": "admissions@coronaschools.org",
        "is_featured": 1
    },
    {
        "id": "sch-004",
        "name": "Loyola Jesuit College, Abuja",
        "type": "Premier Private College",
        "category": "Secondary",
        "state": "FCT",
        "zone": "North Central",
        "motto": "Service of God and Others",
        "badge": "Diamond Spotlight",
        "tuition_band": "₦1,500,000 - ₦2,800,000 / session",
        "admission_status": "Annual National Competitive Entrance Exam Portal Active",
        "curriculum": "Rigorous Jesuit Classical & STEM Education",
        "highlights_json": '["Highest Average JAMB & WAEC Scores Nationwide for 15 Consecutive Years", "Strict Character, Moral & Intellectual Formation", "Full Co-Educational Residential Boarding", "Endowed Need-Blind Scholarship Scheme"]',
        "logo_url": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&auto=format&fit=crop",
        "phone": "+234 809 112 3344",
        "email": "admissions@loyolajesuit.org",
        "is_featured": 1
    },
    {
        "id": "sch-005",
        "name": "Government College Ibadan",
        "type": "Historic State Science Model",
        "category": "Secondary",
        "state": "Oyo",
        "zone": "South West",
        "motto": "Aut Optimum Aut Nihil (Either the Best or Nothing)",
        "badge": "Gold Verified Partner",
        "tuition_band": "₦50,000 - ₦100,000 / term",
        "admission_status": "Model Entrance Examination Registration Active",
        "curriculum": "NERDC Science & Technical Education",
        "highlights_json": '["Founded in 1929 - Alma Mater of Nobel Laureates and Scholars", "Extensive Multilingual Library & Heritage Museum", "GCIOBA Endowed Technology Labs and Innovation Hub", "Distinguished Track Record in National Mathematics Competitions"]',
        "logo_url": "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150&auto=format&fit=crop",
        "phone": "+234 802 998 7766",
        "email": "info@gci.sch.ng",
        "is_featured": 1
    },
    {
        "id": "sch-006",
        "name": "Covenant University, Ota",
        "type": "Premier Private University",
        "category": "Tertiary",
        "state": "Ogun",
        "zone": "South West",
        "motto": "Raising a New Generation of Leaders",
        "badge": "Diamond Spotlight",
        "tuition_band": "₦800,000 - ₦1,200,000 / session",
        "admission_status": "2026 Post-UTME Screening Application Ongoing",
        "curriculum": "NUC Accredited Engineering, Science, Business & Arts",
        "highlights_json": '["Ranked #1 University in Nigeria & Top 5 in Africa by Times Higher Education", "100% On-Campus High-Tech Residential Living", "Zero Strike Policy - Strictly Predictable Academic Calendar", "Cutting-Edge Biotechnology & Computational Research Centres"]',
        "logo_url": "https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop",
        "phone": "+234 812 345 6789",
        "email": "admissions@covenantuniversity.edu.ng",
        "is_featured": 1
    }
]

def ensure_tables():
    init_db()
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS sponsored_schools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        state TEXT NOT NULL,
        zone TEXT NOT NULL,
        motto TEXT NOT NULL,
        badge TEXT NOT NULL,
        tuition_band TEXT NOT NULL,
        admission_status TEXT NOT NULL,
        curriculum TEXT NOT NULL,
        highlights_json TEXT,
        logo_url TEXT,
        phone TEXT,
        email TEXT,
        views_count INTEGER DEFAULT 0,
        enquiries_count INTEGER DEFAULT 0,
        is_featured INTEGER DEFAULT 0,
        created_at TEXT
    )""")
    c.execute("""
    CREATE TABLE IF NOT EXISTS school_admissions_enquiries (
        id TEXT PRIMARY KEY,
        school_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        parent_name TEXT NOT NULL,
        parent_phone TEXT NOT NULL,
        parent_email TEXT,
        target_class TEXT NOT NULL,
        academic_session TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TEXT
    )""")
    c.execute("""
    CREATE TABLE IF NOT EXISTS school_sponsorship_leads (
        id TEXT PRIMARY KEY,
        school_name TEXT NOT NULL,
        state TEXT NOT NULL,
        category TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        contact_email TEXT NOT NULL,
        requested_tier TEXT NOT NULL,
        status TEXT DEFAULT 'pending_review',
        created_at TEXT
    )""")

    # Seed default schools if empty
    c.execute("SELECT COUNT(*) as cnt FROM sponsored_schools")
    if c.fetchone()["cnt"] == 0:
        now = datetime.now(timezone.utc).isoformat()
        for s in DEFAULT_SCHOOLS:
            c.execute("""
            INSERT INTO sponsored_schools (id, name, type, category, state, zone, motto, badge, tuition_band, admission_status, curriculum, highlights_json, logo_url, phone, email, is_featured, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                s["id"], s["name"], s["type"], s["category"], s["state"], s["zone"], s["motto"],
                s["badge"], s["tuition_band"], s["admission_status"], s["curriculum"],
                s["highlights_json"], s["logo_url"], s["phone"], s["email"], s["is_featured"], now
            ))
        conn.commit()
    conn.close()

ensure_tables()

@router.get("/directory")
async def get_schools_directory(
    category: Optional[str] = None,
    state: Optional[str] = None,
    query: Optional[str] = None,
    limit: int = 50
):
    ensure_tables()
    conn = get_connection()
    c = conn.cursor()
    sql = "SELECT * FROM sponsored_schools WHERE 1=1"
    params = []
    if category:
        sql += " AND category = ?"
        params.append(category)
    if state:
        sql += " AND state = ?"
        params.append(state)
    if query:
        sql += " AND (name LIKE ? OR motto LIKE ? OR curriculum LIKE ?)"
        term = f"%{query}%"
        params.extend([term, term, term])
    sql += " ORDER BY is_featured DESC, views_count DESC LIMIT ?"
    params.append(limit)

    c.execute(sql, params)
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return {"schools": rows, "count": len(rows)}

@router.get("/spotlight")
async def get_spotlight_schools():
    ensure_tables()
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM sponsored_schools WHERE is_featured = 1 ORDER BY views_count DESC LIMIT 4")
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return {"spotlights": rows}

@router.get("/{school_id}")
async def get_school_profile(school_id: str):
    ensure_tables()
    conn = get_connection()
    c = conn.cursor()
    c.execute("UPDATE sponsored_schools SET views_count = views_count + 1 WHERE id = ?", (school_id,))
    conn.commit()
    c.execute("SELECT * FROM sponsored_schools WHERE id = ?", (school_id,))
    row = c.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="School not found")
    return dict(row)

@router.post("/enquire")
async def submit_admission_enquiry(enquiry: AdmissionEnquiryRequest):
    ensure_tables()
    conn = get_connection()
    c = conn.cursor()
    enquiry_id = f"ENQ-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    c.execute("""
    INSERT INTO school_admissions_enquiries (id, school_id, student_name, parent_name, parent_phone, parent_email, target_class, academic_session, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        enquiry_id, enquiry.school_id, enquiry.student_name, enquiry.parent_name,
        enquiry.parent_phone, enquiry.parent_email, enquiry.target_class,
        enquiry.academic_session, enquiry.notes, now
    ))
    c.execute("UPDATE sponsored_schools SET enquiries_count = enquiries_count + 1 WHERE id = ?", (enquiry.school_id,))
    conn.commit()
    conn.close()
    return {
        "status": "success",
        "enquiry_id": enquiry_id,
        "message": "Admission enquiry received. The school's admissions office will contact you directly."
    }

@router.post("/sponsor-listing")
async def submit_sponsor_listing(req: SchoolListingSponsorshipRequest):
    ensure_tables()
    conn = get_connection()
    c = conn.cursor()
    lead_id = f"SPN-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    c.execute("""
    INSERT INTO school_sponsorship_leads (id, school_name, state, category, contact_person, contact_phone, contact_email, requested_tier, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        lead_id, req.school_name, req.state, req.category, req.contact_person,
        req.contact_phone, req.contact_email, req.requested_tier, now
    ))
    conn.commit()
    conn.close()
    return {
        "status": "received",
        "lead_id": lead_id,
        "message": "Your school listing request has been submitted. Our institutional partnerships team will activate your verified spotlight within 24 hours."
    }

@router.get("/enquiries/{school_id}")
async def get_school_enquiries(school_id: str):
    ensure_tables()
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM school_admissions_enquiries WHERE school_id = ? ORDER BY created_at DESC", (school_id,))
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return {"enquiries": rows, "count": len(rows)}

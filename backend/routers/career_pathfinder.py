"""
FastAPI Router for Course-to-Career Navigator & University 5.0 CGPA Simulator.
Positions EduNaija OS as an end-to-end higher education & economic empowerment platform.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/career", tags=["Career Navigator & CGPA Simulator"])

class CourseGradeEntry(BaseModel):
    course_code: str = Field(..., description="e.g. MTH 101, CHM 101, GST 101")
    units: int = Field(..., ge=1, le=6, description="Course credit units (1 to 6)")
    grade: str = Field(..., description="'A', 'B', 'C', 'D', 'E', or 'F'")

class CGPASimulationRequest(BaseModel):
    current_cgpa: Optional[float] = Field(0.0, ge=0.0, le=5.0)
    completed_units: Optional[int] = Field(0, ge=0)
    semester_courses: List[CourseGradeEntry]

GRADE_POINTS = {
    "A": 5.0,
    "B": 4.0,
    "C": 3.0,
    "D": 2.0,
    "E": 1.0,
    "F": 0.0
}

CAREER_PATHWAYS = [
    {
        "course": "Computer Science & Software Engineering",
        "faculty": "Science / Computing",
        "industry_sectors": ["Fintech & Payments", "AI & Cloud Infrastructure", "Cybersecurity", "Healthtech"],
        "top_employers_nigeria": ["Paystack (Stripe)", "Flutterwave", "Interswitch", "Microsoft ADC Lagos", "Moniepoint", "Kuda Bank", "Andela"],
        "entry_salary_band_naira": "₦350,000 – ₦850,000 / month",
        "certifications": ["AWS Cloud Practitioner", "Cisco CCNA", "Meta Frontend/Backend Specialization", "Certified Ethical Hacker (CEH)"],
        "siwes_internship_hotspots": ["Yaba Tech Hub (Lagos)", "Central Business District (Abuja)", "Trans-Amadi (Port Harcourt)"],
        "growth_index": "Exceptional (98/100)"
    },
    {
        "course": "Mechanical & Mechatronics Engineering",
        "faculty": "Engineering",
        "industry_sectors": ["Oil & Gas Operations", "Refinery & Petrochemicals", "Automotive & EV Assembly", "Heavy Manufacturing"],
        "top_employers_nigeria": ["Dangote Petroleum Refinery (Lekki)", "Nigeria LNG (Bonny Island)", "Shell Nigeria (SPDC)", "Chevron Nigeria", "Innoson Vehicle Manufacturing (Nnewi)", "NLNG"],
        "entry_salary_band_naira": "₦300,000 – ₦750,000 / month",
        "certifications": ["COREN Registered Engineer", "Nigerian Society of Engineers (NSE)", "AutoCAD / SolidWorks Professional", "API 510/570"],
        "siwes_internship_hotspots": ["Lekki Free Zone (Lagos)", "Bonny Island (Rivers)", "Warri Refining Complex (Delta)"],
        "growth_index": "High (92/100)"
    },
    {
        "course": "Medicine & Surgery (MBBS)",
        "faculty": "Clinical Sciences",
        "industry_sectors": ["Tertiary Healthcare", "Surgical Centers", "Biomedical Research", "Public Health Epidemiology"],
        "top_employers_nigeria": ["Lagos University Teaching Hospital (LUTH)", "University College Hospital (UCH Ibadan)", "National Hospital Abuja", "Lagoon Hospitals", "Federal Medical Centers (FMCs)"],
        "entry_salary_band_naira": "₦280,000 – ₦550,000 / month (Housemanship)",
        "certifications": ["Medical and Dental Council of Nigeria (MDCN) License", "Primary Fellowship (WACS / NPMCN)", "BLS / ACLS Certification"],
        "siwes_internship_hotspots": ["Teaching Hospitals across all 36 States"],
        "growth_index": "Critical National Demand (99/100)"
    },
    {
        "course": "Accounting & Finance",
        "faculty": "Management Sciences",
        "industry_sectors": ["Tier-1 Commercial Banking", "Audit & Forensic Accounting", "Fintech Advisory", "Tax Consultancy"],
        "top_employers_nigeria": ["PwC Nigeria", "KPMG Nigeria", "Deloitte", "Ernst & Young (EY)", "Zenith Bank", "Access Holdings", "Guaranty Trust Bank (GTCO)"],
        "entry_salary_band_naira": "₦250,000 – ₦600,000 / month",
        "certifications": ["Institute of Chartered Accountants of Nigeria (ICAN)", "ACCA (UK)", "CFA Institute Level 1", "Chartered Institute of Taxation (CITN)"],
        "siwes_internship_hotspots": ["Marina / Victoria Island (Lagos)", "Central Business District (Abuja)"],
        "growth_index": "High (89/100)"
    },
    {
        "course": "Law & Commercial Practice (LL.B)",
        "faculty": "Law",
        "industry_sectors": ["Corporate Mergers & Acquisitions", "Energy & Maritime Law", "Tech & IP Regulation", "Litigation & Arbitration"],
        "top_employers_nigeria": ["Aluko & Oyebode", "Banwo & Ighodalo", "Olaniwun Ajayi LP", "G. Elias & Co.", "Federal Ministry of Justice", "In-House Counsel at Telecoms/Banks"],
        "entry_salary_band_naira": "₦220,000 – ₦650,000 / month",
        "certifications": ["Nigerian Bar Association (NBA) Call to Bar (B.L)", "Chartered Institute of Arbitrators (CIArb)", "Institute of Chartered Secretaries (ICSAN)"],
        "siwes_internship_hotspots": ["Commercial Law Chambers (Lagos, Abuja, Port Harcourt)"],
        "growth_index": "Very High (91/100)"
    },
    {
        "course": "Pharmacy (B.Pharm / Pharm.D)",
        "faculty": "Pharmacy",
        "industry_sectors": ["Pharmaceutical Manufacturing", "Clinical Hospital Pharmacy", "Drug Regulatory Affairs", "Community Pharmacy Chains"],
        "top_employers_nigeria": ["Emzor Pharmaceuticals", "Fidson Healthcare Plc", "May & Baker Nigeria", "National Agency for Food & Drug Admin (NAFDAC)", "HealthPlus / Medplus Chains"],
        "entry_salary_band_naira": "₦240,000 – ₦500,000 / month",
        "certifications": ["Pharmacists Council of Nigeria (PCN) License", "West African Postgraduate College of Pharmacists (WAPCP)"],
        "siwes_internship_hotspots": ["Industrial Pharma Estates (Ikeja, Ogba, Otta)"],
        "growth_index": "High (90/100)"
    },
    {
        "course": "Economics & Data Analytics",
        "faculty": "Social Sciences",
        "industry_sectors": ["Macroeconomic Research", "Investment Banking & Equities", "Business Intelligence", "Policy Institutes"],
        "top_employers_nigeria": ["Central Bank of Nigeria (CBN)", "Nigerian Exchange Group (NGX)", "Chapel Hill Denham", "Stanbic IBTC Capital", "United Capital Plc", "McKinsey Lagos"],
        "entry_salary_band_naira": "₦280,000 – ₦700,000 / month",
        "certifications": ["Chartered Financial Analyst (CFA)", "Tableau / PowerBI Data Analyst Associate", "Chartered Institute of Stockbrokers (CIS)"],
        "siwes_internship_hotspots": ["Financial Institutions (Lagos Island, Abuja)"],
        "growth_index": "High (93/100)"
    },
    {
        "course": "Agricultural & Bioresources Engineering",
        "faculty": "Agriculture / Engineering",
        "industry_sectors": ["Agro-Processing Mechanization", "Smart Irrigation & Climate Tech", "Commercial Commodity Export"],
        "top_employers_nigeria": ["Olam Nigeria", "Flour Mills of Nigeria", "Presco Plc", "Golden Agri-Resources", "Federal Ministry of Agriculture & Food Security"],
        "entry_salary_band_naira": "₦200,000 – ₦500,000 / month",
        "certifications": ["COREN Registered Engineer", "Nigerian Institution of Agricultural Engineers (NIAE)"],
        "siwes_internship_hotspots": ["Agro-Industrial Farms (Ogun, Edo, Kaduna, Benue)"],
        "growth_index": "Rising (88/100)"
    }
]

@router.get("/paths")
def get_career_pathways():
    """Returns curated Nigerian undergraduate course-to-career mappings."""
    return {
        "status": "success",
        "total_careers_mapped": len(CAREER_PATHWAYS),
        "pathways": CAREER_PATHWAYS
    }

@router.post("/cgpa-simulate")
def calculate_cgpa(req: CGPASimulationRequest):
    """
    Simulates semester GPA and overall cumulative CGPA on official 5.0 Nigerian scale:
    First Class: 4.50 – 5.00
    Second Class Upper (2:1): 3.50 – 4.49
    Second Class Lower (2:2): 2.40 – 3.49
    Third Class: 1.50 – 2.39
    Pass: 1.00 – 1.49
    """
    if not req.semester_courses:
        raise HTTPException(status_code=400, detail="Must provide at least one course for semester calculation.")

    semester_total_points = 0.0
    semester_total_units = 0

    for c in req.semester_courses:
        grade_letter = c.grade.upper().strip()
        point = GRADE_POINTS.get(grade_letter, 0.0)
        semester_total_points += point * c.units
        semester_total_units += c.units

    if semester_total_units == 0:
        raise HTTPException(status_code=400, detail="Total semester units cannot be zero.")

    semester_gpa = round(semester_total_points / semester_total_units, 2)

    # Compute overall cumulative
    prev_points = (req.current_cgpa or 0.0) * (req.completed_units or 0)
    total_cumulative_points = prev_points + semester_total_points
    total_cumulative_units = (req.completed_units or 0) + semester_total_units
    cumulative_cgpa = round(total_cumulative_points / total_cumulative_units, 2)

    # Classification
    if cumulative_cgpa >= 4.50:
        classification = "First Class Honours (Distinction)"
        verdict = "Outstanding! You are on track for Dean's Honour Roll, Federal Scholarships, and High-Tier Global Fellowships."
        badge = "🏆 First Class Scholar"
    elif cumulative_cgpa >= 3.50:
        classification = "Second Class Honours (Upper Division / 2:1)"
        verdict = "Very Strong! You qualify for top corporate graduate trainee programs (Tier-1 Banks, FMCG, Tech)."
        badge = "✨ Second Class Upper"
    elif cumulative_cgpa >= 2.40:
        classification = "Second Class Honours (Lower Division / 2:2)"
        verdict = "Good Foundation. Target B+ and A grades in remaining core 3-unit courses to elevate toward a 2:1."
        badge = "📈 Second Class Lower"
    elif cumulative_cgpa >= 1.50:
        classification = "Third Class"
        verdict = "Academic Intervention Recommended. Utilize Question Autopsy Labs and Socratic Mentor drills to recover points."
        badge = "⚠️ Academic Focus Needed"
    else:
        classification = "Pass / Probation Risk"
        verdict = "Urgent consultation with Departmental Course Adviser required."
        badge = "🚨 Probation Alert"

    return {
        "status": "success",
        "semester_units": semester_total_units,
        "semester_gpa": semester_gpa,
        "cumulative_units": total_cumulative_units,
        "cumulative_cgpa": cumulative_cgpa,
        "classification": classification,
        "verdict": verdict,
        "badge": badge,
        "first_class_cutoff": 4.50
    }

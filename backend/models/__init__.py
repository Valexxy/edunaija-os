from enum import Enum
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class PlanType(str, Enum):
    CRAM_PASS = "cram_pass"
    SEASON_PASS = "season_pass"
    PARENT_DASHBOARD = "parent_dashboard"
    B2B_LICENSE = "b2b_license"

class ExamType(str, Enum):
    JAMB = "jamb"
    WAEC = "waec"

class SubjectCode(str, Enum):
    MATH = "math"
    ENG = "eng"
    PHY = "phy"
    CHEM = "chem"
    BIO = "bio"

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    EXPIRED = "expired"

class User(BaseModel):
    id: str
    phone: Optional[str]
    telegram_id: Optional[str]
    hearts: int = 20
    referral_code: Optional[str]

class Parent(BaseModel):
    id: str
    phone: str
    student_id: str

class Subscription(BaseModel):
    id: str
    user_id: str
    plan_type: PlanType
    status: SubscriptionStatus
    expires_at: datetime
    payment_ref: str

class PastQuestion(BaseModel):
    id: str
    exam_type: ExamType
    subject: SubjectCode
    year: int
    question: str
    options: List[str]
    correct_answer: str

class QuizQuestion(BaseModel):
    """The model returned to the bot after RAG retrieval."""
    id: Optional[str] = None
    question: str
    options: dict  # {"A": "...", "B": "...", "C": "...", "D": "..."}
    correct_answer: str
    explanation: str
    subject: str
    year: Optional[int] = None
    exam_type: str = "JAMB"
    confidence: float = 1.0

class GradeResult(BaseModel):
    """Result of grading a student's answer."""
    question_id: str
    is_correct: bool
    selected_option: str
    correct_option: str
    explanation: str
    xp_earned: int
    mastery_delta: float  # Change in topic mastery score


class QuizSession(BaseModel):
    id: str
    user_id: str
    subject: SubjectCode
    started_at: datetime

class UserAnswer(BaseModel):
    id: str
    user_id: str
    question_id: str
    selected_option: str
    is_correct: bool
    created_at: datetime

class WeakTopic(BaseModel):
    user_id: str
    subject: SubjectCode
    topic: str
    failure_rate: float

class Referral(BaseModel):
    referrer_id: str
    referred_id: str
    status: str

class Payment(BaseModel):
    id: str
    user_id: str
    amount: int
    plan_type: PlanType
    reference: str
    status: str

class HeartTransaction(BaseModel):
    user_id: str
    amount: int
    reason: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str
    explanation: str
    subject: str
    confidence: float

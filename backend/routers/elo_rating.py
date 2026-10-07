"""
Elo/MMR Academic Rating Engine
Dual-sided rating: Student vs Peer and Student vs Question difficulty.
Dynamic K-factor and streak velocity multipliers.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
from datetime import datetime, timezone
from backend.database.sqlite_store import get_connection, init_db

router = APIRouter(prefix="/elo", tags=["Academic Elo & MMR Rating Engine"])

MMR_TIERS = [
    (0, 999, "Bronze"),
    (1000, 1199, "Silver"),
    (1200, 1399, "Gold"),
    (1400, 1599, "Platinum"),
    (1600, 1799, "Diamond"),
    (1800, 1999, "Master"),
    (2000, 99999, "Champions League"),
]

def get_mmr_tier(rating: int) -> str:
    for low, high, tier in MMR_TIERS:
        if low <= rating <= high:
            return tier
    return "Bronze"

def compute_k_factor(battles_played: int, current_rating: int, streak: int) -> float:
    if battles_played < 10:
        k_base = 48.0
    elif battles_played < 50 or current_rating < 2100:
        k_base = 32.0
    else:
        k_base = 16.0
    streak_mult = 1.0 + 0.05 * min(streak, 6)
    return k_base * streak_mult

def expected_score(rating_a: int, rating_b: int) -> float:
    return 1.0 / (1.0 + 10 ** ((rating_b - rating_a) / 400.0))

class BattleResult(BaseModel):
    winner_key: str
    loser_key: str
    time_ratio: float = 0.5

class QuestionOutcome(BaseModel):
    user_key: str
    question_difficulty_rating: int = 1200
    is_correct: bool
    time_ratio: float = 0.5

@router.post("/battle")
async def record_battle(result: BattleResult):
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    def get_or_create(key: str):
        cursor.execute("SELECT * FROM student_elo_ratings WHERE user_key = ?", (key,))
        row = cursor.fetchone()
        if not row:
            cursor.execute("INSERT INTO student_elo_ratings (user_key, elo_rating, mmr_tier, battles_played, battles_won, current_streak, updated_at) VALUES (?, 1200, 'Gold', 0, 0, 0, ?)", (key, now))
            conn.commit()
            cursor.execute("SELECT * FROM student_elo_ratings WHERE user_key = ?", (key,))
            row = cursor.fetchone()
        return dict(row)
    winner = get_or_create(result.winner_key)
    loser = get_or_create(result.loser_key)
    speed_mult = 1.15 if result.time_ratio < 0.25 else (0.80 if result.time_ratio > 0.95 else 1.0)
    k_w = compute_k_factor(winner['battles_played'], winner['elo_rating'], winner['current_streak']) * speed_mult
    k_l = compute_k_factor(loser['battles_played'], loser['elo_rating'], 0)
    e_w = expected_score(winner['elo_rating'], loser['elo_rating'])
    e_l = 1.0 - e_w
    delta_w = int(k_w * (1.0 - e_w))
    delta_l = int(k_l * (0.0 - e_l))
    new_w = max(0, winner['elo_rating'] + delta_w)
    new_l = max(0, loser['elo_rating'] + delta_l)
    cursor.execute("UPDATE student_elo_ratings SET elo_rating=?, mmr_tier=?, battles_played=battles_played+1, battles_won=battles_won+1, current_streak=current_streak+1, updated_at=? WHERE user_key=?",
    (new_w, get_mmr_tier(new_w), now, result.winner_key))
    cursor.execute("UPDATE student_elo_ratings SET elo_rating=?, mmr_tier=?, battles_played=battles_played+1, current_streak=0, updated_at=? WHERE user_key=?",
    (new_l, get_mmr_tier(new_l), now, result.loser_key))
    conn.commit()
    conn.close()
    return {"winner": {"key": result.winner_key, "new_rating": new_w, "delta": delta_w, "tier": get_mmr_tier(new_w)},
            "loser": {"key": result.loser_key, "new_rating": new_l, "delta": delta_l, "tier": get_mmr_tier(new_l)}}

@router.post("/question-outcome")
async def record_question_outcome(outcome: QuestionOutcome):
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    cursor.execute("SELECT * FROM student_elo_ratings WHERE user_key = ?", (outcome.user_key,))
    row = cursor.fetchone()
    if not row:
        cursor.execute("INSERT INTO student_elo_ratings (user_key, elo_rating, mmr_tier, battles_played, battles_won, current_streak, updated_at) VALUES (?, 1200, 'Gold', 0, 0, 0, ?)", (outcome.user_key, now))
        conn.commit()
        cursor.execute("SELECT * FROM student_elo_ratings WHERE user_key = ?", (outcome.user_key,))
        row = cursor.fetchone()
    student = dict(row)
    e_a = expected_score(student['elo_rating'], outcome.question_difficulty_rating)
    s_a = 1.0 if outcome.is_correct else 0.0
    speed_mult = 1.15 if outcome.time_ratio < 0.25 else (0.80 if outcome.time_ratio > 0.95 else 1.0)
    k = compute_k_factor(student['battles_played'], student['elo_rating'], student['current_streak']) * speed_mult
    delta = int(k * (s_a - e_a))
    new_rating = max(0, student['elo_rating'] + delta)
    new_streak = (student['current_streak'] + 1) if outcome.is_correct else 0
    cursor.execute("UPDATE student_elo_ratings SET elo_rating=?, mmr_tier=?, battles_played=battles_played+1, current_streak=?, updated_at=? WHERE user_key=?",
    (new_rating, get_mmr_tier(new_rating), new_streak, now, outcome.user_key))
    conn.commit()
    conn.close()
    return {"user_key": outcome.user_key, "new_rating": new_rating, "delta": delta, "tier": get_mmr_tier(new_rating), "streak": new_streak}

@router.get("/{user_key}")
async def get_student_rating(user_key: str):
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM student_elo_ratings WHERE user_key = ?", (user_key,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {"user_key": user_key, "elo_rating": 1200, "mmr_tier": "Gold", "battles_played": 0, "battles_won": 0, "current_streak": 0}
    return dict(row)

@router.get("/rankings/top")
async def top_elo_rankings(limit: int = 50):
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT er.user_key, er.elo_rating, er.mmr_tier, er.battles_played, er.battles_won, er.current_streak,
           u.full_name, u.state
    FROM student_elo_ratings er
    LEFT JOIN users u ON u.registration_key = er.user_key
    ORDER BY er.elo_rating DESC LIMIT ?""", (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"rankings": rows}

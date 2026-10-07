"""
FSRS v4 Implementation for EduNaija OS
Based on: https://github.com/open-spaced-repetition/fsrs4anki
"""

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional, List, Tuple
import math

@dataclass
class FSRSCard:
    card_id: str
    student_id: str
    topic_id: str  
    stability: float = 1.0    # Days until forgetting (default: review in 1 day)
    difficulty: float = 5.0   # 1-10 scale (5 = average difficulty)
    last_review: Optional[datetime] = None
    next_review: Optional[datetime] = None
    reps: int = 0
    lapses: int = 0
    state: str = 'new'  # new | learning | review | relearning

@dataclass  
class ReviewLog:
    card_id: str
    student_id: str
    rating: int  # 1=Again, 2=Hard, 3=Good, 4=Easy
    reviewed_at: datetime
    stability_before: float
    difficulty_before: float
    next_interval_days: float

class FSRSEngine:
    """
    Free Spaced Repetition Scheduler (FSRS) v4
    """
    def __init__(self):
        # Default FSRS v4 weights (w0 to w16)
        self.w = [
            0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01,
            1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61
        ]
        self.request_retention = 0.9  # Target 90% retention
        self.decay = -0.5
        self.factor = 19 / 81

    def _init_stability(self, rating: int) -> float:
        return max(0.1, self.w[rating - 1])

    def _init_difficulty(self, rating: int) -> float:
        return min(max(self.w[4] - self.w[5] * (rating - 3), 1.0), 10.0)

    def calculate_retention(self, card: FSRSCard, now: datetime = None) -> float:
        """Current % probability of remembering"""
        if card.state == 'new' or card.last_review is None:
            return 0.0
        now = now or datetime.now()
        t = max(0, (now - card.last_review).total_seconds() / 86400.0)
        # R(t) = (1 + factor * t / S) ^ decay
        return (1.0 + self.factor * t / card.stability) ** self.decay

    def _next_interval(self, stability: float) -> float:
        # I(r) = S / factor * (r ^ (1 / decay) - 1)
        return stability / self.factor * (self.request_retention ** (1 / self.decay) - 1.0)

    def _next_difficulty(self, d: float, rating: int) -> float:
        next_d = d - self.w[6] * (rating - 3)
        return min(max(self.mean_reversion(self.w[4], next_d), 1.0), 10.0)

    def mean_reversion(self, init: float, current: float) -> float:
        return self.w[7] * init + (1 - self.w[7]) * current

    def _next_stability_recall(self, d: float, s: float, r: float, rating: int) -> float:
        hard_penalty = self.w[15] if rating == 2 else 1.0
        easy_bonus = self.w[16] if rating == 4 else 1.0
        return s * (1 + math.exp(self.w[8]) *
                    (11 - d) *
                    math.pow(s, -self.w[9]) *
                    (math.exp((1 - r) * self.w[10]) - 1) *
                    hard_penalty * easy_bonus)

    def _next_stability_forget(self, d: float, s: float, r: float) -> float:
        return self.w[11] * math.pow(d, -self.w[12]) * \
               math.pow(s + 1, self.w[13]) * \
               math.exp((1 - r) * self.w[14])

    def repeat(self, card: FSRSCard, rating: int, now: datetime = None) -> Tuple[FSRSCard, ReviewLog]:
        """Process a review and return the updated card + log."""
        now = now or datetime.now()
        card = FSRSCard(**card.__dict__)  # Clone to avoid mutability issues
        
        stability_before = card.stability
        difficulty_before = card.difficulty

        if card.state == 'new':
            card.stability = self._init_stability(rating)
            card.difficulty = self._init_difficulty(rating)
            card.state = 'learning' if rating == 1 else 'review'
        elif card.state in ['learning', 'relearning']:
            if rating == 1:
                card.stability = self._init_stability(rating)
                card.difficulty = self._init_difficulty(rating)
            else:
                card.state = 'review'
        elif card.state == 'review':
            r = self.calculate_retention(card, now)
            card.difficulty = self._next_difficulty(card.difficulty, rating)
            
            if rating == 1:
                card.stability = self._next_stability_forget(card.difficulty, card.stability, r)
                card.lapses += 1
                card.state = 'relearning'
            else:
                card.stability = self._next_stability_recall(card.difficulty, card.stability, r, rating)
        
        card.reps += 1
        card.last_review = now
        
        interval = self._next_interval(card.stability)
        card.next_review = now + timedelta(days=interval)

        log = ReviewLog(
            card_id=card.card_id,
            student_id=card.student_id,
            rating=rating,
            reviewed_at=now,
            stability_before=stability_before,
            difficulty_before=difficulty_before,
            next_interval_days=interval
        )
        return card, log

    def get_due_cards(self, cards: List[FSRSCard], limit: int = 10, now: datetime = None) -> List[FSRSCard]:
        """Filter cards due for review today"""
        now = now or datetime.now()
        due = [c for c in cards if c.next_review is None or c.next_review <= now]
        return sorted(due, key=lambda c: (c.next_review or datetime.min))[:limit]

    def predict_review_load(self, cards: List[FSRSCard], days: int = 7, now: datetime = None) -> dict:
        """How many reviews due in next 7 days"""
        now = now or datetime.now()
        counts = {i: 0 for i in range(days)}
        for card in cards:
            if card.next_review is None:
                counts[0] += 1
            else:
                delta_days = (card.next_review - now).days
                if 0 <= delta_days < days:
                    counts[delta_days] += 1
        return counts

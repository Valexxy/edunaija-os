"""
Bayesian Knowledge Tracing (BKT) for EduNaija OS

For each student x topic pair, BKT maintains:
- P(L0): Prior probability student knew concept before (0.3 default)
- P(T): Probability of transitioning from not-knowing to knowing (0.09)
- P(G): Probability of guessing correctly without knowing (0.2)
- P(S): Probability of slipping (knowing but answering wrong) (0.1)

After each answer: Update P(L) using Bayes' rule
"""

from typing import List, Dict, Optional, Tuple

class BKTModel:
    # Default parameters calibrated for Nigerian exam patterns (e.g., JAMB 5-option MCQs)
    DEFAULT_P_INIT = 0.3   # Prior knowledge
    DEFAULT_P_TRANSIT = 0.09  # Learning rate  
    DEFAULT_P_GUESS = 0.2   # Guess probability for MCQ (1/5 options)
    DEFAULT_P_SLIP = 0.1    # Slip probability
    
    MASTERY_THRESHOLD = 0.95  # Consider topic mastered when P(L) > 0.95
    
    def __init__(self, p_init=DEFAULT_P_INIT, p_transit=DEFAULT_P_TRANSIT, p_guess=DEFAULT_P_GUESS, p_slip=DEFAULT_P_SLIP):
        self.p_init = p_init
        self.p_transit = p_transit
        self.p_guess = p_guess
        self.p_slip = p_slip

    def update(self, p_l: float, correct: bool, p_g: Optional[float] = None, p_s: Optional[float] = None, p_t: Optional[float] = None) -> float:
        """Update P(L) after observing student response using Bayes' Rule"""
        pg = p_g if p_g is not None else self.p_guess
        ps = p_s if p_s is not None else self.p_slip
        pt = p_t if p_t is not None else self.p_transit

        if correct:
            # P(L | Correct) = [P(L) * (1 - P(S))] / [P(L) * (1 - P(S)) + (1 - P(L)) * P(G)]
            p_l_obs = (p_l * (1 - ps)) / (p_l * (1 - ps) + (1 - p_l) * pg)
        else:
            # P(L | Incorrect) = [P(L) * P(S)] / [P(L) * P(S) + (1 - P(L)) * (1 - P(G))]
            p_l_obs = (p_l * ps) / (p_l * ps + (1 - p_l) * (1 - pg))
            
        # P(L_next) = P(L | Obs) + (1 - P(L | Obs)) * P(T)
        p_l_next = p_l_obs + (1 - p_l_obs) * pt
        
        return min(max(p_l_next, 0.0), 1.0)
    
    def predict_correctness(self, p_l: float, p_g: Optional[float] = None, p_s: Optional[float] = None) -> float:
        """Probability student gets next question right"""
        pg = p_g if p_g is not None else self.p_guess
        ps = p_s if p_s is not None else self.p_slip
        # P(correct) = P(L)*(1-P(S)) + (1-P(L))*P(G)
        return p_l * (1 - ps) + (1 - p_l) * pg
    
    def is_mastered(self, p_l: float) -> bool:
        """Check if mastery threshold is met"""
        return p_l >= self.MASTERY_THRESHOLD
    
    def get_topic_mastery(self, student_id: str, topic_id: str, supabase_client) -> float:
        """Fetch from Supabase and compute current P(L)"""
        # Stub implementation assuming a supabase client interface
        try:
            res = supabase_client.table('student_mastery').select('p_l').eq('student_id', student_id).eq('topic_id', topic_id).execute()
            if res.data and len(res.data) > 0:
                return float(res.data[0]['p_l'])
        except Exception:
            pass
        return self.p_init
    
    def update_from_answer(self, student_id: str, topic_id: str, correct: bool, supabase_client) -> float:
        """Full pipeline: fetch -> update -> store"""
        current_p_l = self.get_topic_mastery(student_id, topic_id, supabase_client)
        new_p_l = self.update(current_p_l, correct)
        
        # Store back to DB
        try:
            supabase_client.table('student_mastery').upsert({
                'student_id': student_id,
                'topic_id': topic_id,
                'p_l': new_p_l,
                'is_mastered': self.is_mastered(new_p_l)
            }).execute()
        except Exception:
            pass
            
        return new_p_l
    
    def get_weakest_topics(self, student_id: str, subject: str, supabase_client, limit: int = 5) -> List[Dict]:
        """Return topics with lowest P(L) for targeted practice"""
        try:
            res = supabase_client.table('student_mastery')\
                .select('topic_id, p_l')\
                .eq('student_id', student_id)\
                .eq('subject', subject)\
                .order('p_l', desc=False)\
                .limit(limit)\
                .execute()
            return res.data if res.data else []
        except Exception:
            return []

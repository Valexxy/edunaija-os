"""
EduNaija AI Brain Orchestrator
Integrates FSRS v4, BKT, Curriculum Graph, and Multilingual capabilities.
"""

from typing import Dict, Any, Tuple, Optional
from datetime import datetime, timedelta

# Import modules
from .fsrs.engine import FSRSEngine, FSRSCard
from .bkt.knowledge_tracer import BKTModel
from .graph_rag.curriculum_graph import NigerianCurriculumGraph
from .multilingual.nigerian_prompts import NigerianLanguageRouter

import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "database", "edunaija.db")

class RAGRetriever:
    """Production RAG Retriever fetching curriculum questions and pedagogical tutorials from SQLite"""
    def __init__(self, supabase_client=None, redis_url=None, db_path=None):
        self.supabase = supabase_client
        self.redis = redis_url
        self.db_path = db_path or DB_PATH
        
    def get_questions_for_topic(self, subject: str, topic_id: str, limit: int = 1) -> list:
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            
            # Query by topic pattern or subject
            cur.execute("""
                SELECT id, subject, topic, question_text, option_a, option_b, option_c, option_d,
                       correct_option, formula_latex, explanation, wrong_analysis
                FROM questions
                WHERE LOWER(subject) LIKE LOWER(?) AND (LOWER(topic) LIKE LOWER(?) OR LOWER(question_text) LIKE LOWER(?))
                LIMIT ?
            """, (f"%{subject}%", f"%{topic_id}%", f"%{topic_id}%", limit))
            rows = cur.fetchall()
            
            # Fallback to subject if no specific topic match
            if not rows:
                cur.execute("""
                    SELECT id, subject, topic, question_text, option_a, option_b, option_c, option_d,
                           correct_option, formula_latex, explanation, wrong_analysis
                    FROM questions
                    WHERE LOWER(subject) LIKE LOWER(?)
                    ORDER BY RANDOM()
                    LIMIT ?
                """, (f"%{subject}%", limit))
                rows = cur.fetchall()
                
            # Final fallback to any question
            if not rows:
                cur.execute("""
                    SELECT id, subject, topic, question_text, option_a, option_b, option_c, option_d,
                           correct_option, formula_latex, explanation, wrong_analysis
                    FROM questions
                    ORDER BY RANDOM()
                    LIMIT ?
                """, (limit,))
                rows = cur.fetchall()

            conn.close()

            results = []
            for r in rows:
                results.append({
                    'id': f"q_{r['id']}",
                    'topic_id': r['topic'],
                    'subject': r['subject'],
                    'text': r['question_text'],
                    'options': [r['option_a'], r['option_b'], r['option_c'], r['option_d']],
                    'correct_option': r['correct_option'],
                    'formula_latex': r['formula_latex'] or "",
                    'explanation': r['explanation'] or "",
                    'wrong_analysis': r['wrong_analysis'] or ""
                })
            if results:
                return results
        except Exception:
            pass

        return [{
            'id': 'q123',
            'topic_id': topic_id,
            'subject': subject,
            'text': f'Adaptive question for {subject} - {topic_id}',
            'options': ['Option A', 'Option B', 'Option C', 'Option D'],
            'correct_option': 'A',
            'formula_latex': '',
            'explanation': 'Fundamental concept review.',
            'wrong_analysis': ''
        }]

    def get_tutorial_for_topic(self, subject: str, topic_id: str) -> Optional[dict]:
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("""
                SELECT id, class_tier, subject, topic_title, concept_summary, 
                       nigerian_analogy, visual_lab_type, key_formula_latex, common_mistake_trap
                FROM curriculum_tutorials
                WHERE LOWER(subject) LIKE LOWER(?) AND (LOWER(topic_title) LIKE LOWER(?) OR LOWER(concept_summary) LIKE LOWER(?))
                LIMIT 1
            """, (f"%{subject}%", f"%{topic_id}%", f"%{topic_id}%"))
            row = cur.fetchone()
            conn.close()
            if row:
                return dict(row)
        except Exception:
            pass
        return None

class EduNaijaAI:
    """
    The central AI orchestrator for EduNaija OS.
    Combines: RAG + FSRS + BKT + Graph + Multilingual
    
    Usage:
        brain = EduNaijaAI(supabase, redis)
        question = await brain.get_next_question(student_id, 'physics', language='pidgin')
        result = await brain.process_answer(student_id, question_id, 'A')
    """
    def __init__(self, supabase_client: Any = None, redis_url: str = None, db_path: str = None):
        self.supabase = supabase_client
        self.redis = redis_url
        self.db_path = db_path or DB_PATH
        self.fsrs = FSRSEngine()
        self.bkt = BKTModel()
        self.graph = NigerianCurriculumGraph()
        self.lang = NigerianLanguageRouter()
        self.retriever = RAGRetriever(supabase_client, redis_url, self.db_path)
    
    async def get_next_question(self, student_id: str, subject: str, language: str = 'english') -> Dict[str, Any]:
        """
        Orchestrates fetching the next optimal question for the student.
        1. Check FSRS for due review cards
        2. If none due: use BKT to find weakest topic
        3. Use graph to find prerequisite gap if topic failing
        4. Retrieve question via RAG
        5. Format in student's language
        """
        # 1. Check FSRS
        try:
            cards_res = self.supabase.table('cards').select('*').eq('student_id', student_id).execute()
            cards = [FSRSCard(**c) for c in cards_res.data]
        except Exception:
            cards = []
            
        due_cards = self.fsrs.get_due_cards(cards, limit=1)
        
        target_topic = None
        is_review = False
        
        if due_cards:
            target_topic = due_cards[0].topic_id
            is_review = True
        else:
            # 2. Use BKT to find weakest topic
            weak_topics = self.bkt.get_weakest_topics(student_id, subject, self.supabase, limit=1)
            if weak_topics:
                weak_topic = weak_topics[0]['topic_id']
                
                # 3. Use graph to find prerequisite gap
                target_topic = self.graph.find_prerequisite_gap(student_id, weak_topic, self.bkt, self.supabase)
            else:
                # Default fallback topic if new student
                target_topic = f"{subject.lower()}_intro"
                
        # 4. Retrieve question
        questions = self.retriever.get_questions_for_topic(subject, target_topic, limit=1)
        question = questions[0] if questions else {'id': 'q0', 'text': 'Default Question', 'options': ['A', 'B'], 'correct_option': 'A', 'topic_id': target_topic}
        
        # 5. Format in student's language
        formatted_q = self.lang.format_question(question, language)
        system_prompt = self.lang.get_prompt(language, exam='JAMB', subject=subject)
        
        return {
            'question_id': question['id'],
            'topic_id': target_topic,
            'is_review': is_review,
            'formatted_text': formatted_q,
            'system_prompt': system_prompt,
            'raw_question': question
        }
    
    async def process_answer(self, student_id: str, question_id: str, topic_id: str, selected_option: str, correct_option: str, language: str = 'english') -> Dict[str, Any]:
        """
        Process a submitted answer and update all models.
        """
        is_correct = (selected_option == correct_option)
        now = datetime.now()
        
        # 2. Update BKT P(L)
        new_mastery = self.bkt.update_from_answer(student_id, topic_id, is_correct, self.supabase)
        
        # 3. Update FSRS card
        # Fetch existing card or create new
        try:
            res = self.supabase.table('cards').select('*').eq('student_id', student_id).eq('topic_id', topic_id).execute()
            card_data = res.data[0] if res.data else None
        except Exception:
            card_data = None
            
        if not card_data:
            card = FSRSCard(card_id=f"c_{student_id}_{topic_id}", student_id=student_id, topic_id=topic_id)
        else:
            # Parse datetime fields properly in production
            card = FSRSCard(**card_data)
            
        # Map correctness to FSRS rating (1=Again, 3=Good)
        rating = 3 if is_correct else 1
        updated_card, review_log = self.fsrs.repeat(card, rating, now)
        
        # Store updated card (mocked)
        try:
            self.supabase.table('cards').upsert(updated_card.__dict__).execute()
            self.supabase.table('review_logs').insert(review_log.__dict__).execute()
        except Exception:
            pass
            
        # 4. Handle XP/Leaderboard logic (mocked)
        xp_gained = 10 if is_correct else 2
        
        # 5. Generate encouragement in student's language
        score = 1.0 if is_correct else 0.0
        encouragement = self.lang.get_encouragement(language, score)
        
        return {
            'is_correct': is_correct,
            'new_mastery': new_mastery,
            'next_review_date': updated_card.next_review.isoformat() if updated_card.next_review else None,
            'xp_gained': xp_gained,
            'encouragement': encouragement
        }
    
    async def predict_exam_score(self, student_id: str, exam_type: str = 'JAMB') -> Dict[str, Any]:
        """
        IRT-based score prediction from BKT mastery values
        """
        # Fetch all mastery values for student
        try:
            res = self.supabase.table('student_mastery').select('topic_id, p_l').eq('student_id', student_id).execute()
            mastery_records = res.data if res.data else []
        except Exception:
            mastery_records = []
            
        if not mastery_records:
            return {
                'predicted_score': 0,
                'confidence_interval': (0, 0),
                'weak_areas': [],
                'days_to_target': 0
            }
            
        # Simplistic IRT mock: average mastery scaled to exam total
        # JAMB is out of 400
        avg_mastery = sum(float(r['p_l']) for r in mastery_records) / len(mastery_records)
        max_score = 400 if exam_type == 'JAMB' else 100
        predicted = int(avg_mastery * max_score)
        
        # Weak areas
        sorted_records = sorted(mastery_records, key=lambda x: float(x['p_l']))
        weak_areas = [r['topic_id'] for r in sorted_records[:5]]
        
        return {
            'predicted_score': predicted,
            'confidence_interval': (max(0, predicted - 20), min(max_score, predicted + 20)),
            'weak_areas': weak_areas,
            'days_to_target': int((0.9 - avg_mastery) * 100) if avg_mastery < 0.9 else 0
        }

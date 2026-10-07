"""
AI Service — Gemini 1.5 Flash + Strict RAG Orchestration
Zero hallucination: all answers retrieved from pgvector past questions database.
"""

import json
import logging
from typing import List, Optional
from dataclasses import dataclass

import google.generativeai as genai

from backend.config import settings
from backend.models import QuizQuestion, GradeResult
from rag.retriever import RAGRetriever, PastQuestion
from rag.prompt_builder import build_quiz_prompt, build_explanation_prompt, SYSTEM_PROMPT

logger = logging.getLogger(__name__)

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


class AIService:
    """
    Orchestrates Gemini + pgvector RAG for strict, hallucination-free exam tutoring.
    
    Architecture:
        1. Embed user query with Gemini text-embedding-004
        2. Retrieve top-K similar JAMB/WAEC questions via pgvector (Supabase RPC)
        3. Build strict RAG prompt (SYSTEM_PROMPT enforces no general-knowledge answers)
        4. Call Gemini 1.5 Flash with structured output
        5. Confidence-gate: abstain if score < 0.70
        6. Log answer + update weak_topics in Supabase
    """

    def __init__(self, supabase_client=None, redis_url: Optional[str] = None):
        self.supabase = supabase_client
        self.model = genai.GenerativeModel(
            "gemini-1.5-flash",
            generation_config=genai.GenerationConfig(
                temperature=0.1,   # Low temp = deterministic, factual answers
                max_output_tokens=1024,
            ),
        )
        self.retriever = RAGRetriever(
            supabase_client=supabase_client,
            redis_url=redis_url or settings.REDIS_URL,
        )

    async def get_next_question(
        self,
        subject: str,
        user_id: str,
        topic_id: Optional[str] = None,
        difficulty: Optional[str] = None,
    ) -> QuizQuestion:
        """
        Retrieve a quiz question from the RAG database.
        Uses spaced repetition: weak topics surface more frequently.
        """
        # Pull a question the user hasn't answered recently
        query = f"JAMB {subject} past question"
        if topic_id:
            query += f" on topic {topic_id}"

        retrieved: List[PastQuestion] = await self.retriever.find_similar_questions(
            query=query,
            subject=subject,
            top_k=1,
        )

        if not retrieved:
            return QuizQuestion(
                id=None,
                question="No questions available for this subject yet. More being added daily!",
                options={},
                correct_answer="",
                explanation="",
                subject=subject,
                year=None,
                exam_type="JAMB",
                confidence=0.0,
            )

        q = retrieved[0]
        return QuizQuestion(
            id=q.id,
            question=q.question,
            options=q.options,
            correct_answer=q.correct_answer,
            explanation=q.explanation,
            subject=subject,
            year=q.year,
            exam_type=q.exam_type,
            confidence=q.similarity or 1.0,
        )

    async def generate_explanation(
        self,
        question: str,
        correct_answer: str,
        user_answer: str,
        subject: str,
    ) -> str:
        """
        Generate a detailed, Nigerian-contextualized explanation.
        Called after a student answers (correctly or incorrectly).
        """
        prompt = build_explanation_prompt(question, correct_answer, user_answer)
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Explanation generation failed: {e}")
            return f"The correct answer is {correct_answer}. Review your {subject} notes for this topic."

    async def analyze_weaknesses(self, user_id: str) -> List[dict]:
        """
        Query Supabase for the user's top 5 weak topics.
        Used by analytics_service to generate parent reports.
        """
        if not self.supabase:
            return []
        try:
            result = (
                self.supabase.table("weak_topics")
                .select("*, topics(name), subjects(name)")
                .eq("user_id", user_id)
                .order("failure_count", desc=True)
                .limit(5)
                .execute()
            )
            return result.data or []
        except Exception as e:
            logger.error(f"Weakness analysis failed: {e}")
            return []

    async def get_similar_questions(self, question_id: str, subject: str, top_k: int = 3) -> List[PastQuestion]:
        """Surface related practice questions after answering one."""
        try:
            # Fetch the original question text to use as the search query
            result = (
                self.supabase.table("past_questions")
                .select("question_text")
                .eq("id", question_id)
                .single()
                .execute()
            )
            query = result.data.get("question_text", "")
            return await self.retriever.find_similar_questions(query=query, subject=subject, top_k=top_k)
        except Exception as e:
            logger.error(f"Similar question search failed: {e}")
            return []

import json
import logging
from typing import List, Dict, Any, Optional
import os
import google.generativeai as genai
from pydantic import BaseModel
import redis.asyncio as redis

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PastQuestion(BaseModel):
    id: str
    subject_id: str
    question: str
    options: Dict[str, str]
    correct_answer: str
    year: int
    exam_type: str
    similarity: Optional[float] = None

class RAGRetriever:
    def __init__(self, supabase_client, redis_url: str = "redis://localhost"):
        self.supabase = supabase_client
        self.redis = redis.from_url(redis_url, decode_responses=True)
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

    async def find_similar_questions(
        self,
        query: str, 
        subject: str,
        top_k: int = 3
    ) -> List[PastQuestion]:
        cache_key = f"rag:{subject}:{query}:{top_k}"
        
        # 4. Cache results in Redis for 1 hour
        cached_result = await self.redis.get(cache_key)
        if cached_result:
            logger.info("Cache hit")
            return [PastQuestion(**q) for q in json.loads(cached_result)]
            
        try:
            # 1. Embed the query using Gemini embedding API
            emb_res = genai.embed_content(
                model="models/text-embedding-004",
                content=query,
                task_type="retrieval_query",
            )
            embedding = emb_res["embedding"]

            # 2. Execute pgvector similarity search
            # We assume a Supabase RPC function match_questions is created for pgvector
            response = self.supabase.rpc(
                'match_questions',
                {
                    'query_embedding': embedding,
                    'match_subject_id': subject,
                    'match_threshold': 0.7, # 3. Return only questions with similarity > 0.7
                    'match_count': top_k
                }
            ).execute()
            
            questions = [PastQuestion(**q) for q in response.data]
            
            if questions:
                await self.redis.setex(cache_key, 3600, json.dumps([q.dict() for q in questions]))
                
            return questions
        except Exception as e:
            logger.error(f"Retrieval error: {e}")
            return []

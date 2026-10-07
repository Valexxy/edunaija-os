import asyncio
from datetime import datetime, timedelta
import random
import string
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class CompetitionRoom:
    def __init__(self, room_id: str, supabase_client):
        self.room_id = room_id
        self.supabase = supabase_client
        self.current_question_index = 0
        self.questions: List[dict] = []
        self.participants: Dict[str, dict] = {}
        self.question_start_time: Optional[datetime] = None
        self.status = "waiting" # waiting, active, finished
        
    @classmethod
    def _generate_room_code(cls, length=6) -> str:
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
    
    @classmethod
    async def create(cls, host_id: str, subject: str, supabase_client) -> 'CompetitionRoom':
        """Create a new competition room"""
        room_code = cls._generate_room_code()
        logger.info(f"Room {room_code} created by {host_id} for {subject}")
        room = cls(room_code, supabase_client)
        room.subject = subject
        return room
    
    async def join(self, user_id: str) -> dict:
        """Player joins room"""
        if self.status != "waiting":
            return {"error": "Room is already active or finished"}
            
        self.participants[user_id] = {
            "score": 0,
            "streak": 0,
            "answers": []
        }
        logger.info(f"User {user_id} joined room {self.room_id}")
        return {"status": "joined", "room_id": self.room_id}
    
    async def start(self):
        """Host starts the competition"""
        self.status = "active"
        self.questions = [{"id": i, "answer": "A"} for i in range(30)]
        self.current_question_index = 0
        logger.info(f"Room {self.room_id} started")
        await self.next_question()
    
    async def submit_answer(self, user_id: str, selected_option: str) -> dict:
        """Process a player's answer"""
        if self.status != "active":
            return {"error": "Competition not active"}
            
        if user_id not in self.participants:
            return {"error": "Not in room"}
            
        if not self.question_start_time:
            return {"error": "Question not started"}
            
        current_q = self.questions[self.current_question_index]
        is_correct = (selected_option == current_q['answer'])
        time_taken = int((datetime.utcnow() - self.question_start_time).total_seconds() * 1000)
        
        participant = self.participants[user_id]
        
        if is_correct:
            participant["streak"] += 1
            score_earned = self._calculate_score(is_correct, time_taken, participant["streak"])
            participant["score"] += score_earned
        else:
            participant["streak"] = 0
            score_earned = 0
            
        return {
            "is_correct": is_correct,
            "explanation": "Mock explanation",
            "score_earned": score_earned,
            "current_score": participant["score"]
        }
    
    async def next_question(self):
        """Advance to next question"""
        if self.current_question_index >= len(self.questions) - 1:
            await self.end_competition()
            return
            
        self.current_question_index += 1
        self.question_start_time = datetime.utcnow()
        logger.info(f"Room {self.room_id} advanced to question {self.current_question_index}")
    
    async def end_competition(self):
        """End competition"""
        self.status = "finished"
        logger.info(f"Room {self.room_id} finished")
    
    def _calculate_score(self, is_correct: bool, time_taken_ms: int, streak: int) -> int:
        """Scoring formula"""
        if not is_correct:
            return 0
        base = 10
        speed_bonus = 5 if time_taken_ms < 5000 else (3 if time_taken_ms < 10000 else 1)
        streak_bonus = min(streak * 2, 10)
        return base + speed_bonus + streak_bonus

class CompetitionManager:
    """Global manager for all active rooms"""
    def __init__(self, supabase_client):
        self.rooms: Dict[str, CompetitionRoom] = {}
        self.supabase = supabase_client
    
    async def create_room(self, host_id: str, subject: str) -> str:
        room = await CompetitionRoom.create(host_id, subject, self.supabase)
        self.rooms[room.room_id] = room
        return room.room_id
        
    async def join_room(self, room_code: str, user_id: str) -> dict:
        if room_code not in self.rooms:
            return {"error": "Room not found"}
        return await self.rooms[room_code].join(user_id)
        
    async def submit_answer(self, room_code: str, user_id: str, answer: str) -> dict:
        if room_code not in self.rooms:
            return {"error": "Room not found"}
        return await self.rooms[room_code].submit_answer(user_id, answer)
        
    async def get_live_leaderboard(self, room_code: str) -> list:
        if room_code not in self.rooms:
            return []
        room = self.rooms[room_code]
        board = [
            {"user_id": uid, "score": data["score"]}
            for uid, data in room.participants.items()
        ]
        board.sort(key=lambda x: x["score"], reverse=True)
        return board

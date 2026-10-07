import json
from typing import Optional

class USSDSession:
    """Manages multi-step USSD conversations using Redis"""
    
    SESSION_TTL = 180  # seconds (USSD sessions timeout in 3 minutes)
    
    def __init__(self, redis_client):
        self.redis = redis_client
    
    async def get_state(self, session_id: str) -> dict:
        """Retrieve the current state of a USSD session."""
        data = await self.redis.get(f"ussd:session:{session_id}")
        if data:
            return json.loads(data)
        return {}
    
    async def set_state(self, session_id: str, state: dict):
        """Save the current state of a USSD session."""
        await self.redis.setex(
            f"ussd:session:{session_id}",
            self.SESSION_TTL,
            json.dumps(state)
        )
    
    async def clear_session(self, session_id: str):
        """Clear session data."""
        await self.redis.delete(f"ussd:session:{session_id}")
    
    async def get_current_question(self, session_id: str) -> Optional[dict]:
        """Convenience method to get current question data."""
        state = await self.get_state(session_id)
        if state.get("step") == "answer":
            return {
                "q_id": state.get("q_id"),
                "subject": state.get("subject"),
                "correct": state.get("correct")
            }
        return None
    
    async def mark_answered(self, session_id: str, answer: str):
        """Update session state to indicate question was answered."""
        state = await self.get_state(session_id)
        state["last_answer"] = answer
        await self.set_state(session_id, state)

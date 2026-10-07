from typing import Optional
import logging

logger = logging.getLogger(__name__)

async def handle_sprint_command(update, context):
    """
    Handles /sprint commands.
    /sprint - List active rooms
    /sprint create PHYSICS - Create room
    /sprint join JAMB8X - Join room
    """
    message = update.get("message", "")
    user_id = update.get("user_id", "unknown")
    parts = message.split()
    
    if len(parts) == 1:
        return "Active sprint rooms: [None]"
        
    action = parts[1].lower()
    
    if action == "create" and len(parts) > 2:
        subject = parts[2].upper()
        room_code = "JAMB8X"
        return f"Created {subject} sprint room! Code: {room_code}"
        
    elif action == "join" and len(parts) > 2:
        room_code = parts[2].upper()
        return f"Joined sprint room {room_code}! Waiting for host to start..."
        
    return "Invalid command. Usage: /sprint [create/join] [SUBJECT/CODE]"

async def send_live_score(user_id: str, score: int, rank: int):
    pass

async def send_trophy_announcement(room_code: str, winner_name: str, score: int):
    pass

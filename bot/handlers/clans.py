import logging

logger = logging.getLogger(__name__)

async def handle_clan_command(update, context):
    """
    Handles /clan commands.
    /clan - View your clan
    /clan create [name] - Create new clan
    /clan join [code] - Join by invite code
    /clan war [clan_id] - Challenge another clan
    /clan leaderboard - Top clans in your state
    """
    message = update.get("message", "")
    parts = message.split()
    
    if len(parts) == 1:
        return "You are not in a clan yet."
        
    action = parts[1].lower()
    
    if action == "create" and len(parts) > 2:
        name = " ".join(parts[2:])
        return f"Clan '{name}' created successfully! Invite code: XYZ123"
        
    elif action == "join" and len(parts) > 2:
        code = parts[2].upper()
        return f"Joined clan with code {code}!"
        
    elif action == "war" and len(parts) > 2:
        target = parts[2]
        return f"War challenged against {target}!"
        
    elif action == "leaderboard":
        return "🏆 Top Clans in Lagos:\\n1. Alpha Scholars - 5000 XP\\n2. Beta Brains - 4500 XP"
        
    return "Invalid command."

import uuid
from typing import Dict, List, Optional

class ClanManager:
    def __init__(self):
        self.clans = {}
        self.users_clan = {}
        
    async def create_clan(self, leader_id: str, name: str, school: str, state: str) -> dict:
        clan_id = str(uuid.uuid4())
        invite_code = clan_id[:6].upper()
        
        clan = {
            "id": clan_id,
            "name": name,
            "leader_id": leader_id,
            "school": school,
            "state": state,
            "invite_code": invite_code,
            "members": [leader_id],
            "xp": 0
        }
        self.clans[clan_id] = clan
        self.users_clan[leader_id] = clan_id
        return clan

    async def join_clan(self, user_id: str, invite_code: str) -> dict:
        for clan in self.clans.values():
            if clan["invite_code"] == invite_code:
                if user_id not in clan["members"]:
                    clan["members"].append(user_id)
                    self.users_clan[user_id] = clan["id"]
                return {"status": "joined", "clan": clan}
        return {"error": "Invalid invite code"}

    async def leave_clan(self, user_id: str, clan_id: str) -> dict:
        if clan_id in self.clans:
            clan = self.clans[clan_id]
            if user_id in clan["members"]:
                clan["members"].remove(user_id)
                self.users_clan.pop(user_id, None)
                return {"status": "left"}
        return {"error": "Clan or user not found"}

    async def challenge_to_war(self, challenger_clan_id: str, defender_clan_id: str, subject: str) -> dict:
        if challenger_clan_id not in self.clans or defender_clan_id not in self.clans:
            return {"error": "Clan not found"}
        return {
            "status": "war_started",
            "challenger": challenger_clan_id,
            "defender": defender_clan_id,
            "subject": subject
        }

    async def get_clan_leaderboard(self, state: str = None) -> list:
        clans_list = list(self.clans.values())
        if state:
            clans_list = [c for c in clans_list if c["state"] == state]
        clans_list.sort(key=lambda x: x["xp"], reverse=True)
        return clans_list

    async def update_clan_xp(self, clan_id: str, xp_gained: int):
        if clan_id in self.clans:
            self.clans[clan_id]["xp"] += xp_gained

    async def get_weekly_clan_rankings(self) -> list:
        return await self.get_clan_leaderboard()

    async def get_nearby_clans(self, user_state: str) -> list:
        return await self.get_clan_leaderboard(state=user_state)

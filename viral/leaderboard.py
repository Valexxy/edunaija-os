class LeaderboardSystem:
    def __init__(self, redis_client):
        self.redis = redis_client
        
    def calculate_score(self, correct_answers: int, streak_days: int, speed_bonus: int) -> int:
        return (correct_answers * 10) + (streak_days * 5) + speed_bonus

    async def update_score(self, user_id: str, xp_gained: int):
        await self.redis.zincrby("global_leaderboard:alltime", xp_gained, user_id)
        await self.redis.zincrby("global_leaderboard:weekly", xp_gained, user_id)
        await self.redis.zincrby("global_leaderboard:daily", xp_gained, user_id)

    async def get_global_leaderboard(self, period: str, limit: int = 10):
        key = f"global_leaderboard:{period}"
        return await self.redis.zrevrange(key, 0, limit - 1, withscores=True)

    async def get_subject_leaderboard(self, subject_id: str, period: str, limit: int = 10):
        key = f"subject_leaderboard:{subject_id}:{period}"
        return await self.redis.zrevrange(key, 0, limit - 1, withscores=True)

    async def get_user_rank(self, user_id: str, period: str):
        key = f"global_leaderboard:{period}"
        rank = await self.redis.zrevrank(key, user_id)
        return rank + 1 if rank is not None else None

    async def get_nearby_ranks(self, user_id: str, period: str, range_val: int = 5):
        key = f"global_leaderboard:{period}"
        rank = await self.redis.zrevrank(key, user_id)
        if rank is None:
            return []
            
        start = max(0, rank - range_val)
        end = rank + range_val
        return await self.redis.zrevrange(key, start, end, withscores=True)

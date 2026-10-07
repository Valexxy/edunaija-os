import datetime

class StreakSystem:
    def __init__(self, db_client):
        self.db = db_client

    async def check_and_update_streak(self, user_id: str):
        user = await self.db.get_user(user_id)
        today = datetime.date.today()
        
        if user.last_practice_date == today:
            return # Already practiced today
            
        if user.last_practice_date == today - datetime.timedelta(days=1):
            new_streak = user.streak_days + 1
        else:
            # Check freeze
            if user.streak_freezes > 0:
                user.streak_freezes -= 1
                new_streak = user.streak_days + 1
            else:
                new_streak = 1
                
        await self.db.update_user(user_id, streak_days=new_streak, last_practice_date=today)
        
        # Award bonuses
        if new_streak == 3:
            await self.db.add_hearts(user_id, 5)
        elif new_streak == 7:
            await self.db.add_hearts(user_id, 10)
        elif new_streak == 30:
            await self.db.award_season_pass(user_id, days=1)

    def get_streak_message(self, days: int) -> str:
        if days == 1:
            return "E don start! 🔥 Keep going!"
        elif days == 7:
            return "You sabi pass! 🔥🔥🔥 One week straight!"
        elif days >= 30:
            return "E be like say JAMB fear you! 🔥🔥🔥🔥🔥"
        return f"{days} days down! Omo you're trying! 🔥"

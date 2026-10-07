import logging
from typing import Optional
from backend.config import settings

logger = logging.getLogger(__name__)

class HeartService:
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client

    async def get_hearts(self, user_id: str) -> int:
        if self.supabase:
            res = self.supabase.table('users').select('hearts').eq('id', user_id).execute()
            if res.data:
                return res.data[0].get('hearts', 0)
        return 0

    async def deduct_heart(self, user_id: str) -> bool:
        if await self.check_cram_pass(user_id):
            return True
            
        hearts = await self.get_hearts(user_id)
        if hearts > 0:
            if self.supabase:
                self.supabase.table('users').update({'hearts': hearts - 1}).eq('id', user_id).execute()
            return True
        return False

    async def refill_hearts(self, user_id: str, amount: int, reason: str):
        hearts = await self.get_hearts(user_id)
        if self.supabase:
            self.supabase.table('users').update({'hearts': hearts + amount}).eq('id', user_id).execute()
            self.supabase.table('heart_transactions').insert({
                'user_id': user_id,
                'amount': amount,
                'reason': reason
            }).execute()

    async def daily_refill_all(self):
        # In a real system, this would be a bulk update or handled via a database cron job
        logger.info(f"Refilling all users to {settings.DAILY_HEART_LIMIT} hearts")
        if self.supabase:
            # Pseudocode for bulk update where hearts < DAILY_HEART_LIMIT
            pass

    async def check_cram_pass(self, user_id: str) -> bool:
        if self.supabase:
            res = self.supabase.table('subscriptions').select('status', 'plan_type').eq('user_id', user_id).eq('status', 'active').execute()
            for sub in res.data:
                if sub.get('plan_type') in ['cram_pass', 'season_pass']:
                    return True
        return False

    async def award_referral_hearts(self, referrer_id: str, amount: int = 10):
        await self.refill_hearts(referrer_id, amount, "referral_reward")

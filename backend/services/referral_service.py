import random
import string
import logging

logger = logging.getLogger(__name__)

class ReferralService:
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client

    async def generate_referral_code(self, user_id: str) -> str:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        if self.supabase:
            self.supabase.table('users').update({'referral_code': code}).eq('id', user_id).execute()
        return code

    async def process_referral(self, referral_code: str, new_user_id: str):
        # Validate + reward
        if self.supabase:
            res = self.supabase.table('users').select('id').eq('referral_code', referral_code).execute()
            if res.data:
                referrer_id = res.data[0]['id']
                # Fraud check could go here
                self.supabase.table('referrals').insert({
                    'referrer_id': referrer_id,
                    'referred_id': new_user_id,
                    'status': 'completed'
                }).execute()
                # Award hearts (via HeartService)
                logger.info(f"Referral processed: {referrer_id} referred {new_user_id}")

    async def get_referral_stats(self, user_id: str) -> dict:
        return {"count": 0, "rewards": 0, "chain": 0}

    async def validate_whatsapp_share(self, user_id: str, group_count: int = 3) -> bool:
        # Fraud detection, minimum 24hr between referral rewards etc.
        return group_count >= 3

class ReferralEngine:
    def __init__(self, db_client):
        self.db = db_client

    def create_referral_link(self, user_id: str) -> str:
        return f"https://t.me/jambtutor_bot?start=REF_{user_id}"

    async def process_join_via_referral(self, referral_code: str, new_user_id: str):
        referrer_id = referral_code.replace("REF_", "")
        if referrer_id != new_user_id:
            await self.db.record_referral(referrer_id, new_user_id)
            count = await self.db.get_referral_count(referrer_id)
            
            # Milestone rewards
            if count == 3:
                await self.db.add_hearts(referrer_id, 10)
            elif count == 10:
                await self.db.award_season_pass(referrer_id, days=7)
            elif count == 50:
                await self.db.award_season_pass(referrer_id, days=30)
                await self.db.assign_role(referrer_id, "ambassador")

    async def check_whatsapp_share_count(self, user_id: str) -> int:
        clicks = await self.db.get_referral_clicks(user_id)
        unique_groups = set([click.source_id for click in clicks if click.source == 'whatsapp'])
        return len(unique_groups)
        
    def calculate_viral_coefficient(self, invites_sent: int, conversion_rate: float) -> float:
        return invites_sent * conversion_rate

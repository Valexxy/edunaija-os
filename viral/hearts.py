from typing import Optional
from pydantic import BaseModel

class ViralPrompt(BaseModel):
    message_template: str
    share_link: str

class HeartResult(BaseModel):
    success: bool
    remaining_hearts: int
    viral_prompt: Optional[ViralPrompt] = None

class HeartSystem:
    DAILY_FREE_HEARTS = 20
    CRAM_PASS_HEARTS = -1  # Unlimited (-1 = infinite)
    REFERRAL_3_GROUPS = 10  # Hearts for sharing to 3 groups
    
    def __init__(self, db_client):
        self.db = db_client

    async def consume_heart(self, user_id: str) -> HeartResult:
        user = await self.db.get_user(user_id)
        if user.hearts == self.CRAM_PASS_HEARTS:
            return HeartResult(success=True, remaining_hearts=-1)
            
        if user.hearts <= 0:
            prompt = await self.viral_refill_flow(user_id)
            return HeartResult(success=False, remaining_hearts=0, viral_prompt=prompt)
            
        new_hearts = user.hearts - 1
        await self.db.update_user(user_id, hearts=new_hearts)
        
        if new_hearts == 0:
            prompt = await self.viral_refill_flow(user_id)
            return HeartResult(success=True, remaining_hearts=0, viral_prompt=prompt)
            
        return HeartResult(success=True, remaining_hearts=new_hearts)
    
    async def viral_refill_flow(self, user_id: str) -> ViralPrompt:
        share_link = f"https://t.me/jambtutor_bot?start=REF_{user_id}"
        message_template = f"Guy! I'm practicing JAMB past questions with this AI Tutor. It explains like a human! Try it out: {share_link}"
        return ViralPrompt(message_template=message_template, share_link=share_link)
    
    async def check_share_completion(self, user_id: str) -> bool:
        clicks = await self.db.get_referral_clicks(user_id)
        if len(set(clicks)) >= 3:
            user = await self.db.get_user(user_id)
            await self.db.update_user(user_id, hearts=user.hearts + self.REFERRAL_3_GROUPS)
            return True
        return False

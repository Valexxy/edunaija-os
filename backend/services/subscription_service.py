from datetime import datetime, timedelta
import logging
from backend.models import PlanType, SubscriptionStatus

logger = logging.getLogger(__name__)

class SubscriptionService:
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self.plan_benefits = {
            PlanType.CRAM_PASS: {"unlimited_hearts": True, "duration_days": 7},
            PlanType.SEASON_PASS: {"unlimited_hearts": True, "duration_days": 30},
            PlanType.PARENT_DASHBOARD: {"parent_reports": True, "duration_days": 30},
            PlanType.B2B_LICENSE: {"bulk_users": True, "duration_days": 365}
        }

    async def activate_subscription(self, user_id: str, plan_type: PlanType, payment_ref: str):
        benefits = self.plan_benefits.get(plan_type)
        if not benefits:
            return
            
        expires_at = datetime.utcnow() + timedelta(days=benefits["duration_days"])
        if self.supabase:
            self.supabase.table('subscriptions').upsert({
                'user_id': user_id,
                'plan_type': plan_type.value,
                'status': SubscriptionStatus.ACTIVE.value,
                'payment_ref': payment_ref,
                'expires_at': expires_at.isoformat()
            }).execute()
        logger.info(f"Activated {plan_type} for user {user_id}")

    async def check_subscription(self, user_id: str) -> SubscriptionStatus:
        if self.supabase:
            res = self.supabase.table('subscriptions').select('status', 'expires_at').eq('user_id', user_id).execute()
            if res.data:
                sub = res.data[0]
                if sub['status'] == SubscriptionStatus.ACTIVE.value:
                    if datetime.fromisoformat(sub['expires_at'].replace('Z', '+00:00')) > datetime.now(datetime.timezone.utc):
                        return SubscriptionStatus.ACTIVE
                    else:
                        # Mark as expired
                        self.supabase.table('subscriptions').update({'status': SubscriptionStatus.EXPIRED.value}).eq('user_id', user_id).execute()
                        return SubscriptionStatus.EXPIRED
        return SubscriptionStatus.INACTIVE

    async def get_expired_subscriptions(self) -> list:
        if self.supabase:
            res = self.supabase.table('subscriptions').select('*').eq('status', 'active').lt('expires_at', datetime.utcnow().isoformat()).execute()
            return res.data
        return []

    async def extend_subscription(self, user_id: str, days: int):
        if self.supabase:
            res = self.supabase.table('subscriptions').select('expires_at').eq('user_id', user_id).eq('status', 'active').execute()
            if res.data:
                current_expiry = datetime.fromisoformat(res.data[0]['expires_at'].replace('Z', '+00:00'))
                new_expiry = current_expiry + timedelta(days=days)
                self.supabase.table('subscriptions').update({'expires_at': new_expiry.isoformat()}).eq('user_id', user_id).execute()

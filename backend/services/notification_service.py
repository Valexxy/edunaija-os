import logging
import httpx
from backend.config import settings

logger = logging.getLogger(__name__)

class NotificationService:
    async def send_sms(self, phone: str, message: str):
        if not settings.AFRICAS_TALKING_API_KEY:
            logger.warning("Africa's Talking API key not set, skipping SMS")
            return
            
        url = "https://api.africastalking.com/version1/messaging"
        headers = {
            "ApiKey": settings.AFRICAS_TALKING_API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        }
        data = {
            "username": settings.AFRICAS_TALKING_USERNAME,
            "to": phone,
            "message": message
        }
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(url, headers=headers, data=data)
                res.raise_for_status()
                logger.info(f"SMS sent to {phone}")
            except Exception as e:
                logger.error(f"Failed to send SMS to {phone}: {e}")

    async def send_whatsapp(self, phone: str, message: str):
        if not settings.N8N_WEBHOOK_URL:
            logger.warning("n8n webhook URL not set, skipping WhatsApp")
            return
            
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(settings.N8N_WEBHOOK_URL, json={"phone": phone, "message": message, "type": "whatsapp"})
                res.raise_for_status()
                logger.info(f"WhatsApp sent to {phone} via n8n")
            except Exception as e:
                logger.error(f"Failed to send WhatsApp to {phone}: {e}")

    async def send_parent_weekly_report(self, parent_id: str, report_data: dict):
        # Format + send
        message = f"Weekly Report for student: Accuracy {report_data.get('performance', {}).get('accuracy', 0)*100}%"
        # In real life, fetch parent phone
        phone = "+2348000000000" 
        await self.send_whatsapp(phone, message)

    async def send_payment_confirmation(self, user_id: str, plan: str):
        if settings.TELEGRAM_BOT_TOKEN:
            url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
            payload = {"chat_id": user_id, "text": f"Payment for {plan} confirmed! Thank you."}
            async with httpx.AsyncClient() as client:
                await client.post(url, json=payload)

    async def send_streak_reminder(self, user_id: str):
        pass

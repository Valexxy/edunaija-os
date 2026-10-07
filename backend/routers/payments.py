import hmac
import hashlib
import json
import logging
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
import httpx

from backend.config import settings
from backend.models import PlanType
# In a real app, inject these services
# from backend.services.subscription_service import activate_subscription
# from backend.services.notification_service import send_payment_confirmation, notify_via_n8n

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/initialize")
async def initialize_payment(user_id: str, plan_type: PlanType):
    price_map = {
        PlanType.CRAM_PASS: settings.CRAM_PASS_PRICE_KOBO,
        PlanType.SEASON_PASS: settings.SEASON_PASS_PRICE_KOBO,
        PlanType.PARENT_DASHBOARD: settings.PARENT_DASHBOARD_PRICE_KOBO,
        PlanType.B2B_LICENSE: settings.B2B_LICENSE_PRICE_KOBO
    }
    amount = price_map.get(plan_type)
    if not amount:
        raise HTTPException(status_code=400, detail="Invalid plan type")
    
    # Normally, create payment record in DB here with 'pending' status
    
    async with httpx.AsyncClient() as client:
        url = "https://api.paystack.co/transaction/initialize"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        # In production, use user's real email
        payload = {
            "email": f"{user_id}@jamb-ai-tutor.local", 
            "amount": amount,
            "metadata": {
                "user_id": user_id,
                "plan_type": plan_type.value
            }
        }
        response = await client.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            logger.error(f"Paystack initialize error: {response.text}")
            raise HTTPException(status_code=500, detail="Failed to initialize payment")
            
        data = response.json().get("data", {})
        return {
            "payment_url": data.get("authorization_url"),
            "reference": data.get("reference")
        }

@router.post("/webhook")
async def paystack_webhook(request: Request, background_tasks: BackgroundTasks):
    signature = request.headers.get("x-paystack-signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")
        
    body = await request.body()
    expected_signature = hmac.new(
        settings.PAYSTACK_SECRET_KEY.encode('utf-8'),
        body,
        hashlib.sha512
    ).hexdigest()
    
    if signature != expected_signature:
        raise HTTPException(status_code=400, detail="Invalid signature")
        
    event_data = json.loads(body)
    
    if event_data.get("event") == "charge.success":
        data = event_data.get("data", {})
        metadata = data.get("metadata", {})
        user_id = metadata.get("user_id")
        plan_type = metadata.get("plan_type")
        reference = data.get("reference")
        
        if user_id and plan_type:
            # background_tasks.add_task(activate_subscription, user_id, plan_type, reference)
            # background_tasks.add_task(notify_via_n8n, user_id, plan_type)
            # background_tasks.add_task(send_payment_confirmation, user_id, plan_type)
            logger.info(f"Payment successful for user {user_id}, plan {plan_type}")
            
    return {"status": "ok"}

@router.get("/verify/{reference}")
async def verify_payment(reference: str):
    async with httpx.AsyncClient() as client:
        url = f"https://api.paystack.co/transaction/verify/{reference}"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        }
        response = await client.get(url, headers=headers)
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to verify payment")
            
        data = response.json().get("data", {})
        return {
            "status": data.get("status"),
            "reference": data.get("reference")
        }

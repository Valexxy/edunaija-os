from fastapi import APIRouter, Request
import httpx
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/whatsapp', tags=['whatsapp'])

# Twilio webhook endpoint
@router.post('/webhook')
async def whatsapp_webhook(request: Request):
    """
    Handle incoming WhatsApp messages.
    Twilio sends POST with form data: From, Body, MediaUrl, etc.
    """
    form = await request.form()
    sender = form.get('From')  # 'whatsapp:+2348012345678'
    message = form.get('Body', '').strip().upper()
    
    if not sender:
        return {"status": "error", "message": "Missing sender"}
        
    try:
        # Route by message content
        if message in ['HI', 'HELLO', 'START', 'JAMB']:
            return await handle_start(sender)
        elif message.startswith('QUIZ'):
            return await handle_quiz_request(sender, message)
        elif message in ['A', 'B', 'C', 'D']:
            return await handle_answer(sender, message)
        elif message == 'HEARTS':
            return await handle_hearts(sender)
        elif message == 'SCORE':
            return await handle_score(sender)
        elif message == 'UPGRADE':
            return await handle_upgrade(sender)
        else:
            return await handle_unknown(sender, message)
    except Exception as e:
        logger.error(f"Error handling webhook: {e}")
        return {"status": "error", "message": "Internal server error"}

async def send_whatsapp(to: str, body: str, media_url: str = None):
    """Send WhatsApp message via Twilio"""
    # In a real scenario, you'd use twilio.rest.Client or httpx
    logger.info(f"Sending to {to}: {body}")
    return {"status": "sent", "to": to}

async def handle_start(sender: str):
    """Beautiful onboarding message"""
    message = """
🇳🇬 *Welcome to EduNaija OS!*
Nigeria's smartest exam prep AI 🧠

📚 I cover:
• JAMB UTME
• WAEC SSCE  
• NECO SSCE
• Post-UTME
• Common Entrance

❤️ You have *20 hearts* today
Each question uses 1 heart

*Quick commands:*
• Type *QUIZ PHYSICS* to practice Physics
• Type *HEARTS* to check hearts
• Type *SCORE* to see your rank
• Type *UPGRADE* for unlimited access

Which subject are you studying? 👇
*ENGLISH* | *MATHS* | *PHYSICS* | *CHEMISTRY* | *BIOLOGY*
    """
    return await send_whatsapp(sender, message.strip())

async def handle_quiz_request(sender: str, message: str):
    return await send_whatsapp(sender, "Loading your quiz...")

async def handle_answer(sender: str, message: str):
    return await send_whatsapp(sender, "Processing your answer...")

async def handle_hearts(sender: str):
    return await send_whatsapp(sender, "You have 20 ❤️ left today!")

async def handle_score(sender: str):
    return await send_whatsapp(sender, "Your current score is 1500 XP. Rank: #42")

async def handle_upgrade(sender: str):
    return await send_whatsapp(sender, "Visit edunaija.com/upgrade to unlock unlimited access!")

async def handle_unknown(sender: str, message: str):
    return await send_whatsapp(sender, "I didn't understand that. Type *START* to see the menu.")

async def send_quiz_question(sender: str, question: dict):
    """Format question for WhatsApp"""
    pass

async def send_parent_report(parent_phone: str, report: dict):
    """Send weekly parent performance report"""
    pass

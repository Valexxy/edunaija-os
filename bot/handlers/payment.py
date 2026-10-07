from telegram import Update
from telegram.ext import ContextTypes
from bot.keyboards import payment_keyboard

async def payment_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    text = (
        "💎 CHOOSE YOUR PLAN\n"
        "━━━━━━━━━━━━━━━━━━━━━━\n"
        "🔥 CRAM PASS — ₦200/day\n"
        "   Unlimited questions for 24 hours\n"
        "   Perfect for last-minute cramming\n\n"
        "⭐ SEASON PASS — ₦5,000\n"
        "   Unlimited access Jan → April exams\n"
        "   + Weekly parent reports\n"
        "   + Priority AI explanations\n\n"
        "👨‍👩‍👧 PARENT DASHBOARD — ₦3,000/month\n"
        "   Automated performance tracking\n"
        "   Weekly SMS reports\n"
        "   Cut-off score predictions"
    )
    
    plans = ["Cram Pass", "Season Pass", "Parent Dashboard"]
    reply_markup = payment_keyboard(plans)
    
    await update.message.reply_text(text, reply_markup=reply_markup)

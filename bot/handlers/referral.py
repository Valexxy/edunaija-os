from telegram import Update
from telegram.ext import ContextTypes

async def referral_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    referral_link = f"https://t.me/JambAiTutorBot?start={user_id}"
    
    referrals_count = 3
    
    text = (
        f"You've referred {referrals_count}/3 friends! 🎉\n\n"
        f"Share this link with your friends to get more hearts:\n"
        f"{referral_link}\n\n"
        "🎁 Rewards:\n"
        "1 friend = 5 hearts\n"
        "3 friends = 10 hearts\n"
        "10 friends = 1 week FREE!"
    )
    
    await update.message.reply_text(text)

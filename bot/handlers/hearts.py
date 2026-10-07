from telegram import Update
from telegram.ext import ContextTypes
from bot.keyboards import hearts_empty_keyboard
from bot.utils.formatter import hearts_bar

async def hearts_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    current_hearts = 10
    max_hearts = 20
    
    bar = hearts_bar(current_hearts, max_hearts)
    
    text = (
        f"Your Hearts Status:\n{bar} {current_hearts}/{max_hearts}\n\n"
        "Hearts refill daily at midnight."
    )
    
    if current_hearts == 0:
        referral_link = f"https://t.me/JambAiTutorBot?start={update.effective_user.id}"
        text = (
            "😭 You're out of Hearts!\n\n"
            "WAEC is in 47 days. Don't lose your momentum!\n\n"
            "Choose how to continue:"
        )
        reply_markup = hearts_empty_keyboard(referral_link)
        await update.message.reply_text(text, reply_markup=reply_markup)
    else:
        await update.message.reply_text(text)

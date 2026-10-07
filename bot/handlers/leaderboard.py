from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from bot.utils.formatter import format_leaderboard

async def leaderboard_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    # Mock data
    entries = [
        {"name": "Emeka", "score": 1500},
        {"name": "Aisha", "score": 1450},
        {"name": "Tunde", "score": 1400}
    ]
    user_rank = {"name": "You", "score": 900, "rank": 42}
    
    text = format_leaderboard(entries, user_rank)
    
    keyboard = [
        [
            InlineKeyboardButton("Daily", callback_data="lb_daily"),
            InlineKeyboardButton("Weekly", callback_data="lb_weekly"),
            InlineKeyboardButton("Subject", callback_data="lb_subject")
        ],
        [InlineKeyboardButton("Share Rank", switch_inline_query="Look at my rank!")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if update.message:
        await update.message.reply_text(text, reply_markup=reply_markup)
    else:
        await update.callback_query.edit_message_text(text, reply_markup=reply_markup)

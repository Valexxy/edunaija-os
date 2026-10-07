"""
Telegram Handler for Sunday 8:00 PM National Showdown
"""

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ContextTypes
import os

async def showdown_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    web_app_url = os.environ.get("PWA_URL", "https://edunaija-os.pages.dev/showdown")
    
    text = (
        "⚡ *SUNDAY 8:00 PM NATIONAL SHOWDOWN* ⚡\n\n"
        "Nigeria's largest live synchronized exam battle royale!\n\n"
        "📅 *When:* Every Sunday at 8:00 PM WAT (Sharp!)\n"
        "👥 *Registered Aspirants:* 14,820 students\n"
        "⏱️ *Duration:* 30 Minutes (40 High-Yield Questions)\n"
        "🎁 *Grand Prize:* Top 10 win *500MB Free Data* + National Verified Champion Badge\n\n"
        "Are your questions ready? No pausing allowed once the clock starts! 🔥"
    )

    keyboard = [
        [InlineKeyboardButton("🚀 Enter Live Showdown Arena", web_app=WebAppInfo(url=web_app_url))],
        [InlineKeyboardButton("✅ Confirm My Seat (Free)", callback_data="register_showdown")],
        [InlineKeyboardButton("« Back to Menu", callback_data="menu_back")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    if update.message:
        await update.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")
    elif update.callback_query:
        await update.callback_query.answer()
        await update.callback_query.message.reply_text(text, reply_markup=reply_markup, parse_mode="Markdown")

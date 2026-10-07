from telegram import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
import os

def main_menu_keyboard() -> InlineKeyboardMarkup:
    web_app_url = os.environ.get("PWA_URL", "https://edunaija-os.pages.dev/student")
    keyboard = [
        [InlineKeyboardButton("🚀 Open EduNaija Web App", web_app=WebAppInfo(url=web_app_url))],
        [
            InlineKeyboardButton("📚 Practice Quiz", callback_data="menu_quiz"),
            InlineKeyboardButton("⚡ Sunday Showdown", callback_data="menu_showdown")
        ],
        [
            InlineKeyboardButton("🏆 Leaderboard", callback_data="menu_leaderboard"),
            InlineKeyboardButton("❤️ Hearts", callback_data="menu_hearts")
        ],
        [
            InlineKeyboardButton("🎁 Invite Friends (+10)", callback_data="menu_referral"),
            InlineKeyboardButton("💎 Upgrade Pass", callback_data="menu_upgrade")
        ]
    ]
    return InlineKeyboardMarkup(keyboard)

def subject_keyboard(subjects: list[str]) -> InlineKeyboardMarkup:
    keyboard = [[InlineKeyboardButton(sub, callback_data=sub)] for sub in subjects]
    return InlineKeyboardMarkup(keyboard)

def answer_keyboard() -> InlineKeyboardMarkup:
    keyboard = [
        [
            InlineKeyboardButton("A", callback_data="A"),
            InlineKeyboardButton("B", callback_data="B")
        ],
        [
            InlineKeyboardButton("C", callback_data="C"),
            InlineKeyboardButton("D", callback_data="D")
        ]
    ]
    return InlineKeyboardMarkup(keyboard)

def hearts_empty_keyboard(referral_link: str) -> InlineKeyboardMarkup:
    keyboard = [
        [InlineKeyboardButton("💳 Pay ₦200 for 24hr Cram Pass", callback_data="buy_cram")],
        [InlineKeyboardButton("📲 Share to 3 WhatsApp groups = FREE Hearts", url=f"https://api.whatsapp.com/send?text=Prepare%20for%20JAMB%20with%20AI!%20{referral_link}")],
        [InlineKeyboardButton("⭐ Upgrade to Season Pass ₦5,000", callback_data="buy_season")]
    ]
    return InlineKeyboardMarkup(keyboard)

def payment_keyboard(plans: list[str]) -> InlineKeyboardMarkup:
    keyboard = [[InlineKeyboardButton(f"Buy {plan}", callback_data=f"buy_{plan.replace(' ', '_').lower()}")] for plan in plans]
    return InlineKeyboardMarkup(keyboard)

def post_answer_keyboard() -> InlineKeyboardMarkup:
    keyboard = [
        [InlineKeyboardButton("Next Question →", callback_data="next_q")],
        [InlineKeyboardButton("Explain More", callback_data="explain_more")],
        [InlineKeyboardButton("See Similar Questions", callback_data="similar_q")]
    ]
    return InlineKeyboardMarkup(keyboard)

import re
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, ConversationHandler, CommandHandler, CallbackQueryHandler, MessageHandler, filters
from bot.keyboards import subject_keyboard, main_menu_keyboard

# States for onboarding
SUBJECT, CLASS_LEVEL, PHONE, PARENT_PHONE = range(4)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Starts the onboarding process."""
    args = context.args
    referral_code = args[0] if args else None
    
    # Check referral code and store in DB (mocked)
    if referral_code:
        pass

    welcome_text = (
        "🎓 Welcome to JAMB AI Tutor! Nigeria's smartest exam prep bot. Let's get you an A!\n\n"
        "❤️ You have 20/20 hearts to start.\n"
        "🎁 Share your referral link later to get more hearts!\n\n"
        "To customize your experience, what subject are you focusing on first?"
    )
    
    subjects = ["Physics", "Mathematics", "Chemistry", "Biology", "English"]
    reply_markup = subject_keyboard(subjects)
    
    if update.message:
        await update.message.reply_text(welcome_text, reply_markup=reply_markup)
    else:
        await update.callback_query.message.reply_text(welcome_text, reply_markup=reply_markup)
        
    return SUBJECT

async def select_subject(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    
    subject = query.data
    context.user_data['subject'] = subject
    
    keyboard = [
        [InlineKeyboardButton("SS2", callback_data="SS2")],
        [InlineKeyboardButton("SS3", callback_data="SS3")],
        [InlineKeyboardButton("100L", callback_data="100L")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(
        text=f"Great! You chose {subject}.\nWhat is your current class level?",
        reply_markup=reply_markup
    )
    return CLASS_LEVEL

async def select_class(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    
    class_level = query.data
    context.user_data['class_level'] = class_level
    
    await query.edit_message_text(
        text="Awesome! Enter your phone number (optional, type 'skip' to bypass):"
    )
    return PHONE

async def enter_phone(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    text = update.message.text
    if text.lower() != 'skip':
        context.user_data['phone'] = text
        
    await update.message.reply_text(
        "Lastly, enter your parent's phone number for weekly progress reports (optional, type 'skip' to bypass):"
    )
    return PARENT_PHONE

async def enter_parent_phone(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    text = update.message.text
    if text.lower() != 'skip':
        context.user_data['parent_phone'] = text
        
    # Store user in DB here
    
    await update.message.reply_text(
        "🎉 You're all set! Let's start learning.",
        reply_markup=main_menu_keyboard()
    )
    return ConversationHandler.END

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    await update.message.reply_text("Onboarding cancelled.", reply_markup=main_menu_keyboard())
    return ConversationHandler.END

start_handler = ConversationHandler(
    entry_points=[CommandHandler("start", start)],
    states={
        SUBJECT: [CallbackQueryHandler(select_subject)],
        CLASS_LEVEL: [CallbackQueryHandler(select_class)],
        PHONE: [MessageHandler(filters.TEXT & ~filters.COMMAND, enter_phone)],
        PARENT_PHONE: [MessageHandler(filters.TEXT & ~filters.COMMAND, enter_parent_phone)],
    },
    fallbacks=[CommandHandler("cancel", cancel)],
)

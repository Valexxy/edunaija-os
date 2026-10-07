from telegram import Update
from telegram.ext import ContextTypes, CommandHandler, CallbackQueryHandler, ConversationHandler
from bot.keyboards import subject_keyboard, answer_keyboard, post_answer_keyboard
from bot.utils.formatter import format_question

# States
SELECT_SUBJECT, ANSWER_QUESTION = range(2)

async def quiz_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    subjects = ["Physics", "Mathematics", "Chemistry", "Biology"]
    reply_markup = subject_keyboard(subjects)
    await update.message.reply_text("Select a subject for your quiz:", reply_markup=reply_markup)
    return SELECT_SUBJECT

async def send_question(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    
    subject = query.data
    context.user_data['current_subject'] = subject
    
    # Mock question data
    question_data = {
        "subject": subject,
        "number": 12,
        "total": 20,
        "text": "A body of mass 5kg is moving with velocity...",
        "options": {
            "A": "10 m/s²",
            "B": "20 m/s²",
            "C": "5 m/s²",
            "D": "15 m/s²"
        },
        "hearts_remaining": 18,
        "streak": 3,
        "time_limit": "00:45"
    }
    
    # Format the question
    formatted_q = format_question(question_data)
    reply_markup = answer_keyboard()
    
    await query.edit_message_text(text=formatted_q, reply_markup=reply_markup)
    return ANSWER_QUESTION

async def handle_answer(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    
    selected_option = query.data
    
    # Deduct heart, check answer (mock logic)
    is_correct = selected_option == "A"
    
    feedback = "✅ CORRECT! +10 XP" if is_correct else "❌ INCORRECT!"
    explanation = "Newton's 2nd Law: F = ma..."
    
    text = f"{feedback}\n\n📖 Explanation:\n{explanation}"
    
    reply_markup = post_answer_keyboard()
    await query.edit_message_text(text=text, reply_markup=reply_markup)
    
    return ConversationHandler.END

quiz_handler = ConversationHandler(
    entry_points=[CommandHandler("quiz", quiz_start)],
    states={
        SELECT_SUBJECT: [CallbackQueryHandler(send_question)],
        ANSWER_QUESTION: [CallbackQueryHandler(handle_answer)],
    },
    fallbacks=[],
)

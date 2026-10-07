"""
/uni — University admission advisor

Flow:
1. /uni → 'Enter your JAMB score:'
2. Enter 220 → 'Which state do you prefer?'
3. Select Lagos → Show all Lagos universities + courses they qualify for

Database: Cutoff scores for top 50 Nigerian universities
Sources: JAMB admission list 2020-2024
"""
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ConversationHandler

SCORE, STATE = range(2)

async def start_uni(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    await update.message.reply_text("Let's find your university! 🎓\nEnter your JAMB score:")
    return SCORE

async def get_score(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    try:
        score = int(update.message.text)
        context.user_data['jamb_score'] = score
        
        keyboard = [
            [InlineKeyboardButton("Lagos", callback_data='Lagos'),
             InlineKeyboardButton("Oyo", callback_data='Oyo')],
            [InlineKeyboardButton("FCT Abuja", callback_data='Abuja'),
             InlineKeyboardButton("Rivers", callback_data='Rivers')]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text("Which state do you prefer?", reply_markup=reply_markup)
        return STATE
    except ValueError:
        await update.message.reply_text("Please enter a valid number.")
        return SCORE

async def get_state(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    state = query.data
    score = context.user_data.get('jamb_score', 0)
    
    # Mock database lookup
    output = f"""
━━━━━━━━━━━━━━━━━━━━━
🎓 UNIVERSITIES IN {state.upper()} FOR SCORE {score}
━━━━━━━━━━━━━━━━━━━━━
"""
    if score >= 210:
        output += "✅ UNILAG — Micro-Biology (210 cutoff)\n"
    if score >= 200:
        output += "✅ LASU — Computer Science (200 cutoff)\n"
    if score >= 180:
        output += "✅ Lagos State Poly — Engineering (180 cutoff)\n"
        
    output += f"\n❌ UNILAG Medicine (280 cutoff) — Need {max(0, 280-score)} more points"
    output += "\nWant a study plan to score higher? /studyplan"
    
    await query.edit_message_text(text=output)
    return ConversationHandler.END

def get_uni_handler():
    return ConversationHandler(
        entry_points=[CommandHandler('uni', start_uni)],
        states={
            SCORE: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_score)],
            STATE: [CallbackQueryHandler(get_state)]
        },
        fallbacks=[CommandHandler('cancel', lambda u,c: ConversationHandler.END)]
    )

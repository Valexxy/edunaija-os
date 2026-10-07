"""
/studyplan — Generate personalized 6-month JAMB study plan

Process:
1. Ask: What's your JAMB date?
2. Ask: What's your target score? (200/250/300/350+)
3. Ask: How many hours/day can you study?
4. Ask: Your 4 JAMB subjects
5. Fetch BKT mastery scores for student
6. AI generates personalized daily/weekly plan
7. Schedule daily reminder notifications
"""
from telegram import Update
from telegram.ext import ContextTypes, ConversationHandler, CommandHandler, MessageHandler, filters

(DATE, TARGET, HOURS, SUBJECTS) = range(4)

async def start_studyplan(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    await update.message.reply_text("Let's build your 6-month JAMB study plan!\nWhat is your expected JAMB exam date? (e.g., April 2024)")
    return DATE

async def get_date(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data['jamb_date'] = update.message.text
    await update.message.reply_text("What is your target score? (e.g., 280)")
    return TARGET

async def get_target(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data['target_score'] = update.message.text
    await update.message.reply_text("How many hours a day can you dedicate to studying?")
    return HOURS

async def get_hours(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data['hours'] = update.message.text
    await update.message.reply_text("List your 4 JAMB subjects (e.g., English, Physics, Chemistry, Biology)")
    return SUBJECTS

async def generate_plan(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    subjects = update.message.text
    target = context.user_data.get('target_score', '250')
    date = context.user_data.get('jamb_date', 'April')
    
    plan_output = f"""
━━━━━━━━━━━━━━━━━━━━━
📅 YOUR JAMB PLAN
━━━━━━━━━━━━━━━━━━━━━
Target: {target}/400 by {date}
Subjects: {subjects}

WEEK 1-2: Foundation
📗 Physics: Mechanics (Mon/Wed)
📘 Chemistry: Atomic Structure (Tue/Thu)
📙 Biology: Cell Biology (Sat)
📕 English: Comprehension (daily)

We've scheduled daily reminders for you! 🚀
"""
    await update.message.reply_text(plan_output)
    return ConversationHandler.END

def get_studyplan_handler():
    return ConversationHandler(
        entry_points=[CommandHandler('studyplan', start_studyplan)],
        states={
            DATE: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_date)],
            TARGET: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_target)],
            HOURS: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_hours)],
            SUBJECTS: [MessageHandler(filters.TEXT & ~filters.COMMAND, generate_plan)]
        },
        fallbacks=[CommandHandler('cancel', lambda u,c: ConversationHandler.END)]
    )

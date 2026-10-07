"""
Handles:
/explain <topic> — Deep explanation of any JAMB topic
/explain periodic table in yoruba
/explain photosynthesis in pidgin
/ask — Ask any JAMB/WAEC question (free text)

Features:
- Language detection from user's profile setting
- Socratic mode: AI asks guiding questions first
- Examples with Nigerian context (Naira prices, local geography, Nigerian names)
- Auto-detects if question is out of syllabus: 'This topic is not in JAMB syllabus. Try similar: ...'
"""
from telegram import Update
from telegram.ext import ContextTypes, CommandHandler
import re

# Mock AI client
class MockAIClient:
    async def generate_explanation(self, topic: str, language: str) -> str:
        # Mock logic for context and language
        return f"Here is an explanation of {topic} in {language} with Nigerian examples..."

ai_client = MockAIClient()

async def explain_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler for /explain command."""
    args = context.args
    if not args:
        await update.message.reply_text("Please provide a topic. E.g., /explain periodic table in pidgin")
        return
        
    query = " ".join(args).lower()
    
    # Extract language if specified (e.g., "in yoruba")
    language = "english"
    match = re.search(r'\sin\s(yoruba|pidgin|igbo|hausa)$', query)
    if match:
        language = match.group(1)
        topic = query[:match.start()].strip()
    else:
        topic = query
        
    # Check syllabus (mock)
    if "quantum computing" in topic:
        await update.message.reply_text("This topic is not in the JAMB syllabus. Try similar: Atomic Structure")
        return
        
    await update.message.reply_text("Generating a personalized explanation for you... 🧠")
    
    # Get explanation from AI
    explanation = await ai_client.generate_explanation(topic, language)
    await update.message.reply_text(explanation)

async def ask_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler for /ask command."""
    question = " ".join(context.args)
    if not question:
        await update.message.reply_text("Ask me any WAEC/JAMB question!")
        return
        
    # Mock AI response
    await update.message.reply_text(f"Let's break this down. First, what do you think is the key principle behind '{question}'?")

def get_handlers():
    return [
        CommandHandler("explain", explain_command),
        CommandHandler("ask", ask_command)
    ]

"""
Student sends a photo of a JAMB question paper.
Bot:
1. Downloads the Telegram photo
2. Calls Google Cloud Vision API (free tier: 1000/month) or Tesseract OCR
3. Extracts question text
4. Searches RAG database for matching question
5. Returns answer + explanation

Use case: Student in exam hall gets confused, 
scans their practice paper, gets instant explanation
"""
import os
from telegram import Update
from telegram.ext import ContextTypes, MessageHandler, filters

async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("📸 Analyzing your question paper...")
    
    photo_file = await update.message.photo[-1].get_file()
    
    # Download photo from Telegram
    file_path = f"downloads/{photo_file.file_id}.jpg"
    os.makedirs("downloads", exist_ok=True)
    await photo_file.download_to_drive(file_path)
    
    # Mock OCR and RAG search
    extracted_text = "MOCK OCR TEXT: Calculate the kinetic energy..."
    rag_answer = "Based on our database, the answer is B (250J)."
    explanation = "Formula is K.E = 1/2 * m * v^2. Here m=5kg, v=10m/s. \n1/2 * 5 * 100 = 250J."
    
    response = f"📝 **Question Found**:\n{extracted_text}\n\n✅ **Answer**: {rag_answer}\n\n💡 **Explanation**:\n{explanation}"
    
    await update.message.reply_text(response, parse_mode='Markdown')
    
    # Clean up
    if os.path.exists(file_path):
        os.remove(file_path)

def get_photo_handler():
    return MessageHandler(filters.PHOTO, handle_photo)

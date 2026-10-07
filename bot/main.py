import os
import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, ConversationHandler, filters
from bot.handlers.start import start_handler
from bot.handlers.quiz import quiz_handler
from bot.handlers.hearts import hearts_handler
from bot.handlers.leaderboard import leaderboard_handler
from bot.handlers.payment import payment_handler
from bot.handlers.referral import referral_handler
from bot.handlers.showdown import showdown_handler

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

def main() -> None:
    """Start the bot."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        logger.error("TELEGRAM_BOT_TOKEN environment variable is required")
        return

    # Create the Application and pass it your bot's token.
    application = Application.builder().token(token).build()

    # Register handlers
    application.add_handler(start_handler)
    application.add_handler(quiz_handler)
    application.add_handler(CommandHandler("hearts", hearts_handler))
    application.add_handler(CommandHandler("leaderboard", leaderboard_handler))
    application.add_handler(CommandHandler("upgrade", payment_handler))
    application.add_handler(CommandHandler("referral", referral_handler))
    application.add_handler(CommandHandler("showdown", showdown_handler))

    # Set webhook or polling
    webhook_url = os.environ.get("WEBHOOK_URL")
    if webhook_url:
        logger.info(f"Starting webhook on {webhook_url}")
        port = int(os.environ.get("PORT", "8000"))
        application.run_webhook(
            listen="0.0.0.0",
            port=port,
            url_path=token,
            webhook_url=f"{webhook_url}/{token}"
        )
    else:
        logger.info("Starting polling")
        # Run the bot until the user presses Ctrl-C
        application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()

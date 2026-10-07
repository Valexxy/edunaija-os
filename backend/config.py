from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    TELEGRAM_BOT_TOKEN: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-20b"
    PAYSTACK_SECRET_KEY: str = ""
    PAYSTACK_PUBLIC_KEY: str = ""
    AFRICAS_TALKING_USERNAME: str = ""
    AFRICAS_TALKING_API_KEY: str = ""
    REDIS_URL: str = ""
    N8N_WEBHOOK_URL: str = ""
    WEBHOOK_SECRET: str = ""
    ENVIRONMENT: str = "dev"
    
    DAILY_HEART_LIMIT: int = 20
    CRAM_PASS_PRICE_KOBO: int = 20000
    SEASON_PASS_PRICE_KOBO: int = 500000
    PARENT_DASHBOARD_PRICE_KOBO: int = 300000
    B2B_LICENSE_PRICE_KOBO: int = 5000000

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

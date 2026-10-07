import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import httpx

from backend.config import settings
from backend.routers import (
    payments, competition, clans, adaptive, exams, analytics,
    auth_tma, showdown, referrals, dashboards, news_feeds,
    quiz_questions, auth_local, free_apis, sponsors, vouchers,
    autopsy, oral_english, subagents, admin_toggles, admissions,
    children_learning, zero_data, curriculum, monetization_powerhouse,
    syllabus_autopilot, proctored_exams, student_lifecycle, notifications,
    external_sync, tts_voice, elo_rating, theory_grader, showdown_league, schools,
    live_pulse, career_pathfinder, smart_context, realtime_apis,
    teach_ai, ghost_engine, stress_lab, case_studies,
    points_hearts, literature_reader, intent_personalization, curriculum_tracks,
    parent_requests, resumption, certificates, sponsor_ledger, essential_tools,
    virtual_teaching
)

logger = logging.getLogger(__name__)

# Initialize Supabase (Global for now, ideally in a dependency)
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY) if settings.SUPABASE_URL else None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up FastAPI application...")
    if settings.TELEGRAM_BOT_TOKEN and settings.WEBHOOK_SECRET:
        webhook_url = f"https://your-domain.com/webhook/{settings.WEBHOOK_SECRET}"
        url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/setWebhook"
        async with httpx.AsyncClient() as client:
            try:
                res = await client.post(url, json={"url": webhook_url})
                if res.status_code == 200:
                    logger.info("Telegram webhook registered successfully.")
            except Exception as e:
                logger.error(f"Failed to register Telegram webhook: {e}")
    
    # Redis connection could go here
    yield
    # Shutdown
    logger.info("Shutting down FastAPI application...")

app = FastAPI(title="EduNaija OS Enterprise Backend", lifespan=lifespan)

from backend.security.defense_middleware import DefenseInDepthMiddleware
app.add_middleware(DefenseInDepthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/security/tier-info")
async def get_security_tier_info():
    return {
        "status": "active",
        "standard": "NDPA 2023 Sec 31, COPPA, GDPR-K, ISO 27001",
        "levels": {
            0: {"name": "Public / Anonymous", "rate_limit_rpm": 180, "pii_protection": "STRICT_ZERO_PII"},
            1: {"name": "Minor Safe Sandbox", "curfew_hours": "21:00-05:30 WAT", "canned_chat_only": True, "sensor_otp_locked": True},
            2: {"name": "Senior Scholar Integrity", "proctor_lockdown": True, "watermark_steganography": True},
            3: {"name": "Parent / Guardian Authority", "argon2_pin_gate": True, "escrow_payout_control": True},
            4: {"name": "TRCN Verified Educator", "license_verified": True, "escrow_cleared": True},
            5: {"name": "Sovereign Root Admin", "dual_approval": True, "hash_chained_ledger": True}
        }
    }

app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(competition.router)
app.include_router(clans.router)
app.include_router(adaptive.router)
app.include_router(exams.router)
app.include_router(analytics.router)
app.include_router(auth_tma.router)
app.include_router(showdown.router)
app.include_router(referrals.router)
app.include_router(dashboards.router)
app.include_router(news_feeds.router)
app.include_router(quiz_questions.router)
app.include_router(auth_local.router)
app.include_router(free_apis.router)
app.include_router(sponsors.router)
app.include_router(vouchers.router)
app.include_router(autopsy.router)
app.include_router(oral_english.router)
app.include_router(subagents.router)
app.include_router(admin_toggles.router)
app.include_router(admissions.router)
app.include_router(children_learning.router)
app.include_router(zero_data.router)
app.include_router(curriculum.router)
app.include_router(monetization_powerhouse.router)
app.include_router(syllabus_autopilot.router)
app.include_router(proctored_exams.router)
app.include_router(student_lifecycle.router)
app.include_router(notifications.router)
app.include_router(external_sync.router)
app.include_router(tts_voice.router)
app.include_router(elo_rating.router)
app.include_router(theory_grader.router)
app.include_router(showdown_league.router)
app.include_router(news_feeds.news_router)
app.include_router(schools.router)
app.include_router(live_pulse.router)
app.include_router(career_pathfinder.router)
app.include_router(smart_context.router)
app.include_router(realtime_apis.router)
app.include_router(teach_ai.router)
app.include_router(ghost_engine.router)
app.include_router(stress_lab.router)
app.include_router(case_studies.router)
app.include_router(points_hearts.router)
app.include_router(literature_reader.router)
app.include_router(intent_personalization.router)
app.include_router(curriculum_tracks.router)
app.include_router(parent_requests.router)
app.include_router(resumption.router)
app.include_router(certificates.router)
app.include_router(sponsor_ledger.router)
app.include_router(essential_tools.router)
app.include_router(virtual_teaching.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}

@app.get("/config")
async def get_system_config():
    return {
        "status": "success",
        "app_name": "EduNaija OS Enterprise",
        "environment": settings.ENVIRONMENT,
        "academic_tiers": ["PRIMARY", "JSS", "SSS", "100L"],
        "curriculum_version": "NUC CCMAS / NERDC 2026 Sovereign Standard",
        "zero_data_mesh_active": True,
        "biometric_proctoring_enabled": True
    }

@app.get("/api/database/health")
async def database_health():
    from backend.database.sqlite_store import perform_full_database_integrity_and_snapshot
    return perform_full_database_integrity_and_snapshot()

@app.post("/api/database/checkpoint")
async def database_checkpoint():
    from backend.database.sqlite_store import get_connection
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("PRAGMA wal_checkpoint(TRUNCATE);")
    res = cursor.fetchone()
    conn.close()
    return {"status": "success", "busy": res[0], "log": res[1], "checkpointed": res[2]}

@app.get("/demo/accounts")
async def demo_accounts():
    return await dashboards.get_universal_demo_accounts()


@app.post("/webhook/{webhook_secret}")
async def telegram_webhook(webhook_secret: str, request: Request):
    if webhook_secret != settings.WEBHOOK_SECRET:
        raise HTTPException(status_code=403, detail="Invalid webhook secret")
    
    update = await request.json()
    # Handle telegram update
    return {"status": "ok"}

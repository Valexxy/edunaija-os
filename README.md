# 🇳🇬 JAMB AI Tutor — Nigeria's Smartest Exam Prep Bot

> **Telegram-native AI tutor for 2.2 million JAMB/WAEC students. Zero app download. Zero CAC. Goes viral by design.**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## 🎯 What This Does

JAMB AI Tutor is a Telegram bot that:
- 📚 Quizzes students on real JAMB/WAEC past questions (RAG-powered, no hallucination)
- ❤️ Uses a viral "Hearts" system that forces WhatsApp sharing
- 📊 Sends automated weekly performance reports to parents via SMS
- 🏆 Creates competitive leaderboards for schools and states
- 💰 Monetizes at ₦200/day, ₦5,000/season, ₦50,000/B2B

**Total infrastructure cost: ₦0 (free tier) until 10,000+ users**

---

## 🚀 Quick Start (5 Minutes)

### 1. Clone & Setup
`ash
git clone https://github.com/your-username/jamb-ai-tutor.git
cd jamb-ai-tutor
cp .env.example .env
# Edit .env with your API keys
`

### 2. Get Required API Keys (All Free)
| Service | Link | What For |
|---|---|---|
| Telegram Bot Token | @BotFather on Telegram | Bot identity |
| Supabase | supabase.com | Database + pgvector |
| Google AI Studio | aistudio.google.com | Gemini API |
| Paystack | paystack.com | Nigerian payments |
| Africa's Talking | africastalking.com | SMS to parents |
| Upstash | upstash.com | Redis rate limiting |

### 3. Setup Database
`ash
# Run schema on your Supabase project
psql  < database/schema.sql

# Seed initial JAMB questions
python database/seed_questions.py
`

### 4. Run Locally
`ash
pip install -r requirements.txt
uvicorn backend.main:app --reload &
python bot/main.py
`

### 5. Deploy to Render (Free)
`ash
# Push to GitHub, connect to Render, it reads render.yaml automatically
git push origin main
`

---

## 🏗️ Architecture

`
Telegram Users
     │
     ▼
Telegram Bot API (free)
     │
     ▼
FastAPI Backend (Render free tier)
     │
  ┌──┴──────────────────────────┐
  │                             │
  ▼                             ▼
Supabase                    Gemini 1.5 Flash
(PostgreSQL + pgvector)     (AI + RAG)
  │
  ├── past_questions (embeddings)
  ├── users + hearts
  ├── subscriptions
  └── weak_topics
     │
     ▼
n8n Workflows
  ├── Daily heart refill (midnight)
  ├── Weekly parent SMS reports
  ├── Payment webhook processing
  └── Streak reminders
`

---

## 💰 Revenue Model

| Plan | Price | Hearts |
|---|---|---|
| Free | ₦0 | 20/day |
| Cram Pass | ₦200/24hrs | Unlimited 24hrs |
| Season Pass | ₦5,000 | Unlimited Jan-April |
| Parent Dashboard | ₦3,000/month | + SMS reports |
| B2B License | ₦50,000/month | 100 students |

**Break-even**: 50 Season Pass sales = ₦250,000 (covers SMS + premium tier infra)

---

## 🧬 Viral Mechanics

1. **Hearts run out** → Student sees "Share to 3 WhatsApp groups OR pay ₦200"
2. **Student shares** → 3+ friends see the bot → they join → their hearts run out → repeat
3. **Leaderboard** → Students share rank → more visibility
4. **Parent SMS** → Parents tell other parents → B2B and word of mouth
5. **Streak** → Daily habit formation → high retention → organic sharing

**Expected K-factor: 1.3-1.8** (every user brings 1.3-1.8 new users)

---

## 📁 Project Structure

`
jamb-ai-tutor/
├── backend/          # FastAPI REST API
│   ├── routers/      # API route handlers
│   ├── services/     # Business logic
│   └── models/       # Pydantic schemas
├── bot/              # Telegram bot
│   ├── handlers/     # Command handlers
│   ├── keyboards/    # Inline keyboards
│   └── middlewares/  # Heart/rate checks
├── rag/              # RAG pipeline
│   ├── retriever.py  # pgvector search
│   ├── prompt_builder.py  # Anti-hallucination prompts
│   └── ingestion.py  # PDF past question parser
├── viral/            # Growth mechanics
│   ├── hearts.py     # Heart system
│   ├── streak.py     # Streak bonuses
│   ├── leaderboard.py
│   └── referral.py
├── database/         # DB schema + seeds
├── workflows/        # n8n workflow JSONs
├── orchestrate.py    # Antigravity AI architect
├── render.yaml       # Render deployment
└── .env.example      # Environment template
`

---

## 🤖 Antigravity AI Architect

Use the included Antigravity orchestrator to get AI-powered architectural help:

`ash
pip install google-antigravity
python orchestrate.py                    # Interactive mode
python orchestrate.py --task schema      # Generate DB schema
python orchestrate.py --task viral       # Design viral mechanics
python orchestrate.py --task vc          # VC pitch materials
python orchestrate.py --task launch      # 24-hour launch plan
`

---

## 🎯 VC Investment Thesis

- **Market**: 3.5M students × ₦5,000 = ₦17.5B TAM
- **CAC**: ₦0 (pure viral)
- **LTV**: ₦8,000+ (season pass + parent dashboard)
- **Margin**: ~85% (API + hosting costs minimal)
- **Moat**: Proprietary JAMB/WAEC question embeddings database
- **Exit**: Acquisition by Andela, Coursera Africa, or Pearson

---

## 📜 License

MIT — build on it, go viral, change Nigerian education.

---

*Built with ❤️ for Nigerian students. JAMB is not your enemy — we are your weapon.*

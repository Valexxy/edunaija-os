# JAMB AI Tutor — Project Context & Operational Blueprint
# This file is loaded as agent memory by orchestrate.py

## PROJECT MISSION
Build the #1 AI tutor for Nigerian JAMB/WAEC students, living entirely on Telegram.
Target: 2.2M JAMB candidates + 1.3M WAEC candidates = 3.5M TAM.

## ARCHITECTURE DECISIONS (LOCKED)
1. PLATFORM: Telegram Bot ONLY. No mobile app. No web app for students.
2. AI: Google Gemini 1.5 Flash → DeepSeek-Flash at scale
3. DATABASE: Supabase (PostgreSQL + pgvector extension)
4. RAG: Strict confinement — AI answers ONLY from past_questions table
5. HOSTING: Render free tier (backend + bot + n8n)
6. PAYMENTS: Paystack ONLY (Nigerian gateway, supports cards + USSD + bank transfer)
7. SMS: Africa's Talking (best Nigerian coverage, cheapest rates)
8. WORKFLOWS: n8n self-hosted on Render

## MONETIZATION (LOCKED PRICING)
- Free: 20 hearts/day
- Cram Pass: ₦200 for 24-hour unlimited access
- Season Pass: ₦5,000 (January to April JAMB exam)
- Parent Dashboard: ₦3,000/month (SMS reports + analytics)
- B2B Tutorial License: ₦50,000/month (up to 100 students)

## VIRAL MECHANICS (CORE ENGINE)
Hearts system forces sharing:
- 20 hearts = 20 questions/day free
- Run out → "Share to 3 WhatsApp groups OR pay ₦200"
- Each share generates a unique tracked link
- 3 confirmed clicks = 10 hearts restored
- Referral milestone: 10 referrals = 1 week Season Pass free

## RAG CONFINEMENT RULES
- NEVER answer from Gemini's pre-training knowledge
- ALWAYS retrieve from pgvector similarity search first
- If similarity < 0.70 → return "Not in my database, try similar questions"
- All questions must cite year, exam type (JAMB/WAEC), subject
- Explanations must reference NERDC syllabus

## KEY METRICS TO OPTIMIZE
- K-factor (viral coefficient): target > 1.3
- CAC: Must remain ₦0
- Day-7 retention: target > 40%
- Average Revenue Per Paying User: ₦5,000+
- Gross margin: > 80%

## SUBJECTS COVERED (MVP)
1. English Language
2. Mathematics
3. Physics
4. Chemistry
5. Biology
(Expand to: Government, Economics, Literature, CRS/IRS post-MVP)

## EXAM CALENDAR 2025
- JAMB UTME: April 2025
- WAEC SSCE: May-June 2025
- Peak usage: January-April (4-month season)

## TECHNICAL CONSTRAINTS
- Must work on 2G/3G (text-first, no images in bot messages)
- Must work on Android 6+ (Telegram minimum requirement)
- Max API response time: 3 seconds (Nigerian mobile latency)
- Supabase free tier: 500MB storage, 2GB bandwidth/month

## COMPETITIVE MOAT
1. Proprietary pgvector embeddings of JAMB/WAEC past questions (not publicly available)
2. Parental accountability loop (sticky B2C2B dynamic)
3. Zero CAC viral engine (each user acquires 1.3+ users)
4. Nigerian-contextualized AI explanations (Pidgin English support)
5. Telegram distribution (zero app store friction)

## TEAM REQUIREMENTS FOR VC PITCH
- CTO: Python/FastAPI + Telegram bots
- AI Engineer: RAG/pgvector/Gemini
- Growth: Viral mechanics + community management
- Business Dev: Tutorial center partnerships (B2B)

## FUNDING MILESTONES
- Pre-seed (): Deploy MVP, reach 10K users
- Seed (): 100K users, ₦50M MRR, expand to WAEC
- Series A (): 1M users, expand to Ghana/Kenya WASSCE

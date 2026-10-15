# LearnNaija — Master Product Requirements Document (PRD)

## 1. Product Vision
**LearnNaija** is a sovereign Nigerian family learning ecosystem designed around an AI-powered personal tutor, curriculum-aligned lessons, adaptive practice, parent guidance, teacher tools, peer learning, and dependable progress tracking.

### The Non-Manipulative Learning Standard
We build for learning outcomes, trust, affordability, and convenience—**not manipulative engagement tricks, shame mechanics, or compulsive screen-time loops**. Every learning session must produce visible, measurable progress.

---

## 2. The Ten Pillars
1. **The Personal AI Teacher:** Explains concepts at the learner's level, offers hints before solutions, breaks down STEM steps, and adapts explanations when learners remain stuck.
2. **The Nigerian Curriculum Engine:** NERDC / JAMB / WAEC / NECO / BECE curriculum alignment across Primary, JSS, SSS, and 100L.
3. **The Parent Command Centre:** Answers 3 core questions in under a minute:
   - *What is my child learning?*
   - *Where are they struggling?*
   - *What can I do to help?*
4. **Adaptive Learning Engine:** Diagnostic tests, prerequisite gap detection, mastery states (`Not assessed`, `Starting`, `Developing`, `Proficient`, `Secure`).
5. **Playful Progress:** Personal bests, cooperative challenges, and effort badges without shame mechanics.
6. **The Teacher's Assistant:** Lesson and quiz preparation, class assignments, and diagnostic topic reports.
7. **Low-Data & Offline Learning:** Lightweight pages, cached lessons, and resilient synchronization for 3G/4G African networks.
8. **Family Learning Space:** Multi-learner profiles under an authorized parent account with NDPA 2023 child data boundaries.
9. **Examination Readiness:** Realistic, server-timed CBT simulations with no live examination leak claims.
10. **The Trusted Learning Network:** Vetted educators (TRCN licensed), reviewed resources, and safe study groups.

---

## 3. Core User Journeys
### The Daily Learning Loop (Student)
1. **Opens App:** Sees a single actionable prompt (e.g. *"Let's practise fractions for 10 minutes"*).
2. **Receives Explanation:** Suited to class and language mode (English or Nigerian Pidgin).
3. **Attempts Question:** Independently on an unassisted canvas.
4. **Progressive Hints:** If stuck, receives hints first rather than instant answers.
5. **Demonstrated Mastery:** Completes fresh check questions before mastery state upgrades.

---

## 4. Live Services & API Infrastructure
- **Database:** Supabase PostgreSQL (19 tables, RLS enforced)
- **Primary AI Tutor:** Google Gemini 2.5 Flash
- **High-Speed AI Fallback:** Groq Cloud (`openai/gpt-oss-120b`)
- **Offline / Zero-Cost AI:** Local Deterministic Curriculum Engine
- **Anti-Bot & Anti-Cheat:** Cloudflare Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`)
- **High-Throughput Leaderboards & Caching:** Cloudflare Edge Cache & In-Memory Sorted Sets
- **Parent Scorecards & Email Reports:** Resend API (`RESEND_API_KEY`)
- **WebRTC Interactive Classrooms:** LiveKit Cloud (`wss://learnnaija-live-class-ugkzk04y.livekit.cloud`)
- **Identity & Safeguarding Verification:** Sovereign NDPA 2023 NIN & TRCN Engine + Paystack
- **Real-Time Weather & Culture:** Open-Meteo across 36 Nigerian States + FCT

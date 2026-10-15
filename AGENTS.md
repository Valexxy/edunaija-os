# LEARNNAIJA OS — AGENTS & ENGINEERING GOVERNANCE DIRECTIVE

> **Status:** Permanent Engineering Standard  
> **Jurisdiction:** All AI Agents, Pair Programmers, and Frontend/Backend Contributors  
> **Applicability:** Entire `nigeria-learning-platform` repository  

---

## 1. DESIGN TOKENS & VISUAL IDENTITY (HYBRID PREMIUM)

The platform must maintain a **Hybrid Premium** aesthetic — combining Nigerian educational heritage with enterprise fintech precision (Flutterwave, Stripe, Linear).

### 1.1 Color Tokens
- **Light Theme Background:** `#F7F9F7` (soft warm ivory/chalk white)
- **Light Surface / Cards:** `#FFFFFF` (pure crisp white with `var(--shadow-xs)` or `var(--shadow-sm)`)
- **Dark Theme Background:** `#101713` (deep Nigerian rainforest obsidian)
- **Dark Surface / Cards:** `#1A241E` (rich deep emerald charcoal)
- **Primary Brand (Nigerian Emerald):** `#047857` (dark: `#10B981`)
- **Secondary / Accent (Warm Savannah Gold):** `#D97706` (dark: `#F59E0B`)
- **Success (Forest Green):** `#16A34A`
- **Warning / Attention (Warm Amber):** `#D97706`
- **Danger / Destructive (Crimson):** `#DC2626`
- **Line / Border:** `#E2E8F0` (light), `#2D3B31` (dark)

### 1.2 Typography & Readability
- **Font Stack:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Scale Ratio:** 1.25 (Major Third)
- **Line Heights:** Body `1.5` to `1.6`, Headings `1.2` to `1.3`
- **Measure:** Paragraphs and reading content must maintain 60–75 characters per line (`max-width: 680px` to `840px`).

---

## 2. RESPONSIVE LAYOUT & ACCESSIBILITY SPECIFICATION

### 2.1 Viewport Breakpoints
- **Compact Mobile (Primary African Benchmark):** `320px` to `414px` (Tecno, Infinix, itel, Samsung Galaxy A-series).
- **Tablet / Phablet:** `768px` to `1024px`
- **Standard Desktop:** `1280px` to `1440px`
- **Ultrawide:** `1536px+` (capped at container width `1100px` to `1200px`)

### 2.2 Touch Targets & Interactivity
- Every interactive element (buttons, links, form toggles, tab buttons, theme toggles) **MUST have a minimum touch target of 44px × 44px**.
- Mobile navigation is governed by `src/components/layout/site-header.tsx`, featuring an accessible slide-in drawer with Escape-key listeners and backdrop blur dismissal.

### 2.3 Universal Back Navigation
- **Rule:** Every inner page across the system **MUST render a functional Back Button** (`src/components/navigation/back-button.tsx`).
- Touch target must be at least 44px high/wide, with history depth detection (`router.back()`) and contextual fallback routing if `window.history` is empty.

---

## 3. DATABASE SOURCE OF TRUTH & TEACHER ACCREDITATION

### 3.1 Zero Mock Data in Production Paths
- All teacher, classroom, and curriculum data must be persisted in Supabase PostgreSQL tables:
  - `public.vetted_tutors`: Teachers Registration Council of Nigeria (TRCN) licenses, NIN verification, university qualifications, hourly rates, and ratings.
  - `public.teacher_classrooms`: Classrooms, student counts, join codes, active assignments, and diagnostic gaps.
  - `public.learner_profiles` & `public.guardian_relationships`: Persistent scholar calibrations and NDPA guardian links.
- When Supabase credentials are not locally configured, APIs must fallback gracefully to authentic, structured seeds rather than failing or returning empty state.

### 3.2 APIs Sourcing Tutors & Classes
- `GET /api/teacher/classes`: Returns active classrooms and verified teacher badge.
- `GET /api/tutors`: Returns full TRCN-licensed tutor directory.
- `POST /api/teacher/classes`: Inserts new class records directly into `teacher_classrooms`.

---

## 4. PERFORMANCE & ZERO-LAG ARCHITECTURE

### 4.1 External Call Guards
- **Strict Rule:** Never perform synchronous, un-memoized external network requests on server components or page loads.
- **Weather / Geolocation:** Open-Meteo calls must pass through `src/lib/weather/engine.ts` featuring a 15-minute in-memory cache and a 2.5-second `AbortController` timeout with deterministic regional fallback.
- **AI Latency:** LLM endpoints must support fallback cascades, ensuring responses complete or return structured Socratic hints even under low bandwidth.

---

## 5. CHILD SAFEGUARDING & DATA PRIVACY (NDPA 2023 & CRA 2003)

### 5.1 NDPA Section 31 & 34 Compliance
- Guardian consent must be verifiable before processing minor student data.
- The platform strictly enforces PII scrubbing across all AI interactions (`src/lib/security/safeguarding.ts`).
- Phone numbers (`+234...`, `080...`), home addresses, bank accounts, and off-platform chat links (WhatsApp, Telegram) are scrubbed before reaching external LLM providers.

---

## 6. VERIFICATION & QUALITY GATES

Before completing any task, ticket, or commit, every engineer and agent MUST:
1. Run `npx tsc --noEmit` and achieve **0 TypeScript errors**.
2. Run `npm test` and achieve a **100% test pass rate** across all Vitest suites.
3. Validate responsive layouts across mobile (375px) and desktop (1280px).
4. Verify that light and dark themes render without unreadable contrast.

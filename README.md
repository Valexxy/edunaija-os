# Nigeria Learning Platform — Foundation

A security-conscious starter codebase for a Nigerian-first learning platform. This repository establishes the app shell, Supabase/PostgreSQL schema, row-level security (RLS), a replaceable Gemini AI adapter, and automated checks.

> **Status:** Foundation / early MVP scaffold, not production-certified. Apply migrations to a disposable Supabase project first. Have the schema, privacy flows, child-safety controls, and competition rules reviewed before onboarding real learners or collecting children's data.

## Stack
- Next.js App Router + TypeScript
- Supabase Auth + PostgreSQL + RLS
- Gemini API through a provider-neutral tutor interface
- Vitest for unit tests
- Playwright for browser smoke tests
- Cloudflare-compatible deployment path (use OpenNext for Cloudflare Workers, or deploy to a compatible Node host)

## Prerequisites
- Node.js 20.9+ and npm
- Git
- Supabase CLI (optional but recommended)
- A Supabase project for hosted testing; local Supabase is preferred for database tests
- Gemini API key only when testing AI features

## Quick start
```bash
npm install
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
npm run dev
```
Open http://localhost:3000.

## Database setup
1. Install Supabase CLI and run `supabase login`.
2. For a new local stack: `supabase start`.
3. Apply migrations: `supabase db reset`.
4. For a hosted project, link it using `supabase link --project-ref YOUR_PROJECT_REF`, then run `supabase db push`.
5. Never put a service-role key in a `NEXT_PUBLIC_*` variable or browser code.

## Checks
```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
```
Playwright browser binaries may need `npx playwright install chromium`.

## Environment variables
See `.env.example`. Only public Supabase URL and anon key are safe for browser exposure. The Gemini key and any service-role key are server-only secrets.

## Repository map
- `src/app/` — Next.js pages and route handlers
- `src/lib/supabase/` — browser/server Supabase clients
- `src/lib/ai/` — provider-neutral AI interface and Gemini implementation
- `supabase/migrations/` — version-controlled SQL schema and RLS
- `tests/` — unit and browser smoke tests
- `docs/` — architecture, threat model, and staged delivery plan

## Important implementation notes
- Authenticated users can read their own profile and update only safe profile fields. Role changes are not exposed through profile updates.
- Parent/guardian access requires an explicit accepted relationship.
- Learning content has draft/review/published states; students should only see published content.
- Attempts and scoring are server-authoritative. Do not accept a score supplied by the browser.
- AI responses are untrusted. They must not be treated as verified curriculum facts without review.
- The schema records provenance for curriculum material. Uploaded content is not automatically labeled official.
- RLS is a critical layer, not a substitute for server-side validation and a security review.
- No production secrets are included in this repository.

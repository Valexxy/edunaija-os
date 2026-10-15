# Architecture and boundaries

## Core domains
1. Identity and access: profiles, learner profiles, guardian relationships, school memberships.
2. Curriculum and content: subjects, sources, topics, questions, assessments.
3. Learning records: attempts, answers, mastery.
4. Social learning: challenges, participants, referrals.
5. Operations: AI usage and audit events.

## Trust boundaries
- Browser: untrusted. Never accepts a browser-provided score as authoritative.
- Supabase Auth: identity provider. Database policies use `auth.uid()`.
- PostgreSQL RLS: enforce per-row access; service role bypasses RLS and must remain server-only.
- AI provider: external processor. Do not send unnecessary child identifiers, account metadata, or private documents.
- Admin workflows: sensitive role grants, publication, school verification, prize verification and audit writes must be restricted to reviewed server-side processes.

## Planned stages
- Stage 1 (this repo): app shell, base schema, RLS, env template, unit/browser smoke tests.
- Stage 2: login/signup, verified session handling, safe profile editing, guardian invitation/acceptance workflow.
- Stage 3: content authoring/review, syllabus import pipeline, storage policies, provenance display.
- Stage 4: assessments with server RPCs for start/answer/submit/score and idempotency.
- Stage 5: tutor API authentication, rate limits, quotas, safety filters, cost logging and provider timeouts.
- Stage 6: mastery aggregation, parent/teacher reports, challenges and fraud review.
- Stage 7: observability, backup restore drill, load/security tests, privacy and legal review.

## Important gaps to close before launch
- Add Supabase Storage buckets and policies; no bucket is created by the initial migration.
- Add verified role-management process for teacher/admin roles; self-signup defaults to student.
- Add a guardian consent workflow and a documented way to revoke access.
- Add server-side assessment RPCs. Client cannot update scores or answers under this migration.
- Add per-user and per-IP rate limits, bot controls and usage budgets before enabling the tutor.
- Add content moderation, copyright complaints/takedowns, privacy requests, retention/deletion jobs, and incident response.
- Review data residency, processor contracts, NDPA obligations, and child-specific requirements with Nigerian counsel.

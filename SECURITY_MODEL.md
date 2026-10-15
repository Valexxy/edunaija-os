# LearnNaija — Security & Trust Model

## 1. Threat Model & Safeguards
1. **Learner Data Isolation:** PostgreSQL Row-Level Security (RLS) ensures students, parents, and teachers only access authorized records.
2. **Anti-Cheat & Answer-Key Protection:** Answer keys (`answer_key`) and explanations are strictly stripped from client API responses. Grading is 100% server-authoritative.
3. **Bot & Cheating Mitigation:** Cloudflare Turnstile invisible managed challenges gate CBT starts and registrations.
4. **Prompt Injection Defense:** User queries are sanitized and wrapped in child-safe system prompts; models never execute direct SQL or privileged code.
5. **PII Scrubbing:** Phone numbers, BVNs, NINs, and residential addresses are scrubbed prior to model context submission.

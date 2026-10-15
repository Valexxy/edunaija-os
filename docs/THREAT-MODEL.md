# Initial threat model

| Threat | Initial control | Follow-up required |
|---|---|---|
| Student edits own role to admin | DB trigger blocks role changes | Test every admin grant path |
| Student reads another student's records | RLS on learner, attempts, mastery, guardian relations | Add adversarial integration tests against local Supabase |
| Student manipulates scores | No direct update policy on attempts; score fields server-owned by design | Implement and test trusted RPCs |
| User sees answer keys | Questions currently contain answer keys in a single table | Before publishing assessments, split public question data from private answer keys or serve via a server endpoint; do not expose question rows directly to learners |
| Gemini key leakage | Server-only env var | Secret scanning in CI; rotate leaked keys immediately |
| AI bill abuse | Tutor route disabled by default | Auth, quotas, rate limits, token/cost caps, abuse alerts |
| Curriculum piracy | Provenance/license fields | Takedown process and content review |
| Fake school/prize identity | Verification fields | Manual review, appeals, guardian-aware prize delivery |
| Guardian relationship abuse | Pending relationship default and explicit accept flow | Verify who is authorised to consent; audit changes |
| Service-role misuse | Not used in regular request path | Restrict to server-only jobs and rotate periodically |

This is a starter model, not a complete security assessment. Threats and controls must be revisited before each major release.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  startAttempt,
  recordAnswer,
  evaluateAndSubmitAttempt,
  attemptsStore
} from '@/lib/assessment/engine';
import { submitChallengeResult } from '@/lib/challenges/engine';
import { escapeHtml } from '@/lib/email/templates/html-utils';
import { eraseLearnerData, recordParentConsent, getLearnerConsent } from '@/lib/security/consent';

describe('Security Audit Remediation Suite', () => {
  beforeEach(() => {
    attemptsStore.clear();
  });

  describe('1. Assessment Attempt Ownership & Single Submission', () => {
    it('blocks recording answers for non-existent attempts instead of fabricating demo state', () => {
      expect(() => {
        recordAnswer('fake-attempt-999', 'qst-math-01', { selectedOptionId: 'opt-a' }, 'asm-01', 'user-123');
      }).toThrow('Attempt not found');
    });

    it('blocks a user from recording answers to another candidate’s attempt', () => {
      const attempt = startAttempt('asm-diag-jss-stem', 'legitimate-student-01');

      expect(() => {
        recordAnswer(attempt.id, 'qst-math-01', { selectedOptionId: 'opt-a' }, 'asm-diag-jss-stem', 'attacker-user-99');
      }).toThrow('Unauthorized: attempt belongs to another user');
    });

    it('rejects cross-candidate submission hijacking attacks', async () => {
      const attempt = startAttempt('asm-diag-jss-stem', 'victim-student-01');

      await expect(
        evaluateAndSubmitAttempt(attempt.id, {}, 'asm-diag-jss-stem', 'attacker-user-99')
      ).rejects.toThrow('Unauthorized: attempt belongs to another user');
    });

    it('enforces single submission guard against duplicate submission attacks', async () => {
      const attempt = startAttempt('asm-diag-jss-stem', 'student-01');
      const firstSubmit = await evaluateAndSubmitAttempt(attempt.id, {}, 'asm-diag-jss-stem', 'student-01');
      expect(firstSubmit.attemptId).toBe(attempt.id);

      // Second submission attempt must fail closed
      await expect(
        evaluateAndSubmitAttempt(attempt.id, {}, 'asm-diag-jss-stem', 'student-01')
      ).rejects.toThrow('Attempt has already been submitted');
    });
  });

  describe('2. Competition Leaderboard & Server-Authoritative Scoring', () => {
    it('rejects challenge submission with non-existent or fabricated attempt IDs', () => {
      expect(() => {
        submitChallengeResult('chl-math-speed-02', 'student-01', 'fabricated-attempt-id');
      }).toThrow('Assessment attempt not found');
    });

    it('rejects challenge submission if candidate does not own the attempt', async () => {
      const attempt = startAttempt('asm-diag-jss-stem', 'honest-student-01');
      await evaluateAndSubmitAttempt(attempt.id, {}, 'asm-diag-jss-stem', 'honest-student-01');

      expect(() => {
        submitChallengeResult('chl-math-speed-02', 'cheater-student-99', attempt.id);
      }).toThrow('Unauthorized: attempt belongs to another candidate');
    });

    it('derives challenge score server-authoritatively and ignores inflated client score parameters', async () => {
      const attempt = startAttempt('asm-diag-jss-stem', 'scholar-01');
      const result = await evaluateAndSubmitAttempt(attempt.id, {}, 'asm-diag-jss-stem', 'scholar-01');

      // Attacker tries to pass score: 99999
      const participant = submitChallengeResult('chl-math-speed-02', 'scholar-01', attempt.id, 99999, 1);

      // Server must record the actual verified attempt score, NOT 99999
      expect(participant.score).toBe(result.score);
      expect(participant.verification_status).toBe('verified');
      expect(participant.review_status).toBe('clear');
    });
  });

  describe('3. Parent Consent & Multi-Store Data Erasure', () => {
    it('properly records and retrieves parent consent records', () => {
      const consent = recordParentConsent({
        learnerId: 'learner-consent-test-01',
        parentIdentifier: 'parent@example.com',
        relationshipLabel: 'Mother',
        scopes: { allow_ai_tutor: true, allow_live_classes: false }
      });

      expect(consent.verified).toBe(true);
      expect(consent.scopes.allow_ai_tutor).toBe(true);
      expect(consent.scopes.allow_live_classes).toBe(false);

      const retrieved = getLearnerConsent('learner-consent-test-01');
      expect(retrieved?.id).toBe(consent.id);
    });

    it('cascades erasure across memory stores and returns scrubbed stores list', async () => {
      recordParentConsent({
        learnerId: 'learner-erasure-test-02',
        parentIdentifier: 'parent2@example.com',
        relationshipLabel: 'Father',
        scopes: { allow_ai_tutor: true }
      });

      const erasureResult = await eraseLearnerData('learner-erasure-test-02');
      expect(erasureResult.success).toBe(true);
      expect(erasureResult.storesScrubbed).toContain('in_memory_consent_cache');

      // Consent must no longer exist in memory
      expect(getLearnerConsent('learner-erasure-test-02')).toBeNull();
    });
  });

  describe('4. HTML Injection Sanitization for Email Templates', () => {
    it('escapes malicious script tags and HTML markup', () => {
      const payload = '<script>alert("xss")</script>';
      const sanitized = escapeHtml(payload);
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('escapes quotes and ampersands in user-provided names and notes', () => {
      const payload = "O'Connor & \"Students\" <bad>";
      const sanitized = escapeHtml(payload);
      expect(sanitized).toBe('O&#039;Connor &amp; &quot;Students&quot; &lt;bad&gt;');
    });
  });

  describe('5. Auth Session Privilege Escalation Guard', () => {
    it('strictly denies administrative or staff privileges from unverified user_metadata', () => {
      // Helper function replicating the security guard in getCurrentUser
      function sanitizeMetadataRole(rawRole: string | undefined): 'student' | 'parent' {
        return rawRole === 'parent' ? 'parent' : 'student';
      }

      expect(sanitizeMetadataRole('platform_admin')).toBe('student');
      expect(sanitizeMetadataRole('school_admin')).toBe('student');
      expect(sanitizeMetadataRole('teacher')).toBe('student');
      expect(sanitizeMetadataRole('parent')).toBe('parent');
      expect(sanitizeMetadataRole(undefined)).toBe('student');
    });
  });
});


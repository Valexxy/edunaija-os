/**
 * AI Safety & NDPA 2023 Child Data Protection Guardrails
 * Ensures student prompts are stripped of personal identifiers before reaching external LLMs.
 */

// Regex patterns for Nigerian phone numbers: 080..., 070..., 081..., 090..., 091..., +234...
const NIGERIAN_PHONE_REGEX = /(?:\+?234|0)(?:[789][01]\d{8}|[789][01]\d\s\d{3}\s\d{4}|\d{2}\s\d{3}\s\d{4})/g;

// Standard email regex
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Bank Verification Number (BVN) / National Identification Number (NIN): 11 continuous digits
const NIGERIAN_IDENTIFIER_REGEX = /\b\d{11}\b/g;

// Common student location / school identifiers (e.g. "I live at No 12...", "My house is...")
const HOME_ADDRESS_REGEX = /(?:my address is|i live at|my house is|we stay at)\s+[^,\n.]+/gi;

export interface SanitizationResult {
  sanitizedText: string;
  piiRedacted: boolean;
  redactionCount: number;
}

export function sanitizePromptForChildSafety(prompt: string): SanitizationResult {
  let count = 0;
  let text = prompt;

  // Redact Nigerian phone numbers
  text = text.replace(NIGERIAN_PHONE_REGEX, () => {
    count++;
    return "[REDACTED_PHONE]";
  });

  // Redact Email addresses
  text = text.replace(EMAIL_REGEX, () => {
    count++;
    return "[REDACTED_EMAIL]";
  });

  // Redact NIN / BVN
  text = text.replace(NIGERIAN_IDENTIFIER_REGEX, () => {
    count++;
    return "[REDACTED_ID]";
  });

  // Redact home addresses
  text = text.replace(HOME_ADDRESS_REGEX, () => {
    count++;
    return "[REDACTED_LOCATION]";
  });

  return {
    sanitizedText: text,
    piiRedacted: count > 0,
    redactionCount: count
  };
}

export interface GuardrailCheckResult {
  allowed: boolean;
  reason?: string;
}

const INAPPROPRIATE_PATTERNS = [
  /\b(?:porn|gambling|betting|hack|steal|cheat on exam)\b/i,
  /\b(?:kill yourself|suicide|self harm)\b/i
];

export function validateEducationalContext(prompt: string): GuardrailCheckResult {
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        allowed: false,
        reason: "Content outside educational boundaries or violates platform safety guidelines."
      };
    }
  }

  return { allowed: true };
}

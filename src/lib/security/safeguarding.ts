/**
 * Child Rights Act (CRA 2003) & Educator Safeguarding Engine for LearnNaija OS
 * Ensures zero-unsupervised contact, TRCN license validation & contact solicitation filtering.
 */

export interface EducatorVettingStatus {
  educatorId: string;
  fullName: string;
  trcnNumber: string;
  isTrcnValid: boolean;
  ninVerified: boolean;
  safeguardingTrained: boolean;
  approvalStatus: "verified" | "pending_clearance" | "rejected";
  vettedAt: string;
}

/**
 * Validates Teachers Registration Council of Nigeria (TRCN) license format.
 * Standard format: TRCN/<StateCode>/<4-6 Digits> (e.g. TRCN/AN/49281, TRCN/LA/102938)
 */
export function validateTrcnNumber(trcnNumber: string): { isValid: boolean; normalized: string; stateCode?: string } {
  const clean = trcnNumber.trim().toUpperCase();
  const trcnRegex = /^TRCN\/([A-Z]{2})\/(\d{4,7})$/;
  const match = clean.match(trcnRegex);

  if (!match) {
    return { isValid: false, normalized: clean };
  }

  return {
    isValid: true,
    normalized: clean,
    stateCode: match[1]
  };
}

export interface SafeguardingScanResult {
  isSafe: boolean;
  violations: string[];
  sanitizedText: string;
}

/**
 * Scans chat messages and tutoring inputs for attempts to solicit personal contact
 * (Nigerian phone numbers, WhatsApp, Telegram, personal social media).
 * In compliance with CRA 2003 child protection mandates.
 */
export function scanTextForChildSafeguardingViolations(input: string): SafeguardingScanResult {
  const violations: string[] = [];
  let sanitized = input;

  // 1. Nigerian phone number patterns: +234, 080x, 070x, 081x, 090x, 091x
  const phonePattern = /(?:\+?234|0)[789][01]\d[\s\-]?\d{3}[\s\-]?\d{4}/gi;
  if (phonePattern.test(sanitized)) {
    violations.push("SHARING_PHONE_NUMBER");
    sanitized = sanitized.replace(phonePattern, "[PROTECTED_CONTACT_REDACTED]");
  }

  // 2. WhatsApp / Telegram / Social media handles solicitation
  const platformKeywords = [
    { regex: /\b(?:whatsapp|what's\s*app|wa\.me|chat\s*me\s*on\s*whatsapp)\b/gi, label: "WHATSAPP_SOLICITATION" },
    { regex: /\b(?:telegram|t\.me|chat\s*me\s*on\s*telegram)\b/gi, label: "TELEGRAM_SOLICITATION" },
    { regex: /\b(?:snapchat|snap\s*id|instagram|ig\s*handle|dm\s*me\s*on|tiktok)\b/gi, label: "SOCIAL_MEDIA_SOLICITATION" },
    { regex: /\b(?:call\s*me\s*on|text\s*my\s*line|my\s*personal\s*number)\b/gi, label: "DIRECT_CALL_SOLICITATION" }
  ];

  for (const { regex, label } of platformKeywords) {
    // Reset regex index
    regex.lastIndex = 0;
    if (regex.test(sanitized)) {
      violations.push(label);
      regex.lastIndex = 0;
      sanitized = sanitized.replace(regex, "[OFF_PLATFORM_CONTACT_BLOCKED]");
    }
  }

  return {
    isSafe: violations.length === 0,
    violations,
    sanitizedText: sanitized
  };
}

/**
 * Determines whether a learner is classified as a minor under the Child Rights Act (CRA 2003).
 * In Nigeria, the statutory age of majority is 18.
 */
export function isMinor(ageYears: number): boolean {
  return ageYears < 18;
}


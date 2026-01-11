/**
 * Prompt Security Utilities
 * Prevents prompt injection, XSS, and other attacks
 */

/**
 * Detect common prompt injection patterns
 */
export const detectPromptInjection = (text: string): {
  isInjection: boolean;
  type?: string;
  reason?: string;
} => {
  const patterns = [
    { regex: /ignore.*previous.*instruction/i, type: 'instruction_override' },
    { regex: /forget.*about/i, type: 'memory_override' },
    { regex: /disregard|override|bypass/i, type: 'bypass_attempt' },
    { regex: /execute|run|eval|system|exec/i, type: 'code_execution' },
    { regex: /system.*prompt|internal.*instruction/i, type: 'prompt_access' },
    { regex: /role[*-]?play|pretend|act.*as|you.*are.*now/i, type: 'roleplay' },
    { regex: /respond.*as|behave.*as/i, type: 'behavior_override' },
    { regex: /jailbreak|break.*out|escape/i, type: 'jailbreak' },
    { regex: /sql.*inject|drop.*table|delete.*from/i, type: 'sql_injection' },
    { regex: /javascript:|<script|onclick|onerror/i, type: 'xss_attack' },
    { regex: /select.*from.*where|union.*select/i, type: 'sql_injection' },
  ];

  for (const { regex, type } of patterns) {
    if (regex.test(text)) {
      return {
        isInjection: true,
        type,
        reason: `Detected ${type} pattern`,
      };
    }
  }

  return { isInjection: false };
};

/**
 * Sanitize untrusted input strings
 * Removes/escapes potentially dangerous characters
 */
export const sanitizePromptInput = (text: string): string => {
  return (
    text
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Escape special characters (don't remove, but escape)
      .replace(/([\\`])/g, '\\$1')
      // Limit length
      .slice(0, 500)
      .trim()
  );
};

/**
 * Validate prompt input comprehensively
 */
export const validatePromptInput = (
  text: string
): {
  valid: boolean;
  error?: string;
} => {
  // Length validation
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Input cannot be empty' };
  }

  if (text.length > 500) {
    return { valid: false, error: 'Input exceeds maximum length (500 chars)' };
  }

  if (text.length < 3) {
    return { valid: false, error: 'Input too short (minimum 3 chars)' };
  }

  // Injection detection
  const injectionCheck = detectPromptInjection(text);
  if (injectionCheck.isInjection) {
    return {
      valid: false,
      error: `Suspicious pattern detected (${injectionCheck.type}). Please avoid commands or jailbreak attempts.`,
    };
  }

  // Special character ratio check
  const specialCharCount = (
    text.match(/[!@#$%^&*(){}[\]|\\:;"'<>?,./~`]/g) || []
  ).length;
  if (specialCharCount > text.length * 0.4) {
    return {
      valid: false,
      error: 'Too many special characters. Please simplify your request.',
    };
  }

  // URL detection (prevent link injection)
  if (/https?:\/\/|www\./i.test(text)) {
    return { valid: false, error: 'URLs are not allowed in leave requests.' };
  }

  return { valid: true };
};

/**
 * Validate AI response structure and content
 */
export const validateAIResponse = (
  response: unknown,
  allowedNames: string[]
): {
  valid: boolean;
  error?: string;
} => {
  // Type check
  if (!response || typeof response !== 'object') {
    return { valid: false, error: 'Invalid response type' };
  }

  const res = response as Record<string, unknown>;

  // Required fields
  if (
    !res.name ||
    !res.start ||
    !res.end ||
    !res.matchType ||
    typeof res.name !== 'string' ||
    typeof res.start !== 'string' ||
    typeof res.end !== 'string' ||
    typeof res.matchType !== 'string'
  ) {
    return { valid: false, error: 'Missing or invalid required fields' };
  }

  // Date format validation (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(res.start) || !dateRegex.test(res.end)) {
    return { valid: false, error: 'Invalid date format (must be YYYY-MM-DD)' };
  }

  // Date range validation
  const now = new Date();
  const startDate = new Date(res.start);
  const endDate = new Date(res.end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { valid: false, error: 'Invalid date values' };
  }

  // Past date check (allow 1 month back for retroactive entries)
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  if (startDate < oneMonthAgo) {
    return {
      valid: false,
      error: 'Start date too far in the past (max 1 month)',
    };
  }

  // Future date check (allow up to 2 years forward)
  const twoYearsLater = new Date(now);
  twoYearsLater.setFullYear(twoYearsLater.getFullYear() + 2);
  if (endDate > twoYearsLater) {
    return {
      valid: false,
      error: 'End date too far in the future (max 2 years)',
    };
  }

  // Date order validation
  if (startDate > endDate) {
    return {
      valid: false,
      error: 'Start date cannot be after end date',
    };
  }

  // MatchType validation
  if (!['exact', 'suggested', 'none'].includes(res.matchType)) {
    return { valid: false, error: 'Invalid matchType' };
  }

  // Name validation
  const nameLength = (res.name as string).length;
  if (nameLength < 2 || nameLength > 100) {
    return { valid: false, error: 'Invalid name length' };
  }

  // Similarity function for fuzzy matching
  const getSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 100;

    const editDistance = getEditDistance(longer, shorter);
    return ((longer.length - editDistance) / longer.length) * 100;
  };

  // Levenshtein distance for fuzzy matching
  const getEditDistance = (s1: string, s2: string): number => {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  };

  // For exact match, verify name exists in roster (case-insensitive)
  if (res.matchType === 'exact') {
    const nameExists = allowedNames.some(
      (n) => n.toLowerCase() === (res.name as string).toLowerCase()
    );
    if (!nameExists) {
      // Check if there's a high similarity match that should be exact
      const bestMatch = allowedNames.reduce(
        (best: { name: string; score: number }, current) => {
          const score = getSimilarity(current, res.name as string);
          return score > best.score ? { name: current, score } : best;
        },
        { name: '', score: 0 }
      );

      if (bestMatch.score > 85) {
        // High confidence match
        return { valid: true };
      }

      return {
        valid: false,
        error: 'Name not found in allowed roster for exact match',
      };
    }
  }

  // For suggested match, verify suggestion exists
  if (res.matchType === 'suggested') {
    if (res.suggestion && typeof res.suggestion === 'string') {
      const suggestionExists = allowedNames.some(
        (n) => n.toLowerCase() === (res.suggestion as string).toLowerCase()
      );
      if (!suggestionExists) {
        return { valid: false, error: 'Suggested name not in roster' };
      }
    }
  }

  return { valid: true };
};

/**
 * Rate limiting helper - track request frequency per user session
 */
export class PromptRateLimiter {
  private requests: number[] = [];
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(): boolean {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  reset(): void {
    this.requests = [];
  }
}

/**
 * Escape string for safe display in HTML/JSON
 */
export const escapeForDisplay = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'\/]/g, (char) => map[char] || char);
};

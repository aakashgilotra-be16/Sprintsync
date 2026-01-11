/**
 * Input Sanitization & Validation
 * Prevents XSS and injection attacks
 */

/**
 * Sanitize string input - remove dangerous characters
 * Prevents HTML/script injection
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>\"']/g, (char) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
      };
      return escapeMap[char] || char;
    })
    .slice(0, 500); // Max 500 chars
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const validateDate = (dateStr: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;

  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Validate department enum
 */
export const validateDepartment = (
  dept: unknown
): dept is 'Dev' | 'QA' | 'PM' => {
  return ['Dev', 'QA', 'PM'].includes(String(dept));
};

/**
 * Validate name field
 * Allows letters, spaces, hyphens, apostrophes only
 */
export const validateName = (name: string): boolean => {
  if (typeof name !== 'string' || name.length < 2 || name.length > 100) {
    return false;
  }
  return /^[a-zA-Z\s\-']+$/.test(name);
};

/**
 * Validate sprint name
 * Alphanumeric, spaces, hyphens only
 */
export const validateSprintName = (name: string): boolean => {
  if (typeof name !== 'string' || name.length < 3 || name.length > 100) {
    return false;
  }
  return /^[a-zA-Z0-9\s\-]+$/.test(name);
};

/**
 * Validate file upload safety
 * Check file size and type
 */
export const validateFileUpload = (
  file: File,
  maxSizeMB: number = 5
): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (file.size > maxSizeBytes) {
    console.error(`File size exceeds ${maxSizeMB}MB limit`);
    return false;
  }

  if (!allowedTypes.includes(file.type)) {
    console.error('Invalid file type. Only Excel files allowed.');
    return false;
  }

  return true;
};

/**
 * Sanitize object (recursively sanitize all string values)
 */
export const sanitizeObject = <T extends Record<string, unknown>>(
  obj: T
): T => {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      (sanitized[key] as unknown) = sanitizeString(sanitized[key] as string);
    }
  }

  return sanitized;
};

/**
 * Rate limiting helper - check if action should be throttled
 */
export class RateLimiter {
  private lastExecutionTime: number = 0;
  private minInterval: number; // milliseconds

  constructor(minIntervalMs: number = 1000) {
    this.minInterval = minIntervalMs;
  }

  canExecute(): boolean {
    const now = Date.now();
    if (now - this.lastExecutionTime >= this.minInterval) {
      this.lastExecutionTime = now;
      return true;
    }
    return false;
  }

  reset(): void {
    this.lastExecutionTime = 0;
  }
}

import DOMPurify from 'dompurify';

/**
 * Security utilities for input validation and sanitization
 */

export interface ValidationOptions {
  maxLength?: number;
  minLength?: number;
  allowedChars?: RegExp;
  requireNonEmpty?: boolean;
  stripHtml?: boolean;
}

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  stripWhitespace?: boolean;
}

/**
 * Validate and sanitize text input
 */
export const validateAndSanitizeText = (
  input: string | null | undefined,
  options: ValidationOptions = {}
): { isValid: boolean; sanitized: string; errors: string[] } => {
  const errors: string[] = [];
  let sanitized = input?.toString() || '';

  // Check for required input
  if (options.requireNonEmpty && (!input || input.trim().length === 0)) {
    errors.push('Input is required');
    return { isValid: false, sanitized: '', errors };
  }

  // Check length constraints
  if (options.minLength && sanitized.length < options.minLength) {
    errors.push(`Input must be at least ${options.minLength} characters`);
  }

  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
    errors.push(`Input was truncated to ${options.maxLength} characters`);
  }

  // Check allowed characters
  if (options.allowedChars && !options.allowedChars.test(sanitized)) {
    errors.push('Input contains invalid characters');
  }

  // Strip HTML if requested
  if (options.stripHtml) {
    sanitized = DOMPurify.sanitize(sanitized, { ALLOWED_TAGS: [] });
  }

  return {
    isValid: errors.length === 0,
    sanitized: sanitized.trim(),
    errors
  };
};

/**
 * Sanitize HTML content while preserving safe tags
 */
export const sanitizeHtml = (
  html: string,
  options: SanitizeOptions = {}
): string => {
  const config = {
    ALLOWED_TAGS: options.allowedTags || [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'h1', 'h2', 'h3'
    ],
    ALLOWED_ATTR: options.allowedAttributes || ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false
  };

  let sanitized = DOMPurify.sanitize(html, config) as string;

  if (options.stripWhitespace) {
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
  }

  return sanitized;
};

/**
 * Validate email address format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic format)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize and validate file names
 */
export const sanitizeFileName = (fileName: string): string => {
  // Remove path traversal attempts and invalid characters
  return fileName
    .replace(/[\/\\:*?"<>|]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/^\./, '_')
    .substring(0, 255)
    .trim();
};

/**
 * Rate limiting helper (simple in-memory implementation)
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  }
  
  clear(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Content Security Policy helper
 */
export const getCSPNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * SQL injection prevention patterns
 */
export const containsSqlInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(;|\-\-|\/\*|\*\/)/,
    /(\bOR\b.*=.*|1=1|1=0)/i,
    /(\bAND\b.*=.*)/i,
    /(script|javascript|vbscript|onload|onerror|onclick)/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * XSS prevention patterns
 */
export const containsXss = (input: string): boolean => {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /expression\s*\(/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};
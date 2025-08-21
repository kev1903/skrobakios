/**
 * Shared security utilities for Supabase Edge Functions
 */

export interface SecurityValidationOptions {
  maxRequestSize?: number; // in bytes
  requiredHeaders?: string[];
  allowedOrigins?: string[];
  rateLimitPerMinute?: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Validate incoming request for security compliance
 */
export function validateRequest(
  req: Request, 
  options: SecurityValidationOptions = {}
): ValidationResult {
  const {
    maxRequestSize = 1000000, // 1MB default
    requiredHeaders = [],
    allowedOrigins = [],
    rateLimitPerMinute = 60
  } = options;

  // Check content length to prevent DoS
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxRequestSize) {
    return {
      isValid: false,
      error: 'Request payload too large',
      statusCode: 413
    };
  }

  // Validate required headers
  for (const header of requiredHeaders) {
    if (!req.headers.get(header)) {
      return {
        isValid: false,
        error: `Missing required header: ${header}`,
        statusCode: 400
      };
    }
  }

  // Validate origin if specified
  if (allowedOrigins.length > 0) {
    const origin = req.headers.get('origin');
    if (origin && !allowedOrigins.includes(origin)) {
      return {
        isValid: false,
        error: 'Origin not allowed',
        statusCode: 403
      };
    }
  }

  return { isValid: true };
}

/**
 * Safely parse and validate JSON input
 */
export function safeParseJson<T = any>(
  jsonString: string,
  schema?: (obj: any) => obj is T
): { data?: T; error?: string } {
  try {
    // Basic size check
    if (jsonString.length > 100000) { // 100KB limit
      return { error: 'JSON input too large' };
    }

    const parsed = JSON.parse(jsonString);
    
    // Validate against schema if provided
    if (schema && !schema(parsed)) {
      return { error: 'Invalid data structure' };
    }

    return { data: parsed };
  } catch (error) {
    return { error: 'Invalid JSON format' };
  }
}

/**
 * Sanitize string input to prevent injection attacks
 */
export function sanitizeString(
  input: string,
  maxLength: number = 1000
): string {
  if (typeof input !== 'string') return '';
  
  return input
    .slice(0, maxLength)
    .replace(/[<>'"&]/g, '') // Basic XSS prevention
    .trim();
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof uuid === 'string' && uuidRegex.test(uuid);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && 
         email.length <= 254 && 
         emailRegex.test(email);
}

/**
 * Rate limiting storage (in-memory for demo - use Redis in production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limiting for a given identifier
 */
export function checkRateLimit(
  identifier: string, 
  limitPerMinute: number = 60
): boolean {
  const now = Date.now();
  const minuteMs = 60 * 1000;
  
  const current = rateLimitStore.get(identifier);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    rateLimitStore.set(identifier, { count: 1, resetTime: now + minuteMs });
    return true;
  }
  
  if (current.count >= limitPerMinute) {
    return false; // Rate limit exceeded
  }
  
  current.count++;
  return true;
}

/**
 * Generate secure response headers
 */
export function getSecureHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Type': 'application/json'
  };
}
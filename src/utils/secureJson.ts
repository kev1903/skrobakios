/**
 * Secure JSON utilities to prevent parsing vulnerabilities
 */

export interface ParseJsonOptions {
  fallback?: any;
  maxDepth?: number;
  allowedTypes?: string[];
}

/**
 * Safely parse JSON with error handling and validation
 */
export function safeJsonParse<T = any>(
  jsonString: string | null | undefined,
  options: ParseJsonOptions = {}
): T | null {
  if (!jsonString || typeof jsonString !== 'string') {
    return options.fallback ?? null;
  }

  try {
    // Basic size check to prevent DoS
    if (jsonString.length > 1000000) { // 1MB limit
      console.warn('JSON string too large, rejecting parse');
      return options.fallback ?? null;
    }

    const parsed = JSON.parse(jsonString);
    
    // Validate depth if specified
    if (options.maxDepth && getObjectDepth(parsed) > options.maxDepth) {
      console.warn('JSON object depth exceeds maximum allowed');
      return options.fallback ?? null;
    }

    // Validate allowed types if specified
    if (options.allowedTypes && !options.allowedTypes.includes(typeof parsed)) {
      console.warn('JSON parsed type not in allowed types');
      return options.fallback ?? null;
    }

    return parsed as T;
  } catch (error) {
    console.warn('Failed to parse JSON safely:', error);
    return options.fallback ?? null;
  }
}

/**
 * Safely stringify JSON with error handling
 */
export function safeJsonStringify(
  value: any,
  fallback: string = '{}'
): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn('Failed to stringify JSON safely:', error);
    return fallback;
  }
}

/**
 * Calculate object depth for security validation
 */
function getObjectDepth(obj: any, depth = 0): number {
  if (depth > 50) return depth; // Prevent stack overflow
  
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return Math.max(
      depth,
      ...Object.values(obj).map(value => 
        getObjectDepth(value, depth + 1)
      )
    );
  }
  
  if (Array.isArray(obj)) {
    return Math.max(
      depth,
      ...obj.map(item => getObjectDepth(item, depth + 1))
    );
  }
  
  return depth;
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(
  input: string,
  options: {
    maxLength?: number;
    allowedChars?: RegExp;
    stripHtml?: boolean;
  } = {}
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Strip HTML if requested
  if (options.stripHtml) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Apply length limit
  if (options.maxLength) {
    sanitized = sanitized.slice(0, options.maxLength);
  }

  // Filter allowed characters
  if (options.allowedChars) {
    sanitized = sanitized.replace(options.allowedChars, '');
  }

  return sanitized.trim();
}

/**
 * Validate email format securely
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  // Basic email validation with length limits
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email.length <= 254 && emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
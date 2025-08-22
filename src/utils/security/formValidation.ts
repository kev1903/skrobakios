import { z } from 'zod';
import { validateAndSanitizeText, validateEmail, validatePhone, validateUrl, containsSqlInjection, containsXss } from './inputValidation';

/**
 * Security-focused form validation schemas and utilities
 */

// Custom Zod validators with security checks
const secureString = (maxLength = 255, minLength = 0) => {
  let schema = z.string().max(maxLength);
  
  if (minLength > 0) {
    schema = schema.min(minLength);
  }
  
  return schema
    .refine(val => !containsSqlInjection(val), { message: 'Input contains potentially dangerous content' })
    .refine(val => !containsXss(val), { message: 'Input contains potentially dangerous scripts' })
    .transform(val => validateAndSanitizeText(val, { maxLength, stripHtml: true }).sanitized);
};

const secureEmail = () => z.string()
  .email()
  .max(254)
  .refine(validateEmail, { message: 'Invalid email format' })
  .transform(val => val.toLowerCase().trim());

const securePhone = () => z.string()
  .max(20)
  .refine(validatePhone, { message: 'Invalid phone format' })
  .transform(val => val.replace(/\s+/g, ''));

const secureUrl = () => z.string()
  .max(2048)
  .refine(validateUrl, { message: 'Invalid URL format' });

// Common form schemas with security
export const userProfileSchema = z.object({
  firstName: secureString(50, 1),
  lastName: secureString(50, 1),
  email: secureEmail(),
  phone: securePhone().optional(),
  company: secureString(100).optional(),
  bio: secureString(500).optional(),
  website: secureUrl().optional(),
});

export const projectSchema = z.object({
  name: secureString(100, 1),
  description: secureString(1000).optional(),
  location: secureString(200).optional(),
  clientName: secureString(100).optional(),
  clientEmail: secureEmail().optional(),
});

export const taskSchema = z.object({
  taskName: secureString(100, 1),
  description: secureString(1000).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  category: secureString(50).optional(),
  assignedToName: secureString(100).optional(),
});

export const leadSchema = z.object({
  company: secureString(100, 1),
  contactName: secureString(100, 1),
  contactEmail: secureEmail().optional(),
  contactPhone: securePhone().optional(),
  description: secureString(1000).optional(),
  location: secureString(200).optional(),
  website: secureUrl().optional(),
  notes: secureString(2000).optional(),
  projectAddress: secureString(200).optional(),
});

export const commentSchema = z.object({
  comment: secureString(2000, 1),
  userName: secureString(100, 1),
});

export const estimateSchema = z.object({
  estimateName: secureString(100, 1),
  clientName: secureString(100).optional(),
  clientEmail: secureEmail().optional(),
  notes: secureString(1000).optional(),
});

export const invoiceSchema = z.object({
  clientName: secureString(100, 1),
  clientEmail: secureEmail().optional(),
  notes: secureString(1000).optional(),
});

/**
 * Validate form data with security checks
 */
export const validateFormData = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} => {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const errors = result.error.errors.map(err => err.message);
      return { success: false, errors };
    }
  } catch (error) {
    return { 
      success: false, 
      errors: ['Validation failed due to security check'] 
    };
  }
};

/**
 * CSRF token generation and validation
 */
export class CSRFProtection {
  private static tokens: Map<string, { token: string; expires: number }> = new Map();
  
  static generateToken(sessionId: string): string {
    const token = crypto.getRandomValues(new Uint8Array(32))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    
    this.tokens.set(sessionId, {
      token,
      expires: Date.now() + (30 * 60 * 1000) // 30 minutes
    });
    
    return token;
  }
  
  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    
    if (!stored || stored.expires < Date.now()) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return stored.token === token;
  }
  
  static clearToken(sessionId: string): void {
    this.tokens.delete(sessionId);
  }
}

/**
 * File upload security validation
 */
export const validateFileUpload = (file: File): {
  isValid: boolean;
  errors: string[];
  sanitizedName: string;
} => {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/csv',
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  // Size check
  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB');
  }
  
  // Type check
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not allowed');
  }
  
  // Name validation
  const sanitizedName = file.name
    .replace(/[^\w\-_.]/g, '_')
    .replace(/\.\./g, '_')
    .substring(0, 100);
    
  if (sanitizedName !== file.name) {
    errors.push('File name was sanitized for security');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedName
  };
};
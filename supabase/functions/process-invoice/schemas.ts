/**
 * Input validation schemas for process-invoice edge function
 * Security Fix: Add comprehensive input validation using Zod
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Schema for the incoming request body
export const ProcessInvoiceRequestSchema = z.object({
  signed_url: z.string()
    .url({ message: 'Invalid signed URL' })
    .max(2048, { message: 'URL too long' }),
  
  filename: z.string()
    .min(1, { message: 'Filename is required' })
    .max(255, { message: 'Filename too long' })
    .regex(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png)$/i, { 
      message: 'Only image files (JPG, JPEG, PNG) are supported' 
    }),
  
  filesize: z.number()
    .int({ message: 'Filesize must be an integer' })
    .positive({ message: 'Filesize must be positive' })
    .max(1 * 1024 * 1024, { message: 'File too large (max 1MB for AI processing)' }),
  
  storage_path: z.string()
    .min(1, { message: 'Storage path is required' })
    .max(512, { message: 'Storage path too long' })
    // Prevent path traversal
    .refine(
      (path) => !path.includes('..') && !path.includes('//'),
      { message: 'Invalid storage path' }
    ),
  
  company_id: z.string()
    .uuid({ message: 'Invalid company ID format' })
    .optional()
});

export type ProcessInvoiceRequest = z.infer<typeof ProcessInvoiceRequestSchema>;

// Validate and sanitize the request
export function validateRequest(body: unknown): {
  success: boolean;
  data?: ProcessInvoiceRequest;
  error?: string;
} {
  try {
    const result = ProcessInvoiceRequestSchema.safeParse(body);
    
    if (!result.success) {
      const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return {
        success: false,
        error: `Validation failed: ${errors.join(', ')}`
      };
    }
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to validate request'
    };
  }
}

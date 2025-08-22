import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateFormData, CSRFProtection } from '@/utils/security/formValidation';
import { rateLimiter } from '@/utils/security/inputValidation';
import { toast } from 'sonner';

/**
 * Secure form hook with built-in validation, rate limiting, and CSRF protection
 */
export const useSecureForm = <T>(
  schema: z.ZodSchema<T>,
  options: {
    onSubmit: (data: T) => Promise<void> | void;
    rateLimitKey?: string;
    maxAttempts?: number;
    windowMs?: number;
    enableCSRF?: boolean;
  }
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Generate CSRF token on mount
  useState(() => {
    if (options.enableCSRF) {
      const sessionId = crypto.randomUUID();
      const token = CSRFProtection.generateToken(sessionId);
      setCsrfToken(token);
    }
  });

  const validateAndSubmit = useCallback(async (formData: unknown) => {
    setErrors([]);
    setIsLoading(true);

    try {
      // Rate limiting check
      if (options.rateLimitKey) {
        const isAllowed = rateLimiter.isAllowed(
          options.rateLimitKey,
          options.maxAttempts || 5,
          options.windowMs || 60000 // 1 minute
        );

        if (!isAllowed) {
          throw new Error('Too many attempts. Please wait before trying again.');
        }
      }

      // Validate form data
      const validation = validateFormData(schema, formData);
      
      if (!validation.success) {
        setErrors(validation.errors || ['Validation failed']);
        return;
      }

      // Submit the validated data
      await options.onSubmit(validation.data!);
      
      // Clear rate limit on successful submit
      if (options.rateLimitKey) {
        rateLimiter.clear(options.rateLimitKey);
      }

      toast.success('Form submitted successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setErrors([errorMessage]);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [schema, options]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    validateAndSubmit,
    isLoading,
    errors,
    clearErrors,
    csrfToken
  };
};

/**
 * Secure file upload hook
 */
export const useSecureFileUpload = (
  onUpload: (files: File[]) => Promise<void>,
  options: {
    maxFiles?: number;
    rateLimitKey?: string;
  } = {}
) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    setErrors([]);
    setIsUploading(true);

    try {
      // Rate limiting check
      if (options.rateLimitKey) {
        const isAllowed = rateLimiter.isAllowed(
          options.rateLimitKey,
          3, // max 3 uploads per minute
          60000
        );

        if (!isAllowed) {
          throw new Error('Upload rate limit exceeded. Please wait before uploading again.');
        }
      }

      const fileArray = Array.from(files);
      
      // Check file count limit
      if (options.maxFiles && fileArray.length > options.maxFiles) {
        throw new Error(`Maximum ${options.maxFiles} files allowed`);
      }

      // Validate each file
      const validationErrors: string[] = [];
      const validFiles: File[] = [];

      fileArray.forEach((file, index) => {
        const { isValid, errors: fileErrors } = validateFileUpload(file);
        
        if (!isValid) {
          validationErrors.push(`File ${index + 1}: ${fileErrors.join(', ')}`);
        } else {
          validFiles.push(file);
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Upload validated files
      await onUpload(validFiles);
      toast.success(`${validFiles.length} file(s) uploaded successfully`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setErrors([errorMessage]);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, options]);

  return {
    handleUpload,
    isUploading,
    errors,
    clearErrors: () => setErrors([])
  };
};

/**
 * Import validation function from security utils
 */
import { validateFileUpload } from '@/utils/security/formValidation';
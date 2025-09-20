/**
 * Global error handler to prevent digital objects related errors from showing
 */
import { toast } from 'sonner';

// List of deprecated error messages that should be filtered out
const DEPRECATED_ERROR_PATTERNS = [
  'digital objects',
  'digitalobjects',
  'digital_objects',
  'Failed to load digital',
  'digital object'
];

export const filterDeprecatedErrors = (errorMessage: string): boolean => {
  const lowerCaseMessage = errorMessage.toLowerCase();
  return DEPRECATED_ERROR_PATTERNS.some(pattern => 
    lowerCaseMessage.includes(pattern.toLowerCase())
  );
};

export const safeToastError = (message: string, options?: any) => {
  // Filter out deprecated error messages
  if (filterDeprecatedErrors(message)) {
    console.warn('Filtered deprecated error message:', message);
    return;
  }
  
  // Show the error if it's not deprecated
  toast.error(message, options);
};

export const handleApiError = (error: any, fallbackMessage: string = 'An error occurred') => {
  let errorMessage = fallbackMessage;
  
  if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  // Filter out deprecated errors
  if (filterDeprecatedErrors(errorMessage)) {
    console.warn('Filtered deprecated API error:', errorMessage);
    return;
  }
  
  safeToastError(errorMessage);
};

// Override console.error to catch and filter digital objects errors
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const errorString = args.join(' ').toLowerCase();
  
  if (filterDeprecatedErrors(errorString)) {
    console.warn('Filtered deprecated console error:', ...args);
    return;
  }
  
  originalConsoleError(...args);
};
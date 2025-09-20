/**
 * Toast filters to prevent deprecated error messages from showing
 */
import { toast as originalToast } from 'sonner';

// List of deprecated error messages to filter
const DEPRECATED_MESSAGES = [
  'failed to load digital objects',
  'digital objects',
  'digitalobjects',
  'digital_objects'
];

const shouldFilterMessage = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return DEPRECATED_MESSAGES.some(deprecated => 
    lowerMessage.includes(deprecated)
  );
};

// Override the toast.error function to filter deprecated messages
const originalError = originalToast.error;
originalToast.error = (message: string, ...args: any[]) => {
  if (shouldFilterMessage(message)) {
    console.warn('Filtered deprecated toast error:', message);
    return;
  }
  return originalError(message, ...args);
};

export { originalToast as toast };
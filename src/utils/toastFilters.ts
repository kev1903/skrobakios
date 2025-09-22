/**
 * Toast filters to prevent deprecated error messages from showing
 */
import { toast as originalToast } from 'sonner';

// List of deprecated error messages to filter
const DEPRECATED_MESSAGES = [
  'failed to load digital objects',
  'failed to load digital',
  'digital objects',
  'digitalobjects',
  'digital_objects',
  'digital object'
];

const shouldFilterMessage = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return DEPRECATED_MESSAGES.some(deprecated => 
    lowerMessage.includes(deprecated)
  );
};

// Override all toast methods to filter deprecated messages
const originalError = originalToast.error;
const originalSuccess = originalToast.success;
const originalInfo = originalToast.info;
const originalWarning = originalToast.warning;

originalToast.error = (message: string, ...args: any[]) => {
  if (shouldFilterMessage(String(message))) {
    console.warn('Filtered deprecated toast error:', message);
    return;
  }
  return originalError(message, ...args);
};

originalToast.success = (message: string, ...args: any[]) => {
  if (shouldFilterMessage(String(message))) {
    console.warn('Filtered deprecated toast success:', message);
    return;
  }
  return originalSuccess(message, ...args);
};

originalToast.info = (message: string, ...args: any[]) => {
  if (shouldFilterMessage(String(message))) {
    console.warn('Filtered deprecated toast info:', message);
    return;
  }
  return originalInfo(message, ...args);
};

originalToast.warning = (message: string, ...args: any[]) => {
  if (shouldFilterMessage(String(message))) {
    console.warn('Filtered deprecated toast warning:', message);
    return;
  }
  return originalWarning(message, ...args);
};

export { originalToast as toast };
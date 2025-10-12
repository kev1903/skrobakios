/**
 * Safe localStorage wrapper with quota handling
 */

export const safeLocalStorage = {
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, attempting cleanup');
        // Try to free up space
        try {
          // Remove old cached data
          const keys = Object.keys(localStorage);
          const cacheKeys = keys.filter(k => 
            k.includes('cache') || 
            k.includes('temp') ||
            k.startsWith('project-chat-') // Old project chats
          );
          
          // Remove oldest items first
          cacheKeys.sort().slice(0, Math.ceil(cacheKeys.length / 2)).forEach(k => {
            try {
              localStorage.removeItem(k);
            } catch (err) {
              console.error('Error removing key:', k, err);
            }
          });
          
          // Try again
          localStorage.setItem(key, value);
          return true;
        } catch (cleanupError) {
          console.error('Failed to save to localStorage even after cleanup:', cleanupError);
          return false;
        }
      }
      console.error('Error saving to localStorage:', e);
      return false;
    }
  },

  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
  }
};

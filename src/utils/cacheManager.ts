/**
 * Cache Manager - Centralized cache control for the entire application
 * Handles service worker cleanup, browser cache, and application-level caches
 */

// App version - increment this when you want to force cache refresh
export const APP_VERSION = '2.0.1';
const VERSION_KEY = 'app_version';

/**
 * Clear all application caches
 */
export const clearAllCaches = async () => {
  console.log('🧹 Clearing all application caches...');
  
  try {
    // 1. Clear localStorage app data (preserve auth)
    const authKeys = ['supabase.auth.token', 'sb-auth-token'];
    const keysToPreserve = Object.keys(localStorage).filter(key => 
      authKeys.some(authKey => key.includes(authKey))
    );
    
    const preservedData: Record<string, string> = {};
    keysToPreserve.forEach(key => {
      preservedData[key] = localStorage.getItem(key) || '';
    });
    
    localStorage.clear();
    
    // Restore auth keys
    Object.entries(preservedData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    // 2. Clear sessionStorage
    sessionStorage.clear();
    
    // 3. Clear all browser caches (if supported)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ Browser caches cleared');
    }
    
    console.log('✅ All application caches cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
    return false;
  }
};

/**
 * Check if app version has changed and clear caches if needed
 */
export const checkAndUpdateVersion = async () => {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  
  // First check local version
  if (storedVersion !== APP_VERSION) {
    console.log(`🔄 Version changed: ${storedVersion} → ${APP_VERSION}`);
    console.log('Clearing caches for new version...');
    
    await clearAllCaches();
    localStorage.setItem(VERSION_KEY, APP_VERSION);
    
    return { updated: true, oldVersion: storedVersion, newVersion: APP_VERSION, forceUpdate: false };
  }
  
  // Then check server version
  const hasServerUpdate = await checkForUpdates();
  if (hasServerUpdate) {
    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const serverVersion = data.version;
        const forceUpdate = data.forceUpdate || false;
        
        console.log(`🔄 Server version available: ${APP_VERSION} → ${serverVersion}`);
        
        return { 
          updated: true, 
          oldVersion: APP_VERSION, 
          newVersion: serverVersion,
          forceUpdate
        };
      }
    } catch (error) {
      console.log('Error fetching server version:', error);
    }
  }
  
  return { updated: false, version: APP_VERSION, forceUpdate: false };
};

/**
 * Force reload the application with cache bypass
 */
export const forceReload = () => {
  console.log('🔄 Force reloading application...');
  window.location.reload();
};

/**
 * Check for updates by comparing server version
 */
export const checkForUpdates = async (): Promise<boolean> => {
  try {
    // Add timestamp to bypass cache
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const serverVersion = data.version;
      
      return serverVersion !== APP_VERSION;
    }
  } catch (error) {
    console.log('Could not check for updates:', error);
  }
  
  return false;
};

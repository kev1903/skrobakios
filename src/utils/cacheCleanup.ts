/**
 * Cache cleanup utility to remove stale data that might cause errors
 */

export const cleanupDigitalObjectsCache = () => {
  console.log('🧹 Cleaning up potential digital objects cache...');
  
  try {
    // Clean localStorage
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (key.toLowerCase().includes('digital') || 
          key.toLowerCase().includes('object') ||
          key.toLowerCase().includes('digitalobject')) {
        console.log(`Removing localStorage key: ${key}`);
        localStorage.removeItem(key);
      }
    });

    // Clean sessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage);
    sessionStorageKeys.forEach(key => {
      if (key.toLowerCase().includes('digital') || 
          key.toLowerCase().includes('object') ||
          key.toLowerCase().includes('digitalobject')) {
        console.log(`Removing sessionStorage key: ${key}`);
        sessionStorage.removeItem(key);
      }
    });

    // Clear any potential Mapbox cache that might contain stale data
    const mapboxKeys = localStorageKeys.filter(key => 
      key.includes('mapbox') || key.includes('map-')
    );
    mapboxKeys.forEach(key => {
      console.log(`Clearing potentially stale mapbox cache: ${key}`);
      localStorage.removeItem(key);
    });

    console.log('✅ Cache cleanup completed');
  } catch (error) {
    console.error('Error during cache cleanup:', error);
  }
};

export const clearAllAppCache = () => {
  console.log('🧹 Performing full application cache cleanup...');
  
  try {
    // Clear localStorage except for essential data
    const preserveKeys = [
      'currentCompanyId',
      'currentUserId', 
      'authToken',
      'theme',
      'sidebarState'
    ];
    
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (!preserveKeys.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Clear all sessionStorage
    sessionStorage.clear();

    console.log('✅ Full cache cleanup completed');
  } catch (error) {
    console.error('Error during full cache cleanup:', error);
  }
};
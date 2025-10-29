/**
 * Service Worker Manager
 * Handles service worker registration and lifecycle
 */

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    // Unregister any old service workers first
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(reg => reg.unregister()));
    console.log('Old service workers unregistered');

    // Register new service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none' // Always check for updates
    });

    console.log('✅ Service Worker registered:', registration);

    // Check for updates immediately
    registration.update();

    // Check for updates every 2 minutes
    setInterval(() => {
      registration.update();
    }, 2 * 60 * 1000);

    // Listen for new service worker waiting
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('📦 New version available!');
            // Notify the app that an update is available
            window.dispatchEvent(new CustomEvent('swUpdateAvailable', { 
              detail: { registration } 
            }));
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Force update to new service worker
 */
export const updateServiceWorker = async (registration: ServiceWorkerRegistration) => {
  const waitingWorker = registration.waiting;
  
  if (waitingWorker) {
    // Send message to service worker to skip waiting
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload once the new service worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }
};

/**
 * Clear all caches via service worker
 */
export const clearServiceWorkerCaches = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    
    // Wait for confirmation
    return new Promise<void>((resolve) => {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'CACHE_CLEARED') {
          navigator.serviceWorker.removeEventListener('message', handleMessage);
          resolve();
        }
      };
      
      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
        resolve();
      }, 5000);
    });
  }
};

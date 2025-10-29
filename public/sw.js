// Service Worker for aggressive cache management
const CACHE_VERSION = 'v2.0.1';
const CACHE_NAME = `skrobaki-${CACHE_VERSION}`;

// Install event - clean up old caches
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate event - take control immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker');
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('[SW] Service worker activated and ready');
    })
  );
});

// Fetch event - network-first strategy with version checking
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For version.json, always fetch fresh from network
  if (url.pathname.includes('version.json')) {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
    );
    return;
  }
  
  // For HTML files, always try network first
  if (url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.')) {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-cache'
      }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // For static assets (JS, CSS, images), use cache-first but validate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return fetch(event.request).then((response) => {
        // Clone the response before caching
        cache.put(event.request, response.clone());
        return response;
      }).catch(() => {
        // If network fails, try cache
        return cache.match(event.request);
      });
    })
  );
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        // Notify client that caches are cleared
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        });
      })
    );
  }
});

const CACHE_VERSION = 'mold-pwa-v2';
const STATIC_CACHE = 'mold-static-v2';
const RUNTIME_CACHE = 'mold-runtime-v1';

// Core assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Static assets cached');
        // Force the waiting service worker to become active
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return !cacheName.includes(STATIC_CACHE) &&
                     !cacheName.includes(RUNTIME_CACHE) &&
                     cacheName !== CACHE_VERSION;
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        console.log('[Service Worker] Old caches removed');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and API calls
  if (request.method !== 'GET') {
    return;
  }

  // For API calls, try network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache successful API responses
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // For static assets and pages - cache first, fallback to network
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Cache successful responses
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });

            return networkResponse;
          })
          .catch(() => {
            // Return offline fallback for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
            // Return a basic offline response for other assets
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

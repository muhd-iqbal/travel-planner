const CACHE_NAME = 'travel-planner-v1.0.0';
const API_CACHE_NAME = 'travel-planner-api-v1.0.0';
const STATIC_CACHE_NAME = 'travel-planner-static-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/static/js/main.js',
    '/static/css/main.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    // Add other critical assets
];

// API endpoints to cache
const API_ENDPOINTS = [
    '/api/trips',
    '/api/health'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');

    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE_NAME).then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
            }),

            // Skip waiting to activate immediately
            self.skipWaiting()
        ])
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');

    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName !== CACHE_NAME &&
                                cacheName !== API_CACHE_NAME &&
                                cacheName !== STATIC_CACHE_NAME;
                        })
                        .map((cacheName) => {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),

            // Take control of all clients
            self.clients.claim()
        ])
    );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
        return;
    }

    // Handle static assets
    if (request.destination === 'document' ||
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'image') {
        event.respondWith(handleStaticRequest(request));
        return;
    }

    // Handle Google Places API requests
    if (url.hostname === 'maps.googleapis.com') {
        event.respondWith(handleGoogleMapsRequest(request));
        return;
    }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
    const cache = await caches.open(API_CACHE_NAME);

    try {
        // Try network first
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Cache successful responses
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Network failed, trying cache for:', request.url);

        // Fall back to cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline response for API calls
        return new Response(
            JSON.stringify({
                error: 'Offline - please check your internet connection',
                offline: true
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
    const cache = await caches.open(STATIC_CACHE_NAME);

    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        // Fall back to network
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Return offline page for documents
        if (request.destination === 'document') {
            return cache.match('/');
        }

        throw error;
    }
}

// Handle Google Places API requests
async function handleGoogleMapsRequest(request) {
    try {
        // Always try network for Google Maps (real-time data)
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Google Maps request failed');
        throw error;
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync-trips') {
        event.waitUntil(syncOfflineActions());
    }
});

// Sync offline actions when back online
async function syncOfflineActions() {
    console.log('Service Worker: Syncing offline actions...');

    try {
        // Get offline actions from IndexedDB or localStorage
        const offlineActions = JSON.parse(localStorage.getItem('offlineActions') || '[]');

        for (const action of offlineActions) {
            try {
                await fetch(action.url, action.options);
                console.log('Service Worker: Synced action:', action.type);
            } catch (error) {
                console.error('Service Worker: Failed to sync action:', action.type, error);
            }
        }

        // Clear synced actions
        localStorage.removeItem('offlineActions');

    } catch (error) {
        console.error('Service Worker: Background sync failed:', error);
    }
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received');

    const title = 'Travel Planner';
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        tag: 'travel-planner-notification',
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: '/icons/action-open.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/action-close.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
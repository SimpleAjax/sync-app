// Service Worker for PWA and Push Notifications

const CACHE_NAME = 'sync-app-v3';
const urlsToCache = [
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
    // For navigation requests (HTML pages), use Network First
    // This ensures we always get the latest version with correct JS chunks
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => {
                    // If offline, try cache
                    return caches.match(event.request);
                })
        );
        return;
    }

    // For everything else (static assets, images), use Cache First
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
    let data = {
        title: 'Sync - Daily Connection',
        body: 'Today\'s question is ready!',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'daily-sync',
        requireInteraction: false,
        data: {
            url: '/'
        }
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
            console.error('Error parsing push data:', e);
        }
    }

    const promiseChain = self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        requireInteraction: data.requireInteraction,
        data: data.data,
        vibrate: [200, 100, 200],
        actions: [
            { action: 'open', title: 'Play Now', icon: '/icon-192x192.png' },
            { action: 'close', title: 'Later' }
        ]
    });

    event.waitUntil(promiseChain);
});

// Notification click event - open the app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if app is already open
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window if not open
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

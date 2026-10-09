const CACHE_NAME = 'agriconnect-v2';
const ASSETS_TO_CACHE = [
  '/Agriconnect-web/',
  '/Agriconnect-web/index.html',
  '/Agriconnect-web/logo.png',
  '/Agriconnect-web/manifest.json'
];

// 1. Install Event: Cache Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Network-first with Cache Fallback (Smart Offline Handling)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // నెట్‌వర్క్ ఫెయిల్ అయినప్పుడు క్యాష్ నుంచి ఫైల్ ఇస్తుంది
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // పేజీ లోడ్ కాకపోతే హోమ్ పేజీ చూపిస్తుంది
          if (event.request.mode === 'navigate') {
            return caches.match('/Agriconnect-web/index.html');
          }
        });
      })
  );
});

// 4. Push Notification Event
self.addEventListener('push', (event) => {
  let data = { title: 'AgriConnect Updates', body: 'రైతు సమాచారం అందుబాటులో ఉంది!' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    data = { title: 'AgriConnect Updates', body: event.data.text() };
  }

  const options = {
    body: data.body,
    icon: '/Agriconnect-web/logo.png',
    badge: '/Agriconnect-web/logo.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/Agriconnect-web/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. Notification Click Event: Open App
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url || '/Agriconnect-web/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes('/Agriconnect-web/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 6. Background Sync Event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-farming-data') {
    console.log('AgriConnect: Syncing background data...');
  }
});
// Periodic Background Sync for Agriculture News & Updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'agri-news-sync') {
    event.waitUntil(
      fetch('/Agriconnect-web/index.html')
        .then((response) => {
          return caches.open('agriconnect-v1').then((cache) => {
            return cache.put('/Agriconnect-web/index.html', response);
          });
        })
        .catch((err) => console.log('Periodic sync failed:', err))
    );
  }
});


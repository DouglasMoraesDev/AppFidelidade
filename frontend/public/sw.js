// Service Worker para AppFidelidade PWA
const CACHE_NAME = 'appfidelidade-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        // Se falhar a cache inicial, continua mesmo assim
        console.log('Aviso: Alguns recursos não puderam ser cacheados');
      });
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
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

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Apenas cache para GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar APIs - sempre usar network
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    // Network first strategy
    fetch(event.request)
      .then((response) => {
        // Se sucesso, cache a resposta
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar, usar cache
        return caches.match(event.request);
      })
  );
});

// Push notification event - recebe notificações push
self.addEventListener('push', (event) => {
  let data = { title: 'Nova Notificação', body: 'Você tem uma nova mensagem' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.mensagem || 'Você tem uma nova mensagem',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'notificacao-app',
    requireInteraction: false,
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || data.titulo || 'AppFidelidade', options)
  );
});

// Notification click event - abre o app ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já tem uma janela aberta, foca nela
      for (let client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Senão, abre uma nova
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/');
      }
    })
  );
});

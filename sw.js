const CACHE_NAME = 'brh-store-v2';

// Instalación limpia
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

// Activación para borrar cachés viejas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia equilibrada: Red primero, y si no hay internet, usa la caché
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Si el archivo existe en la red, lo clonamos y actualizamos la caché al vuelo
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        let responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Si estás offline, se sirve lo que esté guardado
        return caches.match(e.request);
      })
  );
});

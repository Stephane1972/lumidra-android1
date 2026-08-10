const CACHE_NAME = 'lumidra-cache-v5';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './js/01-data-content.js',
  './js/02-i18n-helpers.js',
  './js/03-icons-art.js',
  './js/04-game-logic.js',
  './js/05-screens.js',
  './js/06-modals-share.js',
  './js/07-actions-render.js',
  './js/08-app.js',
  './manifest.json',
  './fonts/baloo-2-latin-500-normal.woff2',
  './fonts/baloo-2-latin-600-normal.woff2',
  './fonts/baloo-2-latin-700-normal.woff2',
  './fonts/baloo-2-latin-800-normal.woff2',
  './fonts/nunito-latin-400-normal.woff2',
  './fonts/nunito-latin-600-normal.woff2',
  './fonts/nunito-latin-700-normal.woff2',
  './fonts/nunito-latin-800-normal.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first : le jeu (partie et sauvegardes locales comprises) fonctionne entièrement hors-ligne
// une fois installé. En cas de nouvelle ressource jamais vue, on retente le réseau puis on met en cache.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => cached);
    })
  );
});

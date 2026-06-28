const CACHE_NAME = 'brier-v4.3';
const PRECACHE_URLS = [
  '/',
  '/styles.css',
  '/script.js?v=4.2',
  '/translations.js?v=4.2',
  '/favicon.svg',
  '/favicon.ico',
  '/favicon-512.png',
  '/apple-touch-icon.png',
  '/og-image.png',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;

  // Network-first for HTML, cache-first for assets
  if (request.headers.get('Accept')?.includes('text/html')) {
    e.respondWith(
      fetch(request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return res;
      }).catch(() => caches.match(request))
    );
  } else {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return res;
        });
      })
    );
  }
});
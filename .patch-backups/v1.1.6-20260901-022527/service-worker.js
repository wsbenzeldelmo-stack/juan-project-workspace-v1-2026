/*
 * JUAN PROJECT WORKSPACE — Offline cache
 * Update CACHE_NAME when you intentionally want every browser to refresh cached assets.
 */
const CACHE_NAME = 'juan-project-workspace-v1-2026-cache-116';
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/core.css",
  "./css/visual-language.css",
  "./css/responsive.css",
  "./css/overview-assistant.css",
  "./css/management-layout.css",
  "./css/interactions-scroll.css",
  "./css/project-catalog.css",
  "./css/items-security-performance.css",
  "./css/payments-invoice-urgency.css",
  "./css/catalog-calendar-receipts.css",
  "./css/typography-guided-assistant.css",
  "./css/mobile-viewer.css",
  "./css/shop-refinement.css",
  "./js/app.js",
  "./js/assistant-bridge.js",
  "./js/assistant.js",
  "./js/pwa.js",
  "./js/mobile-viewer.js",
  "./assets/apple-touch-icon.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-1024.png",
  "./assets/favicon-64.png",
  "./ocr/tesseract.min.js"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(hit => hit || caches.match('./index.html')))
  );
});

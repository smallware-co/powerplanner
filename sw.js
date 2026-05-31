/**
 * sw.js
 *
 * Service worker for PowerPlanner PWA.
 * Caches all app assets on install for full offline support.
 * Strategy: cache-first for app shell, network-first for Google Fonts.
 */

const CACHE = 'powerplanner-v1';

const APP_SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/storage.js',
  '/components/solar.js',
  '/components/wind.js',
  '/components/hydro.js',
  '/components/generator.js',
  '/components/battery.js',
  '/components/water.js',
  '/calculator/energy.js',
  '/calculator/financial.js',
  '/calculator/water-calc.js',
  '/ui/builder.js',
  '/ui/results.js',
  '/manifest.json',
];

// Install: cache all app shell files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for app shell, network for Google Fonts
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Network-first for Google Fonts (can degrade gracefully)
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

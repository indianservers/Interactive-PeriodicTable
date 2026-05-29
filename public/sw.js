const CACHE_VERSION = 'v5';
const APP_SHELL_CACHE = `chemistry-universe-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `chemistry-universe-runtime-${CACHE_VERSION}`;
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/periodic-icon.svg',
];

const isCacheableRequest = request => (
  request.method === 'GET'
  && ['http:', 'https:'].includes(new URL(request.url).protocol)
);

const isNavigationRequest = request => (
  request.mode === 'navigate'
  || (request.headers.get('accept') || '').includes('text/html')
);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => ![APP_SHELL_CACHE, RUNTIME_CACHE].includes(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && (response.ok || response.type === 'opaque')) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstHtml(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(APP_SHELL_CACHE);
      cache.put('/index.html', response.clone());
    }
    return response;
  } catch {
    return caches.match('/index.html');
  }
}

self.addEventListener('fetch', event => {
  if (!isCacheableRequest(event.request)) return;

  if (isNavigationRequest(event.request)) {
    event.respondWith(networkFirstHtml(event.request));
    return;
  }

  event.respondWith(
    cacheFirst(event.request).catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

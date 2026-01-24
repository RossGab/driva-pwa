const CACHE_VERSION = "v4";
const CACHE_NAME = `field-task-app-${CACHE_VERSION}`;

const APP_SHELL = [
  "./",
  "./install.html",
  "./driver.html",
  "./manifest.json",
  "./logo.jpg",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => k !== CACHE_NAME && caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const { request } = event;

  // ✅ PAGE NAVIGATION: always fallback to driver.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("./driver.html"))
    );
    return;
  }

  // ✅ ASSET FETCH: cache-first
  event.respondWith(
    caches.match(request).then(
      cached => cached || fetch(request)
    )
  );
});

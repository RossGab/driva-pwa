
const CACHE_VERSION = "v3";
const CACHE_NAME = `field-task-app-${CACHE_VERSION}`;

const APP_SHELL = [
  "./",
  "./driver.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js",
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js",
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js"
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
  // IMPORTANT: handle navigation (refresh)
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match("./driver.html").then(res => res || fetch(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      cached => cached || fetch(event.request)
    )
  );
});

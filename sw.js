const CACHE_VERSION = "v11"; // ⬅ bump version
const CACHE_NAME = `field-task-app-${CACHE_VERSION}`;

const BASE_PATH = "/driva-pwa/";

const APP_SHELL = [
  BASE_PATH,
  BASE_PATH + "driver.html",
  BASE_PATH + "manifest.json",
  BASE_PATH + "icon-192.png",
  BASE_PATH + "icon-512.png"
];


// 🔹 INSTALL — Cache app shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});


// 🔹 ACTIVATE — Clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});


// 🔥 FETCH — App-Shell First Strategy
self.addEventListener("fetch", event => {
  const request = event.request;

  // 🟢 Always serve driver.html for navigation
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(BASE_PATH + "driver.html")
    );
    return;
  }

  // 🟢 Cache-first for static assets
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        // Optional: cache new assets
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
        }
        return response;
      }).catch(() => {
        // If completely offline and not cached
        return null;
      });
    })
  );
});

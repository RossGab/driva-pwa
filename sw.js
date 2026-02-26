const CACHE_VERSION = "v9";
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
        keys.map(k => k !== CACHE_NAME && caches.delete(k))
      )
    )
  );
  self.clients.claim();
});


// 🔹 FETCH — Navigation always loads driver.html offline
self.addEventListener("fetch", event => {
  const request = event.request;

  // 🟢 Handle page navigation
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(BASE_PATH + "driver.html")
        .then(response => {
          return response || fetch(request);
        })
        .catch(() => caches.match(BASE_PATH + "driver.html"))
    );
    return;
  }

  // 🟢 Handle other assets
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request);
    })
  );
});

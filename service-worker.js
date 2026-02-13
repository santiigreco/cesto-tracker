
// Minimal Service Worker to allow PWA installation criteria
self.addEventListener('fetch', function(event) {
  // Pass through requests
  event.respondWith(fetch(event.request));
});

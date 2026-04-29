/* Minimal service worker (required for PWA installability).
   Intentionally does not cache to avoid interfering with Vite dev/HMR. */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

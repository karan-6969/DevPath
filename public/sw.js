// public/sw.js — Service Worker for asset caching
const CACHE = 'devpath-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Never cache Supabase API calls — always need fresh data
  if (url.hostname.includes('supabase.co')) return

  // Cache JS, CSS, fonts — these have hashed filenames so safe to cache forever
  if (
    e.request.destination === 'script' ||
    e.request.destination === 'style'  ||
    e.request.destination === 'font'
  ) {
    e.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(e.request)
        if (cached) return cached
        const response = await fetch(e.request)
        cache.put(e.request, response.clone())
        return response
      })
    )
  }
})

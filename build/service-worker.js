/* FitPulse service worker. The version and precache list are filled in at build time. */
const VERSION = '__VERSION__'
const PRECACHE = __PRECACHE__
const SHELL_CACHE = `fitpulse-shell-${VERSION}`
const RUNTIME_CACHE = 'fitpulse-runtime-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('fitpulse-shell-') && key !== SHELL_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

// The page asks a waiting worker to take over when the user accepts the update.
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting()
})

async function networkFirstPage(request) {
  try {
    return await fetch(request)
  } catch {
    const cache = await caches.open(SHELL_CACHE)
    return (await cache.match('/index.html')) || Response.error()
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  return cached || fetch(request)
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response.ok || response.type === 'opaque') cache.put(request, response.clone())
      return response
    })
    .catch(() => cached)
  return cached || network
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request))
  } else if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request))
  } else if (
    (url.origin === self.location.origin && /^\/(exercises|images|icons)\//.test(url.pathname)) ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(staleWhileRevalidate(request))
  }
})

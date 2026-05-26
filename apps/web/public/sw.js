/**
 * AryTrano — minimal service worker (E-T13 PWA basics).
 *
 * Strategy : network-first with a tiny static cache for the shell.
 * Goal is "Madagascar 3G falls over → at least the visitor sees the
 * home shell + their last-viewed listings if cached" — NOT a full
 * offline mode (that would inflate the cache + leak stale data).
 *
 * Scope :
 *   - Cache /, /annonces, /favicon.ico, /manifest.webmanifest on install.
 *   - Network-first for navigations; fall back to cached home if
 *     the network errors out (DNS, no signal, etc).
 *   - Same-origin GET requests for static assets get a cache-first
 *     strategy with 7-day staleness.
 *
 * Versioned cache name so a redeploy invalidates old entries.
 */

// v3 — adds /offline to the install shell so the SW can serve a
// dedicated offline page when both network and runtime cache miss.
// Bump invalidates v2 caches so old installs get the new shell entry.
const CACHE_VERSION = 'v3'
const STATIC_CACHE = `arytrano-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `arytrano-runtime-${CACHE_VERSION}`
const SHELL_URLS = [
  '/',
  '/annonces',
  '/offline',
  '/favicon.ico',
  '/manifest.webmanifest',
]

self.addEventListener('install', (event) => {
  // Skip waiting so the new SW activates immediately on the next
  // navigation — important when we ship a bug fix.
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(SHELL_URLS)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Wipe old versioned caches.
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Skip cross-origin (Cloudinary, Stadia, Google Analytics, etc.) —
  // those have their own caching layers and we don't want to inflate
  // our cache with third-party blobs.
  if (url.origin !== self.location.origin) return

  // Never cache the auth + admin paths or API. Privacy + freshness.
  if (
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/sign-') ||
    url.pathname.startsWith('/u/')
  ) {
    return
  }

  // HTML navigations : network-first, fall back to cached home on
  // failure. Keeps the user moving even when the network drops.
  //
  // Listing-detail pages (`/<city>/<neighborhood>/<slug>` — three
  // segments) are NEVER runtime-cached : a listing taken down for
  // moderation (suspended, reported, hidden) must not stay reachable
  // offline. The /annonces index is fine — stale counts are annoying
  // but reveal nothing that was removed for safety reasons.
  if (request.mode === 'navigate') {
    const segments = url.pathname.split('/').filter(Boolean)
    const isListingDetail = segments.length === 3
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!isListingDetail) {
            const copy = response.clone()
            caches
              .open(RUNTIME_CACHE)
              .then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() =>
          // Network failed. Try the requested URL first, then the home
          // shell, then the dedicated /offline page. Only return a raw
          // 503 if even /offline isn't cached (first visit + dropped
          // network mid-install — rare edge).
          caches
            .match(request)
            .then((match) => match ?? caches.match('/offline'))
            .then((match) => match ?? caches.match('/'))
            .then((response) => response ?? new Response('Offline', { status: 503 })),
        ),
    )
    return
  }

  // Static assets : cache-first, stale-while-revalidate-ish.
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            const copy = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
            return response
          })
          .catch(() => cached ?? new Response('', { status: 504 }))
        return cached ?? fetchPromise
      }),
    )
  }
})

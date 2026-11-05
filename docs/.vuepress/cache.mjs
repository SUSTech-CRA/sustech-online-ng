// Cache API rejects 206 responses; store each PMTiles byte range separately as 200.
export const pmtilesRangePlugin = {
  cacheKeyWillBeUsed: ({ request }) => {
    const url = new URL(request.url)
    url.searchParams.set('__pmtiles_range', request.headers.get('Range'))
    return new Request(url, request)
  },
  cacheWillUpdate: ({ request, response }) => {
    if (request.cache === 'no-store' || response.status !== 206) return null
    return new Response(response.body, { status: 200, headers: response.headers })
  },
  cachedResponseWillBeUsed: ({ request, cachedResponse }) => {
    if (!cachedResponse || ['reload', 'no-store', 'no-cache'].includes(request.cache)) return null
    return new Response(cachedResponse.body, { status: 206, headers: cachedResponse.headers })
  },
}

// Workbox serializes these callbacks into the worker; keep them self-contained.
export const runtimeCaching = [
  {
    urlPattern: ({ url }) => /^(\/api\/public)?\/(routes|stops)(\/|$)/.test(url.pathname),
    handler: 'NetworkOnly', // The API's HTTP cache headers control reference data freshness.
  },
  {
    urlPattern: ({ url }) => url.pathname.startsWith('/api/') || /^\/(vehicles|arrivals|notices|schedules)(\/|$)/.test(url.pathname),
    handler: 'NetworkOnly',
    options: { fetchOptions: { cache: 'no-store' } },
  },
  {
    urlPattern: ({ url, request }) => url.pathname.endsWith('.pmtiles') && request.headers.has('Range'),
    handler: 'CacheFirst',
    options: {
      cacheName: 'pmtiles-ranges-v1',
      plugins: [pmtilesRangePlugin],
      expiration: { maxEntries: 512, maxAgeSeconds: 86400, purgeOnQuotaError: true },
    },
  },
  {
    urlPattern: ({ url, request }) =>
      (url.origin === 'https://bus.sustcra.com' && /^\/(static|geojson)\//.test(url.pathname)) ||
      (url.origin === 'https://mirrors.sustech.edu.cn' && /^\/(osm-tile|site\/pmtiles-data)\//.test(url.pathname)) ||
      (url.origin === 'https://google-proxy.zuzuche.com' && url.pathname.startsWith('/vt/')) ||
      ['image', 'font', 'style', 'script'].includes(request.destination),
    handler: 'CacheFirst',
    options: {
      cacheName: 'static-resources-v1',
      expiration: { maxEntries: 512, maxAgeSeconds: 86400, purgeOnQuotaError: true },
      cacheableResponse: { statuses: [0, 200] },
    },
  },
  {
    urlPattern: ({ url }) => url.origin === self.location.origin,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'web-cache',
      networkTimeoutSeconds: 5,
      expiration: { maxEntries: 50, maxAgeSeconds: 86400, purgeOnQuotaError: true },
      cacheableResponse: { statuses: [200] },
    },
  },
]

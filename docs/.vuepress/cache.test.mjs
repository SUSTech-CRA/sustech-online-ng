import assert from 'node:assert/strict'
import test from 'node:test'
import { pmtilesRangePlugin, runtimeCaching } from './cache.mjs'

test('live APIs bypass caches before static/site rules; reference data uses HTTP caching', () => {
  globalThis.self = { location: { origin: 'https://sustech.online' } }
  try {
    const ruleFor = (url, destination = '') => runtimeCaching.find(({ urlPattern }) => urlPattern({
      url: new URL(url), request: { destination, headers: new Headers() },
    }))
    for (const path of ['/vehicles/all', '/arrivals/s1', '/notices', '/schedules', '/api/public/vehicles', '/api/routes', '/api/v2/monitor_osm/', '/api/v3/r/d/s']) {
      for (const origin of ['https://sustech.online', 'https://buseta.sustcra.com', 'https://bus.sustcra.com']) {
        const rule = ruleFor(origin + path, 'image')
        assert.equal(rule.handler, 'NetworkOnly')
        assert.equal(rule.options.fetchOptions.cache, 'no-store')
      }
    }
    for (const path of ['/routes', '/stops/id', '/api/public/routes/id']) {
      const rule = ruleFor('https://buseta.sustcra.com' + path)
      assert.equal(rule.handler, 'NetworkOnly')
      assert.equal(rule.options, undefined)
    }
    for (const url of [
      'https://bus.sustcra.com/static/protomaps/pmtiles-style/pmtiles-light.json',
      'https://bus.sustcra.com/static/protomaps/fonts/a.pbf',
      'https://bus.sustcra.com/geojson/sustech_bldg.json',
      'https://mirrors.sustech.edu.cn/osm-tile/tiles/14/1/2.pbf',
      'https://mirrors.sustech.edu.cn/site/pmtiles-data/fonts/Noto%20Sans/0-255.pbf',
      'https://google-proxy.zuzuche.com/vt/?lyrs=s&x=1&y=2&z=14',
    ]) {
      const rule = ruleFor(url)
      assert.equal(rule.handler, 'CacheFirst')
      assert.ok(rule.options.expiration.maxEntries > 0)
      assert.ok(rule.options.expiration.maxAgeSeconds > 0)
    }
    assert.equal(ruleFor('https://sustech.online/transport/bustimer.html').handler, 'NetworkFirst')
  } finally {
    delete globalThis.self
  }
})

test('PMTiles caches distinct ranges as 200 and returns unchanged bytes and ETag as 206', async () => {
  const request = new Request('https://bus.sustcra.com/static/map.pmtiles?v=2', { headers: { Range: 'bytes=10-13' } })
  assert.equal(runtimeCaching.find(({ urlPattern }) => urlPattern({ url: new URL(request.url), request })).options.cacheName, 'pmtiles-ranges-v1')
  const key = pmtilesRangePlugin.cacheKeyWillBeUsed({ request })
  const otherKey = pmtilesRangePlugin.cacheKeyWillBeUsed({ request: new Request(request, { headers: { Range: 'bytes=14-17' } }) })
  assert.notEqual(key.url, otherKey.url)
  assert.equal(new URL(key.url).searchParams.get('v'), '2')
  const headers = { ETag: '"archive-v2"', 'Content-Range': 'bytes 10-13/100', 'Content-Length': '4' }
  const stored = pmtilesRangePlugin.cacheWillUpdate({ request, response: new Response(new Uint8Array([0, 1, 254, 255]), { status: 206, headers }) })
  assert.equal(stored.status, 200)
  const replayed = pmtilesRangePlugin.cachedResponseWillBeUsed({ request: key, cachedResponse: stored })
  assert.equal(replayed.status, 206)
  assert.equal(replayed.headers.get('ETag'), headers.ETag)
  assert.equal(replayed.headers.get('Content-Range'), headers['Content-Range'])
  assert.deepEqual([...new Uint8Array(await replayed.arrayBuffer())], [0, 1, 254, 255])
})

test('PMTiles reload bypasses stale ranges and no-store/error responses are not persisted', () => {
  for (const cache of ['reload', 'no-cache', 'no-store']) {
    const request = new Request('https://bus.sustcra.com/map.pmtiles', { cache, headers: { Range: 'bytes=0-3' } })
    const key = pmtilesRangePlugin.cacheKeyWillBeUsed({ request })
    assert.equal(key.cache, cache)
    assert.equal(pmtilesRangePlugin.cachedResponseWillBeUsed({ request: key, cachedResponse: new Response('old') }), null)
    const stored = pmtilesRangePlugin.cacheWillUpdate({ request, response: new Response('new', { status: 206 }) })
    assert.equal(stored?.status ?? null, cache === 'no-store' ? null : 200)
  }
  const request = new Request('https://bus.sustcra.com/map.pmtiles')
  for (const status of [200, 404, 416, 500]) {
    assert.equal(pmtilesRangePlugin.cacheWillUpdate({ request, response: new Response('error', { status }) }), null)
  }
})

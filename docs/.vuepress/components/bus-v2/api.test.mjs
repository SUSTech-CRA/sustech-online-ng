import assert from 'node:assert/strict'
import test from 'node:test'
import { busApi, publicApi } from './api.mjs'

test('reference requests allow HTTP caching; live requests bypass it without timestamp URLs', async (t) => {
  const requests = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url: new URL(url), options })
    return new Response('[]', { status: 200 })
  })
  for (const request of [busApi.routes, busApi.stops, () => publicApi('/routes/id')]) await request()
  for (const request of requests) assert.equal(request.options.cache, 'default')
  const liveStart = requests.length
  for (const request of [busApi.vehicles, busApi.notices, () => busApi.arrivals('stop /1', 'WORKDAY'), () => busApi.schedules('date=2026-11-05')]) await request()
  for (const request of requests.slice(liveStart)) assert.equal(request.options.cache, 'no-store')
  for (const { url, options } of requests) {
    assert.equal(url.searchParams.has('_'), false)
    assert.equal(options.credentials, 'omit')
  }
  assert.equal(requests.at(-2).url.pathname, '/arrivals/stop%20%2F1')
  assert.equal(requests.at(-2).url.searchParams.get('day_type'), 'WORKDAY')
  assert.equal(requests.at(-1).url.searchParams.get('date'), '2026-11-05')
})

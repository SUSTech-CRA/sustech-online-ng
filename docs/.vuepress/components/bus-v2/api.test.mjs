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

test('both vehicle endpoints reject off-campus and unknown parents; routes stay campus-only', async (t) => {
  const vehicles = ['line1', 'line2', 'k1', 'k2', 'ipark', 'sofun', 'k1a', null].map((route_id, id) => ({ id, route_id }))
  t.mock.method(globalThis, 'fetch', async (url) => new Response(JSON.stringify(new URL(url).pathname === '/routes' ? vehicles.map((vehicle) => ({ id: vehicle.route_id })) : vehicles), { status: 200 }))
  for (const request of [() => busApi.vehicles(), () => busApi.vehicles(true), () => publicApi('/vehicles/all')]) {
    assert.deepEqual((await request()).map((vehicle) => vehicle.route_id), ['line1', 'line2', 'k1', 'k2'])
  }
  assert.deepEqual((await busApi.routes()).map((route) => route.id), ['line1', 'line2', 'k1', 'k2'])
})

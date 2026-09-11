import assert from 'node:assert/strict'
import test from 'node:test'
import { BUS_VISITOR_ID_KEY, busPageForPath, getBusVisitorId, reportBusVisit } from './analytics.mjs'

const memoryStorage = (initial = {}) => {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, value),
    values,
  }
}

test('visitor id is generated once, persisted, and reused', () => {
  const storage = memoryStorage()
  const generated = '123e4567-e89b-42d3-a456-426614174000'
  assert.equal(getBusVisitorId({ storage, randomUUID: () => generated }), generated)
  assert.equal(storage.values.get(BUS_VISITOR_ID_KEY), generated)
  assert.equal(getBusVisitorId({ storage, randomUUID: () => assert.fail('must reuse the stored id') }), generated)
})

test('bus routes map only to the allowed page values', () => {
  assert.deepEqual([
    '/transport/bustimer.html',
    '/transport/bustimer_v2_route.html',
    '/transport/bustimer_v2_stop.html',
    '/transport/bustimer_v2_vehicles.html',
    '/transport/bustimer_v2_schedules.html',
    '/transport/bustimer_v2_files.html',
  ].map(busPageForPath), ['home', 'route_detail', 'stop_detail', 'vehicles', 'schedules', 'map_files'])
  assert.equal(busPageForPath('/transport/bustimer_v1.html'), undefined)
})

test('visit request is anonymous and failures are swallowed', async () => {
  const visitorId = '123e4567-e89b-42d3-a456-426614174000'
  let request
  await assert.doesNotReject(reportBusVisit('home', {
    storage: memoryStorage({ [BUS_VISITOR_ID_KEY]: visitorId }),
    apiBase: 'https://bus.example/',
    fetchImpl: (url, options) => { request = { url, options }; return Promise.reject(new Error('offline')) },
  }))
  assert.equal(request.url, 'https://bus.example/api/public/analytics/visit')
  assert.deepEqual(request.options, {
    method: 'POST', mode: 'cors', credentials: 'omit', keepalive: true,
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({ visitor_id: visitorId, page: 'home' }),
  })
})

test('unavailable storage or random ids silently skip reporting', async () => {
  let called = false
  await assert.doesNotReject(reportBusVisit('home', {
    storage: { getItem: () => { throw new Error('blocked') } },
    fetchImpl: () => { called = true; return Promise.resolve() },
  }))
  assert.equal(called, false)

  await assert.doesNotReject(reportBusVisit('home', {
    storage: memoryStorage(),
    randomUUID: () => { throw new Error('unavailable') },
    fetchImpl: () => { called = true; return Promise.resolve() },
  }))
  assert.equal(called, false)
})

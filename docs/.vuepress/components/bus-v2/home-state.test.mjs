import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { computed, nextTick, ref } from 'vue'
import * as core from './core.mjs'
import { busLanguage, busText } from './i18n.mjs'

// Exercise the component's setup logic without a browser or an extra test dependency.
const source = readFileSync(new URL('./BusHomeV2.vue', import.meta.url), 'utf8')
  .split('<script setup>')[1].split('</script>')[0].replace(/^import .*$/gm, '')
const stops = [{ id: 'a', group_id: 'a', latitude: 22, longitude: 114 }, { id: 'b', group_id: 'b', latitude: 23, longitude: 114 }]
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done }); return { promise, resolve } }
function home(vehicles) {
  let mount
  const env = {
    ...core, ref, computed, nextTick, defineProps: () => ({}), defineExpose: () => {},
    onMounted: fn => { mount = fn }, onBeforeUnmount: () => {}, setInterval: () => 0,
    loadNoticeOpenStates: () => ({}), loadFavorites: () => {},
    favoriteRouteIds: ref([]), favoriteStopIds: ref([]), busLanguage, busText,
    localStorage: { getItem: () => JSON.stringify({ latitude: 22, longitude: 114, updatedAt: Date.now() }) },
    busApi: { routes: async () => [], stops: async () => stops, notices: async () => [], arrivals: async () => ({ arrivals: [] }), vehicles },
  }
  const state = Function(...Object.keys(env), `${source}\nreturn { load, loadVehicles, refresh, loading, vehicles, vehiclesLoading, vehiclesError, selectDiagramStop, selectedNearbyStop, nearbyStops, locate, arrivals, allNearbyStops, visibleNearbyArrivals, canExpandNearbyStops, locationErrorKey, locationState, arrivalText, locationUpdatedText };`)(...Object.values(env))
  return { ...state, mount }
}

test('a successful refresh restores vehicles after the initial request fails', async () => {
  let calls = 0
  const page = home(async () => { if (!calls++) throw Error('temporary'); return [{ id: 'bus' }] })
  await page.load()
  assert.equal(page.vehiclesError.value, true)
  await page.refresh()
  assert.equal(page.vehiclesError.value, false)
  assert.deepEqual(page.vehicles.value, [{ id: 'bus' }])
})

test('late initial loading does not replace a selected station with cached location', async () => {
  const pending = deferred()
  const page = home(() => pending.promise)
  const mounting = page.mount()
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(page.loading.value, false)
  await page.selectDiagramStop('b')
  pending.resolve([])
  await mounting
  assert.equal(page.selectedNearbyStop.value.id, 'b')
  assert.deepEqual(page.nearbyStops.value.map(stop => stop.id), ['b'])
})

test('cached location is still restored when the user has not interacted', async () => {
  const page = home(async () => [])
  await page.mount()
  assert.equal(page.selectedNearbyStop.value, null)
  assert.deepEqual(page.nearbyStops.value.map(stop => stop.id), ['a', 'b'])
})

test('a refresh that supersedes initial loading finishes the loading state', async () => {
  const pending = deferred()
  let calls = 0
  const page = home(() => calls++ ? Promise.resolve([{ id: 'new' }]) : pending.promise)
  const initial = page.loadVehicles()
  await page.loadVehicles(true)
  assert.equal(page.vehiclesLoading.value, false)
  pending.resolve([{ id: 'old' }])
  await initial
  assert.deepEqual(page.vehicles.value, [{ id: 'new' }])
})

test('nearby arrivals can be expanded even with only one stop or a diagram selection', async () => {
  const page = home(async () => [])
  await page.mount()
  page.nearbyStops.value = [stops[0]]
  const items = [
    { source: 'real_time', eta_minutes: 5 },
    { source: 'real_time', eta_minutes: 31 },
    { source: 'unavailable', unavailable_reason: 'LAST_SERVICE_PASSED' },
    { source: 'unavailable', unavailable_reason: 'NOT_OPERATING' },
  ]
  page.arrivals.value = { a: { items } }
  for (const selected of [null, stops[0]]) {
    page.selectedNearbyStop.value = selected
    page.allNearbyStops.value = false
    assert.deepEqual(page.visibleNearbyArrivals.value.a, [items[0]])
    assert.equal(page.canExpandNearbyStops.value, true)
    page.allNearbyStops.value = true
    assert.deepEqual(page.visibleNearbyArrivals.value.a, items)
    assert.equal(page.canExpandNearbyStops.value, true)
    page.allNearbyStops.value = false
    assert.deepEqual(page.visibleNearbyArrivals.value.a, [items[0]])
  }
  page.arrivals.value = { a: { items: [items[1]] } }
  assert.deepEqual(page.visibleNearbyArrivals.value.a, [])
  assert.equal(page.canExpandNearbyStops.value, true)
  page.arrivals.value = { a: { items: [items[0]] } }
  assert.equal(page.canExpandNearbyStops.value, false)
})


test('location failures and planned arrivals use the selected language', (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const previousLanguage = busLanguage.value
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor)
    else delete globalThis.window
    busLanguage.value = previousLanguage
  })
  for (const language of ['zh', 'en']) {
    busLanguage.value = language
    for (const [code, key] of [[1, 'locationDenied'], [2, 'locationFailed'], [3, 'locationTimeout']]) {
      globalThis.window = { navigator: { geolocation: { getCurrentPosition: (_, failed) => failed({ code }) } } }
      const page = home(async () => [])
      page.locate()
      assert.equal(page.locationErrorKey.value, key)
      assert.notEqual(busText(page.locationErrorKey.value), key)
    }
    const page = home(async () => [])
    assert.equal(page.arrivalText({ source: 'planned', planned_arrival_at: '2026-11-10T00:00:00Z' }), language === 'zh' ? '计划 08:00' : 'Scheduled 08:00')
    page.selectedNearbyStop.value = { group_name_zh: '欣园', group_name_en: 'Joy Highland' }
    assert.equal(page.locationUpdatedText.value, language === 'zh' ? '欣园 · 全部站台' : 'Joy Highland · All platforms')
  }
})

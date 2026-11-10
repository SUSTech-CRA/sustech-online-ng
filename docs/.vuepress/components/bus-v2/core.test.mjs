import assert from 'node:assert/strict'
import test from 'node:test'
import { isNearbyArrivalVisible } from './core.mjs'
import { nearbyStopCandidates, closestArrivalsByRoute, displayName, displayStopName, haversineMeters, isTerminalArrival, lineBearingAt, matchesSearch, realtimeArrivalText, sortArrivalsByEstimatedTime, unavailableReasonTextKey, vehicleBearingAt, vehicleLocationText } from './core.mjs'
import { renderNoticeMarkdown } from './markdown.mjs'
import { isCampusRoute, orderedStopProgress, serviceTypeLabel, vehicleRouteLabel, vehicleTextColor } from './core.mjs'

test('realtime vehicles use campus parents and compact route text with icon colors', () => {
  for (const id of ['line1', 'line2', 'k1', 'k2']) assert.equal(isCampusRoute(id), true)
  for (const id of ['ipark', 'sofun', 'k1a', 'K1A', '', undefined]) assert.equal(isCampusRoute(id), false)
  assert.deepEqual(['line1', 'line2', 'k1', 'K1A', 'k2', 'K2A', 'unknown'].map(vehicleRouteLabel), ['1', '2', 'K1', 'K1', 'K2', 'K2', ''])
  assert.equal(vehicleTextColor('BUS'), '#754600')
  assert.equal(vehicleTextColor('shuttle'), '#193e29')
  assert.equal(serviceTypeLabel('SHORT_TURN'), '区间车')
  assert.equal(serviceTypeLabel('EXPRESS', 'en'), 'Express')
})

test('search covers Chinese and English names', () => {
  assert.ok(matchesSearch({ name_zh: '图书馆', name_en: 'Library' }, 'library'))
  assert.ok(matchesSearch({ name_zh: '图书馆', name_en: 'Library' }, '图书'))
  assert.equal(displayName({ display_name_zh: '校园巴士 1' }), '校园巴士 1')
})

test('nearby stop names include the group once and terminal arrivals are excluded', () => {
  assert.equal(displayStopName({ name_zh: '南门', group_name_zh: '南科大' }), '南科大 南门')
  assert.equal(displayStopName({ name_zh: '南门', group_name_zh: '南门' }), '南门')
  const routes = [{ id: 'r1', directions: [{ id: 'outbound', stops: [{ id: 'a' }, { id: 'terminal' }] }] }]
  assert.ok(isTerminalArrival({ route_id: 'r1', route_direction_id: 'outbound' }, 'terminal', routes))
  assert.equal(isTerminalArrival({ route_id: 'r1', route_direction_id: 'outbound' }, 'a', routes), false)
})

test('nearby arrivals sort by their expected arrival time', () => {
  const now = Date.parse('2026-09-04T15:30:00+08:00')
  const items = [
    { id: 'eight', source: 'real_time', eta_minutes: 8 },
    { id: 'planned', source: 'planned', planned_arrival_at: '2026-09-04T15:35:00+08:00' },
    { id: 'unavailable' },
    { id: 'three', source: 'real_time', eta_minutes: 3 },
  ]
  assert.deepEqual(sortArrivalsByEstimatedTime(items, now).map(({ id }) => id), ['three', 'planned', 'eight', 'unavailable'])
})

test('keeps only the nearest arrival for each route', () => {
  const now = Date.parse('2025-01-01T08:00:00Z')
  const items = [{ id: 'later', route_id: 'r1', source: 'real_time', eta_minutes: 8 }, { id: 'next', route_id: 'r1', source: 'real_time', eta_minutes: 2 }, { id: 'r2', route_id: 'r2', source: 'planned', planned_arrival_at: '2025-01-01T08:05:00Z' }]
  assert.deepEqual(closestArrivalsByRoute(items, now).map(({ id }) => id), ['next', 'r2'])
})

test('unavailable arrival reasons use specific text keys with a safe fallback', () => {
  assert.equal(unavailableReasonTextKey('LAST_SERVICE_PASSED'), 'lastServicePassed')
  assert.equal(unavailableReasonTextKey('NOT_OPERATING'), 'notOperating')
  assert.equal(unavailableReasonTextKey('UNKNOWN'), 'unavailable')
  assert.equal(unavailableReasonTextKey(), 'unavailable')
})

test('real-time arrivals at zero minutes show that the vehicle is arriving', () => {
  assert.equal(realtimeArrivalText({ eta_minutes: 0 }), '车辆进站')
  assert.equal(realtimeArrivalText({ eta_minutes: '0' }, 'en'), 'Arriving')
  assert.equal(realtimeArrivalText({ eta_minutes: 3 }), '3 分钟')
})

test('distance and Markdown helpers are safe', () => {
  assert.ok(haversineMeters(22.5963, 113.9921, 22.5963, 113.9921) < 1)
  const html = renderNoticeMarkdown('**safe** <script>alert(1)</script>')
  assert.match(html, /<strong>safe<\/strong>/)
  assert.doesNotMatch(html, /<script>/)
})

test('line bearing follows the nearest route segment', () => {
  assert.ok(Math.abs(lineBearingAt([[0, 0], [0, 1]], 0, .5)) < .001)
  assert.ok(Math.abs(lineBearingAt([[0, 0], [1, 0]], .5, 0) - 90) < .001)
})

test('vehicle bearing stays inside the backend-reported stop interval', () => {
  const coordinates = [[0, 0], [2, 0], [2, .001], [0, .001]]
  const stops = [{ id: 'a', sequence: 1, longitude: 0, latitude: 0 }, { id: 'b', sequence: 2, longitude: 2, latitude: .001 }, { id: 'c', sequence: 3, longitude: 0, latitude: .001 }]
  const between = { longitude: 1, latitude: .001, current_position: { type: 'between_stops', next_stop_id: 'b', next_stop_num: 2 } }
  const atStop = { longitude: 2, latitude: .001, current_position: { type: 'at_stop', next_stop_id: 'b', next_stop_num: 2 } }
  assert.ok(Math.abs(lineBearingAt(coordinates, 1, .001) + 90) < .001)
  assert.ok(Math.abs(vehicleBearingAt(coordinates, stops, between) - 90) < .001)
  assert.ok(Math.abs(vehicleBearingAt(coordinates, stops, atStop) + 90) < .001)
})

test('vehicle bearing distinguishes repeated stops on a fully overlapping return path', () => {
  const coordinates = [[0, 0], [1, 0], [2, 0], [3, 0], [2, 0], [1, 0], [0, 0]]
  const stops = coordinates.map(([longitude, latitude], index) => ({ id: ['a', 'b', 'c', 'd', 'c', 'b', 'a'][index], sequence: index + 1, longitude, latitude }))
  const vehicle = { longitude: .5, latitude: 0, current_position: { type: 'between_stops', next_stop_id: 'a', next_stop_num: 7 } }
  assert.ok(Math.abs(vehicleBearingAt(coordinates, stops, vehicle) + 90) < .001)
})

test('ordered stop matching cannot put a slightly closer outbound platform on the return leg', () => {
  const coordinates = [[0, 0], [.01, 0], [.02, 0], [.02, .0001], [.01, .0001], [0, .0001]]
  const stops = [[0, 0], [.005, .00006], [.015, 0], [.02, .0001], [.005, .0001], [0, .0001]].map(([longitude, latitude], index) => ({ id: String(index), sequence: index + 1, longitude, latitude }))
  const progress = orderedStopProgress(coordinates, stops)
  assert.ok(progress[1] < 600)
  assert.ok(progress[4] > 3800)
  const vehicle = { longitude: .004, latitude: .0001, current_position: { type: 'between_stops', next_stop_id: '1', next_stop_num: 2 } }
  assert.ok(Math.abs(vehicleBearingAt(coordinates, stops, vehicle) - 90) < .001)
  assert.deepEqual(orderedStopProgress([[0, 0], [0, 0]], stops), stops.map(() => 0))
})

test('vehicle locations show route intervals and stops', () => {
  const route = { directions: [{ id: 'outbound', stops: [{ id: 'a', sequence: 1, name_zh: '1' }, { id: 'b', sequence: 2, name_zh: '1' }] }] }
  const stops = [{ id: 'a', group_name_zh: '欣园' }, { id: 'b', group_name_zh: '慧园' }]
  assert.equal(vehicleLocationText({ route_direction_id: 'outbound', current_position: { type: 'between_stops', next_stop_id: 'b', distance_to_next_stop: 238 } }, route, stops), '欣园 1 - 慧园 1 238m')
  assert.equal(vehicleLocationText({ route_direction_id: 'outbound', current_position: { type: 'at_stop', next_stop_id: 'a' } }, route, stops), '欣园 1 进站')
})

test('station selection returns all group platforms, including saved and unlocated platforms', () => {
  const platforms = Array.from({ length: 7 }, (_, index) => ({ id: `dorm-${index + 1}`, group_id: 'dorm' }))
  const stops = [...platforms, { id: 'other', group_id: 'other', latitude: 22, longitude: 114 }]
  assert.deepEqual(nearbyStopCandidates(stops, null, ['dorm-1'], platforms[1]), platforms)
  const ungrouped = [{ id: 'a' }, { id: 'b', group_id: null }]
  assert.deepEqual(nearbyStopCandidates(ungrouped, null, [], ungrouped[0]), [ungrouped[0]])
})

test('location mode keeps distance ordering and excludes favorites and invalid coordinates', () => {
  const center = { latitude: 22, longitude: 114 }
  const stops = [
    { id: 'far', latitude: 22.01, longitude: 114 },
    { id: 'saved', ...center },
    { id: 'near', latitude: 22.002, longitude: 114 },
    { id: 'invalid', latitude: null, longitude: 114 },
  ]
  const result = nearbyStopCandidates(stops, center, ['saved'])
  assert.deepEqual(result.map(stop => stop.id), ['near', 'far'])
  assert.ok(result[0].distance < result[1].distance)
})

test('collapsed nearby arrivals hide inactive services and arrivals beyond 30 minutes', () => {
  const now = Date.parse('2026-11-10T08:00:00+08:00')
  for (const reason of ['LAST_SERVICE_PASSED', 'NOT_OPERATING', 'not_operating']) {
    assert.equal(isNearbyArrivalVisible({ unavailable_reason: reason }, now), false)
  }
  for (const minutes of [0, 29, 30, 30.01, 60]) {
    assert.equal(isNearbyArrivalVisible({ source: 'real_time', eta_minutes: minutes }, now), minutes <= 30)
    assert.equal(isNearbyArrivalVisible({ source: 'planned', planned_arrival_at: new Date(now + minutes * 60000).toISOString() }, now), minutes <= 30)
  }
  assert.equal(isNearbyArrivalVisible({ source: 'unavailable', unavailable_reason: 'UNKNOWN' }, now), true)
  assert.equal(isNearbyArrivalVisible({ source: 'planned', planned_arrival_at: 'invalid' }, now), true)
})

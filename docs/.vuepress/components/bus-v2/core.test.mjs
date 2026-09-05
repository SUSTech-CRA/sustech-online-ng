import assert from 'node:assert/strict'
import test from 'node:test'
import { displayName, displayStopName, haversineMeters, isTerminalArrival, matchesSearch, resolveBusApiBase, sortArrivalsByEstimatedTime, unavailableReasonTextKey, vehicleLocationText } from './core.mjs'
import { renderNoticeMarkdown } from './markdown.mjs'

test('API base uses fixed development and production addresses', () => {
  assert.equal(resolveBusApiBase(), 'http://127.0.0.1:8000')
  assert.equal(resolveBusApiBase(true), 'https://buseta.sustcra.com')
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

test('unavailable arrival reasons use specific text keys with a safe fallback', () => {
  assert.equal(unavailableReasonTextKey('LAST_SERVICE_PASSED'), 'lastServicePassed')
  assert.equal(unavailableReasonTextKey('NOT_OPERATING'), 'notOperating')
  assert.equal(unavailableReasonTextKey('UNKNOWN'), 'unavailable')
  assert.equal(unavailableReasonTextKey(), 'unavailable')
})

test('distance and Markdown helpers are safe', () => {
  assert.ok(haversineMeters(22.5963, 113.9921, 22.5963, 113.9921) < 1)
  const html = renderNoticeMarkdown('**safe** <script>alert(1)</script>')
  assert.match(html, /<strong>safe<\/strong>/)
  assert.doesNotMatch(html, /<script>/)
})

test('vehicle locations show route intervals and stops', () => {
  const route = { directions: [{ id: 'outbound', stops: [{ id: 'a', sequence: 1, name_zh: '1' }, { id: 'b', sequence: 2, name_zh: '1' }] }] }
  const stops = [{ id: 'a', group_name_zh: '欣园' }, { id: 'b', group_name_zh: '慧园' }]
  assert.equal(vehicleLocationText({ route_direction_id: 'outbound', current_position: { type: 'between_stops', next_stop_id: 'b', distance_to_next_stop: 238 } }, route, stops), '欣园 1 - 慧园 1 238m')
  assert.equal(vehicleLocationText({ route_direction_id: 'outbound', current_position: { type: 'at_stop', next_stop_id: 'a' } }, route, stops), '欣园 1 进站')
})

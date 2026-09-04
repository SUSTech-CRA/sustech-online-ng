import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { classifyDepartures, groupSchedules, parseGeometry, scheduleRunMinutes } from './bus-v2-helpers.mjs'

assert.deepEqual(parseGeometry('[[113,22],[114,23]]'), [[113, 22], [114, 23]])
assert.deepEqual(parseGeometry('invalid'), [])
assert.deepEqual(classifyDepartures(['08:00', '08:30', '09:00'], 8 * 60 + 20, 45).map(({ status }) => status), ['running', 'next', 'future'])
const route = { id: '1', directions: [{ id: 'cw', stops: [{ id: 'A', cumulative_minutes: 0 }, { id: 'B', cumulative_minutes: 10 }, { id: 'C', cumulative_minutes: 25 }] }] }
assert.equal(scheduleRunMinutes(route, 'cw'), 30)
assert.deepEqual(classifyDepartures(['08:00'], 8 * 60 + 30, scheduleRunMinutes(route, 'cw')).map(({ status }) => status), ['running'])
assert.deepEqual(classifyDepartures(['08:00'], 8 * 60 + 31, scheduleRunMinutes(route, 'cw')).map(({ status }) => status), ['past'])
assert.equal(scheduleRunMinutes(route, 'cw', 'B', 'C'), 18)
const groups = groupSchedules([
  { route_id: '1', route_direction_id: 'cw', service_type: 'NORMAL', vehicle_type: 'SHUTTLE', departure_times: ['08:30'] },
  { route_id: '1', route_direction_id: 'cw', service_type: 'NORMAL', vehicle_type: 'BUS', departure_times: ['08:00', '09:00'] }
], 8 * 60 + 20, [route])
assert.equal(groups.length, 1)
assert.deepEqual(groups[0].times.map(({ time, vehicleType, status }) => [time, vehicleType, status]), [['08:00', 'BUS', 'running'], ['08:30', 'SHUTTLE', 'next'], ['09:00', 'BUS', 'future']])
assert.equal(groupSchedules([{ route_id: '1', route_direction_id: 'cw', actual_start_stop_id: 'A' }, { route_id: '1', route_direction_id: 'cw', actual_start_stop_id: 'B' }, { route_id: '1', route_direction_id: 'cw', actual_end_stop_id: 'B' }], 0).length, 3)
assert.match(readFileSync(new URL('./BusSchedulesV2.vue', import.meta.url), 'utf8'), /groupSchedules\(schedules\.value, nowMinutes\.value, routes\.value\)/)
assert.match(readFileSync(new URL('./BusRouteV2.vue', import.meta.url), 'utf8'), /groupSchedules\(currentSchedules\.value, nowMinutes\.value, route\.value \? \[route\.value\] : \[\]\)/)
console.log('bus-v2 helpers: ok')

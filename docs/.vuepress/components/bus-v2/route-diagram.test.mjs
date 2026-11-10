import test from 'node:test'
import assert from 'node:assert/strict'
import { diagramStops, diagramStop, diagramVehicle } from './route-diagram.mjs'

// Stop orders from the campus timetable effective 2026-11-09.
const routes = [
  { id: 'line1', directions: [{ id: 'line1_cw', stops: ["joy_highland_1", "hui_yuan_1", "chuang_yuan_1", "lychee_hills_w_1", "stu_dorm_1", "health_service_1", "faculty_cafeteria_1", "guest_houses_1", "gate_3_1", "gate_2_1", "gate_1_1", "admin_bldg_1", "gate_7_1", "research_bldg_1", "coe_1", "research_bldg_3_1", "stu_dorm_n_1", "lychee_hills_s_1", "hui_yuan_2", "joy_highland_2"] }] },
  { id: 'line2', directions: [{ id: 'line2_ccw', stops: ["joy_highland_1", "hui_yuan_1", "chuang_yuan_1", "lychee_hills_w_1", "stu_dorm_n_2", "research_bldg_3_2", "coe_2", "research_bldg_2", "gate_7_2", "admin_bldg_2", "gate_1_2", "gate_2_2", "gate_3_2", "guest_houses_2", "faculty_cafeteria_2", "health_service_2", "stu_dorm_2", "lychee_hills_s_1", "hui_yuan_2", "joy_highland_2"] }] },
  { id: 'k1', directions: [{ id: 'k1_cw', stops: ["joy_highland_1", "hui_yuan_1", "lychee_hills_w_1", "stu_dorm_1", "faculty_cafeteria_1", "gate_2_1", "gate_1_1", "research_bldg_1", "coe_s_1", "stu_dorm_2", "lychee_hills_s_1", "hui_yuan_2", "joy_highland_2"] }, { id: 'k1_short', stops: ["research_bldg_1", "coe_s_1", "stu_dorm_2", "lychee_hills_s_1", "hui_yuan_2", "joy_highland_2"] }] },
  { id: 'k2', directions: [{ id: 'k2_ccw', stops: ["joy_highland_1", "hui_yuan_1", "lychee_hills_w_1", "stu_dorm_1", "coe_s_2", "research_bldg_2", "gate_1_2", "gate_2_2", "faculty_cafeteria_2", "stu_dorm_2", "lychee_hills_s_1", "hui_yuan_2", "joy_highland_2"] }, { id: 'k2_short', stops: ["gate_2_2", "faculty_cafeteria_2", "stu_dorm_2", "lychee_hills_s_1", "hui_yuan_2", "joy_highland_2"] }] }
].map(route => ({ ...route, directions: route.directions.map(direction => ({ ...direction, stops: direction.stops.map((id, sequence) => ({ id: `stop_${id}`, sequence })) })) }))
const vehicle = (routeId, nextId, type = 'between_stops', directionIndex = 0) => {
  const direction = routes.find(route => route.id === routeId).directions[directionIndex]
  return { route_id: routeId, route_direction_id: direction.id, current_position: { type, next_stop_id: nextId, next_stop_num: direction.stops.find(stop => stop.id === nextId).sequence } }
}
test('all source stops and all diagram links map to the supplied schematic', () => {
  const mapped = new Set()
  for (const route of routes) for (const direction of route.directions) for (const stop of direction.stops) {
    const point = diagramStop(stop, route.id)
    assert.ok(point, `${route.id}: ${stop.id}`)
    mapped.add(point)
  }
  assert.equal(mapped.size, diagramStops.length)
  assert.equal(diagramStops.filter(stop => stop.kind === 'tick').length, 2)
})
test('Research Building 3 to Engineering points down left of orange; reverse points up right', () => {
  const down = diagramVehicle(vehicle('line2', 'stop_coe_2'), routes)
  const up = diagramVehicle(vehicle('line1', 'stop_research_bldg_3_1'), routes)
  assert.deepEqual(down, { x: 252, y: 456, angle: 180 })
  assert.deepEqual(up, { x: 268, y: 520, angle: 0 })
})
test('express, short turns, terminals and bottom curve follow travel direction', () => {
  assert.equal(diagramVehicle(vehicle('k2', 'stop_coe_s_2'), routes).x, 287)
  assert.equal(diagramVehicle(vehicle('k1', 'stop_coe_s_1', 'between_stops', 1), routes).x, 303)
  assert.equal(diagramVehicle(vehicle('line2', 'stop_joy_highland_1', 'at_stop'), routes).angle, 180)
  assert.equal(diagramVehicle(vehicle('line2', 'stop_joy_highland_2', 'at_stop'), routes).angle, 0)
  const bottom = diagramVehicle(vehicle('line2', 'stop_gate_1_2'), routes)
  assert.ok(bottom.y > 744)
  assert.ok(bottom.angle > 90 && bottom.angle < 180)
})
test('invalid, off-route and inactive vehicles are not placed', () => {
  const valid = vehicle('line1', 'stop_coe_1')
  for (const extra of [{ operating: false }, { route_deviation: true }, { data_status: 'offline' }, { current_position: null }, { route_direction_id: 'unknown' }]) {
    assert.equal(diagramVehicle({ ...valid, ...extra }, routes), null)
  }
  assert.equal(diagramVehicle(vehicle('line1', 'stop_joy_highland_1'), routes), null)
})

test('at-stop marker centers align vertically with every station, including terminals', () => {
  for (const route of routes) for (const direction of route.directions) for (const stop of direction.stops) {
    const point = diagramVehicle({ route_id: route.id, route_direction_id: direction.id,
      current_position: { type: 'at_stop', next_stop_num: stop.sequence } }, routes)
    assert.ok(Math.abs(point.y - diagramStop(stop, route.id).y) < 1e-9, `${direction.id}: ${stop.id}`)
  }
})
test('between-stop markers stay half a row after departure regardless of GPS or remaining distance', () => {
  const locatedRoutes = routes.map(route => ({ ...route, directions: route.directions.map(direction => ({
    ...direction, stops: direction.stops.map(stop => ({ ...stop, latitude: 22 + stop.sequence / 100, longitude: 114 })),
  })) }))
  for (const route of locatedRoutes) for (const direction of route.directions) {
    for (let index = 1; index < direction.stops.length; index++) {
      const from = direction.stops[index - 1], to = direction.stops[index]
      const base = { route_id: route.id, route_direction_id: direction.id,
        current_position: { type: 'between_stops', next_stop_num: to.sequence } }
      const marker = diagramVehicle(base, locatedRoutes)
      for (const stop of [from, to]) assert.deepEqual(diagramVehicle({ ...base,
        latitude: stop.latitude, longitude: stop.longitude,
        current_position: { ...base.current_position, distance_to_next_stop: 1 },
      }, locatedRoutes), marker)
      const left = diagramStop(from, route.id), right = diagramStop(to, route.id)
      if (left.side === right.side) assert.ok(Math.abs(marker.y - (left.y + Math.sign(right.y - left.y) * 32)) < 1e-9)
    }
  }
})

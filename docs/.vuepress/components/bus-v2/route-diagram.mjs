export const diagramColors = { local: '#F25C19', express: '#50ADE5' }
// Coordinates follow the supplied schematic, not geographic distances.
export const diagramStops = [
  ['joy_highland', '欣园总站', 'Joy Highland Terminus', 40, 'both', 'shared'],
  ['hui_yuan', '慧园', 'Hui Yuan', 104, 'both', 'shared'],
  ['chuang_yuan', '创园', 'Chuang Yuan', 168, 'both', 'tick'],
  ['lychee_hills', '荔园', 'Lychee Hills', 232, 'both', 'shared'],
  ['stu_dorm', '学生宿舍', 'Student Dormitories', 296, 'both', 'shared'],
  ['stu_dorm_n', '学生宿舍北', 'Student Dormitories N', 360, 'left', 'local'],
  ['research_bldg_3', '第三科研楼', 'Research Building 3', 424, 'left', 'local'],
  ['coe_s', '工学院南', 'College of Engineering S', 488, 'left', 'express'],
  ['coe', '工学院', 'College of Engineering', 552, 'left', 'local'],
  ['research_bldg', '科研楼', 'Research Buildings', 616, 'left', 'shared'],
  ['gate_7', '七号门', 'Gate 7', 680, 'left', 'local'],
  ['admin_bldg', '行政楼', 'Administration Building', 744, 'left', 'local'],
  ['health_service', '社康中心', 'Community Health Service', 392, 'right', 'local'],
  ['faculty_cafeteria', '教工餐厅', 'Faculty Cafeteria', 456, 'right', 'shared'],
  ['guest_houses', '专家公寓', 'Guest Houses', 520, 'right', 'local'],
  ['gate_3', '三号门', 'Gate 3', 584, 'right', 'local'],
  ['gate_2', '二号门', 'Gate 2', 648, 'right', 'shared'],
  ['gate_1', '一号门', 'Gate 1', 712, 'right', 'shared'],
].flatMap(([key, zh, en, y, side, kind]) => (side === 'both' ? ['left', 'right'] : [side]).map(side => ({ key, zh, en, y, side, kind: key === 'stu_dorm' && side === 'left' ? 'express' : kind })))

export function diagramStop(stop, routeId) {
  const match = /^stop_(.+)_(\d+)$/.exec(stop?.id || '')
  if (!match) return null
  let [, key, platform] = match
  const outboundSide = ['line1', 'k1'].includes(routeId) ? 'right' : 'left'
  let side
  if (['joy_highland', 'hui_yuan', 'chuang_yuan', 'lychee_hills_w', 'lychee_hills_s'].includes(key)) {
    const outbound = key === 'lychee_hills_w' || (key !== 'lychee_hills_s' && platform === '1')
    side = outbound ? outboundSide : outboundSide === 'left' ? 'right' : 'left'
    if (key.startsWith('lychee_hills_')) key = 'lychee_hills'
  } else if (key === 'stu_dorm') {
    side = routeId === 'k1' ? (platform === '1' ? 'right' : 'left') : routeId === 'k2' ? (platform === '1' ? 'left' : 'right') : 'right'
  }
  return diagramStops.find(item => item.key === key && (!side || item.side === side)) || null
}

export function diagramVehicle(vehicle, routes) {
  if (vehicle.operating === false || vehicle.route_deviation || vehicle.data_status === 'offline') return null
  const route = routes.find(route => route.id === vehicle.route_id)
  const stops = route?.directions?.find(direction => direction.id === vehicle.route_direction_id)?.stops || []
  const position = vehicle.current_position
  if (!position || !['at_stop', 'between_stops'].includes(position.type)) return null
  let index = position.next_stop_num == null ? -1 : stops.findIndex(stop => Number(stop.sequence) === Number(position.next_stop_num))
  if (index < 0) index = stops.findIndex(stop => stop.id === position.next_stop_id)
  if (index < 0 || (position.type === 'between_stops' && index === 0)) return null
  const next = diagramStop(stops[index], route.id)
  const previous = diagramStop(stops[index - 1], route.id)
  const following = diagramStop(stops[index + 1], route.id)
  if (!next || (position.type === 'between_stops' && !previous)) return null
  const radius = ['k1', 'k2'].includes(route.id) ? 25 : 60
  const progress = stop => stop.side === 'left' ? stop.y - 40 : 704 + Math.PI * radius + 744 - stop.y
  let value = progress(next)
  const sign = Math.sign(following ? progress(following) - value : previous ? value - progress(previous) : 0)
  let travel = sign
  if (position.type === 'between_stops') {
    travel = Math.sign(value - progress(previous))
    // Half a 64-unit row after departure avoids implying a stop at a skipped station.
    value = progress(previous) + travel * 32
  }
  if (!travel) return null
  let x, y, dx, dy
  if (value <= 704) { x = 320 - radius; y = 40 + value; dx = 0; dy = 1 }
  else if (value >= 704 + Math.PI * radius) { x = 320 + radius; y = 744 - (value - 704 - Math.PI * radius); dx = 0; dy = -1 }
  else { const angle = (value - 704) / radius; x = 320 - radius * Math.cos(angle); y = 744 + radius * Math.sin(angle); dx = Math.sin(angle); dy = Math.cos(angle) }
  dx *= travel; dy *= travel
  return { x: x - dy * 8, y: y + dx * 8, angle: Math.atan2(dy, dx) * 180 / Math.PI + 90 }
}

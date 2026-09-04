export function parseGeometry(value) {
  try {
    const coordinates = typeof value === 'string' ? JSON.parse(value) : value
    return Array.isArray(coordinates) && coordinates.filter((point) => Array.isArray(point) && Number.isFinite(+point[0]) && Number.isFinite(+point[1])).map(([longitude, latitude]) => [+longitude, +latitude])
  } catch { return [] }
}

export function minutesOf(time) {
  const [hours, minutes] = String(time || '').split(':').map(Number)
  return Number.isInteger(hours) && Number.isInteger(minutes) ? hours * 60 + minutes : NaN
}

export function scheduleRunMinutes(route, directionId, actualStartStopId, actualEndStopId) {
  const stops = route?.directions?.find((direction) => direction.id === directionId)?.stops || []
  const start = stops.find((stop) => stop.id === actualStartStopId) || stops[0]
  const end = stops.find((stop) => stop.id === actualEndStopId) || stops[stops.length - 1]
  const startMinutes = Number(start?.cumulative_minutes), endMinutes = Number(end?.cumulative_minutes)
  return Number.isFinite(startMinutes) && Number.isFinite(endMinutes) ? Math.abs(endMinutes - startMinutes) * 1.2 : 0
}

export function classifyDepartures(times, nowMinutes, runMinutes = 0) {
  let hasNext = false
  return (times || []).map((value) => {
    const item = typeof value === 'string' ? { time: value } : value
    const departure = minutesOf(item?.time)
    let status = 'past'
    if (departure >= nowMinutes) {
      status = hasNext ? 'future' : 'next'
      hasNext = true
    } else if (departure + runMinutes >= nowMinutes) status = 'running'
    return { ...item, minutes: departure, status }
  })
}

export function groupSchedules(schedules, nowMinutes, routes = []) {
  const groups = new Map()
  for (const item of schedules || []) {
    const serviceType = item.service_type || 'NORMAL'
    const key = [item.route_id, item.route_direction_id, serviceType, item.actual_start_stop_id || '', item.actual_end_stop_id || ''].join('|')
    const group = groups.get(key) || { ...item, key, serviceType, vehicleTypes: [], departures: [] }
    if (!groups.has(key)) groups.set(key, group)
    const vehicleType = item.vehicle_type || 'BUS'
    if (!group.vehicleTypes.includes(vehicleType)) group.vehicleTypes.push(vehicleType)
    group.departures.push(...(item.departure_times || []).map((time) => ({ time, vehicleType })))
  }
  return [...groups.values()].map((group) => {
    const route = routes.find((item) => item.id === group.route_id)
    const runMinutes = scheduleRunMinutes(route, group.route_direction_id, group.actual_start_stop_id, group.actual_end_stop_id)
    return { ...group, times: classifyDepartures(group.departures.sort((a, b) => a.time.localeCompare(b.time)), nowMinutes, runMinutes) }
  })
}

const DEV_API_BASE = 'http://127.0.0.1:8000'
const PROD_API_BASE = 'https://buseta.sustcra.com'

export const resolveBusApiBase = (production = false) => production ? PROD_API_BASE : DEV_API_BASE

export function displayName(item, language = 'zh') {
  const suffix = language === 'en' ? 'en' : 'zh'
  return item?.[`name_${suffix}`] || item?.[`display_name_${suffix}`] || item?.name_zh || item?.name_en || item?.display_name_zh || item?.display_name_en || ''
}

export function displayStopName(stop, language = 'zh') {
  const suffix = language === 'en' ? 'en' : 'zh'
  const name = displayName(stop, language)
  const group = stop?.[`group_name_${suffix}`] || stop?.group_name_zh || stop?.group_name_en || ''
  return group && group !== name ? `${group} ${name}` : name || group
}

export function formatLocalDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
}

export function isTerminalArrival(arrival, stopId, routes) {
  const route = routes?.find((item) => item.id === arrival?.route_id)
  const direction = route?.directions?.find((item) => item.id === arrival?.route_direction_id)
  return direction?.stops?.at(-1)?.id === stopId
}

export function arrivalEstimatedAt(arrival, nowMs = Date.now()) {
  const source = String(arrival?.source || '').toLowerCase().replace('-', '_')
  if (source === 'real_time') {
    const minutes = Number(arrival.eta_minutes)
    return Number.isFinite(minutes) ? nowMs + minutes * 60000 : NaN
  }
  return source === 'planned' ? Date.parse(arrival.planned_arrival_at) : NaN
}

export function sortArrivalsByEstimatedTime(items, nowMs = Date.now()) {
  return [...items].sort((left, right) => {
    const leftTime = arrivalEstimatedAt(left, nowMs)
    const rightTime = arrivalEstimatedAt(right, nowMs)
    return (Number.isFinite(leftTime) ? leftTime : Infinity) - (Number.isFinite(rightTime) ? rightTime : Infinity)
  })
}

export function closestArrivalsByRoute(items, nowMs = Date.now()) {
  const closest = new Map()
  for (const arrival of sortArrivalsByEstimatedTime(items, nowMs)) {
    const key = arrival.route_id || arrival.route_direction_id || Symbol()
    if (!closest.has(key)) closest.set(key, arrival)
  }
  return [...closest.values()]
}

export function unavailableReasonTextKey(reason) {
  return ({ LAST_SERVICE_PASSED: 'lastServicePassed', NOT_OPERATING: 'notOperating' })[String(reason || '').toUpperCase()] || 'unavailable'
}

export function realtimeArrivalText(arrival, language = 'zh') {
  const minutes = Number(arrival?.eta_minutes)
  if (arrival?.eta_minutes != null && minutes === 0) return language === 'zh' ? '车辆进站' : 'Arriving'
  return language === 'zh' ? `${arrival?.eta_minutes} 分钟` : `${arrival?.eta_minutes} min`
}

export function matchesSearch(item, query, language = 'zh') {
  const needle = query.trim().toLocaleLowerCase()
  return !needle || [displayName(item, language), item?.name_zh, item?.name_en, item?.group_name_zh, item?.group_name_en]
    .filter(Boolean).some((name) => name.toLocaleLowerCase().includes(needle))
}

export function haversineMeters(latitude1, longitude1, latitude2, longitude2) {
  const radians = (degrees) => degrees * Math.PI / 180
  const latitudeDelta = radians(latitude2 - latitude1)
  const longitudeDelta = radians(longitude2 - longitude1)
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(latitude1)) * Math.cos(radians(latitude2)) * Math.sin(longitudeDelta / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(meters) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`
}

export function lineBearingAt(coordinates, longitude, latitude) {
  if (!Array.isArray(coordinates) || !Number.isFinite(longitude) || !Number.isFinite(latitude) || coordinates.length < 2) return 0
  const scale = Math.cos(latitude * Math.PI / 180)
  let nearest
  for (let index = 1; index < coordinates.length; index++) {
    const start = coordinates[index - 1], end = coordinates[index]
    if (![start, end].every((point) => Number.isFinite(+point?.[0]) && Number.isFinite(+point?.[1]))) continue
    const dx = (+end[0] - +start[0]) * scale, dy = +end[1] - +start[1], length = dx ** 2 + dy ** 2
    if (!length) continue
    const progress = Math.max(0, Math.min(1, (((longitude - +start[0]) * scale) * dx + (latitude - +start[1]) * dy) / length))
    const distance = ((longitude - (+start[0] + (+end[0] - +start[0]) * progress)) * scale) ** 2 + (latitude - (+start[1] + (+end[1] - +start[1]) * progress)) ** 2
    if (!nearest || distance < nearest.distance) nearest = { distance, dx, dy }
  }
  return nearest ? Math.atan2(nearest.dx, nearest.dy) * 180 / Math.PI : 0
}

export function vehicleLocationText(vehicle, route, stops = [], language = 'zh') {
  const direction = route?.directions?.find((item) => item.id === vehicle?.route_direction_id)
  const position = vehicle?.current_position || {}
  const nextIndex = direction?.stops?.findIndex((stop) => stop.id === position.next_stop_id || stop.sequence === Number(position.next_stop_num)) ?? -1
  const nextStop = direction?.stops?.[nextIndex] || direction?.stops?.find((stop) => stop.sequence === vehicle?.route_sequence)
  const stopName = (stop) => displayStopName({ ...stops.find((item) => item.id === stop?.id), ...stop }, language) || stop?.id || ''
  if (!nextStop) return ''
  const nextName = stopName(nextStop)
  if (position.type === 'between_stops') {
    const previousName = stopName(direction.stops[nextIndex - 1])
    const distance = Number(position.distance_to_next_stop)
    return [previousName && `${previousName} - ${nextName}`, Number.isFinite(distance) && `${Math.round(distance)}m`].filter(Boolean).join(' ')
  }
  return language === 'zh' ? `${nextName} 进站` : `At ${nextName}`
}

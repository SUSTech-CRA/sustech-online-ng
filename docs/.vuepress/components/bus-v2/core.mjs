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

export function unavailableReasonTextKey(reason) {
  return ({ LAST_SERVICE_PASSED: 'lastServicePassed', NOT_OPERATING: 'notOperating' })[String(reason || '').toUpperCase()] || 'unavailable'
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

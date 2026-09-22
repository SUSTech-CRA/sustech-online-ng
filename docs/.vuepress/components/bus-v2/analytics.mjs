import { busApiBase } from './api.mjs'

export const BUS_VISITOR_ID_KEY = 'bus_eta_visitor_id'

const PAGE_BY_PATH = {
  '/transport/bustimer.html': 'home',
  '/transport/bustimer-wx.html': 'home',
  '/transport/bustimer_v2_route.html': 'route_detail',
  '/transport/bustimer_v2_stop.html': 'stop_detail',
  '/transport/bustimer_v2_vehicles.html': 'vehicles',
  '/transport/bustimer_v2_schedules.html': 'schedules',
  '/transport/bustimer_v2_files.html': 'map_files',
}
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const busPageForPath = (path) => PAGE_BY_PATH[String(path || '').replace(/\/+$/, '')]

export function getBusVisitorId({ storage, randomUUID } = {}) {
  try {
    storage ??= globalThis.localStorage
    randomUUID ??= () => globalThis.crypto.randomUUID()
    const existing = storage.getItem(BUS_VISITOR_ID_KEY)
    if (UUID_V4.test(existing)) return existing
    const visitorId = randomUUID()
    if (!UUID_V4.test(visitorId)) return undefined
    storage.setItem(BUS_VISITOR_ID_KEY, visitorId)
    return visitorId
  } catch {
    return undefined
  }
}

export function reportBusVisit(page, { storage, randomUUID, fetchImpl, apiBase } = {}) {
  if (!Object.values(PAGE_BY_PATH).includes(page)) return Promise.resolve()
  const visitorId = getBusVisitorId({ storage, randomUUID })
  if (!visitorId) return Promise.resolve()

  try {
    const send = fetchImpl ?? globalThis.fetch
    const url = `${(apiBase ?? busApiBase()).replace(/\/+$/, '')}/api/public/analytics/visit`
    return send(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ visitor_id: visitorId, page }),
    }).catch(() => {})
  } catch {
    return Promise.resolve()
  }
}

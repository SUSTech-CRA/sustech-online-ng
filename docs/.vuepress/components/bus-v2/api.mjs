import { isCampusRoute, resolveBusApiBase } from './core.mjs'

export const busApiBase = () => resolveBusApiBase(import.meta.env?.PROD)

export async function publicApi(path, options = {}) {
  const base = busApiBase()
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  const reference = /^\/(routes|stops)(\/|$)/.test(new URL(url).pathname)
  const response = await fetch(url, {
    ...options,
    cache: reference ? 'default' : 'no-store',
    credentials: 'omit',
    headers: { Accept: 'application/json', ...options.headers },
  })
  if (!response.ok) {
    let message = response.statusText
    try { message = (await response.json()).error || message } catch { /* response is not JSON */ }
    throw new Error(message || `Request failed (${response.status})`)
  }
  const data = await response.json()
  return /^\/vehicles(?:\/all)?$/.test(new URL(url).pathname) && Array.isArray(data) ? data.filter((vehicle) => isCampusRoute(vehicle.route_id)) : data
}

export const busApi = {
  routes: async () => (await publicApi('/routes')).filter((route) => isCampusRoute(route.id)),
  stops: () => publicApi('/stops'),
  notices: () => publicApi('/notices'),
  arrivals: (stopId, dayType) => publicApi(`/arrivals/${encodeURIComponent(stopId)}${dayType ? `?day_type=${encodeURIComponent(dayType)}` : ''}`),
  schedules: (params = '') => publicApi(`/schedules${params ? `?${params}` : ''}`),
  vehicles: (all = false) => publicApi(all ? '/vehicles/all' : '/vehicles'),
}

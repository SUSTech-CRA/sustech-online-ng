import { resolveBusApiBase } from './core.mjs'

export const busApiBase = () => resolveBusApiBase(import.meta.env.PROD)

export async function publicApi(path, options = {}) {
  const base = busApiBase()
  const response = await fetch(`${base}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    credentials: 'omit',
    headers: { Accept: 'application/json', ...options.headers },
  })
  if (!response.ok) {
    let message = response.statusText
    try { message = (await response.json()).error || message } catch { /* response is not JSON */ }
    throw new Error(message || `Request failed (${response.status})`)
  }
  return response.json()
}

export const busApi = {
  routes: () => publicApi('/routes'),
  stops: () => publicApi('/stops'),
  notices: () => publicApi('/notices'),
  arrivals: (stopId, dayType) => publicApi(`/arrivals/${encodeURIComponent(stopId)}${dayType ? `?day_type=${encodeURIComponent(dayType)}` : ''}`),
  schedules: (params = '') => publicApi(`/schedules${params ? `?${params}` : ''}`),
  vehicles: () => publicApi('/vehicles'),
}

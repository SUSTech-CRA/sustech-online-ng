import { ref } from 'vue'

const routeKey = 'sustech-bus-v2-favorite-routes'
const stopKey = 'sustech-bus-v2-favorite-stops'
export const favoriteRouteIds = ref([])
export const favoriteStopIds = ref([])

function read(key) {
  if (typeof window === 'undefined') return []
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === 'string'))] : []
  } catch { return [] }
}

function save(key, values) {
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(key, JSON.stringify(values)) } catch { /* storage may be disabled */ }
  }
}

export function loadFavorites() {
  favoriteRouteIds.value = read(routeKey)
  favoriteStopIds.value = read(stopKey)
}

export function toggleFavorite(kind, id) {
  const values = kind === 'route' ? favoriteRouteIds : favoriteStopIds
  values.value = values.value.includes(id) ? values.value.filter((value) => value !== id) : [...values.value, id]
  save(kind === 'route' ? routeKey : stopKey, values.value)
}

export const isFavorite = (kind, id) => (kind === 'route' ? favoriteRouteIds : favoriteStopIds).value.includes(id)

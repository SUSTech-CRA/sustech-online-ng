<template>
  <section class="bus-map" :class="{ 'is-loading': loading }">
    <div ref="mapElement" class="bus-map__canvas" :aria-label="language === 'zh' ? '车辆地图' : 'Vehicle map'" />
    <p v-if="mapError" class="bus-map__message" role="alert">{{ mapError }}</p>
    <p v-else-if="loading" class="bus-map__message">{{ language === 'zh' ? '正在加载地图…' : 'Loading map…' }}</p>
    <BusVehicleDetailV2 v-if="selectedVehicle" class="bus-map__detail" :vehicle="selectedVehicle" :routes="routes" :stops="stops" :language="language" closable @close="selectedVehicle = null" />
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BusVehicleDetailV2 from './BusVehicleDetailV2.vue'
import { parseGeometry } from './bus-v2-helpers.mjs'
import { displayName, displayStopName } from './core.mjs'

const LIGHT_STYLE = 'https://bus.sustcra.com/static/protomaps/pmtiles-style/pmtiles-light.json'
const DARK_STYLE = 'https://bus.sustcra.com/static/protomaps/pmtiles-style/pmtiles-dark.json'
const CAMPUS_CENTER = [113.99373, 22.60308]
let protocolUsers = 0
let protocol

const props = defineProps({
  routes: { type: Array, default: () => [] },
  vehicles: { type: Array, default: () => [] },
  stops: { type: Array, default: () => [] },
  routeId: { type: String, default: '' },
  language: { type: String, default: 'zh' },
  // An explicit style remains supported for deployments that host their own PMTiles style.
  styleUrl: { type: String, default: '' },
})

const mapElement = ref(null)
const selectedVehicle = ref(null)
const loading = ref(true)
const mapError = ref('')
let map
let maplibregl
let mediaQuery
let themeChangeHandler
let themeObserver
let activePopup
let loaded = false
let protocolInUse = false
let vehicleMarkers = []
let mapEventsBound = false

const activeRoutes = () => props.routes.filter((route) => !props.routeId || route.id === props.routeId)
const activeVehicles = () => props.vehicles.filter((vehicle) => (!props.routeId || vehicle.route_id === props.routeId) && Number.isFinite(+vehicle.longitude) && Number.isFinite(+vehicle.latitude))
const routeFor = (id) => props.routes.find((route) => route.id === id)
const darkTheme = () => document.documentElement.getAttribute('data-theme') === 'dark' || mediaQuery?.matches
const styleUrl = () => props.styleUrl || (darkTheme() ? DARK_STYLE : LIGHT_STYLE)
const sourceData = (features) => ({ type: 'FeatureCollection', features })

function routeFeatures() {
  return activeRoutes().flatMap((route) => (route.directions || []).map((direction) => ({
    type: 'Feature',
    properties: { color: route.color || '#2878c8' },
    geometry: { type: 'LineString', coordinates: parseGeometry(direction.geometry_json) },
  })).filter((feature) => feature.geometry.coordinates.length > 1))
}

function stopFeatures() {
  const stops = new Map()
  activeRoutes().forEach((route) => (route.directions || []).forEach((direction) => (direction.stops || []).forEach((stop) => {
    const longitude = +stop.longitude
    const latitude = +stop.latitude
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return
    const key = `${longitude.toFixed(6)},${latitude.toFixed(6)}`
    const name = displayStopName({ ...props.stops.find((item) => item.id === stop.id), ...stop }, props.language) || stop.id
    const existing = stops.get(key)
    if (existing) {
      if (name && !existing.properties.names.includes(name)) existing.properties.names.push(name)
      return
    }
    stops.set(key, {
      type: 'Feature',
      properties: { names: name ? [name] : [], color: route.color || '#2878c8' },
      geometry: { type: 'Point', coordinates: [longitude, latitude] },
    })
  })))
  return [...stops.values()].map((feature) => ({ ...feature, properties: { ...feature.properties, name: feature.properties.names.join(' / ') } }))
}

function clearVehicleMarkers() {
  vehicleMarkers.forEach((marker) => marker.remove())
  vehicleMarkers = []
}

function refreshVehicleMarkers() {
  clearVehicleMarkers()
  const visibleVehicles = activeVehicles()
  if (selectedVehicle.value) selectedVehicle.value = visibleVehicles.find((vehicle) => vehicle.id === selectedVehicle.value.id) || null
  vehicleMarkers = visibleVehicles.map((vehicle) => {
    const element = document.createElement('button')
    const route = routeFor(vehicle.route_id)
    element.type = 'button'
    element.className = `bus-map__vehicle status-${vehicle.data_status || 'offline'}`
    element.style.backgroundImage = `url(${String(vehicle.vehicle_type).toUpperCase() === 'SHUTTLE' ? '/sev.png' : '/bus.png'})`
    element.title = displayName(vehicle, props.language) || vehicle.id
    element.setAttribute('aria-label', element.title)
    element.style.setProperty('--route-color', route?.color || '#2878c8')
    element.addEventListener('click', () => { selectedVehicle.value = vehicle })
    return new maplibregl.Marker({ element, anchor: 'center' }).setLngLat([+vehicle.longitude, +vehicle.latitude]).addTo(map)
  })
}

function refresh() {
  if (!loaded || !map) return
  map.getSource('bus-v2-routes')?.setData(sourceData(routeFeatures()))
  map.getSource('bus-v2-stops')?.setData(sourceData(stopFeatures()))
  refreshVehicleMarkers()
}

function showStopPopup(event) {
  const feature = event.features?.[0]
  if (!feature) return
  activePopup?.remove()
  const content = document.createElement('strong')
  content.textContent = feature.properties.name || (props.language === 'zh' ? '站点' : 'Stop')
  activePopup = new maplibregl.Popup({ offset: 12 }).setLngLat(feature.geometry.coordinates).setDOMContent(content).addTo(map)
}

function addLayers() {
  if (!map || !map.isStyleLoaded()) return
  if (!map.getSource('bus-v2-routes')) map.addSource('bus-v2-routes', { type: 'geojson', data: sourceData(routeFeatures()) })
  if (!map.getLayer('bus-v2-routes')) map.addLayer({
    id: 'bus-v2-routes', type: 'line', source: 'bus-v2-routes',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': ['get', 'color'], 'line-width': 4, 'line-opacity': 0.8 },
  })
  if (!map.getSource('bus-v2-stops')) map.addSource('bus-v2-stops', { type: 'geojson', data: sourceData(stopFeatures()) })
  if (!map.getLayer('bus-v2-stops')) map.addLayer({
    id: 'bus-v2-stops', type: 'circle', source: 'bus-v2-stops',
    paint: { 'circle-radius': 4, 'circle-color': ['get', 'color'], 'circle-stroke-width': 1.5, 'circle-stroke-color': darkTheme() ? '#202127' : '#fff' },
  })
  if (!map.getLayer('bus-v2-stop-labels')) map.addLayer({
    id: 'bus-v2-stop-labels', type: 'symbol', source: 'bus-v2-stops', minzoom: 16.5,
    layout: { 'text-field': ['get', 'name'], 'text-size': 12, 'text-offset': [0, 1], 'text-anchor': 'top' },
    paint: { 'text-color': darkTheme() ? '#ebebf5' : '#333', 'text-halo-color': darkTheme() ? '#202127' : '#fff', 'text-halo-width': 2 },
  })
  if (!mapEventsBound) {
    map.on('click', 'bus-v2-stops', showStopPopup)
    map.on('mouseenter', 'bus-v2-stops', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'bus-v2-stops', () => { map.getCanvas().style.cursor = '' })
    mapEventsBound = true
  }
}

function createInteractionLockControl() {
  return {
    onAdd(currentMap) {
      const container = document.createElement('div')
      const button = document.createElement('button')
      let enabled = false
      container.className = 'maplibregl-ctrl maplibregl-ctrl-group'
      const update = () => {
        ;['dragPan', 'boxZoom', 'doubleClickZoom', 'touchZoomRotate', 'scrollZoom'].forEach((key) => currentMap[key]?.[enabled ? 'enable' : 'disable']())
        button.className = `maplibregl-ctrl-icon bus-map__interaction-${enabled ? 'allow' : 'lock'}`
        button.setAttribute('aria-label', props.language === 'zh' ? (enabled ? '锁定地图交互' : '解锁地图交互') : (enabled ? 'Lock map interactions' : 'Unlock map interactions'))
        button.title = button.getAttribute('aria-label')
      }
      button.type = 'button'
      button.addEventListener('click', (event) => { enabled = !enabled; update(); event.preventDefault(); event.stopPropagation() })
      container.append(button)
      update()
      this.container = container
      return container
    },
    onRemove() { this.container?.remove(); this.container = null },
  }
}

async function acquireProtocol() {
  const { Protocol } = await import('pmtiles')
  if (!protocolUsers) {
    protocol = new Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)
  }
  protocolUsers += 1
  protocolInUse = true
}

function releaseProtocol() {
  if (!protocolInUse) return
  protocolInUse = false
  protocolUsers -= 1
  if (!protocolUsers) {
    maplibregl?.removeProtocol?.('pmtiles')
    protocol = null
  }
}

function reloadStyle() {
  if (!map || !loaded) return
  activePopup?.remove()
  map.once('style.load', () => requestAnimationFrame(() => { if (map?.isStyleLoaded()) { addLayers(); refresh() } }))
  map.setStyle(styleUrl())
}

async function initialise() {
  if (typeof window === 'undefined' || !mapElement.value) return
  try {
    maplibregl = (await import('maplibre-gl')).default
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    await acquireProtocol()
    map = new maplibregl.Map({ container: mapElement.value, style: styleUrl(), center: CAMPUS_CENTER, zoom: 14.5, minZoom: 13, attributionControl: true })
    map.addControl(new maplibregl.NavigationControl(), 'top-left')
    map.addControl(new maplibregl.FullscreenControl(), 'top-left')
    map.addControl(createInteractionLockControl(), 'top-left')
    map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true, showUserHeading: true }), 'top-right')
    themeChangeHandler = () => { if (!props.styleUrl) reloadStyle() }
    mediaQuery.addEventListener('change', themeChangeHandler)
    themeObserver = new MutationObserver(themeChangeHandler)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    map.on('load', () => { loaded = true; addLayers(); refresh(); loading.value = false })
    map.on('error', (event) => {
      if (!loaded && event.error) {
        mapError.value = `${props.language === 'zh' ? '地图不可用：' : 'Map unavailable: '}${event.error.message}`
        loading.value = false
      }
    })
  } catch (error) {
    mapError.value = `${props.language === 'zh' ? '地图不可用：' : 'Map unavailable: '}${error.message || error}`
    loading.value = false
    releaseProtocol()
  }
}

watch(() => [props.routes, props.stops, props.routeId, props.language], refresh, { deep: true, flush: 'post' })
watch(() => props.vehicles, refreshVehicleMarkers, { deep: true, flush: 'post' })
watch(() => props.styleUrl, reloadStyle)
onMounted(initialise)
onBeforeUnmount(() => {
  clearVehicleMarkers()
  activePopup?.remove()
  mediaQuery?.removeEventListener('change', themeChangeHandler)
  themeObserver?.disconnect()
  if (map) map.remove()
  map = null
  loaded = false
  mapEventsBound = false
  releaseProtocol()
})
defineExpose({ refresh, refreshVehicleMarkers })
</script>

<style>
@import 'maplibre-gl/dist/maplibre-gl.css';
</style>

<style scoped>
.bus-map { position: relative; min-height: 22rem; overflow: hidden; border: 1px solid #d9e2ec; border-radius: .6rem; background: #eef4f8; }
.bus-map__canvas { width: 100%; height: 28rem; }
.bus-map__message { position: absolute; top: .75rem; left: .75rem; z-index: 1; margin: 0; padding: .45rem .65rem; border-radius: .35rem; background: rgba(255, 255, 255, .9); color: #526172; }
.bus-map__detail { position: absolute; z-index: 2; right: .75rem; bottom: 1.75rem; max-width: calc(100% - 1.5rem); }
.bus-map :deep(.bus-map__vehicle) { width: 2rem; height: 2rem; border: 2px solid var(--route-color); border-radius: 50%; padding: 0; background-color: var(--route-color); background-position: center; background-repeat: no-repeat; background-size: contain; cursor: pointer; box-shadow: 0 0 0 2px var(--route-color), 0 1px 4px rgba(0, 0, 0, .35); }
.bus-map :deep(.bus-map__vehicle.status-delayed) { background-color: #f7a600; }
.bus-map :deep(.bus-map__vehicle.status-offline) { background-color: #9aa4b2; }
.bus-map :deep(.bus-map__interaction-lock), .bus-map :deep(.bus-map__interaction-allow) { background-image: none; font-size: 1rem; }
.bus-map :deep(.bus-map__interaction-lock)::before { content: '🔒'; }
.bus-map :deep(.bus-map__interaction-allow)::before { content: '🖐'; }
@media (max-width: 600px) { .bus-map__canvas { height: 22rem; } }
</style>

<template>
  <section class="bus-map" :class="{ 'is-loading': loading }">
    <div ref="mapElement" class="bus-map__canvas" :aria-label="language === 'zh' ? '车辆地图' : 'Vehicle map'" />
    <p v-if="mapError" class="bus-map__message" role="alert">{{ mapError }}</p>
    <p v-else-if="loading" class="bus-map__message">{{ language === 'zh' ? '正在加载地图…' : 'Loading map…' }}</p>
    <BusVehicleLegendV2 class="bus-map__legend" :language="language" />
  </section>
</template>

<script setup>
import { createApp, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BusVehicleDetailV2 from './BusVehicleDetailV2.vue'
import BusVehicleLegendV2 from './BusVehicleLegendV2.vue'
import { parseGeometry } from './bus-v2-helpers.mjs'
import { displayName, displayStopName, lineBearingAt } from './core.mjs'

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
  neutral: Boolean,
  // An explicit style remains supported for deployments that host their own PMTiles style.
  styleUrl: { type: String, default: '' },
})

const mapElement = ref(null)
const selectedVehicle = ref(null)
const loading = ref(true)
const mapError = ref('')
let map
let maplibregl
let themeChangeHandler
let themeObserver
let activePopup
let vehicleDetailMarker
let vehicleDetailApp
let loaded = false
let protocolInUse = false
let vehicleMarkers = new Map()
let mapEventsBound = false

const activeRoutes = () => props.routes.filter((route) => !props.routeId || route.id === props.routeId)
const activeVehicles = () => props.vehicles.filter((vehicle) => (!props.routeId || vehicle.route_id === props.routeId) && Number.isFinite(+vehicle.longitude) && Number.isFinite(+vehicle.latitude))
const routeFor = (id) => props.routes.find((route) => route.id === id)
const darkTheme = () => document.documentElement.getAttribute('data-theme') === 'dark'
const neutralRouteColor = () => darkTheme() ? '#aaa' : '#666'
const neutralStopColor = () => darkTheme() ? '#ccc' : '#444'
const styleUrl = () => props.styleUrl || (darkTheme() ? DARK_STYLE : LIGHT_STYLE)
const sourceData = (features) => ({ type: 'FeatureCollection', features })

function vehicleBearing(vehicle) {
  const direction = routeFor(vehicle.route_id)?.directions?.find((item) => item.id === vehicle.route_direction_id)
  return lineBearingAt(parseGeometry(direction?.geometry_json), +vehicle.longitude, +vehicle.latitude)
}

function routeFeatures() {
  return activeRoutes().flatMap((route) => (route.directions || []).map((direction) => ({
    type: 'Feature',
    properties: { color: props.neutral ? neutralRouteColor() : route.color || '#2878c8' },
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
      properties: { names: name ? [name] : [], color: props.neutral ? neutralStopColor() : route.color || '#2878c8' },
      geometry: { type: 'Point', coordinates: [longitude, latitude] },
    })
  })))
  return [...stops.values()].map((feature) => ({ ...feature, properties: { ...feature.properties, name: feature.properties.names.join(' / ') } }))
}

function fitToStops() {
  const coordinates = stopFeatures().map((feature) => feature.geometry.coordinates)
  if (!coordinates.length) return
  const bounds = coordinates.reduce((current, coordinate) => current.extend(coordinate), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]))
  map.fitBounds(bounds, { padding: 48, maxZoom: 14.5, duration: 0 })
}

function clearVehicleMarkers() {
  vehicleMarkers.forEach((record) => { cancelAnimationFrame(record.frame); record.marker.remove() })
  vehicleMarkers = new Map()
}

function settleVehicleMarkers() {
  vehicleMarkers.forEach((record) => { cancelAnimationFrame(record.frame); record.element.style.transition = 'none'; record.element.style.transform = '' })
}

function closeVehiclePopup() {
  vehicleDetailApp?.unmount()
  vehicleDetailApp = null
  vehicleDetailMarker?.remove()
  vehicleDetailMarker = null
  selectedVehicle.value = null
}

function showVehiclePopup(vehicle) {
  activePopup?.remove()
  closeVehiclePopup()
  selectedVehicle.value = vehicle
  const content = document.createElement('div')
  content.addEventListener('click', (event) => event.stopPropagation())
  vehicleDetailApp = createApp(BusVehicleDetailV2, { vehicle, routes: props.routes, stops: props.stops, language: props.language, closable: true, onClose: closeVehiclePopup })
  vehicleDetailApp.mount(content)
  vehicleDetailMarker = new maplibregl.Marker({ element: content, anchor: 'bottom', offset: [0, -18] }).setLngLat([+vehicle.longitude, +vehicle.latitude]).addTo(map)
}

function updateVehicleMarker(record, vehicle) {
  record.vehicle = vehicle
  const route = routeFor(vehicle.route_id)
  record.element.className = `bus-map__vehicle status-${vehicle.data_status || 'offline'}`
  record.element.title = displayName(vehicle, props.language) || vehicle.id
  record.element.setAttribute('aria-label', record.element.title)
  record.element.style.setProperty('--route-color', route?.color || '#2878c8')
  record.element.style.setProperty('--bearing', `${vehicleBearing(vehicle)}deg`)
}

function moveVehicleMarker(record, longitude, latitude) {
  cancelAnimationFrame(record.frame)
  const start = record.marker.getLngLat()
  const target = [+longitude, +latitude]
  if (start.lng === target[0] && start.lat === target[1]) return
  const startPoint = map.project(start), targetPoint = map.project(target)
  record.marker.setLngLat(target)
  record.element.style.transition = 'none'
  record.element.style.transform = `translate(${startPoint.x - targetPoint.x}px, ${startPoint.y - targetPoint.y}px)`
  record.frame = requestAnimationFrame(() => { record.element.style.transition = 'transform 1s linear'; record.element.style.transform = '' })
}

function createVehicleMarker(vehicle) {
  const record = { vehicle, marker: null, frame: 0, element: null }
  const markerElement = document.createElement('div')
  const element = document.createElement('button')
  const arrow = document.createElement('span')
  const image = document.createElement('img')
  arrow.className = 'bus-map__vehicle-arrow'
  markerElement.className = 'bus-map__vehicle-marker'
  image.src = String(vehicle.vehicle_type).toUpperCase() === 'SHUTTLE' ? '/sev.png' : '/bus.png'
  image.alt = ''
  element.type = 'button'
  element.append(arrow, image)
  markerElement.append(element)
  element.addEventListener('click', (event) => { event.stopPropagation(); showVehiclePopup(record.vehicle) })
  record.element = element
  updateVehicleMarker(record, vehicle)
  record.marker = new maplibregl.Marker({ element: markerElement, anchor: 'center' }).setLngLat([+vehicle.longitude, +vehicle.latitude]).addTo(map)
  return record
}

function refreshVehicleMarkers() {
  const visibleVehicles = activeVehicles(), visibleIds = new Set(visibleVehicles.map((vehicle) => vehicle.id))
  vehicleMarkers.forEach((record, id) => { if (!visibleIds.has(id)) { cancelAnimationFrame(record.frame); record.marker.remove(); vehicleMarkers.delete(id) } })
  visibleVehicles.forEach((vehicle) => {
    const record = vehicleMarkers.get(vehicle.id)
    if (!record) vehicleMarkers.set(vehicle.id, createVehicleMarker(vehicle))
    else { updateVehicleMarker(record, vehicle); moveVehicleMarker(record, vehicle.longitude, vehicle.latitude) }
  })
  const selected = selectedVehicle.value && visibleVehicles.find((vehicle) => vehicle.id === selectedVehicle.value.id)
  if (!selected && selectedVehicle.value) closeVehiclePopup()
  if (selected) showVehiclePopup(selected)
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
  closeVehiclePopup()
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
    map.on('click', (event) => { if (!map.queryRenderedFeatures(event.point, { layers: ['bus-v2-stops'] }).length) closeVehiclePopup() })
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
  map.once('idle', restoreOverlays)
  map.setStyle(styleUrl(), { diff: false })
}

function restoreOverlays() {
  if (!map?.isStyleLoaded()) return
  addLayers()
  refresh()
}

async function initialise() {
  if (typeof window === 'undefined' || !mapElement.value) return
  try {
    maplibregl = await import('maplibre-gl')
    await acquireProtocol()
    map = new maplibregl.Map({ container: mapElement.value, style: styleUrl(), center: CAMPUS_CENTER, zoom: 14, minZoom: 12, attributionControl: true })
    map.addControl(new maplibregl.NavigationControl(), 'top-left')
    map.addControl(new maplibregl.FullscreenControl(), 'top-left')
    map.addControl(createInteractionLockControl(), 'top-left')
    map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true, showUserHeading: true }), 'top-right')
    map.on('style.load', restoreOverlays)
    themeChangeHandler = () => { if (!props.styleUrl) reloadStyle() }
    themeObserver = new MutationObserver(themeChangeHandler)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    map.on('movestart', settleVehicleMarkers)
    map.on('load', () => { loaded = true; addLayers(); fitToStops(); refresh(); requestAnimationFrame(() => mapElement.value?.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show')); loading.value = false })
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
  closeVehiclePopup()
  activePopup?.remove()
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
.bus-map__legend { position: absolute; z-index: 1; bottom: .75rem; left: .75rem; margin: 0; padding: .4rem .55rem; border-radius: .35rem; background: color-mix(in srgb, var(--bus-v2-bg, #fff) 90%, transparent); }
.bus-map :deep(.bus-map__vehicle-marker) { display: block; width: 1.6rem; min-width: 1.6rem; max-width: 1.6rem; height: 1.6rem; min-height: 1.6rem; max-height: 1.6rem; line-height: 0; }
.bus-map :deep(.bus-map__vehicle) { box-sizing: border-box; display: block; position: relative; width: 1.6rem; min-width: 1.6rem; max-width: 1.6rem; height: 1.6rem; min-height: 1.6rem; max-height: 1.6rem; aspect-ratio: 1; border: 2px solid #fff; border-radius: 50%; padding: 1px; background: var(--route-color); cursor: pointer; }
.bus-map :deep(.bus-map__vehicle img) { position: absolute; inset: 0; width: 80%; height: 80%; margin: auto; object-fit: contain; }
.bus-map :deep(.bus-map__vehicle-arrow) { position: absolute; z-index: 2; inset: 0; pointer-events: none; transform: rotate(var(--bearing)); }
.bus-map :deep(.bus-map__vehicle-arrow)::before { content: ''; position: absolute; top: -.57rem; left: 50%; transform: translateX(-50%); border-right: .44rem solid transparent; border-bottom: .62rem solid #fff; border-left: .44rem solid transparent; }
.bus-map :deep(.bus-map__vehicle-arrow)::after { content: ''; position: absolute; top: -.45rem; left: 50%; transform: translateX(-50%); border-right: .32rem solid transparent; border-bottom: .5rem solid var(--route-color); border-left: .32rem solid transparent; }
.bus-map :deep(.bus-map__interaction-lock), .bus-map :deep(.bus-map__interaction-allow) { background-image: none; font-size: 1rem; }
.bus-map :deep(.bus-map__interaction-lock)::before { content: '🔒'; }
.bus-map :deep(.bus-map__interaction-allow)::before { content: '🖐'; }
@media (max-width: 600px) { .bus-map__canvas { height: 22rem; } }
</style>

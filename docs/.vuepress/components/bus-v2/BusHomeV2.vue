<template>
  <main class="bus-home" :lang="busLanguage === 'zh' ? 'zh-CN' : 'en'">
    <BusRefreshButton :remaining="refreshRemaining" :label="busText('refreshNow')" @refresh="refresh" />
    <header class="bus-home__header">
      <div>
        <h1>{{ busText('campusBus') }}</h1>
        <p>{{ busText('arrivalDisclaimer') }}</p>
      </div>
      <div class="header-actions">
        <button class="icon-button" type="button" :aria-pressed="activePanel === 'search'" :aria-label="busText('search')" :title="busText('search')" @click="togglePanel('search')">🔍<span class="icon-label">{{ busText('searchShort') }}</span></button>
        <button class="icon-button" type="button" :aria-pressed="activePanel === 'notices'" :aria-label="busText('announcements')" :title="busText('announcements')" @click="togglePanel('notices')">📢<i v-if="hasImportantNotice" class="icon-dot" aria-hidden="true" /><span class="icon-label">{{ busText('noticesShort') }}</span></button>
        <button class="icon-button" type="button" :aria-pressed="activePanel === 'favorites'" :aria-label="busText('favorites')" :title="busText('favorites')" @click="togglePanel('favorites')">⭐<i v-if="favoriteCount" class="icon-badge" aria-hidden="true">{{ favoriteCount }}</i><span class="icon-label">{{ busText('favoritesShort') }}</span></button>
        <button class="text-button" type="button" @click="setBusLanguage(busLanguage === 'zh' ? 'en' : 'zh')">{{ busText('language') }}</button>
      </div>
    </header>

    <BusPanelPopupV2 :open="!!activePanel" :title="panelTitle" @close="closePanel">
      <template v-if="activePanel === 'search'">
        <div class="popup-search">
          <label class="sr-only" for="bus-search">{{ busText('search') }}</label>
          <input id="bus-search" ref="searchInput" v-model="query" type="search" :placeholder="busText('search')" @keydown.enter="openFirstResult">
          <button v-if="query" class="search-clear" type="button" :aria-label="busText('clearSearch')" @click="query = ''">×</button>
        </div>
        <div v-if="query" class="search-results">
          <button v-for="result in searchResults" :key="`${result.kind}-${result.item.id}`" type="button" @click="openResult(result)">
            <small>{{ busText(result.kind === 'route' ? 'routeLabel' : 'stopLabel') }}</small>
            {{ result.kind === 'stop' ? displayStopName(result.item, busLanguage) : displayName(result.item, busLanguage) }}
          </button>
          <p v-if="!searchResults.length" class="muted">{{ busText('searchEmpty') }}</p>
        </div>
      </template>
      <div v-else-if="activePanel === 'notices'" class="notices">
        <p v-if="loading && !notices.length" class="muted">{{ busText('loading') }}</p>
        <p v-else-if="error && !notices.length" class="muted">{{ busText('loadFailed') }}</p>
        <template v-else>
          <p v-if="!notices.length" class="muted">{{ busText('empty') }}</p>
          <details v-for="notice in notices" :key="notice.id" :class="{ 'bus-notice--important': isImportantNotice(notice) }" :open="isNoticeOpen(notice)">
            <summary @click.prevent="toggleNotice(notice)">
              <span>{{ noticeTitle(notice) }}</span>
              <small>{{ busText(noticeScope(notice)) }}<template v-if="noticeTime(notice)"> · <time :datetime="notice.starts_at">{{ noticeTime(notice) }}</time></template></small>
            </summary>
            <div class="markdown" v-html="renderNoticeMarkdown(notice.body_markdown)" />
          </details>
        </template>
      </div>
      <template v-else>
        <p v-if="loading" class="muted">{{ busText('loading') }}</p>
        <template v-else>
          <div v-if="favoriteRoutes.length" class="quick-links">
            <button v-for="route in favoriteRoutes" :key="route.id" type="button" @click="openRoute(route.id)">🚌 {{ displayName(route, busLanguage) }}</button>
          </div>
          <BusVehicleLegendV2 v-if="favoriteStopCards.length" :language="busLanguage" />
          <article v-for="stop in favoriteStopCards" :key="stop.id" class="nearby-stop">
            <div class="nearby-stop__head"><button type="button" class="link-title" @click="openStop(stop.id)">{{ displayStopName(stop, busLanguage) }}</button><span v-if="stop.distance != null">{{ formatDistance(stop.distance) }}</span></div>
            <p v-if="favoriteArrivals[stop.id]?.loading && !favoriteArrivals[stop.id]?.items?.length" class="muted">{{ busText('loading') }}</p>
            <p v-else-if="favoriteArrivals[stop.id]?.error && !favoriteArrivals[stop.id]?.items?.length" class="muted">{{ busText('unavailable') }}</p>
            <ul v-else class="arrival-list"><li v-for="(arrival, index) in favoriteArrivals[stop.id]?.items" :key="index"><i :style="{ background: arrival.route_color || '#2878c8' }" /><a class="arrival-link" :href="routeDirectionHref(arrival)">{{ arrivalName(arrival) }}</a><span>{{ arrivalText(arrival) }}</span><BusVehicleIconV2 v-if="showVehicleIcon(arrival)" :type="arrival.vehicle_type" role="img" :aria-label="vehicleLabel(arrival)" /></li><li v-if="!favoriteArrivals[stop.id]?.items?.length" class="muted">{{ busText('empty') }}</li></ul>
          </article>
          <p v-if="!favoriteRoutes.length && !favoriteStops.length" class="muted">{{ busText('noFavorites') }}</p>
        </template>
      </template>
    </BusPanelPopupV2>

    <section v-if="loading" class="panel status"><span class="spinner" aria-hidden="true" /> {{ busText('loading') }}</section>
    <section v-else-if="error" class="panel status error" role="alert">
      <strong>{{ busText('loadFailed') }}</strong><span>{{ error }}</span><button type="button" @click="load">{{ busText('retry') }}</button>
    </section>

    <template v-else>
      <div class="home-overview">
      <div class="overview-tabs" role="tablist">
        <button type="button" role="tab" :aria-selected="mobileTab === 'nearby'" @click="mobileTab = 'nearby'">{{ busText('nearby') }}</button>
        <button type="button" role="tab" :aria-selected="mobileTab === 'diagram'" @click="mobileTab = 'diagram'">{{ busText('diagramShort') }}</button>
        <button type="button" role="tab" :aria-selected="mobileTab === 'vehicles'" @click="mobileTab = 'vehicles'">{{ busText('vehiclesShort') }}</button>
      </div>
      <section ref="nearbyCard" class="panel nearby" :class="{ 'tab-hidden': mobileTab !== 'nearby' }" tabindex="-1">
        <div class="section-title">
          <div class="nearby-title"><h3>{{ busText('nearby') }}</h3><span v-if="locationUpdatedText" class="location-updated">{{ locationUpdatedText }}</span></div>
          <button type="button" :disabled="locationState === 'loading'" @click="locate">{{ busText(locationState === 'loading' ? 'locating' : 'locate') }}</button>
        </div>
        <BusVehicleLegendV2 :language="busLanguage" />
        <p v-if="locationState === 'idle'" class="muted">{{ busText('noLocation') }}</p>
        <p v-else-if="locationState === 'denied' || locationState === 'failed'" class="muted">{{ busText(locationErrorKey || 'locationFailed') }}</p>
        <p v-else-if="locationState === 'ready' && !nearbyStops.length" class="muted">{{ busText('empty') }}</p>
        <article v-for="stop in visibleNearbyStops" :key="stop.id" class="nearby-stop">
          <div class="nearby-stop__head">
            <button type="button" class="link-title" @click="openStop(stop.id)">{{ displayStopName(stop, busLanguage) }}</button>
            <span v-if="!selectedNearbyStop && Number.isFinite(stop.distance)">{{ formatDistance(stop.distance) }}</span>
          </div>
          <p v-if="arrivals[stop.id]?.loading && !arrivals[stop.id]?.items?.length" class="muted">{{ busText('loading') }}</p>
          <p v-else-if="arrivals[stop.id]?.error && !arrivals[stop.id]?.items?.length" class="muted">{{ busText('unavailable') }}</p>
          <ul v-else class="arrival-list">
            <li v-for="(arrival, index) in visibleNearbyArrivals[stop.id]" :key="index">
              <i :style="{ background: arrival.route_color || '#2878c8' }" />
              <a class="arrival-link" :href="routeDirectionHref(arrival)">{{ arrivalName(arrival) }}</a>
              <span>{{ arrivalText(arrival) }}</span>
              <BusVehicleIconV2 v-if="showVehicleIcon(arrival)" :type="arrival.vehicle_type" role="img" :aria-label="vehicleLabel(arrival)" />
            </li>
            <li v-if="!visibleNearbyArrivals[stop.id]?.length" class="muted">{{ busText('empty') }}</li>
          </ul>
        </article>
        <button v-if="canExpandNearbyStops" type="button" class="nearby-toggle" :aria-expanded="allNearbyStops" @click="allNearbyStops = !allNearbyStops">{{ allNearbyStops ? busText('collapse') : busText('showAll') }}</button>
      </section>

      <section class="panel diagram-card" :class="{ 'tab-hidden': mobileTab !== 'diagram' }"><BusRouteDiagramV2 :routes="routes" :stops="stops" :vehicles="vehicles" :loading="vehiclesLoading" :error="vehiclesError" @select-stop="selectDiagramStop" /></section>

      <section class="panel live-vehicles" :class="{ 'tab-hidden': mobileTab !== 'vehicles' }">
        <BusVehiclesV2 :routes="routes" :stops="stops" :vehicles="vehicles" :loading="vehiclesLoading" :error="vehiclesError" :show-all-vehicles="showAllVehicles" @update:show-all-vehicles="setShowAllVehicles" />
      </section>
      </div>

      <section id="schedules" class="panel schedules-card"><BusSchedulesV2 /></section>

      <a class="files-link" :href="filesHref">{{ busText('files') }}</a>
    </template>
  </main>
</template>

<script setup>
import BusVehicleIconV2 from './BusVehicleIconV2.vue'
import BusRouteDiagramV2 from './BusRouteDiagramV2.vue'
import BusPanelPopupV2 from './BusPanelPopupV2.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { busApi } from './api.mjs'
import { formatBusTime, busServiceDate, displayName, displayStopName, formatDistance, formatLocalDateTime, haversineMeters, nearbyStopCandidates, isNearbyArrivalVisible, isTerminalArrival, matchesSearch, realtimeArrivalText, sortArrivalsByEstimatedTime, unavailableReasonTextKey } from './core.mjs'
import { favoriteRouteIds, favoriteStopIds, loadFavorites } from './favorites.mjs'
import { busLanguage, busText, setBusLanguage } from './i18n.mjs'
import { renderNoticeMarkdown } from './markdown.mjs'
import { isImportantNotice, useNoticePopup } from './notice-state.mjs'
import BusVehicleLegendV2 from './BusVehicleLegendV2.vue'
import BusVehiclesV2 from './BusVehiclesV2.vue'
import BusSchedulesV2 from './BusSchedulesV2.vue'
import BusRefreshButton from './BusRefreshButton.vue'

const props = defineProps({
  routeHref: { type: String, default: '/transport/bustimer_v2_route.html?id=' },
  stopHref: { type: String, default: '/transport/bustimer_v2_stop.html?id=' },
  filesHref: { type: String, default: '/transport/bustimer_v2_files.html' },
})

const loading = ref(true)
const error = ref('')
const routes = ref([])
const stops = ref([])
const notices = ref([])
const vehicles = ref([])
const vehiclesLoading = ref(true)
const vehiclesError = ref(false)
const showAllVehicles = ref(false)
const query = ref('')
const activePanel = ref(null)
const showNotices = computed({
  get: () => activePanel.value === 'notices',
  set: (open) => { activePanel.value = open ? 'notices' : null },
})
const { closeNotices, isNoticeOpen, toggleNotice } = useNoticePopup(notices, showNotices, () => !activePanel.value || showNotices.value)
const mobileTab = ref('diagram')
const searchInput = ref(null)
const arrivals = ref({})
const favoriteArrivals = ref({})
const nearbyCard = ref(null)
const selectedNearbyStop = ref(null)
const locationState = ref('idle')
const locationErrorKey = ref('')
const nearbyStops = ref([])
const location = ref(null)
const allNearbyStops = ref(false)
const refreshRemaining = ref(10)
const locationUpdatedAt = ref(0)
let nearbyCandidates = []
let refreshTimer
let locationRequest = 0
let vehicleRequest = 0
let staticLoaded = false
const LOCATION_CACHE_KEY = 'sustech-bus-v2-location'

const searchResults = computed(() => [
  ...routes.value.filter((route) => matchesSearch(route, query.value, busLanguage.value)).map((item) => ({ kind: 'route', item })),
  ...stops.value.filter((stop) => matchesSearch(stop, query.value, busLanguage.value)).map((item) => ({ kind: 'stop', item })),
].slice(0, 8))
const favoriteRoutes = computed(() => routes.value.filter((route) => favoriteRouteIds.value.includes(route.id)))
const favoriteCount = computed(() => favoriteRouteIds.value.length + favoriteStopIds.value.length)
const hasImportantNotice = computed(() => notices.value.some(isImportantNotice))
const panelTitle = computed(() => busText(activePanel.value === 'search' ? 'search' : activePanel.value === 'notices' ? 'announcements' : 'favorites'))
function togglePanel(name) {
  if (activePanel.value === name) return closePanel()
  if (showNotices.value) closeNotices()
  activePanel.value = name
  if (name === 'search') nextTick(() => searchInput.value?.focus())
}
function closePanel() {
  if (showNotices.value) closeNotices()
  else activePanel.value = null
}
const favoriteStops = computed(() => stops.value.filter((stop) => favoriteStopIds.value.includes(stop.id)))
const favoriteStopCards = computed(() => favoriteStops.value.map((stop) => location.value ? { ...stop, distance: haversineMeters(location.value.latitude, location.value.longitude, stop.latitude, stop.longitude) } : stop))
const visibleNearbyStops = computed(() => selectedNearbyStop.value ? nearbyStops.value : nearbyStops.value.slice(0, allNearbyStops.value ? 5 : 2))
const visibleNearbyArrivals = computed(() => Object.fromEntries(Object.entries(arrivals.value).map(([id, state]) => [id, allNearbyStops.value ? state.items : (state.items || []).filter(arrival => isNearbyArrivalVisible(arrival))])))
const canExpandNearbyStops = computed(() => allNearbyStops.value || (!selectedNearbyStop.value && nearbyStops.value.length > 2) || nearbyStops.value.some(stop => (arrivals.value[stop.id]?.items?.length || 0) > (visibleNearbyArrivals.value[stop.id]?.length || 0)))
const locationUpdatedText = computed(() => {
  if (selectedNearbyStop.value) {
    const stop = selectedNearbyStop.value
    const name = stop[`group_name_${busLanguage.value}`] || displayStopName(stop, busLanguage.value)
    return busText('allPlatforms', { name })
  }
  const updated = new Date(locationUpdatedAt.value)
  if (!Number.isFinite(updated.getTime())) return ''
  const now = new Date()
  const time = formatBusTime(updated, busLanguage.value)
  const date = busServiceDate(updated).slice(5)
  const value = busServiceDate(updated) === busServiceDate(now) ? time : date
  return busText('locationUpdated', { time: value })
})

function go(href, id) {
  if (typeof window !== 'undefined') window.location.assign(`${href}${encodeURIComponent(id)}`)
}
const openRoute = (id) => go(props.routeHref, id)
const openStop = (id) => go(props.stopHref, id)
const routeDirectionHref = (arrival) => `${props.routeHref}${encodeURIComponent(arrival.route_id)}&direction=${encodeURIComponent(arrival.route_direction_id)}`
const openResult = (result) => result.kind === 'route' ? openRoute(result.item.id) : openStop(result.item.id)
const openFirstResult = () => { if (searchResults.value[0]) openResult(searchResults.value[0]) }
const noticeScope = (notice) => notice.route_id ? 'route' : notice.stop_id ? 'stop' : 'global'
const noticeTitle = (notice) => notice[busLanguage.value === 'en' ? 'title_en' : 'title_zh'] || notice.title_zh || notice.title_en
const noticeTime = (notice) => formatLocalDateTime(notice.starts_at)
const arrivalName = (arrival) => `${arrival[busLanguage.value === 'en' ? 'route_name_en' : 'route_name_zh'] || arrival.route_name_zh || arrival.route_name_en || ''} · ${arrival[busLanguage.value === 'en' ? 'direction_name_en' : 'direction_name_zh'] || arrival.direction_name_zh || arrival.direction_name_en || ''}`
const vehicleLabel = (arrival) => String(arrival.vehicle_type).toUpperCase() === 'SHUTTLE' ? busText('shuttle') : busText('bus')
const showVehicleIcon = (arrival) => !['LAST_SERVICE_PASSED', 'NOT_OPERATING'].includes(String(arrival.unavailable_reason).toUpperCase())

function arrivalText(arrival) {
  if (arrival.source === 'real_time') {
    const meters = Number(arrival.distance ?? arrival.distance_to_stop ?? arrival.distance_to_next_stop ?? arrival.distance_meters)
    return [realtimeArrivalText(arrival, busLanguage.value), Number.isFinite(meters) && `${Math.round(meters)}m`].filter(Boolean).join(' ')
  }
  if (arrival.source === 'planned') {
    const time = formatBusTime(arrival.planned_arrival_at, busLanguage.value)
    return busText('planAt', { time })
  }
  return busText(unavailableReasonTextKey(arrival.unavailable_reason))
}

async function loadArrivals(stopList, target = arrivals) {
  const results = await Promise.all(stopList.map(async (stop) => {
    target.value = { ...target.value, [stop.id]: { ...target.value[stop.id], loading: true, items: target.value[stop.id]?.items || [] } }
    try {
      const result = await busApi.arrivals(stop.id)
      const rawItems = result.arrivals || []
      const items = sortArrivalsByEstimatedTime(rawItems.filter((arrival) => !isTerminalArrival(arrival, stop.id, routes.value)))
      target.value = { ...target.value, [stop.id]: { loading: false, items } }
      return { stop, hidden: rawItems.length > 0 && !items.length }
    } catch {
      target.value = { ...target.value, [stop.id]: { loading: false, error: true, items: target.value[stop.id]?.items || [] } }
      return { stop, hidden: false }
    }
  }))
  if (target === arrivals && stopList === nearbyCandidates) nearbyStops.value = results.filter(({ hidden }) => selectedNearbyStop.value || !hidden).map(({ stop }) => stop)
  return results
}

async function refresh() {
  const position = typeof window === 'undefined' ? null : [window.scrollX, window.scrollY]
  const request = locationRequest
  refreshRemaining.value = 10
  await load(true)
  if (nearbyCandidates.length) await loadArrivals(nearbyCandidates)
  if (position && request === locationRequest) window.scrollTo(position[0], position[1])
}

function saveLocation(coords, updatedAt) {
  const value = { latitude: +coords.latitude, longitude: +coords.longitude, updatedAt }
  try { localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(value)) } catch { /* storage is unavailable */ }
}

async function selectDiagramStop(id) {
  const stop = stops.value.find(stop => stop.id === id)
  if (!stop) return
  mobileTab.value = 'nearby'
  ++locationRequest
  allNearbyStops.value = false
  locationErrorKey.value = ''
  selectedNearbyStop.value = stop
  nearbyCandidates = nearbyStopCandidates(stops.value, null, [], stop)
  nearbyStops.value = nearbyCandidates
  locationState.value = 'ready'
  const arrivalsLoad = loadArrivals(nearbyCandidates)
  await nextTick()
  nearbyCard.value?.focus({ preventScroll: true })
  nearbyCard.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  await arrivalsLoad
}

async function useLocation(coords, updatedAt) {
  selectedNearbyStop.value = null
  location.value = { latitude: +coords.latitude, longitude: +coords.longitude }
  nearbyCandidates = nearbyStopCandidates(stops.value, coords, favoriteStopIds.value)
  nearbyStops.value = nearbyCandidates
  locationUpdatedAt.value = updatedAt
  locationState.value = 'ready'
  await loadArrivals(nearbyCandidates)
}

function useCachedLocation() {
  if (locationRequest) return
  try {
    const cached = JSON.parse(localStorage.getItem(LOCATION_CACHE_KEY) || 'null')
    if (Number.isFinite(cached?.latitude) && Number.isFinite(cached?.longitude) && Number.isFinite(cached?.updatedAt)) useLocation(cached, cached.updatedAt)
  } catch { /* ignore an invalid cache */ }
}

function locate() {
  const geolocation = typeof window === 'undefined' ? null : window.navigator.geolocation
  if (!geolocation) { locationState.value = 'failed'; locationErrorKey.value = 'locationUnavailable'; return }
  allNearbyStops.value = false
  locationState.value = 'loading'
  locationErrorKey.value = ''
  const request = ++locationRequest
  let remaining = 2, hasLocation = false, highLocated = false, update = Promise.resolve()
  const located = (position, highAccuracy) => {
    remaining--
    if (request !== locationRequest || (!highAccuracy && highLocated)) return
    hasLocation = true
    if (highAccuracy) highLocated = true
    update = update.then(async () => {
      if (request !== locationRequest) return
      const updatedAt = Number(position.timestamp) || Date.now()
      saveLocation(position.coords, updatedAt)
      await useLocation(position.coords, updatedAt)
    })
  }
  const failed = (reason) => {
    remaining--
    if (request !== locationRequest || hasLocation || remaining) return
    locationState.value = reason.code === 1 ? 'denied' : 'failed'
    locationErrorKey.value = reason.code === 1 ? 'locationDenied' : reason.code === 3 ? 'locationTimeout' : 'locationFailed'
  }
  geolocation.getCurrentPosition((position) => located(position, true), failed, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 })
  geolocation.getCurrentPosition((position) => located(position, false), failed, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 })
}

async function load(refreshing = false) {
  const vehicleLoad = loadVehicles(refreshing)
  if (!refreshing) { loading.value = true; error.value = '' }
  try {
    if (!staticLoaded) await loadStatic()
    const noticeData = await busApi.notices()
    notices.value = (Array.isArray(noticeData) ? noticeData : []).sort((left, right) => right.priority - left.priority)
    await loadArrivals(favoriteStops.value, favoriteArrivals)
  } catch (reason) { if (!refreshing) error.value = reason.message || String(reason) } finally { if (!refreshing) loading.value = false }
  await vehicleLoad
}

async function loadStatic() {
  const [routeData, stopData] = await Promise.all([busApi.routes(), busApi.stops()])
  routes.value = Array.isArray(routeData) ? routeData : []
  stops.value = Array.isArray(stopData) ? stopData : []
  staticLoaded = true
}

async function loadVehicles(refreshing = false) {
  const request = ++vehicleRequest
  if (!refreshing) { vehiclesLoading.value = true; vehiclesError.value = false }
  try { const result = await busApi.vehicles(showAllVehicles.value); if (request === vehicleRequest) { vehicles.value = Array.isArray(result) ? result : []; vehiclesError.value = false } } catch { if (request === vehicleRequest && !refreshing) vehiclesError.value = true } finally { if (request === vehicleRequest) vehiclesLoading.value = false }
}

function setShowAllVehicles(value) { showAllVehicles.value = value; loadVehicles() }

onMounted(async () => { loadFavorites(); await load(); useCachedLocation(); refreshTimer = setInterval(() => { if (--refreshRemaining.value < 1) refresh() }, 1000) })
onBeforeUnmount(() => clearInterval(refreshTimer))
defineExpose({ load, locate, refresh, openRoute, openStop, favoriteRouteIds, favoriteStopIds })
</script>

<style scoped lang="scss">
.notices > .muted { margin: 1rem 0 0; }
.notices > details > .markdown { margin-top: 0; }
.notices summary { list-style: none; }
.notices summary::-webkit-details-marker { display: none; }
.notices summary > span::after { content: ' ▸'; color: var(--bus-v2-muted); }
.notices details[open] > summary > span::after { content: ' ▾'; }
.bus-home { max-width: 900px; margin: 0 auto; color: var(--bus-v2-text); }
.bus-home__header, .section-title, .nearby-stop__head { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
.nearby-title { min-width: 0; flex: 1; display: flex; flex-wrap: wrap; align-items: baseline; gap: .5rem; } .location-updated { color: var(--bus-v2-muted); font-size: .875rem; font-weight: 400; overflow-wrap: anywhere; }
.bus-home__header { margin: .5rem 0 .75rem; } .bus-home__header h1, .panel h3 { margin: 0; padding-top: 0; } .bus-home__header h1 { font-size: 1.4rem; line-height: 1.25; } .bus-home .bus-home__header p { margin: .25rem 0 0; } .bus-home__header p, .muted { color: var(--bus-v2-muted); }
.panel h3 { font-size: 1rem; line-height: 1.3; }
.panel { margin: 1rem 0; padding: 1rem; border: 1px solid var(--bus-v2-border); border-radius: .6rem; background: var(--bus-v2-bg); }
.popup-search { position: relative; margin-top: .75rem; }
.popup-search input { box-sizing: border-box; width: 100%; padding: .65rem 2.25rem .65rem .75rem; border: 1px solid var(--bus-v2-border); border-radius: .5rem; font: inherit; background: transparent; color: inherit; }
.search-clear { position: absolute; top: 50%; right: .65rem; border: 0; padding: 0; transform: translateY(-50%); background: transparent; color: var(--bus-v2-muted); font-size: 1.4rem; line-height: 1; }
.search-results { margin-top: .5rem; overflow: hidden; border: 1px solid var(--bus-v2-border); border-radius: .5rem; }
.search-results .muted { margin: 0; padding: .65rem 1rem; }
.search-results button, .quick-links button { display: block; width: 100%; padding: .65rem 1rem; border: 0; text-align: left; background: transparent; color: inherit; cursor: pointer; } .search-results button:hover, .quick-links button:hover { background: var(--bus-v2-control); }
.search-results small, summary small { margin-right: .5rem; color: var(--bus-v2-muted); } .status { display: flex; align-items: center; gap: .5rem; } .error { color: #b42318; } button { font: inherit; cursor: pointer; } button:disabled { cursor: wait; opacity: .6; }
.spinner { width: 1em; height: 1em; border: 2px solid var(--bus-v2-border); border-top-color: var(--bus-v2-link); border-radius: 50%; animation: spin .8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
details + details { border-top: 1px solid var(--bus-v2-border); } summary { display: flex; justify-content: space-between; padding: .65rem 0; cursor: pointer; font-weight: 600; } .markdown { margin: 1rem 0 0; padding-bottom: .25rem; } .markdown :deep(p) { margin: 1rem 0 0; } .markdown :deep(:first-child) { margin-top: 0; } .markdown :deep(:last-child) { margin-bottom: 0; } .markdown :deep(code) { padding: .1em .3em; background: var(--bus-v2-bg-alt); border-radius: .2em; }
.section-title button, .status button, .text-button { padding: .4rem .65rem; border: 1px solid var(--bus-v2-border); border-radius: .35rem; background: transparent; color: inherit; } .text-button { border: 0; color: var(--bus-v2-link); }
.nearby { scroll-margin-top: calc(var(--navbar-height, 3.6rem) + 1rem); }
@media (orientation: portrait) {
  .bus-home .header-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .bus-home .header-actions .text-button { align-self: stretch; }
}
.home-overview > * { min-width: 0; }
.overview-tabs { display: none; }
@media (min-width: 1100px) { .home-overview { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1rem; align-items: start; } .live-vehicles { grid-column: 1 / -1; } }
@media (max-width: 720px) {
  .home-overview { padding: .75rem; border: 1px solid var(--bus-v2-border); border-radius: .6rem; background: var(--bus-v2-bg); }
  .overview-tabs { display: flex; gap: .25rem; padding: .25rem; border-radius: .5rem; background: var(--bus-v2-bg-alt); }
  .overview-tabs button { flex: 1; padding: .5rem .25rem; border: 0; border-radius: .4rem; background: transparent; color: var(--bus-v2-muted); font: inherit; font-size: .85rem; cursor: pointer; }
  .overview-tabs button[aria-selected="true"] { background: var(--bus-v2-bg); color: var(--bus-v2-link); font-weight: 600; box-shadow: 0 1px 3px var(--vp-c-shadow); }
  .home-overview > .panel { margin: .75rem 0 0; padding: 0; border: 0; border-radius: 0; background: transparent; }
  .home-overview > .panel.tab-hidden { display: none; }
}
.nearby .section-title { flex-wrap: wrap; }
.nearby-stop__head > span { white-space: nowrap; }
.nearby .section-title button { flex-shrink: 0; border-color: var(--bus-v2-link-soft); background: var(--bus-v2-link-soft); color: var(--bus-v2-link); font-weight: 600; }
.nearby-stop { padding: .75rem 0; border-top: 1px solid var(--bus-v2-border); } .nearby-stop__head { align-items: baseline; } .link-title { padding: 0; border: 0; background: transparent; color: var(--bus-v2-link); font-weight: 700; text-align: left; }
.nearby-toggle { padding: .4rem .65rem; border: 1px solid var(--bus-v2-border); border-radius: .35rem; background: transparent; color: inherit; font: inherit; }
.arrival-list { margin: .45rem 0 0; padding: 0; list-style: none; } .arrival-list li { display: grid; grid-template-columns: .35rem minmax(0, 1fr) auto 1rem; gap: .4rem; align-items: center; padding: .3rem 0; } .arrival-list i { width: .3rem; height: 1.2rem; border-radius: 2px; } .arrival-link { color: var(--bus-v2-link); text-decoration: none; } .arrival-link:hover, .arrival-link:focus-visible { text-decoration: underline; } .arrival-list .muted { display: block; }
.quick-links { display: flex; flex-wrap: wrap; gap: .5rem; } .quick-links button { width: auto; border: 1px solid var(--bus-v2-border); border-radius: .35rem; }
.files-link { display: inline-block; margin: .25rem 0 1rem; color: var(--bus-v2-link); text-decoration: none; } .files-link:hover, .files-link:focus-visible { text-decoration: underline; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
@media (max-width: 560px) { .panel { margin: .75rem 0; } }
</style>

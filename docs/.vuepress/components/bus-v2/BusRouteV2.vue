<template>
  <main class="bus-detail" :lang="busLanguage === 'zh' ? 'zh-CN' : 'en'">
    <div class="detail-head">
      <div>
        <p class="eyebrow">{{ label('route') }}</p>
        <h1 v-if="route">{{ displayName(route, busLanguage) }}</h1>
        <h1 v-else>{{ label('route') }}</h1>
      </div>
      <div class="head-actions">
        <button type="button" class="plain-button" @click="setBusLanguage(busLanguage === 'zh' ? 'en' : 'zh')">{{ busText('language') }}</button>
        <button v-if="route" type="button" class="plain-button" :aria-pressed="favorite" @click="toggleFavorite('route', route.id)">
          {{ favorite ? label('saved') : label('save') }}
        </button>
      </div>
    </div>

    <section v-if="loading" class="panel status"><span class="spinner" aria-hidden="true" /> {{ busText('loading') }}</section>
    <section v-else-if="error" class="panel status error" role="alert"><strong>{{ busText('loadFailed') }}</strong><span>{{ error }}</span><button type="button" @click="load">{{ busText('retry') }}</button></section>

    <template v-else-if="route">
      <section class="panel route-summary" :style="{ '--route-color': route.color || '#2878c8' }">
        <span class="route-swatch" aria-hidden="true" />
        <div><strong>{{ statusText(route.operation_status) }}</strong><span>{{ route.service_time || label('noServiceTime') }}</span></div>
        <button type="button" class="plain-button" :aria-expanded="showSchedules" @click="toggleSchedules">{{ label('timetable') }}</button>
      </section>

      <section v-if="directions.length > 1" class="direction-tabs" :aria-label="label('direction')">
        <button v-for="item in directions" :key="item.id" type="button" :class="{ active: item.id === directionId }" :aria-pressed="item.id === directionId" @click="selectDirection(item.id)">{{ displayName(item, busLanguage) }}</button>
      </section>

      <section v-if="showSchedules" class="panel schedules">
        <div class="section-head"><h3>{{ label('timetable') }}</h3><button type="button" class="plain-button" @click="showSchedules = false">{{ label('close') }}</button></div>
        <p v-if="scheduleLoading" class="muted">{{ busText('loading') }}</p>
        <p v-else-if="scheduleError" class="muted">{{ busText('unavailable') }}</p>
        <p v-else-if="!scheduleGroups.length" class="muted">{{ busText('empty') }}</p>
        <BusScheduleRowsV2 v-else :groups="scheduleGroups" :language="busLanguage" />
        <a class="all-link" href="/transport/bustimer_v2_schedules.html">{{ label('allSchedules') }}</a>
      </section>

      <section class="panel notices">
        <h3>{{ busText('announcements') }}</h3>
        <p v-if="!routeNotices.length" class="muted">{{ busText('empty') }}</p>
        <details v-for="notice in routeNotices" :key="notice.id"><summary><span>{{ noticeTitle(notice) }}</span><time v-if="noticeTime(notice)" :datetime="notice.starts_at">{{ noticeTime(notice) }}</time></summary><div class="markdown" v-html="renderNoticeMarkdown(notice.body_markdown)" /></details>
      </section>

      <section v-if="selectedStop" class="panel arrivals" aria-live="polite">
        <div class="section-head"><div class="selected-stop-title"><p class="eyebrow">{{ label('selectedStop') }}</p><h3>{{ routeStopName(selectedStop) }}</h3></div><button v-if="selectedArrivals.length > 2" type="button" class="plain-button" :aria-expanded="allArrivals" @click="allArrivals = !allArrivals">{{ allArrivals ? label('collapse') : label('allArrivals') }}</button></div>
        <p v-if="arrivalState.loading" class="muted">{{ busText('loading') }}</p>
        <p v-else-if="arrivalState.error" class="muted">{{ busText('unavailable') }}</p>
        <p v-else-if="!selectedArrivals.length" class="muted">{{ busText('empty') }}</p>
        <ul v-else class="arrival-list"><li v-for="arrival in visibleArrivals" :key="arrivalKey(arrival)"><span>{{ arrivalText(arrival) }}</span><small v-if="arrivalMeta(arrival) || (arrival.service_type && arrivalSource(arrival) !== 'unavailable')">{{ arrivalMeta(arrival) }}<template v-if="arrival.service_type && arrivalSource(arrival) !== 'unavailable'">{{ arrivalMeta(arrival) ? ' · ' : '' }}{{ arrival.service_type }}</template></small></li></ul>
      </section>

      <section class="panel route-stops" :style="{ '--route-color': route.color || '#2878c8' }">
        <div class="section-head"><h3>{{ label('stops') }}</h3><small>{{ directionVehicles.length }} {{ label('vehicles') }}</small></div>
        <p v-if="!currentDirection?.stops?.length" class="muted">{{ busText('empty') }}</p>
        <ol v-else>
          <li v-for="stop in currentDirection.stops" :key="stop.id" :class="{ selected: stop.id === selectedStopId }">
            <div class="stop-line"><i aria-hidden="true" /><div v-if="atStop(stop).length || betweenStop(stop).length" class="vehicle-markers"><button v-if="atStop(stop).length" type="button" class="vehicle-marker at" :aria-expanded="expandedVehicleKey === `at-${stop.id}`" @click="toggleVehicles(`at-${stop.id}`)">🚌<em v-if="hasSpecialService(atStop(stop))">S</em><b v-if="atStop(stop).length > 1">{{ atStop(stop).length }}</b></button><button v-if="betweenStop(stop).length" type="button" class="vehicle-marker between" :aria-expanded="expandedVehicleKey === `between-${stop.id}`" @click="toggleVehicles(`between-${stop.id}`)">🚌<em v-if="hasSpecialService(betweenStop(stop))">S</em><b v-if="betweenStop(stop).length > 1">{{ betweenStop(stop).length }}</b></button></div></div>
            <div class="stop-main"><a :href="`${stopHref}${encodeURIComponent(stop.id)}`" @click.prevent="selectStop(stop.id)"><strong>{{ routeStopName(stop) }}</strong></a></div>
            <div v-if="expandedVehicleKey === `at-${stop.id}` || expandedVehicleKey === `between-${stop.id}`" class="vehicle-details">
              <BusVehicleDetailV2 v-for="vehicle in expandedVehicleKey === `at-${stop.id}` ? atStop(stop) : betweenStop(stop)" :key="vehicle.id" :vehicle="vehicle" :routes="[route]" :language="busLanguage" />
            </div>
          </li>
        </ol>
      </section>

      <section class="map-slot" :aria-label="label('map')">
        <h3>{{ label('map') }}</h3>
        <slot v-if="$slots.map" name="map" :route-id="route.id" :direction-id="directionId" />
        <BusMapV2 v-else :routes="[route]" :vehicles="vehicles" :route-id="route.id" :language="busLanguage" />
      </section>
    </template>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { busApi, publicApi } from './api.mjs'
import { displayName, displayStopName, formatLocalDateTime, unavailableReasonTextKey } from './core.mjs'
import { groupSchedules } from './bus-v2-helpers.mjs'
import { isFavorite, loadFavorites, toggleFavorite } from './favorites.mjs'
import { busLanguage, busText, setBusLanguage } from './i18n.mjs'
import { renderNoticeMarkdown } from './markdown.mjs'
import BusMapV2 from './BusMapV2.vue'
import BusScheduleRowsV2 from './BusScheduleRowsV2.vue'
import BusVehicleDetailV2 from './BusVehicleDetailV2.vue'

const props = defineProps({ id: { type: String, default: '' }, direction: { type: String, default: '' }, stopHref: { type: String, default: '/transport/bustimer_v2_stop.html?id=' } })
const route = ref(null), loading = ref(true), error = ref(''), directionId = ref(''), selectedStopId = ref('')
const notices = ref([]), vehicles = ref([]), stops = ref([]), schedules = ref([]), showSchedules = ref(false), scheduleLoading = ref(false), scheduleError = ref(false)
const arrivalState = ref({ loading: false, error: false, items: [] }), allArrivals = ref(false), expandedVehicleKey = ref(''), now = ref(new Date())
let refreshTimer, arrivalRequest = 0
const id = computed(() => props.id || (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('id') || ''))
const requestedDirection = computed(() => props.direction || (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('direction') || ''))
const directions = computed(() => route.value?.directions || [])
const currentDirection = computed(() => directions.value.find((item) => item.id === directionId.value) || directions.value[0])
const directionVehicles = computed(() => vehicles.value.filter((vehicle) => vehicle.route_direction_id === directionId.value))
const selectedStop = computed(() => currentDirection.value?.stops?.find((item) => item.id === selectedStopId.value))
const favorite = computed(() => route.value && isFavorite('route', route.value.id))
const routeNotices = computed(() => notices.value.filter((notice) => (!notice.route_id && !notice.stop_id) || notice.route_id === route.value?.id).sort((a, b) => b.priority - a.priority))
const selectedArrivals = computed(() => arrivalState.value.items.filter((item) => item.route_id === route.value?.id && (item.route_direction_id || item.direction_id) === directionId.value && (!item.stop_id || item.stop_id === selectedStopId.value)))
const visibleArrivals = computed(() => allArrivals.value ? selectedArrivals.value : selectedArrivals.value.slice(0, 2))
const currentSchedules = computed(() => schedules.value.filter((item) => item.route_id === route.value?.id && item.route_direction_id === directionId.value))
const nowMinutes = computed(() => now.value.getHours() * 60 + now.value.getMinutes())
const scheduleGroups = computed(() => groupSchedules(currentSchedules.value, nowMinutes.value, route.value ? [route.value] : []).map((item) => ({ ...item, color: route.value?.color, routeName: displayName(route.value, busLanguage.value) || route.value?.id, directionName: displayName(currentDirection.value, busLanguage.value) || directionId.value })))

const labels = { zh: { route: '线路', saved: '已收藏', save: '收藏', noServiceTime: '未提供服务时间', timetable: '时刻表', direction: '方向', close: '收起', allSchedules: '查看全部时刻表', selectedStop: '当前站点', allArrivals: '查看全部到站', collapse: '收起', stops: '站点', vehicles: '车辆', map: '线路地图', normal: '正常运营', suspended: '暂停运营', updated: '更新于 {time}', planned: '计划时间', realTime: '实时预测' }, en: { route: 'Route', saved: 'Saved', save: 'Save', noServiceTime: 'Service time unavailable', timetable: 'Timetable', direction: 'Direction', close: 'Close', allSchedules: 'All schedules', selectedStop: 'Selected stop', allArrivals: 'All arrivals', collapse: 'Show less', stops: 'Stops', vehicles: 'vehicles', map: 'Route map', normal: 'In service', suspended: 'Suspended', updated: 'Updated {time}', planned: 'Scheduled time', realTime: 'Real-time prediction' } }
const label = (key, values = {}) => (labels[busLanguage.value][key] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '')
const noticeTitle = (notice) => notice[busLanguage.value === 'en' ? 'title_en' : 'title_zh'] || notice.title_zh || notice.title_en
const noticeTime = (notice) => formatLocalDateTime(notice.starts_at)
const statusText = (value) => value === 'SUSPENDED' ? label('suspended') : label('normal')
const arrivalKey = (item) => `${item.route_direction_id}-${item.trip_id || item.planned_arrival_at || item.updated_at || item.eta_minutes}`
function time(value) { return value ? new Date(value).toLocaleTimeString(busLanguage.value === 'zh' ? 'zh-CN' : 'en', { hour: '2-digit', minute: '2-digit', hour12: false }) : '' }
const arrivalSource = (item) => String(item.source || '').toLowerCase().replace('-', '_')
function arrivalText(item) { return arrivalSource(item) === 'real_time' || arrivalSource(item) === 'realtime' ? busText('eta', { minutes: item.eta_minutes }) : arrivalSource(item) === 'planned' ? busText('planAt', { time: time(item.planned_arrival_at) }) : busText(unavailableReasonTextKey(item.unavailable_reason)) }
function arrivalMeta(item) { return arrivalSource(item) === 'real_time' || arrivalSource(item) === 'realtime' ? `${label('realTime')}${item.updated_at ? ` · ${label('updated', { time: time(item.updated_at) })}` : ''}` : arrivalSource(item) === 'planned' ? label('planned') : item.updated_at ? label('updated', { time: time(item.updated_at) }) : '' }
function routeStopName(stop) { return displayStopName({ ...stops.value.find((item) => item.id === stop?.id), ...stop }, busLanguage.value) || stop?.id || '' }
function stopFor(vehicle) { const position = vehicle.current_position || {}; return position.next_stop_id || currentDirection.value?.stops?.find((stop) => stop.sequence === (position.next_stop_num || vehicle.route_sequence + (position.type === 'between_stops' ? 1 : 0)))?.id }
const atStop = (stop) => directionVehicles.value.filter((vehicle) => vehicle.current_position?.type === 'at_stop' && stopFor(vehicle) === stop.id || !vehicle.current_position && vehicle.route_sequence === stop.sequence)
const betweenStop = (stop) => directionVehicles.value.filter((vehicle) => vehicle.current_position?.type === 'between_stops' && stopFor(vehicle) === stop.id)
const hasSpecialService = (items) => items.some((vehicle) => vehicle.service_type && vehicle.service_type !== 'NORMAL')
function toggleVehicles(key) { expandedVehicleKey.value = expandedVehicleKey.value === key ? '' : key }
function selectDirection(value) { directionId.value = value; selectedStopId.value = currentDirection.value?.stops?.[0]?.id || ''; allArrivals.value = false; expandedVehicleKey.value = ''; loadArrivals() }
function selectStop(value) { selectedStopId.value = value; allArrivals.value = false; loadArrivals() }
async function loadArrivals() { const stopId = selectedStopId.value, selectedDirection = directionId.value, request = ++arrivalRequest; if (!stopId || !selectedDirection) { arrivalState.value = { loading: false, error: false, items: [] }; return } arrivalState.value = { loading: true, error: false, items: [] }; try { const result = await busApi.arrivals(stopId); if (request === arrivalRequest && selectedStopId.value === stopId && directionId.value === selectedDirection) arrivalState.value = { loading: false, error: false, items: result.arrivals || [] } } catch { if (request === arrivalRequest && selectedStopId.value === stopId && directionId.value === selectedDirection) arrivalState.value = { loading: false, error: true, items: [] } } }
async function refreshRealtime() { now.value = new Date(); if (!route.value) return; try { const vehicleData = await busApi.vehicles(); vehicles.value = (Array.isArray(vehicleData) ? vehicleData : []).filter((vehicle) => vehicle.route_id === route.value.id) } catch { /* retain the last usable positions */ } await loadArrivals() }
async function toggleSchedules() { showSchedules.value = !showSchedules.value; if (!showSchedules.value || schedules.value.length || scheduleLoading.value) return; scheduleLoading.value = true; scheduleError.value = false; try { const result = await busApi.schedules(); schedules.value = Array.isArray(result) ? result : [] } catch { scheduleError.value = true } finally { scheduleLoading.value = false } }
async function load() { arrivalRequest++; loading.value = true; error.value = ''; try { if (!id.value) throw new Error('Missing route id'); const [routeData, noticeData, vehicleData, stopData] = await Promise.all([publicApi(`/routes/${encodeURIComponent(id.value)}`), busApi.notices(), busApi.vehicles(), busApi.stops()]); route.value = routeData; notices.value = Array.isArray(noticeData) ? noticeData : []; vehicles.value = (Array.isArray(vehicleData) ? vehicleData : []).filter((vehicle) => vehicle.route_id === routeData.id); stops.value = Array.isArray(stopData) ? stopData : []; directionId.value = routeData.directions?.some((item) => item.id === requestedDirection.value) ? requestedDirection.value : routeData.directions?.[0]?.id || ''; selectedStopId.value = currentDirection.value?.stops?.[0]?.id || ''; await loadArrivals() } catch (reason) { error.value = reason.message || String(reason) } finally { loading.value = false } }
onMounted(() => { loadFavorites(); load(); refreshTimer = setInterval(refreshRealtime, 30000) })
onBeforeUnmount(() => clearInterval(refreshTimer))
watch(id, (value, old) => { if (value && value !== old) load() })
defineExpose({ load, selectDirection, selectStop })
</script>

<style scoped lang="scss">
.notices > .muted { margin: 1rem 0 0; }
.notices > details > .markdown { margin-top: 0; }
.notices summary { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .25rem .75rem; list-style: none; }
.notices summary::-webkit-details-marker { display: none; }
.notices summary > span::after { content: ' ▸'; color: #687386; }
.notices details[open] > summary > span::after { content: ' ▾'; }
.notices summary time { color: #687386; font-size: .8rem; font-weight: 400; white-space: nowrap; }
.bus-detail { max-width: 900px; margin: 0 auto; color: var(--c-text, #243043); } .detail-head, .head-actions, .section-head, .route-summary { display: flex; align-items: center; gap: .75rem; } .detail-head, .section-head { justify-content: space-between; } .detail-head h1, .panel h3, .map-slot > h3 { margin: 0; padding-top: 0; } .detail-head h1 { font-size: 1.4rem; line-height: 1.25; } p { margin-top: 0; } .panel h3, .map-slot > h3 { font-size: 1rem; line-height: 1.3; } .eyebrow { margin-bottom: .2rem; color: #687386; font-size: .82rem; } .head-actions { align-self: flex-start; } .plain-button { border: 1px solid #aec5dc; border-radius: .35rem; padding: .4rem .65rem; background: transparent; color: inherit; font: inherit; cursor: pointer; } .panel { margin: 1rem 0; padding: 1rem; border: 1px solid var(--c-border, #dce2ea); border-radius: .6rem; background: var(--c-bg-soft, #fff); } .status { display: flex; align-items: center; gap: .5rem; } .error { color: #a32727; } .spinner { width: 1em; height: 1em; border: 2px solid #b7c9dd; border-top-color: #2672bc; border-radius: 50%; animation: spin .8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } } .route-summary { flex-wrap: wrap; padding-top: .5rem; padding-bottom: .5rem; border-left: .5rem solid var(--route-color); justify-content: space-between; } .route-summary div { display: flex; align-items: baseline; gap: .5rem; white-space: nowrap; } .route-swatch { width: .9rem; height: .9rem; border-radius: 50%; background: var(--route-color); } .direction-tabs { display: flex; flex-wrap: wrap; gap: .5rem; margin: 1rem 0; } .direction-tabs button { border: 1px solid #cbd9e7; border-radius: 999px; padding: .45rem .8rem; background: transparent; color: inherit; font: inherit; cursor: pointer; } .direction-tabs .active { border-color: var(--c-brand, #2878c8); background: #eaf3fc; color: #175f9f; font-weight: 700; } .muted { color: #687386; } .selected-stop-title, .arrival-list li { display: flex; flex-wrap: wrap; align-items: baseline; gap: .2rem .5rem; } .selected-stop-title > *, .arrival-list li > * { white-space: nowrap; } .arrival-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; margin: .5rem 0; padding: 0; list-style: none; } .arrival-list li { padding: .55rem; border: 1px solid #e7edf4; border-radius: .35rem; } .arrival-list small { color: #687386; } .all-link { display: inline-block; margin-top: .75rem; color: #1765ac; } details + details { border-top: 1px solid #e7edf4; } summary { padding: .65rem 0; cursor: pointer; font-weight: 600; } .markdown { margin: 1rem 0 0; padding-bottom: .25rem; } .markdown :deep(p) { margin: 1rem 0 0; } .markdown :deep(:first-child) { margin-top: 0; } .markdown :deep(:last-child) { margin-bottom: 0; } .route-stops { max-height: 36rem; overflow-y: auto; } .route-stops ol { margin: 0; padding: 0; list-style: none; } .route-stops li { position: relative; display: grid; grid-template-columns: 1.6rem minmax(0, 1fr); min-height: 2.25rem; } .stop-line { position: relative; display: flex; justify-content: center; } .stop-line::before { content: ''; position: absolute; z-index: 0; top: 0; bottom: 0; width: 4px; background: var(--route-color); } .stop-line i { z-index: 1; width: .75rem; height: .75rem; margin-top: .65rem; border: 3px solid var(--route-color); border-radius: 50%; background: #fff; } .selected .stop-line i { background: var(--route-color); box-shadow: 0 0 0 4px color-mix(in srgb, var(--route-color) 25%, transparent); } .stop-main { padding: .25rem .25rem .25rem .5rem; } .stop-main a { color: inherit; font: inherit; text-decoration: none; } .stop-main a:hover, .stop-main a:focus-visible { color: var(--route-color); text-decoration: underline; } .selected .stop-main strong { color: var(--route-color); } .vehicle-markers { position: absolute; z-index: 2; inset: 0; pointer-events: none; } .vehicle-marker { position: absolute; left: 50%; transform: translateX(-50%); border: 0; border-radius: 999px; padding: .2rem .3rem; background: #e8f2fb; font: inherit; font-size: .78rem; cursor: pointer; pointer-events: auto; white-space: nowrap; } .vehicle-marker.at { top: .25rem; } .vehicle-marker.between { top: 2.1rem; background: #fff4d9; } .vehicle-marker em { margin-left: .1rem; color: #9a5200; font-size: .7rem; font-style: normal; font-weight: 800; } .vehicle-marker b { margin-left: .15rem; } .vehicle-details { display: grid; grid-column: 2; gap: .4rem; margin: 0 .5rem .6rem; } .vehicle-details :deep(.vehicle-detail) { box-sizing: border-box; min-width: 0; box-shadow: none; } .map-slot { margin: 1rem 0; } @media (max-width: 560px) { .detail-head { align-items: flex-start; } .head-actions { flex-wrap: wrap; justify-content: flex-end; } .panel { margin: .75rem 0; } .arrival-list { grid-template-columns: 1fr; } }
</style>

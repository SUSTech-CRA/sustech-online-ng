<template>
  <main class="bus-detail" :lang="busLanguage === 'zh' ? 'zh-CN' : 'en'">
    <BusRefreshButton :remaining="refreshRemaining" :label="busText('refreshNow')" @refresh="refresh" />
    <div class="detail-head">
      <div>
        <h1 v-if="route">{{ busText('routeLabel') }}{{ busLanguage === 'zh' ? '：' : ': ' }}{{ displayName(route, busLanguage) }}</h1>
        <h1 v-else>{{ busText('routeLabel') }}</h1>
      </div>
      <div class="head-actions header-actions">
        <a class="icon-button" href="/transport/bustimer.html" :aria-label="busText('home')" :title="busText('home')">🏠<span class="icon-label">{{ busText('homeShort') }}</span></a>
        <button type="button" class="icon-button" :aria-pressed="showNotices" :aria-label="busText('announcements')" :title="busText('announcements')" @click="showNotices = !showNotices">📢<i v-if="hasImportantNotice" class="icon-dot" aria-hidden="true" /><span class="icon-label">{{ busText('noticesShort') }}</span></button>
        <button v-if="route" type="button" class="icon-button" :aria-pressed="favorite" :aria-label="busText('favorites')" @click="toggleFavorite('route', route.id)">⭐<span class="icon-label">{{ favorite ? busText('saved') : busText('save') }}</span></button>
        <button type="button" class="text-button" @click="setBusLanguage(busLanguage === 'zh' ? 'en' : 'zh')">{{ busText('language') }}</button>
      </div>
    </div>

    <BusPanelPopupV2 :open="showNotices" :title="busText('announcements')" @close="showNotices = false">
      <div class="notices">
        <p v-if="!routeNotices.length" class="muted">{{ busText('empty') }}</p>
        <details v-for="notice in routeNotices" :key="notice.id" :class="{ 'bus-notice--important': isImportantNotice(notice) }" :open="isNoticeOpen(notice)" @toggle="rememberNoticeOpen(notice, $event)"><summary><span>{{ noticeTitle(notice) }}</span><time v-if="noticeTime(notice)" :datetime="notice.starts_at">{{ noticeTime(notice) }}</time></summary><div class="markdown" v-html="renderNoticeMarkdown(notice.body_markdown)" /></details>
      </div>
    </BusPanelPopupV2>

    <section v-if="loading" class="panel status"><span class="spinner" aria-hidden="true" /> {{ busText('loading') }}</section>
    <section v-else-if="error" class="panel status error" role="alert"><strong>{{ busText('loadFailed') }}</strong><span>{{ error }}</span><button type="button" @click="load">{{ busText('retry') }}</button></section>

    <template v-else-if="route">
      <section v-if="directions.length > 1" class="direction-tabs" :aria-label="busText('direction')">
        <button v-for="item in directions" :key="item.id" type="button" :class="{ active: item.id === directionId }" :aria-pressed="item.id === directionId" @click="selectDirection(item.id)">{{ displayName(item, busLanguage) }}</button>
      </section>

      <section class="panel schedules" :style="{ '--route-color': route.color || '#2878c8' }">
        <h3>{{ busText('timetable') }}</h3>
        <p v-if="scheduleLoading" class="muted">{{ busText('loading') }}</p>
        <p v-else-if="scheduleError" class="muted">{{ busText('unavailable') }}</p>
        <p v-else-if="!scheduleGroups.length" class="muted">{{ busText('empty') }}</p>
        <BusScheduleRowsV2 v-else :groups="scheduleGroups" :language="busLanguage" />
        <div class="schedules-foot">
          <div class="route-status"><span class="route-swatch" aria-hidden="true" /><strong>{{ statusText(route.operation_status) }}</strong><span>{{ route.service_time || busText('noServiceTime') }}</span></div>
          <a class="all-link" href="/transport/bustimer.html#schedules">{{ busText('allSchedules') }}</a>
        </div>
      </section>

      <section class="panel route-stops" :style="{ '--route-color': route.color || '#2878c8' }">
        <div class="section-head"><h3>{{ busText('stops') }}</h3><small>{{ directionVehicles.length }} {{ busText('vehicleCountUnit') }}</small></div>
        <BusVehicleLegendV2 :language="busLanguage" />
        <p v-if="!currentDirection?.stops?.length" class="muted">{{ busText('empty') }}</p>
        <ol v-else>
          <li v-for="stop in currentDirection.stops" :key="stop.id" :class="{ selected: stop.id === selectedStopId }">
            <div class="stop-line"><i aria-hidden="true" /><div v-if="atStop(stop).length || betweenStop(stop).length" class="vehicle-markers"><button v-if="atStop(stop).length" type="button" class="vehicle-marker at" :aria-expanded="expandedVehicleKey === `at-${stop.id}`" @click="toggleVehicles(`at-${stop.id}`)"><b v-if="atStop(stop).length > 1">{{ atStop(stop).length }}</b><BusVehicleIconV2 aria-hidden="true" class="vehicle-icon" :type="atStop(stop)[0]?.vehicle_type" /><em v-if="hasSpecialService(atStop(stop))">S</em></button><button v-if="betweenStop(stop).length" type="button" class="vehicle-marker between" :aria-expanded="expandedVehicleKey === `between-${stop.id}`" @click="toggleVehicles(`between-${stop.id}`)"><b v-if="betweenStop(stop).length > 1">{{ betweenStop(stop).length }}</b><BusVehicleIconV2 aria-hidden="true" class="vehicle-icon" :type="betweenStop(stop)[0]?.vehicle_type" /><em v-if="hasSpecialService(betweenStop(stop))">S</em></button></div></div>
            <div class="stop-main"><a :href="`${stopHref}${encodeURIComponent(stop.id)}`" @click.prevent="selectStop(stop.id)"><strong>{{ routeStopName(stop) }}</strong></a></div>
            <div v-if="expandedVehicleKey === `at-${stop.id}` || expandedVehicleKey === `between-${stop.id}`" class="vehicle-details">
              <BusVehicleDetailV2 v-for="vehicle in expandedVehicleKey === `at-${stop.id}` ? atStop(stop) : betweenStop(stop)" :key="vehicle.id" :vehicle="vehicle" :routes="[route]" :stops="stops" :language="busLanguage" />
            </div>
          </li>
        </ol>
      </section>

      <section class="panel map-slot" :aria-label="busText('map')">
        <h3>{{ displayName(route, busLanguage) }} · {{ busText('map') }}</h3>
        <slot v-if="$slots.map" name="map" :route-id="route.id" :direction-id="directionId" />
        <BusMapV2 v-else :routes="[route]" :vehicles="vehicles" :stops="stops" :route-id="route.id" :language="busLanguage" />
      </section>
    </template>
  </main>
</template>

<script setup>
import BusVehicleIconV2 from './BusVehicleIconV2.vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { busApi, publicApi } from './api.mjs'
import { busServiceMinutes, displayName, displayStopName, formatLocalDateTime } from './core.mjs'
import { groupSchedules } from './bus-v2-helpers.mjs'
import { isFavorite, loadFavorites, toggleFavorite } from './favorites.mjs'
import { busLanguage, busText, setBusLanguage } from './i18n.mjs'
import { renderNoticeMarkdown } from './markdown.mjs'
import { isImportantNotice, loadNoticeOpenStates, noticeIsOpen, saveNoticeOpenState } from './notice-state.mjs'
import BusMapV2 from './BusMapV2.vue'
import BusPanelPopupV2 from './BusPanelPopupV2.vue'
import BusScheduleRowsV2 from './BusScheduleRowsV2.vue'
import BusVehicleDetailV2 from './BusVehicleDetailV2.vue'
import BusVehicleLegendV2 from './BusVehicleLegendV2.vue'
import BusRefreshButton from './BusRefreshButton.vue'

const props = defineProps({ id: { type: String, default: '' }, direction: { type: String, default: '' }, stopHref: { type: String, default: '/transport/bustimer_v2_stop.html?id=' } })
const route = ref(null), loading = ref(true), error = ref(''), directionId = ref(''), selectedStopId = ref('')
const notices = ref([]), vehicles = ref([]), stops = ref([]), schedules = ref([]), scheduleLoading = ref(false), scheduleError = ref(false), showNotices = ref(false)
const noticeOpenStates = ref(loadNoticeOpenStates())
const expandedVehicleKey = ref(''), now = ref(new Date())
const refreshRemaining = ref(10)
let refreshTimer
const id = computed(() => props.id || (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('id') || ''))
const requestedDirection = computed(() => props.direction || (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('direction') || ''))
const directions = computed(() => route.value?.directions || [])
const currentDirection = computed(() => directions.value.find((item) => item.id === directionId.value) || directions.value[0])
const directionVehicles = computed(() => vehicles.value.filter((vehicle) => vehicle.route_direction_id === directionId.value))
const favorite = computed(() => route.value && isFavorite('route', route.value.id))
const routeNotices = computed(() => notices.value.filter((notice) => (!notice.route_id && !notice.stop_id) || notice.route_id === route.value?.id).sort((a, b) => b.priority - a.priority))
const hasImportantNotice = computed(() => routeNotices.value.some(isImportantNotice))
const currentSchedules = computed(() => schedules.value.filter((item) => item.route_id === route.value?.id && item.route_direction_id === directionId.value))
const nowMinutes = computed(() => busServiceMinutes(now.value))
const scheduleGroups = computed(() => groupSchedules(currentSchedules.value, nowMinutes.value, route.value ? [route.value] : []).map((item) => ({ ...item, color: route.value?.color, routeName: displayName(route.value, busLanguage.value) || route.value?.id, directionName: displayName(currentDirection.value, busLanguage.value) || directionId.value })))

const noticeTitle = (notice) => notice[busLanguage.value === 'en' ? 'title_en' : 'title_zh'] || notice.title_zh || notice.title_en
const noticeTime = (notice) => formatLocalDateTime(notice.starts_at)
const isNoticeOpen = (notice) => noticeIsOpen(noticeOpenStates.value, notice.id)
const rememberNoticeOpen = (notice, event) => saveNoticeOpenState(noticeOpenStates.value, notice.id, event.target.open)
const statusText = (value) => value === 'SUSPENDED' ? busText('suspended') : busText('normal')
function routeStopName(stop) { return displayStopName({ ...stops.value.find((item) => item.id === stop?.id), ...stop }, busLanguage.value) || stop?.id || '' }
function stopFor(vehicle) { const position = vehicle.current_position || {}; return position.next_stop_id || currentDirection.value?.stops?.find((stop) => stop.sequence === (position.next_stop_num || vehicle.route_sequence + (position.type === 'between_stops' ? 1 : 0)))?.id }
const atStop = (stop) => directionVehicles.value.filter((vehicle) => vehicle.current_position?.type === 'at_stop' && stopFor(vehicle) === stop.id || !vehicle.current_position && vehicle.route_sequence === stop.sequence)
const betweenStop = (stop) => directionVehicles.value.filter((vehicle) => vehicle.current_position?.type === 'between_stops' && stopFor(vehicle) === stop.id)
const hasSpecialService = (items) => items.some((vehicle) => vehicle.service_type && vehicle.service_type !== 'NORMAL')
function toggleVehicles(key) { expandedVehicleKey.value = expandedVehicleKey.value === key ? '' : key }
function selectDirection(value) { directionId.value = value; selectedStopId.value = currentDirection.value?.stops?.[0]?.id || ''; expandedVehicleKey.value = '' }
function selectStop(value) { selectedStopId.value = value }
async function refresh() { const routeId = route.value?.id; refreshRemaining.value = 10; now.value = new Date(); if (!routeId) return; try { const [noticeData, vehicleData] = await Promise.all([busApi.notices(), busApi.vehicles()]); notices.value = Array.isArray(noticeData) ? noticeData : []; vehicles.value = (Array.isArray(vehicleData) ? vehicleData : []).filter((vehicle) => vehicle.route_id === routeId) } catch { /* retain the last usable data */ } }
async function loadSchedules() { scheduleLoading.value = true; scheduleError.value = false; try { const result = await busApi.schedules(); schedules.value = Array.isArray(result) ? result : [] } catch { scheduleError.value = true } finally { scheduleLoading.value = false } }
async function load() { loading.value = true; error.value = ''; loadSchedules(); try { if (!id.value) throw new Error('Missing route id'); const [routeData, noticeData, vehicleData, stopData] = await Promise.all([publicApi(`/routes/${encodeURIComponent(id.value)}`), busApi.notices(), busApi.vehicles(), busApi.stops()]); route.value = routeData; notices.value = Array.isArray(noticeData) ? noticeData : []; vehicles.value = (Array.isArray(vehicleData) ? vehicleData : []).filter((vehicle) => vehicle.route_id === routeData.id); stops.value = Array.isArray(stopData) ? stopData : []; directionId.value = routeData.directions?.some((item) => item.id === requestedDirection.value) ? requestedDirection.value : routeData.directions?.[0]?.id || ''; selectedStopId.value = currentDirection.value?.stops?.[0]?.id || '' } catch (reason) { error.value = reason.message || String(reason) } finally { loading.value = false } }
onMounted(() => { loadFavorites(); load(); refreshTimer = setInterval(() => { if (--refreshRemaining.value < 1) refresh() }, 1000) })
onBeforeUnmount(() => clearInterval(refreshTimer))
watch(id, (value, old) => { if (value && value !== old) load() })
defineExpose({ load, refresh, selectDirection, selectStop })
</script>

<style scoped lang="scss">
.notices > .muted { margin: 1rem 0 0; }
.notices > details > .markdown { margin-top: 0; }
.notices summary { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .25rem .75rem; list-style: none; }
.notices summary::-webkit-details-marker { display: none; }
.notices summary > span::after { content: ' ▸'; color: #687386; }
.notices details[open] > summary > span::after { content: ' ▾'; }
.notices summary time { color: #687386; font-size: .8rem; font-weight: 400; white-space: nowrap; }
.bus-detail { max-width: 900px; margin: 0 auto; color: var(--c-text, #243043); } .detail-head, .head-actions, .section-head { display: flex; align-items: center; gap: .75rem; } .detail-head, .section-head { justify-content: space-between; } .detail-head h1, .panel h3, .map-slot > h3 { margin: 0; padding-top: 0; } .detail-head h1 { font-size: 1.4rem; line-height: 1.25; } p { margin-top: 0; } .panel h3, .map-slot > h3 { font-size: 1rem; line-height: 1.3; } .head-actions { align-self: center; } .plain-button { border: 1px solid #aec5dc; border-radius: .35rem; padding: .4rem .65rem; background: transparent; color: inherit; font: inherit; cursor: pointer; } .panel { margin: 1rem 0; padding: 1rem; border: 1px solid var(--c-border, #dce2ea); border-radius: .6rem; background: var(--c-bg-soft, #fff); } .status { display: flex; align-items: center; gap: .5rem; } .error { color: #a32727; } .spinner { width: 1em; height: 1em; border: 2px solid #b7c9dd; border-top-color: #2672bc; border-radius: 50%; animation: spin .8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } } .schedules { border-left: .5rem solid var(--route-color); } .schedules-foot { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: .5rem .75rem; margin-top: .75rem; } .route-status { display: flex; flex-wrap: wrap; align-items: baseline; gap: .5rem; min-width: 0; } .route-swatch { width: .9rem; height: .9rem; border-radius: 50%; background: var(--route-color); } .direction-tabs { display: flex; flex-wrap: wrap; gap: .5rem; margin: 1rem 0; } .direction-tabs button { border: 1px solid #cbd9e7; border-radius: 999px; padding: .45rem .8rem; background: transparent; color: inherit; font: inherit; cursor: pointer; } .direction-tabs .active { border-color: var(--c-brand, #2878c8); background: #eaf3fc; color: #175f9f; font-weight: 700; } .muted { color: #687386; } .all-link { display: inline-block; color: #1765ac; } details + details { border-top: 1px solid #e7edf4; } summary { padding: .65rem 0; cursor: pointer; font-weight: 600; } .markdown { margin: 1rem 0 0; padding-bottom: .25rem; } .markdown :deep(p) { margin: 1rem 0 0; } .markdown :deep(:first-child) { margin-top: 0; } .markdown :deep(:last-child) { margin-bottom: 0; } .route-stops { max-height: 18rem; overflow-y: auto; } .route-stops ol { margin: 0; padding: 0; list-style: none; } .route-stops li { position: relative; display: grid; grid-template-columns: 1.6rem minmax(0, 1fr); min-height: 2.25rem; } .stop-line { position: relative; display: flex; justify-content: center; } .stop-line::before { content: ''; position: absolute; z-index: 0; top: 0; bottom: 0; width: 4px; background: var(--route-color); } .stop-line > i { z-index: 1; width: .75rem; height: .75rem; margin-top: .65rem; border: 3px solid var(--route-color); border-radius: 50%; background: #fff; } .selected .stop-line > i { background: var(--route-color); box-shadow: 0 0 0 4px color-mix(in srgb, var(--route-color) 25%, transparent); } .stop-main { padding: .25rem .25rem .25rem .5rem; } .stop-main a { color: inherit; font: inherit; text-decoration: none; } .stop-main a:hover, .stop-main a:focus-visible { color: var(--route-color); text-decoration: underline; } .selected .stop-main strong { color: var(--route-color); } .vehicle-markers { position: absolute; z-index: 2; inset: 0; pointer-events: none; } .vehicle-marker { position: absolute; left: 50%; transform: translateX(-50%); border: 0; border-radius: 999px; padding: .2rem .3rem; background: #e8f2fb; font: inherit; font-size: .78rem; cursor: pointer; pointer-events: auto; white-space: nowrap; } .vehicle-marker.at { top: .25rem; } .vehicle-marker.between { top: 2.1rem; background: #fff4d9; } .vehicle-marker em { margin-left: .1rem; color: #9a5200; font-size: .7rem; font-style: normal; font-weight: 800; } .vehicle-marker b { margin-left: .15rem; } .vehicle-details { display: grid; grid-column: 2; gap: .4rem; margin: 0 .5rem .6rem; } .vehicle-details :deep(.vehicle-detail) { box-sizing: border-box; min-width: 0; box-shadow: none; } .map-slot { margin: 1rem 0; } .map-slot > h3 { margin-bottom: .75rem; } @media (max-width: 560px) { .detail-head { align-items: center; } .head-actions { flex-wrap: wrap; justify-content: flex-end; } .panel { margin: .75rem 0; } }
.route-stops .stop-line > i { background: var(--bus-v2-bg); }
.route-stops .vehicle-marker { transform: translate(-64%, -50%); background: var(--bus-v2-link-soft); color: var(--bus-v2-text); }
.route-stops .vehicle-marker.at { top: 1rem; }
.route-stops .vehicle-marker.between { top: -0.1rem; background: color-mix(in srgb, #f7a600 18%, var(--bus-v2-bg)); }
.route-stops .vehicle-marker { gap: .1rem; padding: 0; background: transparent; }
.route-stops .vehicle-marker { display: flex; align-items: center; }
.route-stops .vehicle-marker b { margin: 0 .15rem 0 0; }
.route-stops .vehicle-marker.between { background: transparent; }
.route-stops .vehicle-icon { display: block; width: 1.2rem; height: 1.2rem; }
.head-actions { gap: .3rem; }
.plain-button { color: inherit; text-decoration: none; }
.text-button { padding: .4rem .25rem; border: 0; background: transparent; color: var(--bus-v2-link); font: inherit; cursor: pointer; }
.bus-detail { color: var(--bus-v2-text); }
.bus-detail .muted, .bus-detail .notices summary time, .bus-detail .notices summary > span::after { color: var(--bus-v2-muted); }
.bus-detail .panel { border-color: var(--bus-v2-border); background: var(--bus-v2-bg); }
.bus-detail .plain-button, .bus-detail .direction-tabs button, .bus-detail details + details { border-color: var(--bus-v2-border); }
.bus-detail .direction-tabs .active { background: var(--bus-v2-link-soft); color: var(--bus-v2-link); }
</style>

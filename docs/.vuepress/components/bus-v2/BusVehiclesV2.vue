<template>
  <main class="bus-vehicles" :lang="language === 'zh' ? 'zh-CN' : 'en'">
    <header><div><h1>{{ text('所有车辆实时位置', 'All live vehicles') }}</h1><p>{{ text('线路轨迹和正在运营的车辆', 'Routes and vehicles currently in service') }}</p></div><div><button type="button" :aria-label="text('立即刷新', 'Refresh now')" @click="refresh">🔄{{ refreshRemaining }}s</button><button type="button" @click="setBusLanguage(language === 'zh' ? 'en' : 'zh')">{{ busText('language') }}</button></div></header>
    <section v-if="loading" class="state">{{ busText('loading') }}</section>
    <section v-else-if="error" class="state error" role="alert"><strong>{{ busText('loadFailed') }}</strong><span>{{ error }}</span><button type="button" @click="load">{{ busText('retry') }}</button></section>
    <template v-else>
      <section class="notices"><h3>{{ text('运营公告', 'Service notices') }}</h3><p v-if="!notices.length" class="muted">{{ busText('empty') }}</p><details v-for="notice in notices" :key="notice.id" :open="!notice.route_id"><summary><span>{{ noticeTitle(notice) }}</span><small>{{ notice.route_id ? routeName(notice.route_id) : text('全局', 'Global') }}<template v-if="noticeTime(notice)"> · <time :datetime="notice.starts_at">{{ noticeTime(notice) }}</time></template></small></summary><div class="markdown" v-html="renderNoticeMarkdown(notice.body_markdown)" /></details></section>
      <div class="map-head"><div class="legend"><span><i class="normal" />{{ text('正常（60 秒内）', 'Normal (within 60 sec)') }}</span><span><i class="delayed" />{{ text('延迟（60–120 秒）', 'Delayed (60–120 sec)') }}</span><span><i class="offline" />{{ text('离线（超过 120 秒）', 'Offline (over 120 sec)') }}</span></div><time v-if="lastUpdated">{{ text('更新于', 'Updated') }} {{ lastUpdated }}</time></div>
      <BusMapV2 :routes="routes" :vehicles="vehicles" :stops="stops" :language="language" />
      <p v-if="!vehicles.length" class="state muted">{{ text('当前没有运营中的车辆。', 'No vehicles are currently in service.') }}</p>
    </template>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BusMapV2 from './BusMapV2.vue'
import { busApi } from './api.mjs'
import { displayName, formatLocalDateTime } from './core.mjs'
import { busLanguage, busText, setBusLanguage } from './i18n.mjs'
import { renderNoticeMarkdown } from './markdown.mjs'

const language = busLanguage; const routes = ref([]); const stops = ref([]); const vehicles = ref([]); const allNotices = ref([]); const loading = ref(true); const error = ref(''); const refreshRemaining = ref(30)
let refreshTimer
const text = (zh, en) => language.value === 'zh' ? zh : en
const routeIds = computed(() => new Set(vehicles.value.map((vehicle) => vehicle.route_id)))
const notices = computed(() => allNotices.value.filter((notice) => !notice.route_id || routeIds.value.has(notice.route_id)).sort((left, right) => right.priority - left.priority))
const routeName = (id) => displayName(routes.value.find((route) => route.id === id), language.value) || id
const noticeTitle = (notice) => notice[language.value === 'zh' ? 'title_zh' : 'title_en'] || notice.title_zh || notice.title_en
const noticeTime = (notice) => formatLocalDateTime(notice.starts_at)
const lastUpdated = computed(() => {
  const times = vehicles.value.map((vehicle) => vehicle.source_updated_at || vehicle.received_at).filter(Boolean).map(Date.parse).filter(Number.isFinite)
  return times.length ? new Date(Math.max(...times)).toLocaleString(language.value === 'zh' ? 'zh-CN' : 'en', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : ''
})
async function load() { loading.value = true; error.value = ''; try { const [routeData, stopData, vehicleData, noticeData] = await Promise.all([busApi.routes(), busApi.stops(), busApi.vehicles(), busApi.notices()]); routes.value = Array.isArray(routeData) ? routeData : []; stops.value = Array.isArray(stopData) ? stopData : []; vehicles.value = Array.isArray(vehicleData) ? vehicleData : []; allNotices.value = Array.isArray(noticeData) ? noticeData : [] } catch (reason) { error.value = reason.message || String(reason) } finally { loading.value = false } }
async function refreshVehicles() { try { const data = await busApi.vehicles(); vehicles.value = Array.isArray(data) ? data : [] } catch { /* retain the last usable positions */ } }
async function refresh() { refreshRemaining.value = 30; try { const [vehicleData, noticeData] = await Promise.all([busApi.vehicles(), busApi.notices()]); vehicles.value = Array.isArray(vehicleData) ? vehicleData : []; allNotices.value = Array.isArray(noticeData) ? noticeData : [] } catch { /* retain the last usable data */ } }
onMounted(() => { load(); refreshTimer = setInterval(() => { if (--refreshRemaining.value < 1) refresh() }, 1000) }); onBeforeUnmount(() => clearInterval(refreshTimer)); defineExpose({ load, refresh, refreshVehicles })
</script>

<style scoped lang="scss">
.notices > .muted { margin: 1rem 0 0; }
.notices > details > .markdown { margin-top: 0; }
.notices summary { list-style: none; }
.notices summary::-webkit-details-marker { display: none; }
.notices summary > span::after { content: ' ▸'; color: #667085; }
.notices details[open] > summary > span::after { content: ' ▾'; }
.bus-vehicles { max-width: 1100px; margin: 0 auto; color: var(--c-text, #243043); }.bus-vehicles header, .map-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }.bus-vehicles header h1, .notices h3 { margin: 0; padding-top: 0; }.bus-vehicles header h1 { font-size: 1.4rem; line-height: 1.25; }.notices h3 { font-size: 1rem; line-height: 1.3; }.bus-vehicles p { margin-top: 0; }.bus-vehicles header p, .muted { color: #667085; }.bus-vehicles button { padding: .4rem .65rem; border: 1px solid #a9c2dc; border-radius: .35rem; background: transparent; color: inherit; font: inherit; cursor: pointer; }.state, .notices { margin: 1rem 0; padding: .85rem 1rem; border: 1px solid #d9e2ec; border-radius: .55rem; background: var(--c-bg-soft, #fff); }.state { display: flex; gap: .5rem; align-items: center; }.error { color: #b42318; }.notices details + details { border-top: 1px solid #e6ebf0; }.notices summary { padding: .6rem 0; cursor: pointer; font-weight: 600; }.notices small { color: #667085; font-weight: 400; }.notices .markdown { margin: 1rem 0 0; padding-bottom: .6rem; }.notices .markdown :deep(p) { margin: 1rem 0 0; }.notices .markdown :deep(:first-child) { margin-top: 0; }.notices .markdown :deep(:last-child) { margin-bottom: 0; }.map-head { margin: 1rem 0 .5rem; }.map-head time { color: #667085; font-size: .85rem; }.legend { display: flex; flex-wrap: wrap; gap: .75rem; font-size: .85rem; }.legend span { display: inline-flex; align-items: center; gap: .3rem; }.legend i { width: .65rem; height: .65rem; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 0 1px #9ba7b5; }.legend .normal { background: #2878c8; }.legend .delayed { background: #f7a600; }.legend .offline { background: #9aa4b2; } @media (max-width: 600px) { .bus-vehicles header, .map-head { align-items: flex-start; flex-direction: column; } }
.bus-vehicles { color: var(--bus-v2-text); }
.bus-vehicles header p, .bus-vehicles .muted, .bus-vehicles .notices small, .bus-vehicles .map-head time, .bus-vehicles .notices summary > span::after { color: var(--bus-v2-muted); }
.bus-vehicles button, .bus-vehicles .state, .bus-vehicles .notices { border-color: var(--bus-v2-border); }
.bus-vehicles .state, .bus-vehicles .notices { background: var(--bus-v2-bg); }
.bus-vehicles .notices details + details { border-color: var(--bus-v2-border); }
.bus-vehicles .legend i { border-color: var(--bus-v2-bg); box-shadow: 0 0 0 1px var(--bus-v2-border); }
</style>

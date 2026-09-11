<template>
  <main class="bus-stop-detail" :lang="busLanguage === 'zh' ? 'zh-CN' : 'en'">
    <header class="detail-head">
      <div><p class="eyebrow">{{ label('stop') }}</p><h1 v-if="stop">{{ stopName }}</h1><h1 v-else>{{ label('stop') }}</h1><p v-if="stop?.group_id" class="muted">{{ label('platform', { name: displayName(stop, busLanguage) }) }}</p></div>
      <div class="head-actions"><a class="plain-button" href="/transport/bustimer_v2.html" :aria-label="label('home')" :title="label('home')">🏠</a><button type="button" class="plain-button" :aria-label="busLanguage === 'zh' ? '立即刷新' : 'Refresh now'" @click="refresh">🔄{{ refreshRemaining }}s</button><button type="button" class="plain-button" @click="setBusLanguage(busLanguage === 'zh' ? 'en' : 'zh')">{{ busText('language') }}</button><button v-if="stop" type="button" class="plain-button" :aria-pressed="favorite" @click="toggleFavorite('stop', stop.id)">{{ favorite ? label('saved') : label('save') }}</button></div>
    </header>
    <section v-if="loading" class="panel status"><span class="spinner" aria-hidden="true" /> {{ busText('loading') }}</section>
    <section v-else-if="error" class="panel status error" role="alert"><strong>{{ busText('loadFailed') }}</strong><span>{{ error }}</span><button type="button" @click="load">{{ busText('retry') }}</button></section>
    <template v-else-if="stop">
      <section v-if="platforms.length > 1" class="panel platforms"><h3>{{ label('platforms') }}</h3><div><button v-for="item in platforms" :key="item.id" type="button" :class="{ active: item.id === stop.id }" @click="openPlatform(item.id)">{{ displayName(item, busLanguage) || item.id }}</button></div></section>
      <section class="panel notices"><h3>{{ busText('announcements') }}</h3><p v-if="!stopNotices.length" class="muted">{{ busText('empty') }}</p><details v-for="notice in stopNotices" :key="notice.id"><summary><span>{{ noticeTitle(notice) }}</span><time v-if="noticeTime(notice)" :datetime="notice.starts_at">{{ noticeTime(notice) }}</time></summary><div class="markdown" v-html="renderNoticeMarkdown(notice.body_markdown)" /></details></section>
      <section class="panel arrivals" aria-live="polite"><div class="section-head"><h3>{{ label('arrivals') }}</h3><button v-if="hasMoreArrivals(arrivalState)" type="button" class="plain-button" :aria-expanded="allArrivals" @click="allArrivals = !allArrivals">{{ allArrivals ? label('collapse') : label('allArrivals') }}</button></div><BusVehicleLegendV2 :language="busLanguage" /><BusStopArrivalsV2 :state="arrivalState" :collapsed="!allArrivals" :route-href="routeHref" /></section>
      <section v-if="otherPlatforms.length" class="platform-services"><article v-for="item in otherPlatforms" :key="item.id" class="panel"><div class="section-head"><h3>{{ label('platform', { name: displayName(item, busLanguage) || item.id }) }}</h3><div class="platform-actions"><button v-if="hasMoreArrivals(platformArrivals[item.id])" type="button" class="plain-button" :aria-expanded="expandedPlatforms[item.id]" @click="togglePlatformArrivals(item.id)">{{ expandedPlatforms[item.id] ? label('collapse') : label('allArrivals') }}</button><button type="button" class="plain-button" @click="openPlatform(item.id)">{{ label('open') }}</button></div></div><BusStopArrivalsV2 :state="platformArrivals[item.id]" :collapsed="!expandedPlatforms[item.id]" :route-href="routeHref" /></article></section>
    </template>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { busApi, publicApi } from './api.mjs'
import { closestArrivalsByRoute, displayName, displayStopName, formatLocalDateTime } from './core.mjs'
import { isFavorite, loadFavorites, toggleFavorite } from './favorites.mjs'
import { busLanguage, busText, setBusLanguage } from './i18n.mjs'
import { renderNoticeMarkdown } from './markdown.mjs'
import BusStopArrivalsV2 from './BusStopArrivalsV2.vue'
import BusVehicleLegendV2 from './BusVehicleLegendV2.vue'

const props = defineProps({ id: { type: String, default: '' }, routeHref: { type: String, default: '/transport/bustimer_v2_route.html?id=' }, stopHref: { type: String, default: '/transport/bustimer_v2_stop.html?id=' } })
const stop = ref(null), platforms = ref([]), notices = ref([]), loading = ref(true), error = ref(''), allArrivals = ref(false), arrivalState = ref({ loading: false, error: false, items: [] }), platformArrivals = ref({}), expandedPlatforms = ref({}), refreshRemaining = ref(30)
let refreshTimer
const id = computed(() => props.id || (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('id') || ''))
const favorite = computed(() => stop.value && isFavorite('stop', stop.value.id))
const stopName = computed(() => displayStopName(stop.value, busLanguage.value))
const stopNotices = computed(() => notices.value.filter((notice) => (!notice.route_id && !notice.stop_id) || notice.stop_id === stop.value?.id).sort((a, b) => b.priority - a.priority))
const otherPlatforms = computed(() => platforms.value.filter((item) => item.id !== stop.value?.id))
const labels = { zh: { stop: '站点', home: '返回首页', saved: '已收藏', save: '收藏', platforms: '站台', platform: '站台 {name}', arrivals: '到站服务', allArrivals: '查看全部到站', collapse: '收起', open: '查看', openPlatformHint: '打开此站台以查看对应线路及实时到站服务。' }, en: { stop: 'Stop', home: 'Back to home', saved: 'Saved', save: 'Save', platforms: 'Platforms', platform: 'Platform {name}', arrivals: 'Arrivals', allArrivals: 'All arrivals', collapse: 'Show less', open: 'Open', openPlatformHint: 'Open this platform to see its routes and live arrivals.' } }
const label = (key, values = {}) => (labels[busLanguage.value][key] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '')
const noticeTitle = (notice) => notice[busLanguage.value === 'en' ? 'title_en' : 'title_zh'] || notice.title_zh || notice.title_en
const noticeTime = (notice) => formatLocalDateTime(notice.starts_at)
const hasMoreArrivals = (state) => (state?.items?.length || 0) > closestArrivalsByRoute(state?.items || []).length
function togglePlatformArrivals(platformId) { expandedPlatforms.value = { ...expandedPlatforms.value, [platformId]: !expandedPlatforms.value[platformId] } }
function openPlatform(value) { if (typeof window !== 'undefined') window.location.assign(`${props.stopHref}${encodeURIComponent(value)}`) }
async function loadArrivals() { if (!stop.value) return; arrivalState.value = { loading: true, error: false, items: [] }; try { const result = await busApi.arrivals(stop.value.id); arrivalState.value = { loading: false, error: false, items: result.arrivals || [] } } catch { arrivalState.value = { loading: false, error: true, items: [] } } }
async function loadPlatformArrivals() { await Promise.all(otherPlatforms.value.map(async (item) => { platformArrivals.value = { ...platformArrivals.value, [item.id]: { loading: true, items: [] } }; try { const result = await busApi.arrivals(item.id); platformArrivals.value = { ...platformArrivals.value, [item.id]: { loading: false, items: result.arrivals || [] } } } catch { platformArrivals.value = { ...platformArrivals.value, [item.id]: { loading: false, error: true, items: [] } } } })) }
async function refresh() { refreshRemaining.value = 30; try { const noticesRequest = busApi.notices(); await Promise.all([loadArrivals(), loadPlatformArrivals()]); const noticeData = await noticesRequest; notices.value = Array.isArray(noticeData) ? noticeData : [] } catch { /* retain the last usable notices */ } }
async function load() { loading.value = true; error.value = ''; allArrivals.value = false; platformArrivals.value = {}; expandedPlatforms.value = {}; try { if (!id.value) throw new Error('Missing stop id'); const [stopData, stopsData, noticeData] = await Promise.all([publicApi(`/stops/${encodeURIComponent(id.value)}`), busApi.stops(), busApi.notices()]); stop.value = stopData; platforms.value = (Array.isArray(stopsData) ? stopsData : []).filter((item) => stopData.group_id ? item.group_id === stopData.group_id : item.id === stopData.id); if (!platforms.value.some((item) => item.id === stopData.id)) platforms.value.unshift(stopData); notices.value = Array.isArray(noticeData) ? noticeData : []; await loadArrivals(); await loadPlatformArrivals() } catch (reason) { error.value = reason.message || String(reason) } finally { loading.value = false } }
onMounted(() => { loadFavorites(); load(); refreshTimer = setInterval(() => { if (--refreshRemaining.value < 1) refresh() }, 1000) })
onBeforeUnmount(() => clearInterval(refreshTimer))
watch(id, (value, old) => { if (value && value !== old) load() })
defineExpose({ load, refresh, openPlatform })
</script>

<style scoped lang="scss">
.notices > .muted { margin: 1rem 0 0; }
.notices > details > .markdown { margin-top: 0; }
.notices summary { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .25rem .75rem; list-style: none; }
.notices summary::-webkit-details-marker { display: none; }
.notices summary > span::after { content: ' ▸'; color: #687386; }
.notices details[open] > summary > span::after { content: ' ▾'; }
.notices summary time { color: #687386; font-size: .8rem; font-weight: 400; white-space: nowrap; }
.bus-stop-detail { max-width: 900px; margin: 0 auto; color: var(--c-text, #243043); } .detail-head, .head-actions, .section-head { display: flex; align-items: center; gap: .75rem; } .detail-head, .section-head { justify-content: space-between; } .detail-head h1, .panel h3 { margin: 0; padding-top: 0; } .detail-head h1 { font-size: 1.4rem; line-height: 1.25; } .panel h3 { font-size: 1rem; line-height: 1.3; } p { margin-top: 0; } .eyebrow { margin-bottom: .2rem; color: #687386; font-size: .82rem; } .muted { color: #687386; } .head-actions { align-self: flex-start; } .plain-button { border: 1px solid #aec5dc; border-radius: .35rem; padding: .4rem .65rem; background: transparent; color: inherit; font: inherit; cursor: pointer; } .panel { margin: 1rem 0; padding: 1rem; border: 1px solid var(--c-border, #dce2ea); border-radius: .6rem; background: var(--c-bg-soft, #fff); } .status { display: flex; align-items: center; gap: .5rem; } .error { color: #a32727; } .spinner { width: 1em; height: 1em; border: 2px solid #b7c9dd; border-top-color: #2672bc; border-radius: 50%; animation: spin .8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } } .platforms div, .platform-actions { display: flex; flex-wrap: wrap; gap: .5rem; } .platforms button { border: 1px solid #cbd9e7; border-radius: 999px; padding: .45rem .8rem; background: transparent; color: inherit; font: inherit; cursor: pointer; } .platforms .active { border-color: #2878c8; background: #eaf3fc; color: #175f9f; font-weight: 700; } details + details { border-top: 1px solid #e7edf4; } summary { padding: .65rem 0; cursor: pointer; font-weight: 600; } .markdown { margin: 1rem 0 0; padding-bottom: .25rem; } .markdown :deep(p) { margin: 1rem 0 0; } .markdown :deep(:first-child) { margin-top: 0; } .markdown :deep(:last-child) { margin-bottom: 0; } .platform-services { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 1rem; } .platform-services .panel { min-width: 0; } @media (max-width: 620px) { .detail-head { align-items: flex-start; } .head-actions { flex-wrap: wrap; justify-content: flex-end; } .panel { margin: .75rem 0; } .platform-services { grid-template-columns: 1fr; } }
.plain-button { color: inherit; text-decoration: none; }
.bus-stop-detail { color: var(--bus-v2-text); }
.bus-stop-detail .eyebrow, .bus-stop-detail .muted, .bus-stop-detail .notices summary time, .bus-stop-detail .notices summary > span::after { color: var(--bus-v2-muted); }
.bus-stop-detail .panel { border-color: var(--bus-v2-border); background: var(--bus-v2-bg); }
.bus-stop-detail .plain-button, .bus-stop-detail .platforms button, .bus-stop-detail details + details { border-color: var(--bus-v2-border); }
.bus-stop-detail .platforms .active { background: var(--bus-v2-link-soft); color: var(--bus-v2-link); }
</style>

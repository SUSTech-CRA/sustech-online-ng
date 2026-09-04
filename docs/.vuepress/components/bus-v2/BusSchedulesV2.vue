<template>
  <main class="bus-schedules" :lang="language === 'zh' ? 'zh-CN' : 'en'">
    <div class="page-head"><div><h1>{{ text('全部时刻表', 'All schedules') }}</h1><p>{{ text('表中时间均为首站发车时间。', 'Times are departures from the terminus.') }}</p></div><button type="button" @click="setBusLanguage(language === 'zh' ? 'en' : 'zh')">{{ busText('language') }}</button></div>
    <div class="day-select" role="group" :aria-label="text('计划类型', 'Schedule type')"><button :class="{ active: dayType === 'WORKDAY' }" type="button" @click="load('WORKDAY')">{{ text('工作日', 'Workday') }}</button><button :class="{ active: dayType === 'HOLIDAY' }" type="button" @click="load('HOLIDAY')">{{ text('节假日', 'Holiday') }}</button></div>
    <div class="toolbar"><time>{{ nowText }}</time></div>
    <section v-if="loading" class="state">{{ busText('loading') }}</section><section v-else-if="error" class="state error" role="alert"><strong>{{ busText('loadFailed') }}</strong><span>{{ error }}</span><button type="button" @click="load(dayType)">{{ busText('retry') }}</button></section>
    <section v-else-if="!groups.length" class="state">{{ busText('empty') }}</section>
    <BusScheduleRowsV2 v-else :groups="groups" :language="language" />
    <p class="note">{{ text('“运行中”按线路预计运行时间加 20% 估算。', 'Running status uses the estimated route duration plus 20%.') }}</p>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { busApi } from './api.mjs'
import { groupSchedules } from './bus-v2-helpers.mjs'
import { busLanguage, busText, setBusLanguage } from './i18n.mjs'
import BusScheduleRowsV2 from './BusScheduleRowsV2.vue'

let routesCache = null, routesRequest
const loadRoutes = () => routesCache ? Promise.resolve(routesCache) : (routesRequest ||= busApi.routes().then((data) => routesCache = Array.isArray(data) ? data : []).finally(() => { routesRequest = undefined }))
const language = busLanguage; const schedules = ref([]); const routes = ref([]); const loading = ref(true); const error = ref(''); const dayType = ref('WORKDAY'); const now = ref(new Date()); let timer
const text = (zh, en) => language.value === 'zh' ? zh : en
const nowMinutes = computed(() => now.value.getHours() * 60 + now.value.getMinutes())
const nowText = computed(() => now.value.toLocaleTimeString(language.value === 'zh' ? 'zh-CN' : 'en', { hour: '2-digit', minute: '2-digit', hour12: false }))
const groups = computed(() => groupSchedules(schedules.value, nowMinutes.value, routes.value).map((item) => ({ ...item, color: item.route_color, routeName: item[language.value === 'zh' ? 'route_name_zh' : 'route_name_en'] || item.route_name_zh || item.route_name_en || item.route_id, directionName: item[language.value === 'zh' ? 'direction_name_zh' : 'direction_name_en'] || item.direction_name_zh || item.direction_name_en || item.route_direction_id })))
async function load(requestedDayType) { loading.value = true; error.value = ''; try { const [data, routeData] = await Promise.all([busApi.schedules(requestedDayType ? `day_type=${requestedDayType}` : ''), loadRoutes()]); schedules.value = Array.isArray(data) ? data : []; routes.value = routeData; dayType.value = schedules.value[0]?.day_type || requestedDayType || (new Date().getDay() % 6 ? 'WORKDAY' : 'HOLIDAY') } catch (reason) { error.value = reason.message || String(reason) } finally { loading.value = false } }
onMounted(() => { load(); timer = setInterval(() => { now.value = new Date() }, 30000) }); onBeforeUnmount(() => clearInterval(timer)); defineExpose({ load })
</script>

<style scoped lang="scss">
.bus-schedules { max-width: 1100px; margin: 0 auto; color: var(--c-text, #243043); }.page-head { display: flex; justify-content: space-between; gap: 1rem; }.page-head h1 { margin: 0; padding-top: 0; font-size: 1.4rem; line-height: 1.25; }.bus-schedules p { margin-top: 0; }.page-head p, .muted, .note { color: #667085; }.bus-schedules button { padding: .42rem .75rem; border: 1px solid #a9c2dc; background: transparent; color: inherit; font: inherit; cursor: pointer; }.page-head button { border-radius: .35rem; }.day-select { display: flex; margin: 1rem 0; }.day-select button { flex: 1; }.day-select button:first-child { border-radius: .4rem 0 0 .4rem; }.day-select button:last-child { border-radius: 0 .4rem .4rem 0; }.day-select .active { border-color: #1765ac; background: #1765ac; color: #fff; }.toolbar { display: flex; justify-content: flex-end; margin-bottom: 1rem; font-size: .86rem; }.toolbar time { font-family: ui-monospace, monospace; }.state { display: flex; align-items: center; gap: .5rem; padding: 1rem; border: 1px solid #d9e2ec; border-radius: .55rem; }.error { color: #b42318; }.note { margin-top: 1rem; font-size: .85rem; } @media (max-width: 600px) { .page-head { flex-direction: column; }.toolbar { justify-content: flex-start; } }
</style>

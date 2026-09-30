<template>
  <section class="bus-schedules" :lang="language === 'zh' ? 'zh-CN' : 'en'">
    <header class="section-title"><div class="schedule-title"><h3>{{ text('全部时刻表', 'All schedules') }}</h3><p class="schedule-note">{{ text('表中时间均为首站发车时间。', 'Times are departures from the terminus.') }}</p></div></header>
    <div class="day-select" role="group" :aria-label="text('计划类型', 'Schedule type')"><button :class="{ active: dayType === 'WORKDAY' }" type="button" @click="load('WORKDAY')">{{ text('工作日', 'Workday') }}</button><button :class="{ active: dayType === 'HOLIDAY' }" type="button" @click="load('HOLIDAY')">{{ text('节假日', 'Holiday') }}</button></div>
    <section v-if="loading && !groups.length" class="state">{{ busText('loading') }}</section>
    <section v-if="error" class="state error" role="alert"><strong>{{ busText('loadFailed') }}</strong><span>{{ error }}</span><button type="button" @click="load(retryDayType)">{{ busText('retry') }}</button></section>
    <section v-if="!loading && !error && !groups.length" class="state">{{ busText('empty') }}</section>
    <BusScheduleRowsV2 v-if="groups.length" :groups="groups" :language="language" />
    <p class="note">{{ text('“运行中”按线路预计运行时间加 20% 估算。', 'Running status uses the estimated route duration plus 20%.') }}</p>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { busApi } from './api.mjs'
import { groupSchedules } from './bus-v2-helpers.mjs'
import { busLanguage, busText } from './i18n.mjs'
import BusScheduleRowsV2 from './BusScheduleRowsV2.vue'

let routesCache = null, routesRequest, scheduleRequest = 0
const loadRoutes = () => routesCache ? Promise.resolve(routesCache) : (routesRequest ||= busApi.routes().then((data) => routesCache = Array.isArray(data) ? data : []).finally(() => { routesRequest = undefined }))
const language = busLanguage; const schedules = ref([]); const routes = ref([]); const loading = ref(true); const error = ref(''); const dayType = ref('WORKDAY'); const retryDayType = ref(''); const now = ref(new Date())
const text = (zh, en) => language.value === 'zh' ? zh : en
const nowMinutes = computed(() => now.value.getHours() * 60 + now.value.getMinutes())
const groups = computed(() => groupSchedules(schedules.value, nowMinutes.value, routes.value).map((item) => ({ ...item, color: item.route_color, routeName: item[language.value === 'zh' ? 'route_name_zh' : 'route_name_en'] || item.route_name_zh || item.route_name_en || item.route_id, directionName: item[language.value === 'zh' ? 'direction_name_zh' : 'direction_name_en'] || item.direction_name_zh || item.direction_name_en || item.route_direction_id })))
async function load(requestedDayType) {
  const request = ++scheduleRequest
  retryDayType.value = requestedDayType || ''
  if (requestedDayType) dayType.value = requestedDayType
  loading.value = true
  error.value = ''
  schedules.value = []
  try {
    const [data, routeData] = await Promise.all([busApi.schedules(requestedDayType ? `day_type=${requestedDayType}` : ''), loadRoutes()])
    if (request !== scheduleRequest) return
    schedules.value = Array.isArray(data) ? data : []
    routes.value = routeData
    dayType.value = schedules.value[0]?.day_type || requestedDayType || (new Date().getDay() % 6 ? 'WORKDAY' : 'HOLIDAY')
  } catch (reason) {
    if (request === scheduleRequest) error.value = reason.message || String(reason)
  } finally {
    if (request === scheduleRequest) loading.value = false
  }
}
onMounted(load); defineExpose({ load })
</script>

<style scoped lang="scss">
.bus-schedules { max-width: 1100px; margin: 0 auto; color: var(--c-text, #243043); }.section-title { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }.schedule-title { display: flex; flex-wrap: wrap; align-items: baseline; gap: .5rem; }.section-title h3 { margin: 0; padding-top: 0; font-size: 1rem; line-height: 1.3; }.bus-schedules p { margin-top: 0; }.schedule-note, .muted, .note { color: #667085; }.schedule-note { margin-top: 0 !important; margin-bottom: 0; font-size: .875rem; font-weight: 400; white-space: nowrap; }.bus-schedules button { padding: .42rem .75rem; border: 1px solid #a9c2dc; background: transparent; color: inherit; font: inherit; cursor: pointer; }.day-select { display: flex; margin: 1rem 0; }.day-select button { flex: 1; }.day-select button:first-child { border-radius: .4rem 0 0 .4rem; }.day-select button:last-child { border-radius: 0 .4rem .4rem 0; }.day-select .active { border-color: #1765ac; background: #1765ac; color: #fff; }.toolbar { display: flex; justify-content: flex-end; margin-bottom: 1rem; font-size: .86rem; }.toolbar time { font-family: ui-monospace, monospace; }.state { display: flex; align-items: center; gap: .5rem; padding: 1rem; border: 1px solid #d9e2ec; border-radius: .55rem; }.error { color: #b42318; }.note { margin-top: 1rem; font-size: .85rem; } @media (max-width: 600px) { .section-title { align-items: flex-start; flex-direction: column; } .toolbar { justify-content: flex-start; } }
.bus-schedules { color: var(--bus-v2-text); }
.bus-schedules .schedule-note, .bus-schedules .muted, .bus-schedules .note { color: var(--bus-v2-muted); }
.bus-schedules button, .bus-schedules .state { border-color: var(--bus-v2-border); }
.bus-schedules .day-select .active { border-color: var(--bus-v2-link); background: var(--bus-v2-link); color: var(--vp-c-accent-text); }
.bus-schedules .state { background: var(--bus-v2-bg); }
</style>

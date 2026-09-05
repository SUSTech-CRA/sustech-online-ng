<template>
  <div class="schedule-toolbar">
    <div class="schedule-legend" :aria-label="text('时刻表图例', 'Schedule legend')">
      <span><i class="swatch bus" />{{ text('巴士', 'Bus') }}</span><span><i class="swatch shuttle" />{{ text('电瓶车', 'EV Shuttle') }}</span><span><b class="time bus next">07:20</b>{{ text('下一班', 'Next') }}</span><span><b class="time bus running">07:10</b>{{ text('运行中', 'Running') }}</span>
    </div>
    <label class="schedule-filter"><input v-model="activeOnly" type="checkbox"> {{ text('仅显示运行中/待发车', 'Only running/upcoming') }}</label>
  </div>
  <div class="schedule-list">
    <article v-for="group in groups" :key="group.key" class="schedule-row">
      <div class="route-info" :style="{ borderColor: group.color || '#2878c8' }">
        <strong>{{ group.routeName }}</strong><span>{{ group.directionName }}</span><small>{{ serviceLabel(group) }}</small>
      </div>
      <div class="times">
        <span v-for="item in visibleTimes(group.times)" :key="`${item.time}-${item.vehicleType}`" :class="['time', item.status, item.vehicleType?.toLowerCase()]">{{ item.time }}</span>
        <span v-if="!visibleTimes(group.times).length" class="muted">{{ text('无运行中或待发车班次', 'No running or upcoming trips') }}</span>
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ groups: { type: Array, default: () => [] }, language: { type: String, default: 'zh' } })
const activeOnly = ref(false)
const text = (zh, en) => props.language === 'zh' ? zh : en
const serviceLabel = (group) => [group.serviceType && group.serviceType !== 'NORMAL' ? group.serviceType : '', group.vehicleTypes?.join(' / ')].filter(Boolean).join(' · ') || text('常规服务', 'Normal service')
const visibleTimes = (times) => activeOnly.value ? times.filter((item) => item.status !== 'past') : times
</script>

<style scoped lang="scss">
.schedule-toolbar { display: flex; flex-wrap: wrap; gap: .55rem 1rem; align-items: center; justify-content: space-between; margin-bottom: .7rem; font-size: .84rem; }.schedule-legend { display: flex; flex-wrap: wrap; gap: .55rem 1rem; align-items: center; }.schedule-legend > span { display: inline-flex; align-items: center; gap: .3rem; }.schedule-filter { cursor: pointer; white-space: nowrap; }.swatch { width: .72rem; height: .72rem; border-radius: 50%; }.swatch.bus { background: #ed6c00; }.swatch.shuttle { background: #00bcd4; }.schedule-list { overflow: hidden; border: 1px solid #d9e2ec; border-radius: .6rem; container-type: inline-size; }.schedule-row { display: flex; flex-wrap: wrap; border-bottom: 1px solid #e7edf4; }.schedule-row:last-child { border: 0; }.route-info { box-sizing: border-box; display: flex; min-width: 8rem; flex: 1 1 9rem; flex-direction: column; justify-content: center; gap: .2rem; padding: .75rem; border-left: .4rem solid; background: var(--c-bg-soft, #f8fafc); }.route-info small, .muted { color: #667085; }.times { box-sizing: border-box; display: flex; min-width: 8rem; flex: 999 1 8rem; flex-wrap: wrap; align-content: flex-start; gap: .45rem; padding: .75rem; }.time { --vehicle-color: #ed6c00; padding: .13rem .38rem; border-radius: .25rem; color: var(--vehicle-color); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }.time.shuttle { --vehicle-color: #00bcd4; }.time.running { border: 1px solid var(--vehicle-color); background: color-mix(in srgb, var(--vehicle-color) 10%, transparent); }.time.next { background: var(--vehicle-color); color: #fff; font-weight: 700; }.time.past { opacity: .35; }
@container (max-width: 24rem) { .schedule-row { flex-direction: column; }.route-info { width: 100%; min-width: 0; flex: none; flex-direction: row; flex-wrap: wrap; align-items: baseline; justify-content: flex-start; border-left: 0; border-top: .35rem solid; padding: .5rem; }.times { width: 100%; min-width: 0; flex: none; } }
.schedule-list { border-color: var(--bus-v2-border); background: var(--bus-v2-bg); color: var(--bus-v2-text); }
.schedule-row { border-color: var(--bus-v2-border); }
.route-info { background: var(--bus-v2-bg-alt); }
.route-info small, .muted { color: var(--bus-v2-muted); }
</style>

<template>
  <p v-if="props.state?.loading" class="muted">{{ busText('loading') }}</p>
  <p v-else-if="props.state?.error" class="muted">{{ busText('unavailable') }}</p>
  <p v-else-if="!items.length" class="muted">{{ busText('empty') }}</p>
  <ul v-else class="arrival-list"><li v-for="arrival in items" :key="arrivalKey(arrival)"><i :style="{ background: arrival.route_color || '#2878c8' }" /><a :href="routeDirectionHref(arrival)"><strong>{{ routeName(arrival) }}</strong><small>{{ directionName(arrival) }}</small></a><span>{{ arrivalText(arrival) }}<small v-if="arrivalMeta(arrival)">{{ arrivalMeta(arrival) }}</small></span><img v-if="showVehicleIcon(arrival)" :src="vehicleIcon(arrival)" :alt="vehicleLabel(arrival)"></li></ul>
</template>

<script setup>
import { computed } from 'vue'
import { closestArrivalsByRoute, realtimeArrivalText, unavailableReasonTextKey } from './core.mjs'
import { busLanguage, busText } from './i18n.mjs'

const props = defineProps({ state: { type: Object, default: () => ({}) }, collapsed: Boolean, routeHref: { type: String, default: '/transport/bustimer_v2_route.html?id=' } })
const items = computed(() => props.collapsed ? closestArrivalsByRoute(props.state?.items || []) : props.state?.items || [])
const routeName = (item) => item[busLanguage.value === 'en' ? 'route_name_en' : 'route_name_zh'] || item.route_name_zh || item.route_name_en || ''
const directionName = (item) => item[busLanguage.value === 'en' ? 'direction_name_en' : 'direction_name_zh'] || item.direction_name_zh || item.direction_name_en || ''
const arrivalKey = (item) => `${item.route_direction_id}-${item.trip_id || item.planned_arrival_at || item.updated_at || item.eta_minutes}`
const routeDirectionHref = (item) => `${props.routeHref}${encodeURIComponent(item.route_id)}&direction=${encodeURIComponent(item.route_direction_id)}`
const vehicleIcon = (item) => String(item.vehicle_type).toUpperCase() === 'SHUTTLE' ? '/sev.png' : '/bus.png'
const vehicleLabel = (item) => String(item.vehicle_type).toUpperCase() === 'SHUTTLE' ? (busLanguage.value === 'zh' ? '电瓶车' : 'EV Shuttle') : (busLanguage.value === 'zh' ? '巴士' : 'Bus')
const showVehicleIcon = (item) => !['LAST_SERVICE_PASSED', 'NOT_OPERATING'].includes(String(item.unavailable_reason).toUpperCase())
function time(value) { return value ? new Date(value).toLocaleTimeString(busLanguage.value === 'zh' ? 'zh-CN' : 'en', { hour: '2-digit', minute: '2-digit', hour12: false }) : '' }
function arrivalText(item) { return item.source === 'real_time' ? [realtimeArrivalText(item, busLanguage.value), arrivalDistance(item)].filter(Boolean).join(' ') : item.source === 'planned' ? busText('planAt', { time: time(item.planned_arrival_at) }) : busText(unavailableReasonTextKey(item.unavailable_reason)) }
function arrivalDistance(item) { const meters = Number(item.distance ?? item.distance_to_stop ?? item.distance_to_next_stop ?? item.distance_meters); return Number.isFinite(meters) ? `${Math.round(meters)}m` : '' }
function arrivalMeta(item) { return item.source === 'real_time' ? `${busLanguage.value === 'zh' ? '实时预测' : 'Real-time prediction'}${item.updated_at ? ` · ${busText('updated', { time: time(item.updated_at) })}` : ''}` : item.source === 'planned' ? (busLanguage.value === 'zh' ? '计划时间' : 'Scheduled time') : item.updated_at ? busText('updated', { time: time(item.updated_at) }) : '' }
</script>

<style scoped>
.muted { color: var(--bus-v2-muted); }
.arrival-list { margin: .5rem 0 0; padding: 0; list-style: none; }
.arrival-list li { display: grid; grid-template-columns: .35rem minmax(0, 1fr) auto 1rem; gap: .5rem; align-items: center; padding: .6rem 0; border-top: 1px solid var(--bus-v2-border); }
.arrival-list i { width: .3rem; align-self: stretch; border-radius: 2px; }
.arrival-list a { display: grid; gap: .15rem; color: var(--bus-v2-link); text-decoration: none; }
.arrival-list a:hover, .arrival-list a:focus-visible { text-decoration: underline; }
.arrival-list small { color: var(--bus-v2-muted); }
.arrival-list span { display: grid; justify-items: end; gap: .15rem; text-align: right; }
.arrival-list img { box-sizing: border-box; width: 1rem; height: 1rem; padding: 1px; border-radius: 50%; background: #fff; }
</style>

<template>
  <section class="bus-vehicles" :lang="language === 'zh' ? 'zh-CN' : 'en'">
    <header><h3>{{ busText('liveVehicles') }}</h3><label class="all-vehicles"><input :checked="props.showAllVehicles" type="checkbox" @change="emit('update:showAllVehicles', $event.target.checked)"> {{ busText('includeInactive') }}</label></header>
    <p v-if="props.loading" class="state muted">{{ busText('loading') }}</p>
    <p v-else-if="props.error" class="state error" role="alert">{{ busText('unavailable') }}</p>
    <template v-else>
      <div class="map-head"><time v-if="lastUpdated">{{ busText('updatedPrefix') }} {{ lastUpdated }}</time></div>
      <BusMapV2 :routes="props.routes" :vehicles="props.vehicles" :stops="props.stops" :language="language" neutral />
      <p v-if="!props.vehicles.length" class="state muted">{{ busText('noLiveVehicles') }}</p>
    </template>
  </section>
</template>

<script setup>
import { formatBusDateTime } from './core.mjs'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BusMapV2 from './BusMapV2.vue'
import { busLanguage, busText } from './i18n.mjs'

const props = defineProps({ routes: { type: Array, default: () => [] }, stops: { type: Array, default: () => [] }, vehicles: { type: Array, default: () => [] }, loading: Boolean, error: Boolean, showAllVehicles: Boolean })
const emit = defineEmits(['update:showAllVehicles'])
const language = busLanguage
const now = ref(Date.now())
let clock
const lastUpdated = computed(() => {
  const times = props.vehicles.map((vehicle) => vehicle.source_updated_at || vehicle.received_at).filter(Boolean).map(Date.parse).filter(Number.isFinite)
  if (!times.length) return ''
  const latest = Math.max(...times), age = Math.max(0, Math.floor((now.value - latest) / 1000))
  if (age <= 120) return busText('secondsAgo', { seconds: age })
  return formatBusDateTime(latest, language.value)
})
onMounted(() => { clock = setInterval(() => { now.value = Date.now() }, 1000) })
onBeforeUnmount(() => clearInterval(clock))
</script>

<style scoped lang="scss">
.notices > .muted { margin: 1rem 0 0; }
.notices > details > .markdown { margin-top: 0; }
.notices summary { list-style: none; }
.notices summary::-webkit-details-marker { display: none; }
.notices summary > span::after { content: ' ▸'; color: #667085; }
.notices details[open] > summary > span::after { content: ' ▾'; }
.bus-vehicles { max-width: 1100px; margin: 0 auto; color: var(--c-text, #243043); }.bus-vehicles.embedded { max-width: none; margin: 1rem 0 0; }.bus-vehicles header, .map-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }.bus-vehicles header h1, .bus-vehicles header h3, .notices h3 { margin: 0; padding-top: 0; }.bus-vehicles header h1 { font-size: 1.4rem; line-height: 1.25; }.bus-vehicles header h3, .notices h3 { font-size: 1rem; line-height: 1.3; }.bus-vehicles p { margin-top: 0; }.bus-vehicles header p, .muted { color: #667085; }.all-vehicles { display: flex; align-items: center; gap: .35rem; font-size: .85rem; white-space: nowrap; }.all-vehicles input { margin: 0; }.bus-vehicles button { padding: .4rem .65rem; border: 1px solid #a9c2dc; border-radius: .35rem; background: transparent; color: inherit; font: inherit; cursor: pointer; }.state, .notices { margin: 1rem 0; padding: .85rem 1rem; border: 1px solid #d9e2ec; border-radius: .55rem; background: var(--c-bg-soft, #fff); }.state { display: flex; gap: .5rem; align-items: center; }.error { color: #b42318; }.notices details + details { border-top: 1px solid #e6ebf0; }.notices summary { padding: .6rem 0; cursor: pointer; font-weight: 600; }.notices small { color: #667085; font-weight: 400; }.notices .markdown { margin: 1rem 0 0; padding-bottom: .6rem; }.notices .markdown :deep(p) { margin: 1rem 0 0; }.notices .markdown :deep(:first-child) { margin-top: 0; }.notices .markdown :deep(:last-child) { margin-bottom: 0; }.map-head { margin: 1rem 0 .5rem; }.map-head time { color: #667085; font-size: .85rem; } @media (max-width: 600px) { .bus-vehicles header, .map-head { align-items: flex-start; flex-direction: column; } }
.bus-vehicles { color: var(--bus-v2-text); }
.bus-vehicles header p, .bus-vehicles .muted, .bus-vehicles .notices small, .bus-vehicles .map-head time, .bus-vehicles .notices summary > span::after { color: var(--bus-v2-muted); }
.bus-vehicles button, .bus-vehicles .state, .bus-vehicles .notices { border-color: var(--bus-v2-border); }
.bus-vehicles .state, .bus-vehicles .notices { background: var(--bus-v2-bg); }
.bus-vehicles .notices details + details { border-color: var(--bus-v2-border); }
</style>

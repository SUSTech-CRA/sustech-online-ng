<template>
  <div class="vehicle-legend" :aria-label="language === 'zh' ? '车型图例' : 'Vehicle legend'">
    <span><i v-if="textMarkers" class="vehicle-legend__marker" :style="{ color: vehicleTextColor('BUS') }" aria-hidden="true">1</i><img v-else src="/bus.png" alt="">{{ language === 'zh' ? '巴士' : 'Bus' }}</span>
    <span><i v-if="textMarkers" class="vehicle-legend__marker shuttle" :style="{ color: vehicleTextColor('SHUTTLE') }" aria-hidden="true">1</i><img v-else src="/sev.png" alt="">{{ language === 'zh' ? '电瓶车' : 'EV Shuttle' }}</span>
  </div>
</template>

<script setup>
import { vehicleTextColor } from './core.mjs'
defineProps({ language: { type: String, default: 'zh' }, textMarkers: Boolean })
</script>

<style scoped>
.vehicle-legend { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: .5rem; color: var(--bus-v2-muted); font-size: .82rem; }.vehicle-legend span { display: inline-flex; align-items: center; gap: .25rem; white-space: nowrap; }
.vehicle-legend img { box-sizing: border-box; width: 1rem; height: 1rem; padding: 1px; border-radius: 50%; background: #fff; }
.vehicle-legend__marker { display: inline-flex; align-items: center; justify-content: center; width: 1.25rem; height: 1.25rem; border-radius: 50%; background: var(--bus-v2-bus-fill); font: 700 .75rem/1 "Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", sans-serif; }
.vehicle-legend__marker.shuttle { background: var(--bus-v2-shuttle-fill); }
</style>

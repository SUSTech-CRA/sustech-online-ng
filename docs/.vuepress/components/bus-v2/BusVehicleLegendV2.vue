<template>
  <div class="vehicle-legend" :aria-label="busText('vehicleLegend', {}, language)">
    <span><i v-if="textMarkers" class="vehicle-legend__marker" :style="{ color: vehicleTextColor('BUS') }" aria-hidden="true">1</i><BusVehicleIconV2 v-else type="BUS" aria-hidden="true" />{{ busText('bus', {}, language) }}</span>
    <span><i v-if="textMarkers" class="vehicle-legend__marker shuttle" :style="{ color: vehicleTextColor('SHUTTLE') }" aria-hidden="true">1</i><BusVehicleIconV2 v-else type="SHUTTLE" aria-hidden="true" />{{ busText('shuttle', {}, language) }}</span>
  </div>
</template>

<script setup>
import { busText } from './i18n.mjs'
import BusVehicleIconV2 from './BusVehicleIconV2.vue'
import { vehicleTextColor } from './core.mjs'
defineProps({ language: { type: String, default: 'zh' }, textMarkers: Boolean })
</script>

<style scoped>
.vehicle-legend { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: .5rem; color: var(--bus-v2-muted); font-size: .82rem; }.vehicle-legend span { display: inline-flex; align-items: center; gap: .25rem; white-space: nowrap; }
.vehicle-legend__marker { display: inline-flex; align-items: center; justify-content: center; width: 1.25rem; height: 1.25rem; border-radius: 50%; background: var(--bus-v2-bus-fill); font: 700 .75rem/1 "Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", sans-serif; }
.vehicle-legend__marker.shuttle { background: var(--bus-v2-shuttle-fill); }
</style>

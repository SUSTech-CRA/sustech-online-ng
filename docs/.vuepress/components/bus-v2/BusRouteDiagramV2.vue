<template>
  <section class="route-diagram">
    <h3>{{ busText('campusDiagram') }}</h3>
    <div class="legend">
      <span><i :style="{ background: diagramColors.local }" />1 / 2</span>
      <span><i :style="{ background: diagramColors.express }" />K1 / K2</span>
      <span><b class="triangle" />{{ busText('bus') }}</span>
      <span><b class="triangle shuttle" />{{ busText('shuttle') }}</span>
    </div>
    <p class="hint">{{ busText('diagramHint') }}</p>
    <p v-if="loading || error" class="hint" role="status">{{ loading ? busText('loading') : busText('unavailable') }}</p>
    <div class="diagram-scroll">
      <svg viewBox="0 0 640 824" class="diagram" :aria-label="busText('diagramLabel')">
        <path d="M260 40 V744 A60 60 0 0 0 380 744 V40" :stroke="diagramColors.local" class="route" />
        <path d="M295 40 V744 A25 25 0 0 0 345 744 V40" :stroke="diagramColors.express" class="route" />
        <path v-for="y in [40, 104, 232, 296]" :key="y" :d="`M295 ${y} H345`" class="connection" />
        <g v-for="stop in stationLinks" :key="`${stop.key}-${stop.side}`" class="stop-button" role="button" :tabindex="stop.id ? 0 : -1" :aria-disabled="!stop.id" :aria-label="stopLabel(stop)" @click="selectStop(stop)" @keydown.enter.prevent="selectStop(stop)" @keydown.space.prevent="selectStop(stop)">
          <title>{{ stopLabel(stop) }}</title>
          <rect :x="stop.side === 'left' ? 0 : 330" :y="stop.y - 23" width="310" height="46" rx="8" class="hit-area" />
          <path v-if="stop.kind === 'tick'" :d="`M${stop.side === 'left' ? 246 : 366} ${stop.y} h14`" :stroke="diagramColors.local" stroke-width="8" class="station-tick" />
          <rect v-else-if="stop.kind === 'shared'" :x="stop.side === 'left' ? 250 : 335" :y="stop.y - 10" width="55" height="20" rx="10" class="station shared" />
          <circle v-else :cx="stop.kind === 'express' ? 295 : stop.side === 'left' ? 260 : 380" :cy="stop.y" r="10" class="station" :stroke="diagramColors[stop.kind]" />
          <text :x="stop.side === 'left' ? 225 : 415" :y="stop.y + 6" :text-anchor="stop.side === 'left' ? 'end' : 'start'" :class="{ english: language === 'en' }">
            <tspan v-for="(line, index) in nameLines(stop)" :key="index" :x="stop.side === 'left' ? 225 : 415" :dy="index ? 26 : nameLines(stop).length > 1 ? -13 : 0">{{ line }}</tspan>
          </text>
        </g>
        <g v-for="marker in markers" :key="marker.vehicle.id" :transform="`translate(${marker.x} ${marker.y})`" role="img" :aria-label="marker.label" tabindex="0">
          <title>{{ marker.label }}</title>
          <path d="M0 -9 L8 9 L-8 9 Z" :transform="`rotate(${marker.angle}) scale(1.5)`" class="vehicle" :class="{ shuttle: marker.vehicle.vehicle_type === 'SHUTTLE' }" />
        </g>
      </svg>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { busLanguage as language, busText } from './i18n.mjs'
import { displayName, vehicleLocationText } from './core.mjs'
import { diagramColors, diagramStops, diagramStop, diagramVehicle } from './route-diagram.mjs'
const props = defineProps({ routes: Array, stops: Array, vehicles: Array, loading: Boolean, error: Boolean })
const emit = defineEmits(['select-stop'])
const selectStop = stop => { if (stop.id) emit('select-stop', stop.id) }
const stationLinks = computed(() => diagramStops.map(stop => {
  let id
  for (const route of props.routes) {
    for (const direction of route.directions || []) {
      const match = direction.stops?.find(item => diagramStop(item, route.id) === stop)
      if (match) { id = match.id; break }
    }
    if (id) break
  }
  return { ...stop, id }
}))
const stopLabel = stop => `${language.value === 'zh' ? stop.zh : stop.en}${stop.kind === 'tick' ? busText('oneWayStop') : ''}`
const nameLines = stop => {
  if (language.value === 'zh') return [stop.zh]
  const words = stop.en.split(' '), lines = ['']
  for (const word of words) {
    if (`${lines.at(-1)} ${word}`.trim().length > 18) lines.push(word)
    else lines[lines.length - 1] = `${lines.at(-1)} ${word}`.trim()
  }
  return lines
}
const markers = computed(() => props.error || props.loading ? [] : props.vehicles.flatMap(vehicle => {
  const point = diagramVehicle(vehicle, props.routes)
  const route = props.routes.find(route => route.id === vehicle.route_id)
  return point ? [{ ...point, vehicle, label: [displayName(vehicle, language.value), displayName(route, language.value), vehicleLocationText(vehicle, route, props.stops, language.value)].filter(Boolean).join(' · ') }] : []
}))
</script>

<style scoped>
h3 { margin: 0; padding: 0; font-size: 1rem; }
.legend { display: flex; flex-wrap: wrap; gap: .6rem 1rem; margin-top: .75rem; font-size: .85rem; }
.legend span { display: inline-flex; align-items: center; gap: .35rem; }
.legend i { width: 1.25rem; height: 5px; border-radius: 3px; }
.triangle { width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 11px solid var(--bus-v2-bus-fill); }
.triangle.shuttle { border-bottom-color: var(--bus-v2-shuttle-fill); }
.hint { color: var(--bus-v2-muted); font-size: .8rem; margin: .6rem 0; }
.diagram-scroll { overflow-x: auto; }
.diagram { display: block; width: 100%; min-width: 0; max-width: 640px; margin: auto; }
.route { fill: none; stroke-width: 7; }
.route, .connection, .station, .station-tick { opacity: .8; }
.connection { stroke: var(--bus-v2-text); stroke-width: 3; stroke-dasharray: 2 3; }
.station { fill: var(--bus-v2-bg); stroke-width: 4; }
.shared { stroke: var(--bus-v2-text); }
.hit-area { fill: transparent; }
.stop-button { color: var(--bus-v2-text); text-decoration: none; }
.stop-button[tabindex="0"] { cursor: pointer; }
.stop-button[tabindex="0"]:hover .hit-area, .stop-button:focus-visible .hit-area { fill: var(--bus-v2-link-soft); }
.stop-button:focus-visible { outline: none; }
text { fill: currentColor; font-size: 30px; font-weight: 500; }
text.english { font-size: 24px; }
.vehicle { fill: var(--bus-v2-bus-fill); stroke: #925a00; stroke-width: 2.5; stroke-linejoin: round; }
.vehicle.shuttle { fill: var(--bus-v2-shuttle-fill); stroke: #28633f; }
</style>

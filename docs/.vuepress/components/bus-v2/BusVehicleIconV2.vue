<template>
  <svg class="bus-vehicle-icon" :class="{ shuttle: String(type).toUpperCase() === 'SHUTTLE' }" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7.5" /></svg>
</template>

<script setup>
defineProps({ type: String })
</script>

<style scoped>
.bus-vehicle-icon { display: inline-block; flex-shrink: 0; width: .5rem; height: .5rem; fill: var(--bus-v2-bus-fill); stroke: #925a00; }
.bus-vehicle-icon.shuttle { fill: var(--bus-v2-shuttle-fill); stroke: #28633f; }
</style>

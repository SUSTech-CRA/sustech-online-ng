<template>
  <div class="vehicle-legend" :aria-label="language === 'zh' ? '车型图例' : 'Vehicle legend'">
    <span><img src="/bus.png" alt="">{{ language === 'zh' ? '巴士' : 'Bus' }}</span>
    <span><img src="/sev.png" alt="">{{ language === 'zh' ? '电瓶车' : 'EV Shuttle' }}</span>
  </div>
</template>

<script setup>
defineProps({ language: { type: String, default: 'zh' } })
</script>

<style scoped>
.vehicle-legend { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: .5rem; color: var(--bus-v2-muted); font-size: .82rem; }.vehicle-legend span { display: inline-flex; align-items: center; gap: .25rem; white-space: nowrap; }.vehicle-legend img { box-sizing: border-box; width: 1rem; height: 1rem; padding: 1px; border-radius: 50%; background: #fff; }
</style>

<template>
  <button class="bus-refresh-button" type="button" :aria-label="label" :title="label" @click="handleClick">
    <svg viewBox="0 0 40 40" aria-hidden="true" class="bus-refresh-button__progress"><circle class="track" cx="20" cy="20" r="18" /><circle class="value" cx="20" cy="20" r="18" :style="{ strokeDashoffset: 113.1 * (1 - remaining / total) }" /></svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
  </button>
</template>
<script setup>
const props = defineProps({ remaining: { type: Number, default: 10 }, total: { type: Number, default: 10 }, label: { type: String, default: 'Refresh' }, reload: Boolean })
const emit = defineEmits(['refresh'])
function handleClick() { if (props.reload && typeof window !== 'undefined') window.location.reload(); else emit('refresh') }
</script>
<style scoped>
.bus-refresh-button { position: fixed; right: 1rem; bottom: calc(4rem + 48px + .75rem); z-index: 20; display: grid; place-items: center; width: 3rem; height: 3rem; padding: 0; border: 0; border-radius: 50%; background: var(--bus-v2-bg, #fff); color: var(--bus-v2-link, #2878c8); box-shadow: 0 2px 10px #0003; cursor: pointer; }
.bus-refresh-button__progress { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); pointer-events: none; }
circle { fill: none; stroke-width: 2; } .track { stroke: var(--bus-v2-border, #d9e2ec); } .value { stroke: currentColor; stroke-dasharray: 113.1; transition: stroke-dashoffset .2s linear; }
@media (max-width: 959px) { .bus-refresh-button { right: 1rem; bottom: calc(4rem + 38.4px + .75rem + env(safe-area-inset-bottom)); } }
</style>

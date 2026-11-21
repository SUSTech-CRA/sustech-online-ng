<template>
  <div v-if="open" class="popup-layer">
    <div class="popup-backdrop" @click="emit('close')" />
    <section class="popup" role="dialog" :aria-label="title">
      <div class="popup__head">
        <h3>{{ title }}</h3>
        <button class="popup__close" type="button" :aria-label="busText('closeDialog')" @click="emit('close')">×</button>
      </div>
      <div class="popup__body"><slot /></div>
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { busText } from './i18n.mjs'

defineProps({ open: Boolean, title: String })
const emit = defineEmits(['close'])
const onKeydown = (event) => { if (event.key === 'Escape') emit('close') }
onMounted(() => { if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('keydown', onKeydown) })
onBeforeUnmount(() => { if (typeof window !== 'undefined' && window.removeEventListener) window.removeEventListener('keydown', onKeydown) })
</script>

<style scoped lang="scss">
.popup-layer { position: relative; z-index: 40; }
.popup-backdrop { position: fixed; inset: 0; }
.popup { position: absolute; z-index: 1; top: 0; right: 0; display: flex; flex-direction: column; width: min(26rem, calc(100vw - 2rem)); max-height: min(70vh, 32rem); margin: 0; padding: 1rem; border: 1px solid var(--bus-v2-border); border-radius: .6rem; background: var(--bus-v2-bg); box-shadow: 0 .75rem 2rem var(--vp-c-shadow); }
.popup__head { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding-bottom: .6rem; border-bottom: 1px solid var(--bus-v2-border); }
.popup__head h3 { margin: 0; padding-top: 0; font-size: 1rem; line-height: 1.3; }
.popup__close { padding: 0 .25rem; border: 0; background: transparent; color: var(--bus-v2-muted); font-size: 1.4rem; line-height: 1; cursor: pointer; }
.popup__body { min-height: 0; overflow-y: auto; }
@media (max-width: 720px) {
  .popup-backdrop { background: rgba(0, 0, 0, .35); }
  .popup { position: fixed; top: auto; right: 0; bottom: 0; left: 0; width: auto; max-height: 75vh; border-radius: .9rem .9rem 0 0; padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px)); }
}
</style>
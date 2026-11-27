<template>
  <div v-if="open" class="popup-layer">
    <div class="popup-backdrop" @click="emit('close')" />
    <section ref="dialog" class="popup" role="dialog" aria-modal="true" :aria-label="title">
      <div class="popup__head">
        <h3>{{ title }}</h3>
        <button ref="closeButton" class="popup__close" type="button" :aria-label="busText('closeDialog')" @click="emit('close')">×</button>
      </div>
      <div class="popup__body"><slot /></div>
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { busText } from './i18n.mjs'

const props = defineProps({ open: Boolean, title: String })
const emit = defineEmits(['close'])
const dialog = ref(null)
const closeButton = ref(null)
let previousFocus

function focusDialog() {
  if (props.open && dialog.value && !dialog.value.contains(document.activeElement)) {
    closeButton.value?.focus({ preventScroll: true })
  }
}

function enterDialog() {
  previousFocus = document.activeElement
  focusDialog()
}

function restoreFocus() {
  if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
  previousFocus = undefined
}

function onKeydown(event) {
  if (!dialog.value || event.defaultPrevented) return
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key !== 'Tab') return

  const focusable = [...dialog.value.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex]')].filter(element => {
    if (element.tabIndex < 0 && !element.matches('summary:not([tabindex])')) return false
    if (element.matches(':disabled') || !element.getClientRects().length) return false
    // A collapsed details element exposes only its summary to keyboard navigation.
    const collapsed = element.closest('details:not([open])')
    return !collapsed || collapsed.firstElementChild === element
  })
  const first = focusable[0]
  const last = focusable.at(-1)
  const active = document.activeElement
  if (!focusable.includes(active) || active === (event.shiftKey ? first : last)) {
    event.preventDefault()
    const target = event.shiftKey ? last : first
    target?.focus()
  }
}

watch(() => props.open, open => {
  if (open) enterDialog()
  else restoreFocus()
}, { flush: 'post' })
watch(() => props.title, focusDialog, { flush: 'post' })

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('focusin', focusDialog)
  if (props.open) enterDialog()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('focusin', focusDialog)
  restoreFocus()
})
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

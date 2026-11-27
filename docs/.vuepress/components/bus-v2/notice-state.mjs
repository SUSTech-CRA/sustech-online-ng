import { ref, watch } from 'vue'

export const NOTICE_OPEN_STATE_KEY = 'bus_eta_notice_open_states'
export const NOTICE_SEEN_STATE_KEY = 'bus_eta_notice_seen_states'

export const isImportantNotice = (notice) => Number(notice?.priority) > 10

function loadNoticeStates(key) {
  try {
    const states = JSON.parse(globalThis.localStorage.getItem(key) || '{}')
    return states && typeof states === 'object' && !Array.isArray(states) ? states : {}
  } catch {
    return {}
  }
}

function saveNoticeStates(key, updates) {
  try {
    const states = { ...loadNoticeStates(key), ...updates }
    globalThis.localStorage.setItem(key, JSON.stringify(states))
  } catch { /* Keep the current page's state when storage is unavailable. */ }
}

export function useNoticePopup(notices, showNotices, canOpen = () => true) {
  const openStates = ref(loadNoticeStates(NOTICE_OPEN_STATE_KEY))
  const automaticPopup = ref(null)
  let seenStates = loadNoticeStates(NOTICE_SEEN_STATE_KEY)
  const isUnseen = (notice) => notice.id != null && seenStates[String(notice.id)] !== true

  function isNoticeOpen(notice) {
    const id = String(notice.id)
    const popup = automaticPopup.value
    if (popup) return popup.overrides.get(id) ?? (popup.seenStates[id] !== true)
    return openStates.value[id] !== false
  }

  watch([notices, canOpen], ([items, available]) => {
    if (!available || !items.length) return
    seenStates = { ...seenStates, ...loadNoticeStates(NOTICE_SEEN_STATE_KEY) }
    if (!showNotices.value && items.some(isUnseen)) {
      automaticPopup.value = { seenStates, overrides: new Map() }
      showNotices.value = true
    }
  }, { immediate: true })

  function toggleNotice(notice) {
    if (notice.id == null) return
    const id = String(notice.id)
    const open = !isNoticeOpen(notice)
    automaticPopup.value?.overrides.set(id, open)
    const update = { [id]: open }
    openStates.value = { ...openStates.value, ...update }
    saveNoticeStates(NOTICE_OPEN_STATE_KEY, update)
  }

  function closeNotices() {
    if (!showNotices.value) return
    showNotices.value = false
    automaticPopup.value = null
    const unseen = notices.value.filter(isUnseen)
    if (!unseen.length) return
    const updates = Object.fromEntries(unseen.map(notice => [String(notice.id), true]))
    seenStates = { ...seenStates, ...updates }
    saveNoticeStates(NOTICE_SEEN_STATE_KEY, updates)
  }

  return { closeNotices, isNoticeOpen, toggleNotice }
}

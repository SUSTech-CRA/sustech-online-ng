export const NOTICE_OPEN_STATE_KEY = 'bus_eta_notice_open_states'

export const isImportantNotice = (notice) => Number(notice?.priority) > 10

export function loadNoticeOpenStates(storage) {
  try {
    storage ??= globalThis.localStorage
    const states = JSON.parse(storage.getItem(NOTICE_OPEN_STATE_KEY) || '{}')
    return states && typeof states === 'object' && !Array.isArray(states) ? states : {}
  } catch {
    return {}
  }
}

export const noticeIsOpen = (states, noticeId, defaultOpen = false) => noticeId != null && Object.hasOwn(states, String(noticeId)) ? states[String(noticeId)] : defaultOpen

export function saveNoticeOpenState(states, noticeId, open, storage) {
  if (noticeId == null) return
  states[String(noticeId)] = Boolean(open)
  try {
    storage ??= globalThis.localStorage
    storage.setItem(NOTICE_OPEN_STATE_KEY, JSON.stringify(states))
  } catch { /* storage is unavailable */ }
}

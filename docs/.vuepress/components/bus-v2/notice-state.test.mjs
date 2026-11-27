import assert from 'node:assert/strict'
import test from 'node:test'
import { nextTick, ref } from 'vue'
import { NOTICE_OPEN_STATE_KEY, NOTICE_SEEN_STATE_KEY, isImportantNotice, useNoticePopup } from './notice-state.mjs'

function mockStorage(t, initial = {}, writable = true) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map(Object.entries(initial).map(([key, value]) => [key, JSON.stringify(value)]))
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key) => values.get(key),
    setItem: (key, value) => {
      if (!writable) throw Error('blocked')
      values.set(key, value)
    },
  } })
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
    else delete globalThis.localStorage
  })
  return key => JSON.parse(values.get(key) ?? '{}')
}

test('only notices above priority 10 are emphasized', () => {
  assert.equal(isImportantNotice({ priority: 10 }), false)
  assert.equal(isImportantNotice({ priority: 11 }), true)
})

test('automatic popup folds seen notices and opens new notices without saving those defaults', async (t) => {
  const saved = mockStorage(t, {
    [NOTICE_OPEN_STATE_KEY]: { folded: false },
    [NOTICE_SEEN_STATE_KEY]: { old: true },
  })
  const notices = ref([{ id: 'old' }, { id: 'folded' }, { id: 'new' }])
  const open = ref(false)
  const popup = useNoticePopup(notices, open)
  assert.equal(open.value, true)
  assert.deepEqual(notices.value.map(popup.isNoticeOpen), [false, true, true])
  assert.deepEqual(saved(NOTICE_SEEN_STATE_KEY), { old: true })
  assert.deepEqual(saved(NOTICE_OPEN_STATE_KEY), { folded: false })

  popup.closeNotices()
  assert.equal(open.value, false)
  assert.deepEqual(saved(NOTICE_SEEN_STATE_KEY), { old: true, folded: true, new: true })
  assert.deepEqual(saved(NOTICE_OPEN_STATE_KEY), { folded: false })

  const nextOpen = ref(false)
  const nextPopup = useNoticePopup(notices, nextOpen)
  assert.equal(nextOpen.value, false)
  nextOpen.value = true
  assert.deepEqual(notices.value.map(nextPopup.isNoticeOpen), [true, false, true])
  nextPopup.closeNotices()

  notices.value = [...notices.value, { id: 'later' }]
  await nextTick()
  assert.equal(nextOpen.value, true)
  assert.deepEqual(notices.value.map(nextPopup.isNoticeOpen), [false, false, false, true])
})

test('manual changes in an automatic popup are saved without resetting on refresh', async (t) => {
  const saved = mockStorage(t, {
    [NOTICE_OPEN_STATE_KEY]: { old: false },
    [NOTICE_SEEN_STATE_KEY]: { old: true },
  })
  const old = { id: 'old' }
  const latest = { id: 'latest' }
  const notices = ref([old, latest])
  const open = ref(false)
  const popup = useNoticePopup(notices, open)
  popup.toggleNotice(old)
  popup.toggleNotice(latest)
  assert.deepEqual(notices.value.map(popup.isNoticeOpen), [true, false])
  assert.deepEqual(saved(NOTICE_OPEN_STATE_KEY), { old: true, latest: false })
  assert.deepEqual(saved(NOTICE_SEEN_STATE_KEY), { old: true })

  notices.value = [{ ...old }, { ...latest }, { id: 'extra' }]
  await nextTick()
  assert.deepEqual(notices.value.map(popup.isNoticeOpen), [true, false, true])
  popup.closeNotices()
  assert.deepEqual(saved(NOTICE_SEEN_STATE_KEY), { old: true, latest: true, extra: true })
  assert.deepEqual(saved(NOTICE_OPEN_STATE_KEY), { old: true, latest: false })

  open.value = true
  assert.deepEqual(notices.value.map(popup.isNoticeOpen), [true, false, true])
})

test('a popup waits until available and remembers acknowledgement in memory when storage is blocked', async (t) => {
  mockStorage(t, {}, false)
  const available = ref(false)
  const open = ref(false)
  const notices = ref([{ id: 1 }])
  const popup = useNoticePopup(notices, open, () => available.value)
  assert.equal(open.value, false)

  available.value = true
  await nextTick()
  assert.equal(open.value, true)
  assert.doesNotThrow(popup.closeNotices)
  assert.equal(popup.isNoticeOpen(notices.value[0]), true)

  notices.value = [{ id: 1 }]
  await nextTick()
  assert.equal(open.value, false)
})

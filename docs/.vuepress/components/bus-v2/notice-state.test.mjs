import assert from 'node:assert/strict'
import test from 'node:test'
import { NOTICE_OPEN_STATE_KEY, isImportantNotice, loadNoticeOpenStates, noticeIsOpen, saveNoticeOpenState } from './notice-state.mjs'

const storage = () => {
  const values = new Map()
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values }
}

test('only notices above priority 10 are emphasized', () => {
  assert.equal(isImportantNotice({ priority: 10 }), false)
  assert.equal(isImportantNotice({ priority: 11 }), true)
})

test('notice open state is persisted by id and reused', () => {
  const localStorage = storage()
  const states = loadNoticeOpenStates(localStorage)
  assert.equal(noticeIsOpen(states, 'notice-1', true), true)
  saveNoticeOpenState(states, 'notice-1', false, localStorage)
  assert.equal(noticeIsOpen(loadNoticeOpenStates(localStorage), 'notice-1', true), false)
  assert.deepEqual(JSON.parse(localStorage.values.get(NOTICE_OPEN_STATE_KEY)), { 'notice-1': false })
})

test('unavailable storage does not break notice toggling', () => {
  const states = {}
  assert.doesNotThrow(() => saveNoticeOpenState(states, 1, true, { setItem: () => { throw new Error('blocked') } }))
  assert.equal(noticeIsOpen(states, 1), true)
})

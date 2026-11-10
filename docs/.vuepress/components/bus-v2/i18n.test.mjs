import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'
import { busLanguage, busText, busWords, preferredBusLanguage, setBusLanguage } from './i18n.mjs'

test('language selection prefers saved choices and otherwise follows the browser', (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window')
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor)
    else delete globalThis.window
    busLanguage.value = 'zh'
  })
  let saved = null
  globalThis.window = {
    localStorage: { getItem: () => saved, setItem: (_, value) => { saved = value } },
    navigator: { languages: ['en-US'], language: 'zh-CN' },
  }
  assert.equal(preferredBusLanguage(), 'en')
  saved = 'zh'
  assert.equal(preferredBusLanguage(), 'zh')
  setBusLanguage('en')
  assert.equal(saved, 'en')
  window.navigator.languages = ['zh-Hant']
  assert.equal(preferredBusLanguage(), 'en')
  saved = 'invalid'
  assert.equal(preferredBusLanguage(), 'zh')
  window.localStorage.getItem = () => { throw Error('storage disabled') }
  window.navigator.languages = ['en-GB']
  assert.equal(preferredBusLanguage(), 'en')
  window.navigator.languages = []
  assert.equal(preferredBusLanguage(), 'zh')
  delete globalThis.window
  assert.equal(preferredBusLanguage(), 'zh')
})

test('translations have matching keys and placeholders, and component text keys exist', () => {
  assert.deepEqual(Object.keys(busWords.zh).sort(), Object.keys(busWords.en).sort())
  const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort()
  for (const key of Object.keys(busWords.zh)) {
    assert.ok(busWords.zh[key] && busWords.en[key], key)
    assert.deepEqual(placeholders(busWords.zh[key]), placeholders(busWords.en[key]), key)
  }
  for (const name of readdirSync(new URL('.', import.meta.url)).filter(name => name.endsWith('.vue'))) {
    const source = readFileSync(new URL(name, import.meta.url), 'utf8')
    for (const [, key] of source.matchAll(/busText\('([^']+)'/g)) assert.ok(key in busWords.zh, `${name}: ${key}`)
  }
  for (const language of ['zh', 'en']) {
    for (const key of ['locationTimeout', 'locationFailed']) assert.notEqual(busText(key, {}, language), key)
  }
  assert.equal(busText('planAt', { time: '08:00' }, 'zh'), '计划 08:00')
  assert.equal(busText('planAt', { time: '08:00' }, 'en'), 'Scheduled 08:00')
  setBusLanguage('en')
  assert.equal(busText('bus', {}, 'zh'), '巴士')
  setBusLanguage('zh')
})

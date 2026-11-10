import assert from 'node:assert/strict'
import test from 'node:test'
import { busServiceDate, busServiceMinutes, formatBusDateTime, formatBusTime, formatLocalDateTime } from './core.mjs'

test('bus times, service dates and schedule status always use Shanghai, including midnight', (t) => {
  const previous = process.env.TZ
  t.after(() => { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous })
  for (const zone of ['America/New_York', 'UTC', 'Asia/Shanghai']) {
    process.env.TZ = zone
    const morning = new Date('2026-11-10T00:00:00Z')
    for (const language of ['zh', 'en']) {
      assert.equal(formatBusTime(morning, language), '08:00')
      assert.equal(formatBusTime('2026-11-09T16:00:00Z', language), '00:00')
      const expected = morning.toLocaleString(language === 'zh' ? 'zh-CN' : 'en', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', month: 'short', day: 'numeric' })
      assert.equal(formatBusDateTime(morning, language), expected)
    }
    assert.equal(formatLocalDateTime(morning), '2026-11-10 08:00')
    const midnight = new Date('2026-11-09T16:05:00Z')
    assert.equal(busServiceDate(midnight), '2026-11-10')
    assert.equal(busServiceMinutes(midnight), 5)
    assert.equal(busServiceMinutes(midnight, '2026-11-09'), 1445)
    assert.equal(busServiceMinutes(midnight, '2026-11-11'), -1435)
    assert.equal(busServiceMinutes(morning), 480)
  }
})

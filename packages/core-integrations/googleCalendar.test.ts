// packages/core-integrations/googleCalendar.test.ts
import { describe, it, expect } from 'vitest'
import { formatGoogleCalendarUrl, syncToGoogleCalendar } from './googleCalendar.js'

describe('GoogleCalendar Connector', () => {
  it('formats valid Google Calendar URL template', () => {
    const url = formatGoogleCalendarUrl({
      title: 'Luyện thi STEM',
      description: 'Làm đề kiểm tra Toán lớp 12',
      startIso: '2026-08-19T08:00:00.000Z',
      endIso: '2026-08-19T09:30:00.000Z',
    })

    expect(url).toContain('https://calendar.google.com/calendar/render')
    expect(url).toContain('action=TEMPLATE')
    expect(url).toContain('Luy%E1%BB%87n+thi+STEM')
  })

  it('syncs event and returns response with externalUrl', async () => {
    const res = await syncToGoogleCalendar({
      title: 'Luyện nghe IELTS',
      startIso: '2026-08-19T10:00:00.000Z',
      endIso: '2026-08-19T11:00:00.000Z',
    })

    expect(res.success).toBe(true)
    expect(res.provider).toBe('google_calendar')
    expect(res.externalUrl).toBeTruthy()
    expect(res.receiptId).toContain('gcal-receipt')
  })

  // --- Nhánh lines 15-16: invalid ISO date → catch branch strips invalid chars ---
  it('formatGoogleCalendarUrl với ISO không hợp lệ → vẫn trả URL (catch branch fallback)', () => {
    // new Date('not-a-date').toISOString() → throw → catch → dùng input thô đã strip
    const url = formatGoogleCalendarUrl({
      title: 'Test',
      startIso: 'not-a-date',
      endIso: 'also-not-a-date',
    })
    expect(url).toContain('https://calendar.google.com/calendar/render')
    // Fallback strip: 'not-a-date'.replace(/[-:]/g, '') = 'notadate'
    expect(url).toContain('notadate')
  })

  // --- Nhánh lines 31-32: recurrenceRule có giá trị → params.set('recur', ...) ---
  it('formatGoogleCalendarUrl với recurrenceRule → URL chứa recur param', () => {
    const url = formatGoogleCalendarUrl({
      title: 'Học mỗi tuần',
      startIso: '2026-08-19T08:00:00.000Z',
      endIso: '2026-08-19T09:00:00.000Z',
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
    })
    expect(url).toContain('recur=RRULE%3AFREQ%3DWEEKLY')
  })
})

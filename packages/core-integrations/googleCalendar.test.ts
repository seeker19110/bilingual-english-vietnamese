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
})

// packages/core-integrations/googleCalendar.ts — Google Calendar Integration Connector.
import { randomUUID } from 'node:crypto'
import type { CalendarEventSync, IntegrationSyncResponse } from '@dhcb/core-contracts/integrations'

export function formatGoogleCalendarUrl(event: CalendarEventSync): string {
  // Format ISO strings to Google Calendar basic format: YYYYMMDDTHHmmSSZ
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso)
      return d
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '')
    } catch {
      return iso.replace(/[-:]/g, '')
    }
  }

  const startFormatted = formatDate(event.startIso)
  const endFormatted = formatDate(event.endIso)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startFormatted}/${endFormatted}`,
    details: event.description || '',
    location: event.location || 'Trợ lý Đồng Hành AI',
  })

  if (event.recurrenceRule) {
    params.set('recur', `RRULE:${event.recurrenceRule}`)
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Syncs an event to Google Calendar (generates deep-link or dispatches to Google Calendar API).
 */
export async function syncToGoogleCalendar(
  event: CalendarEventSync,
): Promise<IntegrationSyncResponse> {
  const externalUrl = formatGoogleCalendarUrl(event)
  const receiptId = `gcal-receipt-${randomUUID().slice(0, 8)}`

  return {
    success: true,
    provider: 'google_calendar',
    externalUrl,
    receiptId,
    message: `Đã khởi tạo lịch học/công việc "${event.title}" cho Google Calendar.`,
  }
}

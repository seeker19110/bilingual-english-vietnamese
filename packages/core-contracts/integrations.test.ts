// packages/core-contracts/integrations.test.ts
import { describe, it, expect } from 'vitest'
import { IntegrationSyncRequestSchema, IntegrationSyncResponseSchema } from './integrations.js'

describe('Integrations Contracts', () => {
  it('validates google calendar sync request', () => {
    const req = {
      kind: 'google_calendar_sync' as const,
      event: {
        title: 'Luyện đề Toán THPTQG',
        description: 'Luyện 50 câu trắc nghiệm Toán giải tích',
        startIso: '2026-08-19T08:00:00Z',
        endIso: '2026-08-19T09:30:00Z',
      },
    }
    const parsed = IntegrationSyncRequestSchema.parse(req)
    expect(parsed.kind).toBe('google_calendar_sync')
  })

  it('validates notion export request', () => {
    const req = {
      kind: 'notion_export' as const,
      task: {
        title: 'Hoàn thiện Lean Canvas',
        status: 'in_progress' as const,
        priority: 'high' as const,
        tags: ['startup', 'mvp'],
        dueDate: '2026-08-20',
      },
    }
    const parsed = IntegrationSyncRequestSchema.parse(req)
    expect(parsed.kind).toBe('notion_export')
  })

  it('validates integration response', () => {
    const res = {
      success: true,
      provider: 'google_calendar' as const,
      externalUrl: 'https://calendar.google.com/calendar/render',
      receiptId: 'receipt-123',
      message: 'Đã tạo liên kết sự kiện Google Calendar thành công',
    }
    const parsed = IntegrationSyncResponseSchema.parse(res)
    expect(parsed.success).toBe(true)
  })
})

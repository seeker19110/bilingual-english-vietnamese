// apps/dhcb/src/lib/integrationsApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchIntegrations, executeIntegrationSync } from './integrationsApi.js'

describe('integrationsApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches integrations list on GET', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ integrations: [{ provider: 'notion', name: 'Notion' }] }),
    })

    const res = await fetchIntegrations()
    expect(res.integrations).toHaveLength(1)
  })

  it('executes integration sync on POST', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        provider: 'google_calendar',
        message: 'Thành công',
      }),
    })

    const res = await executeIntegrationSync({
      kind: 'google_calendar_sync',
      event: {
        title: 'Học bài',
        startIso: '2026-08-19T08:00:00Z',
        endIso: '2026-08-19T09:00:00Z',
      },
    })

    expect(res.success).toBe(true)
    expect(res.provider).toBe('google_calendar')
  })
})

// api/integrations.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './integrations.js'
import * as security from '../packages/core-auth/security.js'

describe('GET/POST /api/integrations', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(security, 'checkRateLimit').mockResolvedValue(true)
  })

  it('handles OPTIONS request with CORS', async () => {
    const req = new Request('http://localhost/api/integrations', { method: 'OPTIONS' })
    const res = await handler(req)
    expect(res.status).toBe(204)
  })

  it('rejects unauthorized request', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue(null)
    const req = new Request('http://localhost/api/integrations', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('returns available integrations list on GET', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: 'user-1',
    })
    const req = new Request('http://localhost/api/integrations', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.integrations).toHaveLength(2)
    expect(data.integrations[0].provider).toBe('google_calendar')
  })

  it('processes google calendar sync request on POST', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: 'user-1',
    })
    const req = new Request('http://localhost/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'google_calendar_sync',
        event: {
          title: 'Học Toán 12',
          startIso: '2026-08-19T08:00:00Z',
          endIso: '2026-08-19T09:30:00Z',
        },
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.provider).toBe('google_calendar')
    expect(data.externalUrl).toContain('calendar.google.com')
  })

  it('processes notion export request on POST', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: 'user-1',
    })
    const req = new Request('http://localhost/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'notion_export',
        task: {
          title: 'Viết tài liệu V2',
          status: 'todo',
          priority: 'high',
        },
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.provider).toBe('notion')
  })
})

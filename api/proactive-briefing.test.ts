import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: () => ({}) }))

import handler from './proactive-briefing.js'
import * as security from '@dhcb/core-auth/security'
import * as personService from '@dhcb/core-personal/personService'

describe('GET/POST /api/proactive-briefing', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(security, 'checkRateLimit').mockResolvedValue(true)
  })

  it('handles OPTIONS request with CORS', async () => {
    const req = new Request('http://localhost/api/proactive-briefing', { method: 'OPTIONS' })
    const res = await handler(req)
    expect(res.status).toBe(204)
  })

  it('rejects unauthorized request', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue(null)
    const req = new Request('http://localhost/api/proactive-briefing', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('returns proactive briefing for authorized user', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: 'user-1',
    })
    vi.spyOn(personService, 'getOrCreatePerson').mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      userId: 'user-1',
      displayName: 'Test User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: 1,
    })

    const req = new Request('http://localhost/api/proactive-briefing?type=morning', {
      method: 'GET',
    })
    const res = await handler(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.briefing).toBeTruthy()
    expect(data.briefing.type).toBe('morning')
    expect(data.briefing.actionItems.length).toBeGreaterThan(0)
  })

  it('rejects unsupported HTTP methods', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: 'user-1',
    })
    const req = new Request('http://localhost/api/proactive-briefing', { method: 'DELETE' })
    const res = await handler(req)
    expect(res.status).toBe(405)
  })
})

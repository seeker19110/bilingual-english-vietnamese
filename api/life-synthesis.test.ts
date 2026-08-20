// api/life-synthesis.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './life-synthesis.js'
import * as security from '../packages/core-auth/security.js'

describe('Life Synthesis API Handler (/api/life-synthesis)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects unauthorized requests with 401', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/life-synthesis', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('returns synthesis report on GET with 200', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/life-synthesis?timeframe=weekly', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.report.schemaVersion).toBe('v5.4.0')
    expect(data.report.domainBreakdown).toHaveLength(5)
  })

  it('generates custom synthesis report on POST with 200', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/life-synthesis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeframe: 'monthly',
        domainActivityCounts: {
          learning: 25,
          career: 12,
        },
        metacognitiveAwarenessIndex: 92,
      }),
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.report.holisticAlignmentScore).toBeGreaterThan(0)
  })
})

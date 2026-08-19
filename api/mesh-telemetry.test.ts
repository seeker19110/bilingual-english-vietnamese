// api/mesh-telemetry.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './mesh-telemetry.js'
import * as security from '../packages/core-auth/security.js'

describe('Mesh Telemetry API Handler (/api/mesh-telemetry)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects unauthorized requests with 401', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/mesh-telemetry', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('returns default session telemetry on GET with 200', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/mesh-telemetry', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.telemetry.qualityTier).toBe('ultra_low_latency')
    expect(data.telemetry.schemaVersion).toBe('v4.4.0')
  })

  it('records metrics on POST with action=record_metric', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/mesh-telemetry?action=record_metric', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        addedTokens: 500,
        addedAudioSeconds: 15,
        provider: 'gemini_live',
      }),
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.telemetry.totalTokens).toBeGreaterThan(0)
  })

  it('resets budget cap on POST with action=reset_budget', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/mesh-telemetry?action=reset_budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ costCapUsd: 0.25 }),
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.telemetry.costCapUsd).toBe(0.25)
  })
})

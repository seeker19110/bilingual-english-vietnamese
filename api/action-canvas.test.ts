// api/action-canvas.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './action-canvas.js'
import * as security from '../packages/core-auth/security.js'

describe('Action Canvas API Handler (/api/action-canvas)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects unauthorized requests with 401', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/action-canvas', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('returns default or existing canvas on GET with 200', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/action-canvas', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.canvas.nodes.length).toBeGreaterThan(0)
    expect(data.canvas.schemaVersion).toBe('v4.2.0')
  })

  it('synthesizes new cross-domain goal canvas on POST with action=synthesize', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/action-canvas?action=synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalPrompt: 'Du học Thạc sĩ AI' }),
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.canvas.title).toContain('Du học Thạc sĩ AI')
  })

  it('exports canvas to markdown format on POST with action=export', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/action-canvas?action=export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.format).toBe('markdown')
    expect(data.markdown).toBeDefined()
  })
})

// api/neural-curriculum.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './neural-curriculum.js'
import * as security from '../packages/core-auth/security.js'

describe('Neural Curriculum API Handler (/api/neural-curriculum)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects unauthorized requests with 401', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/neural-curriculum', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('returns default neural curriculum state on GET with 200', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/neural-curriculum', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.state.modules.length).toBeGreaterThan(0)
    expect(data.state.schemaVersion).toBe('v4.3.0')
  })

  it('generates micro module on POST with action=generate_module', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/neural-curriculum?action=generate_module', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topicOrKeyword: 'Thuyết Trình Công Nghệ',
        targetDomain: 'career',
      }),
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.module.title).toContain('Thuyết Trình Công Nghệ')
  })

  it('completes drill and updates mastery on POST with action=complete_drill', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/neural-curriculum?action=complete_drill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCorrect: true, previousInterval: 2 }),
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.review.masteryDelta).toBe(15)
  })
})

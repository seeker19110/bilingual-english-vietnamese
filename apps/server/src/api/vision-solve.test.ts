// api/vision-solve.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './vision-solve.js'
import * as security from '@dhcb/core-auth/security'

describe('POST /api/vision-solve', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(security, 'checkRateLimit').mockResolvedValue(true)
  })

  it('handles OPTIONS request with CORS', async () => {
    const req = new Request('http://localhost/api/vision-solve', { method: 'OPTIONS' })
    const res = await handler(req)
    expect(res.status).toBe(204)
  })

  it('rejects unauthorized request', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue(null)
    const req = new Request('http://localhost/api/vision-solve', {
      method: 'POST',
      body: JSON.stringify({ imageBase64: 'iVBORw0KGgoAAAANSUhEUg==' }),
    })
    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('rejects invalid request body missing imageBase64', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: 'user-1',
    })
    const req = new Request('http://localhost/api/vision-solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId: 'math' }),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('successfully solves problem from image', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: 'user-1',
    })
    const req = new Request('http://localhost/api/vision-solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64:
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        subjectId: 'mathematics',
        gradeLevel: 'grade_12',
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.problemText).toBeTruthy()
    expect(data.steps.length).toBeGreaterThan(0)
    expect(data.finalAnswer).toBeTruthy()
  })
})

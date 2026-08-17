import { beforeEach, describe, expect, it, vi } from 'vitest'

let rateLimitOk = true
vi.mock('../packages/core-auth/security.js', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  logSecurityEvent: () => {},
}))

import handler from './subjects.js'

function req(method: string, query = '') {
  return new Request(`http://localhost/api/subjects${query}`, { method })
}

beforeEach(() => {
  rateLimitOk = true
})

describe('auth & rate limit on /api/subjects', () => {
  it('OPTIONS -> 204', async () => {
    const res = await handler(req('OPTIONS'))
    expect(res.status).toBe(204)
  })

  it('rate limit exceeded -> 429', async () => {
    rateLimitOk = false
    const res = await handler(req('GET'))
    expect(res.status).toBe(429)
  })

  it('rejects POST with 405 Method Not Allowed', async () => {
    const res = await handler(req('POST'))
    expect(res.status).toBe(405)
  })
})

describe('GET /api/subjects', () => {
  it('lists all supported subjects', async () => {
    const res = await handler(req('GET'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.subjects.length).toBeGreaterThanOrEqual(5)
    expect(json.subjects.some((s: { id: string }) => s.id === 'english')).toBe(true)
    expect(json.subjects.some((s: { id: string }) => s.id === 'mathematics')).toBe(true)
  })

  it('filters subjects by category', async () => {
    const res = await handler(req('GET', '?category=stem'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.subjects.every((s: { category: string }) => s.category === 'stem')).toBe(true)
  })

  it('gets specific subject by id', async () => {
    const res = await handler(req('GET', '?id=mathematics'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.subject.id).toBe('mathematics')
    expect(json.subject.taxonomyKind).toBe('grade_curriculum')
  })

  it('returns 404 for unknown subject', async () => {
    const res = await handler(req('GET', '?id=unknown_subject'))
    expect(res.status).toBe(404)
  })
})

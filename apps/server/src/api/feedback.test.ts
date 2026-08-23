// api/feedback.test.ts — Kiểm thử endpoint nhận ý kiến đóng góp người dùng.
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: vi.fn() }))
let rateLimitOk = true
let authUser: { userId: string } | null = { userId: 'u-123' }
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authUser,
  logSecurityEvent: () => {},
}))

import handler from './feedback'
import { getPgPool } from '@dhcb/core-db/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  rateLimitOk = true
  authUser = { userId: 'u-123' }
  query.mockReset()
  query.mockResolvedValue({ rows: [{ id: 'fb-1' }] })
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
})

describe('/api/feedback', () => {
  it('POST saves feedback successfully and returns 201', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        category: 'feature',
        rating: 5,
        title: 'Thêm dark mode',
        message: 'Tôi muốn có dark mode tự động chuyển đổi theo thời gian.',
        contactEmail: 'user@example.com',
      }),
    })

    const resp = await handler(req)
    expect(resp.status).toBe(201)
    const data = await resp.json()
    expect(data.ok).toBe(true)
    expect(data.id).toBe('fb-1')
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('POST rejects invalid schema (<3 chars message)', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        category: 'bug',
        message: 'hi',
      }),
    })

    const resp = await handler(req)
    expect(resp.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('GET returns user feedback list when authenticated', async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 'fb-1',
          userId: 'u-123',
          category: 'feature',
          rating: 5,
          title: 'Thêm dark mode',
          message: 'Nội dung...',
          contactEmail: 'user@example.com',
          status: 'new',
          createdAt: new Date().toISOString(),
        },
      ],
    })

    const req = new Request('http://localhost/api/feedback', {
      method: 'GET',
    })

    const resp = await handler(req)
    expect(resp.status).toBe(200)
    const data = await resp.json()
    expect(data.feedbackList).toHaveLength(1)
    expect(data.feedbackList[0].id).toBe('fb-1')
  })

  it('GET returns 401 when unauthenticated', async () => {
    authUser = null
    const req = new Request('http://localhost/api/feedback', {
      method: 'GET',
    })

    const resp = await handler(req)
    expect(resp.status).toBe(401)
  })

  it('OPTIONS returns 204', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'OPTIONS',
    })

    const resp = await handler(req)
    expect(resp.status).toBe(204)
  })
})

// Test /api/tutor-feedback — ghi báo cáo 👎 chất lượng gia sư AI vào bảng tutor_feedback.
import { describe, it, expect, beforeEach, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
let rateLimitOk = true
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: vi.fn() }))

import handler from './tutor-feedback'
import { getPgPool } from '@dhcb/core-db/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  query.mockReset()
  query.mockResolvedValue({ rows: [] })
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
})

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/tutor-feedback', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/tutor-feedback', () => {
  it('OPTIONS → 204', async () => {
    const res = await handler(
      new Request('http://localhost/api/tutor-feedback', { method: 'OPTIONS' }),
    )
    expect(res.status).toBe(204)
  })

  it('vượt rate limit → 429', async () => {
    rateLimitOk = false
    const res = await handler(makeRequest({}))
    expect(res.status).toBe(429)
  })

  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const res = await handler(makeRequest({ source: 'chat', userInput: 'x', aiFeedback: 'y' }))
    expect(res.status).toBe(401)
  })

  it('method khác POST → 405', async () => {
    const res = await handler(new Request('http://localhost/api/tutor-feedback', { method: 'GET' }))
    expect(res.status).toBe(405)
  })

  it('body không hợp lệ (thiếu field) → 400', async () => {
    const res = await handler(makeRequest({ source: 'chat' }))
    expect(res.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('source sai enum → 400', async () => {
    const res = await handler(makeRequest({ source: 'writing', userInput: 'x', aiFeedback: 'y' }))
    expect(res.status).toBe(400)
  })

  it('thành công → 200, ghi đúng dữ liệu vào DB', async () => {
    const res = await handler(
      makeRequest({ source: 'speaking', userInput: 'Hello world', aiFeedback: 'Sửa lỗi nhé' }),
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('insert into english.tutor_feedback'),
      ['user-1', 'speaking', 'Hello world', 'Sửa lỗi nhé'],
    )
  })
})

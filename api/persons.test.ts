// Test /api/persons — GET danh tính Personal OS của user đang đăng nhập.
import { describe, it, expect, beforeEach, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
let rateLimitOk = true
vi.mock('../packages/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

vi.mock('../packages/core-db/pgPool.js', () => ({ getPgPool: vi.fn() }))
const getOrCreatePersonMock = vi.fn()
vi.mock('../packages/core-personal/personService.js', () => ({
  getOrCreatePerson: (...args: unknown[]) => getOrCreatePersonMock(...args),
}))

import handler from './persons'

const PERSON = {
  id: '11111111-1111-4111-8111-111111111111',
  userId: 'user-1',
  displayName: 'Liên',
  createdAt: '2026-08-16T00:00:00.000Z',
  updatedAt: '2026-08-16T00:00:00.000Z',
  schemaVersion: 1,
}

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  getOrCreatePersonMock.mockReset()
  getOrCreatePersonMock.mockResolvedValue(PERSON)
})

function makeReq(method = 'GET'): Request {
  return new Request('http://localhost/api/persons', { method })
}

describe('GET /api/persons', () => {
  it('OPTIONS → 204', async () => {
    expect((await handler(makeReq('OPTIONS'))).status).toBe(204)
  })

  it('vượt rate limit → 429', async () => {
    rateLimitOk = false
    expect((await handler(makeReq())).status).toBe(429)
  })

  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    expect((await handler(makeReq())).status).toBe(401)
  })

  it('method khác GET → 405', async () => {
    expect((await handler(makeReq('POST'))).status).toBe(405)
  })

  it('đăng nhập → trả Person, personId lấy từ token (không từ client)', async () => {
    const res = await handler(makeReq())
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(PERSON)
    expect(getOrCreatePersonMock.mock.calls[0]?.[1]).toBe('user-1')
  })
})

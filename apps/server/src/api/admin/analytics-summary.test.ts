// Test /api/analytics-summary — chỉ admin xem được, ai khác bị chặn.
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: vi.fn() }))
const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))
const emailState: { email: string | undefined } = { email: 'admin@x.com' }
vi.mock('@dhcb/core-auth/authService', () => ({
  getUserById: async () => ({ id: 'user-1', email: emailState.email }),
}))
vi.mock('@dhcb/core-auth/adminAuth', () => ({
  isAdminEmail: (email: string | null | undefined) => email === 'admin@x.com',
}))

import handler from './analytics-summary.js'
import { getPgPool } from '@dhcb/core-db/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  query.mockReset()
  query.mockResolvedValue({ rows: [] })
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  authState.user = { userId: 'user-1' }
  emailState.email = 'admin@x.com'
})

function makeRequest(qs = ''): Request {
  return new Request(`http://localhost/api/analytics-summary${qs}`, { method: 'GET' })
}

describe('GET /api/analytics-summary', () => {
  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const res = await handler(makeRequest())
    expect(res.status).toBe(401)
  })

  it('đăng nhập nhưng KHÔNG phải admin → 403', async () => {
    emailState.email = 'user@x.com'
    const res = await handler(makeRequest())
    expect(res.status).toBe(403)
  })

  it('admin → 200, group theo ngày (giờ VN) + event', async () => {
    query.mockResolvedValueOnce({
      rows: [
        { day: '2026-07-20', event: 'landing_view', count: 5 },
        { day: '2026-07-20', event: 'signup', count: 2 },
        { day: '2026-07-21', event: 'signup', count: 1 },
      ],
    })
    const res = await handler(makeRequest())
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      totalsByEvent: Record<string, number>
      daily: unknown[]
    }
    expect(body.totalsByEvent).toEqual({ landing_view: 5, signup: 3 })
    expect(body.daily).toHaveLength(3)
  })

  it('mặc định 14 ngày, chấp nhận query days hợp lệ', async () => {
    await handler(makeRequest('?days=30'))
    expect(String(query.mock.calls[0]?.[0])).toContain('interval')
    expect(query.mock.calls[0]?.[1]).toEqual([30])
  })

  it('days không hợp lệ (chữ, âm) → dùng mặc định 14, không NaN xuống SQL', async () => {
    await handler(makeRequest('?days=abc'))
    expect(query.mock.calls[0]?.[1]).toEqual([14])
  })
})

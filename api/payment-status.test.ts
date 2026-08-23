import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: vi.fn() }))
let rateLimitOk = true
const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

import handler from './payment-status.js'
import { getPgPool } from '@dhcb/core-db/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

function makeRequest(code: string | null): Request {
  const url = code
    ? `http://localhost/api/payment-status?code=${code}`
    : 'http://localhost/api/payment-status'
  return new Request(url, { headers: { Authorization: 'Bearer x' } })
}

beforeEach(() => {
  rateLimitOk = true
  query.mockReset()
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  authState.user = { userId: 'user-1' }
})

describe('/api/payment-status', () => {
  it('rate limit vượt quá → 429', async () => {
    rateLimitOk = false
    const resp = await handler(makeRequest('ENVI7K2M9QRT'))
    expect(resp.status).toBe(429)
  })
  it('OPTIONS request → 204', async () => {
    const resp = await handler(
      new Request('http://localhost/api/payment-status', { method: 'OPTIONS' }),
    )
    expect(resp.status).toBe(204)
  })

  it('HTTP method khác GET → 405', async () => {
    const resp = await handler(
      new Request('http://localhost/api/payment-status', { method: 'POST' }),
    )
    expect(resp.status).toBe(405)
  })

  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const resp = await handler(makeRequest('ENVI7K2M9QRT'))
    expect(resp.status).toBe(401)
  })

  it('thiếu tham số code → 400', async () => {
    const resp = await handler(makeRequest(null))
    expect(resp.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('lọc theo user_id khớp token — user khác không xem được đơn của người khác', async () => {
    query.mockResolvedValueOnce({ rows: [] }) // đơn tồn tại nhưng thuộc user khác → không khớp
    const resp = await handler(makeRequest('ENVI7K2M9QRT'))
    expect(resp.status).toBe(404)
    const [, params] = query.mock.calls[0] as [string, unknown[]]
    expect(params).toEqual(['ENVI7K2M9QRT', 'user-1'])
  })

  it('đơn hợp lệ → trả trạng thái', async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          status: 'paid',
          plan: 'pro',
          cycle: 'month',
          amount_vnd: 40_000,
          expires_at: new Date('2026-07-27T12:00:00Z'),
        },
      ],
    })
    const resp = await handler(makeRequest('ENVI7K2M9QRT'))
    expect(resp.status).toBe(200)
    expect(await resp.json()).toMatchObject({ status: 'paid', plan: 'pro', amountVnd: 40_000 })
  })
})

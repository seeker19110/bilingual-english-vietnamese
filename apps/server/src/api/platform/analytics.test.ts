// Test handler /api/analytics — ca biên quan trọng:
//  1. event ngoài whitelist → 400 (Zod từ chối, tránh spam bảng dữ liệu rác).
//  2. Không có Authorization header vẫn ghi được (auth tuỳ chọn) → user_id = null.
//  3. Có Authorization hợp lệ → ghi kèm user_id.
//  4. Field optional thiếu (refCode/utmSource/path) không crash.

import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: vi.fn() }))
const authState: { user: { userId: string } | null } = { user: null }
vi.mock('@dhcb/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async () => authState.user,
}))

import handler from './analytics.js'
import { getPgPool } from '@dhcb/core-db/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  query.mockReset()
  query.mockResolvedValue({ rows: [] })
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  authState.user = null
})

function makeRequest(body?: unknown, withAuth = false): Request {
  return new Request('http://localhost/api/analytics', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(withAuth ? { Authorization: 'Bearer x' } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

describe('/api/analytics', () => {
  it('event ngoài whitelist → 400, không ghi DB', async () => {
    const resp = await handler(makeRequest({ event: 'not_a_real_event' }))
    expect(resp.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('không có Authorization header vẫn ghi được, user_id = null', async () => {
    const resp = await handler(makeRequest({ event: 'landing_view' }))
    expect(resp.status).toBe(200)
    expect(await resp.json()).toEqual({ ok: true })
    const [sql, params] = query.mock.calls[0] as [string, unknown[]]
    expect(sql).toContain('insert into public.analytics_events')
    expect(params[0]).toBe('landing_view')
    expect(params[1]).toBeNull() // user_id null khi chưa đăng nhập
  })

  it('có Authorization hợp lệ → ghi kèm user_id', async () => {
    authState.user = { userId: 'user-1' }
    const resp = await handler(makeRequest({ event: 'signup' }, true))
    expect(resp.status).toBe(200)
    const [, params] = query.mock.calls[0] as [string, unknown[]]
    expect(params[1]).toBe('user-1')
  })

  it('field optional thiếu không crash, ghi null', async () => {
    const resp = await handler(makeRequest({ event: 'cta_click' }))
    expect(resp.status).toBe(200)
    const [, params] = query.mock.calls[0] as [string, unknown[]]
    expect(params).toEqual(['cta_click', null, null, null, null])
  })

  it('method khác POST → 405', async () => {
    const resp = await handler(new Request('http://localhost/api/analytics', { method: 'GET' }))
    expect(resp.status).toBe(405)
  })
})

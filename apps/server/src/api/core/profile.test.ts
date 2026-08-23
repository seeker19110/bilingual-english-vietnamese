// Test /api/profile — GET đọc hồ sơ (tự tạo nếu chưa có), POST onboarding hoặc đổi nhóm tuổi.
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

const ensureProfileRowMock = vi.fn()
vi.mock('@dhcb/core-auth/authService', () => ({
  ensureProfileRow: (userId: string, name: string) => ensureProfileRowMock(userId, name),
}))

vi.mock('@dhcb/core-db/pgPool', () => ({ getPgPool: vi.fn() }))

import handler from './profile.js'
import { getPgPool } from '@dhcb/core-db/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  ensureProfileRowMock.mockReset()
  ensureProfileRowMock.mockResolvedValue({})
  query.mockReset()
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
})

function makeGet(): Request {
  return new Request('http://localhost/api/profile')
}

function makePost(body: unknown): Request {
  return new Request('http://localhost/api/profile', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('GET /api/profile', () => {
  it('OPTIONS → 204', async () => {
    const res = await handler(new Request('http://localhost/api/profile', { method: 'OPTIONS' }))
    expect(res.status).toBe(204)
  })

  it('vượt rate limit → 429', async () => {
    rateLimitOk = false
    const res = await handler(makeGet())
    expect(res.status).toBe(429)
  })

  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const res = await handler(makeGet())
    expect(res.status).toBe(401)
  })

  it('chưa có hồ sơ → trả giá trị mặc định', async () => {
    query.mockResolvedValue({ rows: [] })
    const res = await handler(makeGet())
    expect(res.status).toBe(200)
    expect(ensureProfileRowMock).toHaveBeenCalledWith('user-1', '')
    expect(await res.json()).toEqual({
      plan: 'free',
      planExpiresAt: null,
      onboarded: false,
      name: '',
      userLevel: 'beginner',
      goal: 'daily',
      dailyMinutes: 10,
      ageGroup: 'nguoi_lon',
    })
  })

  it('đã có hồ sơ → trả đúng dữ liệu đã lưu', async () => {
    query.mockResolvedValue({
      rows: [
        {
          plan: 'pro',
          plan_expires_at: '2099-01-01T00:00:00.000Z',
          onboarded: true,
          name: 'Liên',
          user_level: 'intermediate',
          goal: 'work',
          daily_minutes: 20,
          age_group: 'thanh_nien',
        },
      ],
    })
    const res = await handler(makeGet())
    const body = await res.json()
    expect(body.plan).toBe('pro')
    expect(body.name).toBe('Liên')
    expect(body.ageGroup).toBe('thanh_nien')
  })
})

describe('POST /api/profile', () => {
  it('method khác GET/POST → 405', async () => {
    const res = await handler(new Request('http://localhost/api/profile', { method: 'DELETE' }))
    expect(res.status).toBe(405)
  })

  it('body không hợp lệ → 400', async () => {
    const res = await handler(makePost({ action: 'unknown' }))
    expect(res.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('action onboarding → 200, cập nhật đúng cột', async () => {
    query.mockResolvedValue({ rows: [] })
    const res = await handler(
      makePost({ action: 'onboarding', level: 'beginner', goal: 'daily', dailyMinutes: 15 }),
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(query).toHaveBeenCalledWith(expect.stringContaining('update public.profiles'), [
      'beginner',
      'daily',
      15,
      'user-1',
      null,
    ])
  })

  it('action set-age-group → 200, chỉ đổi cột age_group', async () => {
    query.mockResolvedValue({ rows: [] })
    const res = await handler(makePost({ action: 'set-age-group', ageGroup: 'nhi_dong' }))
    expect(res.status).toBe(200)
    expect(query).toHaveBeenCalledWith('update public.profiles set age_group = $1 where id = $2', [
      'nhi_dong',
      'user-1',
    ])
  })
})

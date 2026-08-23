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
// Ghi onboarding chạy trong transaction (withTransaction → pool.connect()), nên phải mock cả
// client chứ không chỉ pool.query. `clientQuery` nhận luôn cả BEGIN/COMMIT do helper phát ra.
const clientQuery = vi.fn()
const release = vi.fn()

// Chỉ lấy các câu SQL nghiệp vụ, bỏ BEGIN/COMMIT/ROLLBACK của withTransaction.
function businessQueries(): { sql: string; params: unknown[] }[] {
  return clientQuery.mock.calls
    .filter((c) => typeof c[0] === 'string' && !/^\s*(BEGIN|COMMIT|ROLLBACK)\s*$/i.test(c[0]))
    .map((c) => ({ sql: c[0] as string, params: (c[1] ?? []) as unknown[] }))
}

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateLimitOk = true
  ensureProfileRowMock.mockReset()
  ensureProfileRowMock.mockResolvedValue({})
  query.mockReset()
  clientQuery.mockReset()
  clientQuery.mockResolvedValue({ rows: [] })
  release.mockReset()
  mockedGetPool.mockReturnValue({
    query,
    connect: async () => ({ query: clientQuery, release }),
  } as unknown as ReturnType<typeof getPgPool>)
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

  it('đọc bằng LEFT JOIN, ưu tiên bảng môn rồi rơi về public.profiles', async () => {
    query.mockResolvedValue({ rows: [] })
    await handler(makeGet())
    const sql = String(query.mock.calls[0]?.[0])
    expect(sql).toContain('left join english.user_profile')
    expect(sql).toContain('coalesce(e.user_level, p.user_level)')
    // age_group chỉ lấy từ bảng nền tảng — không coalesce với bảng môn (0059 đã xoá cột đó).
    expect(sql).toContain('p.age_group')
    expect(sql).not.toContain('e.age_group')
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
    const platform = businessQueries().find((q) => q.sql.includes('update public.profiles'))
    expect(platform?.params).toEqual(['beginner', 'daily', 15, 'user-1', null])
  })

  // ── C1b: ranh giới nền tảng vs môn học (migration 0059) ────────────────────────────
  it('onboarding ghi CẢ HAI nơi: public.profiles và english.user_profile', async () => {
    await handler(
      makePost({ action: 'onboarding', level: 'advanced', goal: 'ielts', dailyMinutes: 30 }),
    )
    const sqls = businessQueries().map((q) => q.sql)
    expect(sqls.some((sql) => sql.includes('update public.profiles'))).toBe(true)
    expect(sqls.some((sql) => sql.includes('insert into english.user_profile'))).toBe(true)
  })

  it('bản ghi bên bảng môn KHÔNG mang age_group (nhóm tuổi thuộc nền tảng)', async () => {
    await handler(
      makePost({
        action: 'onboarding',
        level: 'beginner',
        goal: 'daily',
        dailyMinutes: 10,
        ageGroup: 'thieu_nien',
      }),
    )
    const subject = businessQueries().find((q) => q.sql.includes('english.user_profile'))
    expect(subject?.sql).not.toContain('age_group')
    expect(subject?.params).toEqual(['user-1', 'beginner', 'daily', 10])

    // Nhóm tuổi vẫn phải được ghi — nhưng ở bảng NỀN TẢNG.
    const platform = businessQueries().find((q) => q.sql.includes('update public.profiles'))
    expect(platform?.params).toContain('thieu_nien')
  })

  it('hai lần ghi nằm trong CÙNG một transaction', async () => {
    await handler(
      makePost({ action: 'onboarding', level: 'beginner', goal: 'daily', dailyMinutes: 10 }),
    )
    const all = clientQuery.mock.calls.map((c) => String(c[0]))
    expect(all[0]).toMatch(/BEGIN/i)
    expect(all[all.length - 1]).toMatch(/COMMIT/i)
    expect(release).toHaveBeenCalled()
  })

  it('ghi bảng môn lỗi → rollback, KHÔNG để hai nơi lệch nhau', async () => {
    clientQuery.mockImplementation(async (sql: string) => {
      if (String(sql).includes('english.user_profile')) throw new Error('mất kết nối')
      return { rows: [] }
    })
    await expect(
      handler(
        makePost({ action: 'onboarding', level: 'beginner', goal: 'daily', dailyMinutes: 10 }),
      ),
    ).rejects.toThrow('mất kết nối')
    expect(clientQuery.mock.calls.some((c) => /ROLLBACK/i.test(String(c[0])))).toBe(true)
    expect(release).toHaveBeenCalled()
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

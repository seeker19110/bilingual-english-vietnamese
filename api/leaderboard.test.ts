// Test /api/leaderboard — bảng xếp hạng tuần. Mock DB + auth, dùng thẳng logic thuần ở
// api/_lib/leaderboard.ts (không mock vì đó là code cần test gián tiếp qua handler).
import { describe, it, expect, beforeEach, vi } from 'vitest'

const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
const rateLimitOk = { value: true }
vi.mock('../packages/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => rateLimitOk.value,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

const query = vi.fn()
const readPool = { query: vi.fn() }
vi.mock('../packages/core-db/pgPool', () => ({
  getPgPool: () => ({ query }),
  getPgReadPool: () => readPool,
}))

async function importHandler() {
  vi.resetModules()
  const mod = await import('./leaderboard')
  return mod.default
}

function makeRequest(init?: RequestInit): Request {
  return new Request('http://localhost/api/leaderboard', init)
}

beforeEach(() => {
  authState.user = { userId: 'user-1' }
  rateLimitOk.value = true
  query.mockReset()
  readPool.query.mockReset()
})

describe('/api/leaderboard', () => {
  it('OPTIONS → 204', async () => {
    const handler = await importHandler()
    const res = await handler(makeRequest({ method: 'OPTIONS' }))
    expect(res.status).toBe(204)
  })

  it('method không hỗ trợ → 405', async () => {
    const handler = await importHandler()
    const res = await handler(makeRequest({ method: 'DELETE' }))
    expect(res.status).toBe(405)
  })

  it('vượt rate limit → 429', async () => {
    rateLimitOk.value = false
    const handler = await importHandler()
    const res = await handler(makeRequest())
    expect(res.status).toBe(429)
  })

  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const handler = await importHandler()
    const res = await handler(makeRequest())
    expect(res.status).toBe(401)
  })

  it('GET: không ai opt-in → top rỗng, me chưa tham gia', async () => {
    readPool.query.mockResolvedValueOnce({ rows: [] }) // profiles opt-in
    query.mockResolvedValueOnce({ rows: [{ nickname: null, league_opt_in: false }] }) // my profile
    const handler = await importHandler()
    const res = await handler(makeRequest())
    expect(res.status).toBe(200)
    const data = (await res.json()) as {
      top: unknown[]
      me: { optedIn: boolean; points: number | null }
    }
    expect(data.top).toEqual([])
    expect(data.me.optedIn).toBe(false)
    expect(data.me.points).toBeNull()
  })

  it('GET: có người opt-in, tính điểm và xếp hạng đúng', async () => {
    readPool.query
      .mockResolvedValueOnce({
        rows: [
          { id: 'user-1', nickname: 'An', league_opt_in: true },
          { id: 'user-2', nickname: 'Binh', league_opt_in: true },
        ],
      }) // profiles opt-in
      .mockResolvedValueOnce({
        rows: [
          {
            user_id: 'user-1',
            learn_count: 10,
            chat_count: 1,
            writing_count: 0,
            speaking_count: 0,
          },
        ],
      }) // usage
      .mockResolvedValueOnce({ rows: [{ user_id: 'user-1' }] }) // challenge_entries
    query.mockResolvedValueOnce({ rows: [{ nickname: 'An', league_opt_in: true }] }) // my profile
    const handler = await importHandler()
    const res = await handler(makeRequest())
    expect(res.status).toBe(200)
    const data = (await res.json()) as {
      top: { nickname: string; points: number; rank: number }[]
      me: { points: number | null; rank: number | null }
    }
    // user-1: 10*1 + 1*5 + 1*15 = 30 điểm; user-2: 0 điểm
    expect(data.top[0]).toEqual({ nickname: 'An', points: 30, rank: 1 })
    expect(data.me.points).toBe(30)
    expect(data.me.rank).toBe(1)
  })

  it('GET: lỗi đọc challenge_entries không làm vỡ bảng xếp hạng (best-effort)', async () => {
    readPool.query
      .mockResolvedValueOnce({ rows: [{ id: 'user-1', nickname: 'An', league_opt_in: true }] })
      .mockResolvedValueOnce({ rows: [] }) // usage
      .mockRejectedValueOnce(new Error('table not found')) // challenge_entries lỗi
    query.mockResolvedValueOnce({ rows: [{ nickname: 'An', league_opt_in: true }] })
    const handler = await importHandler()
    const res = await handler(makeRequest())
    expect(res.status).toBe(200)
  })

  it('GET: lỗi query chính → 500', async () => {
    readPool.query.mockRejectedValueOnce(new Error('db down'))
    const handler = await importHandler()
    const res = await handler(makeRequest())
    expect(res.status).toBe(500)
  })

  it('POST set-nickname: thành công → 200, trả nickname đã chuẩn hoá', async () => {
    query.mockResolvedValueOnce({ rows: [] }) // update profiles
    const handler = await importHandler()
    const res = await handler(
      makeRequest({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'set-nickname', nickname: 'HocVienA' }),
      }),
    )
    expect(res.status).toBe(200)
    const data = (await res.json()) as { ok: boolean; nickname: string }
    expect(data.ok).toBe(true)
    expect(data.nickname).toBe('HocVienA')
  })

  it('POST set-nickname: trùng tên (unique_violation 23505) → 409', async () => {
    query.mockRejectedValueOnce({ code: '23505' })
    const handler = await importHandler()
    const res = await handler(
      makeRequest({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'set-nickname', nickname: 'HocVienA' }),
      }),
    )
    expect(res.status).toBe(409)
  })

  it('POST set-nickname: lỗi DB khác → 500', async () => {
    query.mockRejectedValueOnce(new Error('db error'))
    const handler = await importHandler()
    const res = await handler(
      makeRequest({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'set-nickname', nickname: 'HocVienA' }),
      }),
    )
    expect(res.status).toBe(500)
  })

  it('POST set-nickname: nickname không hợp lệ (quá ngắn) → 400', async () => {
    const handler = await importHandler()
    const res = await handler(
      makeRequest({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'set-nickname', nickname: 'ab' }),
      }),
    )
    expect(res.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('POST opt-out: thành công → 200', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    const handler = await importHandler()
    const res = await handler(
      makeRequest({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'opt-out' }),
      }),
    )
    expect(res.status).toBe(200)
  })

  it('POST opt-out: lỗi DB → 500', async () => {
    query.mockRejectedValueOnce(new Error('db error'))
    const handler = await importHandler()
    const res = await handler(
      makeRequest({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'opt-out' }),
      }),
    )
    expect(res.status).toBe(500)
  })

  it('POST body không hợp lệ (thiếu action) → 400', async () => {
    const handler = await importHandler()
    const res = await handler(
      makeRequest({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )
    expect(res.status).toBe(400)
  })

  it('GET lần 2 trong 5 phút → dùng CACHE, không query lại bảng xếp hạng', async () => {
    readPool.query
      .mockResolvedValueOnce({ rows: [{ id: 'user-1', nickname: 'An', league_opt_in: true }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    query.mockResolvedValue({ rows: [{ nickname: 'An', league_opt_in: true }] })
    const handler = await importHandler()

    await handler(makeRequest())
    const callsSauLan1 = readPool.query.mock.calls.length
    await handler(makeRequest())
    // Lần 2 KHÔNG được đọc lại read-pool — nếu đọc lại là cache hỏng, mỗi lượt xem bảng
    // xếp hạng lại quét toàn bộ daily_usage của tuần.
    expect(readPool.query.mock.calls.length).toBe(callsSauLan1)
  })

  it('GET: người opt-in chưa đặt nickname → hiện "(chưa đặt tên)", không hiện null', async () => {
    readPool.query
      .mockResolvedValueOnce({ rows: [{ id: 'user-9', nickname: null, league_opt_in: true }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    query.mockResolvedValueOnce({ rows: [{ nickname: null, league_opt_in: false }] })
    const handler = await importHandler()
    const res = await handler(makeRequest())
    const data = (await res.json()) as { top: { nickname: string }[] }
    expect(data.top[0]?.nickname).toBe('(chưa đặt tên)')
  })

  it('GET: lỗi đọc profile của CHÍNH mình → vẫn trả 200 (best-effort)', async () => {
    readPool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
    query.mockRejectedValueOnce(new Error('profiles down'))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const handler = await importHandler()
    const res = await handler(makeRequest())
    expect(res.status).toBe(200)
    warn.mockRestore()
  })

  it('POST body không phải JSON hợp lệ → 400', async () => {
    const handler = await importHandler()
    const res = await handler(
      makeRequest({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{hong',
      }),
    )
    expect(res.status).toBe(400)
  })
})

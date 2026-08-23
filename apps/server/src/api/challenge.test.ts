// Test handler /api/challenge (Giai đoạn C phần còn lại) — ca biên quan trọng:
//  1. Chưa đăng nhập → 401.
//  2. Upsert theo (user_id, day), user_id lấy từ token.
//  3. feedback chuỗi JSON hợp lệ truyền thẳng jsonb; chuỗi thường được bọc thành JSON hợp lệ
//     (tránh lỗi "invalid input syntax for type json" của Postgres).
//  4. GET select day::text (tránh lệch múi giờ khi serialize cột date).

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

import handler from './challenge'
import { getPgPool } from '@dhcb/core-db/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  query.mockReset()
  query.mockResolvedValue({ rows: [] })
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  authState.user = { userId: 'user-1' }
})

const ENTRY = {
  day: '2026-07-19',
  challengeRound: 2,
  challengeDay: 3,
  topicDay: 3,
  transcript: 'hello world',
  feedback: '{"score":7}',
  durationSec: 60,
  wordCount: 12,
}

function makeRequest(method: string, body?: unknown): Request {
  return new Request('http://localhost/api/challenge', {
    method,
    headers: { 'content-type': 'application/json', Authorization: 'Bearer x' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

describe('/api/challenge', () => {
  it('chưa đăng nhập → 401', async () => {
    authState.user = null
    const resp = await handler(makeRequest('GET'))
    expect(resp.status).toBe(401)
    expect(query).not.toHaveBeenCalled()
  })

  it('GET select day::text theo user từ token', async () => {
    const resp = await handler(makeRequest('GET'))
    expect(resp.status).toBe(200)
    const [sql, params] = query.mock.calls[0] as [string, unknown[]]
    expect(sql).toContain('day::text')
    expect(params).toEqual(['user-1'])
  })

  it('POST upsert theo (user_id, day), feedback JSON hợp lệ truyền thẳng', async () => {
    const resp = await handler(makeRequest('POST', ENTRY))
    expect(resp.status).toBe(200)
    const [sql, params] = query.mock.calls[0] as [string, unknown[]]
    expect(sql).toContain('on conflict (user_id, day)')
    expect(params[0]).toBe('user-1')
    expect(params[6]).toBe('{"score":7}')
  })

  it('feedback chuỗi thường được bọc thành JSON hợp lệ; null giữ null', async () => {
    await handler(makeRequest('POST', { ...ENTRY, feedback: 'not json' }))
    let params = query.mock.calls[0]?.[1] as unknown[]
    expect(params[6]).toBe(JSON.stringify('not json'))

    query.mockClear()
    await handler(makeRequest('POST', { ...ENTRY, feedback: null }))
    params = query.mock.calls[0]?.[1] as unknown[]
    expect(params[6]).toBeNull()
  })

  it('thiếu challengeRound → mặc định round → 1', async () => {
    await handler(makeRequest('POST', { ...ENTRY, challengeRound: undefined, round: undefined }))
    const params = query.mock.calls[0]?.[1] as unknown[]
    expect(params[2]).toBe(1)
  })

  it('day sai định dạng → 400, không query', async () => {
    const resp = await handler(makeRequest('POST', { ...ENTRY, day: '19/07/2026' }))
    expect(resp.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })
})

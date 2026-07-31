// Test handler /api/history (Giai đoạn C phần còn lại) — tập trung các bất biến quan trọng:
//  1. Chưa đăng nhập → 401, không query DB.
//  2. POST learn-day CHỈ ghi cột learn_count (không có đường ghi cột đếm lượt tốn API).
//  3. Upsert session có mệnh đề WHERE user_id (thay RLS — không chiếm được bản ghi user khác).
//  4. GET trả camelCase đúng shape client (cloud.ts ghi thẳng vào localStorage).
// Mock pgPool + security để chạy OFFLINE.

import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../packages/core-db/pgPool', () => ({ getPgPool: vi.fn() }))
const authState: { user: { userId: string } | null } = { user: { userId: 'user-1' } }
vi.mock('../packages/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async () => authState.user,
  logSecurityEvent: () => {},
}))

import handler from './history'
import { getPgPool } from '../packages/core-db/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

beforeEach(() => {
  query.mockReset()
  query.mockResolvedValue({ rows: [] })
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
  authState.user = { userId: 'user-1' }
})

function makeRequest(method: string, body?: unknown): Request {
  return new Request('http://localhost/api/history', {
    method,
    headers: { 'content-type': 'application/json', Authorization: 'Bearer x' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

const CHAT_SESSION = {
  id: '123e4567-e89b-42d3-a456-426614174000',
  situation: 'restaurant',
  level: 'beginner',
  messages: [{ role: 'user', content: 'hi' }],
  createdAt: 1700000000000,
}

describe('/api/history', () => {
  it('chưa đăng nhập → 401, không query DB', async () => {
    authState.user = null
    const resp = await handler(makeRequest('GET'))
    expect(resp.status).toBe(401)
    expect(query).not.toHaveBeenCalled()
  })

  it('GET trả về camelCase đúng shape client', async () => {
    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'c1',
            user_id: 'user-1',
            situation: 's',
            level: 'beginner',
            messages: [1],
            created_at: '1700000000000', // bigint về dạng chuỗi
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            day: '2026-07-19',
            chat_count: 2,
            writing_count: 0,
            speaking_count: 1,
            stt_count: 0,
            pronounce_count: 0,
            learn_count: 10,
          },
        ],
      })
    const resp = await handler(makeRequest('GET'))
    expect(resp.status).toBe(200)
    const data = (await resp.json()) as {
      chat: { createdAt: number; userId: string }[]
      usage: { date: string; learnCount: number }[]
    }
    expect(data.chat[0]?.createdAt).toBe(1700000000000)
    expect(data.chat[0]?.userId).toBe('user-1')
    expect(data.usage[0]).toMatchObject({ date: '2026-07-19', learnCount: 10, chatCount: 2 })
  })

  it('POST chat upsert kèm WHERE user_id (không chiếm bản ghi user khác)', async () => {
    const resp = await handler(makeRequest('POST', { action: 'chat', session: CHAT_SESSION }))
    expect(resp.status).toBe(200)
    const [sql, params] = query.mock.calls[0] as [string, unknown[]]
    expect(sql).toContain('chat_sessions')
    expect(sql).toContain('where chat_sessions.user_id = excluded.user_id')
    expect(params[1]).toBe('user-1') // user_id lấy từ token, KHÔNG từ body
  })

  it('POST learn-day chỉ ghi learn_count', async () => {
    const resp = await handler(
      makeRequest('POST', { action: 'learn-day', day: '2026-07-19', learnCount: 5 }),
    )
    expect(resp.status).toBe(200)
    const [sql] = query.mock.calls[0] as [string]
    expect(sql).toContain('learn_count')
    expect(sql).not.toMatch(/chat_count|writing_count|speaking_count|stt_count|pronounce_count/)
  })

  it('POST body sai (mode lạ / thiếu field) → 400, không query', async () => {
    const resp = await handler(
      makeRequest('POST', { action: 'stt', day: '2026-07-19', learnCount: 5 }),
    )
    expect(resp.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })

  it('POST session id không phải uuid → 400', async () => {
    const resp = await handler(
      makeRequest('POST', { action: 'chat', session: { ...CHAT_SESSION, id: 'abc' } }),
    )
    expect(resp.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })
})

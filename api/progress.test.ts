// Test handler /api/progress — tập trung nhánh MỚI (2026-07-26): phát hiện học thật
// (mảng learned/hard/cefrGrammar/cefrDialogues dài ra so với bản đang lưu) → gọi
// grant_daily_bonus_rolling cộng thưởng lượt (cửa sổ trượt) cho gói Free. Không cộng khi chỉ đồng bộ
// lại dữ liệu cũ (không mảng nào dài ra) — tránh mở app không học gì cũng được thưởng.

import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../packages/core-db/pgPool', () => ({ getPgPool: vi.fn() }))
vi.mock('./_lib/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async () => ({ userId: 'u1' }),
  logSecurityEvent: () => undefined,
}))

import handler from './progress'
import { getPgPool } from '../packages/core-db/pgPool'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

const EMPTY_PROGRESS_ROW = {
  learned: [],
  hard: [],
  cefr_grammar: [],
  cefr_dialogues: [],
}

beforeEach(() => {
  query.mockReset()
  mockedGetPool.mockReturnValue({ query } as unknown as ReturnType<typeof getPgPool>)
})

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/progress', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: 'Bearer x' },
    body: JSON.stringify(body),
  })
}

function findCall(sqlSubstr: string): unknown[] | undefined {
  return query.mock.calls.find(([sql]) => (sql as string).includes(sqlSubstr))
}

describe('POST /api/progress — cộng thưởng lượt khi phát hiện học thật', () => {
  it('learned dài ra so với bản cũ → gọi grant_daily_bonus_rolling', async () => {
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('select learned, hard, cefr_grammar, cefr_dialogues'))
        return { rows: [EMPTY_PROGRESS_ROW] }
      return { rows: [] }
    })
    const resp = await handler(makeRequest({ learned: ['apple'] }))
    expect(resp.status).toBe(200)
    expect(findCall('grant_daily_bonus_rolling')).toBeTruthy()
  })

  it('cefrDialogues dài ra → cũng tính là học thật, gọi grant_daily_bonus_rolling', async () => {
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('select learned, hard, cefr_grammar, cefr_dialogues'))
        return { rows: [EMPTY_PROGRESS_ROW] }
      return { rows: [] }
    })
    const resp = await handler(makeRequest({ cefrDialogues: ['a1-u1-d1'] }))
    expect(resp.status).toBe(200)
    expect(findCall('grant_daily_bonus_rolling')).toBeTruthy()
  })

  it('gửi lại ĐÚNG dữ liệu cũ (không mảng nào dài ra) → KHÔNG cộng thưởng', async () => {
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('select learned, hard, cefr_grammar, cefr_dialogues'))
        return { rows: [{ ...EMPTY_PROGRESS_ROW, learned: ['apple'] }] }
      return { rows: [] }
    })
    const resp = await handler(makeRequest({ learned: ['apple'] }))
    expect(resp.status).toBe(200)
    expect(findCall('grant_daily_bonus_rolling')).toBeFalsy()
  })

  it('lỗi khi cộng thưởng (DB throw) → vẫn lưu tiến độ thành công (fail-open, không vỡ luồng chính)', async () => {
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('select learned, hard, cefr_grammar, cefr_dialogues'))
        return { rows: [EMPTY_PROGRESS_ROW] }
      if (sql.includes('grant_daily_bonus_rolling')) throw new Error('db down')
      return { rows: [] }
    })
    const resp = await handler(makeRequest({ learned: ['apple'] }))
    expect(resp.status).toBe(200)
    expect(findCall('insert into public.learning_progress')).toBeTruthy()
  })
})

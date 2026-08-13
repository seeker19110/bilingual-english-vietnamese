// Test handler /api/progress — tập trung nhánh MỚI (2026-07-26): phát hiện học thật
// (mảng learned/hard/cefrGrammar/cefrDialogues dài ra so với bản đang lưu) → gọi
// grant_daily_bonus_rolling cộng thưởng lượt (cửa sổ trượt) cho gói Free. Không cộng khi chỉ đồng bộ
// lại dữ liệu cũ (không mảng nào dài ra) — tránh mở app không học gì cũng được thưởng.

import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../packages/core-db/pgPool', () => ({ getPgPool: vi.fn() }))
vi.mock('../packages/core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: vi.fn(async () => true),
  validateAuth: vi.fn(async () => ({ userId: 'u1' })),
  logSecurityEvent: () => undefined,
}))

import handler from './progress'
import { getPgPool } from '../packages/core-db/pgPool'
import { checkRateLimit, validateAuth } from '../packages/core-auth/security'

const mockedGetPool = vi.mocked(getPgPool)
const query = vi.fn()

const EMPTY_PROGRESS_ROW = {
  learned: [],
  hard: [],
  srs: {},
  cefr_grammar: [],
  cefr_dialogues: [],
  cefr_unlocked: [],
  cefr_exams: {},
  placement: {},
  weekly_goal: {},
  achievements: [],
}

beforeEach(() => {
  query.mockReset()
  vi.mocked(checkRateLimit).mockResolvedValue(true)
  vi.mocked(validateAuth).mockResolvedValue({ userId: 'u1' })
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

describe('Rate limit và method not allowed', () => {
  it('rate limit vượt quá → trả 429', async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce(false)
    const req = new Request('http://localhost/api/progress', {
      method: 'GET',
      headers: { Authorization: 'Bearer x' },
    })
    const resp = await handler(req)
    expect(resp.status).toBe(429)
    const json = await resp.json()
    expect(json.error).toContain('Quá nhiều yêu cầu')
  })

  it('method PUT → trả 405 Method not allowed', async () => {
    const req = new Request('http://localhost/api/progress', {
      method: 'PUT',
      headers: { Authorization: 'Bearer x' },
    })
    const resp = await handler(req)
    expect(resp.status).toBe(405)
    const json = await resp.json()
    expect(json.error).toBe('Method not allowed')
  })
})

describe('GET /api/progress — đọc tiến độ học', () => {
  it('không có dữ liệu tiến độ → trả body null', async () => {
    query.mockResolvedValueOnce({ rows: [] })
    const req = new Request('http://localhost/api/progress', {
      method: 'GET',
      headers: { Authorization: 'Bearer x' },
    })
    const resp = await handler(req)
    expect(resp.status).toBe(200)
    const json = await resp.json()
    expect(json).toBeNull()
  })

  it('có dữ liệu tiến độ → trả camelCase response', async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          learned: ['apple'],
          hard: ['banana'],
          srs: { apple: { reps: 3 } },
          cefr_grammar: ['g1'],
          cefr_dialogues: ['d1'],
          cefr_unlocked: ['u1'],
          cefr_exams: { e1: { score: 90 } },
          placement: { cefr: 'A2' },
          weekly_goal: { target: 10 },
          achievements: ['first_word'],
        },
      ],
    })
    const req = new Request('http://localhost/api/progress', {
      method: 'GET',
      headers: { Authorization: 'Bearer x' },
    })
    const resp = await handler(req)
    expect(resp.status).toBe(200)
    const json = await resp.json()
    expect(json).toEqual({
      learned: ['apple'],
      hard: ['banana'],
      srs: { apple: { reps: 3 } },
      cefrGrammar: ['g1'],
      cefrDialogues: ['d1'],
      cefrUnlocked: ['u1'],
      cefrExams: { e1: { score: 90 } },
      placement: { cefr: 'A2' },
      weeklyGoal: { target: 10 },
      achievements: ['first_word'],
    })
  })
})

describe('POST /api/progress — cộng thưởng lượt khi phát hiện học thật', () => {
  it('learned dài ra so với bản cũ → gọi grant_daily_bonus_rolling', async () => {
    query.mockImplementation(async (sql: string) => {
      if (
        sql.includes(
          'select learned, hard, srs, cefr_grammar, cefr_dialogues, cefr_unlocked, cefr_exams',
        )
      )
        return { rows: [EMPTY_PROGRESS_ROW] }
      return { rows: [] }
    })
    const resp = await handler(makeRequest({ learned: ['apple'] }))
    expect(resp.status).toBe(200)
    expect(findCall('grant_daily_bonus_rolling')).toBeTruthy()
  })

  it('cefrDialogues dài ra → cũng tính là học thật, gọi grant_daily_bonus_rolling', async () => {
    query.mockImplementation(async (sql: string) => {
      if (
        sql.includes(
          'select learned, hard, srs, cefr_grammar, cefr_dialogues, cefr_unlocked, cefr_exams',
        )
      )
        return { rows: [EMPTY_PROGRESS_ROW] }
      return { rows: [] }
    })
    const resp = await handler(makeRequest({ cefrDialogues: ['a1-u1-d1'] }))
    expect(resp.status).toBe(200)
    expect(findCall('grant_daily_bonus_rolling')).toBeTruthy()
  })

  it('gửi lại ĐÚNG dữ liệu cũ (không mảng nào dài ra) → KHÔNG cộng thưởng', async () => {
    query.mockImplementation(async (sql: string) => {
      if (
        sql.includes(
          'select learned, hard, srs, cefr_grammar, cefr_dialogues, cefr_unlocked, cefr_exams',
        )
      )
        return { rows: [{ ...EMPTY_PROGRESS_ROW, learned: ['apple'] }] }
      return { rows: [] }
    })
    const resp = await handler(makeRequest({ learned: ['apple'] }))
    expect(resp.status).toBe(200)
    expect(findCall('grant_daily_bonus_rolling')).toBeFalsy()
  })

  it('lỗi khi cộng thưởng (DB throw) → vẫn lưu tiến độ thành công (fail-open, không vỡ luồng chính)', async () => {
    query.mockImplementation(async (sql: string) => {
      if (
        sql.includes(
          'select learned, hard, srs, cefr_grammar, cefr_dialogues, cefr_unlocked, cefr_exams',
        )
      )
        return { rows: [EMPTY_PROGRESS_ROW] }
      if (sql.includes('grant_daily_bonus_rolling')) throw new Error('db down')
      return { rows: [] }
    })
    const resp = await handler(makeRequest({ learned: ['apple'] }))
    expect(resp.status).toBe(200)
    expect(findCall('insert into english.learning_progress')).toBeTruthy()
  })
})

// Điều tra "mất dữ liệu học tập admin": trước đây POST ghi đè thẳng dữ liệu client gửi lên
// (on conflict do update set x = excluded.x) — một thiết bị/tab gửi lên bản CŨ/RỖNG (trước
// khi kịp pull) sẽ xoá mất dữ liệu server đang có. Nhóm test dưới xác nhận srs/cefrExams/
// placement/weeklyGoal (không có thao tác "bỏ đánh dấu" thật) được HỢP NHẤT với dữ liệu đã
// có trên server trước khi lưu, thay vì ghi đè thẳng.
describe('POST /api/progress — hợp nhất với dữ liệu đã có trên server (chống mất dữ liệu race)', () => {
  function insertedParams(): unknown[] {
    const call = findCall('insert into english.learning_progress')
    if (!call) throw new Error('không thấy câu insert')
    return call[1] as unknown[]
  }

  it('srs: giữ thẻ đã có trên server nếu reps cao hơn bản client gửi lên (client gửi bản CŨ)', async () => {
    query.mockImplementation(async (sql: string) => {
      if (
        sql.includes(
          'select learned, hard, srs, cefr_grammar, cefr_dialogues, cefr_unlocked, cefr_exams',
        )
      )
        return {
          rows: [
            { ...EMPTY_PROGRESS_ROW, srs: { book: { interval: 5, ease: 2, due: 10, reps: 5 } } },
          ],
        }
      return { rows: [] }
    })
    // Client gửi lên bản CŨ (reps=1) — vd tab/thiết bị chưa kịp pull dữ liệu mới.
    const resp = await handler(
      makeRequest({ srs: { book: { interval: 1, ease: 2, due: 0, reps: 1 } } }),
    )
    expect(resp.status).toBe(200)
    const params = insertedParams()
    expect(JSON.parse(params[3] as string)).toEqual({
      book: { interval: 5, ease: 2, due: 10, reps: 5 },
    })
  })

  it('placement: giữ bản trên server nếu lastAt mới hơn bản client gửi lên', async () => {
    query.mockImplementation(async (sql: string) => {
      if (
        sql.includes(
          'select learned, hard, srs, cefr_grammar, cefr_dialogues, cefr_unlocked, cefr_exams',
        )
      )
        return {
          rows: [
            {
              ...EMPTY_PROGRESS_ROW,
              placement: { cefr: 'B1', appLevel: 'B1', lastAt: '2026-08-02T00:00:00Z' },
            },
          ],
        }
      return { rows: [] }
    })
    const resp = await handler(
      makeRequest({ placement: { cefr: 'A1', appLevel: 'A1', lastAt: '2026-08-01T00:00:00Z' } }),
    )
    expect(resp.status).toBe(200)
    const params = insertedParams()
    expect(JSON.parse(params[8] as string)).toEqual({
      cefr: 'B1',
      appLevel: 'B1',
      lastAt: '2026-08-02T00:00:00Z',
    })
  })

  it('learned HỢP UNION với server (2026-08-13: chỉ tăng, không giảm dù đổi máy/nhiều thiết bị) — client bỏ đánh dấu 1 từ KHÔNG xoá được nó khỏi server nếu server đã từng lưu', async () => {
    query.mockImplementation(async (sql: string) => {
      if (
        sql.includes(
          'select learned, hard, srs, cefr_grammar, cefr_dialogues, cefr_unlocked, cefr_exams',
        )
      )
        return { rows: [{ ...EMPTY_PROGRESS_ROW, learned: ['apple', 'banana'] }] }
      return { rows: [] }
    })
    // Client vừa unmarkLearned('banana') — gửi lên mảng đã bớt đi 1 từ, nhưng server union
    // lại nên 'banana' vẫn còn (đúng yêu cầu "chỉ tăng, không giảm").
    const resp = await handler(makeRequest({ learned: ['apple'] }))
    expect(resp.status).toBe(200)
    const params = insertedParams()
    expect(JSON.parse(params[1] as string)).toEqual(['apple', 'banana'])
  })

  it('hard VẪN ghi đè theo client (chỉ là lọc hiển thị, không phải tiến độ học)', async () => {
    query.mockImplementation(async (sql: string) => {
      if (
        sql.includes(
          'select learned, hard, srs, cefr_grammar, cefr_dialogues, cefr_unlocked, cefr_exams',
        )
      )
        return { rows: [{ ...EMPTY_PROGRESS_ROW, hard: ['apple', 'banana'] }] }
      return { rows: [] }
    })
    const resp = await handler(makeRequest({ hard: ['apple'] }))
    expect(resp.status).toBe(200)
    const params = insertedParams()
    expect(JSON.parse(params[2] as string)).toEqual(['apple'])
  })
})

describe('Ca biên: cột DB trả NULL và chưa có bản ghi nào', () => {
  it('OPTIONS → 204 (preflight CORS), không cần đăng nhập', async () => {
    const resp = await handler(new Request('http://localhost/api/progress', { method: 'OPTIONS' }))
    expect(resp.status).toBe(204)
    expect(query).not.toHaveBeenCalled()
  })

  it('GET với mọi cột NULL → trả mảng/đối tượng RỖNG, không trả null gây vỡ client', async () => {
    // DB cũ (trước các migration thêm cột) trả null cho cột chưa từng ghi. Client
    // (cloud.ts) ghi thẳng response vào localStorage nên null sẽ làm vỡ chỗ dùng .length.
    query.mockResolvedValue({
      rows: [
        {
          learned: null,
          hard: null,
          srs: null,
          cefr_grammar: null,
          cefr_dialogues: null,
          cefr_unlocked: null,
          cefr_exams: null,
          placement: null,
          weekly_goal: null,
          achievements: null,
        },
      ],
    })
    const resp = await handler(
      new Request('http://localhost/api/progress', {
        method: 'GET',
        headers: { Authorization: 'Bearer x' },
      }),
    )
    expect(resp.status).toBe(200)
    expect(await resp.json()).toEqual({
      learned: [],
      hard: [],
      srs: {},
      cefrGrammar: [],
      cefrDialogues: [],
      cefrUnlocked: [],
      cefrExams: {},
      placement: {},
      weeklyGoal: {},
      achievements: [],
    })
  })

  it('POST khi CHƯA có bản ghi nào → tính là học thật và lưu được (không nổ vì existing undefined)', async () => {
    query.mockResolvedValue({ rows: [] })
    const resp = await handler(makeRequest({ learned: ['apple'] }))
    expect(resp.status).toBe(200)
    expect(findCall('grant_daily_bonus_rolling')).toBeTruthy()
    expect(findCall('insert into english.learning_progress')).toBeTruthy()
  })

  it('POST khi bản ghi cũ có cột NULL → hợp nhất dùng mặc định rỗng, không nổ', async () => {
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('select learned, hard, srs'))
        return {
          rows: [
            {
              ...EMPTY_PROGRESS_ROW,
              learned: null,
              srs: null,
              cefr_exams: null,
              placement: null,
              weekly_goal: null,
            },
          ],
        }
      return { rows: [] }
    })
    const resp = await handler(makeRequest({ learned: ['apple'] }))
    expect(resp.status).toBe(200)
  })

  it('cefrGrammar dài ra → cũng tính là học thật', async () => {
    query.mockImplementation(async (sql: string) => {
      if (sql.includes('select learned, hard, srs'))
        return { rows: [{ ...EMPTY_PROGRESS_ROW, cefr_grammar: ['a1-u1'] }] }
      return { rows: [] }
    })
    await handler(makeRequest({ cefrGrammar: ['a1-u1', 'a1-u2'] }))
    expect(findCall('grant_daily_bonus_rolling')).toBeTruthy()
  })

  it('body không phải JSON hợp lệ → 400, không đụng DB', async () => {
    const resp = await handler(
      new Request('http://localhost/api/progress', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: 'Bearer x' },
        body: '{hong',
      }),
    )
    expect(resp.status).toBe(400)
    expect(query).not.toHaveBeenCalled()
  })
})

// Test personService — Personal World Model (V2-03 slice 1).
// Mock `pg` Pool bằng tay (giống khuôn packages/core-learner/learnerState.test.ts): mỗi test khai
// báo trước các "hàng" DB trả về theo từng câu SQL, để kiểm ĐÚNG hành vi domain (gate derived,
// supersede append, 409 optimistic concurrency) mà không cần Postgres thật.

import { describe, it, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import {
  getOrCreatePerson,
  declareFact,
  listFacts,
  correctFact,
  deleteFact,
  exportPersonData,
} from './personService.js'
import { ConflictError, NotFoundError } from '../core-errors/appError.js'

const NOW = new Date('2026-08-16T00:00:00.000Z')
const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const USER_ID = '22222222-2222-4222-8222-222222222222'
const FACT_ID = '33333333-3333-4333-8333-333333333333'
const NEW_FACT_ID = '44444444-4444-4444-8444-444444444444'

interface FactRowLike {
  id: string
  person_id: string
  namespace: string
  key: string
  value: unknown
  origin: string
  confidence: string
  source: unknown
  sensitivity: string
  created_at: Date
  updated_at: Date
  last_confirmed_at: Date | null
  expires_at: Date | null
  supersedes: string | null
  is_current: boolean
}

function factRow(over: Partial<FactRowLike> = {}): FactRowLike {
  return {
    id: FACT_ID,
    person_id: PERSON_ID,
    namespace: 'profile',
    key: 'city',
    value: 'Hà Nội',
    origin: 'user_declared',
    confidence: '1.00',
    source: { type: 'onboarding' },
    sensitivity: 'personal',
    created_at: NOW,
    updated_at: NOW,
    last_confirmed_at: null,
    expires_at: null,
    supersedes: null,
    is_current: true,
    ...over,
  }
}

const personRow = {
  id: PERSON_ID,
  user_id: USER_ID,
  display_name: 'Liên',
  created_at: NOW,
  updated_at: NOW,
}

/** Pool giả: `handler` nhận (sql, params) và trả mảng rows. `connect()` trả cùng handler để
 * `withTransaction` chạy được (begin/commit/rollback được nuốt). */
function mockPool(handler: (sql: string, params: unknown[]) => unknown[]) {
  const query = vi.fn(async (sql: string, params: unknown[] = []) => {
    const trimmed = sql.trim().toLowerCase()
    if (trimmed === 'begin' || trimmed === 'commit' || trimmed === 'rollback') return { rows: [] }
    return { rows: handler(sql, params) }
  })
  const client = { query, release: vi.fn() }
  const pool = { query, connect: vi.fn(async () => client) } as unknown as Pool
  return { pool, query }
}

describe('getOrCreatePerson', () => {
  it('đã có Person → trả về, KHÔNG insert (idempotent)', async () => {
    const { pool, query } = mockPool((sql) => (sql.includes('select') ? [personRow] : []))
    const person = await getOrCreatePerson(pool, USER_ID)
    expect(person.id).toBe(PERSON_ID)
    expect(person.userId).toBe(USER_ID)
    expect(person.schemaVersion).toBe(1)
    expect(query).toHaveBeenCalledTimes(1)
  })

  it('chưa có → insert rồi trả bản mới', async () => {
    const { pool } = mockPool((sql) =>
      sql.includes('insert into personal.persons') ? [personRow] : [],
    )
    const person = await getOrCreatePerson(pool, USER_ID)
    expect(person.displayName).toBe('Liên')
  })

  it('đua với request song song (insert do nothing) → đọc lại bản của request kia', async () => {
    let selects = 0
    const { pool } = mockPool((sql) => {
      if (sql.includes('insert')) return []
      selects += 1
      return selects === 1 ? [] : [personRow]
    })
    expect((await getOrCreatePerson(pool, USER_ID)).id).toBe(PERSON_ID)
  })
})

describe('declareFact', () => {
  it('chưa có fact cũ → insert bản đầu, supersedes null', async () => {
    const inserted = factRow({ id: NEW_FACT_ID, supersedes: null })
    const { pool, query } = mockPool((sql) => (sql.includes('insert') ? [inserted] : []))
    const fact = await declareFact(pool, {
      personId: PERSON_ID,
      namespace: 'profile',
      key: 'city',
      value: 'Hà Nội',
      origin: 'user_declared',
      confidence: 1,
      source: { type: 'onboarding' },
      sensitivity: 'personal',
    })
    expect(fact.id).toBe(NEW_FACT_ID)
    expect(fact.supersedes).toBeUndefined()
    expect(fact.confidence).toBe(1)
    // Không có bản cũ ⇒ không được chạy update hạ cờ nào.
    expect(query.mock.calls.some(([sql]) => String(sql).includes('set is_current = false'))).toBe(
      false,
    )
  })

  it('có fact cũ → hạ cờ bản cũ + insert bản mới trỏ supersedes về nó (APPEND, không update giá trị)', async () => {
    const old = factRow()
    const inserted = factRow({ id: NEW_FACT_ID, value: 'Đà Nẵng', supersedes: FACT_ID })
    const { pool, query } = mockPool((sql) => {
      if (sql.includes('for update')) return [old]
      if (sql.includes('insert')) return [inserted]
      return []
    })
    const fact = await declareFact(pool, {
      personId: PERSON_ID,
      namespace: 'profile',
      key: 'city',
      value: 'Đà Nẵng',
      origin: 'user_declared',
      confidence: 1,
      source: { type: 'chat' },
      sensitivity: 'personal',
    })
    expect(fact.supersedes).toBe(FACT_ID)
    const updateCall = query.mock.calls.find(([sql]) =>
      String(sql).includes('set is_current = false'),
    )
    expect(updateCall?.[1]).toEqual([FACT_ID])
    // Không có câu delete nào — lịch sử phải giữ nguyên.
    expect(query.mock.calls.some(([sql]) => String(sql).toLowerCase().includes('delete'))).toBe(
      false,
    )
  })

  it('GATE V2-03: derived KHÔNG được ghi đè fact user_declared → ConflictError, không ghi gì', async () => {
    const { pool, query } = mockPool((sql) => (sql.includes('for update') ? [factRow()] : []))
    await expect(
      declareFact(pool, {
        personId: PERSON_ID,
        namespace: 'profile',
        key: 'city',
        value: 'Sài Gòn',
        origin: 'derived',
        confidence: 0.7,
        source: { type: 'inference' },
        sensitivity: 'personal',
      }),
    ).rejects.toBeInstanceOf(ConflictError)
    expect(query.mock.calls.some(([sql]) => String(sql).includes('insert'))).toBe(false)
    expect(query.mock.calls.some(([sql]) => String(sql).includes('set is_current = false'))).toBe(
      false,
    )
  })

  it('derived ĐƯỢC phép supersede fact observed (chỉ user_declared mới bất khả xâm phạm)', async () => {
    const old = factRow({ origin: 'observed', confidence: '0.60' })
    const inserted = factRow({
      id: NEW_FACT_ID,
      origin: 'derived',
      confidence: '0.80',
      supersedes: FACT_ID,
    })
    const { pool } = mockPool((sql) => {
      if (sql.includes('for update')) return [old]
      if (sql.includes('insert')) return [inserted]
      return []
    })
    const fact = await declareFact(pool, {
      personId: PERSON_ID,
      namespace: 'profile',
      key: 'city',
      value: 'Sài Gòn',
      origin: 'derived',
      confidence: 0.8,
      source: { type: 'inference' },
      sensitivity: 'personal',
    })
    expect(fact.origin).toBe('derived')
    expect(fact.confidence).toBe(0.8)
  })
})

describe('listFacts', () => {
  it('mặc định chỉ lấy bản đang hiệu lực', async () => {
    const { pool, query } = mockPool(() => [factRow()])
    const facts = await listFacts(pool, PERSON_ID)
    expect(facts).toHaveLength(1)
    expect(String(query.mock.calls[0]?.[0])).toContain('is_current')
  })

  it('includeHistory + lọc namespace', async () => {
    const { pool, query } = mockPool(() => [
      factRow(),
      factRow({ id: NEW_FACT_ID, is_current: false }),
    ])
    const facts = await listFacts(pool, PERSON_ID, { namespace: 'profile', includeHistory: true })
    expect(facts).toHaveLength(2)
    const [sql, params] = query.mock.calls[0] ?? []
    expect(String(sql)).not.toContain('and is_current')
    expect(params).toEqual([PERSON_ID, 'profile'])
  })
})

describe('correctFact', () => {
  it('sửa thành công → bản cũ hạ cờ, bản mới supersedes trỏ đúng', async () => {
    const inserted = factRow({ id: NEW_FACT_ID, value: 'Huế', supersedes: FACT_ID })
    const { pool, query } = mockPool((sql) => {
      if (sql.includes('for update')) return [factRow()]
      if (sql.includes('insert')) return [inserted]
      return []
    })
    const fact = await correctFact(pool, PERSON_ID, FACT_ID, { value: 'Huế' })
    expect(fact.supersedes).toBe(FACT_ID)
    expect(fact.value).toBe('Huế')
    // Câu select phải lọc theo person_id — không cho sửa fact của người khác.
    expect(query.mock.calls[1]?.[1]).toEqual([FACT_ID, PERSON_ID])
  })

  it('fact đã bị người khác sửa/xoá (is_current=false) → ConflictError (409)', async () => {
    const { pool } = mockPool((sql) =>
      sql.includes('for update') ? [factRow({ is_current: false })] : [],
    )
    await expect(correctFact(pool, PERSON_ID, FACT_ID, { value: 'x' })).rejects.toBeInstanceOf(
      ConflictError,
    )
  })

  it('không tìm thấy (hoặc của người khác) → NotFoundError', async () => {
    const { pool } = mockPool(() => [])
    await expect(correctFact(pool, PERSON_ID, FACT_ID, { value: 'x' })).rejects.toBeInstanceOf(
      NotFoundError,
    )
  })

  it('hạ user_declared xuống derived cũng bị GATE chặn', async () => {
    const { pool } = mockPool((sql) => (sql.includes('for update') ? [factRow()] : []))
    await expect(
      correctFact(pool, PERSON_ID, FACT_ID, { origin: 'derived' }),
    ).rejects.toBeInstanceOf(ConflictError)
  })

  it('correctFact với expiresAt cập nhật thời hạn', async () => {
    const expiry = new Date('2026-12-31T00:00:00Z').toISOString()
    const { pool } = mockPool((sql) => {
      if (sql.includes('for update')) return [factRow()]
      if (sql.includes('insert into personal.personal_facts'))
        return [factRow({ id: NEW_FACT_ID, expires_at: new Date(expiry) })]
      return []
    })
    const fact = await correctFact(pool, PERSON_ID, FACT_ID, { expiresAt: expiry })
    expect(fact.expiresAt).toBe(expiry)
  })
})

describe('deleteFact', () => {
  it('không tìm thấy fact → NotFoundError', async () => {
    const { pool } = mockPool(() => [])
    await expect(deleteFact(pool, PERSON_ID, FACT_ID)).rejects.toBeInstanceOf(NotFoundError)
  })

  it('xoá mềm: chỉ update is_current, không có câu delete', async () => {
    const { pool, query } = mockPool((sql) => (sql.includes('for update') ? [factRow()] : []))
    await deleteFact(pool, PERSON_ID, FACT_ID)
    expect(query.mock.calls.some(([sql]) => String(sql).includes('set is_current = false'))).toBe(
      true,
    )
    expect(
      query.mock.calls.some(([sql]) => String(sql).toLowerCase().includes('delete from')),
    ).toBe(false)
  })

  it('xoá lại lần 2 (đã hết hiệu lực) → ConflictError', async () => {
    const { pool } = mockPool((sql) =>
      sql.includes('for update') ? [factRow({ is_current: false })] : [],
    )
    await expect(deleteFact(pool, PERSON_ID, FACT_ID)).rejects.toBeInstanceOf(ConflictError)
  })
})

describe('exportPersonData', () => {
  it('trả person + toàn bộ fact KỂ CẢ lịch sử', async () => {
    const { pool, query } = mockPool(() => [
      factRow({ is_current: false }),
      factRow({ id: NEW_FACT_ID, supersedes: FACT_ID }),
    ])
    const person = {
      id: PERSON_ID,
      userId: USER_ID,
      displayName: 'Liên',
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
      schemaVersion: 1 as const,
    }
    const data = await exportPersonData(pool, person)
    expect(data.person.id).toBe(PERSON_ID)
    expect(data.facts).toHaveLength(2)
    expect(String(query.mock.calls[0]?.[0])).not.toContain('and is_current')
  })
})

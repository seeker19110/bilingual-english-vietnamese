// Test examPlanService — CRUD kế hoạch ôn thi. Mock Pool bằng tay (khuôn consentService.test.ts).

import { describe, it, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { getActivePlan, createPlan, archivePlan } from './examPlanService.js'
import { ConflictError, NotFoundError } from '@dhcb/core-errors/appError'

const USER = '11111111-1111-4111-8111-111111111111'
const PLAN = '22222222-2222-4222-8222-222222222222'
const NOW = new Date('2026-08-26T00:00:00.000Z')
const TODAY = '2026-08-26'

function planRow(over: Record<string, unknown> = {}) {
  return {
    id: PLAN,
    user_id: USER,
    exam_kind: 'vao10-english',
    exam_date: '2026-12-26',
    target_label: null,
    scope_items: 1000,
    daily_cap_items: 10,
    rest_days: [0],
    status: 'active',
    created_at: NOW,
    ...over,
  }
}

function mockPool(handler: (sql: string, params: unknown[]) => unknown[]) {
  const query = vi.fn(async (sql: string, params: unknown[] = []) => ({
    rows: handler(sql.trim().toLowerCase(), params),
    rowCount: handler(sql.trim().toLowerCase(), params).length,
  }))
  return { pool: { query } as unknown as Pool, query }
}

describe('getActivePlan', () => {
  it('không có kế hoạch → null', async () => {
    const { pool } = mockPool(() => [])
    expect(await getActivePlan(pool, USER, TODAY)).toBeNull()
  })

  it('trả kế hoạch đang chạy, ngày thi giữ nguyên dạng YYYY-MM-DD', async () => {
    const { pool } = mockPool((sql) => (sql.startsWith('select') ? [planRow()] : []))
    const plan = await getActivePlan(pool, USER, TODAY)
    expect(plan?.examDate).toBe('2026-12-26')
    expect(plan?.restDays).toEqual([0])
  })

  it('ngày thi ĐÃ QUA → tự chuyển expired ngay lúc đọc, trả null', async () => {
    const seen: string[] = []
    const { pool } = mockPool((sql) => {
      seen.push(sql)
      return sql.startsWith('select') ? [planRow({ exam_date: '2026-08-25' })] : []
    })
    expect(await getActivePlan(pool, USER, TODAY)).toBeNull()
    expect(seen.some((s) => s.includes("status = 'expired'"))).toBe(true)
  })

  it('ngày thi ĐÚNG hôm nay vẫn còn hiệu lực (không hết hạn sớm một ngày)', async () => {
    const { pool } = mockPool((sql) =>
      sql.startsWith('select') ? [planRow({ exam_date: TODAY })] : [],
    )
    expect(await getActivePlan(pool, USER, TODAY)).not.toBeNull()
  })

  it('exam_date kiểu Date từ driver → cắt theo lịch ĐỊA PHƯƠNG, không lệch ngày', async () => {
    // 26/12/2026 lúc 00:00 giờ địa phương: toISOString() sẽ ra 25/12 ở múi giờ dương.
    const local = new Date(2026, 11, 26)
    const { pool } = mockPool((sql) =>
      sql.startsWith('select') ? [planRow({ exam_date: local })] : [],
    )
    expect((await getActivePlan(pool, USER, TODAY))?.examDate).toBe('2026-12-26')
  })
})

describe('createPlan', () => {
  const input = {
    examKind: 'vao10-english' as const,
    examDate: '2026-12-26',
    scopeItems: 1000,
  }

  it('ngày thi trong quá khứ → ConflictError, không chèn gì', async () => {
    const { pool, query } = mockPool(() => [])
    await expect(
      createPlan(pool, USER, { ...input, examDate: '2026-08-25' }, TODAY),
    ).rejects.toBeInstanceOf(ConflictError)
    expect(query).not.toHaveBeenCalled()
  })

  it('mặc định trần 10 mục/ngày và không có ngày nghỉ', async () => {
    const { pool, query } = mockPool(() => [planRow()])
    await createPlan(pool, USER, input, TODAY)
    const params = query.mock.calls[0]![1] as unknown[]
    expect(params[5]).toBe(10)
    expect(params[6]).toEqual([])
  })

  it('đã có kế hoạch đang chạy (23505) → ConflictError có nghĩa, không phải lỗi 500', async () => {
    const query = vi.fn(async () => {
      throw Object.assign(new Error('dup'), { code: '23505' })
    })
    const pool = { query } as unknown as Pool
    await expect(createPlan(pool, USER, input, TODAY)).rejects.toBeInstanceOf(ConflictError)
  })

  it('lỗi DB khác → ném lại nguyên vẹn, không nuốt im lặng', async () => {
    const query = vi.fn(async () => {
      throw Object.assign(new Error('mất kết nối'), { code: '08006' })
    })
    const pool = { query } as unknown as Pool
    await expect(createPlan(pool, USER, input, TODAY)).rejects.toThrow('mất kết nối')
  })
})

describe('archivePlan', () => {
  it('kiểm quyền NGAY TRONG câu SQL (user_id trong where)', async () => {
    const { pool, query } = mockPool(() => [planRow()])
    await archivePlan(pool, USER, PLAN)
    expect(String(query.mock.calls[0]![0]).toLowerCase()).toContain('user_id = $2')
  })

  it('không có kế hoạch đang chạy khớp → NotFoundError', async () => {
    const { pool } = mockPool(() => [])
    await expect(archivePlan(pool, USER, PLAN)).rejects.toBeInstanceOf(NotFoundError)
  })
})

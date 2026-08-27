import { describe, it, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import {
  getSpecProgress,
  enrollSpecialization,
  unenrollSpecialization,
  setSpecStageProgress,
} from './specProgressService.js'

/**
 * Pool giả: ghi lại mọi câu SQL + tham số. `connect()` trả về chính client giả để
 * `withTransaction` chạy được (begin/commit cũng đi qua cùng bộ ghi nhận).
 */
function fakePool(rowsByCall: unknown[][] = []) {
  const calls: { sql: string; params: unknown[] }[] = []
  let i = 0
  const query = vi.fn(async (sql: string, params?: unknown[]) => {
    calls.push({ sql, params: params ?? [] })
    return { rows: rowsByCall[i++] ?? [] }
  })
  const client = { query, release: vi.fn() }
  const pool = { query, connect: vi.fn(async () => client) } as unknown as Pool
  return { pool, calls, query, client }
}

/** Mọi câu SQL chạm dữ liệu đều phải kèm ràng buộc user_id — bất biến cách ly người dùng. */
function dataCalls(calls: { sql: string; params: unknown[] }[]) {
  return calls.filter((c) => !/^\s*(begin|commit|rollback)\s*$/i.test(c.sql))
}

describe('getSpecProgress', () => {
  it('chưa chọn hướng nào → snapshot rỗng hợp lệ (primary null, không ném lỗi)', async () => {
    const { pool } = fakePool([[], []])
    expect(await getSpecProgress(pool, 'u1')).toEqual({
      primarySpecId: null,
      crossSpecIds: [],
      enrollments: [],
      stages: [],
    })
  })

  it('tách hướng chính và hướng nền, đổi thời điểm về mili-giây epoch', async () => {
    const at = new Date(1_756_000_000_000)
    const { pool } = fakePool([
      [
        { spec_id: 'web', role: 'primary', started_at: at },
        { spec_id: 'architecture', role: 'cross', started_at: at },
      ],
      [{ spec_id: 'web', stage_id: 'web-s1', status: 'completed', completed_at: at }],
    ])
    const snap = await getSpecProgress(pool, 'u1')
    expect(snap.primarySpecId).toBe('web')
    expect(snap.crossSpecIds).toEqual(['architecture'])
    expect(snap.stages).toEqual([
      { specId: 'web', stageId: 'web-s1', status: 'completed', completedAt: at.getTime() },
    ])
  })

  it('chỉ đọc dữ liệu của chính mình: mọi truy vấn lọc theo user_id được truyền vào', async () => {
    const { pool, calls } = fakePool([[], []])
    await getSpecProgress(pool, 'user-A')
    expect(calls).toHaveLength(2)
    for (const c of calls) {
      expect(c.sql).toContain('user_id = $1')
      expect(c.params[0]).toBe('user-A')
    }
  })
})

describe('enrollSpecialization', () => {
  it('hướng lạ → từ chối, KHÔNG chạm DB', async () => {
    const { pool, query } = fakePool()
    expect(await enrollSpecialization(pool, 'u1', 'blockchain')).toEqual({
      ok: false,
      error: 'Hướng "blockchain" không tồn tại',
    })
    expect(query).not.toHaveBeenCalled()
  })

  it('hướng sản phẩm → vai trò primary, xoá hướng chính cũ trong CÙNG transaction', async () => {
    const { pool, calls } = fakePool()
    expect(await enrollSpecialization(pool, 'u1', 'web')).toEqual({ ok: true })
    const sqls = calls.map((c) => c.sql.trim().toLowerCase())
    expect(sqls[0]).toBe('begin')
    expect(sqls.at(-1)).toBe('commit')
    expect(sqls.some((s) => s.startsWith('delete from programming.spec_enrollment'))).toBe(true)
    const insert = calls.find((c) => c.sql.includes('insert into'))
    expect(insert?.params).toEqual(['u1', 'web', 'primary'])
  })

  it('hướng NỀN (crossCutting) → vai trò cross và KHÔNG xoá hướng chính đang có', async () => {
    const { pool, calls } = fakePool()
    await enrollSpecialization(pool, 'u1', 'architecture')
    expect(calls.some((c) => c.sql.includes('delete from'))).toBe(false)
    expect(calls.find((c) => c.sql.includes('insert into'))?.params).toEqual([
      'u1',
      'architecture',
      'cross',
    ])
  })

  it('lũy đẳng: chọn cùng một hướng hai lần → upsert theo khoá, không tạo dòng thứ hai', async () => {
    const { pool, calls } = fakePool()
    await enrollSpecialization(pool, 'u1', 'web')
    await enrollSpecialization(pool, 'u1', 'web')
    const inserts = calls.filter((c) => c.sql.includes('insert into'))
    expect(inserts).toHaveLength(2)
    for (const ins of inserts) {
      expect(ins.sql).toContain('on conflict (user_id, spec_id) do update')
    }
  })

  it('id có khoảng trắng/hoa thường vẫn nhận đúng hướng, ghi xuống dạng chuẩn hoá', async () => {
    const { pool, calls } = fakePool()
    await enrollSpecialization(pool, 'u1', '  WEB ')
    expect(calls.find((c) => c.sql.includes('insert into'))?.params[1]).toBe('web')
  })
})

describe('unenrollSpecialization', () => {
  it('hướng lạ → từ chối, không chạm DB', async () => {
    const { pool, query } = fakePool()
    expect((await unenrollSpecialization(pool, 'u1', 'php-cuong-hoa')).ok).toBe(false)
    expect(query).not.toHaveBeenCalled()
  })

  it('xoá đúng dòng của chính người dùng (điều kiện user_id + spec_id)', async () => {
    const { pool, calls } = fakePool()
    expect(await unenrollSpecialization(pool, 'user-A', 'web')).toEqual({ ok: true })
    expect(calls[0]?.sql).toContain('user_id = $1 and spec_id = $2')
    expect(calls[0]?.params).toEqual(['user-A', 'web'])
  })
})

describe('setSpecStageProgress', () => {
  it('chặng lạ → từ chối, KHÔNG ghi rác xuống DB', async () => {
    const { pool, query } = fakePool()
    expect(await setSpecStageProgress(pool, 'u1', 'web-s9', 'completed')).toEqual({
      ok: false,
      error: 'Chặng "web-s9" không tồn tại',
    })
    expect(await setSpecStageProgress(pool, 'u1', 'khong-co-huong-nay-s1', 'completed')).toEqual({
      ok: false,
      error: 'Chặng "khong-co-huong-nay-s1" không tồn tại',
    })
    expect(query).not.toHaveBeenCalled()
  })

  it('chặng hợp lệ → upsert kèm spec_id suy ra từ stage_id', async () => {
    const { pool, calls } = fakePool()
    expect(await setSpecStageProgress(pool, 'u1', 'web-s2', 'completed')).toEqual({ ok: true })
    expect(calls[0]?.params).toEqual(['u1', 'web', 'web-s2', 'completed'])
  })

  it('lũy đẳng + không kéo lùi: ghi hai lần dùng cùng một upsert giữ trạng thái completed', async () => {
    const { pool, calls } = fakePool()
    await setSpecStageProgress(pool, 'u1', 'web-s2', 'completed')
    await setSpecStageProgress(pool, 'u1', 'web-s2', 'in_progress')
    expect(calls).toHaveLength(2)
    for (const c of calls) {
      expect(c.sql).toContain('on conflict (user_id, stage_id) do update')
      expect(c.sql).toContain("then 'completed' else excluded.status end")
    }
  })

  it('người dùng B không ghi được lên dòng của người dùng A (user_id là tham số $1)', async () => {
    const { pool, calls } = fakePool()
    await setSpecStageProgress(pool, 'user-A', 'web-s1', 'completed')
    await setSpecStageProgress(pool, 'user-B', 'web-s1', 'completed')
    expect(dataCalls(calls).map((c) => c.params[0])).toEqual(['user-A', 'user-B'])
    // Khoá chính là (user_id, stage_id) nên hai người ghi cùng stage_id là hai dòng riêng.
    for (const c of calls) expect(c.sql).toContain('(user_id, stage_id)')
  })
})

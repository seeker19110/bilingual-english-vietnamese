import { describe, it, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import { listPathArtifacts, createPathArtifact, deletePathArtifact } from './pathArtifactService.js'

function fakePool(rowsByCall: unknown[][] = [], rowCounts: number[] = []) {
  const calls: { sql: string; params: unknown[] }[] = []
  let i = 0
  let j = 0
  const query = vi.fn(async (sql: string, params?: unknown[]) => {
    calls.push({ sql, params: params ?? [] })
    if (/^\s*delete/i.test(sql)) return { rows: [], rowCount: rowCounts[j++] ?? 0 }
    return { rows: rowsByCall[i++] ?? [] }
  })
  const pool = { query } as unknown as Pool
  return { pool, calls, query }
}

describe('listPathArtifacts', () => {
  it('chưa nộp artifact nào → mảng rỗng', async () => {
    const { pool } = fakePool([[]])
    expect(await listPathArtifacts(pool, 'u1', 'principal-ai')).toEqual([])
  })

  it('đổi thời điểm về mili-giây epoch, giữ đủ trường', async () => {
    const at = new Date(1_756_000_000_000)
    const { pool } = fakePool([
      [
        {
          id: 'a1',
          path_id: 'principal-ai',
          phase_id: 'principal-ai-p1',
          url: 'https://example.com/repo',
          note: 'ghi chú',
          created_at: at,
        },
      ],
    ])
    const rows = await listPathArtifacts(pool, 'u1', 'principal-ai')
    expect(rows).toEqual([
      {
        id: 'a1',
        pathId: 'principal-ai',
        phaseId: 'principal-ai-p1',
        url: 'https://example.com/repo',
        note: 'ghi chú',
        createdAt: at.getTime(),
      },
    ])
  })

  it('chỉ đọc dữ liệu của chính mình và của đúng lộ trình', async () => {
    const { pool, calls } = fakePool([[]])
    await listPathArtifacts(pool, 'user-A', 'principal-ai')
    expect(calls[0]?.sql).toContain('user_id = $1 and path_id = $2')
    expect(calls[0]?.params).toEqual(['user-A', 'principal-ai'])
  })
})

describe('createPathArtifact', () => {
  it('lộ trình lạ → từ chối, KHÔNG chạm DB', async () => {
    const { pool, query } = fakePool()
    expect(
      await createPathArtifact(pool, 'u1', 'khong-co', 'khong-co-p1', 'https://x.com', ''),
    ).toEqual({ ok: false, error: 'Lộ trình "khong-co" không tồn tại' })
    expect(query).not.toHaveBeenCalled()
  })

  it('giai đoạn không thuộc lộ trình → từ chối, KHÔNG chạm DB', async () => {
    const { pool, query } = fakePool()
    expect(
      await createPathArtifact(pool, 'u1', 'principal-ai', 'principal-ai-p9', 'https://x.com', ''),
    ).toEqual({
      ok: false,
      error: 'Giai đoạn "principal-ai-p9" không thuộc lộ trình "principal-ai"',
    })
    expect(query).not.toHaveBeenCalled()
  })

  it('hợp lệ → ghi kèm user_id + path_id + phase_id + url + note', async () => {
    const { pool, calls } = fakePool()
    const result = await createPathArtifact(
      pool,
      'u1',
      'principal-ai',
      'principal-ai-p1',
      'https://github.com/x/y',
      'repo bài tập gradient descent',
    )
    expect(result).toEqual({ ok: true })
    expect(calls[0]?.params).toEqual([
      'u1',
      'principal-ai',
      'principal-ai-p1',
      'https://github.com/x/y',
      'repo bài tập gradient descent',
    ])
  })

  it('nộp lại nhiều lần cho cùng giai đoạn là hợp lệ (nhật ký, không ghi đè)', async () => {
    const { pool, calls } = fakePool()
    await createPathArtifact(pool, 'u1', 'principal-ai', 'principal-ai-p1', 'https://x.com', 'a')
    await createPathArtifact(pool, 'u1', 'principal-ai', 'principal-ai-p1', 'https://y.com', 'b')
    expect(calls).toHaveLength(2)
  })
})

describe('deletePathArtifact', () => {
  it('xoá thành công khi đúng chủ sở hữu', async () => {
    const { pool, calls } = fakePool([], [1])
    expect(await deletePathArtifact(pool, 'u1', 'a1')).toEqual({ ok: true })
    expect(calls[0]?.sql).toContain('id = $1 and user_id = $2')
    expect(calls[0]?.params).toEqual(['a1', 'u1'])
  })

  it('không xoá được artifact của người khác hoặc id không tồn tại → báo lỗi', async () => {
    const { pool } = fakePool([], [0])
    const result = await deletePathArtifact(pool, 'user-B', 'a1-cua-user-a')
    expect(result.ok).toBe(false)
  })
})

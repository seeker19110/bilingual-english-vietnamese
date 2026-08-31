import { describe, it, expect, vi } from 'vitest'
import type { Pool } from 'pg'
import {
  getPathProgress,
  setPathStageProgress,
  setPathStageProgressBulk,
  submitStageQuiz,
} from './pathProgressService.js'
import { quizOfStage } from './learningPaths/stageQuizzes.js'

function fakePool(rowsByCall: unknown[][] = []) {
  const calls: { sql: string; params: unknown[] }[] = []
  let i = 0
  const query = vi.fn(async (sql: string, params?: unknown[]) => {
    calls.push({ sql, params: params ?? [] })
    return { rows: rowsByCall[i++] ?? [] }
  })
  const pool = { query } as unknown as Pool
  return { pool, calls, query }
}

describe('getPathProgress', () => {
  it('chưa có tiến độ nào → mảng rỗng, không ném lỗi', async () => {
    const { pool } = fakePool([[]])
    expect(await getPathProgress(pool, 'u1', 'principal-ai')).toEqual([])
  })

  it('đổi thời điểm về mili-giây epoch và giữ nguyên trạng thái', async () => {
    const at = new Date(1_756_000_000_000)
    const { pool } = fakePool([
      [{ path_id: 'principal-ai', stage_id: 'ai-s1', status: 'skipped', updated_at: at }],
    ])
    const rows = await getPathProgress(pool, 'u1', 'principal-ai')
    expect(rows).toEqual([
      { pathId: 'principal-ai', stageId: 'ai-s1', status: 'skipped', updatedAt: at.getTime() },
    ])
  })

  it('chỉ đọc dữ liệu của chính mình và của đúng lộ trình', async () => {
    const { pool, calls } = fakePool([[]])
    await getPathProgress(pool, 'user-A', 'principal-ai')
    expect(calls[0]?.sql).toContain('user_id = $1 and path_id = $2')
    expect(calls[0]?.params).toEqual(['user-A', 'principal-ai'])
  })
})

describe('setPathStageProgress', () => {
  it('lộ trình lạ → từ chối, KHÔNG chạm DB', async () => {
    const { pool, query } = fakePool()
    expect(await setPathStageProgress(pool, 'u1', 'khong-co', 'ai-s1', 'completed')).toEqual({
      ok: false,
      error: 'Lộ trình "khong-co" không tồn tại',
    })
    expect(query).not.toHaveBeenCalled()
  })

  it('chặng không thuộc lộ trình → từ chối, KHÔNG chạm DB', async () => {
    const { pool, query } = fakePool()
    // 'web-s1' là chặng có thật (thuộc hướng web) nhưng KHÔNG nằm trong lộ trình principal-ai.
    expect(await setPathStageProgress(pool, 'u1', 'principal-ai', 'web-s1', 'completed')).toEqual({
      ok: false,
      error: 'Chặng "web-s1" không thuộc lộ trình "principal-ai"',
    })
    expect(query).not.toHaveBeenCalled()
  })

  it('chặng hợp lệ thuộc lộ trình → ghi, kèm user_id + path_id + stage_id + status', async () => {
    const { pool, calls } = fakePool()
    expect(await setPathStageProgress(pool, 'u1', 'principal-ai', 'ai-s1', 'in_progress')).toEqual({
      ok: true,
    })
    expect(calls[0]?.params).toEqual(['u1', 'principal-ai', 'ai-s1', 'in_progress'])
    expect(calls[0]?.sql).toContain('on conflict (user_id, path_id, stage_id) do update')
  })

  it('id có khoảng trắng/hoa thường vẫn ghi đúng dạng chuẩn hoá', async () => {
    const { pool, calls } = fakePool()
    await setPathStageProgress(pool, 'u1', ' PRINCIPAL-AI ', ' AI-S1 ', 'skipped')
    expect(calls[0]?.params).toEqual(['u1', 'principal-ai', 'ai-s1', 'skipped'])
  })

  it('câu lệnh SQL tự bảo vệ "chỉ tốt lên" bằng array_position, không đọc-rồi-ghi hai bước', async () => {
    const { pool, calls } = fakePool()
    await setPathStageProgress(pool, 'u1', 'principal-ai', 'devops-s1', 'skipped')
    expect(calls[0]?.sql).toContain('array_position')
  })

  it('chặng CÓ quiz: status completed qua đường này bị TỪ CHỐI, không tin client bỏ qua bài kiểm', async () => {
    const { pool, query } = fakePool()
    // ai-s1 nằm trong bộ đã soạn quiz (stageQuizzes.ts) — test tự xác nhận giả định này.
    expect(quizOfStage('ai-s1').length).toBeGreaterThan(0)
    const result = await setPathStageProgress(pool, 'u1', 'principal-ai', 'ai-s1', 'completed')
    expect(result.ok).toBe(false)
    expect(query).not.toHaveBeenCalled()
  })

  it('chặng CHƯA có quiz: status completed vẫn ghi được qua đường này như trước đợt 3', async () => {
    const { pool, calls } = fakePool()
    // ai-s2 chưa có quiz — test tự xác nhận giả định này để không vỡ lặng lẽ khi soạn thêm.
    expect(quizOfStage('ai-s2')).toEqual([])
    const result = await setPathStageProgress(pool, 'u1', 'principal-ai', 'ai-s2', 'completed')
    expect(result).toEqual({ ok: true })
    expect(calls[0]?.params).toEqual(['u1', 'principal-ai', 'ai-s2', 'completed'])
  })
})

describe('submitStageQuiz', () => {
  it('lộ trình lạ / chặng không thuộc lộ trình → từ chối, KHÔNG chạm DB', async () => {
    const { pool: p1, query: q1 } = fakePool()
    expect(await submitStageQuiz(p1, 'u1', 'khong-co', 'ai-s1', [])).toEqual({
      ok: false,
      error: 'Lộ trình "khong-co" không tồn tại',
    })
    expect(q1).not.toHaveBeenCalled()

    const { pool: p2, query: q2 } = fakePool()
    expect(await submitStageQuiz(p2, 'u1', 'principal-ai', 'web-s1', [])).toEqual({
      ok: false,
      error: 'Chặng "web-s1" không thuộc lộ trình "principal-ai"',
    })
    expect(q2).not.toHaveBeenCalled()
  })

  it('chặng chưa có quiz → từ chối, KHÔNG chạm DB', async () => {
    const { pool, query } = fakePool()
    expect(await submitStageQuiz(pool, 'u1', 'principal-ai', 'ai-s2', [])).toEqual({
      ok: false,
      error: 'Chặng "ai-s2" chưa có bài kiểm',
    })
    expect(query).not.toHaveBeenCalled()
  })

  it('trả lời đúng hết → đạt, ghi completed; trả lời sai hết → KHÔNG đạt, KHÔNG ghi gì', async () => {
    const questions = quizOfStage('ai-s1')
    const allCorrect = questions.map((q) => ({ questionId: q.id, choiceIndex: q.answerIndex }))
    const { pool: pOk, calls: callsOk } = fakePool()
    const ok = await submitStageQuiz(pOk, 'u1', 'principal-ai', 'ai-s1', allCorrect)
    expect(ok).toEqual({
      ok: true,
      correct: questions.length,
      total: questions.length,
      passed: true,
    })
    expect(callsOk).toHaveLength(1)
    expect(callsOk[0]?.params).toEqual(['u1', 'principal-ai', 'ai-s1', 'completed'])

    const allWrong = questions.map((q) => ({
      questionId: q.id,
      choiceIndex: (q.answerIndex + 1) % 4,
    }))
    const { pool: pBad, calls: callsBad } = fakePool()
    const bad = await submitStageQuiz(pBad, 'u1', 'principal-ai', 'ai-s1', allWrong)
    expect(bad).toEqual({ ok: true, correct: 0, total: questions.length, passed: false })
    expect(callsBad).toHaveLength(0)
  })

  it('đạt đúng ngưỡng 4/5 (80%) → passed true và ghi completed', async () => {
    const questions = quizOfStage('mathforcode-s1')
    expect(questions).toHaveLength(5)
    const fourCorrect = questions.map((q, i) => ({
      questionId: q.id,
      choiceIndex: i < 4 ? q.answerIndex : (q.answerIndex + 1) % 4,
    }))
    const { pool, calls } = fakePool()
    const result = await submitStageQuiz(pool, 'u1', 'principal-ai', 'mathforcode-s1', fourCorrect)
    expect(result).toEqual({ ok: true, correct: 4, total: 5, passed: true })
    expect(calls).toHaveLength(1)
  })

  it('câu trả lời thiếu (không gửi cho một questionId) tính là sai, không ném lỗi', async () => {
    const questions = quizOfStage('data-s1')
    const partial = questions
      .slice(0, 4)
      .map((q) => ({ questionId: q.id, choiceIndex: q.answerIndex }))
    const { pool } = fakePool()
    const result = await submitStageQuiz(pool, 'u1', 'principal-ai', 'data-s1', partial)
    expect(result).toEqual({ ok: true, correct: 4, total: 5, passed: true })
  })
})

describe('setPathStageProgressBulk', () => {
  it('ghi lần lượt từng chặng, dừng NGAY khi gặp chặng không hợp lệ', async () => {
    const { pool, calls } = fakePool()
    const result = await setPathStageProgressBulk(pool, 'u1', 'principal-ai', [
      { stageId: 'ai-s1', status: 'skipped' },
      { stageId: 'khong-co-s1', status: 'skipped' },
      { stageId: 'ai-s2', status: 'skipped' },
    ])
    expect(result).toEqual({
      ok: false,
      error: 'Chặng "khong-co-s1" không thuộc lộ trình "principal-ai"',
    })
    // Chặng thứ ba KHÔNG được ghi vì dừng sớm ở chặng lỗi thứ hai.
    expect(calls).toHaveLength(1)
  })

  it('mọi chặng hợp lệ → ghi đủ, trả ok', async () => {
    const { pool, calls } = fakePool()
    const result = await setPathStageProgressBulk(pool, 'u1', 'principal-ai', [
      { stageId: 'ai-s1', status: 'skipped' },
      { stageId: 'ai-s2', status: 'skipped' },
    ])
    expect(result).toEqual({ ok: true })
    expect(calls).toHaveLength(2)
  })
})

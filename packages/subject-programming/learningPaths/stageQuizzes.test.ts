// Bất biến của ngân hàng QUIZ SAU CHẶNG — chặn lỗi dữ liệu khi soạn thêm chặng mới.
import { describe, expect, it } from 'vitest'
import { quizOfStage, stageHasQuiz } from './stageQuizzes.js'
import { resolveStage } from './pathStages.js'
import { getLearningPath, pathStageRefs } from './registry.js'

const QUIZZED_STAGES = [
  'mathforcode-s1',
  'mathforcode-s2',
  'mathforcode-s3',
  'mathforcode-s4',
  'algo-s1',
  'algo-s2',
  'data-s1',
  'data-s2',
  'data-s3',
  'backend-s1',
  'backend-s2',
  'ai-s1',
  'ai-s2',
  'ai-s3',
  'ai-s4',
  'devops-s1',
  'devops-s2',
  'security-s1',
  'security-s2',
  'architecture-s1',
  'architecture-s2',
  'architecture-s3',
  'architecture-s4',
  'principal-s1',
  'principal-s2',
  'principal-s3',
  'principal-s4',
]

describe('ngân hàng quiz sau chặng', () => {
  it('mọi chặng có quiz: đúng 5 câu, mỗi câu đúng 4 lựa chọn, answerIndex hợp lệ', () => {
    for (const stageId of QUIZZED_STAGES) {
      const qs = quizOfStage(stageId)
      expect(qs, `${stageId}: cần đúng 5 câu`).toHaveLength(5)
      for (const q of qs) {
        expect(q.id.startsWith(`${stageId}-q`), `${q.id} sai tiền tố`).toBe(true)
        expect(q.choices).toHaveLength(4)
        expect(q.answerIndex).toBeGreaterThanOrEqual(0)
        expect(q.answerIndex).toBeLessThan(4)
        expect(q.prompt.trim()).not.toBe('')
        expect(q.explain.trim()).not.toBe('')
      }
    }
  })

  it('id câu hỏi duy nhất trong TOÀN BỘ ngân hàng', () => {
    const seen = new Set<string>()
    for (const stageId of QUIZZED_STAGES) {
      for (const q of quizOfStage(stageId)) {
        expect(seen.has(q.id), `trùng id ${q.id}`).toBe(false)
        seen.add(q.id)
      }
    }
  })

  it('stageId của quiz tra được (hướng chuyên sâu hoặc chặng riêng của lộ trình) — chỉ gắn vào chặng có thật', () => {
    for (const stageId of QUIZZED_STAGES) {
      expect(resolveStage(stageId), `${stageId} không có thật`).toBeDefined()
    }
  })

  it('mọi chặng có quiz đều thuộc lộ trình principal-ai (đợt 3 chỉ soạn cho chặng đang dùng)', () => {
    const path = getLearningPath('principal-ai')!
    const ids = pathStageRefs(path).map((r) => r.stageId)
    for (const stageId of QUIZZED_STAGES) {
      expect(ids, `${stageId} không thuộc principal-ai`).toContain(stageId)
    }
  })

  it('chặng chưa soạn trả mảng rỗng — không hứa suông', () => {
    // web-s2 có thật (hướng chuyên sâu web) nhưng không thuộc lộ trình principal-ai/chưa có quiz.
    expect(quizOfStage('web-s2')).toEqual([])
    expect(quizOfStage('khong-co-chang-nay')).toEqual([])
  })

  it('stageHasQuiz khớp đúng độ dài quizOfStage, không phân biệt hoa thường', () => {
    for (const stageId of QUIZZED_STAGES) {
      expect(stageHasQuiz(stageId.toUpperCase())).toBe(true)
    }
    expect(stageHasQuiz('web-s2')).toBe(false)
  })
})

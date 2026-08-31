// Bất biến của chẩn đoán chọn điểm vào — TẤT ĐỊNH là bất biến quan trọng nhất: cùng bộ trả
// lời phải luôn ra cùng kết quả, mọi lần, không phụ thuộc thời gian hay thứ tự gọi.
import { describe, expect, it } from 'vitest'
import { suggestEntry, PRINCIPAL_AI_DIAGNOSTIC, type DiagnosticAnswer } from './diagnostic.js'
import { getLearningPath, pathStageRefs } from './registry.js'

const PATH = getLearningPath('principal-ai')!

function answerAll(correct: boolean): DiagnosticAnswer[] {
  return PRINCIPAL_AI_DIAGNOSTIC.map((q) => ({ questionId: q.id, correct }))
}

describe('suggestEntry — chẩn đoán chọn điểm vào', () => {
  it('mọi câu hỏi tra đúng giai đoạn có thật trong lộ trình', () => {
    const phaseIds = new Set(PATH.phases.map((p) => p.id))
    for (const q of PRINCIPAL_AI_DIAGNOSTIC) {
      expect(phaseIds.has(q.phaseId), `câu ${q.id} trỏ giai đoạn lạ ${q.phaseId}`).toBe(true)
      expect(q.answerIndex).toBeGreaterThanOrEqual(0)
      expect(q.answerIndex).toBeLessThan(q.choices.length)
    }
  })

  it('tất định: gọi hai lần với cùng answers ra cùng kết quả hệt nhau', () => {
    const answers = answerAll(true).slice(0, 3)
    const r1 = suggestEntry(PATH, answers)
    const r2 = suggestEntry(PATH, answers)
    expect(r1).toEqual(r2)
  })

  it('trả lời đúng hết → miễn P1–P4, entry là chặng ĐẦU của P5 (chẩn đoán chỉ phủ P1–P4, chưa hỏi P5 nên chưa miễn P5)', () => {
    const result = suggestEntry(PATH, answerAll(true))
    const p5 = PATH.phases.find((p) => p.id === 'principal-ai-p5')!
    expect(result.entryStageId).toBe(p5.stages[0]!.stageId)
    // Mọi chặng P1–P4 đều nằm trong danh sách miễn; P5 KHÔNG được miễn.
    const p1to4Stages = PATH.phases.slice(0, 4).flatMap((p) => p.stages.map((s) => s.stageId))
    expect(result.skippedStageIds.sort()).toEqual(p1to4Stages.sort())
    for (const s of p5.stages) expect(result.skippedStageIds).not.toContain(s.stageId)
  })

  it('trả lời sai hết → entry là chặng ĐẦU của P1, không miễn gì', () => {
    const result = suggestEntry(PATH, answerAll(false))
    const p1 = PATH.phases[0]!
    expect(result.entryStageId).toBe(p1.stages[0]!.stageId)
    expect(result.skippedStageIds).toEqual([])
  })

  it('không trả lời câu nào → coi như chưa vững hết, entry là chặng đầu P1 (bảo thủ)', () => {
    const result = suggestEntry(PATH, [])
    expect(result.entryStageId).toBe(PATH.phases[0]!.stages[0]!.stageId)
    expect(result.skippedStageIds).toEqual([])
  })

  it('chỉ P1 vững, P2 sai → miễn đúng chặng P1, entry là chặng đầu P2', () => {
    const p1Questions = PRINCIPAL_AI_DIAGNOSTIC.filter((q) => q.phaseId === 'principal-ai-p1')
    const p2Questions = PRINCIPAL_AI_DIAGNOSTIC.filter((q) => q.phaseId === 'principal-ai-p2')
    const answers: DiagnosticAnswer[] = [
      ...p1Questions.map((q) => ({ questionId: q.id, correct: true })),
      ...p2Questions.map((q) => ({ questionId: q.id, correct: false })),
    ]
    const result = suggestEntry(PATH, answers)
    const p1 = PATH.phases.find((p) => p.id === 'principal-ai-p1')!
    const p2 = PATH.phases.find((p) => p.id === 'principal-ai-p2')!
    expect(result.skippedStageIds).toEqual(p1.stages.map((s) => s.stageId))
    expect(result.entryStageId).toBe(p2.stages[0]!.stageId)
  })

  it('entryStageId và mọi skippedStageIds đều là stageId có thật trong lộ trình', () => {
    const allStageIds = new Set(pathStageRefs(PATH).map((r) => r.stageId))
    const result = suggestEntry(PATH, answerAll(true))
    expect(allStageIds.has(result.entryStageId)).toBe(true)
    for (const s of result.skippedStageIds) expect(allStageIds.has(s)).toBe(true)
  })
})

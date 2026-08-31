// Bất biến của tầng LỘ TRÌNH MỤC TIÊU — chặn lỗi dữ liệu khi soạn/lắp lộ trình.
//
// Cùng triết lý specializations.test.ts: kiểm KHUÔN chứ không kiểm nội dung từng chữ — thêm
// lộ trình đúng chuẩn thì không phải sửa test. Hai bất biến quan trọng nhất:
//  · Lộ trình CHỈ THAM CHIẾU chặng có thật (`getSpecStage` tra ra được) — không nhúng nội dung.
//  · `requires` không có vòng lặp và chỉ trỏ chặng TRONG cùng lộ trình, đứng TRƯỚC nó.
import { describe, expect, it } from 'vitest'
import {
  LEARNING_PATHS,
  getLearningPath,
  pathStageRefs,
  countPathStages,
  isPhaseDrafting,
} from './registry.js'
import { getSpecStage } from '../specializations/registry.js'
import { PROGRAMMING_LEVEL_IDS } from '../curriculum.js'

describe('lộ trình mục tiêu môn Lập trình', () => {
  it('id lộ trình duy nhất, có ít nhất một lộ trình', () => {
    const ids = LEARNING_PATHS.map((p) => p.id)
    expect(ids.length).toBeGreaterThanOrEqual(1)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('MỌI stageId trong manifest tra ra được qua getSpecStage — chỉ tham chiếu, không bịa', () => {
    for (const path of LEARNING_PATHS) {
      for (const ref of pathStageRefs(path)) {
        expect(getSpecStage(ref.stageId), `${path.id}: chặng lạ ${ref.stageId}`).toBeDefined()
      }
    }
  })

  it('không chặng nào xuất hiện hai lần trong cùng một lộ trình', () => {
    for (const path of LEARNING_PATHS) {
      const ids = pathStageRefs(path).map((r) => r.stageId)
      expect(new Set(ids).size, `${path.id}: chặng trùng`).toBe(ids.length)
    }
  })

  it('requires chỉ trỏ chặng cùng lộ trình và đứng TRƯỚC nó — nên không thể có vòng lặp', () => {
    for (const path of LEARNING_PATHS) {
      const seen = new Set<string>()
      for (const ref of pathStageRefs(path)) {
        for (const req of ref.requires ?? []) {
          expect(
            seen.has(req),
            `${path.id}: ${ref.stageId} đòi ${req} chưa xuất hiện trước nó`,
          ).toBe(true)
        }
        seen.add(ref.stageId)
      }
    }
  })

  it('id giai đoạn đúng tiền tố lộ trình và duy nhất', () => {
    for (const path of LEARNING_PATHS) {
      const ids = path.phases.map((ph) => ph.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const phase of path.phases) {
        expect(phase.id.startsWith(`${path.id}-p`), `${phase.id} sai tiền tố`).toBe(true)
      }
    }
  })

  it('mỗi giai đoạn có can-do thật và artifact có mô tả', () => {
    for (const path of LEARNING_PATHS) {
      for (const phase of path.phases) {
        expect(phase.canDo.length, `${phase.id}: canDo quá ngắn`).toBeGreaterThan(20)
        expect(phase.artifact.name.trim()).not.toBe('')
        expect(phase.artifact.brief.length, `${phase.id}: artifact.brief quá ngắn`).toBeGreaterThan(
          20,
        )
      }
    }
  })

  it('mỗi tham chiếu chặng nói rõ VÌ SAO nó nằm đó', () => {
    for (const path of LEARNING_PATHS) {
      for (const ref of pathStageRefs(path)) {
        expect(ref.why.length, `${path.id}/${ref.stageId}: why quá ngắn`).toBeGreaterThan(20)
      }
    }
  })

  it('không có ô văn bản rỗng hay chỉ khoảng trắng', () => {
    const walk = (value: unknown, path: string): void => {
      if (typeof value === 'string') {
        expect(value.trim(), `rỗng tại ${path}`).not.toBe('')
        return
      }
      if (Array.isArray(value)) {
        value.forEach((v, i) => walk(v, `${path}[${i}]`))
        return
      }
      if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`)
      }
    }
    walk(LEARNING_PATHS, 'learningPaths')
  })

  it('điều kiện đầu vào là một bậc có thật của xương sống; có outcomes quan sát được', () => {
    for (const path of LEARNING_PATHS) {
      expect(PROGRAMMING_LEVEL_IDS).toContain(path.prerequisite)
      expect(path.outcomes.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('getLearningPath không phân biệt hoa thường, id lạ trả undefined', () => {
    expect(getLearningPath('PRINCIPAL-AI')?.title).toBe('Kỹ Sư Trưởng AI')
    expect(getLearningPath(' principal-ai ')?.id).toBe('principal-ai')
    expect(getLearningPath('khong-co')).toBeUndefined()
    expect(getLearningPath('')).toBeUndefined()
  })

  it('countPathStages đếm đúng và isPhaseDrafting nhận diện giai đoạn rỗng', () => {
    for (const path of LEARNING_PATHS) {
      expect(countPathStages(path)).toBe(pathStageRefs(path).length)
      for (const phase of path.phases) {
        expect(isPhaseDrafting(phase)).toBe(phase.stages.length === 0)
      }
    }
  })

  it('lộ trình principal-ai: P1–P4 đã lắp chặng thật, P5 đang soạn (theo đặc tả đợt 1)', () => {
    const path = getLearningPath('principal-ai')!
    expect(path.phases).toHaveLength(5)
    for (const phase of path.phases.slice(0, 4)) {
      expect(phase.stages.length, `${phase.id} phải có chặng`).toBeGreaterThanOrEqual(4)
    }
    expect(isPhaseDrafting(path.phases[4]!)).toBe(true)
    // Trục AI trọn vẹn S1→S4 phải nằm trong lộ trình — đây là trục chuyên môn lõi.
    const ids = pathStageRefs(path).map((r) => r.stageId)
    for (const s of ['ai-s1', 'ai-s2', 'ai-s3', 'ai-s4']) expect(ids).toContain(s)
  })
})

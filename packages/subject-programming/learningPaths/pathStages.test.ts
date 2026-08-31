// Bất biến của CHẶNG RIÊNG thuộc lộ trình (giai đoạn P5 "Tầm trưởng") — cùng khuôn kiểm với
// specializations.test.ts nhưng cho 4 chặng principal-s1…s4, vốn KHÔNG nằm trong sổ 14 hướng.
import { describe, expect, it } from 'vitest'
import { PATH_STAGES, getPathStage, resolveStage } from './pathStages.js'
import { getSpecStage } from '../specializations/registry.js'

describe('chặng riêng của lộ trình (principal-s1…s4)', () => {
  it('đúng 4 chặng, id duy nhất, đúng tiền tố principal-', () => {
    expect(PATH_STAGES).toHaveLength(4)
    const ids = PATH_STAGES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const s of PATH_STAGES) expect(s.id.startsWith('principal-')).toBe(true)
  })

  it('mỗi chặng có can-do thật, ≥ 1 module, dự án có tiêu chí chấp nhận', () => {
    for (const s of PATH_STAGES) {
      expect(s.canDo.length, `${s.id}: canDo quá ngắn`).toBeGreaterThan(20)
      expect(s.modules.length, `${s.id}: cần ≥ 1 module`).toBeGreaterThanOrEqual(1)
      for (const m of s.modules) {
        expect(m.topics.length, `${m.id}: cần ≥ 1 topic`).toBeGreaterThanOrEqual(1)
      }
      expect(s.project.requirements.length, `${s.id}: dự án cần tiêu chí`).toBeGreaterThanOrEqual(2)
    }
  })

  it('getPathStage tra đúng, không phân biệt hoa thường; id lạ trả undefined', () => {
    expect(getPathStage('PRINCIPAL-S1')?.id).toBe('principal-s1')
    expect(getPathStage('khong-co')).toBeUndefined()
  })

  it('resolveStage KHÔNG trùng với chặng của 14 hướng chuyên sâu (tránh id đụng nhau)', () => {
    for (const s of PATH_STAGES) {
      expect(getSpecStage(s.id), `${s.id} không được trùng id với hướng chuyên sâu`).toBeUndefined()
    }
  })

  it('resolveStage tra được cả chặng hướng chuyên sâu lẫn chặng riêng của lộ trình', () => {
    expect(resolveStage('web-s1')?.id).toBe('web-s1')
    expect(resolveStage('principal-s1')?.id).toBe('principal-s1')
    expect(resolveStage('khong-co-chang-nay')).toBeUndefined()
  })
})

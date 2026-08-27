// specStageDetails.test.ts — Test BẤT BIẾN cho chi tiết chặng (đợt đầu: S2 của 13 hướng).
//
// Vì sao test khuôn dạng chứ không test từng chữ: nội dung sẽ còn được sửa, nhưng KHUÔN phải
// giữ — thiếu một ô là người học mất đúng thứ khiến chặng đi được. Test ở đây bắt đúng những
// lỗi soạn nội dung hay gặp: chép lại tên module thay vì viết mục tiêu, quên howToProve, và
// copy-paste giữa các hướng.
import { describe, it, expect } from 'vitest'
import { PROGRAMMING_SPECIALIZATIONS } from './specializations/registry.js'
import {
  SPEC_STAGE_DETAILS,
  getSpecStageDetail,
  getSpecModuleDetail,
  countStageProgressItems,
} from './specializations/stageDetails.js'

describe('chi tiết chặng — phủ đủ và khớp bản đồ', () => {
  it('mỗi hướng có đúng một chi tiết cho chặng S2', () => {
    const s2 = SPEC_STAGE_DETAILS.filter((d) => d.stageId.endsWith('-s2'))
    expect(s2).toHaveLength(PROGRAMMING_SPECIALIZATIONS.length)
    for (const spec of PROGRAMMING_SPECIALIZATIONS) {
      expect(getSpecStageDetail(`${spec.id}-s2`), `thiếu chi tiết ${spec.id}-s2`).toBeDefined()
    }
  })

  it('id chặng duy nhất và trỏ tới chặng có thật trong bản đồ', () => {
    const ids = SPEC_STAGE_DETAILS.map((d) => d.stageId)
    expect(new Set(ids).size).toBe(ids.length)
    for (const detail of SPEC_STAGE_DETAILS) {
      const spec = PROGRAMMING_SPECIALIZATIONS.find((s) =>
        s.stages.some((st) => st.id === detail.stageId),
      )
      expect(spec, `chặng lạ: ${detail.stageId}`).toBeDefined()
    }
  })

  it('module trong chi tiết phủ ĐÚNG và ĐỦ module của chặng, không thừa không thiếu', () => {
    for (const detail of SPEC_STAGE_DETAILS) {
      const spec = PROGRAMMING_SPECIALIZATIONS.find((s) =>
        s.stages.some((st) => st.id === detail.stageId),
      )
      const stage = spec?.stages.find((st) => st.id === detail.stageId)
      const mapIds = (stage?.modules ?? []).map((m) => m.id).sort()
      const detailIds = detail.modules.map((m) => m.moduleId).sort()
      expect(detailIds, `lệch module ở ${detail.stageId}`).toEqual(mapIds)
    }
  })
})

describe('chi tiết chặng — khuôn dạng từng module', () => {
  const allModules = SPEC_STAGE_DETAILS.flatMap((d) =>
    d.modules.map((m) => ({ stageId: d.stageId, ...m })),
  )

  it('mục tiêu viết đủ dài và không chỉ chép lại tên module', () => {
    for (const m of allModules) {
      expect(m.objective.length, `${m.moduleId}: mục tiêu quá ngắn`).toBeGreaterThanOrEqual(40)
      expect(m.objective.trim()).toBe(m.objective)
    }
  })

  it('mỗi module có 2–4 bài luyện tay, 2–4 câu tự kiểm có đáp án, 2–3 dấu hiệu đã nắm', () => {
    for (const m of allModules) {
      expect(m.practice.length, `${m.moduleId}: practice`).toBeGreaterThanOrEqual(2)
      expect(m.practice.length, `${m.moduleId}: practice`).toBeLessThanOrEqual(4)
      expect(m.selfCheck.length, `${m.moduleId}: selfCheck`).toBeGreaterThanOrEqual(2)
      expect(m.selfCheck.length, `${m.moduleId}: selfCheck`).toBeLessThanOrEqual(4)
      expect(m.doneSignals.length, `${m.moduleId}: doneSignals`).toBeGreaterThanOrEqual(2)
      expect(m.doneSignals.length, `${m.moduleId}: doneSignals`).toBeLessThanOrEqual(3)
      for (const c of m.selfCheck) {
        expect(c.q.length, `${m.moduleId}: câu hỏi quá ngắn`).toBeGreaterThanOrEqual(15)
        expect(c.a.length, `${m.moduleId}: đáp án quá ngắn`).toBeGreaterThanOrEqual(10)
      }
    }
  })

  it('không ô văn bản nào rỗng', () => {
    for (const m of allModules) {
      for (const s of [...m.practice, ...m.doneSignals]) {
        expect(s.trim().length, `${m.moduleId}: ô rỗng`).toBeGreaterThan(10)
      }
    }
  })
})

describe('chi tiết chặng — rubric nghiệm thu dự án', () => {
  it('mỗi chặng có ≥ 4 tiêu chí, mọi tiêu chí có cách chứng minh', () => {
    for (const d of SPEC_STAGE_DETAILS) {
      expect(d.rubric.length, `${d.stageId}: rubric`).toBeGreaterThanOrEqual(4)
      for (const r of d.rubric) {
        expect(r.text.length, `${r.id}: tiêu chí quá ngắn`).toBeGreaterThanOrEqual(30)
        expect(r.howToProve.length, `${r.id}: thiếu cách chứng minh`).toBeGreaterThanOrEqual(20)
      }
    }
  })

  it('id tiêu chí duy nhất toàn cục và đúng tiền tố chặng', () => {
    const ids = SPEC_STAGE_DETAILS.flatMap((d) => d.rubric.map((r) => r.id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const d of SPEC_STAGE_DETAILS) {
      for (const r of d.rubric) {
        expect(r.id).toMatch(new RegExp(`^${d.stageId}-r\\d+$`))
      }
    }
  })
})

describe('chi tiết chặng — đặc tả mẫu 6 ô', () => {
  it('đủ sáu ô, ô nào cũng có ít nhất 2 mục', () => {
    for (const d of SPEC_STAGE_DETAILS) {
      const b = d.specBrief
      const boxes: [string, string[]][] = [
        ['scopeDo', b.scopeDo],
        ['scopeDont', b.scopeDont],
        ['touchpoints', b.touchpoints],
        ['contracts', b.contracts],
        ['acceptance', b.acceptance],
        ['invariants', b.invariants],
        ['conventions', b.conventions],
      ]
      for (const [name, items] of boxes) {
        expect(items.length, `${d.stageId}: ô ${name}`).toBeGreaterThanOrEqual(2)
        for (const it of items) expect(it.trim().length).toBeGreaterThan(15)
      }
    }
  })

  it('ô "KHÔNG làm" nêu được lý do ở ít nhất một mục — ô này hay bị viết cho có', () => {
    for (const d of SPEC_STAGE_DETAILS) {
      const hasReason = d.specBrief.scopeDont.some(
        (s) => s.includes('—') || s.includes('vì') || s.includes(','),
      )
      expect(hasReason, `${d.stageId}: scopeDont không nêu lý do`).toBe(true)
    }
  })
})

describe('chi tiết chặng — chống copy-paste giữa các hướng', () => {
  it('không mục tiêu module nào trùng nguyên văn ở hai hướng', () => {
    const objectives = SPEC_STAGE_DETAILS.flatMap((d) => d.modules.map((m) => m.objective))
    expect(new Set(objectives).size).toBe(objectives.length)
  })

  it('không tiêu chí rubric nào trùng nguyên văn ở hai hướng', () => {
    const texts = SPEC_STAGE_DETAILS.flatMap((d) => d.rubric.map((r) => r.text))
    expect(new Set(texts).size).toBe(texts.length)
  })
})

describe('hàm tra cứu', () => {
  it('trả undefined với mã lạ, KHÔNG đoán bừa', () => {
    expect(getSpecStageDetail('khong-co')).toBeUndefined()
    expect(getSpecStageDetail('web-s9')).toBeUndefined()
    expect(getSpecStageDetail('web-s1')).toBeUndefined() // chưa soạn — không được bịa
    expect(getSpecModuleDetail('web-s2-m99')).toBeUndefined()
    expect(getSpecModuleDetail('linh-tinh')).toBeUndefined()
  })

  it('tra được chặng và module có thật, không phân biệt hoa thường', () => {
    expect(getSpecStageDetail(' WEB-S2 ')?.stageId).toBe('web-s2')
    expect(getSpecModuleDetail('WEB-S2-M1')?.moduleId).toBe('web-s2-m1')
  })

  it('đếm đúng số mục tiến độ của một chặng', () => {
    const web = getSpecStageDetail('web-s2')!
    expect(countStageProgressItems(web)).toBe(web.modules.length + web.rubric.length)
  })
})

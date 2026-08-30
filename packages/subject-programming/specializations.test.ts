// Bất biến của tầng HƯỚNG CHUYÊN SÂU — chặn lỗi dữ liệu khi soạn thêm hướng mới.
// Test này cố tình kiểm KHUÔN (mọi hướng phải đủ 4 chặng, id duy nhất, không ô rỗng) chứ
// không kiểm nội dung từng chữ — thêm hướng đúng chuẩn thì không phải sửa test.
import { describe, expect, it } from 'vitest'
import {
  PROGRAMMING_SPECIALIZATIONS,
  getSpecialization,
  getSpecStage,
  specializationsOpenAt,
  countSpecProjects,
  productSpecializations,
  crossCuttingSpecializations,
  countArchitectureItems,
} from './specializations/registry.js'
import { PROGRAMMING_LEVEL_IDS } from './curriculum.js'

const TIERS = ['s1', 's2', 's3', 's4']

describe('hướng chuyên sâu môn Lập trình', () => {
  it('có đủ 14 hướng, id duy nhất', () => {
    const ids = PROGRAMMING_SPECIALIZATIONS.map((s) => s.id)
    expect(ids).toHaveLength(14)
    expect(new Set(ids).size).toBe(14)
  })

  it('tách đúng hướng sản phẩm và hướng nền cắt ngang', () => {
    expect(
      crossCuttingSpecializations()
        .map((s) => s.id)
        .sort(),
    ).toEqual(['algo', 'architecture', 'mathforcode'])
    expect(productSpecializations()).toHaveLength(11)
    // Không hướng nào vừa là sản phẩm vừa là nền.
    expect(productSpecializations().length + crossCuttingSpecializations().length).toBe(
      PROGRAMMING_SPECIALIZATIONS.length,
    )
  })

  it('mỗi hướng có đúng 4 chặng S1→S4 theo thứ tự, id chặng đúng tiền tố', () => {
    for (const spec of PROGRAMMING_SPECIALIZATIONS) {
      expect(spec.stages.map((s) => s.tier)).toEqual(TIERS)
      for (const stage of spec.stages) {
        expect(stage.id).toBe(`${spec.id}-${stage.tier}`)
      }
    }
  })

  it('id module duy nhất toàn bộ và đúng tiền tố chặng', () => {
    const seen = new Set<string>()
    for (const spec of PROGRAMMING_SPECIALIZATIONS) {
      for (const stage of spec.stages) {
        expect(stage.modules.length).toBeGreaterThanOrEqual(3)
        for (const mod of stage.modules) {
          expect(mod.id.startsWith(`${stage.id}-m`)).toBe(true)
          expect(seen.has(mod.id)).toBe(false)
          seen.add(mod.id)
          expect(mod.topics.length).toBeGreaterThanOrEqual(2)
        }
      }
    }
  })

  it('mọi chặng có dự án với tiêu chí chấp nhận đo được', () => {
    for (const spec of PROGRAMMING_SPECIALIZATIONS) {
      for (const stage of spec.stages) {
        expect(stage.project.requirements.length).toBeGreaterThanOrEqual(2)
        expect(stage.canDo.length).toBeGreaterThan(20)
      }
      expect(spec.capstone.requirements.length).toBeGreaterThanOrEqual(3)
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
    walk(PROGRAMMING_SPECIALIZATIONS, 'specializations')
  })

  it('điều kiện đầu vào luôn là một bậc có thật của xương sống', () => {
    for (const spec of PROGRAMMING_SPECIALIZATIONS) {
      expect(PROGRAMMING_LEVEL_IDS).toContain(spec.prerequisite)
    }
  })

  it('mỗi hướng nói rõ dấu hiệu chuyên gia, nghề nghiệp, bẫy và nguồn học', () => {
    for (const spec of PROGRAMMING_SPECIALIZATIONS) {
      expect(spec.expertSignals.length).toBeGreaterThanOrEqual(3)
      expect(spec.careers.length).toBeGreaterThanOrEqual(3)
      expect(spec.pitfalls.length).toBeGreaterThanOrEqual(3)
      expect(spec.resources.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('MỌI hướng đều có bản đồ kiến trúc đủ 5 ô — đây là ô dễ quên nhất khi soạn hướng mới', () => {
    for (const spec of PROGRAMMING_SPECIALIZATIONS) {
      const a = spec.architecture
      expect(a.modules.length, `${spec.id}: modules`).toBeGreaterThanOrEqual(4)
      expect(a.contracts.length, `${spec.id}: contracts`).toBeGreaterThanOrEqual(3)
      expect(a.keyDecisions.length, `${spec.id}: keyDecisions`).toBeGreaterThanOrEqual(3)
      expect(a.nfrs.length, `${spec.id}: nfrs`).toBeGreaterThanOrEqual(3)
      expect(a.specChecklist.length, `${spec.id}: specChecklist`).toBeGreaterThanOrEqual(3)
    }
  })

  it('mỗi module kiến trúc nêu TRÁCH NHIỆM, không chỉ có tên', () => {
    for (const spec of PROGRAMMING_SPECIALIZATIONS) {
      const names = spec.architecture.modules.map((m) => m.name)
      // Tên module không trùng nhau trong cùng một hướng.
      expect(new Set(names).size, `${spec.id}: tên module trùng`).toBe(names.length)
      for (const mod of spec.architecture.modules) {
        // Ngưỡng 25 ký tự: đủ để loại các ô chỉ ghi lại tên module thay vì mô tả trách nhiệm.
        expect(mod.role.length, `${spec.id}/${mod.name}: role quá ngắn`).toBeGreaterThan(25)
      }
    }
  })

  it('countArchitectureItems cộng đúng cả 5 ô', () => {
    for (const spec of PROGRAMMING_SPECIALIZATIONS) {
      const a = spec.architecture
      expect(countArchitectureItems(spec)).toBe(
        a.modules.length +
          a.contracts.length +
          a.keyDecisions.length +
          a.nfrs.length +
          a.specChecklist.length,
      )
    }
  })

  it('getSpecialization không phân biệt hoa thường, id lạ trả undefined', () => {
    expect(getSpecialization('WEB')?.name).toBe('Lập trình Web')
    expect(getSpecialization(' mobile ')?.id).toBe('mobile')
    expect(getSpecialization('khong-co')).toBeUndefined()
    expect(getSpecialization('')).toBeUndefined()
  })

  it('getSpecStage tra đúng chặng và không đoán bừa khi mã sai', () => {
    expect(getSpecStage('backend-s3')?.tier).toBe('s3')
    expect(getSpecStage('backend-s9')).toBeUndefined()
    expect(getSpecStage('khong-co-s1')).toBeUndefined()
  })

  it('specializationsOpenAt lọc theo bậc đã hoàn thành', () => {
    // p2 chưa mở hướng nào — mọi hướng đều yêu cầu tối thiểu p3.
    expect(specializationsOpenAt('p2')).toHaveLength(0)
    const atP3 = specializationsOpenAt('p3').map((s) => s.id)
    expect(atP3).toContain('algo')
    expect(atP3).not.toContain('web')
    // Hướng kiến trúc CỐ Ý không mở sớm: chưa tự làm hỏng thứ gì thì đặc tả chỉ là chữ đẹp.
    expect(atP3).not.toContain('architecture')
    expect(specializationsOpenAt('p5')).toHaveLength(14)
    // Bậc lạ không được mở nhầm hướng nào.
    expect(specializationsOpenAt('khong-phai-bac')).toHaveLength(0)
  })

  it('mỗi hướng có 5 sản phẩm phải nộp (4 chặng + capstone)', () => {
    for (const spec of PROGRAMMING_SPECIALIZATIONS) {
      expect(countSpecProjects(spec)).toBe(5)
    }
  })
})

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
} from './specializations/registry.js'
import { PROGRAMMING_LEVEL_IDS } from './curriculum.js'

const TIERS = ['s1', 's2', 's3', 's4']

describe('hướng chuyên sâu môn Lập trình', () => {
  it('có đủ 12 hướng, id duy nhất', () => {
    const ids = PROGRAMMING_SPECIALIZATIONS.map((s) => s.id)
    expect(ids).toHaveLength(12)
    expect(new Set(ids).size).toBe(12)
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
    expect(specializationsOpenAt('p5')).toHaveLength(12)
    // Bậc lạ không được mở nhầm hướng nào.
    expect(specializationsOpenAt('khong-phai-bac')).toHaveLength(0)
  })

  it('mỗi hướng có 5 sản phẩm phải nộp (4 chặng + capstone)', () => {
    for (const spec of PROGRAMMING_SPECIALIZATIONS) {
      expect(countSpecProjects(spec)).toBe(5)
    }
  })
})

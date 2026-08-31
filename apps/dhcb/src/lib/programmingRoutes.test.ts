// Cổng cho bảng dựng URL của môn Lập trình.
//
// Bất biến quan trọng nhất sau khi đổi route (2026-08-31): URL mang thêm tiêu đề, nhưng **mã
// vẫn đứng đầu và tách lại được nguyên vẹn**. Mất tính chất đó là link cũ đã chia sẻ chết và
// tiến độ tra theo mã không khớp nữa — hỏng im lặng, không cổng nào khác bắt được.
import { describe, expect, it } from 'vitest'
import { idFromSlugSegment } from '@core/slug'
import { SHORT_COURSES } from '@dhcb/subject-programming/courses/registry'
import { PROGRAMMING_SPECIALIZATIONS } from '@dhcb/subject-programming/specializations/registry'
import { LEARNING_PATHS, pathStageRefs } from '@dhcb/subject-programming/learningPaths/registry'
import { getPathStage } from '@dhcb/subject-programming/learningPaths/pathStages'
import {
  duongDanChangHuong,
  duongDanChangLoTrinh,
  duongDanChangTheoId,
  duongDanHuong,
  duongDanKhoa,
  duongDanLoTrinh,
} from './programmingRoutes'

/** Đoạn cuối của URL — phần mang `<mã>--<tiêu đề>`. */
const doanCuoi = (url: string) => url.split('/').pop() ?? ''

describe('URL môn Lập trình — mã luôn tách lại được', () => {
  it('khoá ngắn: URL giữ nguyên mã khoá ở đầu', () => {
    for (const khoa of SHORT_COURSES) {
      const url = duongDanKhoa(khoa)
      expect(url.startsWith('/lap-trinh/khoa-hoc/')).toBe(true)
      expect(idFromSlugSegment(doanCuoi(url))).toBe(khoa.id)
    }
  })

  it('hướng chuyên sâu và từng chặng: URL giữ nguyên mã hướng và mã chặng', () => {
    for (const spec of PROGRAMMING_SPECIALIZATIONS) {
      expect(idFromSlugSegment(doanCuoi(duongDanHuong(spec)))).toBe(spec.id)
      for (const stage of spec.stages) {
        const url = duongDanChangHuong(spec, stage)
        const [, , , doanHuong, doanChang] = url.split('/')
        expect(idFromSlugSegment(doanHuong ?? '')).toBe(spec.id)
        expect(idFromSlugSegment(doanChang ?? '')).toBe(stage.id)
        // Tra ngược từ MỘT id chặng (đường mà trang lộ trình dùng) phải ra đúng URL đó.
        expect(duongDanChangTheoId(stage.id)).toBe(url)
      }
    }
  })

  it('lộ trình mục tiêu và chặng riêng của nó: URL giữ nguyên mã', () => {
    for (const path of LEARNING_PATHS) {
      expect(idFromSlugSegment(doanCuoi(duongDanLoTrinh(path)))).toBe(path.id)
      for (const ref of pathStageRefs(path)) {
        const stage = getPathStage(ref.stageId)
        if (!stage) continue // chặng của hướng — đã kiểm ở test trên
        const url = duongDanChangLoTrinh(path, stage)
        expect(idFromSlugSegment(doanCuoi(url))).toBe(stage.id)
      }
    }
  })

  it('không hai trang nào sinh ra cùng một URL', () => {
    const tatCa = [
      ...SHORT_COURSES.map(duongDanKhoa),
      ...PROGRAMMING_SPECIALIZATIONS.flatMap((s) => [
        duongDanHuong(s),
        ...s.stages.map((st) => duongDanChangHuong(s, st)),
      ]),
      ...LEARNING_PATHS.map(duongDanLoTrinh),
    ]
    expect(new Set(tatCa).size).toBe(tatCa.length)
  })
})

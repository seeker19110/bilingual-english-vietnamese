// Bất biến của tầng CHI TIẾT CHẶNG S3 — chặn lỗi dữ liệu khi soạn thêm hướng.
// Kiểm KHUÔN (đủ 13 hướng, drill phủ đúng module, ngưỡng ĐẠT có số) chứ không kiểm từng chữ:
// soạn thêm đúng chuẩn thì không phải sửa test.
import { describe, expect, it } from 'vitest'
import {
  SPEC_STAGE_DETAILS,
  getStageDetail,
  countStageDetails,
  countDrills,
  PROGRAMMING_SPECIALIZATIONS,
  getSpecStage,
} from './specializations/registry.js'

/** Có ít nhất một chữ số — cách kiểm "ngưỡng phải là SỐ" mà không ràng buộc cách viết. */
const hasNumber = (s: string) => /\d/.test(s)

/** Mọi chuỗi trong dữ liệu: không rỗng, không thừa khoảng trắng hai đầu. */
function expectCleanText(value: string, where: string) {
  expect(value.trim(), where).not.toBe('')
  expect(value, where).toBe(value.trim())
}

describe('chi tiết chặng S3 của 13 hướng chuyên sâu', () => {
  it('đủ 13 chi tiết, mỗi hướng đúng một, stageId trỏ tới chặng CÓ THẬT', () => {
    expect(countStageDetails()).toBe(13)
    expect(SPEC_STAGE_DETAILS).toHaveLength(PROGRAMMING_SPECIALIZATIONS.length)

    const ids = SPEC_STAGE_DETAILS.map((d) => d.stageId)
    expect(new Set(ids).size).toBe(13)
    for (const spec of PROGRAMMING_SPECIALIZATIONS) {
      const detail = getStageDetail(`${spec.id}-s3`)
      expect(detail, `hướng ${spec.id} thiếu chi tiết chặng S3`).toBeDefined()
    }
    for (const id of ids) {
      expect(getSpecStage(id), `stageId lạ: ${id}`).toBeDefined()
    }
  })

  it('bài luyện phủ ĐÚNG tập module của chặng: không thiếu, không thừa, không trùng', () => {
    for (const detail of SPEC_STAGE_DETAILS) {
      const stage = getSpecStage(detail.stageId)!
      const moduleIds = stage.modules.map((m) => m.id).sort()
      const drillIds = detail.moduleDrills.map((d) => d.moduleId)
      expect(new Set(drillIds).size, `${detail.stageId}: có moduleId trùng`).toBe(drillIds.length)
      expect([...drillIds].sort(), `${detail.stageId}: drill không phủ đúng module`).toEqual(
        moduleIds,
      )
      expect(countDrills(detail)).toBe(stage.modules.length)
    }
  })

  it('mỗi bài luyện có bằng chứng ĐO ĐƯỢC (chứa con số)', () => {
    for (const detail of SPEC_STAGE_DETAILS) {
      for (const drill of detail.moduleDrills) {
        expectCleanText(drill.drill, `${drill.moduleId}.drill`)
        expectCleanText(drill.evidence, `${drill.moduleId}.evidence`)
        expect(
          hasNumber(drill.evidence),
          `${drill.moduleId}: bằng chứng phải có con số, đang là "${drill.evidence}"`,
        ).toBe(true)
      }
    }
  })

  it('thang chấm phủ đủ yêu cầu dự án và mức ĐẠT luôn là con số', () => {
    for (const detail of SPEC_STAGE_DETAILS) {
      const stage = getSpecStage(detail.stageId)!
      expect(
        detail.projectRubric.length,
        `${detail.stageId}: thang chấm ít hơn số yêu cầu của dự án`,
      ).toBeGreaterThanOrEqual(stage.project.requirements.length)
      for (const row of detail.projectRubric) {
        expectCleanText(row.criterion, `${detail.stageId}.criterion`)
        expectCleanText(row.fail, `${detail.stageId}.fail`)
        expect(
          hasNumber(row.pass),
          `${detail.stageId} — "${row.criterion}": mức ĐẠT phải có số, đang là "${row.pass}"`,
        ).toBe(true)
      }
    }
  })

  it('số mục nằm trong ngưỡng đã chốt và không có dòng trùng lặp', () => {
    for (const detail of SPEC_STAGE_DETAILS) {
      const lists: [string, string[]][] = [
        ['entryGate', detail.entryGate],
        ['pitfalls', detail.pitfalls],
        ['exitSignals', detail.exitSignals],
      ]
      expect(detail.entryGate.length, `${detail.stageId}.entryGate`).toBeGreaterThanOrEqual(3)
      expect(detail.entryGate.length, `${detail.stageId}.entryGate`).toBeLessThanOrEqual(5)
      expect(detail.pitfalls.length, `${detail.stageId}.pitfalls`).toBeGreaterThanOrEqual(2)
      expect(detail.pitfalls.length, `${detail.stageId}.pitfalls`).toBeLessThanOrEqual(4)
      expect(detail.exitSignals.length, `${detail.stageId}.exitSignals`).toBeGreaterThanOrEqual(3)
      expect(detail.exitSignals.length, `${detail.stageId}.exitSignals`).toBeLessThanOrEqual(5)

      for (const [name, list] of lists) {
        expect(new Set(list).size, `${detail.stageId}.${name}: có dòng trùng`).toBe(list.length)
        list.forEach((line, i) => expectCleanText(line, `${detail.stageId}.${name}[${i}]`))
      }
      expectCleanText(detail.nextStagePrep, `${detail.stageId}.nextStagePrep`)
    }
  })

  it('id lạ trả undefined chứ không đoán bừa', () => {
    expect(getStageDetail('web-s9')).toBeUndefined()
    expect(getStageDetail('khong-co-huong-nay-s3')).toBeUndefined()
    // Chặng có thật nhưng chưa soạn chi tiết → cũng phải là undefined.
    expect(getStageDetail('web-s1')).toBeUndefined()
    // Tra được không phân biệt hoa thường và khoảng trắng thừa.
    expect(getStageDetail('  WEB-S3 ')?.stageId).toBe('web-s3')
  })
})

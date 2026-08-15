import { describe, it, expect } from 'vitest'
import { AssessmentSchema, ASSESSMENT_SCHEMA_VERSION } from './assessment.js'

const validAssessment = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  learnerId: '123e4567-e89b-12d3-a456-426614174001',
  mode: 'writing',
  scores: { task_response: 6, coherence: 7, lexical: 6, grammar: 7, overall: 6.5 },
  corrections: [{ original: 'I have go', corrected: 'I went', explanation: 'quá khứ đơn' }],
  createdAt: '2026-08-15T00:00:00Z',
  schemaVersion: ASSESSMENT_SCHEMA_VERSION,
}

describe('AssessmentSchema', () => {
  it('payload hợp lệ (không suggestions/sample/encouragement — optional) → parse thành công', () => {
    expect(AssessmentSchema.parse(validAssessment)).toEqual(validAssessment)
  })

  it('có đủ suggestions/sample/encouragement → parse thành công', () => {
    const full = {
      ...validAssessment,
      suggestions: ['dùng thêm liên từ'],
      sample: 'Bài mẫu điểm cao...',
      encouragement: 'Cố lên nhé!',
    }
    expect(AssessmentSchema.parse(full)).toEqual(full)
  })

  it('corrections rỗng (không có lỗi nào) → parse thành công', () => {
    const noErrors = { ...validAssessment, corrections: [] }
    expect(AssessmentSchema.parse(noErrors).corrections).toEqual([])
  })

  it('score ngoài thang 0–9 (AI hallucination) → từ chối', () => {
    expect(() => AssessmentSchema.parse({ ...validAssessment, scores: { overall: 15 } })).toThrow()
  })

  it('mode ngoài 4 giá trị cho phép → từ chối', () => {
    expect(() => AssessmentSchema.parse({ ...validAssessment, mode: 'exam' })).toThrow()
  })

  it('correction thiếu field bắt buộc (explanation) → từ chối', () => {
    const badCorrection = {
      ...validAssessment,
      corrections: [{ original: 'x', corrected: 'y' }],
    }
    expect(() => AssessmentSchema.parse(badCorrection)).toThrow()
  })

  it('field lạ ở gốc → từ chối', () => {
    expect(() => AssessmentSchema.parse({ ...validAssessment, band: 6.5 })).toThrow()
  })
})

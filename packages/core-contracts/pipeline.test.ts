import { describe, it, expect } from 'vitest'
import { validateAiOutput } from './pipeline.js'
import { AssessmentSchema, ASSESSMENT_SCHEMA_VERSION } from './assessment.js'
import { ValidationError } from '@dhcb/core-errors/appError'

const validAssessmentJson = JSON.stringify({
  id: '123e4567-e89b-12d3-a456-426614174000',
  learnerId: '123e4567-e89b-12d3-a456-426614174001',
  mode: 'writing',
  scores: { overall: 6.5 },
  corrections: [],
  createdAt: '2026-08-15T00:00:00Z',
  schemaVersion: ASSESSMENT_SCHEMA_VERSION,
})

describe('validateAiOutput — không có domainRules/policy', () => {
  it('JSON hợp lệ + khớp schema → ok:true kèm data đã kiểm', () => {
    const result = validateAiOutput(validAssessmentJson, AssessmentSchema)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.mode).toBe('writing')
  })

  it('AI trả text không phải JSON (vd quên bọc JSON, chỉ trả prose) → dừng ở stage parse', () => {
    const result = validateAiOutput('Xin lỗi, tôi không hiểu yêu cầu.', AssessmentSchema)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.stage).toBe('parse')
      expect(result.error).toBeInstanceOf(ValidationError)
    }
  })

  it('JSON hợp lệ nhưng THIẾU field bắt buộc (AI bỏ sót) → dừng ở stage schema', () => {
    const missingField = JSON.stringify({ id: '123e4567-e89b-12d3-a456-426614174000' })
    const result = validateAiOutput(missingField, AssessmentSchema)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.stage).toBe('schema')
  })

  it('JSON hợp lệ nhưng score ngoài thang cho phép (AI hallucination) → dừng ở stage schema', () => {
    const badScore = JSON.stringify({
      id: '123e4567-e89b-12d3-a456-426614174000',
      learnerId: '123e4567-e89b-12d3-a456-426614174001',
      mode: 'writing',
      scores: { overall: 999 },
      corrections: [],
      createdAt: '2026-08-15T00:00:00Z',
      schemaVersion: ASSESSMENT_SCHEMA_VERSION,
    })
    const result = validateAiOutput(badScore, AssessmentSchema)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.stage).toBe('schema')
  })

  it('field lạ ngoài schema (AI thêm field không xin) → dừng ở stage schema (.strict())', () => {
    const withExtra = JSON.stringify({
      ...JSON.parse(validAssessmentJson),
      confidence_score: 0.9,
    })
    const result = validateAiOutput(withExtra, AssessmentSchema)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.stage).toBe('schema')
  })
})

describe('validateAiOutput — domainRules', () => {
  it('domain rule PASS (trả null) → tiếp tục, ok:true', () => {
    const result = validateAiOutput(validAssessmentJson, AssessmentSchema, {
      domainRules: () => null,
    })
    expect(result.ok).toBe(true)
  })

  it('domain rule FAIL (trả message lỗi) → dừng ở stage domain, không chạy policy', () => {
    let policyCalled = false
    const result = validateAiOutput(validAssessmentJson, AssessmentSchema, {
      domainRules: () => 'Quá nhiều lỗi sửa cho 1 bài — nghi AI hallucination',
      policy: () => {
        policyCalled = true
        return null
      },
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.stage).toBe('domain')
      expect(result.error.message).toBe('Quá nhiều lỗi sửa cho 1 bài — nghi AI hallucination')
    }
    expect(policyCalled).toBe(false)
  })

  it('domain rule nhận đúng dữ liệu ĐÃ QUA schema (có kiểu, không phải unknown)', () => {
    let seenMode: string | undefined
    validateAiOutput(validAssessmentJson, AssessmentSchema, {
      domainRules: (data) => {
        seenMode = data.mode
        return null
      },
    })
    expect(seenMode).toBe('writing')
  })
})

describe('validateAiOutput — policy', () => {
  it('policy FAIL → dừng ở stage policy', () => {
    const result = validateAiOutput(validAssessmentJson, AssessmentSchema, {
      policy: () => 'Gói Free không được yêu cầu chấm bài dài',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.stage).toBe('policy')
  })

  it('domain rule PASS + policy PASS → ok:true', () => {
    const result = validateAiOutput(validAssessmentJson, AssessmentSchema, {
      domainRules: () => null,
      policy: () => null,
    })
    expect(result.ok).toBe(true)
  })
})

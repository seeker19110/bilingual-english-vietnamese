import { describe, it, expect } from 'vitest'
import { DecisionRecordSchema, DECISION_RECORD_SCHEMA_VERSION } from './decisionRecord.js'

const validRecord = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  personId: '123e4567-e89b-12d3-a456-426614174001',
  problem: 'Nên học thêm ngoại ngữ nào tiếp theo sau tiếng Anh?',
  options: [
    { id: 'opt-japanese', summary: 'Tiếng Nhật' },
    { id: 'opt-french', summary: 'Tiếng Pháp' },
  ],
  assumptions: [],
  evidence: [],
  tradeoffs: ['Tiếng Nhật khó hơn nhưng nhiều cơ hội việc làm hơn'],
  expectedOutcomes: [{ description: 'Đạt N4 trong 1 năm' }],
  status: 'open',
  createdAt: '2026-08-16T00:00:00Z',
  schemaVersion: DECISION_RECORD_SCHEMA_VERSION,
}

describe('DecisionRecordSchema', () => {
  it('payload hợp lệ tối thiểu → parse thành công', () => {
    expect(DecisionRecordSchema.parse(validRecord)).toEqual(validRecord)
  })

  it('đủ field optional (domain, selectedOptionId, rationale, actualOutcomes, reviewAt) → parse thành công', () => {
    const full = {
      ...validRecord,
      domain: 'career',
      selectedOptionId: 'opt-japanese',
      rationale: 'Cơ hội việc làm cao hơn ở thị trường hiện tại',
      status: 'decided',
      actualOutcomes: [
        {
          description: 'Đạt N5 sau 6 tháng',
          observedAt: '2027-02-16T00:00:00Z',
          matchedExpectation: false,
        },
      ],
      reviewAt: '2027-08-16T00:00:00Z',
      evidence: [{ sourceType: 'personal_fact', sourceId: '123e4567-e89b-12d3-a456-426614174002' }],
    }
    expect(DecisionRecordSchema.parse(full)).toEqual(full)
  })

  it('options rỗng → từ chối (phải có ít nhất 1 lựa chọn)', () => {
    expect(() => DecisionRecordSchema.parse({ ...validRecord, options: [] })).toThrow()
  })

  it('status ngoài 5 giá trị hợp lệ → từ chối', () => {
    expect(() => DecisionRecordSchema.parse({ ...validRecord, status: 'cancelled' })).toThrow()
  })

  it('problem rỗng → từ chối', () => {
    expect(() => DecisionRecordSchema.parse({ ...validRecord, problem: '' })).toThrow()
  })

  it('field lạ trong 1 phần tử options → từ chối (nested .strict())', () => {
    expect(() =>
      DecisionRecordSchema.parse({
        ...validRecord,
        options: [{ id: 'opt-1', summary: 'x', extra: true }],
      }),
    ).toThrow()
  })
})

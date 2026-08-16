import { describe, it, expect } from 'vitest'
import { ProposedActionSchema, PROPOSED_ACTION_SCHEMA_VERSION } from './proposedAction.js'

const validAction = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  personId: '123e4567-e89b-12d3-a456-426614174001',
  capabilityId: 'english.grade_writing',
  action: 'Chấm điểm bài viết vừa nộp',
  targetDomain: 'english',
  payload: { score: 6.5 },
  riskLevel: 'low',
  status: 'pending',
  createdAt: '2026-08-16T00:00:00Z',
  schemaVersion: PROPOSED_ACTION_SCHEMA_VERSION,
}

describe('ProposedActionSchema', () => {
  it('payload hợp lệ tối thiểu → parse thành công', () => {
    expect(ProposedActionSchema.parse(validAction)).toEqual(validAction)
  })

  it('đủ field optional (decisionReason, decidedAt) → parse thành công', () => {
    const full = {
      ...validAction,
      status: 'rejected',
      decisionReason: 'Điểm đề xuất vượt ngưỡng cho phép tự động',
      decidedAt: '2026-08-16T01:00:00Z',
    }
    expect(ProposedActionSchema.parse(full)).toEqual(full)
  })

  it('capabilityId sai định dạng (không phải "domain.action") → từ chối', () => {
    expect(() =>
      ProposedActionSchema.parse({ ...validAction, capabilityId: 'gpt4.review' }),
    ).toThrow()
  })

  it('riskLevel ngoài enum hợp lệ → từ chối', () => {
    expect(() => ProposedActionSchema.parse({ ...validAction, riskLevel: 'extreme' })).toThrow()
  })

  it('status ngoài enum hợp lệ → từ chối', () => {
    expect(() => ProposedActionSchema.parse({ ...validAction, status: 'cancelled' })).toThrow()
  })

  it('field lạ ở cấp gốc → từ chối (.strict())', () => {
    expect(() => ProposedActionSchema.parse({ ...validAction, extraField: true })).toThrow()
  })

  it('action rỗng → từ chối', () => {
    expect(() => ProposedActionSchema.parse({ ...validAction, action: '' })).toThrow()
  })

  it('thiếu field bắt buộc (targetDomain) → từ chối', () => {
    const missing: Record<string, unknown> = { ...validAction }
    delete missing.targetDomain
    expect(() => ProposedActionSchema.parse(missing)).toThrow()
  })
})

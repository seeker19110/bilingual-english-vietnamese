import { describe, it, expect } from 'vitest'
import { LearnerSchema, LEARNER_SCHEMA_VERSION } from './learner.js'

const validLearner = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  userId: '123e4567-e89b-12d3-a456-426614174001',
  direction: 'A',
  currentLevel: 'B1',
  dailySpeed: 10,
  timezone: 'Asia/Ho_Chi_Minh',
  createdAt: '2026-08-15T00:00:00Z',
  schemaVersion: LEARNER_SCHEMA_VERSION,
}

describe('LearnerSchema', () => {
  it('payload hợp lệ → parse thành công', () => {
    expect(LearnerSchema.parse(validLearner)).toEqual(validLearner)
  })

  it('dailySpeed CHỈ chấp nhận 5/10/20 (khớp curriculum.ts DailySpeed) — 15 bị từ chối', () => {
    expect(() => LearnerSchema.parse({ ...validLearner, dailySpeed: 15 })).toThrow()
  })

  it('direction ngoài A/B → từ chối', () => {
    expect(() => LearnerSchema.parse({ ...validLearner, direction: 'C' })).toThrow()
  })

  it('currentLevel không thuộc 6 cấp CEFR → từ chối', () => {
    expect(() => LearnerSchema.parse({ ...validLearner, currentLevel: 'D1' })).toThrow()
  })

  it('userId không phải UUID → từ chối', () => {
    expect(() => LearnerSchema.parse({ ...validLearner, userId: 'not-a-uuid' })).toThrow()
  })

  it('field lạ (AI/client gửi thừa) → từ chối', () => {
    expect(() => LearnerSchema.parse({ ...validLearner, nickname: 'Emma' })).toThrow()
  })

  it('sai schemaVersion → từ chối', () => {
    expect(() => LearnerSchema.parse({ ...validLearner, schemaVersion: 99 })).toThrow()
  })
})

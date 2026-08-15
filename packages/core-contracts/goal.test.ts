import { describe, it, expect } from 'vitest'
import { GoalSchema, GOAL_SCHEMA_VERSION } from './goal.js'

const validGoal = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  learnerId: '123e4567-e89b-12d3-a456-426614174001',
  label: 'Luyện nói tự tin trước khi đi du lịch',
  targetMinutesPerDay: 15,
  status: 'active',
  createdAt: '2026-08-15T00:00:00Z',
  schemaVersion: GOAL_SCHEMA_VERSION,
}

describe('GoalSchema', () => {
  it('payload hợp lệ (không có targetDate — optional) → parse thành công', () => {
    expect(GoalSchema.parse(validGoal)).toEqual(validGoal)
  })

  it('có targetDate → parse thành công', () => {
    const withDate = { ...validGoal, targetDate: '2026-12-31T00:00:00Z' }
    expect(GoalSchema.parse(withDate)).toEqual(withDate)
  })

  it('status ngoài active/completed/abandoned → từ chối', () => {
    expect(() => GoalSchema.parse({ ...validGoal, status: 'paused' })).toThrow()
  })

  it('targetMinutesPerDay <= 0 → từ chối', () => {
    expect(() => GoalSchema.parse({ ...validGoal, targetMinutesPerDay: 0 })).toThrow()
  })

  it('label rỗng → từ chối', () => {
    expect(() => GoalSchema.parse({ ...validGoal, label: '' })).toThrow()
  })

  it('field lạ → từ chối', () => {
    expect(() => GoalSchema.parse({ ...validGoal, priority: 'high' })).toThrow()
  })
})

import { describe, it, expect } from 'vitest'
import { LifeGoalSchema, LIFE_GOAL_SCHEMA_VERSION } from './lifeGoal.js'

const validGoal = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  personId: '123e4567-e89b-12d3-a456-426614174001',
  nodeId: '123e4567-e89b-12d3-a456-426614174002',
  label: 'Tìm được việc mới trong 6 tháng',
  status: 'active',
  createdAt: '2026-08-16T00:00:00Z',
  updatedAt: '2026-08-16T00:00:00Z',
  schemaVersion: LIFE_GOAL_SCHEMA_VERSION,
}

describe('LifeGoalSchema', () => {
  it('payload hợp lệ (không targetDate) → parse thành công', () => {
    expect(LifeGoalSchema.parse(validGoal)).toEqual(validGoal)
  })

  it('có targetDate → parse thành công', () => {
    const withDate = { ...validGoal, targetDate: '2027-02-16T00:00:00Z' }
    expect(LifeGoalSchema.parse(withDate)).toEqual(withDate)
  })

  it('status ngoài 4 giá trị hợp lệ → từ chối', () => {
    expect(() => LifeGoalSchema.parse({ ...validGoal, status: 'paused' })).toThrow()
  })

  it('label rỗng → từ chối', () => {
    expect(() => LifeGoalSchema.parse({ ...validGoal, label: '' })).toThrow()
  })

  it('field lạ (vd learnerId của v1 Goal) → từ chối', () => {
    expect(() =>
      LifeGoalSchema.parse({ ...validGoal, learnerId: '123e4567-e89b-12d3-a456-426614174003' }),
    ).toThrow()
  })
})

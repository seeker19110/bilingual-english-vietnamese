import { describe, expect, it } from 'vitest'
import {
  LifePlanSchema,
  HabitSchema,
  HabitLogSchema,
  WellbeingCheckSchema,
  GrowthMilestoneSchema,
  LIFE_FOUNDATION_SCHEMA_VERSION,
} from './lifeFoundation.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const ID_1 = '22222222-2222-4222-8222-222222222222'

describe('Life Foundation Contracts', () => {
  it('validates LifePlan', () => {
    const plan = {
      id: ID_1,
      personId: PERSON_ID,
      title: 'Q3 2026 Focus Plan',
      planType: 'quarterly',
      periodStart: '2026-07-01',
      periodEnd: '2026-09-30',
      status: 'active',
      version: 1,
      createdAt: '2026-08-17T00:00:00Z',
      updatedAt: '2026-08-17T00:00:00Z',
      schemaVersion: LIFE_FOUNDATION_SCHEMA_VERSION,
    }
    const parsed = LifePlanSchema.parse(plan)
    expect(parsed.planType).toBe('quarterly')
    expect(parsed.status).toBe('active')
  })

  it('validates Habit', () => {
    const habit = {
      id: ID_1,
      personId: PERSON_ID,
      title: 'Morning Meditation 10 minutes',
      habitType: 'build',
      frequency: 'daily',
      targetCount: 1,
      currentStreak: 7,
      bestStreak: 14,
      isActive: true,
      version: 1,
      createdAt: '2026-08-17T00:00:00Z',
      updatedAt: '2026-08-17T00:00:00Z',
      schemaVersion: LIFE_FOUNDATION_SCHEMA_VERSION,
    }
    const parsed = HabitSchema.parse(habit)
    expect(parsed.currentStreak).toBe(7)
    expect(parsed.habitType).toBe('build')
  })

  it('validates HabitLog', () => {
    const log = {
      id: ID_1,
      habitId: ID_1,
      personId: PERSON_ID,
      loggedAt: '2026-08-17',
      count: 1,
      note: 'Felt great!',
      createdAt: '2026-08-17T00:00:00Z',
      schemaVersion: LIFE_FOUNDATION_SCHEMA_VERSION,
    }
    const parsed = HabitLogSchema.parse(log)
    expect(parsed.count).toBe(1)
  })

  it('validates WellbeingCheck scores 1-10', () => {
    const check = {
      id: ID_1,
      personId: PERSON_ID,
      moodScore: 8,
      energyScore: 7,
      stressScore: 4,
      notes: 'Good day overall',
      checkedAt: '2026-08-17T00:00:00Z',
      schemaVersion: LIFE_FOUNDATION_SCHEMA_VERSION,
    }
    const parsed = WellbeingCheckSchema.parse(check)
    expect(parsed.moodScore).toBe(8)
    expect(parsed.stressScore).toBe(4)
  })

  it('rejects WellbeingCheck scores out of 1-10', () => {
    const check = {
      id: ID_1,
      personId: PERSON_ID,
      moodScore: 11,
      energyScore: 7,
      stressScore: 4,
      checkedAt: '2026-08-17T00:00:00Z',
      schemaVersion: LIFE_FOUNDATION_SCHEMA_VERSION,
    }
    expect(() => WellbeingCheckSchema.parse(check)).toThrow()
  })

  it('validates GrowthMilestone', () => {
    const milestone = {
      id: ID_1,
      personId: PERSON_ID,
      area: 'learning',
      title: 'Completed English B2 certification',
      description: 'Passed IELTS 6.5',
      achievedAt: '2026-08-17',
      createdAt: '2026-08-17T00:00:00Z',
      schemaVersion: LIFE_FOUNDATION_SCHEMA_VERSION,
    }
    const parsed = GrowthMilestoneSchema.parse(milestone)
    expect(parsed.area).toBe('learning')
  })
})
